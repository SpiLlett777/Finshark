import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/useAuth";
import logo from "./logo.png";

const Navbar: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img src={logo} alt="FinShark Logo" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/search"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Search
            </Link>

            <Link
              to="/profile"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Portfolio
            </Link>

            {isLoggedIn() ? (
              <>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>

                <Link to="/profile" className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-500 transition">
                    <span className="text-gray-700 font-semibold">
                      {user?.userName[0].toUpperCase()}
                    </span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
