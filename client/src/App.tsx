import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-night-950 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Starcrossed</h1>
          <p className="text-xl">Birth Chart Generator</p>
          <div className="mt-8 text-primary-400 text-6xl">★</div>
          <p className="mt-4">If you can see this, the app is working!</p>
        </div>
      </div>
    </Router>
  );
}

export default App;
