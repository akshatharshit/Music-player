import React from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for clean class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Controls({
  playing,
  onPlay,
  onPause,
  onNext,
  onRestart,
}) {
  return (
    <div className="relative group">
      {/* Ambient Background Glow behind the whole control bar */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 rounded-[2rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500" />

      {/* Main Glass Container */}
      <div className="relative flex items-center justify-center gap-6 px-8 py-5 bg-black/40 backdrop-blur-xl rounded-[1.8rem] border border-white/10 shadow-2xl ring-1 ring-white/5">
        
        {/* Restart Button */}
        <ControlButton onClick={onRestart} label="Restart Track">
          <RotateCcw size={20} className="text-gray-300" />
        </ControlButton>

        {/* Play/Pause (Hero Button) */}
        <PlayPauseButton 
          playing={playing} 
          onToggle={playing ? onPause : onPlay} 
        />

        {/* Next Button */}
        <ControlButton onClick={onNext} label="Next Track">
          <SkipForward size={24} className="text-gray-300" fill="currentColor" />
        </ControlButton>
      </div>
    </div>
  );
}

// --- Sub-Components ---

// 1. Secondary Button (Restart/Next)
function ControlButton({ onClick, children, label }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.1, color: "#fff" }}
      whileTap={{ scale: 0.9 }}
      className="p-3 rounded-full hover:bg-white/10 transition-colors duration-200 group/btn relative focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      {children}
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover/btn:opacity-100 blur-md transition-opacity" />
    </motion.button>
  );
}

// 2. The Hero Play/Pause Button
function PlayPauseButton({ playing, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      aria-label={playing ? "Pause" : "Play"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center justify-center w-16 h-16 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/30"
    >
      {/* Button Background with Gradient & Shadow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br transition-all duration-300",
          playing
            ? "from-violet-600 to-indigo-600 shadow-[0_0_20px_rgba(124,58,237,0.5)]" // Active State
            : "from-white/10 to-white/5 border border-white/10 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]" // Inactive State
        )}
      />

      {/* Animated Glow Ring (Pulsing when playing) */}
      {playing && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-violet-500/50"
        />
      )}

      {/* Icon Transition */}
      <div className="relative z-10 text-white">
        <AnimatePresence mode="wait" initial={false}>
          {playing ? (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              <Pause size={32} fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Play size={32} fill="currentColor" className="ml-1" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}