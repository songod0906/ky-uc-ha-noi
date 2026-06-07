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
  x: number; // % from left in the scene panel
  y: number; // % from top
}

export interface MemorySpace {
  id: string;
  label: string;
  sublabel: string;
  bgGradient: string;     // CSS gradient fallback
  bgTone: string;         // single CSS color for tinting
  bgImage?: string;       // static photo path (public/images/...) — used when no Street View
  bgStreetView?: string;  // Google Maps Street View embed URL — takes priority over bgImage
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
