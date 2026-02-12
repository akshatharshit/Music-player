import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLibraryById, addSong } from "../redux/librarySlice";
import { getTracks, setCurrentTrack } from "../redux/audioSlice"; 
import { Play, ArrowLeft, Plus, Search, Music, Clock, X } from "lucide-react";

export default function LibraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- REDUX STATE ---
  const { activeLibrary, loading } = useSelector((state) => state.library);
  const { tracks: allTracks } = useSelector((state) => state.audio);

  // --- LOCAL STATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- INITIAL LOAD ---
  useEffect(() => {
    dispatch(getLibraryById(id));
    dispatch(getTracks()); // Ensure we have the global list of songs
  }, [dispatch, id]);

  // --- DERIVED DATA ---
  // Filter out songs that are already in the playlist
  const availableSongs = allTracks.filter(track => 
    !activeLibrary?.songs?.some(s => s._id === track._id) &&
    (track.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     track.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSong = async (songId) => {
    await dispatch(addSong({ libraryId: id, songId })).unwrap();
    // Re-fetch to update UI
    dispatch(getLibraryById(id));
  };

  const handlePlay = (track) => {
    dispatch(setCurrentTrack(track));
  };

  if (loading || !activeLibrary) {
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 relative">
      
      {/* 1. HEADER SECTION */}
      <div className="h-80 bg-gradient-to-b from-violet-900/50 to-[#050505] p-8 flex flex-col justify-end relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-8 left-8 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-end gap-6 z-10">
          {/* Cover Art Placeholder */}
          <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-black shadow-2xl shadow-violet-900/20 rounded-xl flex items-center justify-center border border-white/10">
            <Music size={64} className="text-gray-600" />
          </div>

          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-300">Playlist</span>
            <h1 className="text-6xl font-extrabold mt-2 mb-4 tracking-tight">{activeLibrary.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-white font-medium">{activeLibrary.creator || "User"}</span>
              <span>•</span>
              <span>{activeLibrary.songs?.length || 0} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTION BAR */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 bg-[#050505]/95 backdrop-blur-xl z-20 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-green-500/20 text-black">
            <Play size={28} fill="black" className="ml-1"/>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 border border-gray-600 hover:border-white rounded-full font-bold text-sm tracking-wide transition-colors uppercase"
          >
            Add Songs
          </button>
        </div>
      </div>

      {/* 3. SONG LIST */}
      <div className="px-8 mt-4">
        <div className="grid grid-cols-12 text-gray-400 border-b border-white/10 pb-2 mb-4 text-sm font-medium uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-4">Date Added</div>
          <div className="col-span-1 text-right"><Clock size={16} /></div>
        </div>

        {activeLibrary.songs && activeLibrary.songs.length > 0 ? (
          activeLibrary.songs.map((song, index) => (
            <div 
              key={song._id}
              onClick={() => handlePlay(song)}
              className="grid grid-cols-12 items-center py-3 px-2 rounded-lg hover:bg-white/10 group cursor-pointer transition-colors"
            >
              <div className="col-span-1 text-gray-400 font-mono text-sm">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play size={14} className="hidden group-hover:block text-white" fill="white"/>
              </div>
              <div className="col-span-6 flex items-center gap-4">
                <img 
                  src={song.coverImage?.url || "https://via.placeholder.com/40"} 
                  className="w-10 h-10 rounded shadow-sm object-cover" 
                  alt="" 
                />
                <div>
                  <div className="text-white font-medium truncate w-[300px]">{song.title}</div>
                  <div className="text-gray-400 text-sm group-hover:text-white transition-colors">{song.artist}</div>
                </div>
              </div>
              <div className="col-span-4 text-sm text-gray-500">
                Today
              </div>
              <div className="col-span-1 text-right text-sm text-gray-500 font-mono">
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>This playlist is empty.</p>
            <button onClick={() => setShowAddModal(true)} className="text-white underline mt-2">Find songs to add</button>
          </div>
        )}
      </div>

      {/* --- ADD SONG MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121212] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh] animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add to playlist</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-[#181818]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search songs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#2a2a2a] border-none rounded-full py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            </div>

            {/* List of Available Songs */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {availableSongs.length > 0 ? (
                availableSongs.map(track => (
                  <div key={track._id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg group">
                    <div className="flex items-center gap-3">
                      <img src={track.coverImage?.url || "https://via.placeholder.com/40"} className="w-10 h-10 rounded object-cover" alt=""/>
                      <div>
                        <div className="font-medium">{track.title}</div>
                        <div className="text-xs text-gray-400">{track.artist}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddSong(track._id)}
                      className="px-4 py-1.5 rounded-full border border-gray-600 text-sm font-medium hover:border-white hover:bg-white hover:text-black transition-all"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-500">
                  {searchTerm ? "No songs match your search." : "All available songs are already in this playlist."}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}