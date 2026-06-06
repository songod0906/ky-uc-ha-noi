import { motion } from 'motion/react';
import { Story } from '../types';
import { ALL_STORIES } from '../data/stories';
import { MapPin, ArrowRight } from 'lucide-react';
import { AudioSynth } from '../utils/AudioSynth';

interface StorySelectorProps {
  onSelect: (story: Story) => void;
}

const COVER_IMAGES = {
  trang: 'https://images.unsplash.com/photo-1596401057633-5310d57f2615?auto=format&fit=crop&w=600&q=80',
  essy: 'https://images.unsplash.com/photo-1505995433366-e12047f3f144?auto=format&fit=crop&w=600&q=80',
};

export function StorySelector({ onSelect }: StorySelectorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-3xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-muctim">Chọn câu chuyện</h2>
          <p className="font-serif text-muctim-faded mt-2 text-sm">
            Hai người, hai khu phố, một ngày bình thường sắp biến mất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_STORIES.map((story, i) => (
            <motion.button
              key={story.id}
              className="group relative overflow-hidden rounded-3xl border-2 border-muctim/10 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              onClick={() => {
                AudioSynth.playSnap();
                onSelect(story);
              }}
            >
              {/* Cover image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={(COVER_IMAGES as Record<string, string>)[story.id]}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `linear-gradient(to top, ${story.coverColor} 0%, transparent 60%)`,
                  }}
                />
                {/* Narrator badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: story.coverColor }} />
                  <span className="font-mono text-[10px] text-muctim uppercase tracking-widest font-bold">
                    {story.narrator}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-xl font-bold text-muctim">{story.title}</h3>
                  <ArrowRight className="w-5 h-5 text-muctim-faded group-hover:text-muctim group-hover:translate-x-1 transition-all mt-0.5 flex-shrink-0" />
                </div>
                <p className="font-serif text-sm text-muctim-faded leading-relaxed mb-4">
                  {story.subtitle}
                </p>

                {/* Spaces preview */}
                <div className="flex gap-2 flex-wrap">
                  {story.spaces.map((space) => (
                    <span
                      key={space.id}
                      className="flex items-center gap-1 bg-nangthu-glow/60 px-2.5 py-1 rounded-lg text-xs font-serif text-muctim"
                    >
                      <MapPin className="w-3 h-3 text-nangthu" />
                      {space.label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
