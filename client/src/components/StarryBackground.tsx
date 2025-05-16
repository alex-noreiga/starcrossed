import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Clean up any existing stars
    container.innerHTML = '';
    
    // Create stars
    const starCount = Math.floor(width * height / 1000); // Adjust density as needed
    
    for (let i = 0; i < starCount; i++) {
      createStar(container, width, height);
    }
    
    // Create occasional shooting stars
    const shootingStarInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        createShootingStar(container, width, height);
      }
    }, 2000);
    
    // Clean up
    return () => {
      clearInterval(shootingStarInterval);
    };
  }, []);
  
  const createStar = (container: HTMLDivElement, maxWidth: number, maxHeight: number) => {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random position
    const x = Math.random() * maxWidth;
    const y = Math.random() * maxHeight;
    
    // Random size (small)
    const size = Math.random() * 2 + 1;
    
    // Random twinkle animation duration
    const twinkleDuration = Math.random() * 3 + 2; // 2-5 seconds
    
    // Set styles
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty('--twinkle-duration', `${twinkleDuration}s`);
    
    // Add varying brightness
    star.style.opacity = (Math.random() * 0.7 + 0.3).toString();
    
    // Add to container
    container.appendChild(star);
  };
  
  const createShootingStar = (container: HTMLDivElement, maxWidth: number, maxHeight: number) => {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    
    // Random position (mostly from top and sides)
    const startX = Math.random() * maxWidth;
    const startY = Math.random() * (maxHeight / 3); // Start in the top third
    
    // Random length and angle
    const length = Math.random() * 100 + 50; // 50-150 pixels
    const angle = Math.random() * Math.PI / 4 + Math.PI / 4; // 45-90 degrees
    
    // Calculate end position based on angle and length
    const distanceX = Math.cos(angle) * length;
    const distanceY = Math.sin(angle) * length;
    
    // Random duration
    const duration = Math.random() * 1 + 0.5; // 0.5-1.5 seconds
    
    // Set styles
    shootingStar.style.left = `${startX}px`;
    shootingStar.style.top = `${startY}px`;
    shootingStar.style.width = `${length}px`;
    shootingStar.style.setProperty('--shoot-distance-x', `${distanceX}px`);
    shootingStar.style.setProperty('--shoot-distance-y', `${distanceY}px`);
    shootingStar.style.setProperty('--shoot-duration', `${duration}s`);
    shootingStar.style.transform = `rotate(${angle}rad)`;
    
    // Add to container
    container.appendChild(shootingStar);
    
    // Remove after animation completes
    setTimeout(() => {
      if (shootingStar.parentNode === container) {
        container.removeChild(shootingStar);
      }
    }, duration * 1000);
  };
  
  return (
    <div 
      ref={containerRef} 
      className="starry-background absolute inset-0 overflow-hidden z-0 pointer-events-none"
    ></div>
  );
};

export default StarryBackground;
