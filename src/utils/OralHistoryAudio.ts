// Separate audio channel for background oral history narration.
// Lives independently from AudioManager so clue audio never cuts the narration.
let _el: HTMLAudioElement | null = null;
const _targetVol = 0.22;

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
        v = Math.min(v + 0.02, _targetVol);
        el.volume = v;
        if (v < _targetVol) requestAnimationFrame(step);
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

  // Call when a clue modal opens — pause narration so clue audio is heard clearly
  duck() {
    if (_el && !_el.paused) _el.pause();
  },

  // Call when clue modal closes — resume narration from where it paused
  restore() {
    if (_el && _el.paused) _el.play().catch(() => {});
  },

  get current(): HTMLAudioElement | null { return _el; },
};
