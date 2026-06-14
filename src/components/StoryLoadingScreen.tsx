import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Story } from '../types';

interface Props {
  story: Story;
  spaceIdx: number;
  onReady: () => void;
}

function getImageUrls(story: Story, spaceIdx: number): string[] {
  const urls: string[] = [];
  story.spaces.forEach((space, i) => {
    if (space.bgTourNodes?.length) {
      if (i === spaceIdx) {
        space.bgTourNodes.forEach(n => urls.push(n.panorama));
      } else {
        urls.push(space.bgTourNodes[0].panorama);
      }
    }
    if (space.bgImage) urls.push(space.bgImage);
  });
  return [...new Set(urls)];
}

function prefetchAudio(story: Story) {
  story.spaces.forEach(space => {
    if (space.bgTourAmbient) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = space.bgTourAmbient;
    }
    if (space.audioSegment?.src) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = space.audioSegment.src;
    }
  });
}

function loadImage(src: string): Promise<void> {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

const MESSAGES = [
  'Đang thức dậy ký ức...',
  'Lắng nghe tiếng phố xưa...',
  'Nhặt lại những mảnh ký ức...',
  'Chuẩn bị không gian 360°...',
];

export function StoryLoadingScreen({ story, spaceIdx, onReady }: Props) {
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(1);
  const [msgIdx, setMsgIdx] = useState(0);
  const onReadyRef = useRef(onReady);
  const loadedRef = useRef(0);

  useEffect(() => { onReadyRef.current = onReady; });

  // Rotate loading messages every 2.2s
  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const urls = getImageUrls(story, spaceIdx);
    prefetchAudio(story);

    if (urls.length === 0) {
      setTimeout(() => onReadyRef.current(), 600);
      return;
    }

    setTotal(urls.length);
    loadedRef.current = 0;

    const promises = urls.map(url =>
      loadImage(url).then(() => {
        loadedRef.current++;
        setLoaded(loadedRef.current);
      })
    );

    Promise.all(promises).then(() => {
      setTimeout(() => onReadyRef.current(), 350);
    });
  }, [story, spaceIdx]);

  const pct = Math.round((loaded / total) * 100);
  const space = story.spaces[spaceIdx];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#080604' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle vignette texture */}
      <div className="absolute inset-0 pointer-events-none vintage-vignette opacity-60" />

      {/* Accent glow behind title */}
      <div
        className="absolute w-96 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none"
        style={{ background: story.spaces[0]?.bgTone ?? '#d4af37' }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-3 text-center px-8 mb-16">
        <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.25em]">
          Ký Ức Hà Nội
        </p>

        <h1 className="font-serif text-4xl md:text-5xl text-amber-50/90 leading-tight mt-1">
          {story.narrator}
        </h1>

        <p className="font-serif text-sm text-white/40 italic leading-relaxed max-w-xs">
          {story.title}
        </p>

        {space && (
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mt-1">
            {space.label}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative w-56 flex flex-col items-center gap-3">
        <div className="w-full h-[1px] bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'rgba(212,175,55,0.7)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </div>

        <motion.p
          key={pct === 100 ? 'done' : msgIdx}
          className="font-mono text-[9px] text-white/25 tracking-widest"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4 }}
        >
          {pct === 100 ? 'Sẵn sàng' : MESSAGES[msgIdx]}
        </motion.p>
      </div>
    </motion.div>
  );
}
