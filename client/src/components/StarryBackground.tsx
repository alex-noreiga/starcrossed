import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starsRef.current) return;

    // Clear any existing stars
    starsRef.current.innerHTML = '';

    // Create stars
    const starCount = 150;
    const container = starsRef.current;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random size (some stars bigger than others)
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random delay for the twinkle animation
      star.style.animationDelay = `${Math.random() * 5}s`;
      
      container.appendChild(star);
    }
  }, []);

  return <div ref={starsRef} className="stars"></div>;
};

export default StarryBackground;
