import { useState, useMemo, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';


const phrases = [
  "Let your eyes trace the quiet beauty of this sky.",
  "These are the exact stars that were painted across the dark on April 1, 2005.",
  "To the rest of the world, it might have seemed like just another ordinary night...",
  "...but to me, it marks the beautiful beginning of your story.",
  "I know you don’t mark this day with the world's usual noise or traditions...",
  "...but my heart holds a deep, quiet gratitude that on this very night, you came to be.",
  "Since then, I know you’ve had to walk through more than your fair share of storms.",
  "I see the unseen weights you carry, and the silent battles you fight so bravely.",
  "Yet, instead of letting the harshness of the world harden you...",
  "...you have nurtured the most beautifully gentle, patient, and open-minded heart.",
  "Even when your own skies are clouded over, you always pour sunshine into the lives of others.",
  "Your boundless capacity to understand people is nothing short of breathtaking.",
  "You are, in the most graceful way, one of the strongest souls I have ever known.",
  "So, on the days when the world feels far too heavy to hold all by yourself...",
  "...I want you to gaze up at this little piece of the universe.",
  "And remember that someone out here is endlessly thankful just for your existence.\n\nNever lose that smile, Eya." // Final phrase
];

// Helper to determine if a word should be italicized for romantic emphasis
const isItalicWord = (word) => {
  const italicWords = [
    'quiet', 'exact', 'painted', 'beautiful', 'deep,', 'very', 'storms.',
    'unseen', 'bravely.', 'harshness', 'gentle,', 'patient,', 'sunshine',
    'breathtaking.', 'graceful', 'strongest', 'heavy', 'endlessly', 'existence.', 'beautiful'
  ];
  const cleanWord = word.replace(/[^\w\s.]/gi, '').toLowerCase();
  return italicWords.includes(cleanWord) || italicWords.includes(word.toLowerCase());
};

/**
 * CharacterReveal — Animates text letter-by-letter like stars igniting.
 * Words are wrapped in spans to prevent mid-word breaking at edges.
 */
function CharacterReveal({ text, isFinal = false, onComplete, isExploding = false }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(timeout);
  }, [text]);

  const { totalTime, words } = useMemo(() => {
    let charIndex = 0;
    
    // Prepare DOM mapped words
    const mappedWords = text.split('\n').map((line, lineIdx) => {
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
                            y: 4,
                            scale: 0.95,
                            transition: { duration: 0 }
                          },
                          visible: {
                            opacity: 1,
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
                            x: c.targetX,
                            y: c.targetY,
                            scale: c.scale,
                            rotate: c.rotation,
                            textShadow: '0 0 15px rgba(255, 250, 240, 0.5)',
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
}

function FinalLovePrompt() {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Stardust spawner loop when hovered
  useEffect(() => {
    if (!isHovered) return;
    const interval = setInterval(() => {
      setParticles(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          startX: (Math.random() - 0.5) * Math.min(140, window.innerWidth * 0.8),
          startY: (Math.random() - 0.5) * 10,
          endX: (Math.random() - 0.5) * 20,
          endY: Math.random() * 20,
          size: Math.random() * 2 + 0.5,
          duration: Math.random() * 1.5 + 1.5
        }
      ].slice(-15)); // Keep max 15 particles alive
    }, 120); // Spawn rate
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <motion.div
      className="click-prompt"
      style={{ 
        color: '#ffe4b5', 
        letterSpacing: '0.3em', 
        cursor: 'default',
        animation: 'none',
        /* Keep absolute positioning from CSS, just ensure it stays on top */
        zIndex: 50
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isHovered ? 1 : 0.8, 
        scale: isHovered ? 1.15 : 1,
        textShadow: isHovered ? "0 0 20px rgba(255, 228, 181, 0.8)" : "0 0 0px rgba(255, 228, 181, 0)"
      }}
      // Use quick transition when hovered/unhovered, but slow 2s transition for the initial appearance
      transition={{ duration: hasEntered ? 0.4 : 2, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stardust Emitting Layer */}
      <div className="absolute-full pointer-events-none flex-center" style={{ overflow: 'visible' }}>
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: p.startX, y: p.startY, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: p.startY - 30 - p.endY, 
                x: p.startX + p.endX,
                scale: p.size 
              }}
              transition={{ duration: p.duration, ease: "easeOut" }}
              style={{
                position: 'absolute',
                width: 2,
                height: 2,
                borderRadius: '50%',
                backgroundColor: '#fffaf0',
                boxShadow: '0 0 6px #ffe4b5, 0 0 2px #fff'
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <span style={{ textTransform: 'none' }}>I love you fo...hihi</span>
    </motion.div>
  );
}

export default function ClickStory({ onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canClick, setCanClick] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [showLovePrompt, setShowLovePrompt] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isFinal = currentIndex === phrases.length - 1;

  // Delayed trigger for final prompt
  useEffect(() => {
    if (isFinal) {
      const t = setTimeout(() => setShowLovePrompt(true), 4000);
      return () => clearTimeout(t);
    }
  }, [isFinal]);

  const handleRevealComplete = () => {
    setCanClick(true);
  };

  const handleNext = (e) => {
    // Add visual ripple
    const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
    setRipples((prev) => [...prev, newRipple]);

    if (!isFinal && canClick && !isExploding) {
      setIsExploding(true);
      setCanClick(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsExploding(false);
      }, 2000); // Reduced for overlap
    }
  };

  const removeRipple = (id) => {
    setRipples((prev) => prev.filter(r => r.id !== id));
  };

  return (
    <div 
      className="absolute-full flex-center z-10 click-story-container"
      onClick={handleNext}
      style={{ cursor: isFinal ? 'default' : 'pointer' }}
    >
      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => removeRipple(r.id)}
            style={{
              position: 'absolute',
              left: r.x - 20,
              top: r.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Background vignette for text readability */}
      <div className="story-vignette" />

      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 3.5 } }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="story-slide"
          style={{ position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <CharacterReveal 
            text={phrases[currentIndex]} 
            isFinal={isFinal} 
            isExploding={isExploding}
            onComplete={handleRevealComplete}
            windowWidth={windowWidth}
          />
          
          {/* Magic stardust burst on final phrase */}
          {isFinal && (
            <motion.div 
              className="final-stardust-burst"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Click prompt */}
      <AnimatePresence>
        {!isFinal && canClick && (
          <motion.div
            className="click-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            Tap anywhere to continue
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Golden finale prompt */}
      <AnimatePresence>
        {showLovePrompt && <FinalLovePrompt />}
      </AnimatePresence>

      {/* Replay Button (Appears late on final screen to prevent feeling trapped) */}
      <AnimatePresence>
        {isFinal && (
          <motion.button
            className="replay-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.5, y: 0 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            transition={{ delay: 8, duration: 2 }}
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            title="Relive the memory"
          >
            <RotateCcw size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
