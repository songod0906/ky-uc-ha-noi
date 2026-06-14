import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

interface PanoramicVideoViewerProps {
  url: string;
  onClose: () => void;
}

function VideoSphere({ video }: { video: HTMLVideoElement }) {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1; // Flip horizontally like static panos
    tex.offset.x = 1;
    setTexture(tex);

    return () => {
      tex.dispose();
    };
  }, [video]);

  if (!texture) return null;

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export function PanoramicVideoViewer({ url, onClose }: PanoramicVideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.muted = false;
    
    videoRef.current = video;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleCanPlay = () => setLoading(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('canplay', handleCanPlay);

    video.play().catch(err => {
      console.log("Autoplay failed, playing muted or waiting for interaction:", err);
      video.muted = true;
      setIsMuted(true);
      video.play().catch(e => console.error("Play failed completely:", e));
    });

    return () => {
      video.pause();
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('canplay', handleCanPlay);
      video.src = '';
      video.load();
    };
  }, [url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col">
      {/* Three.js Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        {videoRef.current && !loading && (
          <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
            <VideoSphere video={videoRef.current} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.4}
              makeDefault
            />
          </Canvas>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-serif z-10">
            Đang tải video 360°...
          </div>
        )}

        {/* Drag Hint overlay */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <span className="bg-black/55 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-xs font-serif shadow-lg border border-white/10">
            Kéo để nhìn xung quanh toàn cảnh 360°
          </span>
        </div>

        {/* Top bar controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-white font-serif shadow-lg pointer-events-auto">
            Góc nhìn Toàn cảnh (360° Video)
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white flex items-center justify-center shadow-lg transition-all pointer-events-auto active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom controls panel */}
        <div className="absolute bottom-4 inset-x-4 flex justify-center z-20 pointer-events-none">
          <div className="w-full max-w-2xl bg-black/65 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl flex flex-col gap-3 pointer-events-auto">
            {/* Seeker bar */}
            <div className="flex items-center gap-3 w-full">
              <span className="font-mono text-xs text-white/70 select-none">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-yellow-400 bg-white/20 h-1 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs text-white/70 select-none">
                {formatTime(duration)}
              </span>
            </div>

            {/* Playback action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center transition-all active:scale-95 shadow-md"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-95"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                360 Video Player
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
