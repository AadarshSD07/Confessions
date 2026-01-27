import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import ErrorBoundary from './Components/ErrorBounday';
import Header from './Components/Header';
import './CSS/App.css'

const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;

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

const removeAccessRefresh = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

const refreshAccessToken = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return false;
    
    const response = await axios.post(`${backendDomain}/auth/refresh/`,
      {refresh: refresh}
    );

    if (response.data.access) {
      localStorage.setItem("access", response.data.access);
      return true;
      }
    return false;
  } catch (err) {
    removeAccessRefresh();
    console.error('Error refreshing token:', err);
    return false;
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      // No tokens at all
      if (!access || !refresh) {
        removeAccessRefresh();
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
  });

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <>
    <ErrorBoundary>
      <Header
        setIsAuthenticated={setIsAuthenticated}
        isAuthenticated={isAuthenticated}
        removeAccessRefresh={removeAccessRefresh}
      />
    </ErrorBoundary>
    </>
  )
}

export default App
