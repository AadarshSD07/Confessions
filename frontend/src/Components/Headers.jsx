import React from 'react'

export default function Header(props) {
  return (
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
            <div className='d-flex'>
              <a className="nav-link" href="#" onClick={() => props.userLogout()}>{props.cornerButton}</a>
            </div>
          </div>
        </div>
    </nav>
  )
}