import React, {useState, useEffect} from 'react'
import axios from "axios";
import Login from './Pages/Login'
import { jwtDecode } from 'jwt-decode';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import CreatePosts from './Pages/CreatePosts';
import ViewPosts from './Pages/ViewPosts';
import './App.css'

const isTokenValid = (token) => {
  if (!token) return false;

  try {
    let currentDate = new Date();
    let decodedToken = jwtDecode(token);
    return decodedToken.exp * 1000 > currentDate.getTime()
  } catch(err) {
    return false
  }
};

const refreshAccessToken = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return false;
    
    const response = await axios.post("http://127.0.0.1:8000/auth/refresh/",
      {refreshToken: refresh}
    );

    if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        return true;
      }
    return false;
  } catch (err) {
    localStorage.removeItem("refresh");
    localStorage.removeItem("access");
    console.error('Error refreshing token:', err);
    return false;
  }
}

function App() {
  const [getHeaderDetails, setHeaderDetails] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const access = localStorage.getItem("access");
  const config = {
    headers: {
      'Authorization': `Bearer ${access}`,
      'Content-Type': 'application/json'
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      // Check if tokens exist
      if (localStorage.length === 0 || !localStorage.getItem("access")) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      // Check if current token is valid
      if (isTokenValid(access)) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Token expired, try to refresh
      const refreshed = await refreshAccessToken();
      setIsAuthenticated(refreshed);
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const userDetails = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/header/", config);
        setHeaderDetails(response.data);
      } catch (err) {
        console.error('Error:', err);
      }
    };
  
    userDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (isAuthenticated){
    return (
      <>
      <BrowserRouter>
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">Social Stack</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <span></span>
              </ul>
                { getHeaderDetails ?
              <nav className="navbar-nav me-auto mb-2 mb-lg-0">
                <Link className="nav-link" to="/">👤Dashboard</Link>
                <Link className="nav-link" to="/view_posts">📝View Posts</Link>
                <Link className="nav-link" to="/create_posts">➕Create Post</Link>
              </nav>
              : ""
              }
              <div className='d-flex'>
                { getHeaderDetails ? 
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src={`http://127.0.0.1:8000${getHeaderDetails.userImage}`} alt="Profile" className="avatar me-3"/>
                        {getHeaderDetails.fullName}
                      </a>
                      <ul className="dropdown-menu">
                        <li><a className="dropdown-item" href="#">👤Profile</a></li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item" href="#" onClick={() => handleLogout()}>🚪{"Logout"}</a></li>
                      </ul>
                    </li>
                  </ul>
                  :
                  <a className="nav-link" href="#" onClick={() => handleLogout()}>🔑{"Logout"}</a>
                }
              </div>
            </div>
          </div>
        </nav>
        <div className='page-content mt-4'>
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/view_posts" element={<ViewPosts />} />
              <Route path="/create_posts" element={<CreatePosts />} />
          </Routes>
        </div>
      </BrowserRouter>
      </>
    )
  } 
  return (
    <>
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Social Stack</a>
        
      </div>
    </nav>
    <div className='page-content'>
      <Login />
    </div>
    </>
  )
}

export default App
