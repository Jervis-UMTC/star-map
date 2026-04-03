import { useState, useMemo, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { prepare, layout } from '@chenglou/pretext';

/**
 * CosmicEnvelope — A luminous, ethereal envelope that glows from within.
 * It should be the brightest element on screen — a beacon of light in the void.
 * Features orbiting particles, visible internal light, and dramatic wax seal.
 */
export default function CosmicEnvelope({ onOpen }) {
  const envelopeRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const layoutOutput = useMemo(() => {
    if (typeof window === 'undefined') return { height: 0, lineCount: 0 };
    try {
      const prepared = prepare("For Eya", 'normal 40px "Great Vibes", cursive');
      return layout(prepared, windowWidth * 0.8, 50);
    } catch {
      return { height: 0, lineCount: 0 };
    }
  }, [windowWidth]);

  // Orbiting stardust particles around the envelope
  const [orbitingDust] = useState(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i / 16) * 360,
      distance: 180 + Math.random() * 80,
      size: Math.random() * 3 + 1.5,
      speed: 20 + Math.random() * 30,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.5 + 0.4,
    }));
  });

  return (
    <motion.div
      className="envelope-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.3 }}
      onClick={() => onOpen(envelopeRef.current?.getBoundingClientRect())}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(envelopeRef.current?.getBoundingClientRect())}
      tabIndex={0}
      role="button"
      aria-label="Open cosmic envelope"
    >
      {/* Orbiting stardust around the envelope */}
      <div className="envelope-orbit-container">
        {orbitingDust.map((dust) => (
          <motion.div
            key={dust.id}
            className="orbit-particle"
            style={{
              width: `${dust.size}px`,
              height: `${dust.size}px`,
              opacity: dust.opacity,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: dust.speed,
              repeat: Infinity,
              ease: "linear",
              delay: dust.delay,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: `${dust.size}px`,
                height: `${dust.size}px`,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: `0 0 ${dust.size * 3}px rgba(56, 189, 248, 0.8)`,
                top: `-${dust.distance}px`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="envelope-wrapper" ref={envelopeRef}>
        {/* Multiple layered glows behind envelope */}
        <div className="envelope-glow-layer glow-1" />
        <div className="envelope-glow-layer glow-2" />
        <div className="envelope-glow-layer glow-3" />

        {/* Main envelope body */}
        <div className="envelope-body">
          {/* Inner starfield visible through glass */}
          <div className="envelope-inner-stars" />

          {/* Constellation engravings */}
          <svg className="envelope-constellation" viewBox="0 0 380 260" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="55" r="2" fill="#38bdf8" opacity="0.8"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/></circle>
            <circle cx="110" cy="38" r="1.5" fill="#38bdf8" opacity="0.6"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite"/></circle>
            <circle cx="140" cy="70" r="2" fill="#38bdf8" opacity="0.7"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/></circle>
            <circle cx="95" cy="85" r="1.5" fill="#818cf8" opacity="0.5"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.5s" repeatCount="indefinite"/></circle>
            <line x1="70" y1="55" x2="110" y2="38" stroke="#38bdf8" strokeWidth="0.6" opacity="0.35"/>
            <line x1="110" y1="38" x2="140" y2="70" stroke="#38bdf8" strokeWidth="0.6" opacity="0.35"/>
            <line x1="140" y1="70" x2="95" y2="85" stroke="#38bdf8" strokeWidth="0.6" opacity="0.3"/>
            <line x1="95" y1="85" x2="70" y2="55" stroke="#818cf8" strokeWidth="0.6" opacity="0.3"/>

            <circle cx="260" cy="55" r="2" fill="#818cf8" opacity="0.7"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="3.2s" repeatCount="indefinite"/></circle>
            <circle cx="300" cy="42" r="1.5" fill="#818cf8" opacity="0.6"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.8s" repeatCount="indefinite"/></circle>
            <circle cx="320" cy="78" r="2" fill="#38bdf8" opacity="0.6"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.6s" repeatCount="indefinite"/></circle>
            <line x1="260" y1="55" x2="300" y2="42" stroke="#818cf8" strokeWidth="0.6" opacity="0.3"/>
            <line x1="300" y1="42" x2="320" y2="78" stroke="#818cf8" strokeWidth="0.6" opacity="0.3"/>

            <circle cx="170" cy="180" r="1.5" fill="#38bdf8" opacity="0.5"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="4.2s" repeatCount="indefinite"/></circle>
            <circle cx="210" cy="165" r="2" fill="#38bdf8" opacity="0.6"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="3.1s" repeatCount="indefinite"/></circle>
            <line x1="170" y1="180" x2="210" y2="165" stroke="#38bdf8" strokeWidth="0.6" opacity="0.25"/>
          </svg>

          {/* Light seams — edges where inner light leaks through */}
          <div className="light-seam seam-top" />
          <div className="light-seam seam-left" />
          <div className="light-seam seam-right" />
        </div>

        {/* Letter inside — glowing from within */}
        <div className="envelope-letter">
          <span style={{ 
            position: 'relative', 
            zIndex: 1, 
            fontFamily: 'var(--font-cursive)', 
            fontSize: '2.5rem', 
            fontWeight: 'normal', 
            transform: 'translateY(15px)',
            height: layoutOutput.height > 0 ? layoutOutput.height : 'auto',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            For Eya
          </span>
          <div className="letter-glow" />
        </div>

        {/* Front flap */}
        <div className="envelope-front" />

        {/* Top flap */}
        <div className="envelope-flap" />

        {/* The wax seal — dramatic with light rays */}
        <div className="wax-seal-container">
          <div className="seal-rays" />
          <div className="wax-seal">
            <motion.span
              className="seal-star"
              style={{ fontFamily: 'var(--font-cursive)', fontSize: '2.5rem', fontWeight: 'normal', transform: 'translateY(-2px)' }}
              animate={{
                scale: [0.85, 1.15, 0.85],
                textShadow: [
                  '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(252,211,77,0.3)',
                  '0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(252,211,77,0.6)',
                  '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(252,211,77,0.3)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              E
            </motion.span>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <motion.p
        className="envelope-cta"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1.2 }}
      >
        Click to unseal
      </motion.p>
    </motion.div>
  );
}
