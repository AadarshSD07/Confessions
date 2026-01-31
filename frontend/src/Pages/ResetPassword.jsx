import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setStatusMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${backendDomain}/accounts/password-reset/`,
        {
          email: email
        }
      );
      if (response.status === 200) {
        setStatus("success");
        setStatusMessage(response.data.message);
      } else {
        setStatus("info");
        setStatusMessage(response.data.message);
      }

    } catch (err) {
      if (err.response.data.detail) {
        setStatus("danger");
        setStatusMessage(err.response.data.detail);
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setStatus("");
    setStatusMessage("");

    if (password != repassword) {
      setStatus("danger");
      setStatusMessage("New password and confirm password mismatch");
      return;
    }

    try {
      const response = await axios.post(
        `${backendDomain}/accounts/password-reset-confirm/`,
        {
          uid: uid,
          token: token,
          new_password: password
        }
      );
      if (response.status === 200) {
        setStatus("success");
      } else {
        setStatus("info");
      }
      setStatusMessage(response.data.message);
      await sleep(5000);
      navigate("/login", { replace: true });

    } catch (err) {
      let detail = err.response?.data?.detail;
      let message = err.response?.data?.message | err.message | err;
      setStatus("danger");
      if (detail) {
        setStatusMessage(detail);
      } else {
        setStatusMessage(message);
      }
      console.log(err);
      await sleep(10000);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
    <div className='post-container p-3 shadow-sm field-width mt-4 pb-5'>
      {statusMessage && (
        <div className={`alert alert-${status} mt-3`} role="alert">
          {statusMessage}
        </div>
      )}
      { 
        uid && token ? (
          <>
            <h2 className="pt-4 fw-bold">Change password</h2>
            <p className="text-muted pb-1">Please enter your new password below</p>
            <form className="mb-4" onSubmit={handleSubmitPassword}>
              <div className="form-group mt-2">
                <label className="fw-semibold" htmlFor="password">New password</label>
                <input type="password" className="form-control shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="password" id="password" minLength="3" maxLength="150" disabled={loading} required />
              </div>

              <div className="form-group mt-2">
                <label className="fw-semibold" htmlFor="repassword">Confirm new password</label>
                <input type="password" className="form-control shadow-sm" value={repassword} onChange={(e) => setRPassword(e.target.value)}
                  placeholder="password" id="repassword" minLength="3" maxLength="150" disabled={loading} required />
              </div>
      
              <div className="d-flex justify-content-center mt-4 mx-auto">
                <button type="submit" className="login-button shadow mt-2" disabled={loading}>
                  {loading ? 'SENDING IN...' : 'SEND'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="pt-4 fw-bold">Reset your password</h2>
            <p className="text-muted pb-1">Please enter your email address and you will receive reset password link on your email.</p>
            <form className="mb-4" onSubmit={handleSubmit}>
              <div className="form-group mt-2">
                <label className="fw-semibold" htmlFor="email">Email</label>
                <input type="text" className="form-control shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email" id="email" minLength="3" maxLength="150" disabled={loading} required />
              </div>
      
              <div className="d-flex justify-content-center mt-4 mx-auto">
                <button type="submit" className="login-button shadow mt-2" disabled={loading}>
                  {loading ? 'SENDING IN...' : 'SEND'}
                </button>
              </div>
            </form>
          </>
        )
      }
    </div>
    </>
  )
}

export default ResetPassword
