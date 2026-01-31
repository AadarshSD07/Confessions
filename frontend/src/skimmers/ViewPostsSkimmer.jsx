const ViewPostsSkimmer = () => {
  return (
    <>
    <h3 className='mt-4 fs-3 text-center'>All Posts</h3>
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

export default ViewPostsSkimmer
