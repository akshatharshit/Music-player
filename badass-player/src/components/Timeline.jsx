import { formatTime } from "../utils/formatTime";
import { useState, useRef } from "react";

export default function Timeline({ pos, duration, onSeek }) {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState(0);
  const progressBarRef = useRef(null);

  const pct = duration ? (pos / duration) * 100 : 0;

  const handleMouseMove = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverPos((x / rect.width) * 100);
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const targetTime = (x / rect.width) * duration;
    onSeek(targetTime);
  };

  return (
    <div className="w-full flex flex-col gap-3 group/timeline">
      {/* Container with extra padding to make clicking easier */}
      <div
        ref={progressBarRef}
        className="relative h-6 flex items-center cursor-pointer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Track Background */}
        <div className="w-full h-[4px] bg-white/10 rounded-full overflow-hidden relative">
          
          {/* Hover Preview Bar (Subtle) */}
          {isHovering && (
            <div 
              className="absolute top-0 left-0 h-full bg-white/10 transition-opacity duration-200"
              style={{ width: `${hoverPos}%` }}
            />
          )}

          {/* Active Progress Fill - UPDATED COLOR */}
          <div
            className="absolute top-0 left-0 h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* The Playhead (Glow Knob) - UPDATED COLOR */}
        <div 
          className="absolute h-3 w-3 bg-white rounded-full border-2 border-violet-500 shadow-[0_0_12px_rgba(139,92,246,1)] transition-all duration-300 ease-out translate-x-[-50%] opacity-0 group-hover/timeline:opacity-100 scale-75 group-hover/timeline:scale-100"
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* Time Labels */}
      <div className="flex justify-between text-[10px] font-bold tracking-widest text-gray-500 uppercase px-1">
        <span className="text-violet-400">{formatTime(pos)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}