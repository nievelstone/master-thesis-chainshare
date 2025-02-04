import React from 'react';
import { useCallback } from "react";
import Particles from 'react-tsparticles';
import { loadSlim } from "tsparticles-slim";

const BackgroundAnimation = () => {
    const particlesInit = useCallback(async engine => {
        console.log(engine);
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async container => {
        await console.log(container);
    }, []);
  return (
    <Particles
    init={particlesInit}
    loaded={particlesLoaded}
      options={{
        particles: {
          number: { value: 100 },
          color: { value: '#ffffff' },
          links: { enable: true, color: '#ffffff' },
          move: { enable: true, speed: 1 },
        },
        interactivity: {
          events: { onHover: { enable: true, mode: 'repulse' } },
          modes: { repulse: { distance: 100 } },
        },
        background: { color: '#0f0f0f' },
      }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  );
};

export default BackgroundAnimation;
