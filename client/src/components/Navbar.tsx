import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="sticky top-0 z-50 bg-night-900 bg-opacity-90 backdrop-filter backdrop-blur-lg border-b border-night-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl text-primary-400 mr-2">✧</span>
              <span className="text-xl font-serif text-white">Starcrossed</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium ${location.pathname === '/' ? 'text-primary-400' : 'text-night-300 hover:text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/chart" 
              className={`px-3 py-2 text-sm font-medium ${location.pathname === '/chart' ? 'text-primary-400' : 'text-night-300 hover:text-white'}`}
            >
              Chart
            </Link>
            <Link 
              to="/profile" 
              className={`px-3 py-2 text-sm font-medium ${location.pathname === '/profile' ? 'text-primary-400' : 'text-night-300 hover:text-white'}`}
            >
              Profile
            </Link>
            <a 
              href="#" 
              className="cosmic-button px-4 py-2 text-sm font-medium"
            >
              Sign In
            </a>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-night-300 hover:text-white hover:bg-night-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg 
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon when menu is open */}
              <svg 
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-night-700`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className={`block px-3 py-2 text-base font-medium ${location.pathname === '/' ? 'text-primary-400 bg-night-800' : 'text-night-300 hover:text-white hover:bg-night-700'}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/chart" 
            className={`block px-3 py-2 text-base font-medium ${location.pathname === '/chart' ? 'text-primary-400 bg-night-800' : 'text-night-300 hover:text-white hover:bg-night-700'}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Chart
          </Link>
          <Link 
            to="/profile" 
            className={`block px-3 py-2 text-base font-medium ${location.pathname === '/profile' ? 'text-primary-400 bg-night-800' : 'text-night-300 hover:text-white hover:bg-night-700'}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>
          <a 
            href="#" 
            className="block px-3 py-2 text-base font-medium text-primary-400 hover:bg-night-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign In
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
