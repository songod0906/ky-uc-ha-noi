// Module-level singleton — survives React re-renders and component unmounts.
// App.tsx calls stop() before any navigation so audio never bleeds across spaces.
let _audio: HTMLAudioElement | null = null;

export const AudioManager = {
  play(src: string, startSec: number, volume = 0.75, endSec?: number): HTMLAudioElement {
    this.stop();
    const el = new Audio(src);
    el.volume = volume;

    // Seek after metadata loads so the browser doesn't silently ignore currentTime
    if (startSec > 0) {
      el.addEventListener('loadedmetadata', () => { el.currentTime = startSec; }, { once: true });
    }

    // Stop at endSec if provided (prevents bleeding into next segment of the same file)
    if (endSec != null) {
      el.addEventListener('timeupdate', () => {
        if (el.currentTime >= endSec) { el.pause(); el.currentTime = endSec; }
      });
    }

    el.play().catch((err: unknown) => {
      console.error('[AudioManager] play() blocked:', src, err);
    });

    el.addEventListener('error', () => {
      console.error('[AudioManager] load error:', src, el.error?.code, el.error?.message);
    }, { once: true });

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

  pause() {
    if (_audio) {
      _audio.pause();
    }
  },

  resume() {
    if (_audio) {
      _audio.play().catch((err: unknown) => {
        console.error('[AudioManager] resume() blocked:', err);
      });
    }
  },

  get current(): HTMLAudioElement | null { return _audio; },
};
