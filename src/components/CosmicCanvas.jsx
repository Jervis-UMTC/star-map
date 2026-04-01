import { useRef, useEffect, useCallback, memo } from 'react';

/**
 * CosmicCanvas — A custom HTML5 Canvas background renderer.
 * Renders multi-layer parallax starfield, animated nebula clouds,
 * shooting stars, and subtle cosmic dust. All GPU-friendly.
 */
const CosmicCanvas = memo(function CosmicCanvas({ intensity = 1 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const nebulaeRef = useRef([]);
  const timeRef = useRef(0);
  const spriteCacheRef = useRef({});
  const targetIntensityRef = useRef(intensity);
  const currentIntensityRef = useRef(intensity);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    targetIntensityRef.current = intensity;
  }, [intensity]);

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
        // Multi-frequency flicker
        freq1: Math.random() * 0.025 + 0.005,
        freq2: Math.random() * 0.06 + 0.02,
        freq3: Math.random() * 0.15 + 0.04,
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
        flickerIntensity: Math.random() * 0.3 + 0.15,
        flashThreshold: Math.random() * 0.15 + 0.88,
        layer: 0,
        parallaxStrength: 0.5,
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
        freq1: Math.random() * 0.03 + 0.008,
        freq2: Math.random() * 0.08 + 0.03,
        freq3: Math.random() * 0.2 + 0.06,
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
        flickerIntensity: Math.random() * 0.4 + 0.2,
        flashThreshold: Math.random() * 0.12 + 0.85,
        layer: 1,
        parallaxStrength: 2,
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
        freq1: Math.random() * 0.04 + 0.01,
        freq2: Math.random() * 0.1 + 0.04,
        freq3: Math.random() * 0.25 + 0.08,
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
        flickerIntensity: Math.random() * 0.5 + 0.25,
        flashThreshold: Math.random() * 0.1 + 0.82,
        layer: 2,
        parallaxStrength: 5,
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

  const drawStar = useCallback((ctx, star, time, currentInt) => {
    const wave1 = Math.sin(time * star.freq1 + star.phase1);
    const wave2 = Math.sin(time * star.freq2 + star.phase2) * 0.6;
    const wave3 = Math.sin(time * star.freq3 + star.phase3) * 0.3;
    const combined = (wave1 + wave2 + wave3) / 1.9;

    let flicker = 0.5 + 0.5 * combined * star.flickerIntensity;

    if (combined > star.flashThreshold) {
      flicker = Math.min(1.0, flicker + (combined - star.flashThreshold) * 4);
    }
    if (combined < -star.flashThreshold) {
      flicker = Math.max(0.08, flicker * 0.4);
    }

    const currentOpacity = star.opacity * flicker * currentInt;

    if (currentOpacity < 0.02) return;

    const mx = (mouseRef.current.x - 0.5) * star.parallaxStrength;
    const my = (mouseRef.current.y - 0.5) * star.parallaxStrength;
    const drawX = star.baseX + mx;
    const drawY = star.baseY + my;

    const glowMult = 1 + combined * 0.3 * star.flickerIntensity;
    const glowRadius = star.size * 3 * glowMult;

    // Direct state assignment instead of save/restore to improve perf in tight loop
    ctx.globalAlpha = currentOpacity;

    const sprite = spriteCacheRef.current[star.color];
    if (sprite) {
      const spriteSize = glowRadius * 2;
      ctx.drawImage(sprite, drawX - glowRadius, drawY - glowRadius, spriteSize, spriteSize);
    } else {
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(drawX, drawY, star.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (star.hasDiffraction && currentOpacity > 0.35) {
      const spikeLen = star.size * 6 * (0.6 + 0.4 * flicker);
      ctx.strokeStyle = star.color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = currentOpacity * 0.5;

      ctx.beginPath();
      ctx.moveTo(drawX, drawY - spikeLen);
      ctx.lineTo(drawX, drawY + spikeLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(drawX - spikeLen, drawY);
      ctx.lineTo(drawX + spikeLen, drawY);
      ctx.stroke();
    }
    
    // reset globalAlpha instead of restore
    ctx.globalAlpha = 1.0;
  }, []);

  const drawNebula = useCallback((ctx, nebula, time, width, height, currentInt) => {
    nebula.x += nebula.driftSpeedX;
    nebula.y += nebula.driftSpeedY;
    nebula.rotation += nebula.rotationSpeed;

    if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius;
    if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius;
    if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius;
    if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius;

    const breathe = Math.sin(time * 0.0008 + nebula.rotation) * 0.3 + 0.7;

    ctx.globalAlpha = nebula.opacity * breathe * currentInt;

    const { r, g, b } = nebula.color;
    const gradient = ctx.createRadialGradient(
      nebula.x, nebula.y, 0,
      nebula.x, nebula.y, nebula.radius
    );
    // Hardcoded string to avoid interpolation in loop
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.15)`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
  }, []);

  const drawShootingStar = useCallback((ctx, meteor) => {
    if (meteor.life <= 0) return;

    ctx.globalAlpha = meteor.life;

    const tailLength = meteor.isGolden ? meteor.length * 1.5 : meteor.length;
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
    ctx.lineWidth = meteor.isGolden ? meteor.width * 1.5 : meteor.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(meteor.x, meteor.y);
    ctx.stroke();

    const headRadius = meteor.isGolden ? 6 : 4;
    const headGradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, headRadius);
    headGradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.life})`);
    headGradient.addColorStop(0.5, meteor.color);
    headGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(meteor.x, meteor.y, headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanupFunc = null;

    // Delay init slightly to let loading screen paint
    const initTimeout = setTimeout(() => {
      if (!mounted) return;

      const colors = ['#e2e8f0', '#ffffff', '#dbeafe', '#c7d2fe', '#38bdf8', '#fcd34d'];
      const cache = {};
      const size = 64; 
      const center = size / 2;

      colors.forEach(color => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const oCtx = canvas.getContext('2d');
        const gradient = oCtx.createRadialGradient(center, center, 0, center, center, center);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, 'transparent');
        oCtx.fillStyle = gradient;
        oCtx.beginPath();
        oCtx.arc(center, center, center, 0, Math.PI * 2);
        oCtx.fill();
        oCtx.fillStyle = color;
        oCtx.beginPath();
        oCtx.arc(center, center, Math.max(1, center * 0.15), 0, Math.PI * 2);
        oCtx.fill();
        cache[color] = canvas;
      });

      spriteCacheRef.current = cache;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

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
        starsRef.current = generateStars(w, h);
        nebulaeRef.current = generateNebulae(w, h);
      };

      resize();
      window.addEventListener('resize', resize);

      const handleMouseMove = (e) => {
        const { w, h } = dimsRef.current;
        if (w === 0 || h === 0) return;
        targetMouseRef.current = {
          x: e.clientX / w,
          y: e.clientY / h,
        };
      };
      window.addEventListener('mousemove', handleMouseMove);

      let lastShootingStarTime = 0;
      const shootingStarInterval = () => Math.random() * 5000 + 3000;
      let nextShootingStarDelay = shootingStarInterval();

      const animate = (timestamp) => {
        timeRef.current = timestamp;
        const { w, h } = dimsRef.current;

        // Smooth mathematical lerping (glide) for background parallax
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

        currentIntensityRef.current += (targetIntensityRef.current - currentIntensityRef.current) * 0.015;
        const currentInt = currentIntensityRef.current;

        ctx.clearRect(0, 0, w, h);

        // Batch global composite operations
        ctx.globalCompositeOperation = 'screen';
        nebulaeRef.current.forEach(n => drawNebula(ctx, n, timestamp, w, h, currentInt));

        ctx.globalCompositeOperation = 'source-over'; // Default
        starsRef.current.forEach(s => drawStar(ctx, s, timestamp, currentInt));

        if (timestamp - lastShootingStarTime > nextShootingStarDelay) {
          shootingStarsRef.current.push(spawnShootingStar(w, h));
          lastShootingStarTime = timestamp;
          nextShootingStarDelay = shootingStarInterval();
        }

        ctx.globalCompositeOperation = 'source-over'; // just in case
        shootingStarsRef.current.forEach(m => {
          m.x += m.vx;
          m.y += m.vy;
          m.life -= m.decay;
          drawShootingStar(ctx, m);
        });

        shootingStarsRef.current = shootingStarsRef.current.filter(m => m.life > 0);

        animRef.current = requestAnimationFrame(animate);
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          if (animRef.current) cancelAnimationFrame(animRef.current);
        } else {
          lastShootingStarTime = performance.now(); // reset time to prevent burst
          animRef.current = requestAnimationFrame(animate);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      animRef.current = requestAnimationFrame(animate);

      cleanupFunc = () => {
        cancelAnimationFrame(animRef.current);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      if (cleanupFunc) cleanupFunc();
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