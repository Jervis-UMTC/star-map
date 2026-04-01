import { useEffect, useState, useRef, memo } from 'react';
import { motion } from 'framer-motion';

/**
 * AccurateStarMap — Renders the D3 Celestial star map for
 * April 1, 2005, Philippines sky. Now with living effects:
 * vignette, aurora shimmer, deep parallax, and twinkling stars.
 */
const AccurateStarMap = memo(function AccurateStarMap({ isActive, onLoaded }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.Celestial) {
      console.error("D3 Celestial library not loaded");
      return;
    }

    // Delay D3 initialization so Framer Motion / UI doesn't stutter on initial load
    const initTimer = setTimeout(() => {
      try {
        const config = {
          width: 0,
          projection: "equirectangular",
          transform: "equatorial",
          center: [121.7740, 12.8797],
          background: { fill: "transparent", opacity: 0 },

          stars: {
            show: true,
            limit: 5.5,
            colors: true,
            style: { fill: "#ffffff", opacity: 0.85 },
            designation: false,
            size: 5,
          },

          dsos: { show: false },

          constellations: {
            show: true,
            names: false,
            lines: true,
            lineStyle: {
              stroke: "#38bdf8",
              width: 0.8,
              opacity: 0.45,
            },
          },

          mw: {
            show: true,
            style: { fill: "#0f172a", opacity: 0.25 },
          },

          lines: {
            graticule: { show: false },
            equatorial: { show: false },
            ecliptic: { show: false },
            galactic: { show: false },
            supergalactic: { show: false },
          },

          datapath: "https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/data/",
          interactive: true,
          controls: false,
        };

        window.Celestial.display(config);
        window.Celestial.date(new Date("2005-04-01T00:00:00+08:00"));
        
        // Give D3 a moment to render the SVG, then inject twinkle animations via requestIdleCallback
        setTimeout(() => {
          setIsLoaded(true);
          if (onLoaded) onLoaded();
          
          const injectTwinkles = () => {
            const starPaths = document.querySelectorAll('#celestial-map svg path:not([stroke])');
            starPaths.forEach((path) => {
              if (Math.random() < 0.15) {
                const duration = Math.random() * 6 + 6; 
                const delay = Math.random() * -10;
                path.style.animation = `starTwinkle ${duration}s ease-in-out infinite alternate ${delay}s`;
              }
            });
          };

          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(injectTwinkles);
          } else {
            setTimeout(injectTwinkles, 100);
          }
        }, 500);

      } catch (err) {
        console.error("Celestial init error:", err);
      }
    }, 150); // Yield to main thread first

    return () => clearTimeout(initTimer);
  }, []);

  // Subtle slow rotation effect for the star map is now handled in CSS (.map-spin-animation)
  useEffect(() => {
    if (!isActive || !isLoaded || !window.Celestial) return;

    try {
      const mapEl = document.querySelector('#celestial-map svg');
      if (mapEl) {
        mapEl.classList.add('map-spin-animation');
      }
    } catch {
      // Silently ignore errors
    }
  }, [isActive, isLoaded]);

  // Deep Parallax Effect based on Mouse Movement
  useEffect(() => {
    if (!isActive) return;
    
    let rafId;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
    };
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      if (rafId) cancelAnimationFrame(rafId);
      
      const cx = e.clientX;
      const cy = e.clientY;

      rafId = requestAnimationFrame(() => {
        const x = (cx / w - 0.5) * 2; // -1 to 1
        const y = (cy / h - 0.5) * 2; // -1 to 1
        
        // Tilt the map slightly based on mouse (increased intensity)
        if (containerRef.current) {
           containerRef.current.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.08)`;
        }
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 8, ease: "easeInOut" }}
      className={`starmap-container ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Container for parallax tilt with slow, fluid momentum */}
      <div 
        ref={containerRef} 
        className="absolute-full" 
        style={{ transition: 'transform 1.5s cubic-bezier(0.1, 0.8, 0.2, 1)', transformOrigin: 'center center' }}
      >
        {/* The D3 Celestial map */}
        <div
          id="celestial-map"
          className="absolute-full"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Vignette darkening at edges */}
      <div className="starmap-vignette" />

      {/* Aurora shimmer at bottom */}
      <div className="starmap-aurora" />
    </motion.div>
  );
});

export default AccurateStarMap;