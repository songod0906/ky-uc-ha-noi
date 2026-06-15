import { AmbientType } from '../types';

const AMBIENT_MAP: Partial<Record<AmbientType, string>> = {
  'school-drum': '/audio/sound-trong-truong.mp3',
  keyboard: '/audio/sound-net.mp3',
  aerobic: '/audio/sound-aerobic.mp3',
  violin: '/audio/sound-violin.mp3',
};

let ambientEl: HTMLAudioElement | null = null;
let fadeTimer: number | null = null;

const clearFade = () => {
  if (!fadeTimer) return;
  window.clearInterval(fadeTimer);
  fadeTimer = null;
};

export const AudioSynth = {
  playSnap() {},
  playPluck(_freq?: number, _duration?: number, _volume?: number) {},
  playGuitarArpeggio() {},

  startAmbient(type: AmbientType) {
    const src = AMBIENT_MAP[type];
    if (!src) return;

    clearFade();
    if (ambientEl) {
      ambientEl.pause();
      ambientEl = null;
    }

    const el = new Audio(src);
    ambientEl = el;
    el.loop = true;
    el.volume = 0;

    el.play().catch(() => {
      if (ambientEl === el) ambientEl = null;
    });

    let volume = 0;
    fadeTimer = window.setInterval(() => {
      if (ambientEl !== el) {
        clearFade();
        return;
      }

      volume = Math.min(volume + 0.025, 0.25);
      el.volume = volume;
      if (volume >= 0.25) clearFade();
    }, 50);
  },

  stopAmbient() {
    if (!ambientEl) return;

    clearFade();
    const el = ambientEl;
    ambientEl = null;
    let volume = el.volume;

    fadeTimer = window.setInterval(() => {
      volume = Math.max(volume - 0.025, 0);
      el.volume = volume;
      if (volume <= 0) {
        el.pause();
        clearFade();
      }
    }, 50);
  },
};
