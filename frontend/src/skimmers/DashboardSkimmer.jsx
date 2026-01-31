const DashboardSkimmer = () => {
  return (
    <>
    <div className="profile-container w-100 shadow-sm px-2">
      <div className="post-container mt-2 mb-2">
        <div className="post-header mb-2">
          <div className="d-flex align-items-center justify-content-between w-100">

            {/* LEFT: Avatar + User Info */}
            <div className="d-flex align-items-center gap-3">

              <div className="dashboard-avatar shimmer"></div>
              
              <div>
                <div className="fw-bold fs-5">
                    <div className="ms-2 shimmer shimmer-text" style={{ width: '7em', height: '1em' }}></div>
                </div>
                <div className="text-muted small">
                    <div className="ms-2 mt-2 shimmer shimmer-text" style={{ width: '5em', height: '1em' }}></div>
                </div>

                <div className="text-muted small">
                  <div className="ms-2 mt-2 shimmer shimmer-text" style={{ width: '10em', height: '1em' }}></div>
                </div>
              </div>
            </div>

            {/* RIGHT: Post Count */}
            <div className="text-center px-3">
              <div className="fw-bold fs-4">
                <div className="ms-2 shimmer shimmer-text" style={{ width: '25px', height: '35px' }}></div>
              </div>
              <div className="text-muted small">
                Posts
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
    <div className="container">
        <div className="post-container mt-4 shadow-sm">
            <div className="post-header mb-3">
                <div className="d-flex align-items-center">
                    <div className="avatar me-3 shimmer"></div>
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                            <div className="profileView mb-0 fw-bold shimmer shimmer-text" style={{ width: '10em' }}></div>
                        </div>
                        <div className="mt-3 username shimmer shimmer-text" style={{ width: '10em', height:'1em' }}></div>
                    </div>
                </div>
            </div>

            <div className="post-body">
                <div className="mt-3 shimmer shimmer-text" style={{ width: '100%', height:'18em' }}></div>
                <div className="mt-3 postImageContainer postImage me-3 shimmer shimmer-text" style={{ width: '10%', height:'18px' }}></div>
                <div className="mt-3 shimmer shimmer-text" style={{ width: '100%', height:'20px' }}></div>
                <div className="mt-3 shimmer shimmer-text" style={{ width: '7%', height:'15px' }}></div>
            </div>
        </div>
    </div>
    </>
  )
}

export default DashboardSkimmer
