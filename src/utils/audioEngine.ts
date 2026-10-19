/**
 * Client-Side Web Audio Synthesizer & Sound FX Engine
 * Plays royalty-free hype beats, phonk loops, and UI sound effects without external MP3 asset dependency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentBeatInterval: number | null = null;
  private isBeatPlaying: boolean = false;
  private masterGainNode: GainNode | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;
  private currentVolume: number = 0.5;
  private currentGenre: string = 'Phonk';

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (!this.streamDestination && this.ctx && typeof this.ctx.createMediaStreamDestination === 'function') {
      try {
        this.streamDestination = this.ctx.createMediaStreamDestination();
      } catch {
        // Fallback
      }
    }
    if (!this.masterGainNode && this.ctx) {
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);
      if (this.streamDestination) {
        try {
          this.masterGainNode.connect(this.streamDestination);
        } catch {
          // Fallback
        }
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getAudioTracks(): MediaStreamTrack[] {
    this.getContext();
    if (this.streamDestination) {
      return this.streamDestination.stream.getAudioTracks();
    }
    return [];
  }

  private getMasterDestination(): AudioNode {
    this.getContext();
    return this.masterGainNode || this.ctx!.destination;
  }

  // Play punchy 808 Phonk kick
  private play808Kick(ctx: AudioContext, time: number, vol = 0.5) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.28);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.getMasterDestination());

    osc.start(time);
    osc.stop(time + 0.36);
  }

  // Play crisp cyber hi-hat
  private playHiHat(ctx: AudioContext, time: number, vol = 0.15) {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getMasterDestination());

    noise.start(time);
  }

  // Play synthwave chime / bass lead
  private playPhonkLead(ctx: AudioContext, time: number, freq: number, vol = 0.2) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + 0.2);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getMasterDestination());

    osc.start(time);
    osc.stop(time + 0.26);
  }

  // Start background rhythmic beat loop (supports Phonk, Synthwave, EDM, Lo-Fi)
  public startSoundtrack(volume = 0.5, genre = 'Phonk') {
    this.currentVolume = volume;
    this.currentGenre = genre;
    if (this.isMuted) return;
    if (this.isBeatPlaying) {
      this.setMasterVolume(volume);
      return;
    }
    try {
      const ctx = this.getContext();
      if (this.masterGainNode) {
        this.masterGainNode.gain.setValueAtTime(volume, ctx.currentTime);
      }
      this.isBeatPlaying = true;
      let step = 0;

      const isSynthwave = /synthwave|cyber|cyberpunk/i.test(genre);
      const isEdm = /edm|hyper|house/i.test(genre);
      const isLofi = /lo-fi|lofi|chill/i.test(genre);

      const bpm = isSynthwave ? 116 : isEdm ? 128 : isLofi ? 84 : 132;
      const stepDuration = (60 / bpm) / 4; // 16th notes

      // Scales
      const phonkScale = [146.83, 164.81, 196.0, 220.0, 261.63, 293.66]; // D minor pentatonic
      const synthScale = [130.81, 146.83, 164.81, 196.0, 220.0, 261.63]; // Retro synth minor
      const edmScale = [174.61, 196.0, 220.0, 261.63, 329.63, 349.23];   // F Major / D min
      const lofiScale = [174.61, 220.0, 261.63, 329.63, 392.0];          // Mellow 7th / 9th chords

      const activeScale = isSynthwave ? synthScale : isEdm ? edmScale : isLofi ? lofiScale : phonkScale;

      this.currentBeatInterval = window.setInterval(() => {
        if (!this.isBeatPlaying) return;
        const now = ctx.currentTime;
        const s = step % 16;

        if (isLofi) {
          // Relaxed Lo-Fi groove
          if (s === 0 || s === 10) {
            this.play808Kick(ctx, now, 0.4);
          }
          if (s % 4 === 2) {
            this.playHiHat(ctx, now, 0.12);
          }
          if (s === 0 || s === 6 || s === 12) {
            const note = activeScale[Math.floor(Math.random() * activeScale.length)];
            this.playPhonkLead(ctx, now, note * 1.5, 0.16);
          }
        } else if (isSynthwave) {
          // Retro driving Synthwave pulse
          if (s % 4 === 0) {
            this.play808Kick(ctx, now, 0.55);
          }
          if (s % 2 === 1) {
            this.playHiHat(ctx, now, 0.2);
          }
          if (s === 0 || s === 4 || s === 7 || s === 11 || s === 14) {
            const note = activeScale[step % activeScale.length];
            this.playPhonkLead(ctx, now, note * 2, 0.2);
          }
        } else if (isEdm) {
          // 4-on-the-floor festival EDM
          if (s % 4 === 0) {
            this.play808Kick(ctx, now, 0.65);
          }
          if (s % 4 === 2 || s === 15) {
            this.playHiHat(ctx, now, 0.3);
          }
          if (s % 2 === 0) {
            const note = activeScale[(step * 2) % activeScale.length];
            this.playPhonkLead(ctx, now, note * 2.5, 0.24);
          }
        } else {
          // Classic High-Adrenaline Phonk Drift
          if (s === 0 || s === 7 || s === 10) {
            this.play808Kick(ctx, now, 0.6);
          }
          if (s % 2 === 0 || s === 15) {
            this.playHiHat(ctx, now, 0.25);
          }
          if (s === 0 || s === 3 || s === 6 || s === 10 || s === 14) {
            const note = activeScale[Math.floor(Math.random() * activeScale.length)];
            this.playPhonkLead(ctx, now, note * 2, 0.22);
          }
        }

        step++;
      }, stepDuration * 1000);
    } catch (e) {
      console.warn('AudioContext not permitted yet:', e);
    }
  }

  public stopSoundtrack() {
    this.isBeatPlaying = false;
    if (this.currentBeatInterval !== null) {
      clearInterval(this.currentBeatInterval);
      this.currentBeatInterval = null;
    }
  }

  public setMasterVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGainNode && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.currentVolume;
      this.masterGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    if (this.masterGainNode && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.currentVolume;
      this.masterGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    if (this.isMuted) {
      this.stopSoundtrack();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play chord success chime for completed exports
  public playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.01, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.getMasterDestination());

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.42);
      });
    } catch {
      // audio fallback
    }
  }

  // Play subtle notification pop
  public playNotification() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.getMasterDestination());

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // fallback
    }
  }

  // Whoosh transition effect
  public playWhoosh() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.getMasterDestination());

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio fallback
    }
  }

  // Hype click effect
  public playClick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.getMasterDestination());

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Fallback
    }
  }

  // Play subtle error/warning buzz
  public playError() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.getMasterDestination());

      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch {
      // Fallback
    }
  }

  // Authentic Android System Notification Chime (crisp two-tone marimba chime)
  public playAndroidNotification() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(this.getMasterDestination());
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2: B5 (987.77 Hz) - slight delay 0.08s
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.08);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.22, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(this.getMasterDestination());
      osc2.start(now + 0.08);
      osc2.stop(now + 0.45);
    } catch {
      // Fallback
    }
  }

  // Pre-Flight Test Alert (subtle urgency pulse)
  public playTestAlert() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [0, 0.12].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now + delay);
        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
        osc.connect(gain);
        gain.connect(this.getMasterDestination());
        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch {
      // Fallback
    }
  }
}

export const soundEngine = new SoundEngine();
