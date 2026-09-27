import { isMuted } from "./save";

let ctx: AudioContext | null = null;

export function unlockAudio() {
  const c = getCtx();
  if (c.state === "suspended") void c.resume();
}

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function silent() {
  try {
    return isMuted();
  } catch {
    return false;
  }
}

export function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.08,
) {
  if (silent()) return;
  try {
    const c = getCtx();
    if (c.state !== "running") return;
    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2200;
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(f);
    f.connect(c.destination);
    const t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.03);
  } catch {
    /* autoplay / closed */
  }
}

export function chordTones(freqs: number[], dur = 0.7) {
  if (silent()) return;
  freqs.forEach((f, i) => {
    setTimeout(() => tone(f, dur, "triangle", 0.05), i * 40);
  });
}

export function noiseBurst(dur = 0.08, gain = 0.04) {
  if (silent()) return;
  try {
    const c = getCtx();
    if (c.state !== "running") return;
    const n = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = n;
    const g = c.createGain();
    src.connect(g);
    g.connect(c.destination);
    const t = c.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.start(t);
  } catch {
    /* ignore */
  }
}
