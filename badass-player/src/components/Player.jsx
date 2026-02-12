import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { setCurrentTrack } from "../redux/audioSlice";  
import { 
  ArrowLeft, Heart, MoreHorizontal, Volume2, 
  VolumeX, ListMusic, Share2, Maximize2 
} from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import { 
  motion, useMotionValue, useTransform, 
  useSpring, AnimatePresence 
} from "framer-motion";

// Components
import Timeline from "./Timeline";
import Controls from "./Controls";
import WaveformCanvas from "./WaveformCanvas";
import ParticleCanvas from "./ParticleCanvas";
import Vinyl from "./Vinyl"; // Ensure casing matches your file

export default function Player({ onBack }) {
  const dispatch = useDispatch();

  // --- 1. GET DATA FROM DATABASE (REDUX) ---
  const { currentTrack, tracks } = useSelector((state) => state.audio);

  // Safety Check: If no track is selected, return null (App.js handles redirect)
  if (!currentTrack) return null;

  // --- 2. CALCULATE "UP NEXT" ---
  const currentIndex = tracks.findIndex((t) => t._id === currentTrack._id);
  // If at end of list, loop back to start (index 0), else go to next
  const nextTrack = tracks[(currentIndex + 1) % tracks.length];

  // --- 3. AUDIO HOOK (Using Cloudinary URL) ---
  const { playing, play, pause, seek, pos, duration, engine } = useAudio(currentTrack.audio.url);

  // --- UI State ---
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // --- 3D Physics Configuration (Visuals) ---
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // --- 4. HANDLE NEXT TRACK ---
  const handleNext = () => {
    if (nextTrack) {
      dispatch(setCurrentTrack(nextTrack));
    }
  };

  return (
    // MAIN CONTAINER: "The Void"
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] text-white overflow-hidden selection:bg-violet-500/30 font-sans p-4 md:p-8">
      
      {/* --- LAYER 0: Ambient Environment --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         {/* Particles */}
         <div className="absolute inset-0 opacity-50">
            <ParticleCanvas engine={engine} active={playing} />
         </div>
         
         {/* Moving Light Blobs - Dynamic Color based on Theme if available */}
         <div 
           className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-violet-900/20 blur-[120px] rounded-full animate-blob mix-blend-screen" 
           style={{ backgroundColor: currentTrack.theme?.primary ? `${currentTrack.theme.primary}40` : undefined }} 
         />
         <div 
           className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen"
           style={{ backgroundColor: currentTrack.theme?.secondary ? `${currentTrack.theme.secondary}40` : undefined }}
         />
         
         {/* Grain & Vignette */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
      </div>

      {/* --- LAYER 1: Layout Grid --- */}
      <div className="relative z-10 w-full max-w-7xl h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* --- LEFT COLUMN: VISUAL STAGE (Vinyl) --- */}
        <div 
          className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[400px] perspective-1000"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Back Button */}
          <div className="absolute top-0 left-0 lg:-left-4 z-50">
             <NavButton onClick={() => onBack()} icon={<ArrowLeft size={22} />} />
          </div>

          <motion.div
             style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
             className="relative w-full max-w-[450px] aspect-square flex items-center justify-center"
          >
             {/* Glow Behind Vinyl */}
             <div className={`absolute inset-0 bg-gradient-to-tr from-violet-500/40 to-cyan-500/20 blur-[60px] rounded-full transition-all duration-700 ${playing ? "scale-110 opacity-100" : "scale-90 opacity-40"}`} />
             
             {/* The Vinyl Physics Object */}
             <div className="relative transform-gpu transition-transform duration-500 hover:scale-105">
                 {/* Pass Cloudinary Image to Vinyl if needed, otherwise it uses internal logic */}
                 <Vinyl playing={playing} engine={engine} cover={currentTrack.coverImage.url} />
             </div>

             {/* 3D Floating Status Text */}
             <motion.div 
               style={{ z: 40, x: useTransform(x, [-0.5, 0.5], [20, -20]) }}
               className="absolute -bottom-12 right-10 text-[10px] font-mono text-white/30 tracking-[0.3em] uppercase hidden md:block"
             >
                {engine ? "Audio Signal :: Live" : "Audio Engine :: Ready"}
             </motion.div>
          </motion.div>
        </div>

        {/* --- RIGHT COLUMN: COMMAND CENTER --- */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 flex flex-col justify-center"
        >
          {/* Glass Panel */}
          <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl overflow-hidden">
            
            {/* Panel Ambient Highlight */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* 1. Header */}
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                 <span className="text-xs font-bold tracking-widest text-white/50 uppercase">Now Playing</span>
               </div>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setIsLiked(!isLiked)} 
                   className="group p-2 rounded-full hover:bg-white/10 transition-colors"
                 >
                    <Heart size={20} className={`transition-all duration-300 ${isLiked ? "fill-violet-500 text-violet-500 scale-110" : "text-gray-400 group-hover:text-white"}`} />
                 </button>
                 <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                 </button>
               </div>
            </div>

            {/* 2. Track Info (From Redux) */}
            <div className="mb-8 relative z-10">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentTrack._id} // Key triggers animation on change
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3 }}
                 >
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tight leading-tight mb-2 drop-shadow-sm">
                      {currentTrack.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-medium">{currentTrack.artist}</p>
                 </motion.div>
               </AnimatePresence>
            </div>

            {/* 3. Waveform Visualizer */}
            <div className="mb-6 h-12 w-full flex items-center opacity-80 mask-gradient-sides">
               {engine ? (
                  <WaveformCanvas engine={engine} active={playing} />
               ) : (
                  <div className="w-full h-[1px] bg-white/10 flex items-center justify-center">
                    <div className="text-[10px] text-gray-600">initializing stream...</div>
                  </div>
               )}
            </div>

            {/* 4. Timeline */}
            <div className="mb-8">
               <Timeline pos={pos} duration={duration} onSeek={seek} />
            </div>

            {/* 5. Main Controls */}
            <div className="flex justify-between items-center mb-8">
               {/* Volume (Left) */}
               <div className="hidden md:flex items-center gap-2 group w-1/4">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
                     {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-white w-2/3 rounded-full group-hover:bg-violet-500 transition-colors" />
                  </div>
               </div>

               {/* Playback (Center) */}
               <div className="flex-1 flex justify-center">
                 <Controls
                   playing={playing}
                   onPlay={play}
                   onPause={pause}
                   onRestart={() => seek(0)}
                   onNext={handleNext}
                 />
               </div>
               
               {/* Shuffle/Share (Right) */}
               <div className="hidden md:flex justify-end w-1/4 gap-3 text-gray-400">
                  <button className="hover:text-white transition-colors"><Share2 size={18} /></button>
                  <button className="hover:text-white transition-colors"><Maximize2 size={18} /></button>
               </div>
            </div>

            {/* 6. "Up Next" Queue Pill */}
            {nextTrack && (
              <button 
                onClick={handleNext}
                className="w-full group relative flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all overflow-hidden"
              >
                 <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                       {/* Show next track image if available */}
                       {nextTrack.coverImage ? (
                         <img src={nextTrack.coverImage.url} alt="Next" className="w-full h-full object-cover" />
                       ) : (
                         <ListMusic size={18} className="text-gray-400" />
                       )}
                    </div>
                    <div className="text-left">
                       <div className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Coming Up</div>
                       <div className="text-sm text-gray-200 font-medium truncate max-w-[150px]">{nextTrack.title}</div>
                    </div>
                 </div>
                 <div className="relative z-10 pr-2">
                   <ArrowLeft size={16} className="rotate-180 text-gray-500 group-hover:text-white transition-colors" />
                 </div>
                 
                 {/* Hover Fill Effect */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              </button>
            )}

          </div>
        </motion.div>

      </div>
    </div>
  );
}

// --- Reusable Nav Button ---
function NavButton({ onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl"
    >
      {icon}
    </button>
  );
}