import { useEffect, useRef, memo } from 'react';

const palette = [
  { r: 255, g: 255, b: 255 }, // Pure white
  { r: 255, g: 250, b: 235 }, // Champagne
  { r: 252, g: 211, b: 77 },  // Gold
  { r: 56, g: 189, b: 248 },  // Cyan / Sky Blue
  { r: 129, g: 140, b: 248 }, // Indigo / Light Purple
];

const StardustCursor = memo(function StardustCursor({ isPaused }) {
  const canvasRef = useRef(null);
  const isPausedRef = useRef(isPaused);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const lastMouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef(null);
  const dimsRef = useRef({ w: 0, h: 0 });

  // Keep ref in sync so animation loop always has latest value without restarting the effect
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dimsRef.current = { w, h };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      if (isPausedRef.current) return; // Ignore movement when paused

      lastMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Spawn stardust particles
      const dx = mouseRef.current.x - lastMouseRef.current.x;
      const dy = mouseRef.current.y - lastMouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const numParticles = Math.min(Math.floor(dist / 5) + 1, 8);

      for (let i = 0; i < numParticles; i++) {
        const mx = lastMouseRef.current.x + (dx * i) / numParticles;
        const my = lastMouseRef.current.y + (dy * i) / numParticles;
        
        // Stardust that gently floats up
        const color = palette[Math.floor(Math.random() * palette.length)];
        
        particlesRef.current.push({
          x: mx + (Math.random() - 0.5) * 15,
          y: my + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 0.5, // gentle horizontal drift
          vy: -(Math.random() * 1.5 + 0.5), // strictly floats UP
          life: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 1.5 + 0.5,
          r: color.r,
          g: color.g,
          b: color.b,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // If paused AND all particles have died out, we can skip rendering completely to save CPU/GPU
      if (isPausedRef.current && particlesRef.current.length === 0) {
        ctx.clearRect(0, 0, dimsRef.current.w, dimsRef.current.h);
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';

      // Render Stardust Motes
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const opacity = p.life;
        const colorStr = `rgba(${p.r}, ${p.g}, ${p.b}, ${opacity})`;
        
        // Solid core of the particle
        ctx.fillStyle = colorStr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft dreamy glow around the particle
        const glowSize = p.size * 4;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render very subtle, responsive core glow (Halo)
      if (!isPausedRef.current && mouseRef.current.x !== -1000) {
        const time = Date.now();
        const breathe = Math.sin(time * 0.002) * 0.1 + 0.9;
        const coreRadius = 35 * breathe;
        
        const pointerGlow = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0, 
          mouseRef.current.x, mouseRef.current.y, coreRadius
        );
        pointerGlow.addColorStop(0, 'rgba(255, 245, 230, 0.15)');
        pointerGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
        pointerGlow.addColorStop(1, 'transparent');
        
        ctx.fillStyle = pointerGlow;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      animRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animRef.current) cancelAnimationFrame(animRef.current);
      } else {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
});

export default StardustCursor;
