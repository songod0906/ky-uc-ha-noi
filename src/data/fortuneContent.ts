// Fortune teller content for TRANG story (LTK / Khu Thành Công)
// Each key = "DIR-PANEL" (direction + panel number 1-4)
// Content drawn from actual transcript quotes and voiceNotes

export interface FortuneReveal {
  text: string;
  isQuote: boolean; // true → render in italics with quote marks
  spaceHint?: 'cong-truong' | 'ho-thanh-cong' | 'quan-net'; // subtle glow on this space chip
}

// Maps each direction to the space it navigates to.
// ĐÔNG has no destination — it reveals cross-cutting memories without moving.
export const TRANG_DIR_SPACES: Record<string, string | null> = {
  B: 'cong-truong',    // BẮC  → cổng trường (buổi sáng)
  N: 'ho-thanh-cong',  // NAM  → hồ Thành Công (buổi chiều)
  T: 'quan-net',       // TÂY  → quán net / nhà mình (buổi tối)
  Đ: null,             // ĐÔNG → điều không thể di chuyển (no space change)
};

export const TRANG_FORTUNE: Record<string, FortuneReveal> = {
  // ───── BẮC (3 opens) — cổng trường, buổi sáng ─────
  'B-1': {
    text: '"Ngày xưa tiếng trống vang lên mà đang đứng ăn kem chanh ở cổng thì thấy vội và sợ lắm."',
    isQuote: true,
    spaceHint: 'cong-truong',
  },
  'B-2': {
    text: 'Tiệm thuê truyện Doraemon — hai đến ba nghìn một ngày. LTK gọi đó là "sharing economy đầu tiên mình biết, trước cả Grab."',
    isQuote: false,
    spaceHint: 'cong-truong',
  },
  'B-3': {
    text: '"Không có điều hòa thì cửa phải mở — nên nghe được tất cả: tiếng chim, tiếng lớp bên, tiếng thầy cô sang mắng nhau."',
    isQuote: true,
    spaceHint: 'cong-truong',
  },
  'B-4': {
    text: 'Kem son — thỏi kem nhìn như son môi, vặn lên rồi liếm. Kem chanh vì lớp không có điều hòa. Khi lắp điều hòa, cả hai đều biến mất.',
    isQuote: false,
    spaceHint: 'cong-truong',
  },

  // ───── NAM (3 opens) — hồ Thành Công, buổi chiều ─────
  'N-1': {
    text: '"Anh chả quan tâm đến hồ Thành Công. Ngày xưa bị ép tập đi xe đạp là không thấy thích rồi."',
    isQuote: true,
    spaceHint: 'ho-thanh-cong',
  },
  'N-2': {
    text: '"Con người Thành Công chả bao giờ đi cửa chính." Cửa sau nhỏ, phải lách xe. Chính sách dỡ hàng rào công viên — cửa đó không còn.',
    isQuote: false,
    spaceHint: 'ho-thanh-cong',
  },
  'N-3': {
    text: '"Buổi chiều nào cũng có nhạc aerobic vang ra từ cái loa sắt cũ ở sân — đó là dấu hiệu chiều đã về."',
    isQuote: true,
    spaceHint: 'ho-thanh-cong',
  },
  'N-4': {
    text: 'Hồ Thành Công hồi đó: bê tông gập ghềnh, nhiều chó, mùi tanh vì cá nổi lềnh bềnh. LTK thích tập xe ở sân nhà hơn — không ai nhìn thấy ngã.',
    isQuote: false,
    spaceHint: 'ho-thanh-cong',
  },

  // ───── TÂY (3 opens) — quán net / về nhà ─────
  'T-1': {
    text: '"Come out luôn là nhà mình mở quán net. Đấy là một tuổi thơ tuyệt vời. Quán net còn có điều hòa."',
    isQuote: true,
    spaceHint: 'quan-net',
  },
  'T-2': {
    text: 'Màn hình CRT to đùng. Tiếng Audition "cọc cọc cọc cọc". Tiếng chửi nhau "hi hi ha ha". Không ai biết nhà LTK mở quán — ngoài người trong nhà.',
    isQuote: false,
    spaceHint: 'quan-net',
  },
  'T-3': {
    text: '"Về nhà chơi net" — nghĩa đen là về nhà rồi chơi net. Tan học, bỏ cặp, ngồi xuống. Không cần tiền. Không cần xin phép.',
    isQuote: false,
    spaceHint: 'quan-net',
  },
  'T-4': {
    text: 'Bạn bè đến chơi — không biết đây là quán nhà LTK. Chỉ biết "cái chỗ có điều hòa mát, chơi được lâu." Bí mật lớn nhất của một đứa trẻ.',
    isQuote: false,
    spaceHint: 'quan-net',
  },

  // ───── ĐÔNG (4 opens) — khu tập thể, điều không thể di chuyển ─────
  'Đ-1': {
    text: '"Một môi trường sống nguyên cả một khu phố là khu tập thể, tất cả biết nhau và sinh hoạt chỉ trong một phố — rất hiếm."',
    isQuote: true,
  },
  'Đ-2': {
    text: 'Khi giải tỏa, không chỉ nhà mất đi. Cái cách người ta sống cùng nhau cũng mất theo. Sống chung cư bây giờ — không ai biết tên hàng xóm.',
    isQuote: false,
  },
  'Đ-3': {
    text: 'LTK biết ít nhất ba đường từ trường về nhà qua các ngõ nhỏ trong khu. Không cần đường chính. Đó là tri thức chỉ người ở đây mới có.',
    isQuote: false,
  },
  'Đ-4': {
    text: '"Mình đi qua con phố đó hàng ngày — bây giờ mình không đi qua nữa vì nó không còn tồn tại." Cái mất không phải là nơi chốn. Là thói quen.',
    isQuote: false,
  },
};
