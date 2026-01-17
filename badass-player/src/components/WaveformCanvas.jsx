import { useEffect, useRef } from "react";

export default function WaveformCanvas({ engine, active }) {
  const canvasRef = useRef();
  const rafRef = useRef();
  
  // Store previous frame data for smoothing (Lerp)
  const previousDataRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Configure high-DPI canvas
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Linear Interpolation helper for smoothness
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    let time = 0; // For idle animation

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const midY = height / 2;
      const midX = width / 2;

      ctx.clearRect(0, 0, width, height);

      // --- IDLE STATE (Breathing Sine Wave) ---
      if (!engine || !active) {
        time += 0.05;
        ctx.beginPath();
        const idleBarCount = 40;
        const spacing = width / idleBarCount;

        for (let i = 0; i <= idleBarCount; i++) {
          const x = i * spacing;
          // Create a gentle sine wave that moves
          const wave = Math.sin(i * 0.3 + time) * (height * 0.15); 
          // taper edges to 0 so it doesn't look cut off
          const taper = Math.sin((i / idleBarCount) * Math.PI); 
          
          const barHeight = Math.max(2, Math.abs(wave * taper));

          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.beginPath();
          ctx.roundRect(x - 1, midY - barHeight / 2, 2, barHeight, 2);
          ctx.fill();
        }
        
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // --- ACTIVE STATE (Frequency Data) ---
      const rawData = engine.getWaveformData(); // returns 0-255 Uint8Array
      const bufferLength = rawData.length;
      
      // We only want the lower-mid frequencies (usually the first 60% of the buffer)
      // because high-end frequencies often have little visual activity.
      const sliceSize = Math.floor(bufferLength * 0.6);
      
      // Determine number of bars based on width (prevent overcrowding)
      const barWidth = 4;
      const gap = 2;
      const totalBarWidth = barWidth + gap;
      const maxBars = Math.floor(width / totalBarWidth);
      
      // How many data points per bar (downsampling)
      const step = Math.floor(sliceSize / maxBars);

      // Initialize previous data if empty
      if (previousDataRef.current.length !== maxBars) {
        previousDataRef.current = new Array(maxBars).fill(0);
      }

      // --- RENDER LOOP ---
      for (let i = 0; i < maxBars; i++) {
        // Average value for this chunk (simple downsampling)
        let sum = 0;
        for (let j = 0; j < step; j++) {
           const dataIndex = i * step + j;
           if (dataIndex < rawData.length) sum += rawData[dataIndex];
        }
        const avg = sum / step;

        // Normalize (0.0 to 1.0) - Audio data is usually 128 silence
        // We assume getWaveformData() returns 0-255 frequency data here. 
        // If using getByteFrequencyData: value 0-255.
        // If using getByteTimeDomainData: value 128 is 0.
        // Assuming Frequency Data for a visualizer (bars):
        const normalized = avg / 255;

        // SMOOTHING: Interpolate current value with previous frame
        const currentHeight = lerp(previousDataRef.current[i], normalized * height * 0.8, 0.2);
        previousDataRef.current[i] = currentHeight;

        // Calculate symmetry positions
        // We draw from center (midX) outwards to left and right
        const xRight = midX + (i * totalBarWidth);
        const xLeft = midX - (i * totalBarWidth) - totalBarWidth;

        // Gradient & Style
        // Dynamic color based on height intensity
        const hue = 260 + (normalized * 40); // 260(Purple) -> 300(Pink)
        const alpha = 0.4 + (normalized * 0.6);
        
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
        ctx.shadowBlur = 0; // Performance: avoid heavy blur per bar
        
        // Draw Right Bar
        if (xRight < width) {
            ctx.beginPath();
            ctx.roundRect(xRight, midY - currentHeight / 2, barWidth, Math.max(4, currentHeight), 4);
            ctx.fill();
        }

        // Draw Left Bar
        if (xLeft > 0) {
            ctx.beginPath();
            ctx.roundRect(xLeft, midY - currentHeight / 2, barWidth, Math.max(4, currentHeight), 4);
            ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [engine, active]);

  return (
    <div className="w-full h-full relative group">
      {/* Decorative Glow Container */}
      <div className={`absolute inset-0 bg-neon-purple/20 blur-[40px] rounded-full transition-opacity duration-1000 ${active ? "opacity-60" : "opacity-10"}`} />
      
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}