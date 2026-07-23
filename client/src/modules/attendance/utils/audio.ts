// Web Audio API Synthesizer for instant zero-latency feedback
export function playBeep(type: "success" | "error" | "duplicate") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "success") {
      // High-pitched pleasant double chime (880Hz -> 1320Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // Low-pitched warning buzz (220Hz -> 150Hz sawtooth wave)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.error("Audio synth error:", e);
  }
}

// Extract Hostel UID from QR Code text or raw UID
export function extractHostelUid(scannedText: string): string | null {
  if (!scannedText) return null;
  const trimmed = scannedText.trim();

  // If encoded Digital ID QR Pass (starts with JNTUGV-PASS::)
  if (trimmed.startsWith("JNTUGV-PASS::")) {
    try {
      const base64Data = trimmed.replace("JNTUGV-PASS::", "");
      const decodedJson = atob(base64Data);
      const parsed = JSON.parse(decodedJson);
      if (parsed && parsed.hUid) return String(parsed.hUid);
    } catch (e) {
      console.error("Failed to parse QR payload:", e);
    }
  }

  // If raw 6-digit Hostel UID
  if (/^\d{6}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}
