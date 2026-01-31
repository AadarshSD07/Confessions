const ProfileSkimmer = () => {
  return (
    <>
    <div className="post-container p-3 shadow-sm field-width mt-4">
        <form>
            <div className="row">
                <div className="col">
                    <div className="image-upload-container">
                        <div className="avatar-preview-container">
                            <div className="relative group d-flex justify-content-center mx-auto">
                                <div className="avatar-profile w-32 h-32 rounded-full object-cover border-4 border-white shimmer"></div>
                            </div>
                        </div>

                        <div className="d-flex mt-4 space-x-2 mx-auto">
                            <div className="form-control ms-2 shimmer shimmer-button" style={{width: "8em"}}></div>
                            <div className="form-control mt-2 ms-4 shimmer shimmer-text" style={{ height: '22px', width: '7em' }}></div>
                        </div>

                        <p className="text-sm text-gray-500">
                            <div className="mt-2 shimmer shimmer-text"></div>
                        </p>
                    </div>
                </div>
            </div>
            <div className="mb-3 row">
                <div className="col">
                    <label htmlFor="username" className="form-label">
                    Username
                    </label>
                    <div className="form-control ms-2 shimmer shimmer-text" style={{ height: '35px', borderRadius: '10px' }}></div>
                </div>
            </div>
            <div className="mb-3 row">
                <div className="col">
                    <label htmlFor="firstname" className="form-label">
                    First Name
                    </label>
                    <div className="form-control ms-2 shimmer shimmer-text" style={{ height: '35px', borderRadius: '10px' }}></div>
                </div>
                <div className="col">
                    <label htmlFor="lastname" className="form-label">
                    Last Name
                    </label>
                    <div className="form-control ms-2 shimmer shimmer-text" style={{ height: '35px', borderRadius: '10px' }}></div>
                </div>
            </div>
            <div className="mb-3 row">
                <div className="col">
                    <label htmlFor="email" className="form-label">
                    Email
                    </label>
                    <div className="form-control ms-2 shimmer shimmer-text" style={{ height: '35px', borderRadius: '10px' }}></div>
                </div>
            </div>
            <div className="mb-3 row">
                <div className="col">
                    <div className="form-control ms-2 shimmer shimmer-button"></div>
                </div>
            </div>
        </form>
    </div>
    </>
  )
}

export default ProfileSkimmer
