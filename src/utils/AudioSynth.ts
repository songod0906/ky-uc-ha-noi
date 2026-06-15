import { AmbientType } from '../types';

const AMBIENT_MAP: Partial<Record<AmbientType, string>> = {
  'school-drum': '/audio/sound-trong-truong.mp3',
  keyboard: '/audio/sound-net.mp3',
  aerobic: '/audio/sound-aerobic.mp3',
  violin: '/audio/sound-violin.mp3',
};

// --- HTML Audio Player (for MP3s) ---
let ambientEl: HTMLAudioElement | null = null;
let htmlFadeTimer: number | null = null;

const clearHtmlFade = () => {
  if (htmlFadeTimer) {
    window.clearInterval(htmlFadeTimer);
    htmlFadeTimer = null;
  }
};

// --- Web Audio API Synthesizer (for nostalgic soundscapes) ---
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
const activeSynthNodes: { [key: string]: AudioNode[] } = {};
let currentSynthType: string | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

function getMasterGain(ctx: AudioContext) {
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

function createNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export const AudioSynth = {
  /** Play Origami paper snap */
  playSnap() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(getMasterGain(ctx));
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  },

  /** Play guitar pluck */
  playPluck(freq = 220, duration = 1.2, volume = 0.25) {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.01, now); // slight detune
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + duration * 0.7);
      
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(getMasterGain(ctx));
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  },

  /** Play guitar arpeggio */
  playGuitarArpeggio() {
    const chord = [220, 275, 330, 440, 550]; // A-major
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPluck(freq, 1.5, 0.2);
      }, idx * 180);
    });
  },

  startAmbient(type: AmbientType) {
    // 1. Stop whatever is currently playing
    this.stopAmbient();

    const mp3Src = AMBIENT_MAP[type];
    if (mp3Src) {
      // --- MP3 Loops ---
      const el = new Audio(mp3Src);
      ambientEl = el;
      el.loop = true;
      el.volume = 0;

      el.play().catch(() => {
        if (ambientEl === el) ambientEl = null;
      });

      let volume = 0;
      htmlFadeTimer = window.setInterval(() => {
        if (ambientEl !== el) {
          clearHtmlFade();
          return;
        }
        volume = Math.min(volume + 0.025, 0.25);
        el.volume = volume;
        if (volume >= 0.25) clearHtmlFade();
      }, 50);
    } else {
      // Synthesized background loops (wind, cicadas, kids-laughter, plucks) are disabled.
    }
  },

  stopAmbient() {
    // 1. Stop HTML Audio
    clearHtmlFade();
    if (ambientEl) {
      ambientEl.pause();
      try { ambientEl.src = ''; } catch (_) {}
      ambientEl = null;
    }

    // 2. Stop Web Audio API synths
    currentSynthType = null;
    Object.keys(activeSynthNodes).forEach((key) => {
      activeSynthNodes[key].forEach((node) => {
        try {
          (node as any).stop?.();
          node.disconnect();
        } catch (_) {}
      });
      delete activeSynthNodes[key];
    });
  },

  duckAmbient(ducked: boolean) {
    // 1. Duck HTML Audio element
    if (ambientEl) {
      clearHtmlFade();
      const targetVolume = ducked ? 0.03 : 0.25;
      const currentVolume = ambientEl.volume;
      if (currentVolume !== targetVolume) {
        const step = 0.025;
        const el = ambientEl;
        htmlFadeTimer = window.setInterval(() => {
          if (ambientEl !== el) {
            clearHtmlFade();
            return;
          }
          let vol = el.volume;
          if (ducked) {
            vol = Math.max(vol - step, targetVolume);
          } else {
            vol = Math.min(vol + step, targetVolume);
          }
          el.volume = vol;
          if (vol === targetVolume) clearHtmlFade();
        }, 50);
      }
    }

    // 2. Duck master gain for Web Audio API synthesizers
    if (audioCtx && masterGain) {
      const targetVal = ducked ? 0.12 : 1.0;
      masterGain.gain.linearRampToValueAtTime(targetVal, audioCtx.currentTime + 0.3);
    }
  },
};
