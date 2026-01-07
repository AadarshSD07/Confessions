import { useState } from "react";
import {Routes, Route, Link} from 'react-router-dom';
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/auth/login/`,
        {
          username: username,
          password: password,
        }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      window.location.href = "/";
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <h1 className="text-center pt-4">Login</h1>
    <div className='container-md py-3 field-width'>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="form-group mt-2">
          <label htmlFor="username">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control"
          placeholder="Username" id="username" minLength="3" maxLength="150" disabled={loading} required />
        </div>
        
        <div className="form-group mt-2">
          <label htmlFor="password">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" 
            placeholder="Password" id="password" minLength="8" disabled={loading} required />

          <small className="form-text text-muted">Password must be at least 8 characters long.</small>
        </div>
        
        <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
          {loading ? 'Logging in...' : 'SIGN IN'}
        </button>
      </form>
    </div>
    </>
  );
};

export default Login;
