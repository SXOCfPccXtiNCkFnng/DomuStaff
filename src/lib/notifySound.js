/** Short two-tone chime via Web Audio (no asset file). */
export function playNotifySound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!playNotifySound._ctx) playNotifySound._ctx = new Ctx();
    const ctx = playNotifySound._ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const tone = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.03);
    };

    tone(880, now, 0.11);
    tone(1174.7, now + 0.13, 0.16);
  } catch {
    /* autoplay / unsupported — ignore */
  }
}
