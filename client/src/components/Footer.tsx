import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-night-900 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-serif font-bold text-white flex items-center">
              <span className="text-primary-400">★</span>
              <span className="ml-2">Starcrossed</span>
            </h3>
            <p className="text-night-400 mt-2">Discover the celestial blueprint of your life</p>
          </div>
          <div className="flex space-x-8">
            <div>
              <h4 className="text-white font-medium mb-2">Resources</h4>
              <ul className="text-night-400">
                <li className="mb-1"><a href="#" className="hover:text-primary-400 transition-colors">About Astrology</a></li>
                <li className="mb-1"><a href="#" className="hover:text-primary-400 transition-colors">FAQ</a></li>
                <li className="mb-1"><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Connect</h4>
              <ul className="text-night-400">
                <li className="mb-1"><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                <li className="mb-1"><a href="#" className="hover:text-primary-400 transition-colors">Twitter</a></li>
                <li className="mb-1"><a href="#" className="hover:text-primary-400 transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-night-800 mt-8 pt-6 text-center text-night-500">
          <p>© {new Date().getFullYear()} Starcrossed. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
