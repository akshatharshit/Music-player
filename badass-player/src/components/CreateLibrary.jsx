import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createNewLibrary } from "../redux/librarySlice";
import { getTracks } from "../redux/audioSlice"; 
import { ArrowLeft, Disc, Sparkles, User, CheckCircle2, Search, ArrowRight, Music, Check, Loader2 } from "lucide-react";

export default function CreateLibrary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux State
  const { loading: libLoading } = useSelector((state) => state.library);
  const { tracks = [] } = useSelector((state) => state.audio); // Default to empty array

  // Local State
  const [step, setStep] = useState(1); 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getTracks());
  }, [dispatch]);

  const toggleSong = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId) 
        : [...prev, songId] 
    );
  };

  const filteredSongs = tracks.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || libLoading) return;

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        creator: "Me", 
        songs: selectedSongs 
      };

      const result = await dispatch(createNewLibrary(payload)).unwrap();
      
      if (result && result._id) {
        navigate(`/library/${result._id}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to create library:", err);
      alert(err.message || "Could not create playlist. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* LEFT SIDE: WIZARD */}
        <div className="animate-fade-in-up bg-[#121212] border border-white/5 p-8 rounded-3xl shadow-xl min-h-[500px] flex flex-col">
          
          <div className="flex items-center justify-between mb-6">
            <button 
              type="button"
              onClick={() => step === 2 ? setStep(1) : navigate(-1)} 
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} /> {step === 2 ? "Back to Details" : "Cancel"}
            </button>
            <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              Step {step} of 2
            </div>
          </div>

          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-3xl font-bold mb-2">New Collection</h1>
              <p className="text-gray-400 mb-8">Give your playlist a name.</p>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Late Night Vibes"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-5 py-4 text-lg focus:outline-none focus:border-pink-500 transition-all"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-pink-500 transition-all resize-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className={`w-full py-4 mt-8 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                  ${!name.trim() 
                    ? "bg-white/5 text-gray-600 cursor-not-allowed" 
                    : "bg-white text-black hover:bg-gray-200"
                  }
                `}
              >
                Next: Add Songs <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col h-full">
              <h1 className="text-3xl font-bold mb-2">Add Songs</h1>
              <p className="text-gray-400 mb-4">Select songs to include ({selectedSongs.length} selected)</p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search your library..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                {filteredSongs.length > 0 ? (
                  filteredSongs.map(track => {
                    const isSelected = selectedSongs.includes(track._id);
                    return (
                      <div 
                        key={track._id} 
                        onClick={() => toggleSong(track._id)}
                        className={`flex items-center justify-between p-3 mb-2 rounded-xl cursor-pointer border transition-all
                          ${isSelected 
                            ? "bg-pink-500/10 border-pink-500/50" 
                            : "bg-[#0a0a0a] border-transparent hover:bg-white/5"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded bg-gray-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {track.coverImage?.url ? (
                              <img src={track.coverImage.url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Music size={16} className="text-gray-600" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className={`font-medium truncate ${isSelected ? "text-pink-400" : "text-white"}`}>
                              {track.title}
                            </div>
                            <div className="text-xs text-gray-500">{track.artist}</div>
                          </div>
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isSelected ? "bg-pink-500 border-pink-500" : "border-gray-600"}`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-10">No songs found</div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCreate}
                disabled={libLoading}
                className="w-full py-4 mt-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-pink-500/25 active:scale-[0.98] text-white disabled:opacity-50"
              >
                {libLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Sparkles size={20} /> Create Collection
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: LIVE PREVIEW */}
        <div className="hidden md:flex flex-col items-center justify-center relative sticky top-10">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Live Preview</h3>

          <div className="w-[320px] h-[400px] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6 relative group overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/5 mb-6 flex items-center justify-center overflow-hidden relative">
                {selectedSongs.length > 0 ? (
                  <img 
                    src={tracks.find(t => t._id === selectedSongs[0])?.coverImage?.url || "https://via.placeholder.com/300"} 
                    className="w-full h-full object-cover opacity-80"
                    alt="Playlist Preview"
                  />
                ) : (
                  <Disc size={40} className="text-gray-700" />
                )}
                
                {selectedSongs.length > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold border border-white/10">
                    <Music size={10} className="inline mr-1"/>
                    {selectedSongs.length}
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <h2 className={`text-2xl font-bold leading-tight truncate ${name ? 'text-white' : 'text-gray-700'}`}>
                  {name || "Untitled"}
                </h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {description || "No description provided."}
                </p>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                  <span className="bg-white/5 px-2 py-1 rounded-md flex items-center gap-1">
                     <User size={10} /> Me
                  </span>
                  <span>•</span>
                  <span>{selectedSongs.length} Songs</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-500/20 blur-[50px] rounded-full" />
          </div>

          <div className="mt-8 flex items-center gap-2 text-green-500 text-sm transition-opacity duration-500" style={{ opacity: name && step === 2 ? 1 : 0 }}>
             <CheckCircle2 size={16} /> Ready to launch
          </div>
        </div>
      </div>
    </div>
  );
}