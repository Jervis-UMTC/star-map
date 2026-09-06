import { useRef, useEffect, useCallback, memo } from 'react';

/**
 * CosmicCanvas — Advanced HTML5 Canvas cosmos renderer (Crazily Optimized):
 * - Multi-tier parallax stellar drift (Layer 0 single-trig fast path, Layer 1 & 2 multi-harmonic)
 * - GPU offscreen sprite-cached volumetric nebulae (Zero radial gradient calculation per frame)
 * - Zero-allocation cached styles for floating stardust motes
 * - Sprite-cached star scintillations with optical diffraction
 * - Fluid shooting stars with ion wakes
 */

const STARDUST_COLORS = [
  '56, 189, 248',
  '252, 211, 77',
  '192, 132, 252',
  '255, 255, 255',
  '251, 146, 60',
];

const STARDUST_STYLE_CACHE = STARDUST_COLORS.map((col) => {
  const table = [];
  for (let i = 0; i <= 20; i++) {
    table.push(`rgba(${col}, ${(i / 20).toFixed(2)})`);
  }
  return table;
});

const CosmicCanvas = memo(function CosmicCanvas({ intensity = 1, speedMultiplier = 1 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const targetMouseRef = useRef({ x: 0.5, y: 0.5, px: 0, py: 0 });
  const mouseRef = useRef({ x: 0.5, y: 0.5, px: 0, py: 0 });
  const starsRef = useRef([]);
  const stardustRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const nebulaeRef = useRef([]);
  const timeRef = useRef(0);
  const spriteCacheRef = useRef({});
  const targetIntensityRef = useRef(intensity);
  const currentIntensityRef = useRef(intensity);
  const speedMultRef = useRef(speedMultiplier);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    targetIntensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    speedMultRef.current = speedMultiplier;
  }, [speedMultiplier]);

  const generateStars = useCallback((width, height) => {
    const stars = [];

    // Layer 0 — Deep background cosmos (850 stars: microscopic, dim, majestic slow drift)
    for (let i = 0; i < 850; i++) {
      const vx = (Math.random() * 0.08 + 0.02) * (Math.random() > 0.3 ? 1 : -0.5);
      const vy = (Math.random() * 0.04 - 0.02);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        size: Math.random() * 1.0 + 0.3,
        opacity: Math.random() * 0.5 + 0.15,
        freq1: Math.random() * 0.025 + 0.005,
        freq2: Math.random() * 0.06 + 0.02,
        freq3: Math.random() * 0.15 + 0.04,
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
        flickerIntensity: Math.random() * 0.35 + 0.15,
        flashThreshold: Math.random() * 0.15 + 0.88,
        layer: 0,
        parallaxStrength: 0.35,
        color: '#e2e8f0',
      });
    }

    // Layer 1 — Mid-depth stellar field (320 stars: moderate size, rich colors, steady drift)
    const midColors = ['#ffffff', '#dbeafe', '#c7d2fe', '#bae6fd', '#fef08a', '#fbcfe8'];
    for (let i = 0; i < 320; i++) {
      const vx = (Math.random() * 0.15 + 0.05);
      const vy = (Math.random() * 0.06 - 0.03);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        size: Math.random() * 1.6 + 0.7,
        opacity: Math.random() * 0.55 + 0.35,
        freq1: Math.random() * 0.03 + 0.008,
        freq2: Math.random() * 0.08 + 0.03,
        freq3: Math.random() * 0.2 + 0.06,
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
        flickerIntensity: Math.random() * 0.45 + 0.2,
        flashThreshold: Math.random() * 0.12 + 0.84,
        layer: 1,
        parallaxStrength: 1.6,
        color: midColors[Math.floor(Math.random() * midColors.length)],
      });
    }

    // Layer 2 — Foreground radiant stellar beacons (75 stars: prominent diffraction, optical halos)
    const brightColors = ['#ffffff', '#e0f2fe', '#38bdf8', '#fcd34d', '#c084fc', '#fda4af'];
    for (let i = 0; i < 75; i++) {
      const vx = (Math.random() * 0.22 + 0.08);
      const vy = (Math.random() * 0.08 - 0.04);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        size: Math.random() * 2.2 + 1.5,
        opacity: Math.random() * 0.4 + 0.6,
        freq1: Math.random() * 0.04 + 0.01,
        freq2: Math.random() * 0.1 + 0.04,
        freq3: Math.random() * 0.25 + 0.08,
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
        flickerIntensity: Math.random() * 0.55 + 0.3,
        flashThreshold: Math.random() * 0.1 + 0.8,
        layer: 2,
        parallaxStrength: 4.2,
        color: brightColors[Math.floor(Math.random() * brightColors.length)],
        hasDiffraction: Math.random() > 0.3,
      });
    }

    return stars;
  }, []);

  // Floating stardust motes with interactive gravitational deflection
  const generateStardust = useCallback((width, height) => {
    const dust = [];
    for (let i = 0; i < 150; i++) {
      dust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.22 - 0.08,
        baseSize: Math.random() * 1.8 + 0.5,
        colorIdx: Math.floor(Math.random() * STARDUST_COLORS.length),
        alpha: Math.random() * 0.55 + 0.25,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    return dust;
  }, []);

  // Multi-spectral volumetric nebulae with pre-rendered GPU sprite textures
  const generateNebulae = useCallback((width, height) => {
    const nebulae = [];
    const palettes = [
      { r: 56, g: 189, b: 248 },   // neon cyan
      { r: 99, g: 102, b: 241 },   // astral indigo
      { r: 168, g: 85, b: 247 },   // ethereal purple
      { r: 251, g: 191, b: 36 },   // warm starlight gold
      { r: 14, g: 165, b: 233 },   // deep sapphire
      { r: 244, g: 114, b: 182 },  // cosmic rose
      { r: 59, g: 130, b: 246 },   // electric blue
    ];

    for (let i = 0; i < 7; i++) {
      const color = palettes[i % palettes.length];
      const radius = Math.random() * 340 + 260;
      const { r, g, b } = color;

      // Pre-render offscreen GPU sprite (256x256) once at init
      const sprite = document.createElement('canvas');
      sprite.width = 256;
      sprite.height = 256;
      const sCtx = sprite.getContext('2d');
      const grad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
      grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.18)`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.05)`);
      grad.addColorStop(1, 'transparent');
      sCtx.fillStyle = grad;
      sCtx.beginPath();
      sCtx.arc(128, 128, 128, 0, Math.PI * 2);
      sCtx.fill();

      nebulae.push({
        x: (i / 7) * width + (Math.random() - 0.5) * (width * 0.25),
        y: Math.random() * height,
        radius,
        sprite,
        color,
        opacity: Math.random() * 0.045 + 0.02,
        driftSpeedX: (Math.random() - 0.5) * 0.18,
        driftSpeedY: (Math.random() - 0.5) * 0.14,
        rotationSpeed: (Math.random() - 0.5) * 0.0005,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return nebulae;
  }, []);

  const spawnShootingStar = useCallback((width, height) => {
    const angle = Math.random() * 0.55 + 0.35;
    const speed = Math.random() * 10 + 8;
    const startSide = Math.random();

    let x, y;
    if (startSide < 0.5) {
      x = Math.random() * width;
      y = -20;
    } else {
      x = -20;
      y = Math.random() * height * 0.6;
    }

    const typeRoll = Math.random();
    let color = '#ffffff';
    let isGolden = false;
    if (typeRoll > 0.7) {
      color = '#fcd34d'; // golden meteor
      isGolden = true;
    } else if (typeRoll > 0.4) {
      color = '#38bdf8'; // cyan comet
    } else if (typeRoll > 0.2) {
      color = '#c084fc'; // astral amethyst
    }

    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: Math.random() * 0.009 + 0.005,
      length: Math.random() * 110 + 80,
      width: Math.random() * 1.9 + 1.1,
      color,
      isGolden,
    };
  }, []);

  const drawStar = useCallback((ctx, star, time, currentInt, mx, my) => {
    let combined;
    if (star.layer === 0) {
      // High-performance single wave for 850 deep background stars
      combined = Math.sin(time * star.freq1 + star.phase1);
    } else {
      // Multi-harmonic interference for prominent foreground beacons
      const wave1 = Math.sin(time * star.freq1 + star.phase1);
      const wave2 = Math.sin(time * star.freq2 + star.phase2) * 0.6;
      const wave3 = Math.sin(time * star.freq3 + star.phase3) * 0.3;
      combined = (wave1 + wave2 + wave3) / 1.9;
    }

    let flicker = 0.5 + 0.5 * combined * star.flickerIntensity;
    if (combined > star.flashThreshold) {
      flicker = Math.min(1.0, flicker + (combined - star.flashThreshold) * 4.5);
    }
    if (combined < -star.flashThreshold) {
      flicker = Math.max(0.06, flicker * 0.35);
    }

    const currentOpacity = star.opacity * flicker * currentInt;
    if (currentOpacity < 0.02) return;

    const drawX = star.x + mx * star.parallaxStrength;
    const drawY = star.y + my * star.parallaxStrength;

    const glowMult = 1 + combined * 0.35 * star.flickerIntensity;
    const glowRadius = star.size * 3.2 * glowMult;

    ctx.globalAlpha = currentOpacity;

    const sprite = spriteCacheRef.current[star.color];
    if (sprite) {
      const spriteSize = glowRadius * 2;
      ctx.drawImage(sprite, drawX - glowRadius, drawY - glowRadius, spriteSize, spriteSize);
    } else {
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(drawX, drawY, star.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    if (star.hasDiffraction && currentOpacity > 0.3) {
      const spikeLen = star.size * 7 * (0.65 + 0.35 * flicker);
      ctx.strokeStyle = star.color;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = currentOpacity * 0.6;

      ctx.beginPath();
      ctx.moveTo(drawX, drawY - spikeLen);
      ctx.lineTo(drawX, drawY + spikeLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(drawX - spikeLen, drawY);
      ctx.lineTo(drawX + spikeLen, drawY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }, []);

  const drawStardust = useCallback((ctx, p, time, currentInt, mousePx, mousePy) => {
    // Gravitational lens / cursor deflection
    const dx = mousePx - p.x;
    const dy = mousePy - p.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < 40000 && distSq > 1) {
      const dist = Math.sqrt(distSq);
      const force = (1 - dist / 200) * 0.45;
      p.x += (dx / dist) * force * 0.6 - (dy / dist) * force * 0.8;
      p.y += (dy / dist) * force * 0.6 + (dx / dist) * force * 0.8;
    }

    const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.35 + 0.65;
    const alpha = p.alpha * pulse * currentInt;
    if (alpha <= 0.01) return;

    // Zero string allocation lookup
    const aIdx = Math.min(20, Math.max(0, (alpha * 20) | 0));
    ctx.fillStyle = STARDUST_STYLE_CACHE[p.colorIdx][aIdx];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.baseSize * (0.8 + 0.4 * pulse), 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawNebula = useCallback((ctx, nebula, time, width, height, currentInt) => {
    nebula.x += nebula.driftSpeedX * speedMultRef.current;
    nebula.y += nebula.driftSpeedY * speedMultRef.current;
    nebula.rotation += nebula.rotationSpeed * speedMultRef.current;

    if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius;
    if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius;
    if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius;
    if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius;

    const breathe = Math.sin(time * 0.0007 + nebula.rotation) * 0.35 + 0.75;
    ctx.globalAlpha = nebula.opacity * breathe * currentInt;

    // Blazing-fast GPU textured quad draw (zero radial gradient calculation per frame!)
    const size = nebula.radius * 2;
    ctx.drawImage(nebula.sprite, nebula.x - nebula.radius, nebula.y - nebula.radius, size, size);
    ctx.globalAlpha = 1.0;
  }, []);

  const drawShootingStar = useCallback((ctx, meteor) => {
    if (meteor.life <= 0) return;
    ctx.globalAlpha = meteor.life;

    const tailLength = meteor.isGolden ? meteor.length * 1.4 : meteor.length;
    const norm = Math.sqrt(meteor.vx ** 2 + meteor.vy ** 2) || 1;
    const tailX = meteor.x - (meteor.vx / norm) * tailLength * meteor.life;
    const tailY = meteor.y - (meteor.vy / norm) * tailLength * meteor.life;

    const gradient = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
    gradient.addColorStop(0, 'transparent');
    if (meteor.isGolden) {
      gradient.addColorStop(0.5, `rgba(252, 211, 77, ${0.45 * meteor.life})`);
    } else {
      gradient.addColorStop(0.6, `rgba(56, 189, 248, ${0.35 * meteor.life})`);
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
    headGradient.addColorStop(0.45, meteor.color);
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

    const initTimeout = setTimeout(() => {
      if (!mounted) return;

      const colors = ['#e2e8f0', '#ffffff', '#dbeafe', '#c7d2fe', '#bae6fd', '#38bdf8', '#fcd34d', '#c084fc', '#fef08a', '#e0f2fe'];
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
        stardustRef.current = generateStardust(w, h);
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
          px: e.clientX,
          py: e.clientY,
        };
      };
      window.addEventListener('mousemove', handleMouseMove);

      let lastShootingStarTime = 0;
      const shootingStarInterval = () => Math.random() * 2600 + 1400;
      let nextShootingStarDelay = shootingStarInterval();

      const animate = (timestamp) => {
        timeRef.current = timestamp;
        const { w, h } = dimsRef.current;

        // Smooth mathematical lerp for mouse parallax & coordinates
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;
        mouseRef.current.px += (targetMouseRef.current.px - mouseRef.current.px) * 0.1;
        mouseRef.current.py += (targetMouseRef.current.py - mouseRef.current.py) * 0.1;

        currentIntensityRef.current += (targetIntensityRef.current - currentIntensityRef.current) * 0.02;
        const currentInt = currentIntensityRef.current;
        const speedMult = speedMultRef.current;

        ctx.clearRect(0, 0, w, h);

        // 1. Drifting Volumetric Nebulae (Additive Screen blending)
        ctx.globalCompositeOperation = 'screen';
        nebulaeRef.current.forEach(n => drawNebula(ctx, n, timestamp, w, h, currentInt));

        // 2. Drifting Multi-layer Starfield
        ctx.globalCompositeOperation = 'source-over';
        const mx = (mouseRef.current.x - 0.5);
        const my = (mouseRef.current.y - 0.5);

        starsRef.current.forEach(s => {
          s.x += s.vx * speedMult;
          s.y += s.vy * speedMult;

          if (s.x > w + 20) s.x = -20;
          else if (s.x < -20) s.x = w + 20;
          if (s.y > h + 20) s.y = -20;
          else if (s.y < -20) s.y = h + 20;

          drawStar(ctx, s, timestamp, currentInt, mx, my);
        });

        // 3. Interactive Floating Stardust Motes
        ctx.globalCompositeOperation = 'screen';
        stardustRef.current.forEach(p => {
          p.x += p.vx * speedMult;
          p.y += p.vy * speedMult;
          if (p.x > w + 10) p.x = -10;
          else if (p.x < -10) p.x = w + 10;
          if (p.y > h + 10) p.y = -10;
          else if (p.y < -10) p.y = h + 10;

          drawStardust(ctx, p, timestamp, currentInt, mouseRef.current.px, mouseRef.current.py);
        });

        // 4. Shooting Stars
        if (timestamp - lastShootingStarTime > nextShootingStarDelay) {
          shootingStarsRef.current.push(spawnShootingStar(w, h));
          lastShootingStarTime = timestamp;
          nextShootingStarDelay = shootingStarInterval();
        }

        ctx.globalCompositeOperation = 'screen';
        shootingStarsRef.current.forEach(m => {
          m.x += m.vx * speedMult;
          m.y += m.vy * speedMult;
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
          lastShootingStarTime = performance.now();
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
  }, [generateStars, generateStardust, generateNebulae, spawnShootingStar, drawStar, drawStardust, drawNebula, drawShootingStar]);

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