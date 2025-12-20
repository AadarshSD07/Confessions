import React from 'react'
import "../App.css"

export default function Toasts() {
  return (
    <>
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="liveToast" className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header success-toast">
                <span className="me-auto">Post created successfully!</span>
                <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>
    </>
  )
}
