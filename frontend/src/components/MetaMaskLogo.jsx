import React, { useEffect, useState, useRef } from 'react';
import './MetaMaskLogo.css';

const MetaMaskLogo = () => {
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg)');
  const logoRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const logo = logoRef.current;
      if (!logo) return;

      const rect = logo.getBoundingClientRect();
      const logoX = rect.left + rect.width / 2;
      const logoY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - logoX) / 30;
      const deltaY = (e.clientY - logoY) / 30;

      const rotateX = Math.min(Math.max(-deltaY, -10), 10);
      const rotateY = Math.min(Math.max(deltaX, -10), 10);

      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      );
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="logo-container">
      <img
        ref={logoRef}
        src="metamask-fox.svg"
        alt="MetaMask Logo"
        className="follow-cursor-logo"
        style={{ transform }}
      />
      <div className="glow"></div>
    </div>
  );
};

export default MetaMaskLogo;
