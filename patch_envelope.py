import os

file_path = "src/components/CosmicEnvelope.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { useState, useMemo, useEffect } from 'react';",
    "import { useState, useMemo, useEffect, useRef } from 'react';"
)

# 2. Add useRef inside CosmicEnvelope
content = content.replace(
    "export default function CosmicEnvelope({ onOpen }) {",
    "export default function CosmicEnvelope({ onOpen }) {\n  const envelopeRef = useRef(null);"
)

# 3. Attach ref to .envelope-wrapper
content = content.replace(
    '<div className="envelope-wrapper">',
    '<div className="envelope-wrapper" ref={envelopeRef}>'
)

# 4. Update onClick and onKeyDown
content = content.replace(
    'onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}',
    'onClick={() => onOpen(envelopeRef.current?.getBoundingClientRect())}'
)
content = content.replace(
    "onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(e.currentTarget.getBoundingClientRect())}",
    "onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(envelopeRef.current?.getBoundingClientRect())}"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched CosmicEnvelope.jsx")
