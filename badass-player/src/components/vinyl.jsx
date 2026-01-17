import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function Vinyl({ playing }) {
  const containerRef = useRef();
  const vinylGroupRef = useRef(); // Group to separate tilt from spin
  const discRef = useRef();      // The actual spinning disc
  const rendererRef = useRef();
  const frameRef = useRef();

  // --- Helper: Generate Vinyl Groove Texture Programmatically ---
  // This creates a bump map without needing external image assets
  const createGrooveTexture = () => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Fill Black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, size, size);

    // Draw thousands of tiny concentric circles (Grooves)
    const center = size / 2;
    ctx.strokeStyle = "#333"; // Dark grey lines
    ctx.lineWidth = 1;
    
    // Create noise pattern
    for (let r = 160; r < center - 10; r += 0.8) {
       // Randomize intensity slightly for realism
       const intensity = Math.random() * 50 + 20; 
       ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
       ctx.beginPath();
       ctx.arc(center, center, r, 0, Math.PI * 2);
       ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16; // Sharper texture at angles
    return texture;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Tone mapping for realistic lighting falloff
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.toneMappingExposure = 1.0;
    
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Object Hierarchy
    // Group holds the tilt. Disc holds the spin.
    const group = new THREE.Group();
    scene.add(group);
    vinylGroupRef.current = group;

    // 3. Materials & Geometry
    const grooveMap = createGrooveTexture();

    // The Black Vinyl Disc
    const discGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.02, 128);
    const discMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.4,
      clearcoat: 0.8,         // The shiny plastic layer
      clearcoatRoughness: 0.1,
      bumpMap: grooveMap,     // The grooves
      bumpScale: 0.02,
      reflectivity: 0.5,
    });
    
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.rotation.x = Math.PI / 2; // Lie flat
    group.add(disc);
    discRef.current = disc;

    // The Label (Sticker)
    const labelGeometry = new THREE.CircleGeometry(0.48, 64);
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 512;
    const lCtx = labelCanvas.getContext('2d');
    
    // Draw a cool gradient label
    const grd = lCtx.createLinearGradient(0, 0, 512, 512);
    grd.addColorStop(0, '#7c3aed'); // Violet
    grd.addColorStop(1, '#2563eb'); // Blue
    lCtx.fillStyle = grd;
    lCtx.fillRect(0, 0, 512, 512);
    
    // Add text/rings to label
    lCtx.beginPath();
    lCtx.strokeStyle = "rgba(255,255,255,0.2)";
    lCtx.lineWidth = 4;
    lCtx.arc(256, 256, 200, 0, Math.PI*2);
    lCtx.stroke();

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: labelTexture,
        toneMapped: false 
    });
    
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.z = 0.011; // Slightly above disc surface
    disc.add(label); // Add to disc so it spins with it

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Key Light (Warm/Purple)
    const keyLight = new THREE.PointLight(0xd8b4fe, 5, 10);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    // Rim Light (Cyan/Cool for edge highlight)
    const rimLight = new THREE.PointLight(0x22d3ee, 4, 10);
    rimLight.position.set(-3, -2, 2);
    scene.add(rimLight);

    // 5. Animation Loop
    let rotationSpeed = 0;
    
    const animate = () => {
      // Smooth start/stop physics for spin
      const targetSpeed = playing ? 0.03 : 0;
      rotationSpeed += (targetSpeed - rotationSpeed) * 0.05; // Ease in/out
      
      if (rotationSpeed > 0.0001) {
        disc.rotation.z -= rotationSpeed; // Spin around Z axis (since we rotated X)
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 6. Handle Resize
    const handleResize = () => {
       if (!containerRef.current) return;
       const w = containerRef.current.clientWidth;
       const h = containerRef.current.clientHeight;
       renderer.setSize(w, h);
       // Keep aspect ratio 1:1 for the view, but update renderer
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      // Clean up DOM
      if (container && renderer.domElement) container.removeChild(renderer.domElement);
    };
  }, [playing]);

  // --- Cinematic Tilt Effects (GSAP) ---
  useEffect(() => {
    if (!vinylGroupRef.current) return;

    if (playing) {
      // Active state: Tilted slightly back and to the side for style
      gsap.to(vinylGroupRef.current.rotation, {
        x: -0.2, // Tilt back
        y: -0.3, // Turn side
        duration: 1.2,
        ease: "power3.out"
      });
      gsap.to(vinylGroupRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.8
      });
    } else {
      // Idle state: Flat and facing forward
      gsap.to(vinylGroupRef.current.rotation, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
      });
    }
  }, [playing]);

  return (
    <div className="relative group flex items-center justify-center">
      {/* Dynamic Glow Background */}
      <div className={`absolute w-[90%] h-[90%] rounded-full bg-gradient-to-tr from-violet-600/30 to-blue-600/30 blur-[60px] transition-all duration-1000 ${playing ? "opacity-100 scale-110" : "opacity-30 scale-90"}`} />
      
      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        className="relative z-10 w-[280px] h-[280px] md:w-[320px] md:h-[320px] lg:w-[380px] lg:h-[380px]"
      />

      {/* Spindle (Static Center Detail) */}
      <div className="absolute z-20 w-3 h-3 bg-neutral-900 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] pointer-events-none" />
    </div>
  );
}