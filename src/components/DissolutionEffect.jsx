import { useEffect, useRef } from 'react';

/**
 * DissolutionEffect — Cinematic shatter and merge transition:
 *
 * Phase 1 (0–200ms): Motes form the exact shape of the envelope.
 * Phase 2 (200ms–2500ms): The shape shatters, particles explode outward then drift gently.
 * Phase 3 (2500ms–6000ms): All particles are pulled toward a convergence point, spiraling inward.
 * Phase 4 (6000ms–8000ms): The newly formed star explodes outward in a radiant burst.
 */
export default function DissolutionEffect({ onComplete }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

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
    
    // Convergence point — slightly above center
    const starX = cx;
    const starY = cy - 40;

    // Phase timings (ms)
    const VORTEX_START = 1500;
    const VORTEX_END = 4800; // Peak suction reached earlier
    const BURST_START = 5500;
    const BURST_PEAK = 5900;
    const BURST_END = 8000;
    const TOTAL = 8500;

    const colors = [
      { r: 255, g: 255, b: 255 },
      { r: 219, g: 234, b: 254 },
      { r: 56, g: 189, b: 248 },
      { r: 129, g: 140, b: 248 },
      { r: 252, g: 211, b: 77 },
      { r: 255, g: 245, b: 230 },
    ];

    const motes = [];
    let startTime = null;

    function generateEnvelopeMotes() {
      const parts = [];
      const envW = w >= 768 ? 420 : 360;
      const envH = w >= 768 ? 290 : 250;

      const cyan = { r: 56, g: 189, b: 248 };
      const indigo = { r: 129, g: 140, b: 248 };
      const gold = { r: 252, g: 211, b: 77 };
      const envelopeColors = [cyan, indigo, gold];

      function addLine(x1, y1, x2, y2, color, density) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const count = Math.floor(dist * density);
        for (let i = 0; i < count; i++) {
          const rx = x1 + dx * (i / count) + (Math.random() - 0.5) * 2;
          const ry = y1 + dy * (i / count) + (Math.random() - 0.5) * 2;
          parts.push({ x: rx, y: ry, color });
        }
      }

      const tl_x = cx - envW / 2, tl_y = cy - envH / 2;
      const tr_x = cx + envW / 2, tr_y = cy - envH / 2;
      const bl_x = cx - envW / 2, bl_y = cy + envH / 2;
      const br_x = cx + envW / 2, br_y = cy + envH / 2;

      // Outer border
      addLine(tl_x, tl_y, tr_x, tr_y, cyan, 2);
      addLine(tr_x, tr_y, br_x, br_y, indigo, 2);
      addLine(br_x, br_y, bl_x, bl_y, cyan, 2);
      addLine(bl_x, bl_y, tl_x, tl_y, indigo, 2);

      // Top Flap
      addLine(tl_x, tl_y, cx, cy + 15, cyan, 1.5);
      addLine(tr_x, tr_y, cx, cy + 15, cyan, 1.5);

      // Bottom Flap
      addLine(bl_x, bl_y, cx, cy - 25, indigo, 1.5);
      addLine(br_x, br_y, cx, cy - 25, indigo, 1.5);

      // Wax seal (dense circle at the center)
      for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 25;
        parts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, color: gold });
      }

      // Constellation text/dust mix (interior strictly picking from envelope's specific colors)
      for (let i = 0; i < 400; i++) {
        const rx = cx + (Math.random() - 0.5) * envW * 0.85;
        const ry = cy + (Math.random() - 0.5) * envH * 0.85;
        parts.push({ x: rx, y: ry, color: envelopeColors[Math.floor(Math.random() * envelopeColors.length)] });
      }

      parts.forEach(p => {
        motes.push({
          x: p.x,
          y: p.y,
          // Elegant minimal starting drift
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4 - 0.2, // barely floating
          size: Math.random() * 1.5 + 1.0, // slightly smaller, more elegant
          color: p.color,
          wobbleFreq: Math.random() * 0.004 + 0.002,
          wobbleAmp: Math.random() * 6 + 2,
          wobblePhase: Math.random() * Math.PI * 2,
          converged: false
        });
      });
    }

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
        generateEnvelopeMotes();
      }
      
      const elapsed = timestamp - startTime;
      ctx.clearRect(0, 0, w, h);

      // ---- Phase 3 blend: Calculate convergence strength ----
      let convergeStrength = 0;
      if (elapsed > VORTEX_START && elapsed < VORTEX_END) {
        // Slow start, incredibly steep finish (cubic)
        const t = (elapsed - VORTEX_START) / (VORTEX_END - VORTEX_START);
        convergeStrength = t * t * t; 
      } else if (elapsed >= VORTEX_END) {
        convergeStrength = 1;
      }

      // ---- Draw/update motes ----
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        let opacity = 1;

        // Initial fade-in to bridge the DOM envelope fading out
        if (elapsed < 1000) {
          opacity = elapsed / 1000;
        }

        // Before strong vortex, gently drift
        if (elapsed < VORTEX_START || convergeStrength < 0.05) {
          m.x += m.vx;
          m.y += m.vy;
          m.vy -= 0.005; // tiny gentle lift
        }

        // --- Gathering (Efficient Elegant Vortex) ---
        if (convergeStrength > 0 && elapsed < BURST_START) {
          const dx = starX - m.x;
          const dy = starY - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Exponentially intense force near the end ensures 100% particles are sucked in
          const force = Math.pow(convergeStrength, 4) * 2.5 + (convergeStrength * 0.1);
          m.vx += (dx / (dist + 1)) * force;
          m.vy += (dy / (dist + 1)) * force;

          // Liquid spiral rotation pulls tighter as it gets closer
          const perpX = -dy / (dist + 1);
          const perpY = dx / (dist + 1);
          m.vx += perpX * convergeStrength * 0.6;
          m.vy += perpY * convergeStrength * 0.6;

          // Move the particle
          m.x += m.vx;
          m.y += m.vy;

          // Prevent indefinite orbits: reduce damping when trying to suck
          const damping = 1 - (convergeStrength * 0.05); 
          m.vx *= damping;
          m.vy *= damping;

          // Organic shrink and delete distance
          if (dist < 60) {
            opacity *= dist / 60;
            if (dist < 8) m.converged = true; // Sucked into the center completely
          }
        }

        // Remove converged or post-burst motes
        if (m.converged || (elapsed >= BURST_START && !m.converged)) {
          motes.splice(i, 1);
          continue;
        }

        const wobble = Math.sin(elapsed * m.wobbleFreq + m.wobblePhase) * m.wobbleAmp * (1 - convergeStrength);
        const drawX = m.x + wobble;
        const drawY = m.y;

        const { r, g, b } = m.color;
        const s = m.size * (1 - convergeStrength * 0.4);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // High-performance glow (solid soft-alpha circle instead of costly radial gradient)
        ctx.fillStyle = `rgba(${r},${g},${b},${0.25 * opacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, s * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(255,255,255,${0.9 * opacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, s * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ---- Convergence star glow (builds up as motes gather) ----
      if (elapsed > VORTEX_START && elapsed < BURST_END) {
        let starIntensity;
        if (elapsed < BURST_START) {
          starIntensity = convergeStrength * 0.6;
        } else if (elapsed < BURST_PEAK) {
          const t = (elapsed - BURST_START) / (BURST_PEAK - BURST_START);
          starIntensity = 0.6 + t * 0.4;
        } else {
          const t = (elapsed - BURST_PEAK) / (BURST_END - BURST_PEAK);
          starIntensity = Math.max(0, 1 - t * t);
        }

        if (starIntensity > 0.01) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          const haloR = 100 + starIntensity * 250;
          ctx.globalAlpha = starIntensity * 0.4;
          const halo = ctx.createRadialGradient(starX, starY, 0, starX, starY, haloR);
          halo.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          halo.addColorStop(0.2, 'rgba(56, 189, 248, 0.5)');
          halo.addColorStop(0.5, 'rgba(129, 140, 248, 0.15)');
          halo.addColorStop(1, 'transparent');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(starX, starY, haloR, 0, Math.PI * 2);
          ctx.fill();

          const coreR = 8 + starIntensity * 30;
          ctx.globalAlpha = starIntensity * 0.95;
          const core = ctx.createRadialGradient(starX, starY, 0, starX, starY, coreR);
          core.addColorStop(0, 'rgba(255, 255, 255, 1)');
          core.addColorStop(0.5, 'rgba(252, 211, 77, 0.8)');
          core.addColorStop(1, 'transparent');
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(starX, starY, coreR, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // ---- Phase 4: Starburst (Elegant Radial Wash) ----
      if (elapsed >= BURST_START && elapsed < BURST_END) {
        const bt = (elapsed - BURST_START) / (BURST_END - BURST_START);
        
        // Gentle expanding wave reveals the background elegantly
        const washRadius = bt * Math.max(w, h) * 1.5; // reaches corners fully
        const washOpacity = Math.max(0, 1 - Math.pow(bt, 1.5)) * 0.5;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = washOpacity;
        const wash = ctx.createRadialGradient(starX, starY, washRadius * 0.3, starX, starY, washRadius);
        wash.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        wash.addColorStop(0.3, 'rgba(56, 189, 248, 0.2)');
        wash.addColorStop(0.6, 'rgba(129, 140, 248, 0.05)');
        wash.addColorStop(1, 'transparent');
        ctx.fillStyle = wash;
        ctx.beginPath();
        ctx.arc(starX, starY, washRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }



      if (elapsed < TOTAL) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [onComplete]);

  return (
    <div className="dissolution-container">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
