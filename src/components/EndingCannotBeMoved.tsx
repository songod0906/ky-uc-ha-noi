import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Story } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { RotateCcw, FileText, Send, Sparkles } from 'lucide-react';
import { CompassMotif } from './CompassMotif';

interface EndingCannotBeMovedProps {
  story: Story;
  onRestart: () => void;
  onChooseOther: () => void;
}

const DIGITAL_ARTIFACTS: Record<string, { name: string; desc: string; icon: string }> = {
  'trang': {
    name: 'Hộp Sắt Thẻ Sưu Tầm & Màn Hình CRT',
    desc: 'Lưu giữ những chiếc thẻ Vinamilk/thẻ bóng đá và âm thanh Audition lách cách trong căn phòng quán net có điều hòa.',
    icon: '📦',
  },
  'thai-thinh': {
    name: 'Cây Vĩ Cầm Gỗ & Bát Ốc Luộc Vỉa Hè',
    desc: 'Lưu giữ âm thanh violin mộc mạc bên bàn ốc luộc và cảm giác khao khát được dừng lại chơi đùa ở sân tập thể.',
    icon: '🎻',
  },
  'essy': {
    name: 'Mảnh Gạch Sân Chung & Gáo Nước Giếng Cổ',
    desc: 'Lưu giữ mùi hương chanh sả, hoa nhài của khoảng sân chung biệt lập và tri thức địa phương về ngõ ngách mê cung.',
    icon: '🧱',
  },
};

const PRESET_MESSAGES: Record<string, Array<{ author: string; text: string; time: string }>> = {
  'trang': [
    { author: 'Hoàng Nam, 28 tuổi', text: 'Hồi bé cứ chiều tan học là trốn mẹ ra quán net cổng trường chơi Half-Life. Bây giờ khu tập thể đó giải tỏa hết rồi, đi qua thấy lòng thắt lại.', time: '1 ngày trước' },
    { author: 'Minh Trang, 24 tuổi', text: 'Hồ Thành Công ngày xưa gập ghềnh lắm, nhớ bố dắt đi tập xe ngã trầy cả đầu gối. Giờ hồ sạch đẹp hơn nhưng không còn bóng dáng bố nữa.', time: '3 ngày trước' },
  ],
  'thai-thinh': [
    { author: 'Ngọc Anh, 26 tuổi', text: 'Hồi lớp 1 đi học thêm ngõ Trung Liệt cũng thèm vào cái sân chơi tập thể đó kinh khủng, mà mẹ cứ lôi xềnh xệch đi. Đọc câu chuyện của Trang thấy giống mình quá.', time: '2 ngày trước' },
    { author: 'Tuấn Hải, 30 tuổi', text: 'Nhớ mãi tiếng đàn violin ở quán ốc. Bác chủ quán ngày xưa vui tính cực kỳ, giờ phố ẩm thực ồn ào quá chả còn những khoảnh khắc nghệ sĩ như thế.', time: '5 ngày trước' },
  ],
  'essy': [
    { author: 'Thùy Linh, 25 tuổi', text: 'Ngõ Hoàng Hoa Thám đúng là mê cung thật, Grab toàn chịu chết phải ra đầu ngõ đón. Nhưng ngõ mát lắm, hàng xóm thì quen hết mặt nhau, giờ thông đường lớn thấy cứ xa cách thế nào.', time: '1 ngày trước' },
    { author: 'Thanh Sơn, 29 tuổi', text: 'Nhớ cái giếng cổ và mùi hoa nhài tối tối đi dạo cùng bà ngoại. Hà Nội đô thị hóa nhanh quá, những khoảng xanh yên bình cứ mất dần.', time: '4 ngày trước' },
  ],
};

const SWEEP_TEXTS: Record<string, string[]> = {
  'trang': [
    'Hà Nội, năm 2026.',
    'Dự án quy hoạch cải tạo lòng đường và xây dựng đô thị mới khu Thành Công chính thức khởi động.',
    'Tiếng máy xúc và búa đập vang lên bên hồ. Các dãy nhà tập thể cũ bắt đầu đổ xuống...',
    'Sân trường mở rộng, tiệm thuê truyện, quán net cỏ xưa kia vĩnh viễn tan biến dưới lớp cát bụi công trình.',
    'Nhưng những mảnh vụn ký ức của Lê Trung Kiên đã được bạn tìm thấy và bảo tồn thành công.',
    'Hồ sơ ký ức đã được niêm phong vào Kho Lưu Trữ Kỹ Thuật Số.',
  ],
  'thai-thinh': [
    'Hà Nội, năm 2026.',
    'Dự án mở rộng đường Nguyễn Văn Tuyết hoàn tất giải phóng mặt bằng.',
    'Lớp học ngõ nhỏ bị phá dỡ. Sân chơi tập thể cũ rào kín tháo dỡ hoàn toàn...',
    'Tiếng đàn violin của quán ốc nhỏ vỉa hè tắt lịm dưới tiếng còi xe và dòng người tấp nập ngược xuôi.',
    'Nhưng những mảnh vụn ký ức của Trang đã được bạn tìm thấy và bảo tồn thành công.',
    'Hồ sơ ký ức đã được niêm phong vào Kho Lưu Trữ Kỹ Thuật Số.',
  ],
  'essy': [
    'Hà Nội, năm 2026.',
    'Tuyến đường dốc Tam Đa cắt ngang lòng ngõ 267 Hoàng Hoa Thám chính thức thông xe.',
    'Dãy nhà biệt lập bị thu hồi, bức tường đổ xuống, cây chanh và hoa nhài bị chặt hạ...',
    'Giếng cổ bị lấp hoàn toàn, những con ngõ mê cung sâu hun hút biến mất vĩnh viễn dưới lớp nhựa đường phẳng lì.',
    'Nhưng những mảnh vụn ký ức của Essy đã được bạn tìm thấy và bảo tồn thành công.',
    'Hồ sơ ký ức đã được niêm phong vào Kho Lưu Trữ Kỹ Thuật Số.',
  ],
};

export function EndingCannotBeMoved({ story, onRestart, onChooseOther }: EndingCannotBeMovedProps) {
  const [sweepPhase, setSweepPhase] = useState<'intro' | 'showCase'>('intro');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [guestbook, setGuestbook] = useState<Array<{ author: string; text: string; time: string }>>([]);
  const [newMsg, setNewMsg] = useState('');
  const [newName, setNewName] = useState('');

  const lines = SWEEP_TEXTS[story.id] ?? [
    'Hà Nội, năm 2026.',
    'Quy hoạch giải tỏa mặt bằng khu phố.',
    'Những không gian cũ đã biến mất dưới lớp nhựa đường.',
    'Nhưng ký ức đã được lưu trữ thành công.',
  ];

  useEffect(() => {
    AudioSynth.stopAmbient();
  }, []);

  // Typewriter effect controller
  useEffect(() => {
    if (sweepPhase !== 'intro') return;
    if (typewriterIndex < lines.length) {
      const timer = setTimeout(() => {
        setTypewriterIndex((prev) => prev + 1);
      }, 1500); // Reveal a line every 1.5s
      return () => clearTimeout(timer);
    }
  }, [typewriterIndex, sweepPhase, lines.length]);

  // Load guestbook messages
  useEffect(() => {
    const key = `hanoi_guestbook_${story.id}`;
    const stored = localStorage.getItem(key);
    const defaults = PRESET_MESSAGES[story.id] ?? [];
    if (stored) {
      try {
        setGuestbook(JSON.parse(stored));
      } catch (e) {
        setGuestbook(defaults);
      }
    } else {
      setGuestbook(defaults);
      localStorage.setItem(key, JSON.stringify(defaults));
    }
  }, [story.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const author = newName.trim() || 'Người gửi giấu tên';
    const entry = {
      author,
      text: newMsg.trim(),
      time: 'Vừa xong',
    };

    const updated = [entry, ...guestbook];
    setGuestbook(updated);
    localStorage.setItem(`hanoi_guestbook_${story.id}`, JSON.stringify(updated));
    setNewMsg('');
    setNewName('');
    AudioSynth.playPluck(523, 1.5, 0.4); // successful chime sound
  };

  const artifact = DIGITAL_ARTIFACTS[story.id];

  // ── Sweep intro typewriter phase ──
  if (sweepPhase === 'intro') {
    return (
      <div className="h-screen bg-[#080706] text-amber-100/90 font-mono text-xs flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        {/* Analog scanline grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 12, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%'
        }} />
        <div className="absolute inset-0 vintage-vignette opacity-60 pointer-events-none" />

        <div className="w-full max-w-md flex flex-col gap-4 text-left leading-relaxed">
          {lines.slice(0, typewriterIndex).map((line, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={idx === lines.length - 1 ? "text-amber-400 font-bold mt-2" : ""}
            >
              &gt; {line}
            </motion.p>
          ))}

          {typewriterIndex >= lines.length && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={() => setSweepPhase('showCase')}
              className="mt-8 self-center px-6 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold transition-all active:scale-95 cursor-pointer"
            >
              Mở xem Hồ Sơ Lưu Trữ
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // ── Main case file page ──
  return (
    <div className="min-h-screen bg-[#FCFAF2] flex flex-col items-center justify-start px-6 py-12 relative overflow-y-auto">
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-muctim/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-lg flex flex-col"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Admin-style case header */}
        <div className="bg-white/80 backdrop-blur-sm border border-muctim/15 rounded-2xl p-5 mb-6 shadow-xs font-mono text-[10px] text-muctim-faded">
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            <div>
              <span className="opacity-50">SỐ HỒ SƠ</span>
              <br />
              <span className="text-muctim font-bold">
                {story.id === 'trang'
                  ? '#TC-CAS3020-2026'
                  : story.id === 'thai-thinh'
                  ? '#TL-CAS3020-2026'
                  : story.id === 'essy'
                  ? '#HHT-BD-2024-001'
                  : `GTC-2026-${story.id.toUpperCase()}`}
              </span>
            </div>
            <div>
              <span className="opacity-50">QUẬN</span>
              <br />
              <span className="text-muctim">
                {story.id === 'thai-thinh' ? 'Đống Đa' : 'Ba Đình'}
              </span>
            </div>
            <div><span className="opacity-50">TRẠNG THÁI</span><br /><span className="text-emerald-700 font-bold">ĐÃ NIÊM PHONG LƯU TRỮ</span></div>
            <div>
              <span className="opacity-50">THỜI GIAN SINH SỐNG</span>
              <br />
              <span className="text-muctim">Toàn bộ tuổi thơ</span>
            </div>
            <div><span className="opacity-50">DỰ ÁN QUY HOẠCH</span><br /><span className="text-terracotta">Nâng cấp & Mở rộng đường 2026</span></div>
            <div><span className="opacity-50">NARRATOR</span><br /><span className="text-muctim font-bold">{story.narrator}</span></div>
          </div>
        </div>

        {/* Unlocked Artifact display */}
        {artifact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-100/50 border border-amber-200/40 rounded-2xl p-4 mb-6 shadow-xs font-serif flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex-none flex items-center justify-center text-2xl border border-amber-500/10">
              {artifact.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Hiện vật đã bảo tồn
              </h4>
              <p className="text-sm font-bold text-stone-850 mt-1 mb-0.5">{artifact.name}</p>
              <p className="text-[11px] text-stone-600 leading-snug">{artifact.desc}</p>
            </div>
          </motion.div>
        )}

        {/* Section title */}
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-4 h-4 text-muctim-faded" />
          <h2 className="font-serif text-lg font-bold text-muctim">Những điều không thể mang đi</h2>
        </div>

        {/* The list */}
        <ul className="space-y-3.5 mb-8 pl-1">
          {story.cannotBeMoved.map((item, i) => (
            <motion.li
              key={i}
              className="font-serif text-xs text-muctim-faded leading-relaxed pl-3 border-l-2 border-muctim/10"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              {item}
            </motion.li>
          ))}
        </ul>

        {/* Guestbook message board */}
        <div className="border-t border-muctim/10 pt-6 mb-10 font-serif">
          <h3 className="text-sm font-bold text-muctim mb-1">Hà Nội trong tôi là...</h3>
          <p className="text-[11px] text-muctim-faded leading-relaxed mb-4">
            Hãy chia sẻ một dòng hồi ức của chính bạn về những khoảng không gian thơ ấu đã biến đổi tại Hà Nội để cùng ghi lại trong cuốn sổ tay này.
          </p>

          <form onSubmit={handleSend} className="flex flex-col gap-2.5 mb-6">
            <input
              type="text"
              placeholder="Tên của bạn hoặc biệt danh..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-1.5 rounded-xl border border-muctim/15 bg-white/50 focus:bg-white text-xs text-muctim outline-none placeholder:text-muctim/30 transition-all font-serif"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: Lối ngõ đầy lá rụng ngày mùa thu..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-muctim/15 bg-white/50 focus:bg-white text-xs text-muctim outline-none placeholder:text-muctim/30 transition-all font-serif"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-muctim text-white hover:bg-muctim/90 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-none"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Messages list */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {guestbook.map((msg, idx) => (
              <div key={idx} className="bg-white/40 border border-muctim/8 rounded-xl p-3 text-xs leading-relaxed">
                <p className="text-muctim-faded text-[11px]">{msg.text}</p>
                <div className="flex items-center justify-between mt-1.5 font-mono text-[9px] text-muctim/40">
                  <span>— {msg.author}</span>
                  <span>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-5 border-t border-muctim/10 pt-6">
          <CompassMotif size={44} />

          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-muctim/15 bg-white/75 font-serif text-xs font-semibold text-muctim hover:bg-white transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Lưu trữ lại từ đầu
            </button>
            <button
              onClick={onChooseOther}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-muctim text-white font-serif text-xs font-semibold hover:bg-muctim/85 transition-all shadow-sm cursor-pointer"
            >
              Quay về bản đồ
            </button>
          </div>

          <p className="font-mono text-[8px] text-muctim-faded uppercase tracking-widest text-center mt-2 pb-6">
            Dự án Ký ức Sổ Tay · CAS3020 · VinUniversity · 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
