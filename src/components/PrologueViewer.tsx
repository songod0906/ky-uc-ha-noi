import { motion } from 'motion/react';
import { PanoramaViewer } from './PanoramaViewer';
import { DE_LA_THANH_NODES } from '../data/stories';

const MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!4v1781153201193!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJQ0JpdFNsVVE.!2m2!1d21.02346815940092!2d105.8194551494558!3f288.85439157941465!4f-5.542974504707246!5f0.7820865974627469';

export function PrologueViewer({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="h-screen flex relative overflow-hidden bg-black">
      {/* Left panel: current state (DJI 360, 2026 demolished) */}
      <div className="w-1/2 h-full relative">
        <PanoramaViewer
          nodes={DE_LA_THANH_NODES}
          collectedIds={[]}
          onCollect={() => {}}
          allClues={[]}
        />
        <div className="absolute top-4 left-4 z-50 bg-black/70 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg pointer-events-none">
          2026 · Đang bị phá dỡ
        </div>
      </div>

      {/* Center divider */}
      <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-white/40 z-50 pointer-events-none" />

      {/* Right panel: Google Maps Street View 2022 */}
      <div className="w-1/2 h-full relative">
        <iframe
          src={MAPS_EMBED}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Đê La Thành 2022"
        />
        <div className="absolute top-4 right-4 z-50 bg-black/70 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg pointer-events-none">
          2022 · Phố Đê La Thành
        </div>
      </div>

      {/* Bottom gradient + title + enter button */}
      <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-8 pt-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center max-w-lg px-4"
        >
          <h1 className="font-serif text-2xl font-bold text-white drop-shadow-lg tracking-wide">
            Đê La Thành không phải nơi duy nhất.
          </h1>
          <p className="font-serif text-sm text-white/75 mt-2 leading-relaxed">
            Hai người lớn lên ở những khu phố đang chịu cùng số phận —<br />
            những ngõ nhỏ, sân chơi, giếng làng sắp bị xóa.
          </p>
          <p className="font-serif text-xs text-white/45 mt-1.5 italic">
            Đây là ký ức của họ, trước khi không còn gì để nhớ.
          </p>
        </motion.div>

        <motion.button
          onClick={onEnter}
          className="mt-5 pointer-events-auto px-8 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-serif text-sm rounded-xl backdrop-blur-sm transition-all"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          whileHover={{ scale: 1.03 }}
        >
          Nghe câu chuyện của họ →
        </motion.button>
      </div>
    </div>
  );
}
