
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-honey-light px-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-honey rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-4xl">!</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-hive">404</h1>
        <p className="text-xl text-hive-light mb-8">
          Oops! We couldn't find the page you're looking for.
        </p>
        <Link to="/" className="inline-block bg-honey hover:bg-honey-dark text-white font-medium px-6 py-3 rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
