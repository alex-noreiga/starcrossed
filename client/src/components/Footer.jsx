import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-night-800 py-6 fixed bottom-0 w-full">
      <div className="container mx-auto px-4">
        <div className="text-center text-night-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Starcrossed. All rights reserved.</p>
          <p className="mt-1">
            Built with 💫 for astrological exploration.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
