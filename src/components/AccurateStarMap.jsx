import { useEffect, useState, useRef, memo } from 'react';

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
          interactive: false,
          controls: false,
        };

        window.Celestial.display(config);
        window.Celestial.date(new Date("2005-04-01T00:00:00+08:00"));
        
        // Give D3 a moment to render the SVG, then inject twinkle animations via requestIdleCallback
        setTimeout(() => {
          setIsLoaded(true);
          if (onLoaded) onLoaded();
          
          const injectTwinkles = () => {
            const starPaths = Array.from(document.querySelectorAll('#celestial-map svg path:not([stroke])'));
            const linePaths = Array.from(document.querySelectorAll('#celestial-map svg path[stroke="#38bdf8"]'));
            const mwPaths = Array.from(document.querySelectorAll('#celestial-map svg path[fill="#0f172a"]'));
            
            let i = 0;
            const CHUNK_SIZE = 50;

            const processChunk = () => {
              const end = Math.min(i + CHUNK_SIZE, starPaths.length);
              
              for (; i < end; i++) {
                const path = starPaths[i];
                if (Math.random() < 0.15) {
                  const duration = Math.random() * 6 + 6; 
                  const delay = Math.random() * -10;
                  path.style.animation = `starTwinkle ${duration}s ease-in-out infinite alternate ${delay}s`;
                }
              }

              if (i < starPaths.length) {
                requestAnimationFrame(processChunk);
              } else {
                // Done with stars, apply classes to lines and milky way
                // These are much smaller sets so we can do them at once
                linePaths.forEach((path) => path.classList.add('constellation-line'));
                mwPaths.forEach((path) => path.classList.add('milky-way-path'));
              }
            };

            requestAnimationFrame(processChunk);
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
  }, [onLoaded]);

  // Deep Parallax Effect based on Mouse Movement
  useEffect(() => {
    if (!isActive) return;
    
    let rafId;
    let w = window.innerWidth;
    let h = window.innerHeight;
    
    // Store exact mouse target vs current smooth position
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let isParallaxActive = false;
    let parallaxTimeout;

    if (isActive) {
      // Unlock the 3D parallax ONLY after the fade-in completely finishes (5 seconds)
      parallaxTimeout = setTimeout(() => {
        isParallaxActive = true;
      }, 5000);
    }

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
    };
    
    const handleMouseMove = (e) => {
      if (!isParallaxActive) return; // Keep map perfectly centered while fading in
      targetX = (e.clientX / w - 0.5) * 2; // -1 to 1
      targetY = (e.clientY / h - 0.5) * 2; // -1 to 1
    };

    const renderLoop = () => {
      // Calculate fluid JS smoothing (lerp) toward mouse target
      const diffX = targetX - currentX;
      const diffY = targetY - currentY;
      
      if (Math.abs(diffX) > 0.001) currentX += diffX * 0.05;
      if (Math.abs(diffY) > 0.001) currentY += diffY * 0.05;
      
      if (containerRef.current) {
        containerRef.current.style.transform = `rotateX(${-currentY * 6}deg) rotateY(${currentX * 6}deg) scale(1.08)`;
      }
      
      rafId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Start continuous animation loop
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      clearTimeout(parallaxTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive]);

  return (
    <div
      style={{
        opacity: isActive ? 1 : 0,
        transition: 'opacity 5s ease-in-out',
        willChange: 'opacity'
      }}
      className="starmap-container pointer-events-none"
    >
      {/* Container for parallax tilt with slow, fluid momentum */}
      <div 
        ref={containerRef} 
        className="absolute-full" 
        style={{ 
          transformOrigin: 'center center'
          // removed will-change: transform to prevent blurry SVG rasterization ghosting
        }}
      >
        {/* The D3 Celestial map */}
        <div
          id="celestial-map"
          className="absolute-full"
        />
      </div>

      {/* Vignette darkening at edges */}
      <div className="starmap-vignette" />

      {/* Aurora shimmer at bottom */}
      <div className="starmap-aurora" />
    </div>
  );
});

export default AccurateStarMap;