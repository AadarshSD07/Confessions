import {useState, useEffect , useContext, useRef} from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate} from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import axios from "axios";
import ChangePassword from "../Pages/ChangePassword";
import CreatePosts from '../Pages/CreatePosts';
import Dashboard from '../Pages/Dashboard';
import Footer from './Footer';
import HeaderSkimmer from '../skimmers/HeaderSkimmer';
import Login from '../Pages/Login';
import NotFound from '../Pages/ErrorPage';
import Profile from '../Pages/Profile';
import Register from '../Pages/Register';
import Search from '../Pages/Search';
import UserProfile from '../Pages/UserProfile';
import ViewPosts from '../Pages/ViewPosts';
import ResetPassword from '../Pages/ResetPassword';

const NavbarWithRouter = (props) => {
    const { theme, applyThemeWithTransition } = useContext(ThemeContext);
    const [getHeaderDetails, setHeaderDetails] = useState([]);
    const thumbRef = useRef(null);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const defaultImage = (gender) => {
        return `${backendDomain}/static/user_profile_images/default-avatar-${gender}.png`;
    };

    const fetchLocation = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const userDetails = async () => {
            if (props.isAuthenticated) {
                const config = {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("access")}`,
                        "Content-Type": "application/json"
                    }
                };
                try {
                    const response = await axios.get(`${backendDomain}/header/`, config);
                    setHeaderDetails(response.data);
                    if (theme !== response.data.theme) {
                        await onToggle();
                    }
                } catch (err) {
                    console.error('Error:', err);
                }
            }
        };

        userDetails();
    }, []);

    const onToggle = async(e) => {
        const nextTheme = theme === "light" ? "dark" : "light";
        applyThemeWithTransition(nextTheme, thumbRef.current);
        if (!props.isAuthenticated) return

        const config = {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access")}`,
                "Content-Type": "application/json"
            }
        };
        try {
            await axios.post(
                `${backendDomain}/accounts/theme/`,
                nextTheme,
                config
            );

        } catch (err) {
            console.log("Error with request " + err);
        }
    };

    const handleLogout = () => {
        props.removeAccessRefresh();
        props.setIsAuthenticated(false);
        navigate("/login", { replace: true });
    }

    if (!props.isAuthenticated) {
        if (!["/register","/login","/reset-password", "/"].includes(fetchLocation.pathname)) {
            localStorage.setItem("redirectPath", fetchLocation.pathname);
            return <Navigate to="/" state={{ from: fetchLocation.pathname }} replace />;
        }

        return (
            <>
            <nav className="navbar navbar-expand-lg bg-header">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src={`${backendDomain}/static/logo/SSLNewShortSVG.png`}
                            className="img-fluid sslogo" alt="Sample image" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <span></span>
                        </ul>
                        <label>
                            <input onChange={onToggle} className='toggle-checkbox' type='checkbox' checked={theme === "dark"} />
                            <div className='toggle-slot me-2'>
                                <div className='sun-icon-wrapper'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sun" viewBox="0 0 16 16">
                                        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                                    </svg>
                                </div>
                                <div className='toggle-button'></div>
                                <div className='moon-icon-wrapper'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-moon-stars-fill" viewBox="0 0 16 16">
                                        <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
                                        <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
                                    </svg>
                                </div>
                            </div>
                        </label>
                        <div className='d-flex'>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item dropdown">
                                    {fetchLocation.pathname === "/register" || fetchLocation.pathname === "/reset-password" ? (
                                        <Link className="navbar-brand" to="/login">Login</Link>
                                    ) : (
                                        <Link className="navbar-brand" to="/register">Sign Up</Link>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
            <div className='page-content'>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login/*" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </div>
            </>
        );
    } else {
        if (getHeaderDetails.length < 1) {
            return (
                <>
                <HeaderSkimmer />
                <div className='page-content pb-5'>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard/:userId" element={<UserProfile />} />
                        <Route path="/view-posts" element={<ViewPosts />} />
                        <Route path="/create-posts" element={<CreatePosts />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/search" element={<Search />} />

                        {/* Catch-all route for non-existing URLs */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
                < Footer />
                </>
            );
        }
        return (
            <>
            <nav className="navbar navbar-expand-lg bg-header">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src={`${backendDomain}/static/logo/SSLNewShortSVG.png`}
                            className="img-fluid sslogo" alt="Sample image" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <span></span>
                        </ul>
                        <nav className="navbar-nav me-auto mb-2 mb-lg-0">
                            <Link className="nav-link theme-text" to="/">👤Dashboard</Link>
                            {/* <Link className="nav-link" to={`/dashboard/${getHeaderDetails.userId}`}>👤Dashboard</Link> */}
                            <Link className="nav-link theme-text" to="/view-posts">📝View Posts</Link>
                            <Link className="nav-link theme-text" to="/create-posts">➕Create Post</Link>
                            <Link className="nav-link theme-text" to="/search">🔍Search</Link>
                        </nav>
                        <label>
                            <input onChange={onToggle} className='toggle-checkbox' type='checkbox' checked={theme === "dark"} />
                            <div className='toggle-slot me-2'>
                                <div className='sun-icon-wrapper'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sun" viewBox="0 0 16 16">
                                        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                                    </svg>
                                </div>
                                <div className='toggle-button'></div>
                                <div className='moon-icon-wrapper'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-moon-stars-fill" viewBox="0 0 16 16">
                                        <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
                                        <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
                                    </svg>
                                </div>
                            </div>
                        </label>
                        <div className='d-flex'>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item dropdown">
                                    <a className="truncate-text nav-link dropdown-toggle theme-text" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img src={`${getHeaderDetails.user_image ? getHeaderDetails.user_image : defaultImage(getHeaderDetails.gender)}`} alt="User" className="avatar me-3"/>
                                        {
                                            getHeaderDetails.fullName?.trim() ? (
                                                getHeaderDetails.fullName
                                            ) : (
                                                getHeaderDetails.username
                                            )
                                        }
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">👤Profile</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/change-password">🗝️Change Password</Link>
                                        </li>
                                        <li><a role="button" className="dropdown-item" onClick={() => handleLogout()}>🚪{"Logout"}</a></li>
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
            <div className='page-content pb-5'>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard/:userId" element={<UserProfile />} />
                    <Route path="/view-posts" element={<ViewPosts />} />
                    <Route path="/create-posts" element={<CreatePosts />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/search" element={<Search />} />

                    {/* Catch-all route for non-existing URLs */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
            < Footer />
            </>
        )
    }
};


export default function Header(props) {
    return (
        <>
        <BrowserRouter>
            <NavbarWithRouter
                isAuthenticated={props.isAuthenticated}
                setIsAuthenticated={props.setIsAuthenticated}
                removeAccessRefresh={props.removeAccessRefresh}
            />
        </BrowserRouter>
        </>
    )
}
