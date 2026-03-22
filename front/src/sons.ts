let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume se estiver suspenso (política do navegador)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playBeep(frequency: number, duration: number, volume: number = 0.3) {
  const context = getCtx();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'square';

  gainNode.gain.setValueAtTime(volume, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
}

export function somRebatida() {
  playBeep(440, 0.05, 0.4);
}

export function somPonto() {
  playBeep(220, 0.3, 0.5);
  setTimeout(() => playBeep(180, 0.3, 0.4), 150);
}

export function somContagem() {
  playBeep(660, 0.1, 0.3);
}

export function somInicio() {
  playBeep(440, 0.1, 0.3);
  setTimeout(() => playBeep(550, 0.1, 0.3), 120);
  setTimeout(() => playBeep(660, 0.2, 0.4), 240);
}

export function iniciarAudio() {
  getCtx(); // cria e resume o contexto na primeira interação
}


