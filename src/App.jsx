import { useState, useRef, useCallback, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import CosmicCanvas from './components/CosmicCanvas';
import CosmicEnvelope from './components/CosmicEnvelope';
import AccurateStarMap from './components/AccurateStarMap';
import LoadingScreen from './components/LoadingScreen';
import StardustCursor from './components/StardustCursor';
import DissolutionEffect from './components/DissolutionEffect';
import ClickStory from './components/ClickStory';

/**
 * App — Orchestrates the cinematic flow with overlapping transitions:
 *
 * Pre-load  Waits for fonts, D3 Celestial, and audio to be ready.
 * t=0s      Click envelope
 * t=0s      Envelope fades out (0.3s), dissolution starts, star map begins slow reveal
 * t=3.5s    Motes mostly gone, star map ~55% visible
 * t=5s      Show scroll story
 * t=5.8s    Star map fully opaque
 */
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [showDissolution, setShowDissolution] = useState(false);
  const [starMapActive, setStarMapActive] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [celestialReady, setCelestialReady] = useState(false);
  const [mapRendered, setMapRendered] = useState(false);
  const audioRef = useRef(null);

  const handleMapLoaded = useCallback(() => {
    setMapRendered(true);
  }, []);

  // Global Asset Preloader
  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      try {
        // 1. Wait for fonts (Cormorant Garamond, Great Vibes)
        await document.fonts.ready;

        // 2. Wait for audio to be capable of playing
        const audioPromise = new Promise((resolve) => {
          if (!audioRef.current) {
            resolve();
            return;
          }
          const audio = audioRef.current;
          if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
            resolve();
          } else {
            const handleCanPlay = () => {
              resolve();
              audio.removeEventListener('canplaythrough', handleCanPlay);
            };
            audio.addEventListener('canplaythrough', handleCanPlay);
            audio.addEventListener('error', resolve); // Don't block on error
            // Fallback timeout in case audio loading stalls
            setTimeout(() => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              resolve();
            }, 5000); 
          }
        });

        // 3. Wait for window.Celestial
        const celestialPromise = new Promise((resolve) => {
          if (window.Celestial) {
            resolve();
          } else {
            let attempts = 0;
            const interval = setInterval(() => {
              attempts++;
              if (window.Celestial || attempts > 20) { // 20 * 250ms = 5s max wait
                clearInterval(interval);
                resolve();
              }
            }, 250);
          }
        });

        await Promise.all([audioPromise, celestialPromise]);

        if (isMounted) {
          setCelestialReady(true);
        }
      } catch (err) {
        console.error("Asset loading error:", err);
        // Fallback to show envelope anyway
        if (isMounted) {
          setIsLoading(false);
          setShowEnvelope(true);
        }
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  // When the map finishes rendering behind the scenes, we can safely reveal the envelope
  useEffect(() => {
    if (mapRendered) {
      // Add an extra little beat for elegance
      setTimeout(() => {
        setIsLoading(false);
        setShowEnvelope(true);
      }, 2500);
    }
  }, [mapRendered]);

  const handleOpen = useCallback(() => {
    // 1. Envelope fades out smoothly, dissolution takes over
    setShowEnvelope(false);
    setShowDissolution(true);

    // 2. Star map reveals earlier (as the vortex finishes and burst begins)
    setTimeout(() => setStarMapActive(true), 5000);

    // 3. Show scroll story after dust settles and map is 100% opaque
    setTimeout(() => setShowStory(true), 10000);

    // Start audio
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleDissolutionComplete = useCallback(() => {
    setShowDissolution(false);
  }, []);

  const handleReset = useCallback(() => {
    setShowStory(false);
    setStarMapActive(false);
    setTimeout(() => setShowEnvelope(true), 1500);
  }, []);

  return (
    <main className="app-container">
      {/* Audio */}
      <audio ref={audioRef} loop src="/golden_hour.mp3" preload="auto" />

      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      {/* Global Interactive Cursor */}
      <StardustCursor isPaused={isLoading || showDissolution} />

      {/* Always-on cosmic canvas background */}
      <CosmicCanvas intensity={starMapActive ? 0.15 : 1} />

      {/* D3 Celestial star map — Mounts hidden during loading so it doesn't freeze thread on reveal */}
      {celestialReady && (
        <AccurateStarMap 
          isActive={starMapActive} 
          onLoaded={handleMapLoaded} 
        />
      )}

      {/* Envelope */}
      <AnimatePresence>
        {showEnvelope && (
          <motion.div
            key="envelope"
            className="fixed-full z-50"
            exit={{
              opacity: 0,
              filter: "brightness(1.5)",
              scale: 1.05,
              transition: { duration: 1.2, ease: "easeInOut" },
            }}
          >
            <CosmicEnvelope onOpen={handleOpen} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dissolution motes — overlaps with star map reveal */}
      <AnimatePresence>
        {showDissolution && (
          <motion.div
            key="dissolution"
            className="fixed-full z-50 pointer-events-none"
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeOut" } }}
          >
            <DissolutionEffect onComplete={handleDissolutionComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click Story — appears after star map is mostly visible */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute-full z-10"
          >
            <ClickStory onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
