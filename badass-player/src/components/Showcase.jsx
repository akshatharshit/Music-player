import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // <--- Added for navigation
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { 
  ArrowRight, Zap, ChevronRight, Layers, 
  Globe, Waves, Mic2, Users, Wifi, Sliders 
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// --- Feature Data Configuration ---
const features = [
  {
    icon: <Globe size={24} />,
    title: "Spatial Architecture",
    desc: "Physics-based positioning that mimics real-world acoustics in a virtual room."
  },
  {
    icon: <Waves size={24} />,
    title: "Lossless Quality",
    desc: "Bit-perfect delivery up to 24-bit/192kHz for studio-quality rendering."
  },
  {
    icon: <Mic2 size={24} />,
    title: "Vocal Isolation",
    desc: "AI-driven stem separation allows you to focus on the voice or the beat."
  },
  {
    icon: <Users size={24} />,
    title: "Collaborative Spaces",
    desc: "Interact with others in real-time within a shared digital environment."
  },
  {
    icon: <Wifi size={24} />,
    title: "Smart Caching",
    desc: "Intelligent background data management keeps the experience fluid offline."
  },
  {
    icon: <Sliders size={24} />,
    title: "Parametric Control",
    desc: "Fine-tune every aspect of the environment with professional-grade tools."
  }
];

export default function Showcase() {
  const navigate = useNavigate(); // <--- Hook for routing
  const container = useRef(null);
  const heroTextRef = useRef(null);
  const gridContainerRef = useRef(null);
  
  // Mouse position for Spotlight effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Cinematic Text Reveal (Unmasking)
      const words = heroTextRef.current.querySelectorAll(".word-anim");
      gsap.from(words, {
        y: 100,
        opacity: 0,
        rotateX: -45,
        stagger: 0.1,
        duration: 1.2,
        ease: "power4.out",
        clearProps: "all"
      });

      // 2. Parallax Background Blobs
      gsap.to(".parallax-blob", {
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: (i, target) => -150 * target.dataset.speed,
        ease: "none",
      });

      // 3. Grid Stagger Entrance
      if (gridContainerRef.current) {
        gsap.from(gridContainerRef.current.children, {
          scrollTrigger: {
            trigger: gridContainerRef.current,
            start: "top 75%",
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all"
        });
      }

      // 4. CTA Scale & Glow
      gsap.from(".cta-container", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 85%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        clearProps: "all"
      });

    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={container} className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-violet-500/30">
      
      {/* --- LAYER 0: Ambient Motion --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* Parallax Orbs */}
        <div data-speed="1.5" className="parallax-blob absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div data-speed="0.8" className="parallax-blob absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 blur-[100px] rounded-full mix-blend-screen" />
        <div data-speed="1.2" className="parallax-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-900/10 blur-[100px] rounded-full mix-blend-screen" />

        {/* Grain Overlay for Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* --- LAYER 1: HERO SECTION --- */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
        
        {/* Badge */}
        <div className="mb-8 overflow-hidden rounded-full">
          <div className="word-anim flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-violet-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Zap size={14} className="fill-current" /> 
            <span>System v2.0</span>
          </div>
        </div>
        
        {/* Headline */}
        <div ref={heroTextRef} className="max-w-5xl mx-auto perspective-1000">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 text-white">
            <div className="overflow-hidden inline-block"><span className="word-anim inline-block">Redefine</span></div>{" "}
            <div className="overflow-hidden inline-block"><span className="word-anim inline-block">Your</span></div><br />
            <div className="overflow-hidden inline-block">
               <span className="word-anim inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-400 to-white pb-2">
                 Digital Reality
               </span>
            </div>
          </h1>
          
          <div className="overflow-hidden">
             <p className="word-anim text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
               A high-fidelity spatial interface designed for the future. 
               Experience content with physics-based motion and depth.
             </p>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="word-anim flex flex-col md:flex-row gap-5 items-center justify-center w-full">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
               Get Started <ChevronRight size={20} />
            </span>
          </button>
          
          <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-medium transition-all hover:border-white/20">
            View Documentation
          </button>
        </div>
      </section>

      {/* --- LAYER 2: SPOTLIGHT GRID --- */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
           <div className="w-12 h-1 bg-violet-500 rounded-full" />
           <h3 className="text-2xl font-bold text-white">Core Features</h3>
        </div>

        {/* Spotlight Container */}
        <div 
          ref={gridContainerRef}
          onMouseMove={handleMouseMove}
          className="group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative"
        >
           {/* Spotlight Overlay */}
           <div 
             className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
             style={{
               background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`
             }}
           />
           
           {/* Feature Cards */}
           {features.map((feature, index) => (
             <div 
               key={index} 
               className="relative h-full p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm group/card"
             >
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-6 group-hover/card:scale-110 group-hover/card:bg-violet-500/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
             </div>
           ))}
        </div>
      </section>

      {/* --- LAYER 3: CTA --- */}
      <section className="cta-section relative z-10 px-6 py-32">
        <div className="cta-container max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden border border-white/10 bg-gray-900/40 backdrop-blur-xl">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-violet-500/10 to-transparent opacity-50" />
          <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-indigo-600/30 blur-[120px] rounded-full animate-pulse" />

          <div className="relative z-10 p-12 md:p-20 text-center">
            <Layers size={48} className="mx-auto mb-6 text-violet-400" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to transcend the <br /> 
              <span className="text-gray-500">ordinary interface?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of users experiencing the next generation of interaction.
            </p>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all hover:scale-105"
            >
              Get Started Now 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
}