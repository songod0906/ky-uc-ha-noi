import { Story, TourNode, TourNavAnchor, TourScanAnchor } from '../types';

// Builds a linear chain of TourNodes from an array of panorama paths.
// clues: [{idx: nodeIndex, clueId, yaw?, pitch?}] — yaw/pitch are placeholders, tune in viewer.
// gps: one [lat, lng] per panorama (or null) — drives minimap bearing when present.
function makeNodes(
  panoramas: string[],
  clues: Array<{ idx: number; clueId: string; yaw?: number; pitch?: number; audioSec?: number }>,
  pfx: string,
  scans?: Array<{ idx: number; scanUrl: string; label: string; yaw?: number; pitch?: number; clueId?: string }>,
  gps?: Array<[number, number] | null>
): TourNode[] {
  return panoramas.map((panorama, i) => {
    const id = `${pfx}-${String(i + 1).padStart(2, '0')}`;
    const clueAnchors = clues
      .filter(c => c.idx === i)
      .map(({ clueId, yaw = 45, pitch = -5, audioSec }) => ({ clueId, yaw, pitch, ...(audioSec !== undefined ? { audioSec } : {}) }));
    const scanAnchors: TourScanAnchor[] = (scans ?? [])
      .filter(s => s.idx === i)
      .map(({ scanUrl, label, yaw = 0, pitch = -10, clueId }) => ({ scanUrl, label, yaw, pitch, ...(clueId ? { clueId } : {}) }));
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

// Maps per-node oral history seek positions (seconds into the audio file).
// null = no seek override for that node.
// For scan spaces: only the scan node's audioSec is used (when the scan opens).
// For non-scan spaces: audio seeks to each node's audioSec as the user navigates.
function withAudioSecs(nodes: TourNode[], secs: (number | null)[]): TourNode[] {
  return nodes.map((n, i) => {
    const s = secs[i];
    return s != null ? { ...n, audioSec: s } : n;
  });
}

// ─── LTK panorama sequences ──────────────────────────────────────────────────
const ltk_cong_truong = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/truoc-cong-truong/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/quan-an-vat/shot-01.jpg',
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
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/ho-thanh-cong/shot-13.jpg',
];

const HTC_YAWS: Record<string, { fwd: number; back: number }> = {
  'htc-01': { fwd: -31,  back: 149  },
  'htc-02': { fwd:  36,  back: -144 },
  'htc-03': { fwd:   0,  back: 130  },
  'htc-06': { fwd: -78,  back: -130 },
  'htc-07': { fwd: -52,  back: 128  },
  'htc-08': { fwd: -25,  back: 155  },
  'htc-10': { fwd: -82,  back: 98   },
  'htc-12': { fwd: -29,  back: 151  },
};

const ltk_quan_net = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/all/shot-009.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-04.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-05.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-06.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-07.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-08.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/all/shot-023.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-09.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-10.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/shot-11.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/duong-den-quan-net/all/shot-033.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/trong-quan-net/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/trong-quan-net/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/ltk/trong-quan-net/shot-04.jpg',
];

const QN_YAWS: Record<string, { fwd: number; back: number }> = {
  'qn-03': { fwd: -13,  back: 167  },
  'qn-04': { fwd: -14,  back: 166  },
  'qn-05': { fwd:   9,  back: -171 },
  'qn-12': { fwd: 121,  back: -59  },
  'qn-14': { fwd:  -7,  back: 173  },
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
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-06.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/playground/shot-08.jpg',
];

const TT_PG_YAWS: Record<string, { fwd: number; back: number }> = {
  'tt-pg-02': { fwd:  20, back: -160 },
  'tt-pg-03': { fwd:  19, back: -167 },
  'tt-pg-04': { fwd:  47, back:  177 },
  'tt-pg-05': { fwd: -23, back:  157 },
};

const trang_quan_oc = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/all/shot-005.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/trang/quan-oc-oanh/shot-04.jpg',
];

const TT_OC_YAWS: Record<string, { fwd: number; back: number }> = {
  'tt-oc-03': { fwd: 14, back: -166 },
  'tt-oc-04': { fwd: 15, back: -165 },
  'tt-oc-05': { fwd: 18, back: -162 },
};

const CT_YAWS: Record<string, { fwd: number; back: number }> = {
  'ct-01': { fwd: -79, back:  101 },
  'ct-02': { fwd:   7, back: -173 },
  'ct-03': { fwd: -16, back:  164 },
  'ct-04': { fwd:   0, back: -102 },
};

// ─── Essy panorama sequences ──────────────────────────────────────────────────
const ES_NG_YAWS: Record<string, { fwd: number; back: number }> = {
  'es-ng-01': { fwd:   2, back: -178 },
};

const essy_duong_vao_nha = [
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-01.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-02.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-03.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-04.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-05.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-06.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-07.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-08.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-09.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-10.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-11.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/all/new-12.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-10.jpg',
  'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/tours/essy/duong-vao-nha/shot-11.jpg',
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
  narrator: 'Lê Trung Kiên',
  title: 'Thanh Cong Area',
  subtitle: 'A normal childhood day of Le Trung Kien',
  coverColor: '#4a3e75',
  spaces: [
    {
      id: 'cong-truong',
      label: 'School Gate',
      sublabel: 'Thanh Cong A Elementary School — manga rental shop, collectible cards, lipstick ice cream, lemon ice cream',
      lat: 21.023324, lng: 105.812746,
      quyhoachUrl: 'https://www.google.com/search?q=bản+đồ+quy+hoạch+phường+Thành+Công+Ba+Đình&tbm=isch',
      audioSegment: { src: '/audio/oral-history/thanh-cong.m4a', startSec: 36, endSec: 439 },
      narratorBio: [
        'Elementary classroom without A/C — windows open, hearing teachers from different classes arguing.',
        'Doraemon manga rental shop for 2,000 VND/day — "sharing economy before Grab existed".',
        'The school drum sound while eating lemon ice cream at the gate: both exciting and terrifying of being late.',
      ],
      bgGradient: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 40%, #d4b896 100%)',
      bgTone: '#c8a96e',
      bgTourNodes: withAudioSecs(withHistoric(applyYaws(makeNodes(ltk_cong_truong, [
        { idx: 0, clueId: 'trang-tieng-trong', yaw: 30, pitch: -13, audioSec: 61 },
        { idx: 3, clueId: 'trang-an-vat', yaw: 0, pitch: 0 },
      ], 'ct', [
        { idx: 3, scanUrl: '/scans/quan-an-vat.glb', label: 'View 3D Food Stall', yaw: 0, pitch: -10, clueId: 'trang-an-vat' },
      ], [
        [21.023341657971606, 105.81264611592633],
        [21.0233557985251,   105.81270836766542],
        [21.02333825323251,  105.81250965996118],
        [21.02333825323251,  105.81250965996118],
      ]), CT_YAWS), [
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781406756612!6m8!1m7!1sgw5FtU3SO2EZh6Fw6DHM1Q!2m2!1d21.02335819365613!2d105.812700469784!3f177.3934717023654!4f-8.877060164979412!5f0.7820865974627469' },
      ]),
      // node 0=gate(36s) 1=stall-view1(88s) 2=stall-view3(127s) 3=stall+scan(279s lemon-ice-cream)
      [36, 88, 127, 279]),
      memoryEchoes: [
        '"Doraemon books for 2,000đ a day..."',
        '"Lemon ice cream after school..."',
        '"The urgent sound of the school drum..."',
        '"Windows open, hearing other classes..."'
      ],
      clues: [
        {
          id: 'trang-an-vat',
          type: 'routine',
          label: 'Lemon ice cream, lipstick ice cream — and the manga rental shop',
          quote:
            '"Back then, when the drum rang and you were standing at the gate eating lemon ice cream, you felt so rushed and scared."',
          voiceNote:
            'Le Trung Kien remembers three things clearly at the gate of Thanh Cong A Elementary School: first, the Doraemon and Greek mythology manga rental shop for 2,000 to 3,000 VND a day — "sharing economy, the first sharing economy model I knew before Grab"; second, buying soccer and Vinamilk cards to collect — "children\'s power lies in having more items than friends"; third, lemon ice cream because classrooms had no A/C, and lipstick ice cream — a popsicle that looks like a lipstick, twisted up and licked. The rental shop disappeared when Kien reached grade 4-5. Lemon ice cream disappeared when A/C was installed in classrooms.',
          planningImpact:
            'The area around Thanh Cong A school gate will be completely cleared. Street vendors selling lemon ice cream on the sidewalk and spontaneous manga rental shops will be relocated to make way for parent parking lots and wide pavements.',
          ambient: 'wind',
          audioSrc: '/audio/trang-an-vat.mp3',
          x: 28,
          y: 58,
        },
        {
          id: 'trang-tieng-trong',
          type: 'sound',
          label: 'School drum — and the sounds due to no air conditioning',
          quote:
            '"Without air conditioning, doors had to stay open — so we heard everything: birds chirping, adjacent classrooms, and teachers scolding each other."',
          voiceNote:
            'The elementary classrooms at Thanh Cong A didn\'t have A/C until grade 3 or 4. The windows were always open — letting outside noise flood in. Kien remembers the teachers often having drama: one class being noisy affecting another, the teacher next door coming over to argue. The school drum sound especially triggered strong feelings — "especially feeling rushed and scared of being late, particularly when snacking at the school gate." Now with doors closed and A/C on, those sounds are gone.',
          planningImpact:
            'The renovation plan for Thanh Cong A Elementary School in 2026 will construct new closed 5-story buildings with central A/C and soundproof glass windows. Lecturing sounds leaking to other classes or school drums echoing into the alleys will be completely blocked.',
          ambient: 'school-drum',
          audioSrc: '/audio/trang-tieng-trong.mp3',
          x: 68,
          y: 42,
        },
      ],
    },
    {
      id: 'quan-net',
      label: 'Net Café — family owned',
      sublabel: 'Follow Kien from the school gate to his family net café — CRT monitors, Audition clatter "clack clack clack"',
      lat: 21.020861, lng: 105.813559,
      quyhoachUrl: 'https://www.google.com/search?q=quy+hoạch+cải+tạo+tập+thể+Thành+Công+Ba+Đình&tbm=isch',
      audioSegment: { src: '/audio/oral-history/thanh-cong.m4a', startSec: 439, endSec: 527 },
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/quan-net-gaming.mp4',
      narratorBio: [
        'My family ran a net café — after school I\'d go straight home to play games, no need to visit others\' shops.',
        'Gigantic CRT monitors, heavy computer towers behind them, headphones and webcams — the legendary full setup.',
        'Dad only allowed me to play for an hour, tracking time to pick me up for dinner. "And the net café had A/C."',
      ],
      bgGradient: 'linear-gradient(160deg, #2a1f3d 0%, #3d2f5c 50%, #1a1228 100%)',
      bgTone: '#1a1228',
      bgTourNodes: withAudioSecs(withHistoric(applyYaws(makeNodes(ltk_quan_net, [
        { idx: 11, clueId: 'trang-tieng-chui', yaw: -1, pitch: -2 },
      ], 'qn', [
        { idx: 16, scanUrl: '/scans/quan-net.glb', label: 'View 3D Net Café', yaw: 0, pitch: -10 },
      ], [
        [21.023344, 105.812717], // qn-01
        [21.023403, 105.813224], // qn-02
        [21.023435, 105.813605], // qn-03
        [21.023410, 105.813889], // qn-04
        [21.023185, 105.813940], // qn-05
        [21.022671, 105.814008], // qn-06
        [21.022311, 105.814059], // qn-07
        [21.021553, 105.814141], // qn-08
        [21.021368, 105.814025], // qn-09
        [21.021215, 105.814017], // qn-10
        [21.021185, 105.813679], // qn-11
        null, null, null, null, null, null, // qn-12..17: indoor café, no GPS
      ]), QN_YAWS), [
        { idx: 3,  url: 'https://www.google.com/maps/embed?pb=!4v1781407111689!6m8!1m7!1slPxhHBlAz66aKFd1Embsdw!2m2!1d21.02347691720712!2d105.8137573922583!3f103.09771536124487!4f-11.130644329606284!5f0.7820865974627469' },
        { idx: 4,  url: 'https://www.google.com/maps/embed?pb=!4v1781407214602!6m8!1m7!1sQgjDRoyS4wS42RVMqWJOng!2m2!1d21.02330514445645!2d105.8139358308204!3f119.53192455044567!4f-1.6804918275248895!5f0.7820865974627469' },
        { idx: 5,  url: 'https://www.google.com/maps/embed?pb=!4v1781407244320!6m8!1m7!1sSGRebU7lddzbDf2VOWU0DA!2m2!1d21.02268538074701!2d105.814032037225!3f187.01444020052543!4f-5.372352210014924!5f0.7820865974627469' },
        { idx: 6,  url: 'https://www.google.com/maps/embed?pb=!4v1781407286662!6m8!1m7!1st339e7O8lnS4VdjB-3JZ7A!2m2!1d21.02187181043283!2d105.8141045055832!3f169.68711556475915!4f-9.580848139812787!5f0.7820865974627469' },
        { idx: 7,  url: 'https://www.google.com/maps/embed?pb=!4v1781407062490!6m8!1m7!1s9zFbWecZ9F2sL5QsXhzegA!2m2!1d21.02146714834353!2d105.8141146278655!3f95.22881881848323!4f0!5f0.7820865974627469' },
        { idx: 8,  url: 'https://www.google.com/maps/embed?pb=!4v1781407009670!6m8!1m7!1sqQjwzEUZWPM_9nT86j3UrA!2m2!1d21.02131186181676!2d105.814022273258!3f178.13185559786697!4f-4.577780076155491!5f0.7820865974627469' },
        { idx: 9,  url: 'https://www.google.com/maps/embed?pb=!4v1781406844727!6m8!1m7!1s8GbK_z_u6JmL2Oq_b8ndVw!2m2!1d21.02121343497108!2d105.8140269312972!3f253.58290338190974!4f-13.194011320911557!5f0.7820865974627469' },
      ]),
      // 0-1=leaving school(439s) 2-3=café reveal(444s) 4-6=neighbourhood(450s)
      // 7-10=CRT setup(465s) 11-13=approaching door(480s) 14-15=inside(497s) 16=scan(497s two sounds)
      [439, 439, 444, 444, 450, 455, 460, 463, 466, 469, 475, 480, 485, 490, 497, 509, 497]),
      memoryEchoes: [
        '"Audition keys clattering: clack-clack-clack..."',
        '"Huge CRT monitors with heavy computer towers..."',
        '"Just one hour of play before dinner..."',
        '"Our family café had air conditioning..."'
      ],
      clues: [
        {
          id: 'trang-tieng-chui',
          type: 'sound',
          label: 'The two sounds of the net café',
          quote:
            '"There were only two sounds in the net café: the laughing and cursing at each other — and the clatter of keyboards from girls playing Audition, clack clack clack."',
          voiceNote:
            'Kien\'s family net café: full setup with very bulbous CRT monitors and huge CPU towers behind them — "the larger the tower, the smaller the screen." The mouse, keyboard, headset, and webcam. The only two sounds: trash-talking when losing games and the rhythmic \'clack clack clack\' of Audition players — "very artistic." His dad only allowed him to play for one hour before picking him up for dinner.',
          planningImpact:
            'Local net cafés with curved CRT monitors and the free-spirited childhood atmosphere will completely disappear, replaced by modern cyber gaming arenas with soundproof headphones and central A/C, leaving no room for raw, communal shouting.',
          ambient: 'keyboard',
          audioSrc: '/audio/trang-tieng-chui.mp3',
          x: 35,
          y: 55,
        },
        {
          id: 'trang-choi-net',
          type: 'routine',
          label: 'Family-owned net café',
          quote:
            '"It turns out my family ran a net café. That was an amazing childhood. Plus, the net café had A/C."',
          voiceNote:
            'What Kien didn\'t say upfront: after school, he didn\'t need to go to a net café — he went home. His family owned one. That\'s why he was always eager to go home — "I was so excited to go home and play games." And the closing remark for his day: school had no A/C, the concrete lake was uneven with barking dogs and smelly fish — but home had A/C. "The net café had A/C."',
          planningImpact:
            'Kien\'s family house and net café will be partially demolished to expand the internal roads of the Thanh Cong apartment complex. The childhood memory of running straight to the A/C room to play games after school will exist only in memories.',
          ambient: 'keyboard',
          audioSrc: '/audio/trang-choi-net.mp3',
          x: 62,
          y: 48,
        },
      ],
    },
    {
      id: 'ho-thanh-cong',
      label: 'Thanh Cong Lake',
      sublabel: 'Squeezing the bike through the back gate, uneven concrete — no one from Thanh Cong enters through the main gate',
      lat: 21.020445, lng: 105.813269,
      quyhoachUrl: 'https://www.google.com/search?q=quy+hoạch+công+viên+hồ+Thành+Cong+mở+hàng+rào&tbm=isch',
      audioSegment: { src: '/audio/oral-history/thanh-cong.m4a', startSec: 527, endSec: 660 },
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/ho-thanh-cong-panoramic.mp4',
      isPanoramicVideo: true,
      vimeoUrl: 'https://player.vimeo.com/video/1201125510?badge=0&autopause=0&player_id=0&app_id=58479',
      minimapFlipX: true,
      bgGradient: 'linear-gradient(160deg, #c8dde8 0%, #a3c4d5 40%, #7eaabf 100%)',
      bgTone: '#5a7a8a',
      bgTourNodes: withAudioSecs(withHistoric(applyYaws(makeNodes(ltk_ho_thanh_cong, [
        { idx: 0, clueId: 'trang-cong-sau', yaw: -175, pitch: -29 },
        { idx: 5, clueId: 'trang-xe-dap', yaw: 25, pitch: -8, audioSec: 609 },
      ], 'htc', undefined, [
        [21.020390, 105.813167], // htc-01
        [21.020328, 105.813291], // htc-02
        [21.020333, 105.813458], // htc-03
        [21.020349, 105.813621], // htc-04
        [21.020346, 105.813711], // htc-05
        [21.020295, 105.813714], // htc-06
        [21.020278, 105.813669], // htc-07
        [21.020258, 105.813606], // htc-08
        [21.020229, 105.813552], // htc-09
        [21.020156, 105.813370], // htc-10
        [21.020121, 105.813241], // htc-11
        [21.020177, 105.812859], // htc-12 (was htc-13)
      ]), HTC_YAWS), [
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781407926721!6m8!1m7!1sAnVN58QpnXISxwLh_W32yA!2m2!1d21.02048879554921!2d105.8132082827019!3f195.77940340158702!4f-7.682892952432283!5f0.7820865974627469' },
      ]),
      // 0=grandparents bring to lake(527s) 2=concrete not paved(540s) 5=back gate hard to open(560s)
      // 7=squeezing bike through(582s) 8=park fences removed(594s) 9=bicycle question(609s)
      // 10=hated being forced to learn(618s) 11=fear of falling in public(631s)
      [527, 534, 540, 550, 555, 560, 571, 582, 594, 609, 618, 631]),
      memoryEchoes: [
        '"Uneven concrete paths by the lake..."',
        '"Squeezing through the half-closed back gate..."',
        '"Community speakers playing aerobic music..."',
        '"Fearing to fall in front of people..."'
      ],
      clues: [
        {
          id: 'trang-cong-sau',
          type: 'place',
          label: 'The back gate that never opened fully',
          quote:
            '"Thanh Cong people never use the main entrance. The back gate was always stuck half-open — you had to squeeze your bike through and walk it down the steps."',
          voiceNote:
            'Real Thanh Cong residents never entered the lake through the main front gate facing the street. They used a small side gate that was always only half-open — no one knew why. You had to lift your bike over a raised threshold, squeeze through the narrow gap, and walk it down the uneven concrete steps. A very physical, obstacle-course ritual that served as an unspoken litmus test of belonging. That gate, along with all the iron park fences, was dismantled under the new open-park policy.',
          planningImpact:
            'All iron fences around Thanh Cong Lake have been removed per the city\'s open-park policy. The half-open side gate that generations of locals squeezed their bikes through no longer exists — the entire perimeter is now open.',
          ambient: 'cicadas',
          x: 20,
          y: 50,
        },
        {
          id: 'trang-xe-dap',
          type: 'routine',
          label: 'Learning to ride a bicycle — and hating it',
          quote:
            '"I didn\'t care about Thanh Cong Lake. Back then, being forced to learn cycling made me hate it already."',
          voiceNote:
            'On weekends, Kien\'s grandparents took him to the lake to practice riding a bicycle. Back then, the lake path was uneven concrete, not paved like now. Lots of dogs, and a fishy smell from dead fish floating around. Kien didn\'t like it because he was scared of falling in front of people — "I didn\'t want to practice where people could watch me fall." He preferred the backyard of his maternal grandmother\'s house.',
          planningImpact:
            'The road around Thanh Cong Lake will be paved with uniform granite stone. The uneven concrete path that made beginner cyclists wobble is gone — along with the particular embarrassment and vulnerability of learning to ride here.',
          ambient: 'cicadas',
          audioSrc: '/audio/trang-xe-dap.mp3',
          x: 45,
          y: 62,
        },
      ],
    },
  ],
  routeClueIds: ['trang-an-vat', 'trang-choi-net', 'trang-xe-dap'],
  routeSlotLabels: ['After school, running to...', 'Stopping by the net café...', 'Then heading to the lake...'],
  cannotBeMoved: [
    'The Doraemon manga rental shop at the school gate — 2,000 VND a day, "sharing economy before Grab." Lost before Kien finished elementary school.',
    'Lemon ice cream bought because classrooms had no A/C — once A/C was installed, no one sold lemon ice cream anymore.',
    'Teachers scolding each other through the open windows — now with doors closed and A/C running, nothing can be heard.',
    'The back gate of Thanh Cong Lake that never opened fully, forcing you to squeeze your bike in. Thanh Cong people never use the main entrance.',
    'The fishy lake smell and stray dogs — back then it was bumpy concrete, not stone paved. The rusty iron fence has been removed.',
    'The clatter of Audition players and the shouting in the air-conditioned net café — run by my family, so I could play as soon as I got home.',
  ],
  cluesNeededToUnlock: 4,
};

// ─── Story B: Essy / Ngõ 267 Hoàng Hoa Thám ──────────────────────────────────
const ESSY: Story = {
  id: 'essy',
  narrator: 'Essy',
  title: 'Alley – Market – Well',
  subtitle: 'Things only locals know — and are about to lose',
  coverColor: '#7d9b84',
  spaces: [
    {
      id: 'nha-ngo',
      label: 'House / Alley',
      sublabel: 'No. 17, 267/33 Hoang Hoa Tham — turning three or four times to enter, Grab drivers can never find it',
      lat: 21.041427, lng: 105.817931,
      quyhoachUrl: 'https://www.google.com/search?q=dự+án+mở+đường+dốc+Tam+Đa+Hoàng+Hoa+Thám+quy+hoạch&tbm=isch',
      audioSegment: { src: '/audio/oral-history/hoang-hoa-tham.m4a', startSec: 1, endSec: 291 },
      narratorBio: [
        'House nested deep between three main roads — Essy knows five ways to reach it from three different directions.',
        '"Maps don\'t display it correctly. We must rely on the local knowledge of long-term residents."',
        'Ride-hailing drivers can almost never find it on their own — Essy always has to go out to meet them or give directions.',
      ],
      bgGradient: 'linear-gradient(160deg, #d4c5a9 0%, #c5b08a 40%, #b09060 100%)',
      bgTone: '#6b5a3e',
      bgTourNodes: withAudioSecs(withHistoric(applyYaws(makeNodes(essy_duong_vao_nha, [
        { idx: 0, clueId: 'essy-ngo-kho', yaw: 25, pitch: -8, audioSec: 75 },
        { idx: 13, clueId: 'essy-cay-xanh-ngo', yaw: 25, pitch: -8, audioSec: 20 },
      ], 'es-ng', [
        { idx: 13, scanUrl: '/scans/nha-essy.glb', label: 'View 3D House', yaw: 0, pitch: -10 },
      ], [
        [21.041167, 105.816469], // es-ng-01
        [21.041059, 105.816739], // es-ng-02
        [21.041176, 105.816851], // es-ng-03
        [21.041228, 105.816917], // es-ng-04
        [21.041178, 105.817171], // es-ng-05
        [21.041080, 105.817355], // es-ng-06
        [21.041063, 105.817496], // es-ng-07
        [21.041038, 105.817636], // es-ng-08
        [21.040941, 105.817831], // es-ng-09
        [21.041038, 105.817946], // es-ng-10
        [21.041057, 105.818141], // es-ng-11 (was es-ng-12; old es-ng-11 deleted)
        [21.041025, 105.818295], // es-ng-12 (was es-ng-13)
        [21.040962, 105.818295], // es-ng-13 (was es-ng-14)
        [21.040736, 105.818230], // es-ng-14 (was es-ng-15)
      ]), ES_NG_YAWS), [
        { idx: 9,  url: 'https://www.google.com/maps/embed?pb=!4v1781412371328!6m8!1m7!1s2TWphYbHFgWWSOFqrtsw9A!2m2!1d21.04103909428119!2d105.8178888444568!3f40.074094664986106!4f-19.58369068018274!5f0.7820865974627469' },
        { idx: 10, url: 'https://www.google.com/maps/embed?pb=!4v1781412199393!6m8!1m7!1s7d03mG0z6vi2eZtWE7TRFQ!2m2!1d21.04106422876278!2d105.8181299031744!3f107.38807014797955!4f0.4437072786251264!5f0.7820865974627469' },
        { idx: 13, url: 'https://www.google.com/maps/embed?pb=!4v1781412069003!6m8!1m7!1sUAlJ_dGe8w88WdPKaRZJuw!2m2!1d21.04098537974627!2d105.818354031628!3f202.05707186222304!4f-13.064484507307242!5f0.7820865974627469' },
      ]),
      // 0=deep in alley(1s) 2=row of houses/courtyard(33s) 3=freshness entering(45s)
      // 5=between 3 streets(82s) 6=Grab drivers can't find it(82s) 7=road will cut through(148s)
      // 9=community sharing(218s) 10=childhood grocery trips(240s) 13=scan+trust/tab(277s)
      [1, 20, 33, 45, 62, 82, 82, 148, 164, 218, 240, 252, 262, 277]),
      memoryEchoes: [
        '"Five ways to enter from three main roads..."',
        '"Deep alleys where Grab drivers get lost..."',
        '"A courtyard smelling of jasmine and lemon..."',
        '"Neighbors borrowing money and letting you run a tab..."'
      ],
      clues: [
        {
          id: 'essy-ngo-kho',
          type: 'place',
          label: 'Only alley residents know the way',
          quote:
            '"Essy knows about five ways to enter the house from three different roads. This is a memory only those who live here possess."',
          voiceNote:
            'Essy\'s house is at No. 17, 267/33 Hoang Hoa Tham — requiring three or four turns from the main road to enter. Tucked between Hoang Hoa Tham, Van Cao, and Doi Can streets, Essy knows more than five routes to the house. Maps don\'t show it accurately — "we have to rely on the local knowledge of people who have lived here for a long time." Ride-hailing drivers can almost never find it — Essy always has to go out to pick them up or guide them over the phone. When the new road is opened, no one will need to navigate anymore. "Our memories and our understanding of this area will no longer be of any use."',
          planningImpact:
            'The Tam Da slope expansion project will cut straight through alley 267 Hoang Hoa Tham. The maze of winding alleys that once "disabled navigation apps" will be completely demolished to make way for a wide roadway.',
          ambient: 'wind',
          audioSrc: '/audio/essy-ngo-kho.mp3',
          x: 40,
          y: 60,
        },
        {
          id: 'essy-cay-xanh-ngo',
          type: 'loss',
          label: 'Secluded row of houses — lemon trees, jasmine, and freshness',
          quote:
            '"Every time entering that secluded zone — oh, such a freshness and coolness that you could hardly find anywhere else in this city of Hanoi."',
          voiceNote:
            'Six or seven houses in a secluded row, with custom brickwork, sharing a courtyard planted with lemon trees and jasmine. Essy calls this one of the two things that will be missed the most: the green space that lowers the temperature, the "third places" the whole neighborhood enjoys thanks to the leafy alleys and garden cafés. When the road is widened, the trees will be cut down. "Those spaces are rare in Hanoi. Now when everything is cleared, we lose even more."',
          planningImpact:
            'Over 80% of the secluded houses in alley 267 will be acquired and demolished for road construction. The cool shared brick courtyard, along with the jasmine and lemon trees that connected ten families, will disappear forever.',
          ambient: 'wind',
          audioSrc: '/audio/essy-cay-xanh-ngo.mp3',
          x: 25,
          y: 38,
        },
      ],
    },
    {
      id: 'gieng-khu-choi',
      label: 'Well / Playground',
      sublabel: 'A path only locals know — leading to an old well now turned into a community yard',
      lat: 21.040723, lng: 105.818568,
      quyhoachUrl: 'https://www.google.com/search?q=quy+hoạch+dốc+Tam+Đa+phường+Ngọc+Hà+Ba+Đình&tbm=isch',
      audioSegment: { src: '/audio/oral-history/hoang-hoa-tham.m4a', startSec: 291 },
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/gieng-v2.mp4',
      isPanoramicVideo: true,
      vimeoUrl: 'https://player.vimeo.com/video/1201125560?badge=0&autopause=0&player_id=0&app_id=58479',
      bgGradient: 'linear-gradient(160deg, #a8c5a0 0%, #7da87a 40%, #5a8a56 100%)',
      bgTone: '#3a6a36',
      bgTourNodes: withAudioSecs(withHistoric(makeNodes(essy_playground, [
        { idx: 0, clueId: 'essy-tre-con-gieng', yaw: 17, pitch: -8 },
        { idx: 3, clueId: 'essy-di-tich', yaw: 25, pitch: -8, audioSec: 362 },
      ], 'es-gk'), [
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781411941294!6m8!1m7!1s4kK0rMHW11aCh1X_sTPlaQ!2m2!1d21.04034879948579!2d105.817488961791!3f281.32678038512734!4f-16.875345166491712!5f0.7820865974627469' },
      ]),
      // 0=leave HHT street/nice area(291s) 1=path only locals know/leads to well(298s)
      // 2=the well/converted to exercise yard(308s) 3=comfortable/shops+market(324s)
      [291, 298, 308, 324]),
      memoryEchoes: [
        '"A hidden shortcut to the ancient well..."',
        '"Shaded green courtyard, cooler than the city..."',
        '"An old temple hidden in the deep alley..."',
        '"Third places that cool down our summers..."'
      ],
      clues: [
        {
          id: 'essy-tre-con-gieng',
          type: 'place',
          label: 'The path to the well — known only to locals',
          quote:
            '"It leads to a well. I have never seen anyone who isn\'t from this neighborhood know that path."',
          voiceNote:
            'Coming from the direction of Van Cao, there is a tiny path that only locals know — leading to the old well, which has now been renovated into a community exercise yard. Tucked inside the alley are many trees, with surrounding buildings shielding it from the sun — making it much cooler than out on the streets. Around the well is also a small spontaneous market for residents near Van Cao. No one from outside the neighborhood knows about this place.',
          planningImpact:
            'The ancient well area and the cool shared courtyard deep inside alley 267 will be cleared of surrounding greenery to facilitate the widening of the road connecting to Tam Da slope, destroying the alley\'s natural microclimate.',
          ambient: 'kids-laughter',
          audioSrc: '/audio/essy-tre-con-gieng.mp3',
          x: 42,
          y: 58,
        },
        {
          id: 'essy-gieng-mat',
          type: 'loss',
          label: 'National monument — about to face the main road',
          quote:
            '"Inside alley 267, there is a temple. High chance it will end up facing the main road. Anyone can look it up."',
          voiceNote:
            'Essy shares something that surprises many: inside alley 267 Hoang Hoa Tham lies an ancient temple — a national monument. Very few Hanoi residents know about it. And in the clearance plans, this monument is "very close to the road or will end up directly facing it." A national monument hidden in an alley that Grab can never find.',
          planningImpact:
            'Under the new infrastructure design, the ancient temple (a national monument hidden away) will have its quiet front buffer zone significantly reduced, transforming it from a peaceful alley sanctuary to sitting directly on the edge of a 4-lane asphalt road.',
          ambient: 'wind',
          audioSrc: '/audio/essy-gieng-mat.mp3',
          x: 68,
          y: 35,
        },
        {
          id: 'essy-di-tich',
          type: 'place',
          label: 'Garden coffee shops — and the trees will be cut down',
          quote:
            '"The most famous thing in this area is garden coffee. Because there are a lot of trees here."',
          voiceNote:
            'The neighborhood in alley 267 has been rejuvenated recently — ramen shops, study cafés, garden coffee shops. The reason it\'s popular: lots of trees, surrounding buildings shielding the sun — a rare green oasis in Hanoi. When the road is built, those shops will become the road. The trees will be cut down. "I really regret this because those third places or cooling zones are already so rare in Hanoi."',
          planningImpact:
            'The garden cafés and the cooling spaces under the canopy of large old trees in the alley will be reclaimed for the main road. All old-growth trees will be chopped down to standardize the transport infrastructure.',
          ambient: 'plucks',
          audioSrc: '/audio/essy-di-tich.mp3',
          x: 25,
          y: 48,
        },
      ],
    },
  ],
  routeClueIds: ['essy-ngo-kho', 'essy-cay-xanh-ngo', 'essy-tre-con-gieng'],
  routeSlotLabels: ['From the alley entrance...', 'Through the green space...', 'To the ancient well...'],
  cannotBeMoved: [
    'The mental map — five ways to enter the house from three different roads, known only to those who live here.',
    'The courtyard in the secluded row of houses — custom bricks, lemon trees, jasmine, surprisingly cool in the city.',
    'The hidden shortcut to the well that no outsider has ever known.',
    'The national monument hidden in an alley Grab cannot find — soon to be facing a busy main road.',
    'Garden cafés under the tree canopy — when the road is opened, trees will fall and these spaces will be gone.',
  ],
  cluesNeededToUnlock: 4,
};

// ─── Story C: Trang / Khu Trung Liệt ─────────────────────────────────────────
const TRANG_THAI_THINH: Story = {
  id: 'thai-thinh',
  narrator: 'Trang',
  title: 'Trung Liet Area',
  subtitle: 'Fragments of memory Trang had forgotten — and found again before this neighborhood disappears',
  coverColor: '#5a7a5a',
  spaces: [
    {
      id: 'nha-hoc-them',
      label: 'Extra Class',
      sublabel: 'Near mother\'s shop — around 4-5 PM she walked me to class, not a single car on the street',
      lat: 21.009981, lng: 105.820251,
      quyhoachUrl: 'https://www.google.com/search?q=bản+đồ+quy+hoạch+đường+Nguyễn+Văn+Tuyết+Đống+Đa&tbm=isch',
      audioSegment: { src: '/audio/oral-history/trung-liet.m4a', startSec: 27, endSec: 214 },
      narratorBio: [
        'Every afternoon around 4-5 PM, mom walked me through the quiet streets to preschool tutoring class.',
        'Nguyen Van Tuyet street used to be a ditch — no cars, no noise, neighbors knew each other.',
        'Recently passing by on the way home from work, seeing a car parked — "that was a rather strange feeling."',
      ],
      bgGradient: 'linear-gradient(160deg, #f0e4c8 0%, #d9c49a 40%, #c4a870 100%)',
      bgTone: '#c4a870',
      bgTourNodes: withAudioSecs(withHistoric(applyYaws(makeNodes(trang_di_hoc_them, [
        { idx: 0, clueId: 'thai-thinh-hoc-them', yaw: 68, pitch: -13, audioSec: 66 },
        { idx: 0, clueId: 'thai-thinh-pho-khong-xe', yaw: 62, pitch: -4 },
      ], 'tt-hoc', undefined, [
        [21.010379, 105.819129], // tt-hoc-01
        [21.010477, 105.819357], // tt-hoc-02
        [21.010486, 105.819515], // tt-hoc-03
        [21.010738, 105.819687], // tt-hoc-04
        [21.011042, 105.819416], // tt-hoc-05
        [21.011199, 105.819608], // tt-hoc-06
        [21.011296, 105.819560], // tt-hoc-07
      ]), TT_HOC_YAWS), [
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781408126695!6m8!1m7!1sTv5fNyWV5uUbRuPQSq2dIA!2m2!1d21.01024182268491!2d105.8189569940536!3f237.84655727624724!4f-6.8214980075420755!5f0.7820865974627469' },
        { idx: 1, url: 'https://www.google.com/maps/embed?pb=!4v1781408170669!6m8!1m7!1sVjpr5xP4uSQrqxEc5KCj0g!2m2!1d21.01017391394856!2d105.8187200549374!3f219.59939081504942!4f-28.616128720245776!5f0.7820865974627469' },
        { idx: 2, url: 'https://www.google.com/maps/embed?pb=!4v1781408292936!6m8!1m7!1s2ZGDnTFUf7dkQ92AzPYXAg!2m2!1d21.01049023995335!2d105.8195154370104!3f62.25513190348058!4f-6.287237986228803!5f0.7820865974627469' },
        { idx: 3, url: 'https://www.google.com/maps/embed?pb=!4v1781408364592!6m8!1m7!1s_n6SQubPSlBt-Zd_87SShA!2m2!1d21.01075480596271!2d105.8196807127992!3f324.39853889627045!4f-6.447499879491232!5f0.7820865974627469' },
        { idx: 4, url: 'https://www.google.com/maps/embed?pb=!4v1781408422825!6m8!1m7!1s1XpIx8FMLqaQpo6_jUhk7A!2m2!1d21.01095812934958!2d105.8195033436658!3f317.37933527468243!4f-3.6715733113441473!5f0.7820865974627469' },
      ]),
      // 0=extra classes near mom's shop(27s) 1=4-5PM mom walks me(63s) 2=not many cars(79s)
      // 3=walking back from work surprised(87s) 4=last time I saw alley no cars(98s)
      // 5=motorbikes replaced by cars(125s) 6=Nguyen Van Tuyet was a ditch(152s)
      [27, 63, 79, 87, 98, 125, 152]),
      memoryEchoes: [
        '"Walking to class around 4 or 5 PM..."',
        '"A quiet street when the road was still a ditch..."',
        '"A parked car felt so strange..."',
        '"Before the ditch became a food street..."'
      ],
      clues: [
        {
          id: 'thai-thinh-hoc-them',
          type: 'routine',
          label: '4-5 PM, mom walking me to tutoring class',
          quote:
            '"After lunch, our family rested a bit. Then around four or five o\'clock, my mother started walking me to the extra class."',
          voiceNote:
            'Trang\'s family ran a shop in the Trung Liet area — it wasn\'t their residential home. Her mother used to take her there for lunch and then walk her to tutoring class before she started first grade. The street back then was very empty — the last time Trang remembers seeing it, there were never any cars. Nguyen Van Tuyet street was still an open ditch back then — no vehicles passed by. Recently, returning home from work through there, she saw a car parked — "that was a rather strange feeling." Now that ditch road has turned into a bustling food street, filled with bar music at night.',
          planningImpact:
            'The small alley leading to the tutor\'s house will be cleared to widen Nguyen Van Tuyet street into 4 lanes. The quiet late-afternoon atmosphere will turn into a busy traffic stream.',
          ambient: 'plucks',
          audioSrc: '/audio/thai-thinh-hoc-them.mp3',
          x: 38,
          y: 55,
        },
        {
          id: 'thai-thinh-pho-khong-xe',
          type: 'sound',
          label: 'Quiet street — sounds before the ditch became a road',
          quote:
            '"My childhood was spent in that very peaceful street, no traffic, no passersby — mostly just neighbors who knew each other."',
          voiceNote:
            'Nguyen Van Tuyet street was once a drainage ditch — no cars, no noise. After the ditch was culverted and paved, it became a crowded food street. "At night, there\'s the thumping bass of bar music." Trang calls this a strange feeling: the same place, a dozen years apart, motorbikes replaced by cars.',
          planningImpact:
            'Nguyen Van Tuyet street (formerly a ditch) has been completely culverted to build a busy food street. The peaceful childhood sounds are replaced by honking horns and thumping music from bars.',
          ambient: 'wind',
          audioSrc: '/audio/thai-thinh-pho-khong-xe.mp3',
          x: 65,
          y: 42,
        },
      ],
    },
    {
      id: 'san-choi-tap-the',
      label: 'Apartment Playground',
      sublabel: 'Passed by countless times — yet never allowed to play inside once',
      lat: 21.010665, lng: 105.818798,
      quyhoachUrl: 'https://www.google.com/search?q=quy+hoạch+cải+tạo+chung+cư+cũ+Trung+Liệt+Đống+Đa&tbm=isch',
      audioSegment: { src: '/audio/oral-history/trung-liet.m4a', startSec: 214, endSec: 344 },
      narratorBio: [
        'On the way to extra class every afternoon, seeing other kids playing in the yard — not allowed to stop.',
        'To this very day, I have never entered that playground to play, despite passing by it countless times.',
        'If the area is demolished, there will be no chance left to ever experience it.',
      ],
      bgGradient: 'linear-gradient(160deg, #b8d4b0 0%, #8aba88 40%, #6a9866 100%)',
      bgTone: '#6a9866',
      bgTourNodes: withAudioSecs(applyYaws(makeNodes(trang_playground, [
        { idx: 0, clueId: 'thai-thinh-san-choi', yaw: 18, pitch: 0 },
        { idx: 4, clueId: 'thai-thinh-tieng-cuoi', yaw: -24, pitch: -21, audioSec: 250 },
      ], 'tt-pg', undefined, [
        [21.010385, 105.819069], // tt-pg-01
        [21.010467, 105.818988], // tt-pg-02
        [21.010522, 105.818919], // tt-pg-03
        [21.010562, 105.818888], // tt-pg-04
        [21.010552, 105.818833], // tt-pg-05
        [21.010552, 105.818833], // tt-pg-06
      ]), TT_PG_YAWS),
      // 0=always walked past on way to class(214s) 1=playground / never set foot inside(225s)
      // 2=five-year-old seeing kids play happily(250s) 3=wishing to stay and play(261s)
      // 4=walking past now still recalls that feeling(280s) 5=if playground cleared feeling gone(309s)
      [214, 225, 250, 261, 280, 309]),
      memoryEchoes: [
        '"Watching other kids play from afar..."',
        '"Never once allowed to enter and play..."',
        '"The urge of a five-year-old to run and play..."',
        '"If demolished, the trigger to remember will be gone..."'
      ],
      clues: [
        {
          id: 'thai-thinh-san-choi',
          type: 'loss',
          label: 'Never once played there, even to this day',
          quote:
            '"Even to this day, I have never stepped into that playground to play, although I have passed by it countless times."',
          voiceNote:
            'On her way to tutoring class every afternoon, Trang passed by the collective housing playground. She saw other kids playing, but couldn\'t stop — always having to go to the store, always having to study. "Just simply a child who really wanted to play but was forced to study. It\'s a feeling I can never experience again because I\'ve grown up." If the complex is demolished, Trang will lose the trigger that makes her pass by and recall that feeling.',
          planningImpact:
            'The playground at the foot of the old collective apartment blocks will be removed. The surrounding fence will be demolished to make way for a parking lot and high-rise commercial podiums.',
          ambient: 'kids-laughter',
          audioSrc: '/audio/thai-thinh-san-choi.mp3',
          x: 50,
          y: 58,
        },
        {
          id: 'thai-thinh-tieng-cuoi',
          type: 'sound',
          label: 'Laughter from the playground — heard when passing by',
          quote:
            '"It\'s a feeling that only I can sense, and it cannot be put into words."',
          voiceNote:
            'Trang doesn\'t call it jealousy. It was just the feeling of a five-year-old child wanting to stay and play, wanting to throw a tantrum just to stay. That feeling never disappeared — even now, passing by that street, it floods back. When the street is cleared, the trigger itself will be lost.',
          planningImpact:
            'Children in the collective apartment blocks will no longer have a secluded, safe playground. All outdoor play activities will have to move to public park facilities.',
          ambient: 'kids-laughter',
          audioSrc: '/audio/thai-thinh-tieng-cuoi.mp3',
          x: 72,
          y: 40,
        },
      ],
    },
    {
      id: 'quan-oc-violin',
      label: 'Violin Snail Stall',
      sublabel: 'Mother took me to eat snails to comfort me — and for the first time Trang learned what a violin was',
      lat: 21.011001, lng: 105.820834,
      quyhoachUrl: 'https://www.google.com/search?q=quy+hoạch+phố+ẩm+thực+Nguyễn+Văn+Tuyết+Đống+Đa&tbm=isch',
      audioSegment: { src: '/audio/oral-history/trung-liet.m4a', startSec: 344, endSec: 645 },
      narratorBio: [
        'Teacher slapped my hand for using an eraser with a fountain pen — Trang cried all the way home. Mom took me for snails.',
        'The stall owner sat playing the violin among the tables of snails — the first time Trang discovered what a violin was.',
        '"A violin can be played anywhere." Only when growing up did I learn violins are usually in symphony orchestras.',
      ],
      bgGradient: 'linear-gradient(160deg, #e8c890 0%, #d4a060 40%, #b87840 100%)',
      bgTone: '#c48040',
      videoClip: 'https://mcbwpmptykgjlwksokic.supabase.co/storage/v1/object/public/assets/video/quan-oc-violin.mp4',
      isPanoramicVideo: true,
      vimeoUrl: 'https://player.vimeo.com/video/1201125509?badge=0&autopause=0&player_id=0&app_id=58479',
      bgTourNodes: withAudioSecs(withHistoric(applyYaws(makeNodes(trang_quan_oc, [
        { idx: 0, clueId: 'thai-thinh-di-voi-me', yaw: 36, pitch: 6 },
        { idx: 4, clueId: 'thai-thinh-vio-oc', yaw: 25, pitch: -8, audioSec: 428 },
      ], 'tt-oc', undefined, [
        [21.010715, 105.819921], // tt-oc-01
        [21.011138, 105.820287], // tt-oc-02
        [21.011268, 105.820458], // tt-oc-03
        [21.011089, 105.820710], // tt-oc-04
        [21.011006, 105.820823], // tt-oc-05
      ]), TT_OC_YAWS), [
        { idx: 0, url: 'https://www.google.com/maps/embed?pb=!4v1781408630892!6m8!1m7!1sqqnx-p_V94aaSUetEHMvAg!2m2!1d21.01091163804722!2d105.8200952018351!3f42.95893351208221!4f-3.4922654802283972!5f0.7820865974627469' },
        { idx: 1, url: 'https://www.google.com/maps/embed?pb=!4v1781408663887!6m8!1m7!1spNB7WYfP2N6cX5e7_Yf62A!2m2!1d21.0111221435295!2d105.8202784838613!3f38.21358173713219!4f-6.256166983100783!5f0.7820865974627469' },
        { idx: 2, url: 'https://www.google.com/maps/embed?pb=!4v1781408723312!6m8!1m7!1spNB7WYfP2N6cX5e7_Yf62A!2m2!1d21.0111221435295!2d105.8202784838613!3f354.0648327138127!4f-5.592324029480807!5f0.7820865974627469' },
      ]),
      // 0=after class mom took me to eat snails(344s) 1=just a local spot back then(353s)
      // 2=strong sense of community(360s) 3=owner playing violin / first time I knew violin(428s)
      // 4=violin can be played anywhere even a snail stall(441s)
      [344, 353, 360, 428, 441]),
      memoryEchoes: [
        '"Boiled snails to comfort a crying child..."',
        '"An old man playing violin among the tables..."',
        '"Violin can be played anywhere, even here..."',
        '"Now viral on TikTok, but the neighborhood warmth is gone..."'
      ],
      clues: [
        {
          id: 'thai-thinh-vio-oc',
          type: 'sound',
          label: 'Hearing the violin for the first time — at a snail stall',
          quote:
            '"At that snail shop, the owner played the violin. That was the first time I knew what a violin was and how it was played."',
          voiceNote:
            'That day Trang used an eraser with a fountain pen — violating the rules, and the teacher hit her hand with a big wooden ruler. Trang cried all the way home. Her mother took her to eat boiled snails to comfort her — and at that stall, the owner played the violin. Trang thought violins could be played anywhere, even at snail stalls. Only when growing up did she realize it\'s an orchestral instrument. "To me, even now, the violin is still something quite close — because the first time I heard a violin was at a snail stall."',
          planningImpact:
            'The rustic violin music rising amidst sidewalk tables of boiled snails will be gone forever. This informal cultural space will be wiped out when the stall owner has to relocate due to street clearance policies.',
          ambient: 'violin',
          audioSrc: '/audio/thai-thinh-vio-oc.mp3',
          x: 46,
          y: 55,
        },
        {
          id: 'thai-thinh-di-voi-me',
          type: 'routine',
          label: 'Snail stall once known only to locals — now viral on TikTok',
          quote:
            '"No child will ever see a violin for the first time in a snail stall again."',
          voiceNote:
            'As a child, that snail stall was only known to residents in the area. "The lifestyle back then was very neighborly — people living in a private pocket knew each other." Now the stall is famous on TikTok. Trang doesn\'t know if the stall is scheduled for demolition, but if it is — "sẽ không còn ai cảm nhận được violin giống như mình đã cảm nhận violin nữa."',
          planningImpact:
            'The small sidewalk snail stall will be cleared in the urban order campaign. The afternoon trips with mother to eat snails after class will have no old shop to return to.',
          ambient: 'violin',
          audioSrc: '/audio/thai-thinh-di-voi-me.mp3',
          x: 65,
          y: 45,
        },
      ],
    },
  ],
  routeClueIds: ['thai-thinh-hoc-them', 'thai-thinh-san-choi', 'thai-thinh-vio-oc'],
  routeSlotLabels: ['Afternoon from mom\'s shop...', 'Passing the playground...', 'Eating snails with mom...'],
  cannotBeMoved: [
    'Trung Liet street when Nguyen Van Tuyet was still a ditch — not a single car, neighbors knew each other.',
    'The collective housing playground Trang passed by countless times but was never allowed inside.',
    'The five-year-old feeling of wanting to throw a fit to stay and play — recalled only when passing by that street.',
    'Hearing the violin for the first time in a tiny alley snail stall — and believing a violin could be played anywhere.',
    'The day I cried over using an eraser with a fountain pen, and mom took me for snails — "I feared other things and no longer feared the eraser."',
    'The journey of archiving memories, in truth, is also a journey of finding things once thought forgotten.',
  ],
  cluesNeededToUnlock: 4,
};

export const ALL_STORIES: Story[] = [TRANG, TRANG_THAI_THINH, ESSY];
