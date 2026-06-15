// Separate audio channel for background oral history narration.
// Lives independently from AudioManager so clue audio never cuts the narration.
let _el: HTMLAudioElement | null = null;
let _targetVol = 0.22;
let _ducked = false;

export const OralHistoryAudio = {
  play(src: string, startSec: number, endSec?: number) {
    this.stop();
    const el = new Audio(src);
    el.volume = 0;
    if (startSec > 0) {
      el.addEventListener('loadedmetadata', () => { el.currentTime = startSec; }, { once: true });
    }
    if (endSec != null) {
      el.addEventListener('timeupdate', () => {
        if (el.currentTime >= endSec) { el.pause(); }
      });
    }
    // Fade in over 1.5s
    el.play().then(() => {
      let v = 0;
      const step = () => {
        if (_el !== el) return;
        v = Math.min(v + 0.02, _ducked ? 0.04 : _targetVol);
        el.volume = v;
        if (v < (_ducked ? 0.04 : _targetVol)) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }).catch(() => {});
    _el = el;
  },

  stop() {
    if (_el) {
      _el.pause();
      try { _el.src = ''; } catch (_) {}
      _el = null;
    }
  },

  // Call when a clue modal opens — narration becomes a murmur
  duck() {
    _ducked = true;
    if (_el) _el.volume = 0.04;
  },

  // Call when clue modal closes — restore
  restore() {
    _ducked = false;
    if (_el) _el.volume = _targetVol;
  },

  get current(): HTMLAudioElement | null { return _el; },
};
