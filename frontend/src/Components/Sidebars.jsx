import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard'
import CreatePosts from '../Pages/CreatePosts';
import ViewPosts from '../Pages/ViewPosts';
import '../App.css'

export default function Sidebars(props) {
    return (
        <>
        <BrowserRouter>
            { props.toShow ? <div className="bg-light text-center sidebars shadow-sm">
                <nav>
                    <Link className="nav-link" to="/">👤Dashboard</Link>
                    <hr></hr>
                    <Link className="nav-link" to="/view_posts">📝View Posts</Link>
                    <hr></hr>
                    <Link className="nav-link" to="/create_posts">➕Create Post</Link>
                    <hr></hr>
                </nav>
            </div> : ""}
                <div className='page-content'>
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
