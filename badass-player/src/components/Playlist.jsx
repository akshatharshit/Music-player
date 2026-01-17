import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { useNavigate } from "react-router-dom"; 
import { setCurrentTrack, getTracks } from "../redux/audioSlice"; // Added getTracks
import TrackItem from "./TrackItem";
import { Search, PlayCircle, ChevronDown, RefreshCw } from "lucide-react";
import gsap from "gsap";

export default function Playlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsRef = useRef([]);
  const containerRef = useRef();

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // Show 10 songs initially

  // --- REDUX ---
  const { tracks, loading } = useSelector((state) => state.audio);

  // Fetch tracks if not already loaded
  useEffect(() => {
    if (!tracks || tracks.length === 0) {
      dispatch(getTracks());
    }
  }, [dispatch, tracks]);

  // --- FILTERING ---
  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- PAGINATION (Slice the list) ---
  const displayedTracks = filteredTracks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTracks.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // --- ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header elements fade in
      gsap.from(".anim-header", {
        y: -15,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });

      // List items stagger in
      if (itemsRef.current.length > 0) {
        gsap.fromTo(itemsRef.current, 
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.5,
            delay: 0.2,
            clearProps: "all",
            ease: "back.out(1.2)",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [searchTerm, visibleCount]); // Re-run animation when list changes

  // --- HANDLERS ---
  const handleSelectTrack = (track) => {
    dispatch(setCurrentTrack(track)); 
    navigate("/player");
  };

  const handleShuffle = () => {
    if (filteredTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      const randomTrack = filteredTracks[randomIndex];
      handleSelectTrack(randomTrack);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-md mx-auto h-full flex flex-col px-6 pt-8 pb-4 bg-[#050505] min-h-screen text-white"
    >
      
      {/* --- HEADER SECTION --- */}
      <div className="mb-6 space-y-4">
        <div className="flex items-end justify-between anim-header">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Library</h2>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">
              {filteredTracks.length} Tracks
            </p>
          </div>
          
          <button 
            onClick={handleShuffle}
            className="group flex items-center gap-2 bg-violet-500 text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95"
          >
            <PlayCircle size={16} className="fill-current group-hover:scale-110 transition-transform" />
            SHUFFLE
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group anim-header">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500 group-focus-within:text-violet-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search songs, artists..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(10); // Reset pagination on search
            }}
            className="w-full bg-[#1A1A1E] border border-white/5 text-sm text-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {loading && tracks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse">
             <RefreshCw className="animate-spin mb-2" /> Loading library...
           </div>
        ) : displayedTracks.length > 0 ? (
          <div className="space-y-2 pb-20">
            {displayedTracks.map((track, index) => (
              <div 
                key={track._id || track.id} 
                ref={(el) => (itemsRef.current[index] = el)}
                className="opacity-100"
              >
                <TrackItem
                  track={track}
                  onClick={() => handleSelectTrack(track)} 
                  index={index}
                />
              </div>
            ))}

            {/* LOAD MORE BUTTON */}
            {hasMore && (
              <div className="pt-4 flex justify-center pb-8">
                <button 
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Load More <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No vibes found.</p>
          </div>
        )}
      </div>
      
      {/* Decorative gradient fade at bottom */}
      <div className="h-8 w-full bg-gradient-to-t from-[#050505] to-transparent shrink-0 pointer-events-none -mt-8 relative z-10" />
    </div>
  );
}