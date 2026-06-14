import { Story, TourNode, TourNavAnchor, TourScanAnchor } from '../types';

// Builds a linear chain of TourNodes from an array of panorama paths.
// clues: [{idx: nodeIndex, clueId, yaw?, pitch?}] — yaw/pitch are placeholders, tune in viewer.
// gps: one [lat, lng] per panorama (or null) — drives minimap bearing when present.
function makeNodes(
  panoramas: string[],
  clues: Array<{ idx: number; clueId: string; yaw?: number; pitch?: number }>,
  pfx: string,
  scans?: Array<{ idx: number; scanUrl: string; label: string; yaw?: number; pitch?: number }>,
  gps?: Array<[number, number] | null>
): TourNode[] {
  return panoramas.map((panorama, i) => {
    const id = `${pfx}-${String(i + 1).padStart(2, '0')}`;
    const clueAnchors = clues
      .filter(c => c.idx === i)
      .map(({ clueId, yaw = 45, pitch = -5 }) => ({ clueId, yaw, pitch }));
    const scanAnchors: TourScanAnchor[] = (scans ?? [])
      .filter(s => s.idx === i)
      .map(({ scanUrl, label, yaw = 0, pitch = -10 }) => ({ scanUrl, label, yaw, pitch }));
    const nav: TourNavAnchor[] = [];
    if (i > 0)
      nav.push({ toNodeId: `${pfx}-${String(i).padStart(2, '0')}`, yaw: 180, pitch: -10, label: 'Quay lại' });
    if (i < panoramas.length - 1)
      nav.push({ toNodeId: `${pfx}-${String(i + 2).padStart(2, '0')}`, yaw: 0, pitch: -10, label: 'Tiếp tục' });
    const coord = gps?.[i];
    return {
      id, panorama,
      ...(coord ? { lat: coord[0], lng: coord[1] } : {}),
      ...(clueAnchors.length ? { clueAnchors } : {}),
      ...(scanAnchors.length ? { scanAnchors } : {}),
      navAnchors: nav,
    };
  });
}

// Applies calibrated yaw values to nav anchors produced by makeNodes().
function applyYaws(
  nodes: TourNode[],
  yaws: Record<string, { fwd: number; back: number }>
): TourNode[] {
  return nodes.map(n => {
    const locked = yaws[n.id];
    if (!locked) return n;
    return {
      ...n,
      navAnchors: n.navAnchors?.map(a => {
        if (a.label === 'Tiếp tục' || a.label === 'Đi tiếp') return { ...a, yaw: locked.fwd };
        if (a.label === 'Quay lại') return { ...a, yaw: locked.back };
        return a;
      }),
    };
  });
}

// Attaches historical Google Maps Street View embed URLs to specific nodes.
// items: [{idx, url}] — idx is 0-based node index.
function withHistoric(nodes: TourNode[], items: Array<{ idx: number; url: string }>): TourNode[] {
  const map = new Map(items.map(({ idx, url }) => [idx, url]));
  return nodes.map((n, i) => map.has(i) ? { ...n, historicMapUrl: map.get(i)! } : n);
}

// ─── LTK panorama sequences ──────────────────────────────────────────────────
const ltk_cong_truong = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/truoc-cong-truong/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/quan-an-vat/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/quan-an-vat/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/quan-an-vat/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/quan-an-vat/shot-04.jpg',
];

const ltk_ho_thanh_cong = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-04.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-05.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-06.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-07.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-08.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-09.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-10.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-11.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-12.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-13.jpg',
  // shot-14 and shot-15 removed during calibration pass
];

const HTC_YAWS: Record<string, { fwd: number; back: number }> = {
  'htc-01': { fwd: -31,  back: 149  },
  'htc-02': { fwd:  36,  back: -144 },
  'htc-03': { fwd:   0,  back: 130  },
  'htc-06': { fwd: -78,  back: -130 },
  'htc-07': { fwd: -55,  back: 125  },
  'htc-08': { fwd: -32,  back: 148  },
  'htc-10': { fwd: -82,  back: 98   },
  'htc-12': { fwd: -14,  back: 166  },
  'htc-13': { fwd: -29,  back: 151  },
};

const ltk_quan_net = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-01.jpg',           // qn-01
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-02.jpg',           // qn-02
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-03.jpg',           // qn-03
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/all/shot-009.jpg',      // qn-04  (added)
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-04.jpg',           // qn-05
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-05.jpg',           // qn-06
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-06.jpg',           // qn-07
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-07.jpg',           // qn-08
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-08.jpg',           // qn-09
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/all/shot-023.jpg',      // qn-10  (added)
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-09.jpg',           // qn-11
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-10.jpg',           // qn-12
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-11.jpg',           // qn-13
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/all/shot-033.jpg',      // qn-14  (added)
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/trong-quan-net/shot-01.jpg',               // qn-15
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/trong-quan-net/shot-03.jpg',               // qn-16  (shot-02 removed)
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/trong-quan-net/shot-04.jpg',               // qn-17
];

const QN_YAWS: Record<string, { fwd: number; back: number }> = {
  'qn-03': { fwd: -13,  back: 167  },
  'qn-04': { fwd: -14,  back: 166  },  // added shot (all/shot-009)
  'qn-05': { fwd:   9,  back: -171 },
  'qn-12': { fwd: 119,  back: -61  },
  'qn-14': { fwd:  -7,  back: 173  },  // added shot (all/shot-033)
  'qn-15': { fwd: -77,  back: 103  },
};

// ─── Trang panorama sequences ─────────────────────────────────────────────────
const trang_di_hoc_them = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/di-hoc-them/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/di-hoc-them/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/di-hoc-them/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/di-hoc-them/shot-04.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/di-hoc-them/shot-05.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/di-hoc-them/shot-06.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/di-hoc-them/shot-07.jpg',
];

const TT_HOC_YAWS: Record<string, { fwd: number; back: number }> = {
  'tt-hoc-01': { fwd:  56, back: -124 },
  'tt-hoc-02': { fwd: -24, back:  156 },
  'tt-hoc-03': { fwd:   0, back:  152 },
  'tt-hoc-05': { fwd:   9, back: -171 },
  'tt-hoc-06': { fwd:   0, back:  104 },
};

const trang_playground = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-04.jpg',
  // shot-05 and shot-07 removed during calibration
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-06.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-08.jpg',
];

const TT_PG_YAWS: Record<string, { fwd: number; back: number }> = {
  'tt-pg-02': { fwd:  20, back: -160 },
  'tt-pg-03': { fwd:  19, back: -167 },
  'tt-pg-04': { fwd:  47, back:  177 },
  'tt-pg-05': { fwd: -23, back:  157 }, // was shot-06 (shifted after deletions)
};

const trang_quan_oc = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/all/shot-005.jpg', // added during calibration
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-04.jpg',
];

const TT_OC_YAWS: Record<string, { fwd: number; back: number }> = {
  'tt-oc-03': { fwd: 14, back: -166 }, // all/shot-005 added
  'tt-oc-04': { fwd: 15, back: -165 },
  'tt-oc-05': { fwd: 18, back: -162 },
};

// ─── Essy panorama sequences ──────────────────────────────────────────────────
// ─── Essy calibrated yaws (derived from user's turn-by-turn description) ─────
// es-ng-01→02: straight; 02→03: turn left; 04→05: turn right;
// 07→08: turn left; 08→09: turn right; 09→10: curve right; 10→11: turn right
// Yaws recalibrated after inserting 4 new frames (new-09..new-12) between shot-08/09 and shot-09/10.
// es-ng-08 now goes straight to new-09; old right-turn is gone.
// new-09 (0262): turn left ~-65° based on GPS bearing change.
// es-ng-11 (old shot-09): continues to new-11 with right turn.
// new-11 (0267): sharp right turn; new-12 (0268): straight; es-ng-14 (old shot-10): right into house.
const ES_NG_YAWS: Record<string, { fwd: number; back: number }> = {
  'es-ng-02': { fwd: -80, back:  100 },   // turn left 2→3
  'es-ng-04': { fwd:  80, back: -100 },   // curve right 4→5
  'es-ng-07': { fwd: -80, back:  100 },   // turn left 7→8
  'es-ng-08': { fwd:   0, back:  180 },   // straight to new-09 (0262)
  'es-ng-09': { fwd: -65, back:  115 },   // 0262: turn left to new-10 (0263)
  'es-ng-11': { fwd:  80, back: -100 },   // old shot-09: turn right to new-11 (0267)
  'es-ng-12': { fwd:  90, back:  -90 },   // 0267: sharp right to new-12 (0268)
  'es-ng-14': { fwd:  80, back: -100 },   // old shot-10: turn right into Essy house
};

const essy_duong_vao_nha = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-01.jpg',        // es-ng-01  start (21.041177, 105.816422)
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-02.jpg',        // es-ng-02  turn left
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-03.jpg',        // es-ng-03
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-04.jpg',        // es-ng-04  curve right
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-05.jpg',        // es-ng-05
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-06.jpg',        // es-ng-06
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-07.jpg',        // es-ng-07  turn left
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-08.jpg',        // es-ng-08  (21.041013, 105.817661)
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-09.jpg',     // es-ng-09  0262 (21.041006, 105.817918) turn left
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-10.jpg',     // es-ng-10  0263 (21.041089, 105.817963) straight
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-09.jpg',        // es-ng-11  turn right to 0267
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-11.jpg',     // es-ng-12  0267 (21.041601, 105.817944) right
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-12.jpg',     // es-ng-13  0268 (21.041330, 105.817918) straight
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-10.jpg',        // es-ng-14  turn right into house hẻm
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-11.jpg',        // es-ng-15  Essy house (21.041427, 105.817931)
];

const essy_de_la_thanh = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-04.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-05.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-06.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-07.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-08.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-09.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-10.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-11.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-12.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-13.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-14.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-15.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-16.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/de-la-thanh/shot-17.jpg',
];

// Prologue opening scene — exported for PrologueViewer
export const DE_LA_THANH_NODES: TourNode[] = makeNodes(essy_de_la_thanh, [], 'dla');

const essy_playground = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/playground/v2/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/playground/v2/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/playground/v2/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/playground/v2/shot-04.jpg',
];

// ─── Story A: LTK / Khu Thành Công ───────────────────────────────────────────
const TRANG: Story = {
  id: 'trang',
  narrator: 'LTK',
  title: 'Khu Thành Công',
  subtitle: 'Một ngày bình thường hồi bé của LTK',
  coverColor: '#4a3e75',
  spaces: [
    {
      id: 'cong-truong',
      label: 'Cổng trường',
      sublabel: 'Trường Tiểu học Thành Công A — tiệm thuê truyện, thẻ sưu tầm, kem son, kem chanh',
      lat: 21.023324, lng: 105.812746,
      audioSegment: { src: '/audio/oral-history/thanh-cong.m4a', startSec: 36, endSec: 439 },
      narratorBio: [
        'Lớp tiểu học không có điều hòa — cửa sổ mở, nghe được tiếng thầy cô các lớp chửi nhau.',
        'Tiệm thuê truyện Doraemon hai nghìn một ngày — "sharing economy trước khi có Grab".',
        'Tiếng trống trường lúc đang ăn kem chanh ở cổng: vừa vui, vừa sợ đến muộn.',
      ],
      bgGradient: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 40%, #d4b896 100%)',
      bgTone: '#c8a96e',
      bgTourNodes: withHistoric(makeNodes(ltk_cong_truong, [], 'ct', [
        { idx: 4, scanUrl: '/scans/quan-an-vat.glb', label: 'Xem quán ăn vặt 3D', yaw: 0, pitch: -10 },
      ]), [
        // Thanh Cong A school area, Google Street View 2018
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781406756612!6m8!1m7!1sgw5FtU3SO2EZh6Fw6DHM1Q!2m2!1d21.02335819365613!2d105.812700469784!3f177.3934717023654!4f-8.877060164979412!5f0.7820865974627469' },
      ]),
      clues: [
        {
          id: 'trang-an-vat',
          type: 'routine',
          label: 'Kem chanh, kem son — và tiệm thuê truyện',
          quote:
            '"Ngày xưa tiếng trống vang lên mà đang đứng ăn kem chanh ở cổng thì thấy vội và sợ lắm."',
          voiceNote:
            'LTK nhớ rõ ba thứ ở cổng trường Thành Công A: một là tiệm thuê truyện Doraemon và thần thoại Hy Lạp, hai đến ba nghìn một ngày — "sharing economy, the first sharing economy model I know before Grab"; hai là mua thẻ bóng đá và thẻ Vinamilk để sưu tầm — "quyền lực của trẻ con nằm ở việc có nhiều đồ hơn bạn"; ba là kem chanh vì lớp không có điều hòa, và kem son — thỏi kem nhìn như son môi, vặn lên rồi liếm. Tiệm thuê truyện biến mất khi LTK lên lớp 4-5. Kem chanh biến mất khi lớp có điều hòa.',
          ambient: 'wind',
          audioSrc: '/audio/trang-an-vat.mp3',
          x: 28,
          y: 58,
        },
        {
          id: 'trang-tieng-trong',
          type: 'sound',
          label: 'Tiếng trống — và những âm thanh vì không có điều hòa',
          quote:
            '"Không có điều hòa thì cửa phải mở — nên nghe được tất cả: tiếng chim, tiếng lớp bên, tiếng thầy cô sang mắng nhau."',
          voiceNote:
            'Lớp tiểu học Thành Công A không có điều hòa đến tận lớp ba lớp bốn. Cửa sổ luôn mở — tiếng từ bên ngoài tràn vào. LTK nhớ các thầy cô hay có drama: lớp này ồn ảnh hưởng lớp bên, thầy bên đó sang mắng. Tiếng trống trường đặc biệt nhiều cảm xúc — "đặc biệt là thấy vội, thấy sợ vì đến muộn, đặc biệt là khi đang ở cổng trường ăn vặt." Bây giờ đóng cửa bật máy lạnh, tiếng đó không còn.',
          ambient: 'wind',
          audioSrc: '/audio/trang-tieng-trong.mp3',
          x: 68,
          y: 42,
        },
      ],
    },
    {
      id: 'quan-net',
      label: 'Quán net — nhà mình mở',
      sublabel: 'Theo bước Kiên từ cổng trường về quán net nhà mở — màn CRT, tiếng Audition "cọc cọc cọc"',
      lat: 21.020861, lng: 105.813559,
      audioSegment: { src: '/audio/oral-history/thanh-cong.m4a', startSec: 439, endSec: 527 },
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/quan-net-gaming.mp4',
      narratorBio: [
        'Nhà mình mở quán net — tan học là về thẳng nhà chơi điện tử, không phải đến quán người khác.',
        'Màn hình CRT to đùng, cục máy phía sau, tai nghe và webcam — full setup huyền thoại.',
        'Bố chỉ cho chơi một tiếng, căn giờ đón về ăn cơm. "Quán net còn có điều hòa."',
      ],
      bgGradient: 'linear-gradient(160deg, #2a1f3d 0%, #3d2f5c 50%, #1a1228 100%)',
      bgTone: '#1a1228',
      bgTourNodes: withHistoric(applyYaws(makeNodes(ltk_quan_net, [], 'qn', [
        { idx: 16, scanUrl: '/scans/quan-net.glb', label: 'Xem quán net 3D', yaw: 0, pitch: -10 },
      ], [
        // GPS: school → north on Nguyễn Hồng → east at top → south on Thành Công → quán net
        [21.023324, 105.812746], null, null,      // 0-2: school → going north
        [21.025000, 105.812800], null, null, null, // 3-6: top corner → going east
        [21.025000, 105.814100], null,             // 7-8: east end → turning south
        [21.022500, 105.814100], null,             // 9-10: south on east side
        [21.020861, 105.813559], null, null, null, null, null, // 11-16: at café
      ]), QN_YAWS), [
        // Historical Google Street View matched to DJI shots — shows same streets before demolition
        { idx: 3,  url: 'https://www.google.com/maps/embed?pb=!4v1781407111689!6m8!1m7!1slPxhHBlAz66aKFd1Embsdw!2m2!1d21.02347691720712!2d105.8137573922583!3f103.09771536124487!4f-11.130644329606284!5f0.7820865974627469' },
        { idx: 4,  url: 'https://www.google.com/maps/embed?pb=!4v1781407214602!6m8!1m7!1sQgjDRoyS4wS42RVMqWJOng!2m2!1d21.02330514445645!2d105.8139358308204!3f119.53192455044567!4f-1.6804918275248895!5f0.7820865974627469' },
        { idx: 5,  url: 'https://www.google.com/maps/embed?pb=!4v1781407244320!6m8!1m7!1sSGRebU7lddzbDf2VOWU0DA!2m2!1d21.02268538074701!2d105.814032037225!3f187.01444020052543!4f-5.372352210014924!5f0.7820865974627469' },
        { idx: 6,  url: 'https://www.google.com/maps/embed?pb=!4v1781407286662!6m8!1m7!1st339e7O8lnS4VdjB-3JZ7A!2m2!1d21.02187181043283!2d105.8141045055832!3f169.68711556475915!4f-9.580848139812787!5f0.7820865974627469' },
        { idx: 7,  url: 'https://www.google.com/maps/embed?pb=!4v1781407062490!6m8!1m7!1s9zFbWecZ9F2sL5QsXhzegA!2m2!1d21.02146714834353!2d105.8141146278655!3f95.22881881848323!4f0!5f0.7820865974627469' },
        { idx: 8,  url: 'https://www.google.com/maps/embed?pb=!4v1781407009670!6m8!1m7!1sqQjwzEUZWPM_9nT86j3UrA!2m2!1d21.02131186181676!2d105.814022273258!3f178.13185559786697!4f-4.577780076155491!5f0.7820865974627469' },
        { idx: 9,  url: 'https://www.google.com/maps/embed?pb=!4v1781406844727!6m8!1m7!1s8GbK_z_u6JmL2Oq_b8ndVw!2m2!1d21.02121343497108!2d105.8140269312972!3f253.58290338190974!4f-13.194011320911557!5f0.7820865974627469' },
      ]),
      clues: [
        {
          id: 'trang-tieng-chui',
          type: 'sound',
          label: 'Hai tiếng của quán net',
          quote:
            '"Tiếng ở trong quán net chỉ có hai thứ: tiếng hi hi ha ha chửi nhau — và tiếng gõ phím của mấy chị chơi Audition, cọc cọc cọc cọc."',
          voiceNote:
            'Quán net nhà LTK: full suit gồm màn hình CRT rất lồi và cục máy to đùng phía sau — "cái cây càng to thì cái màn hình càng bé." Con chuột, bàn phím, tai nghe, webcam. Hai âm thanh duy nhất: tiếng chửi khi thua game và tiếng gõ Audition "cọc cọc cọc cọc" — "rất là chất nghệ." Bố chỉ cho chơi một tiếng rồi căn giờ đón về ăn cơm.',
          ambient: 'keyboard',
          audioSrc: '/audio/trang-tieng-chui.mp3',
          x: 35,
          y: 55,
        },
        {
          id: 'trang-choi-net',
          type: 'routine',
          label: 'Nhà mình mở quán net',
          quote:
            '"Come out luôn là nhà mình mở quán net. Đấy là một tuổi thơ tuyệt vời. Quán net còn có điều hòa."',
          voiceNote:
            'Điều LTK không nói thẳng từ đầu: tan học không phải đến quán net — là về nhà. Nhà mở quán net. Đó là lý do mỗi ngày tan học đều muốn về ngay — "anh rất hào hứng về nhà chơi điện tử." Và câu kết luận cho cả ngày: trường không có điều hòa, hồ bê tông gập ghềnh nhiều chó mùi tanh — nhưng nhà thì có điều hòa. "Quán net còn có điều hòa."',
          ambient: 'keyboard',
          audioSrc: '/audio/trang-choi-net.mp3',
          x: 62,
          y: 48,
        },
      ],
    },
    {
      id: 'ho-thanh-cong',
      label: 'Hồ Thành Công',
      sublabel: 'Cửa sau lách xe vào, bê tông gập ghềnh — con người Thành Công chả ai đi cửa chính',
      lat: 21.020445, lng: 105.813269,
      audioSegment: { src: '/audio/oral-history/thanh-cong.m4a', startSec: 527, endSec: 660 },
      narratorBio: [
        'Ông bà dẫn ra hồ tập xe đạp cuối tuần — hồ bê tông gập ghềnh, nhiều chó, mùi tanh cá chết.',
        'Không ai đi cửa chính — người Thành Công luôn lách qua cái cửa sắt không bao giờ mở hết.',
        'Khi giải tỏa, mất không chỉ nhà — mất cả cách một khu phố biết nhau và sống cùng nhau.',
      ],
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/ho-thanh-cong-panoramic.mp4',
      isPanoramicVideo: true,
      minimapFlipX: true,
      bgGradient: 'linear-gradient(160deg, #c8dde8 0%, #a3c4d5 40%, #7eaabf 100%)',
      bgTone: '#5a7a8a',
      bgTourNodes: withHistoric(applyYaws(makeNodes(ltk_ho_thanh_cong, [], 'htc', undefined, [
        // GPS: cổng hồ → thẳng → rẽ trái → cầu thang → vòng quanh hồ
        [21.020445, 105.813269], null, null, null,
        [21.020333, 105.813667], null, null, null,
        null, null, null, null,
        [21.020203, 105.813215],
      ]), HTC_YAWS), [
        // Hồ Thành Công 2017
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781407926721!6m8!1m7!1sAnVN58QpnXISxwLh_W32yA!2m2!1d21.02048879554921!2d105.8132082827019!3f195.77940340158702!4f-7.682892952432283!5f0.7820865974627469' },
      ]),
      clues: [
        {
          id: 'trang-xe-dap',
          type: 'routine',
          label: 'Tập xe đạp — và không thích chút nào',
          quote:
            '"Anh chả quan tâm đến hồ Thành Công. Ngày xưa bị ép tập đi xe đạp là không thấy thích rồi."',
          voiceNote:
            'Cuối tuần ông bà dẫn LTK ra hồ tập xe đạp. Hồi đó hồ bê tông gập ghềnh, không phải lát đá như bây giờ. Nhiều chó, mùi tanh vì cá chết nổi lềnh bềnh. LTK không thích vì sợ ngã trước mặt người — "không thích tập ở cái nơi mà người ta nhìn thấy mình ngã." Thích tập ở sân sau nhà bà ngoại hơn. Và vào trong hồ không phải qua cửa chính — "con người Thành Công chả bao giờ đi cửa chính." Họ đi cửa sau, một cái cửa không bao giờ mở ra hết, phải lách xe vào. Cái cửa đó đã bị tháo theo chính sách dỡ hàng rào công viên.',
          ambient: 'cicadas',
          audioSrc: '/audio/trang-xe-dap.mp3',
          x: 45,
          y: 62,
        },
        {
          id: 'trang-nhac-aerobic',
          type: 'sound',
          label: 'Tiếng nhạc aerobic chiều',
          quote:
            '"Buổi chiều nào cũng có nhạc aerobic vang ra từ cái loa sắt cũ ở sân — đó là dấu hiệu chiều đã về."',
          voiceNote:
            'Mỗi chiều ở hồ Thành Công, loa cộng đồng bật nhạc aerobic. Các cô các bà tập đều đặn, bọn trẻ đứng nhìn. Tiếng nhạc vang khắp khu — ai ở đây cũng nhớ. Bây giờ không còn.',
          ambient: 'aerobic',
          audioSrc: '/audio/trang-nhac-aerobic.mp3',
          x: 72,
          y: 38,
        },
        {
          id: 'trang-khu-tap-the',
          type: 'loss',
          label: 'Cả phố là một nhà — cách sống sắp mất',
          quote:
            '"Một môi trường sống nguyên cả một khu phố là khu tập thể, tất cả biết nhau và sinh hoạt chỉ trong một phố — rất hiếm."',
          voiceNote:
            'LTK tiếc không chỉ vì những âm thanh hồi bé. Khu Thành Công là một mô hình sống riêng: cả phố là khu tập thể, mọi người biết tên nhau, sinh hoạt chỉ quanh vài con phố nhỏ. Khi giải tỏa, không chỉ nhà mất đi — cái cách người ta sống cùng nhau cũng mất theo. Bây giờ sống chung cư, không ai biết tên hàng xóm.',
          ambient: 'wind',
          audioSrc: '/audio/trang-khu-tap-the.mp3',
          x: 30,
          y: 35,
        },
      ],
    },
  ],
  routeClueIds: ['trang-an-vat', 'trang-choi-net', 'trang-xe-dap'],
  routeSlotLabels: ['Tan học, chạy ra...', 'Ghé vào quán net...', 'Rồi ra hồ...'],
  cannotBeMoved: [
    'Tiệm thuê truyện Doraemon ở cổng trường — hai nghìn một ngày, "sharing economy trước khi có Grab." Mất trước khi LTK hết cấp một.',
    'Kem chanh mua vì lớp không có điều hòa — khi trường lắp điều hòa, không ai bán kem chanh nữa.',
    'Tiếng thầy cô sang mắng nhau qua cửa sổ mở — bây giờ đóng cửa bật máy lạnh, không còn nghe gì.',
    'Cửa sau hồ Thành Công không bao giờ mở được hết, phải lách xe vào. Con người Thành Công chả bao giờ đi cửa chính.',
    'Mùi tanh hồ và chó lang thang — hồi đó bê tông gập ghềnh, không lát đá. Hàng rào sắt gỉ đã bị tháo.',
    'Tiếng Audition "cọc cọc cọc cọc" và tiếng chửi "hi hi ha ha" trong quán net có điều hòa — nhà mình mở, về là được chơi.',
  ],
  cluesNeededToUnlock: 4,
};

// ─── Story B: Essy / Ngõ 267 Hoàng Hoa Thám ──────────────────────────────────
const ESSY: Story = {
  id: 'essy',
  narrator: 'Essy',
  title: 'Ngõ – Chợ – Giếng',
  subtitle: 'Những thứ chỉ người sống ở đây mới biết — và sắp mất',
  coverColor: '#7d9b84',
  spaces: [
    {
      id: 'nha-ngo',
      label: 'Nhà / Ngõ',
      sublabel: 'Số 17, 267/33 Hoàng Hoa Thám — rẽ ba bốn lần mới vào được, Grab không bao giờ tìm được',
      lat: 21.041427, lng: 105.817931,
      audioSegment: { src: '/audio/oral-history/hoang-hoa-tham.m4a', startSec: 1 },
      narratorBio: [
        'Nhà nằm sâu giữa ba trục đường lớn — Essy biết năm con đường vào nhà từ ba hướng khác nhau.',
        '"Bản đồ không hiển thị chính xác. Phải phụ thuộc vào tri thức địa phương của người sống lâu năm ở đây."',
        'Grab, Be, Xanh SM gần như không ai tự tìm được — Essy luôn phải ra đón hoặc chỉ đường.',
      ],
      bgGradient: 'linear-gradient(160deg, #d4c5a9 0%, #c5b08a 40%, #b09060 100%)',
      bgTone: '#6b5a3e',
      bgTourNodes: withHistoric(applyYaws(makeNodes(essy_duong_vao_nha, [], 'es-ng', [
        { idx: 14, scanUrl: '/scans/nha-essy.glb', label: 'Xem nhà Essy 3D', yaw: 0, pitch: -10 },
      ], [
        // GPS from user's turn-by-turn descriptions
        [21.041177, 105.816422], // es-ng-01 start
        [21.041030, 105.816774], // es-ng-02 turn left
        [21.041062, 105.816813], // es-ng-03
        [21.041209, 105.816872], // es-ng-04 curve right
        [21.041178, 105.817136], // es-ng-05
        null,                    // es-ng-06
        [21.041047, 105.817556], // es-ng-07 turn left
        [21.041013, 105.817661], // es-ng-08
        [21.041006, 105.817918], // es-ng-09 (0262) turn left
        [21.041089, 105.817963], // es-ng-10 (0263)
        null,                    // es-ng-11 straight
        [21.041601, 105.817944], // es-ng-12 (0267) turn right
        [21.041330, 105.817918], // es-ng-13 (0268)
        null,                    // es-ng-14 turn right into hẻm
        [21.041427, 105.817931], // es-ng-15 Essy house
      ]), ES_NG_YAWS), [
        { idx: 9,  url: 'https://www.google.com/maps/embed?pb=!4v1781412371328!6m8!1m7!1s2TWphYbHFgWWSOFqrtsw9A!2m2!1d21.04103909428119!2d105.8178888444568!3f40.074094664986106!4f-19.58369068018274!5f0.7820865974627469' },
        { idx: 10, url: 'https://www.google.com/maps/embed?pb=!4v1781412386208!6m8!1m7!1s1lZSDXjhNTvxbQG-bxTBtQ!2m2!1d21.0410784735756!2d105.8179891735765!3f88.478552511718!4f-25.48781926972515!5f0.7820865974627469' },
        { idx: 11, url: 'https://www.google.com/maps/embed?pb=!4v1781412199393!6m8!1m7!1s7d03mG0z6vi2eZtWE7TRFQ!2m2!1d21.04106422876278!2d105.8181299031744!3f107.38807014797955!4f0.4437072786251264!5f0.7820865974627469' },
        { idx: 14, url: 'https://www.google.com/maps/embed?pb=!4v1781412069003!6m8!1m7!1sUAlJ_dGe8w88WdPKaRZJuw!2m2!1d21.04098537974627!2d105.818354031628!3f202.05707186222304!4f-13.064484507307242!5f0.7820865974627469' },
      ]),
      clues: [
        {
          id: 'essy-ngo-kho',
          type: 'place',
          label: 'Chỉ người trong ngõ mới biết đường',
          quote:
            '"Essy biết tầm năm cách để đi vào nhà từ ba con đường khác nhau. Đây là ký ức chỉ những người sống ở đây mới có."',
          voiceNote:
            'Nhà Essy ở số 17, 267/33 Hoàng Hoa Thám — phải rẽ ba bốn lần từ đường chính mới vào được. Giữa Hoàng Hoa Thám, Văn Cao và Đội Cấn, Essy biết hơn năm đường vào nhà. Map không chỉ được chính xác — "phải phụ thuộc vào tri thức địa phương của những người sống ở đây lâu năm." Grab, Be, Xanh SM gần như không ai tự tìm được — Essy luôn phải ra đón hoặc chỉ đường qua điện thoại. Khi con đường mới mở, sẽ không ai cần navigate nữa. "Những cái ký ức của mình và những cái hiểu biết của mình về cái khu này sẽ không có cái tác dụng gì nữa."',
          ambient: 'wind',
          audioSrc: '/audio/essy-ngo-kho.mp3',
          x: 40,
          y: 60,
        },
        {
          id: 'essy-cay-xanh-ngo',
          type: 'loss',
          label: 'Dãy nhà biệt lập — cây chanh, hoa nhài, và sự trong lành',
          quote:
            '"Mỗi lần đi vào cái khu biệt lập đó — ôi, một cái sự trong lành và mát mẻ mà có thể được ở đâu khác trên cái thành phố Hà Nội này nữa."',
          voiceNote:
            'Sáu bảy nhà trong một dãy biệt lập, gạch riêng, chia nhau một khoảng sân trồng cây chanh và hoa nhài. Essy gọi đây là một trong hai thứ sẽ mất nhất: không gian xanh giảm nhiệt, những "third place" mà cả khu đang có nhờ ngõ nhiều cây và cà phê sân vườn. Khi mở đường, cây sẽ bị xuống. "Những cái không gian đó ở trong thành phố Hà Nội hiếm rồi. Bây giờ khi giải tỏa hết thì mình còn mất nhiều hơn nữa."',
          ambient: 'wind',
          audioSrc: '/audio/essy-cay-xanh-ngo.mp3',
          x: 25,
          y: 38,
        },
        {
          id: 'essy-ngap-mua',
          type: 'place',
          label: 'Ngập mùa mưa — ngõ sâu, hàng xóm biết nhau',
          quote: '"Vào mùa mưa, ngõ sâu hay bị ngập — nhưng đó là một phần của nhà."',
          voiceNote:
            'Mùa mưa ở Hà Nội, những ngõ sâu như ngõ nhà Essy hay bị ngập. Nhưng điều Essy nhớ hơn là cộng đồng trong đó: người đi những cung đường quen sẽ quen biết nhau — biết tên người bán cá, bán gà, và sẵn sàng nợ tiền nhau. "Like cả một cái gia đình và mọi người sẵn sàng nợ tiền nhau."',
          ambient: 'kids-laughter',
          x: 65,
          y: 45,
        },
      ],
    },
    {
      id: 'gieng-khu-choi',
      label: 'Giếng / Khu vui chơi',
      sublabel: 'Con đường chỉ người trong khu mới biết — dẫn ra giếng cũ nay thành sân tập thể',
      lat: 21.040723, lng: 105.818568,
      audioSegment: { src: '/audio/oral-history/hoang-hoa-tham.m4a', startSec: 299 },
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/gieng-v2.mp4',
      narratorBio: [
        'Từ Hoàng Hoa Thám sang Văn Cao có một con đường nhỏ — chỉ người trong khu mới biết đến.',
        '"Mình thực sự chưa từng gặp ai không phải người ở đây mà biết con đường đó cả."',
        'Bên trong: nhiều cây, tòa nhà che kín ánh mặt trời — mát hơn bất kỳ đâu giữa Hà Nội.',
      ],
      bgGradient: 'linear-gradient(160deg, #a8c5a0 0%, #7da87a 40%, #5a8a56 100%)',
      bgTone: '#3a6a36',
      bgTourNodes: withHistoric(makeNodes(essy_playground, [], 'es-gk'), [
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781411941294!6m8!1m7!1s4kK0rMHW11aCh1X_sTPlaQ!2m2!1d21.04034879948579!2d105.817488961791!3f281.32678038512734!4f-16.875345166491712!5f0.7820865974627469' },
      ]),
      clues: [
        {
          id: 'essy-tre-con-gieng',
          type: 'place',
          label: 'Con đường ra giếng — chỉ người trong khu biết',
          quote:
            '"Nó dẫn ra một cái giếng. Mình chưa thấy một ai mà không phải là người khu này mà biết cái đường đấy cả."',
          voiceNote:
            'Từ hướng Văn Cao, có một con đường nhỏ mà chỉ người trong khu mới biết — dẫn ra cái giếng cũ, nay được sửa thành khu tập thể dục. Bên trong ngõ có rất nhiều cây, tòa nhà xung quanh che nắng — mát hơn ngoài đường rất nhiều. Xung quanh giếng cũng có một cái chợ tự phát nhỏ nữa cho dân ở gần Văn Cao. Không có ai ngoài khu biết đến chỗ này.',
          ambient: 'kids-laughter',
          audioSrc: '/audio/essy-tre-con-gieng.mp3',
          x: 42,
          y: 58,
        },
        {
          id: 'essy-gieng-mat',
          type: 'loss',
          label: 'Di tích quốc gia — sắp thành mặt đường',
          quote:
            '"Ở trong ngõ 267 có một cái chùa. Khả năng cao là sẽ thành mặt đường. Mọi người có thể lên tra."',
          voiceNote:
            'Essy kể điều làm nhiều người ngạc nhiên: trong ngõ 267 Hoàng Hoa Thám có một ngôi chùa — di tích quốc gia. Rất ít người Hà Nội biết. Và trong kế hoạch giải tỏa, di tích đó "rất sát với mặt đường hoặc là thành mặt đường." Một di tích quốc gia nằm trong cái khu mà Grab không bao giờ tìm được.',
          ambient: 'wind',
          audioSrc: '/audio/essy-gieng-mat.mp3',
          x: 68,
          y: 35,
        },
        {
          id: 'essy-di-tich',
          type: 'place',
          label: 'Cà phê sân vườn — và cây sẽ bị xuống',
          quote:
            '"Trong khu này nổi tiếng nhất là cà phê sân vườn. Tại vì trong khu này nó có rất nhiều cây."',
          voiceNote:
            'Khu ngõ 267 gần đây trẻ hóa nhiều — ramen, cà phê học bài, cà phê sân vườn. Lý do nổi tiếng: rất nhiều cây, tòa nhà xung quanh che nắng — không gian xanh hiếm có giữa Hà Nội. Khi mở đường, những quán đó thành đường. Cây sẽ bị xuống. "Mình rất tiếc vì những cái không gian third place hoặc là những cái không gian giảm nhiệt như thế thực ra ở trong thành phố Hà Nội hiếm rồi."',
          ambient: 'plucks',
          audioSrc: '/audio/essy-di-tich.mp3',
          x: 25,
          y: 48,
        },
      ],
    },
  ],
  routeClueIds: ['essy-ngo-kho', 'essy-cay-xanh-ngo', 'essy-tre-con-gieng'],
  routeSlotLabels: ['Từ cổng ngõ...', 'Qua khoảng xanh...', 'Đến giếng...'],
  cannotBeMoved: [
    'Cái bản đồ trong đầu — năm cách vào nhà từ ba con đường khác nhau, chỉ người ở đây mới biết.',
    'Sân trong dãy nhà biệt lập — gạch riêng, cây chanh, hoa nhài, mát lạ giữa thành phố.',
    'Con đường ra giếng mà không ai không phải người khu này biết đến.',
    'Di tích quốc gia trong ngõ mà Grab không tìm được — sắp thành mặt đường.',
    'Cà phê sân vườn dưới tán cây — khi mở đường, cây sẽ bị xuống, những không gian đó không còn nữa.',
  ],
  cluesNeededToUnlock: 4,
};

// ─── Story C: Trang / Khu Trung Liệt ─────────────────────────────────────────
const TRANG_THAI_THINH: Story = {
  id: 'thai-thinh',
  narrator: 'Trang',
  title: 'Khu Trung Liệt',
  subtitle: 'Những mảnh ký ức Trang đã quên — và tìm lại được trước khi khu này biến mất',
  coverColor: '#5a7a5a',
  spaces: [
    {
      id: 'nha-hoc-them',
      label: 'Lớp học thêm',
      sublabel: 'Gần cửa hàng mẹ — chiều 4-5 giờ mẹ dẫn đi bộ ra học, phố không một chiếc ô tô',
      lat: 21.009981, lng: 105.820251,
      audioSegment: { src: '/audio/oral-history/trung-liet.m4a', startSec: 27 },
      narratorBio: [
        'Mỗi chiều 4-5 giờ, mẹ dẫn đi bộ qua con phố vắng đến lớp học thêm trước cấp một.',
        'Đường Nguyễn Văn Tuyết từng là cái mương — không xe, không tiếng động, hàng xóm biết nhau.',
        'Gần đây đi làm về qua đó thấy một chiếc ô tô đỗ — "đấy là một cảm xúc khá là lạ."',
      ],
      bgGradient: 'linear-gradient(160deg, #f0e4c8 0%, #d9c49a 40%, #c4a870 100%)',
      bgTone: '#c4a870',
      bgTourNodes: withHistoric(applyYaws(makeNodes(trang_di_hoc_them, [], 'tt-hoc', undefined, [
        // GPS: 143 Trung Liệt → going east on Trung Liệt → lớp học thêm (no north drift)
        [21.010361, 105.819077], // tt-hoc-01 start (143 Trung Liệt)
        [21.010340, 105.819330], // tt-hoc-02 east
        [21.010310, 105.819510], // tt-hoc-03 east
        [21.010250, 105.819800], // tt-hoc-04 east
        [21.010130, 105.820060], // tt-hoc-05 slight SE
        [21.009981, 105.820251], // tt-hoc-06 study place
        null,                    // tt-hoc-07
      ]), TT_HOC_YAWS), [
        // Historical Street View matched to 143 Trung Liệt → ONG Store route
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781408126695!6m8!1m7!1sTv5fNyWV5uUbRuPQSq2dIA!2m2!1d21.01024182268491!2d105.8189569940536!3f237.84655727624724!4f-6.8214980075420755!5f0.7820865974627469' },
        { idx: 1, url: 'https://www.google.com/maps/embed?pb=!4v1781408170669!6m8!1m7!1sVjpr5xP4uSQrqxEc5KCj0g!2m2!1d21.01017391394856!2d105.8187200549374!3f219.59939081504942!4f-28.616128720245776!5f0.7820865974627469' },
        { idx: 2, url: 'https://www.google.com/maps/embed?pb=!4v1781408292936!6m8!1m7!1s2ZGDnTFUf7dkQ92AzPYXAg!2m2!1d21.01049023995335!2d105.8195154370104!3f62.25513190348058!4f-6.287237986228803!5f0.7820865974627469' },
        { idx: 3, url: 'https://www.google.com/maps/embed?pb=!4v1781408364592!6m8!1m7!1s_n6SQubPSlBt-Zd_87SShA!2m2!1d21.01075480596271!2d105.8196807127992!3f324.39853889627045!4f-6.447499879491232!5f0.7820865974627469' },
        { idx: 4, url: 'https://www.google.com/maps/embed?pb=!4v1781408422825!6m8!1m7!1s1XpIx8FMLqaQpo6_jUhk7A!2m2!1d21.01095812934958!2d105.8195033436658!3f317.37933527468243!4f-3.6715733113441473!5f0.7820865974627469' },
      ]),
      clues: [
        {
          id: 'thai-thinh-hoc-them',
          type: 'routine',
          label: 'Chiều 4-5 giờ, mẹ dẫn đi bộ ra lớp học thêm',
          quote:
            '"Ăn trưa xong, nhà mình nghỉ một chút. Sau đó tầm bốn năm giờ, mẹ mình bắt đầu dẫn mình đi bộ ra lớp học thêm."',
          voiceNote:
            'Nhà Trang làm cửa hàng ở khu Trung Liệt — không phải nhà ở. Mẹ hay đưa Trang sang đó ăn trưa rồi từ đó đi học thêm trước lớp một. Con phố hồi đó rất vắng — lần cuối Trang nhớ thấy phố đó, chưa bao giờ có ô tô. Đường Nguyễn Văn Tuyết hồi đó còn là cái mương — không có xe nào đi qua. Gần đây Trang đi làm về qua đó, thấy một chiếc ô tô đỗ — "đấy là một cái cảm xúc khá là lạ." Bây giờ đường mương đó thành phố ẩm thực, tối có tiếng bar sàn.',
          ambient: 'plucks',
          audioSrc: '/audio/thai-thinh-hoc-them.mp3',
          x: 38,
          y: 55,
        },
        {
          id: 'thai-thinh-pho-khong-xe',
          type: 'sound',
          label: 'Phố yên tĩnh — âm thanh trước khi mương thành đường',
          quote:
            '"Tuổi thơ của mình đã ở trong một con phố đấy rất yên bình, không có xe cộ, không có ai đi qua — hầu hết là hàng xóm biết nhau thôi."',
          voiceNote:
            'Đường Nguyễn Văn Tuyết từng là mương thoát nước — không xe, không tiếng động. Sau khi lấp mương mở đường, nó thành phố ẩm thực đông đúc, "đến buổi tối thì nó sẽ có tiếng bar sàn xập xình." Trang gọi đây là cái cảm xúc lạ: cùng một chỗ, cách nhau mười mấy năm, xe máy đã được thay bằng ô tô.',
          ambient: 'wind',
          audioSrc: '/audio/thai-thinh-pho-khong-xe.mp3',
          x: 65,
          y: 42,
        },
      ],
    },
    {
      id: 'san-choi-tap-the',
      label: 'Sân chơi khu tập thể',
      sublabel: 'Đi qua vô số lần — chưa bao giờ được vào chơi một lần nào',
      lat: 21.010665, lng: 105.818798,
      audioSegment: { src: '/audio/oral-history/trung-liet.m4a', startSec: 227 },
      narratorBio: [
        'Trên đường học thêm mỗi buổi chiều, nhìn thấy các bạn chơi trong sân — không được dừng lại.',
        'Đến tận ngày hôm nay vẫn chưa bao giờ được vào cái sân đó để chơi dù đã đi qua vô số lần.',
        'Nếu khu bị giải tỏa, cũng không còn cơ hội nào để trải nghiệm điều đó nữa.',
      ],
      bgGradient: 'linear-gradient(160deg, #b8d4b0 0%, #8aba88 40%, #6a9866 100%)',
      bgTone: '#6a9866',
      bgTourNodes: applyYaws(makeNodes(trang_playground, [], 'tt-pg', undefined, [
        // GPS: straight from 143 Trung Liệt NW to playground (user: "look to the left")
        [21.010361, 105.819077], // tt-pg-01 same start as hoc-them
        [21.010437, 105.819007], // interpolated
        [21.010513, 105.818937], // interpolated
        [21.010589, 105.818867], // interpolated
        [21.010665, 105.818798], // tt-pg-05 playground
        null,                    // tt-pg-06
      ]), TT_PG_YAWS),
      clues: [
        {
          id: 'thai-thinh-san-choi',
          type: 'loss',
          label: 'Đến tận bây giờ vẫn chưa bao giờ được vào chơi',
          quote:
            '"Đến tận ngày hôm nay mình vẫn chưa bao giờ được vào cái sân chơi đó để chơi, mặc dù mình đã đi qua nó vô số lần."',
          voiceNote:
            'Trên đường đi học thêm mỗi buổi chiều, Trang đi qua sân chơi khu tập thể. Thấy các bạn chơi, nhưng không được dừng lại — luôn phải đến cửa hàng, luôn phải đi học. "Chỉ đơn giản là một đứa trẻ đang rất là muốn đi chơi và nó bị bắt đi học thôi. Nó là cái cảm giác mình không bao giờ trải nghiệm lại được nữa vì mình đã lớn rồi." Nếu khu bị giải tỏa, Trang sẽ không còn cái trigger để đi qua và nhớ lại cảm giác đó nữa.',
          ambient: 'kids-laughter',
          audioSrc: '/audio/thai-thinh-san-choi.mp3',
          x: 50,
          y: 58,
        },
        {
          id: 'thai-thinh-tieng-cuoi',
          type: 'sound',
          label: 'Tiếng cười từ sân chơi — nghe khi đi qua',
          quote:
            '"Nó là cái cảm giác mà chỉ có mình mình cảm nhận được thôi và cũng không diễn tả được thành lời."',
          voiceNote:
            'Trang không gọi đây là ghen tị. Chỉ là cái cảm giác của một đứa năm tuổi muốn được ở lại chơi, muốn lăn ra ăn vạ để ở lại. Cái cảm giác đó không biến mất — đến bây giờ khi đi qua phố đó, nó vẫn ùa về. Khi phố bị giải tỏa, cả cái trigger đó cũng mất theo.',
          ambient: 'kids-laughter',
          audioSrc: '/audio/thai-thinh-tieng-cuoi.mp3',
          x: 72,
          y: 40,
        },
      ],
    },
    {
      id: 'quan-oc-violin',
      label: 'Quán ốc ông violin',
      sublabel: 'Mẹ dẫn đi ăn để an ủi — và lần đầu tiên Trang biết violin là gì',
      lat: 21.011001, lng: 105.820834,
      audioSegment: { src: '/audio/oral-history/trung-liet.m4a', startSec: 356 },
      narratorBio: [
        'Cô giáo đánh vào tay vì dùng tẩy với bút máy — Trang khóc cả đường về. Mẹ dẫn đi ăn ốc.',
        'Ông chủ quán ngồi đánh violin giữa bàn ốc — lần đầu tiên Trang biết violin là gì.',
        '"Violin có thể chơi ở mọi nơi." Lớn lên mới biết violin thường chỉ ở dàn giao hưởng.',
      ],
      bgGradient: 'linear-gradient(160deg, #e8c890 0%, #d4a060 40%, #b87840 100%)',
      bgTone: '#c48040',
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/quan-oc-violin.mp4',
      bgTourNodes: withHistoric(applyYaws(makeNodes(trang_quan_oc, [], 'tt-oc', undefined, [
        // GPS: đường Trung Liệt → rẽ vào ngõ 69 → quán ốc oanh
        [21.010911, 105.820092], // tt-oc-01
        [21.011139, 105.820296], // tt-oc-02
        [21.011281, 105.820453], // tt-oc-03 turn right into ngõ 69
        null,                    // tt-oc-04 inside alley
        [21.011001, 105.820834], // tt-oc-05 quán ốc oanh
      ]), TT_OC_YAWS), [
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781408630892!6m8!1m7!1sqqnx-p_V94aaSUetEHMvAg!2m2!1d21.01091163804722!2d105.8200952018351!3f42.95893351208221!4f-3.4922654802283972!5f0.7820865974627469' },
        { idx: 1, url: 'https://www.google.com/maps/embed?pb=!4v1781408663887!6m8!1m7!1spNB7WYfP2N6cX5e7_Yf62A!2m2!1d21.0111221435295!2d105.8202784838613!3f38.21358173713219!4f-6.256166983100783!5f0.7820865974627469' },
        { idx: 2, url: 'https://www.google.com/maps/embed?pb=!4v1781408723312!6m8!1m7!1spNB7WYfP2N6cX5e7_Yf62A!2m2!1d21.0111221435295!2d105.8202784838613!3f354.0648327138127!4f-5.592324029480807!5f0.7820865974627469' },
      ]),
      clues: [
        {
          id: 'thai-thinh-vio-oc',
          type: 'sound',
          label: 'Lần đầu tiên nghe violin — ở quán ốc',
          quote:
            '"Ở quán ốc đó thì bác ấy đánh violin. Đấy là lần đầu tiên mình biết violin là gì và chơi như thế nào."',
          voiceNote:
            'Hôm đó Trang dùng tẩy với bút máy — vi phạm nội quy, cô giáo có thước to đánh vào tay học sinh. Trang khóc cả đường về. Mẹ dẫn đi ăn ốc để an ủi — và ở quán đó ông chủ đánh violin. Trang nghĩ violin có thể chơi ở mọi nơi, kể cả quán ốc. Lớn lên mới biết violin là nhạc cụ của dàn giao hưởng. "Đối với mình bây giờ violin vẫn là cái gì đó khá là gần gũi — bởi vì lần đầu tiên mình thấy violin là khi mình nghe nó ở quán ốc."',
          ambient: 'violin',
          audioSrc: '/audio/thai-thinh-vio-oc.mp3',
          x: 45,
          y: 55,
        },
        {
          id: 'thai-thinh-di-voi-me',
          type: 'routine',
          label: 'Quán ốc chỉ người khu này biết — nay nổi TikTok',
          quote:
            '"Sẽ không có một đứa trẻ nào nhìn thấy violin lần đầu tiên ở trong một quán ốc nữa."',
          voiceNote:
            'Hồi bé quán ốc đó chỉ có cư dân trong khu biết. "Cái lối sống ngày xưa rất mang tính làng xóm — riêng một khu vực sống với nhau thì biết về nhau thôi." Bây giờ quán nổi trên TikTok. Trang không biết quán có nằm trong diện giải tỏa không, nhưng nếu có — "sẽ không còn ai cảm nhận được violin giống như mình đã cảm nhận violin nữa."',
          ambient: 'violin',
          audioSrc: '/audio/thai-thinh-di-voi-me.mp3',
          x: 65,
          y: 45,
        },
      ],
    },
  ],
  routeClueIds: ['thai-thinh-hoc-them', 'thai-thinh-san-choi', 'thai-thinh-vio-oc'],
  routeSlotLabels: ['Chiều từ cửa hàng mẹ...', 'Đi qua sân chơi...', 'Ăn ốc với mẹ...'],
  cannotBeMoved: [
    'Con phố Trung Liệt khi đường Nguyễn Văn Tuyết còn là mương — không một chiếc ô tô, hàng xóm biết nhau.',
    'Cái sân chơi khu tập thể Trang đã đi qua vô số lần và chưa bao giờ được vào.',
    'Cảm giác năm tuổi muốn lăn ra ăn vạ để được ở lại chơi — chỉ nhớ lại được khi đi qua phố đó.',
    'Lần đầu tiên nghe violin ở quán ốc nhỏ trong ngõ — và nghĩ violin có thể chơi ở mọi nơi.',
    'Cái ngày khóc vì dùng tẩy với bút máy, mẹ dẫn đi ăn ốc để an ủi — "mình đã sợ những thứ khác và không sợ cái tẩy nữa."',
    'Hành trình lưu trữ ký ức, thực ra, cũng là hành trình tìm lại những thứ tưởng đã quên.',
  ],
  cluesNeededToUnlock: 4,
};

export const ALL_STORIES: Story[] = [TRANG, TRANG_THAI_THINH, ESSY];
