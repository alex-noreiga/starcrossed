import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationCenter from './notifications/NotificationCenter';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  return (
    <nav className="fixed w-full z-10 bg-night-800 bg-opacity-95 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-400">
              Starcrossed
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="text-night-300 hover:text-white transition-colors">
              Home
            </Link>
            
            {currentUser && (
              <>
                <Link to="/charts" className="text-night-300 hover:text-white transition-colors">
                  My Charts
                </Link>
                <Link to="/compare" className="text-night-300 hover:text-white transition-colors">
                  Compare
                </Link>
                <Link to="/transits" className="text-night-300 hover:text-white transition-colors">
                  Transits
                </Link>
              </>
            )}
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {/* Notification center */}
                <div className="text-white">
                  <NotificationCenter />
                </div>
                
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center text-white transition-colors focus:outline-none"
                  >
                    <span className="mr-2">{currentUser.name}</span>
                    <svg
                      className={`h-4 w-4 transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-night-700 rounded-lg shadow-lg py-2 z-20">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-night-300 hover:bg-night-600 hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/charts"
                        className="block px-4 py-2 text-night-300 hover:bg-night-600 hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Charts
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-night-300 hover:bg-night-600 hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-night-300 hover:bg-night-600 hover:text-white transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-night-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-night-800 py-4">
          <div className="container mx-auto px-4 space-y-3">
            <Link
              to="/"
              className="block text-night-300 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            
            {currentUser && (
              <>
                <Link
                  to="/charts"
                  className="block text-night-300 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  My Charts
                </Link>
                <Link
                  to="/compare"
                  className="block text-night-300 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Compare
                </Link>
                <Link
                  to="/transits"
                  className="block text-night-300 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Transits
                </Link>
                <Link
                  to="/profile"
                  className="block text-night-300 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block text-night-300 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left text-night-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            
            {!currentUser && (
              <>
                <Link
                  to="/login"
                  className="block text-night-300 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors inline-block"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
