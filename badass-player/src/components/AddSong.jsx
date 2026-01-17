import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { uploadNewSong } from "../redux/audioSlice";
import { UploadCloud, Music, Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";

export default function AddSong() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "Pop"
  });

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // --- HANDLERS ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setAudioFile(file);
        const name = file.name.replace(/\.[^/.]+$/, ""); 
        setFormData(prev => ({ ...prev, title: name }));
      } else {
        alert("Please drop an audio file (MP3, WAV)");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile || !formData.title || !formData.artist) {
      alert("Please fill in required fields (Title, Artist) and upload an audio file.");
      return;
    }

    setLoading(true);

    // 1. Prepare FormData
    const data = new FormData();
    data.append("title", formData.title);
    data.append("artist", formData.artist);
    data.append("album", formData.album || "");
    data.append("genre", formData.genre);
    
    // 2. These keys MUST match your backend: upload.fields([{ name: 'audio' }, { name: 'cover' }])
    data.append("audio", audioFile); 
    if (coverFile) {
      data.append("cover", coverFile);
    }

    try {
      // 3. Dispatch to Redux and unwrap to catch errors here
      await dispatch(uploadNewSong(data)).unwrap();
      navigate("/"); 
    } catch (err) {
      console.error("Upload Error:", err);
      alert(err.message || "Upload failed. Check your connection or file size.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-[#121212] border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in-up">
        
        {/* LEFT SIDE: DROP BOX & AUDIO */}
        <div className="md:w-1/2 p-8 bg-gradient-to-br from-gray-900 to-black border-r border-white/5 flex flex-col">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 w-fit"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h2 className="text-2xl font-bold mb-1">Upload Track</h2>
          <p className="text-gray-500 text-sm mb-6">Supported formats: MP3, WAV, FLAC</p>

          {/* Drag & Drop Zone */}
          <div 
            className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 relative
              ${dragActive ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}
              ${audioFile ? "border-green-500/50 bg-green-500/5" : ""}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => {
                if(e.target.files[0]) {
                  setAudioFile(e.target.files[0]);
                  setFormData(prev => ({ ...prev, title: e.target.files[0].name.replace(/\.[^/.]+$/, "") }));
                }
              }}
            />

            {audioFile ? (
              <div className="text-center animate-pulse">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                  <Music size={32} />
                </div>
                <p className="font-medium text-green-400 truncate max-w-[200px]">{audioFile.name}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                  className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="text-center pointer-events-none">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <UploadCloud size={32} />
                </div>
                <p className="font-medium text-gray-300">Drag & Drop Song Here</p>
                <p className="text-sm text-gray-500 mt-2">or</p>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all pointer-events-auto"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: METADATA FORM */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-violet-500 rounded-full"/> Track Details
            </h3>

            <div className="space-y-4">
              {/* Cover Art Input */}
              <div className="flex items-center gap-4 mb-6">
                <div 
                  onClick={() => imageInputRef.current.click()}
                  className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-violet-500 transition-colors overflow-hidden group relative"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-500 group-hover:text-violet-400" />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold">CHANGE</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Cover Art</p>
                  <p className="text-xs text-gray-500">Square recommended</p>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>

              {/* Text Inputs */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Song Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 ml-1">Artist</label>
                    <input 
                      type="text" 
                      value={formData.artist}
                      onChange={(e) => setFormData({...formData, artist: e.target.value})}
                      placeholder="Artist Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 ml-1">Genre</label>
                    <select 
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-300"
                    >
                      <option value="Pop">Pop</option>
                      <option value="Hip-Hop">Hip-Hop</option>
                      <option value="R&B">R&B</option>
                      <option value="Rock">Rock</option>
                      <option value="Electronic">Electronic</option>
                      <option value="Lo-Fi">Lo-Fi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !audioFile}
            className={`w-full py-4 mt-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${loading || !audioFile 
                ? "bg-white/5 text-gray-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98] text-white"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Uploading...
              </>
            ) : (
              "Upload Song"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}