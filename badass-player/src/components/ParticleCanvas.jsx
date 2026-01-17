import { useEffect, useRef } from "react";

export default function ParticleCanvas({ engine }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); // Start off-screen

  // Configuration
  const CONFIG = {
    particleCount: engine ? 120 : 70,
    connectionDistance: 120, // Max distance to draw lines
    baseSpeed: 0.5,
    boostSpeed: 2.5, // Speed when 'engine' is active
    mouseRadius: 150, // Interaction radius
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    // --- Resize Handler ---
    const handleResize = () => {
      // Set canvas size to match the parent container or window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // --- Mouse Handlers ---
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    // --- Particle Logic ---
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.vy = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.size = Math.random() * 2 + 0.5;
        this.hue = Math.random() * 60 + 240; // Blue to Purple (240-300)
        this.life = Math.random(); // Used for twinkling
      }

      update() {
        // 1. Basic Movement
        // If engine is on, boost speed, otherwise normal drift
        const currentSpeed = engine ? CONFIG.boostSpeed : CONFIG.baseSpeed;
        
        // Add a slight "flow" to the right if engine is active
        const flowX = engine ? 1.5 : 0; 

        this.x += this.vx * currentSpeed + flowX;
        this.y += this.vy * currentSpeed;

        // 2. Mouse Interaction (Repulsion)
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.mouseRadius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (CONFIG.mouseRadius - distance) / CONFIG.mouseRadius;
          const repulsionStrength = 3;
          
          this.vx += forceDirectionX * force * repulsionStrength * 0.1;
          this.vy += forceDirectionY * force * repulsionStrength * 0.1;
        }

        // 3. Screen Wrapping
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // 4. Twinkle Logic
        this.life += 0.02;
        this.alpha = Math.abs(Math.sin(this.life)) * 0.5 + 0.2;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Using screen blend mode allows colors to add up nicely
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.alpha})`;
        ctx.shadowBlur = engine ? 15 : 5; // More glow when active
        ctx.shadowColor = `hsla(${this.hue}, 80%, 60%, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Create a trail effect by clearing with opacity
      // If engine is fast, use less opacity for longer trails
      ctx.fillStyle = `rgba(10, 10, 15, ${engine ? 0.2 : 0.4})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Connections (Constellation effect)
      particles.forEach((p1, i) => {
        // Only check particles after this one to avoid double checking
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.connectionDistance) {
            ctx.beginPath();
            // Opacity based on distance (closer = brighter)
            const opacity = 1 - dist / CONFIG.connectionDistance;
            ctx.strokeStyle = `hsla(${p1.hue}, 50%, 50%, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      // Update and Draw Particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    
    handleResize();
    init();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 bg-neutral-950 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        // Blend mode 'screen' or 'lighter' creates beautiful additive color mixing
        style={{ mixBlendMode: "screen" }} 
      />
      
      {/* Optional: Vignette overlay for cinematic depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
    </div>
  );
}