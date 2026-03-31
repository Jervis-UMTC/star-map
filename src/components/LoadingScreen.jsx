import React from 'react';
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
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: `${p.top}%`,
              left: `${p.left}%`,
              backgroundColor: '#fcd34d',
              borderRadius: '50%',
              boxShadow: '0 0 10px 2px rgba(252, 211, 77, 0.4)'
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        animate={{ scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex-center flex-col"
        style={{ gap: '3.5rem', position: 'relative', zIndex: 2 }}
      >
        {/* Dynamic Orbital Loader */}
        <div className="flex-center" style={{ position: 'relative', width: '90px', height: '90px' }}>
          {/* Core glowing star */}
          <motion.div
            className="flex-center"
            style={{ position: 'absolute' }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#fcd34d',
              boxShadow: '0 0 25px 6px rgba(252, 211, 77, 0.8), 0 0 50px 15px rgba(56, 189, 248, 0.3)'
            }} />
          </motion.div>
          
          {/* Inner Golden Orbit */}
          <motion.div
            style={{
              position: 'absolute', width: '100%', height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(252, 211, 77, 0.05)',
              borderTopColor: 'rgba(252, 211, 77, 0.9)',
              borderRightColor: 'rgba(252, 211, 77, 0.3)'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Outer Cyan Orbit */}
          <motion.div
            style={{
              position: 'absolute', width: '150%', height: '150%',
              borderRadius: '50%',
              border: '1px solid rgba(56, 189, 248, 0.05)',
              borderBottomColor: 'rgba(56, 189, 248, 0.8)',
              borderLeftColor: 'rgba(56, 189, 248, 0.3)'
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Shimmering Text */}
        <motion.h2 
          className="font-heading"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            color: '#fcd34d',
            fontSize: '1.8rem',
            fontStyle: 'italic',
            letterSpacing: '0.25em',
            textShadow: '0 0 25px rgba(252, 211, 77, 0.6), 0 0 45px rgba(252, 211, 77, 0.2)',
            margin: 0,
            textAlign: 'center'
          }}
        >
          Gathering the stars...
        </motion.h2>
      </motion.div>
    </motion.div>
  );
}
