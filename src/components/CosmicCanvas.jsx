import { useRef, useEffect, useCallback, memo } from 'react';

/**
 * CosmicCanvas — A custom HTML5 Canvas background renderer.
 * Renders multi-layer parallax starfield, animated nebula clouds,
 * shooting stars, and subtle cosmic dust. All GPU-friendly.
 */
const CosmicCanvas = memo(function CosmicCanvas({ intensity = 1 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const nebulaeRef = useRef([]);
  const timeRef = useRef(0);

  const generateStars = useCallback((width, height) => {
    const stars = [];

    // Layer 0 — deep background (tiny, dim, many)
    for (let i = 0; i < 600; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 1 + 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: 0,
        color: '#e2e8f0',
      });
    }

    // Layer 1 — mid range (moderate size, twinkle)
    const midColors = ['#ffffff', '#dbeafe', '#c7d2fe'];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 1.5 + 0.8,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: 1,
        color: midColors[Math.floor(Math.random() * midColors.length)],
      });
    }

    // Layer 2 — foreground bright stars (few, large, diffraction spikes)
    const brightColors = ['#ffffff', '#dbeafe', '#38bdf8'];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.4 + 0.5,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: 2,
        color: brightColors[Math.floor(Math.random() * brightColors.length)],
        hasDiffraction: Math.random() > 0.4,
      });
    }

    return stars;
  }, []);

  const generateNebulae = useCallback((width, height) => {
    const nebulae = [];
    const colors = [
      { r: 56, g: 189, b: 248 },   // cyan
      { r: 129, g: 140, b: 248 },   // indigo
    ];

    for (let i = 0; i < 3; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 200,
        color,
        opacity: Math.random() * 0.03 + 0.01,
        driftSpeedX: (Math.random() - 0.5) * 0.15,
        driftSpeedY: (Math.random() - 0.5) * 0.1,
        rotationSpeed: (Math.random() - 0.5) * 0.0005,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return nebulae;
  }, []);

  const spawnShootingStar = useCallback((width, height) => {
    const angle = Math.random() * 0.6 + 0.3; // ~20-50 degree angle
    const speed = Math.random() * 8 + 6;
    const startSide = Math.random();

    let x, y;
    if (startSide < 0.5) {
      x = Math.random() * width;
      y = -20;
    } else {
      x = -20;
      y = Math.random() * height * 0.5;
    }

    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: Math.random() * 0.008 + 0.006,
      length: Math.random() * 80 + 60,
      width: Math.random() * 1.5 + 0.8,
      color: Math.random() > 0.8 ? '#fcd34d' : (Math.random() > 0.3 ? '#ffffff' : '#38bdf8'), // Golden shooting stars added
      isGolden: Math.random() > 0.8 // Track if golden for special effects
    };
  }, []);

  const drawStar = useCallback((ctx, star, time) => {
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    const currentOpacity = star.opacity * (0.6 + 0.4 * twinkle) * intensity;

    if (currentOpacity < 0.02) return;

    // Parallax offset based on mouse
    const parallaxStrength = [0.5, 2, 5][star.layer];
    const mx = (mouseRef.current.x - 0.5) * parallaxStrength;
    const my = (mouseRef.current.y - 0.5) * parallaxStrength;
    const drawX = star.baseX + mx;
    const drawY = star.baseY + my;

    ctx.save();
    ctx.globalAlpha = currentOpacity;

    // Core glow
    const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, star.size * 3);
    gradient.addColorStop(0, star.color);
    gradient.addColorStop(0.4, star.color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(drawX, drawY, star.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Hard center dot
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, star.size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Diffraction spikes for bright stars
    if (star.hasDiffraction && currentOpacity > 0.4) {
      const spikeLen = star.size * 6 * (0.7 + 0.3 * twinkle);
      ctx.strokeStyle = star.color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = currentOpacity * 0.5;

      // Vertical spike
      ctx.beginPath();
      ctx.moveTo(drawX, drawY - spikeLen);
      ctx.lineTo(drawX, drawY + spikeLen);
      ctx.stroke();

      // Horizontal spike
      ctx.beginPath();
      ctx.moveTo(drawX - spikeLen, drawY);
      ctx.lineTo(drawX + spikeLen, drawY);
      ctx.stroke();
    }

    ctx.restore();
  }, [intensity]);

  const drawNebula = useCallback((ctx, nebula, time, width, height) => {
    nebula.x += nebula.driftSpeedX;
    nebula.y += nebula.driftSpeedY;
    nebula.rotation += nebula.rotationSpeed;

    // Wrap around
    if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius;
    if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius;
    if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius;
    if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius;

    const breathe = Math.sin(time * 0.0008 + nebula.rotation) * 0.3 + 0.7;

    ctx.save();
    ctx.globalAlpha = nebula.opacity * breathe * intensity;
    ctx.globalCompositeOperation = 'screen';

    const { r, g, b } = nebula.color;
    const gradient = ctx.createRadialGradient(
      nebula.x, nebula.y, 0,
      nebula.x, nebula.y, nebula.radius
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.15)`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [intensity]);

  const drawShootingStar = useCallback((ctx, meteor) => {
    if (meteor.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = meteor.life;

    // Trail
    const tailLength = meteor.isGolden ? meteor.length * 1.5 : meteor.length; // Golden tails are longer
    const tailX = meteor.x - (meteor.vx / Math.sqrt(meteor.vx ** 2 + meteor.vy ** 2)) * tailLength * meteor.life;
    const tailY = meteor.y - (meteor.vy / Math.sqrt(meteor.vx ** 2 + meteor.vy ** 2)) * tailLength * meteor.life;

    const gradient = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
    gradient.addColorStop(0, 'transparent');
    
    if (meteor.isGolden) {
      gradient.addColorStop(0.5, `rgba(252, 211, 77, ${0.4 * meteor.life})`);
    } else {
      gradient.addColorStop(0.6, `rgba(56, 189, 248, ${0.3 * meteor.life})`);
    }
    
    gradient.addColorStop(1, meteor.color);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = meteor.isGolden ? meteor.width * 1.5 : meteor.width; // Golden trails are thicker
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(meteor.x, meteor.y);
    ctx.stroke();

    // Head glow
    const headRadius = meteor.isGolden ? 6 : 4;
    const headGradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, headRadius);
    headGradient.addColorStop(0, 'rgba(255, 255, 255, ' + meteor.life + ')');
    headGradient.addColorStop(0.5, meteor.color);
    headGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(meteor.x, meteor.y, headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      starsRef.current = generateStars(window.innerWidth, window.innerHeight);
      nebulaeRef.current = generateNebulae(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let lastShootingStarTime = 0;
    const shootingStarInterval = () => Math.random() * 5000 + 3000;
    let nextShootingStarDelay = shootingStarInterval();

    const animate = (timestamp) => {
      timeRef.current = timestamp;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Draw nebulae (behind everything)
      nebulaeRef.current.forEach(n => drawNebula(ctx, n, timestamp, w, h));

      // Draw stars by layer
      starsRef.current.forEach(s => drawStar(ctx, s, timestamp));

      // Shooting stars
      if (timestamp - lastShootingStarTime > nextShootingStarDelay) {
        shootingStarsRef.current.push(spawnShootingStar(w, h));
        lastShootingStarTime = timestamp;
        nextShootingStarDelay = shootingStarInterval();
      }

      shootingStarsRef.current.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;
        m.life -= m.decay;
        drawShootingStar(ctx, m);
      });

      // Remove dead meteors
      shootingStarsRef.current = shootingStarsRef.current.filter(m => m.life > 0);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [generateStars, generateNebulae, spawnShootingStar, drawStar, drawNebula, drawShootingStar]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
});

export default CosmicCanvas;
