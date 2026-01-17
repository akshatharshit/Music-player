import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentTrack } from "../redux/audioSlice";
import { TrendingUp, Play, ArrowRight, Music, BarChart2 } from "lucide-react";
import gsap from "gsap";

export default function TopCharts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const listRef = useRef([]);
  const containerRef = useRef(null);
  
  // Get tracks from Redux
  const { tracks } = useSelector((state) => state.audio);

  // 1. Sort by Plays (Descending) & Take Top 5
  const topTracks = [...tracks]
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 5);

  // Animation on Load
  useEffect(() => {
    if (listRef.current.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(listRef.current,
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [tracks]);

  const handlePlay = (track) => {
    dispatch(setCurrentTrack(track));
    navigate("/player");
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 h-full flex flex-col shadow-2xl">
      
      {/* Decorative Background Glow */}
      <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] bg-violet-600/20 blur-[80px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            <TrendingUp className="text-violet-500" size={28} />
            Trending
          </h2>
          <p className="text-xs text-violet-300/80 font-bold uppercase tracking-widest mt-1 ml-1">
            Global Top 5
          </p>
        </div>
        <div className="p-2 bg-white/5 rounded-full border border-white/5">
          <BarChart2 className="text-gray-400" size={18} />
        </div>
      </div>

      {/* LIST */}
      <div className="relative z-10 flex-1 space-y-2">
        {topTracks.length > 0 ? (
          topTracks.map((track, index) => {
            // Rank Logic & Styling
            let rankColor = "text-gray-600 font-medium";
            let rankGlow = "";
            let rowBg = "hover:bg-white/5";
            
            // Gold
            if (index === 0) { 
              rankColor = "text-yellow-400 font-black text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
              rowBg = "bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 hover:bg-yellow-500/10";
            }
            // Silver
            else if (index === 1) { 
              rankColor = "text-gray-300 font-bold text-lg drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]";
              rankGlow = "shadow-gray-400/20";
            }
            // Bronze
            else if (index === 2) { 
              rankColor = "text-orange-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]";
              rankGlow = "shadow-orange-400/20";
            }

            return (
              <div 
                key={track._id}
                ref={el => listRef.current[index] = el}
                onClick={() => handlePlay(track)}
                className={`group relative flex items-center gap-4 p-3 rounded-2xl border border-transparent transition-all duration-300 cursor-pointer ${rowBg} hover:scale-[1.02] hover:border-white/10 hover:shadow-lg`}
              >
                {/* Rank Number */}
                <div className={`w-8 text-center flex-shrink-0 ${rankColor}`}>
                  {index + 1}
                </div>

                {/* Image */}
                <div className="relative">
                  <img 
                    src={track.coverImage?.url || "https://via.placeholder.com/40"} 
                    alt={track.title}
                    className={`w-12 h-12 rounded-xl object-cover shadow-md ${rankGlow}`}
                  />
                  {/* Overlay Play Icon on Hover */}
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Play size={14} className="text-white fill-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className={`font-bold truncate text-sm mb-0.5 ${index === 0 ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                    {track.title}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium truncate group-hover:text-gray-400 transition-colors">
                    {track.artist}
                  </div>
                </div>

                {/* Play Count (Hidden on hover, replaced by eq) */}
                <div className="text-right pr-2">
                  <div className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-1 rounded-md group-hover:bg-violet-500 group-hover:text-white transition-colors">
                    {track.playCount || 0} plays
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Music size={32} className="opacity-40"/>
            </div>
            <p className="text-sm font-medium">No trending data yet</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="relative z-10 pt-4">
        <button 
          onClick={() => navigate('/playlist')}
          className="group w-full py-3.5 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all duration-300 active:scale-95"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
            Open Collection
          </span>
          <ArrowRight size={14} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
      </div>

    </div>
  );
}