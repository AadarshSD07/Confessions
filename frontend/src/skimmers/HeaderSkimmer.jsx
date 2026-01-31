const HeaderSkimmer = () => {
  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  return (
    <>
    <nav className="navbar navbar-expand-lg bg-header">
        <div className="container-fluid">
            <a className="navbar-brand" href="/">
              <img src={`${backendDomain}/static/logo/SSLNewShortSVG.png`} className="img-fluid sslogo" alt="Sample image" />
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <span></span>
                </ul>
                <nav className="navbar-nav me-auto mb-2 mb-lg-0">
                  <div className="nav-link shimmer shimmer-title"></div>
                </nav>
                <label>
                  <div className="me-2 shimmer shimmer-toggle"></div>
                </label>
                <div className="ms-2 img-fluid sslogo shimmer shimmer-profile-image"></div>
                <div className="ms-2 shimmer shimmer-text" style={{ height: '20px', width: '7%' }}></div>
                <ul className="mb-2 mb-lg-0">
                    <span></span>
                </ul>
            </div>
        </div>
    </nav>
    </>
  )
}

export default HeaderSkimmer
