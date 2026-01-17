import { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import gsap from "gsap";
import AddSong from './components/AddSong';
import LibraryDetail from './components/LibraryDetail';
import Playlist from "./components/Playlist";

// Pages
import Showcase from "./components/Showcase";
import Dashboard from "./components/Dashboard";
import Player from "./components/Player";
import CreateLibrary from "./components/CreateLibrary";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const container = useRef(null);
  
  // Redux: Watch for song changes to auto-redirect to player
  const { currentTrack } = useSelector((state) => state.audio);

  // --- 1. Auto-Redirect to Player ---
  useEffect(() => {
    // If a track is selected and we are NOT already on the player page, go there
    if (currentTrack && location.pathname !== "/player") {
      navigate("/player");
    }
  }, [currentTrack, navigate, location.pathname]);

  // --- 2. GSAP Page Transitions ---
  // This runs every time the URL (location) changes
  useEffect(() => {
    if (!container.current) return;

    // Animate IN (Fade in + Slide Up)
    gsap.fromTo(
      container.current,
      { opacity: 1, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
    );

    // Note: React Router v6 renders immediately, so "Exit" animations 
    // require a more complex setup (like AnimatePresence). 
    // For now, this gives you a smooth "Enter" animation on every page load.
    
  }, [location.pathname]); // Run animation on path change

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      {/* The Container ref animates the whole page content */}
      <div ref={container} className="w-full h-full">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Showcase />} />
          
          {/* Dashboard (Library) */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Player */}
          <Route path="/player" element={<Player />} />

          <Route path="/playlist" element={<Playlist />} />

          {/* NEW ROUTE */}
        <Route path="/add-song" element={<AddSong />} />

        <Route path="/library/:id" element={<LibraryDetail />} />
        <Route path="/create-library" element={<CreateLibrary />} />
        </Routes>
      </div>
    </div>
  );
}