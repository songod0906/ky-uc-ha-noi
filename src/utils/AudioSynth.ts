// All synthesized sound effects stubbed out — exhibition mode is audio-free.
// The oral history MP3s in CluePreviewModal (via Howler) still work; only the
// synth beeps/snaps/arpeggios are silenced here.

export const AudioSynth = {
  playSnap() {},
  playPluck(_freq?: number, _duration?: number, _volume?: number) {},
  playGuitarArpeggio() {},
  startAmbient(_type: 'keyboard' | 'aerobic' | 'kids-laughter' | 'cicadas' | 'wind' | 'violin' | 'plucks' | 'school-drum') {},
  stopAmbient() {},
};
