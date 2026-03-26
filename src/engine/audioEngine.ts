// ─── Procedural Audio Engine (Web Audio API) ──────────────────────
// No sample files needed — pure synthesis for cyberpunk game feel.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Saturated bass hit — piece placement
export function sfxPlace() {
  const ac = getCtx();
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  // Soft clip distortion
  const shaper = ac.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = Math.tanh(x * 2);
  }
  shaper.curve = curve;

  osc.connect(shaper);
  shaper.connect(gain);
  gain.connect(ac.destination);

  osc.start(t);
  osc.stop(t + 0.15);
}

// Glitch static burst — lag drift
export function sfxGlitch() {
  const ac = getCtx();
  const t = ac.currentTime;
  const bufferSize = ac.sampleRate * 0.12;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // Bitcrushed noise
    const noise = Math.random() * 2 - 1;
    data[i] = Math.round(noise * 4) / 4;
  }

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 5;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);

  source.start(t);
}

// Explosion — mine triggered
export function sfxExplosion() {
  const ac = getCtx();
  const t = ac.currentTime;

  // Low rumble
  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);

  // Noise burst
  const bufferSize = ac.sampleRate * 0.3;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }
  const noise = ac.createBufferSource();
  noise.buffer = buffer;

  // Distortion
  const shaper = ac.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.3);
  }
  shaper.curve = curve;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

  osc.connect(shaper);
  noise.connect(shaper);
  shaper.connect(gain);
  gain.connect(ac.destination);

  osc.start(t);
  osc.stop(t + 0.4);
  noise.start(t);
}

// Victory chord
export function sfxWin() {
  const ac = getCtx();
  const t = ac.currentTime;

  [261.6, 329.6, 392].forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gain = ac.createGain();
    const delay = i * 0.05;
    gain.gain.setValueAtTime(0, t + delay);
    gain.gain.linearRampToValueAtTime(0.12, t + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.5);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t + delay);
    osc.stop(t + delay + 0.5);
  });
}

// Loss buzz
export function sfxLose() {
  const ac = getCtx();
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.3);
}

// Infect squelch
export function sfxInfect() {
  const ac = getCtx();
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, t);
  filter.frequency.exponentialRampToValueAtTime(300, t + 0.08);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

// Rotate whoosh
export function sfxRotate() {
  const ac = getCtx();
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.3);
}
