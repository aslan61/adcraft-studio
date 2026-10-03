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
  private currentVolume: number = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (!this.masterGainNode && this.ctx) {
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
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

  // Start background rhythmic beat loop (Phonk Drift style: ~130 BPM)
  public startSoundtrack(volume = 0.5) {
    this.currentVolume = volume;
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
      const bpm = 132;
      const stepDuration = (60 / bpm) / 4; // 16th notes

      const pentatonic = [146.83, 164.81, 196.0, 220.0, 261.63, 293.66]; // D minor pentatonic

      this.currentBeatInterval = window.setInterval(() => {
        if (!this.isBeatPlaying) return;
        const now = ctx.currentTime;
        const s = step % 16;

        // Kick on 0, 4, 8, 12 + syncopation
        if (s === 0 || s === 7 || s === 10) {
          this.play808Kick(ctx, now, 0.6);
        }

        // Hi-hats on offbeats
        if (s % 2 === 0 || s === 15) {
          this.playHiHat(ctx, now, 0.25);
        }

        // Phonk cowbell / synth lead melody
        if (s === 0 || s === 3 || s === 6 || s === 10 || s === 14) {
          const noteIndex = Math.floor(Math.random() * pentatonic.length);
          this.playPhonkLead(ctx, now, pentatonic[noteIndex] * 2, 0.22);
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
}

export const soundEngine = new SoundEngine();
