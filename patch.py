import re

with open('src/components/ClickStory.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'; with nothing.
content = content.replace("import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';", "")

# 2. Find function CharacterReveal up to its closing brace } and replace it entirely with the version specified.
character_reveal_replacement = """function CharacterReveal({ text, isFinal = false, onComplete, isExploding = false }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(timeout);
  }, [text]);

  const { totalTime, words } = useMemo(() => {
    let charIndex = 0;
    
    // Prepare DOM mapped words
    const mappedWords = text.split('\\n').map((line, lineIdx) => {
      if (line === '') return { isBreak: true, id: `break-${lineIdx}` };
      
      const lineWords = line.split(' ').map((word) => {
        const isItalic = isItalicWord(word) && !isFinal;
        const chars = word.split('').map((char) => {
           const gCharIdx = charIndex++;
           const angle = Math.sin(gCharIdx * 12.34) * Math.PI * 2;
           const distance = 20 + Math.abs(Math.cos(gCharIdx * 43.21)) * 60;
           
           return {
              char,
              delay: gCharIdx * 0.035,
              targetX: Math.cos(angle) * distance,
              targetY: -40 - (Math.abs(Math.sin(angle)) * distance) + (Math.cos(gCharIdx) * 20),
              rotation: Math.sin(gCharIdx * 10) * 120,
              scale: 1.2 + Math.abs(Math.cos(gCharIdx * 5)) * 0.8,
              explodeDelay: Math.abs(Math.sin(gCharIdx * 2.1)) * 2.0
           };
        });
        charIndex++; // space
        return { chars, isItalic, word };
      });
      
      return { isLine: true, words: lineWords, id: `line-${lineIdx}` };
    });

    const time = 200 + (charIndex * 35) + 800; // start delay + chars delay + transition duration
    return { totalTime: time, words: mappedWords };
  }, [text, isFinal]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, totalTime);
    return () => clearTimeout(timer);
  }, [totalTime]);

  const animateState = isExploding ? "exploded" : (revealed ? "visible" : "hidden");

  return (
    <div 
      className={`text-story text-center ${isFinal ? 'text-story-final-container' : ''}`}
      style={{ 
        width: '80vw', 
        maxWidth: '800px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
        {words.map((block) => {
          if (block.isBreak) return <div key={block.id} style={{ height: '1.5em' }} />;
          
          return (
            <div key={block.id} className="story-line">
              {block.words.map((wordObj, wIdx) => {
                return (
                  <span 
                    key={wIdx} 
                    className={isFinal ? 'final-cursive-text' : ''}
                    style={{ 
                      display: 'inline-block', 
                      whiteSpace: 'nowrap',
                      fontStyle: wordObj.isItalic ? 'italic' : 'normal',
                      fontWeight: wordObj.isItalic ? '500' : (isFinal ? 'normal' : '400'),
                      marginRight: wIdx < block.words.length - 1 ? '0.3em' : '0'
                    }}
                  >
                    {wordObj.chars.map((c, i) => (
                      <motion.span
                        key={i}
                        initial="hidden"
                        animate={animateState}
                        variants={{
                          hidden: {
                            opacity: 0,
                            filter: 'blur(5px) brightness(1.2)',
                            y: 4,
                            scale: 0.95,
                            transition: { duration: 0 }
                          },
                          visible: {
                            opacity: 1,
                            filter: 'blur(0px)',
                            y: 0,
                            x: 0,
                            scale: 1,
                            rotate: 0,
                            textShadow: '0 0 0px rgba(255, 250, 240, 0)',
                            transition: { 
                                duration: 0.8, 
                                ease: [0.25, 0.46, 0.45, 0.94], 
                                delay: c.delay 
                            }
                          },
                          exploded: {
                            opacity: 0,
                            filter: 'blur(12px)',
                            x: c.targetX,
                            y: c.targetY,
                            scale: c.scale,
                            rotate: c.rotation,
                            textShadow: '0 0 30px rgba(255, 250, 240, 0.8)',
                            transition: { 
                                duration: 3.5 + (c.explodeDelay * 0.5), 
                                ease: [0.25, 1, 0.5, 1], 
                                delay: c.explodeDelay 
                            }
                          }
                        }}
                        style={{
                          display: 'inline-block',
                          color: isFinal ? '#ffe4b5' : '#fffaf0'
                        }}
                      >
                        {c.char}
                      </motion.span>
                    ))}
                  </span>
                );
              })}
            </div>
          );
        })}
    </div>
  );
}"""

content = re.sub(r'function CharacterReveal\(\{.*?^}', character_reveal_replacement, content, flags=re.DOTALL | re.MULTILINE)

# 3. In ClickStory component, replace 4500); // Massive breathing room for slow-mo with 2000); // Reduced for overlap
content = content.replace('4500); // Massive breathing room for slow-mo', '2000); // Reduced for overlap')

# 4. Replace <AnimatePresence mode="wait"> with <AnimatePresence>
content = content.replace('<AnimatePresence mode="wait">', '<AnimatePresence>')

# 5. Replace exit={{ opacity: 0, filter: 'blur(5px)', transition: { duration: 0.5 } }} with exit={{ opacity: 0, filter: 'blur(5px)', transition: { duration: 3.5 } }}
content = content.replace("exit={{ opacity: 0, filter: 'blur(5px)', transition: { duration: 0.5 } }}", "exit={{ opacity: 0, filter: 'blur(5px)', transition: { duration: 3.5 } }}")

# 6. Replace className="story-slide" with className="story-slide"\n          style={{ position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
content = content.replace('className="story-slide"', 'className="story-slide"\n          style={{ position: \'absolute\', width: \'100%\', display: \'flex\', flexDirection: \'column\', alignItems: \'center\' }}')

with open('src/components/ClickStory.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully.")
