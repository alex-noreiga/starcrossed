import React, { useEffect } from 'react';

function StarBackground() {
  useEffect(() => {
    // Create stars
    const container = document.createElement('div');
    container.className = 'fixed inset-0 z-0 pointer-events-none overflow-hidden';
    document.body.appendChild(container);
    
    // Generate random stars
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'absolute rounded-full';
      
      // Random size
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random brightness
      const opacity = Math.random() * 0.5 + 0.3;
      star.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      
      // Random twinkle animation
      star.style.animation = `twinkle ${Math.random() * 4 + 3}s infinite`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      
      container.appendChild(star);
    }
    
    // Create style for twinkle animation if it doesn't exist
    if (!document.getElementById('star-animation')) {
      const style = document.createElement('style');
      style.id = 'star-animation';
      style.textContent = `
        @keyframes twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Cleanup on unmount
    return () => {
      document.body.removeChild(container);
    };
  }, []);
  
  return null; // This component doesn't render anything
}

export default StarBackground;