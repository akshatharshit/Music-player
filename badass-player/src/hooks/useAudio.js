import { useEffect, useRef, useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";

export function useAudio(src) {
  const engineRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    engineRef.current = new AudioEngine(src);

    engineRef.current.audio.onloadedmetadata = () => {
      setDuration(engineRef.current.duration);
    };

    const tick = () => {
      if (playing) setPos(engineRef.current.current);
      requestAnimationFrame(tick);
    };
    tick();

    return () => {
      engineRef.current.audio.pause();
      engineRef.current.ctx.close();
    };
  }, [src]);

  const play = () => {
    engineRef.current.play();
    setPlaying(true);
  };

  const pause = () => {
    engineRef.current.pause();
    setPlaying(false);
  };

  const seek = (t) => {
    engineRef.current.seek(t);
    setPos(t);
  };

  return {
    playing,
    play,
    pause,
    seek,
    pos,
    duration,
    engine: engineRef.current,
  };
}
