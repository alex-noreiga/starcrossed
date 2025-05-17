import React from 'react';

const StarryBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-night-900 to-night-950"></div>
      <div id="stars" className="absolute inset-0 z-0"></div>
      <div id="stars2" className="absolute inset-0 z-0"></div>
      <div id="stars3" className="absolute inset-0 z-0"></div>
    </div>
  );
};

export default StarryBackground;
