import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTracks, setCurrentTrack } from "../redux/audioSlice";
import { getLibraries } from "../redux/librarySlice";
import TopCharts from "./TopCharts"; 
import { 
  Play, Plus, ListMusic, User, Disc, Music, Search 
} from "lucide-react";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allSongsRef = useRef(null); 

  // --- REDUX STATE ---
  const { tracks = [], loading: tracksLoading } = useSelector((state) => state.audio);
  
  // FIX: Destructure 'list' and rename it to 'libraries' to match your slice initialState
  const { list: libraries = [], loading: libLoading } = useSelector((state) => state.library);
  
  const user = { name: "Guest" };

  // --- LOCAL UI STATE ---
  const [visibleCount, setVisibleCount] = useState(10);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    dispatch(getTracks());
    dispatch(getLibraries());
  }, [dispatch]);

  // --- LOGIC: GROUP BY ARTIST ---
  const songsByArtist = (tracks || []).reduce((acc, track) => {
    const artist = track.artist || "Unknown";
    if (!acc[artist]) acc[artist] = [];
    acc[artist].push(track);
    return acc;
  }, {});

  // --- HANDLERS ---
  const handleLoadMore = () => setVisibleCount((prev) => prev + 10);

  const handlePlay = (track) => {
    dispatch(setCurrentTrack(track));
    navigate("/player");
  };

  const scrollToAllSongs = () => {
    allSongsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 font-sans overflow-x-hidden">
      
      {/* --- DASHBOARD HEADER --- */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-1">
            Good Evening, {user.name}
          </h1>
          <p className="text-gray-400">Manage your music and playlists.</p>
        </div>
        
        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-violet-500/20">
            G
        </div>
      </header>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* 1. ACTION BAR */}
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/playlist')} 
              className="flex-1 min-w-[200px] flex items-center gap-3 px-6 py-4 bg-[#1A1A1E] hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-95 group text-left shadow-lg"
            >
              <Search size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              <div>
                <span className="block font-bold text-gray-200 group-hover:text-white">Search Library</span>
                <span className="text-xs text-gray-500">Find songs, artists...</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/add-song')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-[#1A1A1E] hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-95 text-gray-300 hover:text-white font-bold"
            >
              <Plus size={20} className="text-violet-400" /> Upload
            </button>

            <button
              onClick={() => navigate('/create-library')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/20 rounded-2xl transition-all active:scale-95 text-white font-bold"
            >
              <ListMusic size={20} /> New Playlist
            </button>
          </div>

          {/* 2. COLLECTIONS */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Disc className="text-pink-500" /> Your Collections
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              
              {/* "All Songs" Card */}
              <div
                onClick={scrollToAllSongs}
                className="min-w-[200px] h-[160px] relative flex-shrink-0 bg-gradient-to-br from-violet-900 to-indigo-900 border border-white/10 p-5 rounded-3xl cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all group overflow-hidden"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Music size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">All Songs</h3>
                    <p className="text-xs text-indigo-200 mt-1">{tracks.length} Tracks</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                <Play className="absolute bottom-4 right-4 text-white/20 w-8 h-8 group-hover:text-white group-hover:scale-110 transition-all" />
              </div>

              {/* FIX: Loading and Mapping Logic */}
              {libLoading ? (
                // Pulse Loaders
                [1, 2].map(n => (
                  <div key={n} className="min-w-[180px] h-[160px] bg-white/5 animate-pulse rounded-3xl" />
                ))
              ) : (
                <>
                  {libraries.map((lib) => (
                    <div 
                      key={lib._id}
                      onClick={() => navigate(`/library/${lib._id}`)}
                      className="min-w-[180px] h-[160px] bg-[#121212] border border-white/5 rounded-3xl p-5 flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-transform hover:shadow-xl hover:shadow-violet-900/10 shrink-0 group relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-[40px] rounded-full group-hover:bg-violet-500/20 transition-colors" />
                       
                       <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                          <ListMusic size={18} />
                       </div>
                       
                       <div>
                         <h3 className="font-bold text-md leading-tight mb-1 group-hover:text-violet-300 transition-colors line-clamp-1">{lib.name}</h3>
                         <p className="text-xs text-gray-500">{lib.songs?.length || 0} Songs</p>
                       </div>
                    </div>
                  ))}

                  {/* Create New Placeholder */}
                  <div
                    onClick={() => navigate('/create-library')}
                    className="min-w-[180px] h-[160px] flex-shrink-0 border border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-violet-500 hover:text-violet-400 hover:bg-white/[0.02] transition-colors"
                  >
                    <Plus size={24} className="mb-2" />
                    <span className="text-sm font-medium">Create New</span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 3. ARTIST CATEGORIES */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="text-cyan-400" /> Browse by Artist
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(songsByArtist).length > 0 ? (
                Object.keys(songsByArtist).slice(0, 4).map((artist) => (
                  <div key={artist} className="bg-[#121212] p-4 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 mb-3 flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {artist[0].toUpperCase()}
                    </div>
                    <h3 className="font-medium truncate text-sm">{artist}</h3>
                    <p className="text-xs text-gray-500">{songsByArtist[artist].length} Tracks</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">No artists found</p>
              )}
            </div>
          </section>

          {/* 4. ALL SONGS LIST */}
          <section ref={allSongsRef}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ListMusic className="text-violet-500" /> All Songs
              </h2>
              <span className="text-xs text-gray-500">
                {Math.min(visibleCount, tracks.length)} / {tracks.length} loaded
              </span>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden min-h-[200px]">
              <div className="grid grid-cols-12 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                <div className="col-span-1">#</div>
                <div className="col-span-6 md:col-span-5">Title</div>
                <div className="hidden md:block col-span-4">Artist</div>
                <div className="col-span-5 md:col-span-2 text-right">Time</div>
              </div>

              {tracksLoading ? (
                <div className="p-10 text-center text-gray-500 animate-pulse">Loading Tracks...</div>
              ) : tracks.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No tracks uploaded yet.</div>
              ) : (
                tracks.slice(0, visibleCount).map((track, index) => (
                  <div
                    key={track._id || index}
                    onClick={() => handlePlay(track)}
                    className="group grid grid-cols-12 p-3 items-center hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="col-span-1 text-gray-500 text-sm font-medium pl-2">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play size={12} className="hidden group-hover:block text-violet-400 fill-violet-400" />
                    </div>

                    <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                      <img
                        src={track.cover || track.coverImage?.url || "https://via.placeholder.com/40"}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-gray-800"
                      />
                      <span className="font-medium text-white text-sm truncate pr-2">{track.title}</span>
                    </div>

                    <div className="hidden md:block col-span-4 text-sm text-gray-400 truncate">
                      {track.artist}
                    </div>

                    <div className="col-span-5 md:col-span-2 text-right text-xs text-gray-500 font-mono pr-2">
                      {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : "--:--"}
                    </div>
                  </div>
                ))
              )}
            </div>

            {visibleCount < tracks.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-[#1A1A1E] border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Load More
                </button>
              </div>
            )}
          </section>
        
        </div>

        {/* RIGHT COLUMN - TOP CHARTS */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TopCharts />
          </div>
        </div>

      </div>
    </div>
  );
}