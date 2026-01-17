import { Play, BarChart2 } from "lucide-react";
import { formatTime } from "../utils/formatTime"; // Ensure path matches your project structure

export default function TrackItem({ track, onClick, index }) {
  return (
    <button
      onClick={onClick}
      className="group w-full relative flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98] text-left"
    >
      {/* 1. Track Number */}
      <div className="w-6 shrink-0 flex justify-center text-xs font-medium text-gray-600 group-hover:text-violet-400 transition-colors font-mono">
        {(index + 1).toString().padStart(2, '0')}
      </div>

      {/* 2. Cover Art with Overlay */}
      <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-lg shadow-lg bg-gray-800">
        <img
          src={track.cover || track.image} // Handle 'cover' or 'image' property
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          alt={track.title}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
          <Play size={16} fill="white" className="text-white ml-0.5" />
        </div>
      </div>

      {/* 3. Track Info (Handles Long Titles) */}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className="font-semibold text-gray-200 text-sm truncate group-hover:text-white transition-colors">
          {track.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-gray-500 text-xs truncate group-hover:text-gray-400 transition-colors max-w-[120px]">
            {track.artist}
          </span>
          {/* Separator dot */}
          <span className="w-0.5 h-0.5 rounded-full bg-gray-700" />
          <span className="text-[10px] text-gray-600 font-mono group-hover:text-gray-500 transition-colors">
            {/* Display Real Duration */}
            {track.duration ? formatTime(track.duration) : "--:--"}
          </span>
        </div>
      </div>

      {/* 4. Active/Hover Decoration */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_40px_rgba(139,92,246,0.1)]" />
      
      {/* 5. Right-side Icon Animation */}
      <div className="mr-2 text-gray-600 group-hover:text-violet-400 transition-all duration-300 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
        <BarChart2 size={18} className="rotate-90" />
      </div>
    </button>
  );
}