import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="error-page d-flex align-items-center justify-content-center">
      <div className="error-container text-center p-4">
        <h1 className="error-code mb-0">404</h1>
        <h2 className="display-6 error-message mb-3">Page Not Found</h2>
        <p className="lead error-message mb-5">
          The requested address is invalid or the page does not exist. Please navigate to the correct page via our homepage.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-glass px-4 py-2">Return Home</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;