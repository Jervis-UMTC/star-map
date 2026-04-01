// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function AstralEnvelope({ onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed-full flex-center z-50 px-4"
    >
      <motion.div
        animate={{ y: [-15, 15, -15] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="relative cursor-pointer group"
        onClick={onOpen}
      >
        <div className="envelope-container">
          {/* Back of envelope */}
          <div className="envelope-back"></div>
          
          {/* Letter peeking out slightly */}
          <div className="envelope-letter font-heading">
            For You
          </div>

          {/* Front of envelope and flaps */}
          <div className="envelope-front"></div>
          <div className="envelope-flap-top"></div>
          
          {/* Wax Seal */}
          <div className="wax-seal">
            <span className="seal-star">✦</span>
          </div>

          <div className="envelope-glow group-hover:opacity-100"></div>
        </div>
        
        <motion.div
          className="font-body text-caption text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          style={{ textShadow: "0 0 10px rgba(56, 189, 248, 0.5)" }}
        >
          Tap to Open
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
