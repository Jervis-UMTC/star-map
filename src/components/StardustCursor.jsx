import { useEffect, useRef, memo } from 'react';

const palette = [
  { r: 255, g: 255, b: 255 }, // Pure white
  { r: 255, g: 250, b: 235 }, // Champagne
  { r: 252, g: 211, b: 77 },  // Gold
  { r: 56, g: 189, b: 248 },  // Cyan / Sky Blue
  { r: 129, g: 140, b: 248 }, // Indigo / Light Purple
];

// Pre-rendered offscreen GPU sprites for each cursor color
const GLOW_SPRITES = typeof document !== 'undefined' ? palette.map(color => {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 48;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(24, 24, 0, 24, 24, 24);
  g.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.7)`);
  g.addColorStop(0.35, `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(24, 24, 24, 0, Math.PI * 2);
  ctx.fill();
  return c;
}) : [];

// Pre-rendered offscreen pointer halo sprite
const HALO_SPRITE = typeof document !== 'undefined' ? (() => {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 96;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
  g.addColorStop(0, 'rgba(255, 245, 230, 0.22)');
  g.addColorStop(0.45, 'rgba(255, 255, 255, 0.08)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(48, 48, 48, 0, Math.PI * 2);
  ctx.fill();
  return c;
})() : null;

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
      if (isPausedRef.current) return;

      lastMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const dx = mouseRef.current.x - lastMouseRef.current.x;
      const dy = mouseRef.current.y - lastMouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const numParticles = Math.min(Math.floor(dist / 5) + 1, 8);

      for (let i = 0; i < numParticles; i++) {
        const mx = lastMouseRef.current.x + (dx * i) / numParticles;
        const my = lastMouseRef.current.y + (dy * i) / numParticles;
        const colorIdx = Math.floor(Math.random() * palette.length);
        
        particlesRef.current.push({
          x: mx + (Math.random() - 0.5) * 15,
          y: my + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(Math.random() * 1.5 + 0.5),
          life: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 1.5 + 0.5,
          colorIdx,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (isPausedRef.current && particlesRef.current.length === 0) {
        ctx.clearRect(0, 0, dimsRef.current.w, dimsRef.current.h);
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';

      // Render Stardust Motes via GPU Sprite Blits
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          // O(1) swap-pop removal
          particlesRef.current[i] = particlesRef.current[particlesRef.current.length - 1];
          particlesRef.current.pop();
          continue;
        }

        ctx.globalAlpha = p.life;
        
        // Draw cached glow sprite (instant GPU blit, zero radial gradient calculation!)
        const glowSize = p.size * 4;
        const sprite = GLOW_SPRITES[p.colorIdx];
        if (sprite) {
          ctx.drawImage(sprite, p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);
        }

        // Solid core speck
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Pointer Halo via cached sprite
      if (!isPausedRef.current && mouseRef.current.x !== -1000 && HALO_SPRITE) {
        const time = Date.now();
        const breathe = Math.sin(time * 0.002) * 0.1 + 0.9;
        const coreRadius = 35 * breathe;
        ctx.globalAlpha = breathe * 0.8;
        ctx.drawImage(
          HALO_SPRITE,
          mouseRef.current.x - coreRadius,
          mouseRef.current.y - coreRadius,
          coreRadius * 2,
          coreRadius * 2
        );
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
