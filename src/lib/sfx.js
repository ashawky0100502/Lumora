// Simple generated placeholder tones (no audio files) — ported 1:1 from the
// original Lumora build so the sound design stays identical.

let audioCtx = null;
let soundOn = true;

function ctx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function tone(freq, duration, type, gainStart, delay) {
  if (!soundOn) return;
  try {
    const ac = ctx();
    const t0 = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(gainStart || 0.06, t0 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch (e) {
    /* audio not available — fail silently, same as the original */
  }
}

export function sfxClick() {
  tone(740, 0.12, 'sine', 0.05);
  tone(1180, 0.09, 'sine', 0.03, 0.02);
}

export function sfxSuccess() {
  [0, 0.09, 0.18, 0.3].forEach((d, i) => tone([523, 659, 784, 1046][i], 0.5, 'sine', 0.05, d));
}

export function sfxError() {
  tone(180, 0.3, 'sawtooth', 0.05);
}

// A warm, jewel-box little chime for incoming activity — three soft notes
// that rise then settle, kept short and gentle so it never feels alarming
// even if a few notifications land close together.
export function sfxNotify() {
  tone(880, 0.22, 'sine', 0.045, 0);
  tone(1318.5, 0.26, 'sine', 0.05, 0.1);
  tone(1760, 0.4, 'triangle', 0.035, 0.2);
}

export function sfxCurtain() {
  tone(90, 1.8, 'sine', 0.04);
  tone(140, 1.6, 'triangle', 0.025, 0.15);
}

let ambient = null;

export function sfxAmbientStart() {
  if (!soundOn) return;
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = 60;
    gain.gain.value = 0.012;
    osc.connect(gain).connect(ac.destination);
    osc.start();
    ambient = { osc, gain };
  } catch (e) {
    /* no-op */
  }
}

export function setSoundOn(value) {
  soundOn = value;
  if (soundOn) {
    sfxAmbientStart();
  } else if (ambient) {
    try {
      ambient.gain.gain.value = 0;
    } catch (e) {
      /* no-op */
    }
  }
}

export function isSoundOn() {
  return soundOn;
}
