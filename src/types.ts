export type AmbientType =
  | 'keyboard'
  | 'aerobic'
  | 'kids-laughter'
  | 'cicadas'
  | 'wind'
  | 'violin'
  | 'plucks';

export type ClueType = 'place' | 'sound' | 'routine' | 'object' | 'loss';

export interface Clue {
  id: string;
  type: ClueType;
  label: string;
  quote: string;
  voiceNote: string;
  ambient: AmbientType;
  audioSrc?: string;  // '/audio/clue-id.mp3' — oral history clip
  x: number; // % from left in the scene panel
  y: number; // % from top
}

// --- 360 panorama tour types ---
export interface TourClueAnchor {
  clueId: string;
  yaw: number;    // degrees: 0 = forward, positive = right
  pitch: number;  // degrees: 0 = horizon, positive = up
}

export interface TourNavAnchor {
  toNodeId: string;
  yaw: number;
  pitch: number;
  label?: string;
}

export interface TourScanAnchor {
  scanUrl: string;
  yaw: number;
  pitch: number;
  label: string;
}

export interface TourNode {
  id: string;
  panorama: string;              // '/tours/location-name/node-01.jpg'
  lat?: number;                  // GPS latitude — used for minimap bearing
  lng?: number;                  // GPS longitude
  historicMapUrl?: string;       // Google Maps embed URL for historical Street View comparison
  clueAnchors?: TourClueAnchor[];
  navAnchors?: TourNavAnchor[];
  scanAnchors?: TourScanAnchor[];
}
// --------------------------------

export interface AudioSegment {
  src: string;       // '/audio/oral-history/thanh-cong.m4a'
  startSec: number;  // seconds into the file to begin playback
  endSec?: number;   // stop playback at this point (prevents bleeding into next segment)
}

export interface MemorySpace {
  id: string;
  label: string;
  sublabel: string;
  lat?: number;              // GPS latitude for map pin
  lng?: number;              // GPS longitude for map pin
  bgGradient: string;        // CSS gradient fallback
  bgTone: string;            // single CSS color for tinting
  bgImage?: string;          // static photo — used when no Street View and no tour
  bgStreetView?: string;     // Google Maps Street View embed — placeholder until tour is ready
  bgTourNodes?: TourNode[];  // 360 panorama tour — takes priority over everything
  bgTourAmbient?: string;    // '/tours/location-name/ambient.mp3'
  videoClip?: string;        // '/video/xxx.mp4' — short ambient clip shown inside space
  minimapFlipX?: boolean;    // mirror the minimap path horizontally (when physical path goes left)
  quyhoachUrl?: string;      // quyhoach.hanoi.vn embed URL — urban planning overlay
  audioSegment?: AudioSegment; // oral history segment for this space
  narratorBio?: string[];    // 2-3 bullet lines for the dossier card
  clues: Clue[];
}

export interface Story {
  id: string;
  narrator: string;
  title: string;
  subtitle: string;
  coverColor: string;
  spaces: MemorySpace[];
  routeClueIds: string[]; // correct order for assembly puzzle (3 clue IDs)
  routeSlotLabels: string[]; // labels for the 3 assembly slots
  cannotBeMoved: string[];
  cluesNeededToUnlock: number;
}

export type GamePhase =
  | 'start'
  | 'select-story'
  | 'explore'
  | 'assemble'
  | 'ending';
