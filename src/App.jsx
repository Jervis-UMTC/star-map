import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import CosmicCanvas from './components/CosmicCanvas';
import CosmicEnvelope from './components/CosmicEnvelope';
import AccurateStarMap from './components/AccurateStarMap';
import LoadingScreen from './components/LoadingScreen';
import StardustCursor from './components/StardustCursor';

const DissolutionEffect = lazy(() => import('./components/DissolutionEffect'));
const ClickStory = lazy(() => import('./components/ClickStory'));

/**
 * App — Orchestrates the cinematic romantic experience for Eya:
 *
 * Pre-load  Waits for fonts, D3 Celestial, and audio to be ready.
 * t=0s      Click envelope
 * t=0s      Envelope fades out (0.3s), dissolution starts, star map begins slow reveal
 * t=3.5s    Motes mostly gone, star map ~55% visible
 * t=5s      Show one-click story over living star map
 * t=5.8s    Star map fully opaque & dynamically drifting
 */
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [envelopeRect, setEnvelopeRect] = useState(null);
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
        await document.fonts.ready;

        const audioPromise = new Promise((resolve) => {
          if (!audioRef.current) {
            resolve();
            return;
          }
          const audio = audioRef.current;
          if (audio.readyState >= 3) {
            resolve();
          } else {
            const handleCanPlay = () => {
              resolve();
              audio.removeEventListener('canplaythrough', handleCanPlay);
            };
            audio.addEventListener('canplaythrough', handleCanPlay);
            audio.addEventListener('error', resolve);
            setTimeout(() => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              resolve();
            }, 5000); 
          }
        });

        const celestialPromise = new Promise((resolve) => {
          if (window.Celestial) {
            resolve();
          } else {
            let attempts = 0;
            const interval = setInterval(() => {
              attempts++;
              if (window.Celestial || attempts > 20) {
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

  useEffect(() => {
    if (mapRendered) {
      setTimeout(() => {
        setIsLoading(false);
        setShowEnvelope(true);
      }, 2500);
    }
  }, [mapRendered]);

  const handleOpen = useCallback((rect) => {
    setEnvelopeRect(rect);
    setShowEnvelope(false);
    setShowDissolution(true);

    // Star map begins its gradual reveal right as the vortex bursts into the stardust scatter
    setTimeout(() => setStarMapActive(true), 4800);

    // Show story once the scattered sparkling dust settles into the living night sky
    setTimeout(() => setShowStory(true), 9000);

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
      {/* Background audio */}
      <audio ref={audioRef} loop src="/golden_hour.mp3" preload="auto" />

      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      {/* Global Interactive Cursor */}
      <StardustCursor isPaused={isLoading || showDissolution} />

      {/* Living cosmic canvas — rich with drifting multi-layer stars, nebulae & stardust */}
      <CosmicCanvas 
        intensity={starMapActive ? 0.75 : 1} 
        speedMultiplier={1} 
      />

      {/* D3 Celestial star map with living diurnal drift & glowing constellation pulses */}
      {celestialReady && (
        <AccurateStarMap 
          isActive={starMapActive} 
          onLoaded={handleMapLoaded}
          driftSpeed={1}
          pulsesActive={true}
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
              transition: { duration: 0.25, ease: "easeOut" },
            }}
          >
            <CosmicEnvelope onOpen={handleOpen} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dissolution motes */}
      <AnimatePresence>
        {showDissolution && (
          <motion.div
            key="dissolution"
            className="fixed-full z-50 pointer-events-none"
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeOut" } }}
          >
            <Suspense fallback={null}>
              <DissolutionEffect onComplete={handleDissolutionComplete} envelopeRect={envelopeRect} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One-click Story Narrative: pure, clean, tap anywhere to continue */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeOut" } }}
            transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute-full z-10"
          >
            <Suspense fallback={null}>
              <ClickStory onReset={handleReset} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
