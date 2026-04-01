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
function CharacterReveal({ text, isFinal = false, onComplete }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(timeout);
  }, [text]);

  const { words, totalTime } = useMemo(() => {
    let charIndex = 0;
    
    // Split by newlines first to handle paragraph breaks
    const mappedWords = text.split('\n').map((line, lineIdx) => {
      if (line === '') return { isBreak: true, id: `break-${lineIdx}` };
      
      const lineWords = line.split(' ').map((word) => {
        const isItalic = isItalicWord(word);
        const chars = word.split('').map((char) => ({
          char,
          delay: (charIndex++) * 0.035,
        }));
        charIndex++; // space
        return { chars, isItalic, word };
      });
      
      return { isLine: true, words: lineWords, id: `line-${lineIdx}` };
    });

    const time = 200 + (charIndex * 35) + 800; // start delay + chars delay + transition duration
    return { words: mappedWords, totalTime: time };
  }, [text]);

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

  return (
    <div className={`text-story text-center ${isFinal ? 'text-story-final-container' : ''}`}>
      {words.map((block) => {
        if (block.isBreak) return <br key={block.id} />;
        
        return (
          <div key={block.id} className="story-line">
            {block.words.map((wordObj, wIdx) => {
              // Special check: If this is the final slide and the word is in the last sentence
              const isFinalSentence = isFinal && block.id === "line-2";
              
              return (
                <span 
                  key={wIdx} 
                  className={isFinalSentence ? 'final-cursive-text' : ''}
                  style={{ 
                    display: 'inline-block', 
                    whiteSpace: 'nowrap',
                    fontStyle: wordObj.isItalic && !isFinalSentence ? 'italic' : 'normal',
                    fontWeight: wordObj.isItalic && !isFinalSentence ? '500' : (isFinalSentence ? 'normal' : '400'),
                    marginRight: wIdx < block.words.length - 1 ? '0.3em' : '0'
                  }}
                >
                  {wordObj.chars.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        opacity: revealed ? 1 : 0,
                        filter: revealed ? 'blur(0px)' : 'blur(5px) brightness(1.2)',
                        transform: revealed ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.95)',
                        transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${c.delay}s`,
                      }}
                    >
                      {c.char}
                    </span>
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

export default function ClickStory({ onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canClick, setCanClick] = useState(false);
  const [ripples, setRipples] = useState([]);

  const isFinal = currentIndex === phrases.length - 1;

  const handleRevealComplete = () => {
    setCanClick(true);
  };

  const handleNext = (e) => {
    // Add visual ripple
    const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
    setRipples((prev) => [...prev, newRipple]);

    if (!isFinal && canClick) {
      setCurrentIndex((prev) => prev + 1);
      setCanClick(false);
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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, filter: 'blur(10px)', y: 40 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(12px)', y: -50 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="story-slide"
        >
          <CharacterReveal 
            text={phrases[currentIndex]} 
            isFinal={isFinal} 
            onComplete={handleRevealComplete}
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
        {isFinal && (
           <motion.div
           className="click-prompt"
           style={{ 
             color: '#ffe4b5', 
             letterSpacing: '0.3em', 
             cursor: 'default',
             animation: 'none' /* Disable CSS pulse so Framer Motion can scale it */
           }}
           initial={{ opacity: 0, scale: 1, textShadow: "0 0 0px rgba(255, 228, 181, 0)" }}
           animate={{ opacity: 0.8, scale: 1 }}
           transition={{ delay: 4, duration: 2 }}
           whileHover={{ 
             scale: 1.15, 
             opacity: 1,
             textShadow: "0 0 20px rgba(255, 228, 181, 0.8)",
             transition: { duration: 0.3, ease: "easeOut" }
           }}
         >
           I love you
         </motion.div>
        )}
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
