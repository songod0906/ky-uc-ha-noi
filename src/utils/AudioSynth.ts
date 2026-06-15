import { Howl } from 'howler';

/**
 * Web Audio API synthesizer to generate nostalgic Hanoi soundscapes in the browser.
 * Safe from CORS blockage or server missing MP3 assets!
 * Lazy initialized on first user interaction to obey browser policies.
 */

let audioCtx: AudioContext | null = null;
const activeNodes: { [key: string]: AudioNode[] } = {};
const activeHowls: { [key: string]: Howl } = {};
let ambientLoopTimer: any = null;
let currentAmbientType: string | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Creates noise buffer for wind/cicada effects
 */
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
  /**
   * Play a cute paper snap sound (Origami snap!)
   */
  playSnap() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
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

  /**
   * Play a physical pluck sound (Acoustic guitar style)
   */
  playPluck(freq: number = 220, duration: number = 1.2, volume: number = 0.25) {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // We simulate a string pluck using dual oscillators with exponential dampeners
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
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  },

  /**
   * Play a soothing acoustic arpeggio
   */
  playGuitarArpeggio() {
    const chord = [220, 275, 330, 440, 550]; // Beautiful warm A-major chord notes (Hz)
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPluck(freq, 1.5, 0.2);
      }, idx * 180);
    });
  },

  /**
   * Start custom synthesized ambient effects based on the hotspot visited.
   */
  startAmbient(type: 'keyboard' | 'aerobic' | 'kids-laughter' | 'cicadas' | 'wind' | 'violin' | 'plucks' | 'school-drum') {
    this.stopAmbient();
    currentAmbientType = type;

    // Real recorded audio mapping
    const mp3Mapping: Record<string, string> = {
      keyboard: '/audio/sound-net.mp3',
      aerobic: '/audio/sound-aerobic.mp3',
      violin: '/audio/sound-violin.mp3',
      'school-drum': '/audio/sound-trong-truong.mp3',
    };

    if (mp3Mapping[type]) {
      try {
        const sound = new Howl({
          src: [mp3Mapping[type]],
          html5: true,
          loop: true,
          volume: type === 'school-drum' ? 0.35 : 0.2, // Adjust relative volume
        });
        sound.play();
        activeHowls[type] = sound;
        return;
      } catch (e) {
        console.warn(`Failed to play real ambient sound for ${type}, falling back to synth`, e);
      }
    }

    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const nodes: AudioNode[] = [];
    activeNodes[type] = nodes;

    try {
      if (type === 'keyboard') {
        // Typing sounds simulation
        const playKeyStroke = () => {
          if (currentAmbientType !== 'keyboard') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1600 + Math.random() * 400, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
          
          // Next stroke
          setTimeout(playKeyStroke, 150 + Math.random() * 400);
        };
        playKeyStroke();
      } 
      else if (type === 'cicadas') {
        // Cicadas ambient - modulated high frequency bandpass noise
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx);
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.Q.setValueAtTime(15, now);
        
        // Modulator for the cricket chirping rhythm
        const modulator = ctx.createOscillator();
        modulator.frequency.value = 6; // 6 Hz chirp
        const modGain = ctx.createGain();
        modGain.gain.value = 800; // expand/contract filter bandwidth
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.03, now);
        
        modulator.connect(modGain);
        modGain.connect(filter.frequency);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start(now);
        modulator.start(now);
        
        nodes.push(noise, modulator, gain);
      } 
      else if (type === 'aerobic') {
        // Upbeat cheesy old aerobic rhythm (retro synth kicks and hat tick)
        let step = 0;
        const triggerBeat = () => {
          if (currentAmbientType !== 'aerobic') return;
          
          // Bass drum on 1 and 3
          if (step % 2 === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          }
          
          // Cheesy synth chime on 2 and 4
          if (step % 4 === 1 || step % 4 === 3) {
            const chime = ctx.createOscillator();
            const chimeGain = ctx.createGain();
            chime.type = 'triangle';
            chime.frequency.setValueAtTime(step % 4 === 1 ? 523.25 : 659.25, ctx.currentTime); // C5 or E5
            chimeGain.gain.setValueAtTime(0.06, ctx.currentTime);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            
            chime.connect(chimeGain);
            chimeGain.connect(ctx.destination);
            chime.start();
            chime.stop(ctx.currentTime + 0.35);
          }
          
          step++;
          setTimeout(triggerBeat, 350); // 170 BPM approx
        };
        triggerBeat();
      }
      else if (type === 'kids-laughter') {
        // Melodic child-like laughter or laughing xylophone bells to represent playfulness
        const playGiggle = () => {
          if (currentAmbientType !== 'kids-laughter') return;
          const notes = [440, 494, 523, 587, 659]; // Pentatonic happy
          const rNote = notes[Math.floor(Math.random() * notes.length)];
          
          // Bubble sound
          const nowTime = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(rNote, nowTime);
          osc.frequency.setValueAtTime(rNote * 1.5, nowTime + 0.05);
          
          gain.gain.setValueAtTime(0.07, nowTime);
          gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 0.2);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(nowTime + 0.25);
          
          setTimeout(playGiggle, 400 + Math.random() * 1000);
        };
        playGiggle();
      }
      else if (type === 'wind') {
        // Soothing warm Hanoi wind sweeping past
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx);
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        
        // Sweet low frequency sweeper for the gust of wind
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.1, now); // very slow 10 seconds swing
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 180;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start(now);
        lfo.start(now);
        
        nodes.push(noise, lfo, gain);
      }
      else if (type === 'violin') {
        // High pitched lovely vintage warm violin (slow vibrato)
        const playViolinNotes = () => {
          if (currentAmbientType !== 'violin') return;
          const notes = [293.66, 329.63, 349.23, 392.00, 440.00]; // Re MI Fa Sol La
          const note = notes[Math.floor(Math.random() * notes.length)];
          const nowTime = ctx.currentTime;
          
          const osc = ctx.createOscillator();
          const vibrato = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          const gain = ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.value = note;
          
          vibrato.frequency.value = 5.5; // Vibrato velocity
          vibratoGain.gain.value = 3;  // Vibrato depth
          
          gain.gain.setValueAtTime(0.01, nowTime);
          gain.gain.linearRampToValueAtTime(0.06, nowTime + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 2.5);
          
          vibrato.connect(vibratoGain);
          vibratoGain.connect(osc.frequency);
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          vibrato.start();
          osc.start();
          
          vibrato.stop(nowTime + 2.8);
          osc.stop(nowTime + 2.8);
          
          setTimeout(playViolinNotes, 2800);
        };
        playViolinNotes();
      }
      else if (type === 'plucks') {
        // Slow guitar strums
        const playPlucks = () => {
          if (currentAmbientType !== 'plucks') return;
          this.playGuitarArpeggio();
          setTimeout(playPlucks, 4500);
        };
        playPlucks();
      }
    } catch (e) {
      console.warn('Ambient play failed', e);
    }
  },

  /**
   * Stop all active synthesized and real ambient soundscapes
   */
  stopAmbient() {
    currentAmbientType = null;
    if (ambientLoopTimer) {
      clearTimeout(ambientLoopTimer);
      ambientLoopTimer = null;
    }
    
    // Stop and unload Howls
    Object.keys(activeHowls).forEach((key) => {
      try {
        activeHowls[key].stop();
        activeHowls[key].unload();
      } catch (e) {
        console.warn('Failed to stop Howl', e);
      }
      delete activeHowls[key];
    });

    // Stop and disconnect nodes
    Object.keys(activeNodes).forEach((key) => {
      activeNodes[key].forEach((node) => {
        try {
          (node as any).stop?.();
          node.disconnect();
        } catch (e) {
          // ignore already stopped nodes
        }
      });
      delete activeNodes[key];
    });
  }
};
