import { useEffect, useRef, useCallback } from 'react';

/**
 * DissolutionEffect — Renders 150+ luminous particles that burst
 * outward from the center (where the envelope was), then drift
 * upward and fade out like ascending souls.
 *
 * Uses a lightweight Canvas for smooth 60fps animation.
 * Calls `onComplete` when all particles have faded.
 */
export default function DissolutionEffect({ onComplete }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const createParticles = useCallback((cx, cy) => {
    const particles = [];
    const count = 160;
    const colors = [
      '#ffffff',
      '#dbeafe',
      '#38bdf8',
      '#818cf8',
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      const size = Math.random() * 3 + 1;

      particles.push({
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 140,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.006 + 0.003,
        gravity: -0.02 - Math.random() * 0.03, // floats upward
        drag: 0.98,
        wobbleSpeed: Math.random() * 0.1 + 0.02,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleAmp: Math.random() * 0.5 + 0.2,
      });
    }

    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const particles = createParticles(cx, cy);
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, w, h);

      let aliveCount = 0;

      particles.forEach((p) => {
        if (p.life <= 0) return;
        aliveCount++;

        // Physics
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.vx += Math.sin(elapsed * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * 0.1;

        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) return;

        // Draw
        ctx.save();
        ctx.globalAlpha = p.life * p.life; // ease-out fade

        // Outer glow
        const glowRadius = p.size * 4 * p.life;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, p.color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Hard core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4 * p.life, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Render Central Flash (Burst)
      if (elapsed < 500) {
        const flashLife = 1 - (elapsed / 500);
        ctx.save();
        ctx.globalAlpha = flashLife * 0.8;
        ctx.globalCompositeOperation = 'screen';
        
        const flashRadius = 300 + (elapsed * 0.5);
        const flashGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashRadius);
        flashGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        flashGradient.addColorStop(0.2, 'rgba(56, 189, 248, 0.8)');
        flashGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = flashGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, flashRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (aliveCount > 0 && elapsed < 6000) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    // Small delay before starting dissolution
    const timeout = setTimeout(() => {
      animRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animRef.current);
    };
  }, [createParticles, onComplete]);

  return (
    <div className="dissolution-container">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
