export interface Hotspot {
  id: string;
  x: number; // percentage width
  y: number; // percentage height
  label: string;
  quote: string;
  voiceNote: string; // The text narrative acting as Trang or Essy's voice
  ambientSoundTrigger: 'keyboard' | 'aerobic' | 'kids-laughter' | 'cicadas' | 'wind' | 'violin' | 'plucks';
  ghostIllustration?: 'well' | 'slide' | 'monitor' | 'bicycle' | 'bowlsnail' | 'pho';
}

export interface MemoryLocation {
  id: string;
  title: string;
  subTitle: string;
  washiTitle: string;
  description: string;
  mapArtUrl: string; // fallback or base style key
  splatUrl: string; // image representing the nostalgic 3D place
  hotspots: Hotspot[];
  keepsakes: string[]; // Shivers/diaries to add to the keepsake list
}

export type GameState = 'playground' | 'unfolding' | 'memory-box' | 'keepsake';

export interface GameSession {
  currentState: GameState;
  selectedLocationId: string | null;
  collectedKeepsakes: string[];
}
