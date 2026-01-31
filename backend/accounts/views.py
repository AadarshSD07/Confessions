from accounts.models import User, PasswordResetRequest
from accounts import serializers
from configuration import Config
from datetime import time
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework import permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

# Create your views here.
def get_current_slot_limit(now):
    if time(6, 0) <= now.time() < time(12, 0):
        return Config.MORNING_LIMIT
    elif time(12, 0) <= now.time() < time(18, 0):
        return Config.AFTERNOON_LIMIT
    else:
        return Config.NIGHT_LIMIT

def get_today_request_count(user, now):
    today = now.date()

    return PasswordResetRequest.objects.filter(
        user=user,
        created_at__date=today
    ).count()

def can_request_password_reset(user):
    now = timezone.now()

    today_count = get_today_request_count(user, now)
    slot_limit = get_current_slot_limit(now)

    remaining = slot_limit - today_count

    return remaining > 0, max(remaining, 0)


class UserRegistration(generics.CreateAPIView):
    """
    API endpoint for user registration (open to all users).
    
    Creates new user accounts using UserRegistrationSerializer validation.
    No authentication required - public registration endpoint.
    
    Permissions: AllowAny (no authentication needed)
    
    Request Body:
        Required fields defined in UserRegistrationSerializer (username, email, password, etc.)
        
    Returns:
        200 Success: {"message": "User created successfully."} on valid registration
        400 Bad Request: Serializer validation errors
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.UserRegistrationSerializer

    def post(self, request):
        """
        Handle POST request for user registration.
        
        Validates input data and creates user account if valid.
        
        Args:
            request: HTTP request containing user registration data
            
        Returns:
            Response: Success message or validation errors
        """
        serializer = self.get_serializer(data=request.data)
        
        # Validate serializer data and create user if valid
        if serializer.is_valid():
            serializer.save()  # Creates user using serializer's create() method
            return Response(
                {"message": "User created successfully."},
                status=Config.success
            )
        
        # Return validation errors on invalid data
        # ⚠️ BUG FIX: Should return serializer.errors with 400 status, not success
        error_string = ""
        for error in serializer.errors:
            for err in serializer.errors[error]:
                error_string += f"{error}: {err} <br>"
    
        return Response(error_string, status=Config.bad_request)


class UserProfileInformation(generics.UpdateAPIView):
    """
    API endpoint to retrieve and update authenticated user's profile information.
    
    Supports GET (fetch current profile) and POST (update profile data).
    Uses ProfileInformationSerializer for both data retrieval and validation.
    
    Authentication: JWT required
    Permissions: Authenticated users only
    
    Methods:
        GET: Retrieve current user's profile data
        POST: Update user's profile information
        
    Returns:
        GET: 200 - Current user profile data
        POST: 200 - Success message or 400 - Validation errors
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.ProfileInformationSerializer

    def get(self, request):
        """
        Retrieve authenticated user's current profile information.
        
        Args:
            request: Authenticated HTTP request
            
        Returns:
            Response: User profile data from serializer.get()
        """
        # Fetch current user profile using serializer's custom get method
        user_details = self.serializer_class().get(request.user)
        return Response(user_details, status=Config.success)

    def post(self, request):
        """
        Update authenticated user's profile information.
        
        Args:
            request: Authenticated HTTP request with profile data
            
        Returns:
            Response: Success message on update or validation errors
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Update user profile using serializer's custom post method
            self.serializer_class().post(request.user, request.data)
            return Response(
                {"message": "Data saved successfully."},
                status=Config.success
            )
        
        # Return validation errors for invalid data
        error_string = ""
        for error in serializer.errors:
            for err in serializer.errors[error]:
                error_string += f"{error}: {err} <br>"
        return Response(error_string, status=Config.bad_request)


class ChangePasswordView(generics.UpdateAPIView):
    """
    API endpoint to change authenticated user's password.
    
    Validates old password before setting new password and updates session.
    Ensures secure password change workflow with proper validation.
    
    Authentication: JWT required
    Permissions: Authenticated users only
    
    Request Body:
        old_password (str): Current password for verification
        new_password (str): New password to set
        
    Returns:
        200 Success: Password changed successfully
        400 Bad Request: Invalid old password or validation errors
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.ChangePasswordSerializer

    def get_object(self):
        """
        Return the currently authenticated user.
        
        Used by generic views to identify the user whose password is being changed.
        
        Returns:
            User: Authenticated user instance
        """
        return self.request.user

    def post(self, request, *args, **kwargs):
        """
        Handle POST request to change user password.
        
        Verifies old password, sets new password, saves user, and updates session.
        
        Args:
            request: Authenticated HTTP request with password data
            *args: Additional positional arguments
            **kwargs: Additional keyword arguments
            
        Returns:
            Response: Success message or validation/error response
        """
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Verify current password before allowing change
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=Config.bad_request
                )

            # Set and save new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            # Update session to prevent logout after password change
            update_session_auth_hash(request, user)

            return Response(
                {"message": "Password changed successfully."},
                status=Config.success
            )

        # Return serializer validation errors
        return Response(serializer.errors, status=Config.bad_request)


class ChangeUserTheme(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        theme = request.data
        current_user = User.objects.filter(id=request.user.id).first()
        current_user.theme = theme
        current_user.save()
        return Response(status=Config.success)


class RequestPasswordResetAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            user = User.objects.get(email=request.data["email"])
        except Exception as e:
            return Response({"message": "Email does not exist"}, status=Config.bad_request)

        allowed, remaining = can_request_password_reset(user)
        if not allowed:
            return Response(
                {"message": "Password reset request limit exceeded for this time slot"},
                status=Config.method_not_allowed
            )

        serializer = serializers.RequestPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)

        reset_link = f"http://localhost:5173/reset-password?uid={uid}&token={token}"

        send_mail(
            subject="Password Reset",
            message=f"Click to reset password: {reset_link}",
            from_email=None,
            recipient_list=[user.email],
        )

        return Response(
            {"message": "Password reset link sent"},
            status=Config.success
        )


class ConfirmPasswordResetAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = serializers.ConfirmPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        hashed_password = make_password(new_password)

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response(
                {"error": "Invalid UID"},
                status=Config.bad_request
            )

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {"error": "Invalid or expired token"},
                status=Config.bad_request
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=Config.success
        )
