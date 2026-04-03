import React, { useMemo, useEffect, useState } from 'react';
import { prepare, layout } from '@chenglou/pretext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// Pre-generate dynamic particles to avoid linter purity errors
const PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  size: Math.random() * 2 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 3,
}));

export default function LoadingScreen() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const layoutOutput = useMemo(() => {
    if (typeof window === 'undefined') return { height: 0, lineCount: 0 };
    try {
      const prepared = prepare("Gathering the stars...", 'italic 28.8px "Cormorant Garamond", serif');
      return layout(prepared, windowWidth * 0.8, 40);
    } catch {
      return { height: 0, lineCount: 0 };
    }
  }, [windowWidth]);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeOut" } }}
      className="fixed-full flex-center flex-col z-50"
      style={{ backgroundColor: '#010409', overflow: 'hidden' }}
    >
      {/* Ambient background stardust */}
      <div className="absolute-full pointer-events-none">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: `${p.top}%`,
              left: `${p.left}%`,
              backgroundColor: '#fcd34d',
              borderRadius: '50%',
              boxShadow: '0 0 10px 2px rgba(252, 211, 77, 0.4)',
              animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`
            }}
          />
        ))}
      </div>

      <div
        className="flex-center flex-col"
        style={{ 
          gap: '3.5rem', 
          position: 'relative', 
          zIndex: 2,
          animation: 'loadingContainerScale 4s ease-in-out infinite'
        }}
      >
        {/* Dynamic Orbital Loader */}
        <div className="flex-center" style={{ position: 'relative', width: '90px', height: '90px' }}>
          {/* Core glowing star */}
          <div
            className="flex-center"
            style={{ 
              position: 'absolute',
              animation: 'pulseGlow 2.5s ease-in-out infinite'
            }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#fcd34d',
              boxShadow: '0 0 25px 6px rgba(252, 211, 77, 0.8), 0 0 50px 15px rgba(56, 189, 248, 0.3)'
            }} />
          </div>
          
          {/* Inner Golden Orbit */}
          <div
            style={{
              position: 'absolute', width: '100%', height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(252, 211, 77, 0.05)',
              borderTopColor: 'rgba(252, 211, 77, 0.9)',
              borderRightColor: 'rgba(252, 211, 77, 0.3)',
              animation: 'orbitSpin 2.5s linear infinite'
            }}
          />

          {/* Outer Cyan Orbit */}
          <div
            style={{
              position: 'absolute', width: '150%', height: '150%',
              borderRadius: '50%',
              border: '1px solid rgba(56, 189, 248, 0.05)',
              borderBottomColor: 'rgba(56, 189, 248, 0.8)',
              borderLeftColor: 'rgba(56, 189, 248, 0.3)',
              animation: 'orbitSpinReverse 4s linear infinite'
            }}
          />
        </div>

        {/* Shimmering Text */}
        <h2 
          className="font-heading"
          style={{
            color: '#fcd34d',
            fontSize: '1.8rem',
            fontStyle: 'italic',
            letterSpacing: '0.25em',
            textShadow: '0 0 25px rgba(252, 211, 77, 0.6), 0 0 45px rgba(252, 211, 77, 0.2)',
            margin: 0,
            textAlign: 'center',
            height: layoutOutput.height > 0 ? layoutOutput.height : 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'shimmerText 3s ease-in-out infinite'
          }}
        >
          Gathering the stars...
        </h2>
      </div>
    </motion.div>
  );
}