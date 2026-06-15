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
    text: '"Back then, when the school drum sounded while you were eating lemon ice cream at the gate, you felt rushed and so scared."',
    isQuote: true,
    spaceHint: 'cong-truong',
  },
  'B-2': {
    text: 'Doraemon manga rental shop — two to three thousand VND a day. LTK called it the "first sharing economy I ever knew, even before Grab."',
    isQuote: false,
    spaceHint: 'cong-truong',
  },
  'B-3': {
    text: '"Without air conditioning, the doors had to stay open — so you could hear everything: birds chirping, the class next door, and teachers coming over to scold each other."',
    isQuote: true,
    spaceHint: 'cong-truong',
  },
  'B-4': {
    text: 'Lipstick ice cream — looking like lipstick, twisted up to lick. Lemon ice cream because classrooms had no A/C. When A/C was installed, both disappeared.',
    isQuote: false,
    spaceHint: 'cong-truong',
  },

  // ───── NAM (3 opens) — hồ Thành Công, buổi chiều ─────
  'N-1': {
    text: '"I didn\'t care about Thanh Cong Lake. Back then, being forced to practice riding a bicycle there made me dislike it."',
    isQuote: true,
    spaceHint: 'ho-thanh-cong',
  },
  'N-2': {
    text: '"Thanh Cong people never use the main gate." The back gate was tiny, requiring maneuvering motorbikes through. The park fence removal policy — that gate is gone.',
    isQuote: false,
    spaceHint: 'ho-thanh-cong',
  },
  'N-3': {
    text: '"Every afternoon, aerobic music blared from the old metal speaker in the yard — that was the sign that evening had arrived."',
    isQuote: true,
    spaceHint: 'ho-thanh-cong',
  },
  'N-4': {
    text: 'Thanh Cong Lake back then: uneven concrete, lots of dogs, and a fishy smell from floating fish. LTK preferred practicing riding in his home yard — where no one would see him fall.',
    isQuote: false,
    spaceHint: 'ho-thanh-cong',
  },

  // ───── TÂY (3 opens) — quán net / về nhà ─────
  'T-1': {
    text: '"I\'ll just come out and say it: my family ran a net café. That was an amazing childhood. Plus, the net café had A/C."',
    isQuote: true,
    spaceHint: 'quan-net',
  },
  'T-2': {
    text: 'Huge CRT screens. Rhythmic clacking of Audition players ("clack clack clack"). Laughter and banter ("hee hee haha"). No one knew LTK\'s family owned the café — except his family.',
    isQuote: false,
    spaceHint: 'quan-net',
  },
  'T-3': {
    text: '"Going home to play net" — literally going home to play computer games. After school, drop the backpack, sit down. No money needed. No permission required.',
    isQuote: false,
    spaceHint: 'quan-net',
  },
  'T-4': {
    text: 'Friends came to play — not knowing it was LTK\'s house. They only knew it as "that cool place with A/C where we can play for a long time." A child\'s biggest secret.',
    isQuote: false,
    spaceHint: 'quan-net',
  },

  // ───── ĐÔNG (4 opens) — khu tập thể, điều không thể di chuyển ─────
  'Đ-1': {
    text: '"A living environment where an entire street is a collective housing block, everyone knows everyone and lives within one neighborhood — that is very rare."',
    isQuote: true,
  },
  'Đ-2': {
    text: 'During clearance, it\'s not just houses that disappear. The way people live together goes too. Living in apartments now — no one knows their neighbor\'s name.',
    isQuote: false,
  },
  'Đ-3': {
    text: 'LTK knew at least three routes from school to home through the small alleys. No main road needed. That was knowledge only locals possessed.',
    isQuote: false,
  },
  'Đ-4': {
    text: '"I walked past that street every day — now I don\'t anymore because it no longer exists." What is lost is not the place. It\'s the habit.',
    isQuote: false,
  },
};
