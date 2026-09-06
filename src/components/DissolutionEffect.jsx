import { useEffect, useRef } from 'react';

// ============================================================================
// ULTRA-HIGH PERFORMANCE ZERO-ALLOCATION PRE-CACHED PARTICLE ENGINE
// ============================================================================

const PALETTE_COLORS = [
  '252, 211, 77',   // 0: Gold
  '254, 240, 138',  // 1: Bright Gold
  '255, 255, 255',  // 2: Diamond White
  '56, 189, 248',   // 3: Cyan
  '14, 165, 233',   // 4: Sapphire
  '216, 180, 254',  // 5: Lilac / Soft Purple
  '251, 191, 36',   // 6: Amber
  '254, 205, 211',  // 7: Rose
  '165, 180, 252',  // 8: Astral Indigo
];

const NUM_COLORS = PALETTE_COLORS.length;
const ALPHA_STEPS = 16; // 16 quantized alpha levels: 0.06 to 1.0

// Pre-allocate style cache: exactly NUM_COLORS * ALPHA_STEPS string constants
const STYLE_CACHE = new Array(NUM_COLORS * ALPHA_STEPS);
for (let c = 0; c < NUM_COLORS; c++) {
  for (let a = 0; a < ALPHA_STEPS; a++) {
    const alphaVal = ((a + 1) / ALPHA_STEPS).toFixed(2);
    STYLE_CACHE[c * ALPHA_STEPS + a] = `rgba(${PALETTE_COLORS[c]}, ${alphaVal})`;
  }
}

// Pre-allocated flat bucket list to prevent array allocation in animation loop
const BUCKET_COUNT = NUM_COLORS * ALPHA_STEPS;
const particleBuckets = new Array(BUCKET_COUNT);
for (let i = 0; i < BUCKET_COUNT; i++) {
  particleBuckets[i] = [];
}

const streakBuckets = new Array(BUCKET_COUNT);
for (let i = 0; i < BUCKET_COUNT; i++) {
  streakBuckets[i] = [];
}

/**
 * DissolutionEffect — Ultra-Optimized Grand Celestial Stardust Genesis:
 *
 * - Zero String Allocations per frame (all styles pre-cached)
 * - Path-Batched Draw Calls (combines 7,400 individual draw calls into batched fills/strokes)
 * - Exact same visual richness, particle density (3,800 envelope + 3,600 scatter), and cosmic flow
 */
export default function DissolutionEffect({ onComplete, envelopeRect }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

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

    const envW = envelopeRect ? envelopeRect.width : (w >= 768 ? 440 : 350);
    const envH = envelopeRect ? envelopeRect.height : (w >= 768 ? 300 : 250);
    const envCX = envelopeRect ? envelopeRect.left + envW / 2 : cx;
    const envCY = envelopeRect ? envelopeRect.top + envH / 2 : cy;

    const vortexX = envCX;
    const vortexY = envCY;

    // Timeline phases (ms)
    const VORTEX_START = 1300;
    const VORTEX_PEAK = 4300;
    const SCATTER_START = 4500;
    const TOTAL_DURATION = 9200;

    const envelopeDust = [];
    const scatterDust = [];
    let startTime = null;
    let scatterInitialized = false;

    // Helper to get pre-cached style index
    function getStyleIndex(colorIdx, alpha) {
      const aIdx = Math.min(ALPHA_STEPS - 1, Math.max(0, (alpha * ALPHA_STEPS) | 0));
      return colorIdx * ALPHA_STEPS + aIdx;
    }

    // 1. Generate Envelope Stardust (3,800+ micro-particles)
    function generateEnvelopeDust() {
      const paletteIndices = [0, 1, 2, 3, 2, 4, 8, 5, 0];

      function addSegment(x1, y1, x2, y2, count, jitter = 3) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        for (let i = 0; i < count; i++) {
          const t = i / count;
          const jx = (Math.random() - 0.5) * jitter;
          const jy = (Math.random() - 0.5) * jitter;
          const px = x1 + dx * t + jx;
          const py = y1 + dy * t + jy;
          const colorIdx = paletteIndices[Math.floor(Math.random() * paletteIndices.length)];

          const armIndex = Math.floor(Math.random() * 5);
          const armAngleOffset = (armIndex * (Math.PI * 2 / 5)) + (Math.random() - 0.5) * 0.4;

          envelopeDust.push({
            x: px,
            y: py,
            prevX: px,
            prevY: py,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25 - 0.05,
            size: Math.random() * 0.95 + 0.4,
            colorIdx,
            baseAlpha: Math.random() * 0.45 + 0.55,
            twinkleSpeed: Math.random() * 0.012 + 0.004,
            twinklePhase: Math.random() * Math.PI * 2,
            armAngleOffset,
            spiralInertia: Math.random() * 0.4 + 0.8,
            absorbed: false,
          });
        }
      }

      const tl_x = envCX - envW / 2, tl_y = envCY - envH / 2;
      const tr_x = envCX + envW / 2, tr_y = envCY - envH / 2;
      const bl_x = envCX - envW / 2, bl_y = envCY + envH / 2;
      const br_x = envCX + envW / 2, br_y = envCY + envH / 2;

      // Outer perimeter borders
      addSegment(tl_x, tl_y, tr_x, tr_y, 350, 4);
      addSegment(tr_x, tr_y, br_x, br_y, 280, 4);
      addSegment(br_x, br_y, bl_x, bl_y, 350, 4);
      addSegment(bl_x, bl_y, tl_x, tl_y, 280, 4);

      // Flaps and folds
      addSegment(tl_x, tl_y, envCX, envCY + 18, 220, 3);
      addSegment(tr_x, tr_y, envCX, envCY + 18, 220, 3);
      addSegment(bl_x, bl_y, envCX, envCY - 22, 190, 3);
      addSegment(br_x, br_y, envCX, envCY - 22, 190, 3);

      // Wax seal sparkling cluster
      for (let i = 0; i < 320; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.6) * 32;
        const col = Math.random() > 0.4 ? 0 : (Math.random() > 0.5 ? 1 : 2);
        const armIndex = Math.floor(Math.random() * 5);
        envelopeDust.push({
          x: envCX + Math.cos(angle) * r,
          y: envCY + Math.sin(angle) * r,
          prevX: envCX,
          prevY: envCY,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.1 + 0.5,
          colorIdx: col,
          baseAlpha: Math.random() * 0.5 + 0.5,
          twinkleSpeed: Math.random() * 0.015 + 0.006,
          twinklePhase: Math.random() * Math.PI * 2,
          armAngleOffset: (armIndex * (Math.PI * 2 / 5)) + (Math.random() - 0.5) * 0.3,
          spiralInertia: Math.random() * 0.4 + 0.8,
          absorbed: false,
        });
      }

      // Interior letter field
      for (let i = 0; i < 1400; i++) {
        const rx = envCX + (Math.random() - 0.5) * envW * 0.94;
        const ry = envCY + (Math.random() - 0.5) * envH * 0.94;
        const col = paletteIndices[Math.floor(Math.random() * paletteIndices.length)];
        const armIndex = Math.floor(Math.random() * 5);
        envelopeDust.push({
          x: rx,
          y: ry,
          prevX: rx,
          prevY: ry,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 0.85 + 0.38,
          colorIdx: col,
          baseAlpha: Math.random() * 0.45 + 0.4,
          twinkleSpeed: Math.random() * 0.01 + 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
          armAngleOffset: (armIndex * (Math.PI * 2 / 5)) + (Math.random() - 0.5) * 0.4,
          spiralInertia: Math.random() * 0.4 + 0.8,
          absorbed: false,
        });
      }
    }

    // 2. Generate Scatter Stardust (3,600+ micro-particles)
    function generateGrandScatter() {
      const colors = [0, 1, 2, 3, 2, 4, 5, 6, 7, 0];

      for (let i = 0; i < 3600; i++) {
        const angle = Math.random() * Math.PI * 2;
        const tier = Math.random();
        let speed;
        if (tier > 0.82) speed = Math.random() * 18 + 12;
        else if (tier > 0.34) speed = Math.random() * 9.5 + 4.0;
        else if (tier > 0.10) speed = Math.random() * 4.0 + 1.2;
        else speed = Math.random() * 1.5 + 0.4;

        const col = colors[Math.floor(Math.random() * colors.length)];

        scatterDust.push({
          x: vortexX + (Math.random() - 0.5) * 6,
          y: vortexY + (Math.random() - 0.5) * 6,
          prevX: vortexX,
          prevY: vortexY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 1.1 + 0.4,
          colorIdx: col,
          baseAlpha: Math.random() * 0.45 + 0.55,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          drag: Math.random() * 0.02 + 0.958,
          wobbleFreq: Math.random() * 0.006 + 0.002,
          wobbleAmp: Math.random() * 0.5 + 0.15,
          driftY: -Math.random() * 0.22 - 0.03,
        });
      }
    }

    // Active buckets tracking to avoid scanning empty buckets
    const activeBuckets = [];
    const activeStreakBuckets = [];

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
        generateEnvelopeDust();
      }

      const elapsed = timestamp - startTime;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';

      // ==========================================
      // PHASE 1 & 2: Envelope Dust -> Spiral Galaxy Vortex
      // ==========================================
      if (elapsed < SCATTER_START) {
        let vortexStrength = 0;
        if (elapsed > VORTEX_START) {
          const t = Math.min(1, (elapsed - VORTEX_START) / (VORTEX_PEAK - VORTEX_START));
          vortexStrength = Math.pow(t, 2.5);
        }

        const fadeIn = Math.min(1, elapsed / 450);

        // Clear active buckets
        for (let i = 0; i < activeBuckets.length; i++) {
          particleBuckets[activeBuckets[i]].length = 0;
        }
        activeBuckets.length = 0;

        for (let i = 0; i < activeStreakBuckets.length; i++) {
          streakBuckets[activeStreakBuckets[i]].length = 0;
        }
        activeStreakBuckets.length = 0;

        const count = envelopeDust.length;
        for (let i = 0; i < count; i++) {
          const p = envelopeDust[i];
          if (p.absorbed) continue;

          p.prevX = p.x;
          p.prevY = p.y;

          if (vortexStrength < 0.02) {
            p.x += p.vx;
            p.y += p.vy;
          } else {
            const dx = vortexX - p.x;
            const dy = vortexY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const pullForce = Math.pow(vortexStrength, 2.8) * 4.5 + (vortexStrength * 0.22);
            p.vx += (dx / (dist + 1)) * pullForce * p.spiralInertia;
            p.vy += (dy / (dist + 1)) * pullForce * p.spiralInertia;

            const perpX = -dy / (dist + 1);
            const perpY = dx / (dist + 1);
            const spin = vortexStrength * (1.1 + Math.sin(p.armAngleOffset) * 0.25);
            p.vx += perpX * spin;
            p.vy += perpY * spin;

            p.x += p.vx;
            p.y += p.vy;

            p.vx *= 0.935;
            p.vy *= 0.935;

            if (dist < 4) {
              p.absorbed = true;
              continue;
            }
          }

          const twinkle = Math.sin(elapsed * p.twinkleSpeed + p.twinklePhase) * 0.35 + 0.65;
          const alpha = p.baseAlpha * twinkle * fadeIn;
          if (alpha <= 0.03) continue;

          const sIdx = getStyleIndex(p.colorIdx, alpha);

          const moveDistSq = (p.x - p.prevX) ** 2 + (p.y - p.prevY) ** 2;
          if (moveDistSq > 6 && vortexStrength > 0.15) {
            if (streakBuckets[sIdx].length === 0) activeStreakBuckets.push(sIdx);
            streakBuckets[sIdx].push(p);
          } else {
            if (particleBuckets[sIdx].length === 0) activeBuckets.push(sIdx);
            particleBuckets[sIdx].push(p);
          }
        }

        // BATCH DRAW PARTICLES (Single fill() per active style bucket!)
        for (let b = 0; b < activeBuckets.length; b++) {
          const sIdx = activeBuckets[b];
          const bucket = particleBuckets[sIdx];
          ctx.fillStyle = STYLE_CACHE[sIdx];
          ctx.beginPath();
          for (let i = 0; i < bucket.length; i++) {
            const p = bucket[i];
            ctx.rect(p.x, p.y, p.size, p.size);
          }
          ctx.fill();
        }

        // BATCH DRAW STREAKS (Single stroke() per active streak bucket!)
        for (let b = 0; b < activeStreakBuckets.length; b++) {
          const sIdx = activeStreakBuckets[b];
          const bucket = streakBuckets[sIdx];
          ctx.strokeStyle = STYLE_CACHE[sIdx];
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          for (let i = 0; i < bucket.length; i++) {
            const p = bucket[i];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - (p.x - p.prevX) * 1.4, p.y - (p.y - p.prevY) * 1.4);
          }
          ctx.stroke();
        }
      }

      // ==========================================
      // PHASE 3: Supermassive Stardust Scatter
      // ==========================================
      if (elapsed >= SCATTER_START) {
        if (!scatterInitialized) {
          scatterInitialized = true;
          generateGrandScatter();
        }

        const scatterElapsed = elapsed - SCATTER_START;
        const scatterDuration = TOTAL_DURATION - SCATTER_START;
        const progress = scatterElapsed / scatterDuration;
        const globalFade = progress > 0.5 ? Math.max(0, 1 - (progress - 0.5) / 0.5) : 1;

        // Clear active buckets
        for (let i = 0; i < activeBuckets.length; i++) {
          particleBuckets[activeBuckets[i]].length = 0;
        }
        activeBuckets.length = 0;

        for (let i = 0; i < activeStreakBuckets.length; i++) {
          streakBuckets[activeStreakBuckets[i]].length = 0;
        }
        activeStreakBuckets.length = 0;

        const isEarlyBurst = progress < 0.35;
        const count = scatterDust.length;

        for (let i = 0; i < count; i++) {
          const p = scatterDust[i];
          p.prevX = p.x;
          p.prevY = p.y;

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.drag;
          p.vy *= p.drag;

          const wobble = Math.sin(scatterElapsed * p.wobbleFreq) * p.wobbleAmp;
          p.x += wobble;
          p.y += p.driftY;

          const twinkle = Math.sin(scatterElapsed * p.twinkleSpeed + p.twinklePhase) * 0.38 + 0.62;
          const alpha = p.baseAlpha * twinkle * globalFade;
          if (alpha <= 0.03) continue;

          const sIdx = getStyleIndex(p.colorIdx, alpha);

          const speedSq = p.vx * p.vx + p.vy * p.vy;
          if (speedSq > 16 && isEarlyBurst) {
            if (streakBuckets[sIdx].length === 0) activeStreakBuckets.push(sIdx);
            streakBuckets[sIdx].push(p);
          } else {
            if (particleBuckets[sIdx].length === 0) activeBuckets.push(sIdx);
            particleBuckets[sIdx].push(p);
          }
        }

        // BATCH DRAW PARTICLES
        for (let b = 0; b < activeBuckets.length; b++) {
          const sIdx = activeBuckets[b];
          const bucket = particleBuckets[sIdx];
          ctx.fillStyle = STYLE_CACHE[sIdx];
          ctx.beginPath();
          for (let i = 0; i < bucket.length; i++) {
            const p = bucket[i];
            ctx.rect(p.x, p.y, p.size, p.size);
          }
          ctx.fill();
        }

        // BATCH DRAW STREAKS
        for (let b = 0; b < activeStreakBuckets.length; b++) {
          const sIdx = activeStreakBuckets[b];
          const bucket = streakBuckets[sIdx];
          ctx.strokeStyle = STYLE_CACHE[sIdx];
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          for (let i = 0; i < bucket.length; i++) {
            const p = bucket[i];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - (p.x - p.prevX) * 1.5, p.y - (p.y - p.prevY) * 1.5);
          }
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;

      if (elapsed < TOTAL_DURATION) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [onComplete, envelopeRect]);

  return (
    <div className="dissolution-container">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  );
}