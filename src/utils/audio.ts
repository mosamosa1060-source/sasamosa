// Audio context and synthesizer sound effects for Star Chat

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playBeep(freq: number, duration: number, delay = 0, soundEnabled = true): void {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function playDmSound(soundEnabled = true): void {
  playBeep(880, 0.12, 0, soundEnabled);
  playBeep(1174, 0.16, 0.13, soundEnabled);
}

export function playMicJoinSound(soundEnabled = true): void {
  playBeep(523, 0.12, 0, soundEnabled);
  playBeep(659, 0.12, 0.12, soundEnabled);
  playBeep(784, 0.22, 0.24, soundEnabled);
}

export const BEST_MIC_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    channelCount: { ideal: 1 },
    sampleRate: { ideal: 48000 },
    echoCancellation: { ideal: true },
    noiseSuppression: { ideal: true },
    autoGainControl: { ideal: true }
  }
};

export async function getBestMicStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia(BEST_MIC_CONSTRAINTS);
  } catch {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

export function getRecorderOptions(): MediaRecorderOptions {
  if (typeof window === 'undefined' || !window.MediaRecorder) return {};
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4'
  ];
  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mimeType)) {
      return { mimeType, audioBitsPerSecond: 32000 };
    }
  }
  return {};
}
