"""
Confession Moderation Microservice
===================================
This FastAPI app is a microservice that Django calls internally
before saving any user confession. It checks if the text is safe to publish.

Install dependencies:
    pip install fastapi uvicorn[standard] better-profanity detoxify langdetect slowapi cachetools

Run locally:
    uvicorn analyze:app --host 0.0.0.0 --port 8000 --reload

Run on Render (Start Command):
    uvicorn analyze:app --host 0.0.0.0 --port $PORT
"""

from __future__ import annotations

import hashlib          # Used to hash IP addresses so we never store raw IPs
import html             # Used to decode HTML entities like &lt; → <
import re               # Used for regular expressions (invisible character removal)
import time             # Used to measure how long moderation takes
from functools import lru_cache   # Used to load the ML model only once and cache it

from cachetools import TTLCache                # A dictionary that auto-deletes keys after a set time
from detoxify import Detoxify                  # ML model that scores 7 toxicity categories
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware   # Allows React frontend to call this API
from fastapi.responses import JSONResponse
from langdetect import LangDetectException, detect   # Detects which language the text is in
from pydantic import BaseModel, Field, field_validator  # Validates and cleans incoming data
from slowapi import Limiter, _rate_limit_exceeded_handler  # Rate limiting for FastAPI
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address    # Gets the IP address from the incoming request
from typing import Optional

# ──────────────────────────────────────────────────────────────
# SECTION 1: Configuration
# These are the rules of your moderation system.
# Change these values to make moderation stricter or more lenient.
# ──────────────────────────────────────────────────────────────

MAX_CHARS = 2_000           # Confession cannot be longer than 2000 characters
MIN_CHARS = 3               # Confession must be at least 10 characters (no empty/spam posts)
MAX_CONFESSIONS_PER_IP = 5  # One IP can only submit 5 confessions per hour
WINDOW_SECONDS = 3_600      # The hour window (3600 seconds = 1 hour)

# ── Psychological harm standard ────────────────────────────────
#
# Standard: Would this post disturb a reasonable adult and make them
# feel unsafe or psychologically harmed just by reading it?
#
# PASSES (context-aware — these are all fine):
#   "I genuinely hate my coworker"                   → normal frustration
#   "I hope something terrible happens to them"      → venting, not a threat
#   "I despise people from that country"             → strong opinion, not a slur
#   "I will kill you man, you are so funny"          → obvious hyperbole/slang
#   "What the hell is wrong with me"                 → everyday expression
#   "I want to hurt the person who destroyed me"     → emotional pain
#   "I cried for hours, I feel like dying inside"    → raw emotion
#
# BLOCKED (genuinely disturbing to adults):
#   Graphic torture/gore descriptions
#   Targeted slurs used as weapons ("you [slur], go die")
#   Detailed self-harm/suicide instructions
#   Non-consensual sexual content described in detail
#   Dehumanising hate speech with violent intent
#   Extreme combinations — cuss-filled targeted abuse at a real person
#
# Key insight: a SINGLE bad word or even "kill" does NOT block.
# We look at the COMBINATION and INTENT, not individual words.
# Detoxify scores + a hard-pattern regex layer together decide.

# Detoxify category thresholds (0.0 → 1.0)
# These are intentionally HIGH — we only block when the model is very confident
CATEGORY_THRESHOLDS: dict[str, float] = {
    # Extreme sustained abuse — slur-packed targeted attack on a person
    # NOT triggered by: single bad word, venting, emotional language
    "severe_toxicity":  0.85,

    # Identity-based dehumanisation with violent framing
    # NOT triggered by: "I hate people from X", opinion, frustration
    "identity_attack":  0.90,

    # Graphic non-consensual / predatory sexual content
    # NOT triggered by: mentioning sex, adult relationships, trauma sharing
    "sexual_explicit":  0.92,

    # NOTE: threat + toxicity + obscene + insult are fully EXCLUDED.
    # "threat" fires on hyperbole like "I'll kill you bro" — useless here.
    # We handle genuine violence threats via the hard-pattern layer below.
}

# ── Hard-pattern layer ─────────────────────────────────────────
# Regex patterns that block regardless of Detoxify scores.
# These catch content so extreme that even context cannot redeem it:
#   - Detailed instructions for self-harm or suicide methods
#   - Graphic gore/torture descriptions
#   - Child sexual abuse material (CSAM) indicators
#
# Patterns are intentionally specific — broad patterns cause false positives.
# We match on COMBINATION of intent words + graphic detail markers.

_HARD_BLOCK_PATTERNS: list[tuple[re.Pattern, str]] = [
    # Suicide/self-harm METHOD instructions (not just mentions of feeling suicidal)
    # Matches: "how to kill yourself with", "step by step suicide", "method to end my life"
    (
        re.compile(
            r"\b(how\s+to|step.{0,10}by.{0,10}step|method\s+to|instructions?\s+(for|to))"
            r".{0,40}"
            r"(kill\s+(your|my)self|suicide|self.harm|slit|overdose|hang\s+(your|my)self)",
            re.IGNORECASE,
        ),
        "Detailed self-harm or suicide instructions",
    ),
    # Graphic gore — body parts + destruction in same sentence
    # Matches: "rip his eyes out", "cut her face off", "torture and dismember"
    (
        re.compile(
            r"\b(rip|tear|cut|slice|gouge|dismember|decapitate|torture).{0,30}"
            r"(eyes?\s+out|face\s+off|limbs?|apart|to\s+pieces|body\s+parts?)",
            re.IGNORECASE,
        ),
        "Graphic violence or gore description",
    ),
    # CSAM indicators — any sexual context involving minors
    (
        re.compile(
            r"\b(child|kid|minor|underage|year.old).{0,20}"
            r"(sex|naked|nude|porn|molest|rape|abuse|touch)",
            re.IGNORECASE,
        ),
        "Content involving minors in a sexual context",
    ),
]

# Regex pattern that matches invisible/hidden Unicode characters
# Spammers insert these to trick filters (e.g. zero-width spaces between letters)
_INVISIBLE_RE = re.compile(r"[\u200b-\u200f\u202a-\u202e\u2060-\u206f\uFEFF]")


# ──────────────────────────────────────────────────────────────
# SECTION 2: Rate Limiting Setup
# SlowAPI handles how many times an IP can call the API per minute.
# TTLCache handles how many confessions an IP can submit per hour.
# ──────────────────────────────────────────────────────────────

# SlowAPI uses the requester's IP address as the identifier
limiter = Limiter(key_func=get_remote_address)

# TTLCache = a dictionary with a built-in expiry timer
# maxsize=10_000 → can track up to 10,000 IPs at once
# ttl=3600 → each entry auto-deletes after 1 hour
_ip_counter: TTLCache = TTLCache(maxsize=10_000, ttl=WINDOW_SECONDS)


def _ip_confession_allowed(ip: Optional[str]) -> tuple[bool, int]:
    """
    Checks if this IP is allowed to submit another confession this hour.
    Returns (True, count) if allowed, (False, count) if limit reached.

    We hash the IP with SHA-256 so we're storing a fingerprint, not the real IP.
    This is a privacy best practice — you can't reverse a SHA-256 hash.
    """
    key = hashlib.sha256(ip.encode()).hexdigest()   # e.g. "192.168.1.1" → "a3f9c2..."
    count = _ip_counter.get(key, 0)                 # How many confessions this IP submitted

    if count >= MAX_CONFESSIONS_PER_IP:
        return False, count                         # Limit reached, reject

    _ip_counter[key] = count + 1                    # Increment the counter
    return True, count + 1                          # Allow submission


# ──────────────────────────────────────────────────────────────
# SECTION 3: ML Model Loading
# Detoxify's model is ~100MB. We load it ONCE when the server
# starts, then reuse it for every request. lru_cache ensures
# this function only runs once no matter how many times it's called.
# ──────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_toxicity_model() -> Detoxify:
    """
    Loads the Detoxify 'original' model and caches it forever.
    The 'original' model is trained on Wikipedia comments and
    can score: toxicity, severe_toxicity, obscene, threat,
    insult, identity_attack, sexual_explicit.
    """
    return Detoxify("original")


# ──────────────────────────────────────────────────────────────
# SECTION 4: Pydantic Models (Data Shapes)
# Pydantic defines what the incoming request must look like
# and what the outgoing response will contain.
# ──────────────────────────────────────────────────────────────

class ConfessionInput(BaseModel):
    """
    Shape of the incoming request body from Django.
    Django sends: { "text": "I stole money from my friend..." }
    """
    # Field enforces min/max length before our code even runs
    text: str = Field(..., min_length=MIN_CHARS, max_length=MAX_CHARS)

    @field_validator("text")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> str:
        """
        Cleans the text before any moderation checks.
        This runs automatically when the request arrives.
        """
        v = _INVISIBLE_RE.sub("", v)    # Remove invisible Unicode characters
        v = html.unescape(v)            # Convert &lt;script&gt; → <script> (prevent filter bypass)
        v = v.strip()                   # Remove leading/trailing whitespace

        # Re-check length after cleaning (invisible chars might have padded it)
        if len(v) < MIN_CHARS:
            raise ValueError(f"Confession must be at least {MIN_CHARS} characters after cleaning.")
        return v


class ModerationDetail(BaseModel):
    """
    Result of a single moderation check (profanity OR toxicity).
    passed=True means the text is clean for that check.
    reason is only filled in when the check fails.
    """
    passed: bool
    reason: Optional[str] = None   # e.g. "Contains profanity or slurs."


class ConfessionAnalysis(BaseModel):
    """
    The full response Django receives after moderation.
    Django only needs to look at `accepted` to decide what to do.
    The rest is useful for logging and debugging.
    """
    accepted: bool                          # True = safe to store, False = reject
    char_count: int                         # How long the confession is
    language: str                           # Detected language, e.g. "en", "hi", "unknown"
    hard_patterns: ModerationDetail         # Result of regex hard-pattern check
    toxicity: ModerationDetail              # Result of ML toxicity check
    toxicity_scores: dict[str, float]       # Raw scores: {"toxicity": 0.02, "threat": 0.01, ...}
    moderation_ms: float                    # How many milliseconds moderation took
    submission_quota: str                   # e.g. "3 / 5 used this hour"


# ──────────────────────────────────────────────────────────────
# SECTION 5: FastAPI App Initialization
# ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Confession Moderation API",
    version="1.0.0",
    docs_url="/docs",       # Auto-generated docs available at /docs (great for testing)
)

# Attach the rate limiter to the app
app.state.limiter = limiter

# When rate limit is exceeded, SlowAPI sends a proper 429 response automatically
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware allows your React frontend or Django backend to call this API
# In production, replace "*" with your actual Django server URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # ⚠️ Change to your Django URL in production
    allow_methods=["POST"],         # Only POST requests are allowed
    allow_headers=["Content-Type"],
)


# ──────────────────────────────────────────────────────────────
# SECTION 6: Startup Event — Preload the ML Model
# Without this, the FIRST request after the server starts would
# be very slow (10–30 seconds) because it has to download and
# load a 100MB model. This preloads it at boot time instead.
# ──────────────────────────────────────────────────────────────

@app.on_event("startup")
async def preload_model():
    """
    Runs once when the server starts (before any requests arrive).
    Calling _get_toxicity_model() here warms the lru_cache so the
    model is ready in memory for the first real request.
    """
    print("⏳ Loading Detoxify ML model into memory...")
    _get_toxicity_model()   # This call loads and caches the model via lru_cache
    print("✅ Detoxify model loaded. API is ready.")


# ──────────────────────────────────────────────────────────────
# SECTION 7: Moderation Functions
# Each function handles one specific check.
# Keeping them separate makes them easy to test and swap out.
# ──────────────────────────────────────────────────────────────

def _check_hard_patterns(text: Optional[str]) -> ModerationDetail:
    """
    Regex layer for content so extreme that context cannot redeem it.
    Runs before the ML model — fast and catches edge cases Detoxify misses.

    Only fires on very specific combinations (intent + graphic detail).
    A single word like "kill" or "suicide" alone will NEVER trigger this.

    Covers:
    - Detailed self-harm / suicide METHOD instructions
    - Graphic gore and torture descriptions
    - Any sexual framing involving minors
    """
    for pattern, reason in _HARD_BLOCK_PATTERNS:
        if pattern.search(text):
            return ModerationDetail(passed=False, reason=f"Blocked: {reason}")
    return ModerationDetail(passed=True)


def _check_toxicity(text: Optional[str]) -> tuple[ModerationDetail, dict[str, float]]:
    """
    Psychological harm standard — ML layer using Detoxify.

    Thresholds are set very high (0.85–0.92) so only content the model
    is extremely confident about gets blocked. This prevents emotional
    confessions, venting, and strong opinions from being flagged.

    What this blocks:
    - Sustained slur-packed targeted abuse at a real person (severe_toxicity > 0.85)
    - Dehumanising hate speech with violent framing (identity_attack > 0.90)
    - Graphic non-consensual sexual descriptions (sexual_explicit > 0.92)

    What this intentionally allows:
    - "I hate my coworker / I hope something terrible happens"  → venting
    - "I will kill you, you're so funny"                       → hyperbole
    - "I despise people from that country"                     → strong opinion
    - "I want to hurt the person who hurt me"                  → emotional pain
    - Any confession mentioning death, suicide feelings, self-harm feelings
      WITHOUT being an instruction manual (hard patterns cover the latter)
    """
    model = _get_toxicity_model()

    raw: dict[str, float] = {
        k: round(float(v), 4)
        for k, v in model.predict(text).items()
    }

    blocked_categories = [
        cat for cat, threshold in CATEGORY_THRESHOLDS.items()
        if raw.get(cat, 0.0) > threshold
    ]

    if blocked_categories:
        friendly_names = {
            "severe_toxicity": "extreme targeted abuse",
            "identity_attack": "dehumanising hate speech with violent intent",
            "sexual_explicit": "graphic non-consensual sexual content",
        }
        reasons = [friendly_names.get(c, c) for c in blocked_categories]
        reason = "Blocked: " + ", ".join(reasons)
        return ModerationDetail(passed=False, reason=reason), raw

    return ModerationDetail(passed=True), raw


def _detect_language(text: Optional[str]) -> str:
    """
    Detects the language of the text using langdetect.
    Returns ISO codes like "en" (English), "hi" (Hindi), "es" (Spanish).
    Returns "unknown" if detection fails (e.g. very short text).
    Useful if you later want to handle non-English content differently.
    """
    try:
        return detect(text)
    except LangDetectException:
        return "unknown"


# ──────────────────────────────────────────────────────────────
# SECTION 8: The Main Endpoint
# This is the only route Django needs to call: POST /analyze
# ──────────────────────────────────────────────────────────────

@app.post(
    "/analyze",
    response_model=ConfessionAnalysis,         # Enforces the response shape
    status_code=status.HTTP_200_OK,
    summary="Moderate and analyze a confession before saving it",
)
@limiter.limit("20/minute")                    # Max 20 API calls per minute per IP
async def analyze_confession(
    request: Request,
    data: ConfessionInput,                     # Pydantic auto-validates & cleans this
) -> ConfessionAnalysis:
    """
    Full moderation pipeline:
    1. Check per-IP hourly confession quota
    2. Detect language
    3. Check hard patterns (regex — gore, CSAM, self-harm instructions)
    4. Check ML toxicity (Detoxify — extreme abuse, hate, explicit content)
    5. Return combined result

    Django usage example:
        import httpx
        response = httpx.post("http://fastapi-service/analyze", json={"text": confession_text})
        if response.json()["accepted"]:
            confession.save()
        else:
            reason = response.json()["hard_patterns"]["reason"] or response.json()["toxicity"]["reason"]
            return error_response(reason)
    """
    ip = get_remote_address(request)           # Get the caller's IP address

    # ── Step 1: Check hourly confession quota for this IP ──
    allowed, count = _ip_confession_allowed(ip)
    quota_str = f"{count} / {MAX_CONFESSIONS_PER_IP} used this hour"

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "submission_limit_reached",
                "message": f"You can submit at most {MAX_CONFESSIONS_PER_IP} confessions per hour.",
                "quota": quota_str,
            },
        )

    # ── Steps 2–4: Run the moderation pipeline ──
    t0 = time.perf_counter()

    language = _detect_language(data.text)

    # Hard pattern check runs first — it's instant (regex) and catches the worst content
    # before we even bother loading the ML model for that request
    hard_pattern_result = _check_hard_patterns(data.text)

    # Only run the ML model if hard patterns passed (saves compute on obvious blocks)
    if hard_pattern_result.passed:
        toxicity_result, toxicity_scores = _check_toxicity(data.text)
    else:
        # Skip ML — already blocked, return empty scores
        toxicity_result = ModerationDetail(passed=True)
        toxicity_scores = {}

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    # ── Step 5: Combine results ──
    # Blocked if EITHER hard patterns OR ML toxicity failed
    accepted = hard_pattern_result.passed and toxicity_result.passed

    return ConfessionAnalysis(
        accepted=accepted,
        char_count=len(data.text),
        language=language,
        hard_patterns=hard_pattern_result,
        toxicity=toxicity_result,
        toxicity_scores=toxicity_scores,
        moderation_ms=elapsed_ms,
        submission_quota=quota_str,
    )


# ──────────────────────────────────────────────────────────────
# SECTION 9: Global Error Handler
# Catches any unexpected crash and returns a clean error message.
# This ensures stack traces and internal details are NEVER leaked
# to the outside world — important for security.
# ──────────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def generic_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catches all unhandled exceptions.
    Returns a generic 500 response — never exposes internal error details.
    In production, you'd also log `exc` to a service like Sentry here.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "internal_error", "message": "Something went wrong."},
    )


# ──────────────────────────────────────────────────────────────
# SECTION 10: Local Development Entry Point
# This block only runs when you execute: python analyze.py
# On Render, the start command calls uvicorn directly instead.
# ──────────────────────────────────────────────────────────────

# if __name__ == "__main__":
#     import uvicorn
#     # reload=True auto-restarts the server when you save the file (dev only)
#     uvicorn.run("analyze:app", host="0.0.0.0", port=8000, reload=True)