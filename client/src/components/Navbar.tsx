import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-night-900 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif font-bold text-white flex items-center">
          <span className="text-primary-400">★</span>
          <span className="ml-2">Starcrossed</span>
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-white hover:text-primary-400 transition-colors">
            Home
          </Link>
          <Link to="/chart" className="cosmic-button">
            Generate Chart
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
