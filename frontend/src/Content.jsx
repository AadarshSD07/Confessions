import {useState, useEffect} from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from "axios";
import ChangePassword from './Pages/ChangePassword';
import CreatePosts from './Pages/CreatePosts';
import Dashboard from './Pages/Dashboard';
import LocalStorageVariables from './Methods/LocalStorageVariables';
import Profile from './Pages/Profile';
import ViewPosts from './Pages/ViewPosts';

function Content(props) {
    const [getHeaderDetails, setHeaderDetails] = useState([]);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const config = LocalStorageVariables("config");

    useEffect(() => {
        const userDetails = async () => {
        try {
            const response = await axios.get(`${backendUrl}/header/`, config);
            setHeaderDetails(response.data);
        } catch (err) {
            console.error('Error:', err);
        }
        };
    
        userDetails();
    }, []);

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
                <Link className="nav-link" to="/view-posts">📝View Posts</Link>
                <Link className="nav-link" to="/create-posts">➕Create Post</Link>
              </nav>
              : ""
              }
              <div className='d-flex'>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src={`${backendUrl}${getHeaderDetails.userImage}`} alt="User" className="avatar me-3"/>
                        {getHeaderDetails.fullName}
                      </a>
                      <ul className="dropdown-menu">
                        <li>
                          <Link className="dropdown-item" to="/profile">👤Profile</Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/change-password">🗝️Change Password</Link>
                        </li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item" href="#" onClick={() => props.logout()}>🚪{"Logout"}</a></li>
                      </ul>
                    </li>
                </ul>
              </div>
              <ul className="mb-2 mb-lg-0">
                <span></span>
              </ul>
            </div>
          </div>
        </nav>
        <div className='page-content mt-4 pb-5'>
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/view-posts" element={<ViewPosts />} />
              <Route path="/create-posts" element={<CreatePosts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </div>
    </BrowserRouter>
    </>
  )
}

export default Content
