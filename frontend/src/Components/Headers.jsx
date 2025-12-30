import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard'
import CreatePosts from '../Pages/CreatePosts';
import ViewPosts from '../Pages/ViewPosts';

export default function Header() {
  return (
    <>
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Social Stack</a>
        
      </div>
    </nav>
    <div className='page-content'>
    </div>
    </>
  )
}