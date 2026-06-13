// Module-level singleton — survives React re-renders and component unmounts.
// App.tsx calls stop() before any navigation so audio never bleeds across spaces.
let _audio: HTMLAudioElement | null = null;

export const AudioManager = {
  play(src: string, startSec: number, volume = 0.75): HTMLAudioElement {
    this.stop();
    const el = new Audio(src);
    el.currentTime = startSec;
    el.volume = volume;
    el.play().catch(() => {});
    _audio = el;
    return el;
  },

  stop() {
    if (_audio) {
      _audio.pause();
      try { _audio.src = ''; } catch (_) {}
      _audio = null;
    }
  },

  get current(): HTMLAudioElement | null {
    return _audio;
  },
};
