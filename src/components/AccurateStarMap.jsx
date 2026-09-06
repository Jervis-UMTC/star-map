import { useEffect, useRef, memo } from 'react';

/**
 * AccurateStarMap — Renders the authentic D3 Celestial star map for April 1, 2005 (Philippines sky).
 * Pure cinematic, living celestial experience:
 * - Dynamic diurnal celestial drift (continuous slow, majestic planetary turning)
 * - Shimmering starlight pulses running along constellation lines
 * - Multi-tier twinkling & radiant scintillation on real stars
 * - Fluid 3D mouse & touch parallax
 * - Pristine sky with zero clutter or acronyms
 */
const AccurateStarMap = memo(function AccurateStarMap({ isActive, onLoaded }) {
  const containerRef = useRef(null);
  const driftRef = useRef(0);

  // Initialize D3 Celestial
  useEffect(() => {
    if (!window.Celestial) {
      console.error("D3 Celestial library not loaded");
      return;
    }

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
            style: { fill: "#ffffff", opacity: 0.9 },
            designation: false,
            proper: false,
            properStyle: { fill: "rgba(0,0,0,0)", opacity: 0, font: ["0px sans-serif"] },
            size: 5.5,
          },

          dsos: { show: false, names: false },

          constellations: {
            show: true,
            names: false, // Pristine, romantic sky without abbreviations
            namesType: "iau",
            nameStyle: {
              fill: "rgba(0,0,0,0)",
              opacity: 0,
              font: ["0px sans-serif", "0px sans-serif", "0px sans-serif"],
            },
            lines: true,
            lineStyle: {
              stroke: "#38bdf8",
              width: 1.0,
              opacity: 0.6,
            },
            bounds: false,
          },

          mw: {
            show: true,
            style: { fill: "#0f172a", opacity: 0.3 },
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
        
        setTimeout(() => {
          if (onLoaded) onLoaded();
          
          const injectLivingStarEffects = () => {
            // Remove any SVG text nodes (constellation abbreviations, star names)
            document.querySelectorAll('#celestial-map text, #celestial-map tspan').forEach(t => t.remove());

            const starPaths = Array.from(document.querySelectorAll('#celestial-map svg path:not([stroke])'));
            const linePaths = Array.from(document.querySelectorAll('#celestial-map svg path[stroke], #celestial-map svg path[class*="const"]'));
            const mwPaths = Array.from(document.querySelectorAll('#celestial-map svg path[fill="#0f172a"], #celestial-map svg path[class*="mw"]'));
            
            // Multi-frequency twinkling on prominent stars using hardware-accelerated CSS classes
            const prominentStars = starPaths.slice(0, 180);
            prominentStars.forEach((path, idx) => {
              if (idx % 3 === 0) {
                path.classList.add('star-scintillate-active');
              } else if (idx % 2 === 0) {
                path.classList.add('star-twinkle-active');
              }
            });

            // Continuous breathing starlight pulses along constellation lines
            linePaths.forEach((path, idx) => {
              path.classList.add('constellation-line');
              path.classList.add('pulse-active');
              path.style.animationDelay = `${(idx % 10) * 0.4}s`;
            });

            // Milky Way subtle atmospheric glow
            mwPaths.forEach((path) => path.classList.add('milky-way-path'));
          };

          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(injectLivingStarEffects);
          } else {
            setTimeout(injectLivingStarEffects, 100);
          }
        }, 500);

      } catch (err) {
        console.error("Celestial init error:", err);
      }
    }, 150);

    return () => clearTimeout(initTimer);
  }, [onLoaded]);

  // Living Diurnal Celestial Drift + Smooth 3D Parallax
  useEffect(() => {
    if (!isActive) return;
    
    let rafId;
    let w = window.innerWidth;
    let h = window.innerHeight;
    
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let lastTimestamp = performance.now();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
    };
    
    let isTouchDevice = false;
    
    const handleMouseMove = (e) => {
      if (isTouchDevice) return; 
      targetX = (e.clientX / w - 0.5) * 2;
      targetY = (e.clientY / h - 0.5) * 2;
    };

    const handleTouchStart = () => {
      isTouchDevice = true;
    };

    const renderLoop = (timestamp) => {
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      // Diurnal celestial rotation — Earth turning beneath the April 1, 2005 sky
      driftRef.current += delta * 1.5;

      if (isTouchDevice) {
        const time = timestamp * 0.0005;
        targetX = Math.sin(time) * 0.4;
        targetY = Math.cos(time * 0.7) * 0.3;
      }
      
      const diffX = targetX - currentX;
      const diffY = targetY - currentY;
      
      if (Math.abs(diffX) > 0.0005) currentX += diffX * 0.06;
      if (Math.abs(diffY) > 0.0005) currentY += diffY * 0.06;
      
      // Majestic continuous slow panning and swaying
      const panX = Math.sin(driftRef.current * 0.07) * 35;
      const panY = Math.cos(driftRef.current * 0.04) * 14;

      if (containerRef.current) {
        containerRef.current.style.transform = `
          translate3d(${panX.toFixed(2)}px, ${panY.toFixed(2)}px, 0)
          rotateX(${(-currentY * 5).toFixed(2)}deg)
          rotateY(${(currentX * 5).toFixed(2)}deg)
          scale(1.09)
        `;
      }
      
      rafId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive]);

  return (
    <div
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'scale(1)' : 'scale(1.1)',
        transition: 'opacity 4.5s cubic-bezier(0.16, 1, 0.3, 1), transform 5.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
      className="starmap-container pointer-events-none"
    >
      {/* 3D Parallax & Diurnal Celestial Drift */}
      <div 
        ref={containerRef} 
        className="absolute-full" 
        style={{ 
          transformOrigin: 'center center',
          transition: 'filter 0.5s ease',
        }}
      >
        {/* The D3 Celestial map */}
        <div
          id="celestial-map"
          className="absolute-full"
        />
      </div>

      {/* Cinematic Vignette */}
      <div className="starmap-vignette" />

      {/* Radiant Horizon Aurora */}
      <div className="starmap-aurora" />

      {/* Soft Celestial Glow */}
      <div className="celestial-grid-glow" />
    </div>
  );
});

export default AccurateStarMap;