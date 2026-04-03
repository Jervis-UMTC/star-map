import re
import os

def patch_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: Could not find '{old}' in {filepath}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {filepath}")

# 1. CosmicEnvelope.jsx
cosmic_envelope_path = r'src/components/CosmicEnvelope.jsx'
patch_file(cosmic_envelope_path, [
    (
        "onClick={onOpen}",
        "onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}"
    ),
    (
        "onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}",
        "onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(e.currentTarget.getBoundingClientRect())}"
    )
])

# 2. App.jsx
app_jsx_path = r'src/App.jsx'
with open(app_jsx_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add state
app_content = app_content.replace(
    "const [isLoading, setIsLoading] = useState(true);",
    "const [isLoading, setIsLoading] = useState(true);\n  const [envelopeRect, setEnvelopeRect] = useState(null);"
)

# Update handleOpen
app_content = app_content.replace(
    "const handleOpen = useCallback(() => {",
    "const handleOpen = useCallback((rect) => {\n    setEnvelopeRect(rect);"
)

# Remove scale: 1.05
app_content = app_content.replace(
    "              scale: 1.05,\n",
    ""
)

# Pass rect to DissolutionEffect
app_content = app_content.replace(
    "<DissolutionEffect onComplete={handleDissolutionComplete} />",
    "<DissolutionEffect onComplete={handleDissolutionComplete} envelopeRect={envelopeRect} />"
)

with open(app_jsx_path, 'w', encoding='utf-8') as f:
    f.write(app_content)
print(f"Patched {app_jsx_path}")

# 3. DissolutionEffect.jsx
diss_path = r'src/components/DissolutionEffect.jsx'
with open(diss_path, 'r', encoding='utf-8') as f:
    diss_content = f.read()

diss_content = diss_content.replace(
    "export default function DissolutionEffect({ onComplete }) {",
    "export default function DissolutionEffect({ onComplete, envelopeRect }) {"
)

diss_content = diss_content.replace(
    "}, [onComplete]);",
    "}, [onComplete, envelopeRect]);"
)

old_motes_logic = """      const envW = w >= 768 ? 420 : 360;
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

      // Outer border — Reduced density for a finer, lighter look
      addLine(tl_x, tl_y, tr_x, tr_y, cyan, 0.8);
      addLine(tr_x, tr_y, br_x, br_y, indigo, 0.8);
      addLine(br_x, br_y, bl_x, bl_y, cyan, 0.8);
      addLine(bl_x, bl_y, tl_x, tl_y, indigo, 0.8);

      // Top Flap
      addLine(tl_x, tl_y, cx, cy + 15, cyan, 0.6);
      addLine(tr_x, tr_y, cx, cy + 15, cyan, 0.6);

      // Bottom Flap
      addLine(bl_x, bl_y, cx, cy - 25, indigo, 0.6);
      addLine(br_x, br_y, cx, cy - 25, indigo, 0.6);

      // Wax seal (dense circle at the center) — Halved for airiness
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 20;
        parts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, color: gold });
      }

      // Constellation text/dust mix — Reduced significantly to avoid clutter
      for (let i = 0; i < 150; i++) {
        const rx = cx + (Math.random() - 0.5) * envW * 0.85;
        const ry = cy + (Math.random() - 0.5) * envH * 0.85;
        parts.push({ x: rx, y: ry, color: envelopeColors[Math.floor(Math.random() * envelopeColors.length)] });
      }"""

new_motes_logic = """      const envW = envelopeRect ? envelopeRect.width : (w >= 768 ? 420 : 360);
      const envH = envelopeRect ? envelopeRect.height : (w >= 768 ? 290 : 250);
      
      // Center of the envelope on screen
      const envCX = envelopeRect ? envelopeRect.left + envW / 2 : cx;
      const envCY = envelopeRect ? envelopeRect.top + envH / 2 : cy;

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

      const tl_x = envCX - envW / 2, tl_y = envCY - envH / 2;
      const tr_x = envCX + envW / 2, tr_y = envCY - envH / 2;
      const bl_x = envCX - envW / 2, bl_y = envCY + envH / 2;
      const br_x = envCX + envW / 2, br_y = envCY + envH / 2;

      // Outer border — Reduced density for a finer, lighter look
      addLine(tl_x, tl_y, tr_x, tr_y, cyan, 0.8);
      addLine(tr_x, tr_y, br_x, br_y, indigo, 0.8);
      addLine(br_x, br_y, bl_x, bl_y, cyan, 0.8);
      addLine(bl_x, bl_y, tl_x, tl_y, indigo, 0.8);

      // Top Flap
      addLine(tl_x, tl_y, envCX, envCY + 15, cyan, 0.6);
      addLine(tr_x, tr_y, envCX, envCY + 15, cyan, 0.6);

      // Bottom Flap
      addLine(bl_x, bl_y, envCX, envCY - 25, indigo, 0.6);
      addLine(br_x, br_y, envCX, envCY - 25, indigo, 0.6);

      // Wax seal (dense circle at the center) — Halved for airiness
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 20;
        parts.push({ x: envCX + Math.cos(angle) * r, y: envCY + Math.sin(angle) * r, color: gold });
      }

      // Constellation text/dust mix — Reduced significantly to avoid clutter
      for (let i = 0; i < 150; i++) {
        const rx = envCX + (Math.random() - 0.5) * envW * 0.85;
        const ry = envCY + (Math.random() - 0.5) * envH * 0.85;
        parts.push({ x: rx, y: ry, color: envelopeColors[Math.floor(Math.random() * envelopeColors.length)] });
      }"""

# Fix line endings because we might be on windows
diss_content = diss_content.replace('\r\n', '\n')
old_motes_logic = old_motes_logic.replace('\r\n', '\n')

if old_motes_logic in diss_content:
    diss_content = diss_content.replace(old_motes_logic, new_motes_logic)
else:
    print("Warning: Could not find old motes logic in DissolutionEffect.jsx")

with open(diss_path, 'w', encoding='utf-8') as f:
    f.write(diss_content)
print(f"Patched {diss_path}")
