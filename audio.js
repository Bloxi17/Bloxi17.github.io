/**
 * audio.js — Zero-Dependency Web Audio Synthesizer & Equalizer
 * Inspired by huyml.co and high-end creative engineering portfolios
 * Features:
 * - Pure browser Web Audio API synthesis (0 KB external audio files)
 * - Soft organic UI ticks on hover and crisp micro-chirps on clicks
 * - Dynamic 4-bar equalizer animation controller
 * - Respects user preferences and autoplay policies
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = false;
    this.equalizerBars = [];
    this.equalizerInterval = null;

    this.init();
  }

  init() {
    // Cache equalizer bar DOM elements if present
    this.equalizerBars = Array.from(document.querySelectorAll('.eq-bar'));
    
    // Bind global sound toggle buttons
    const toggles = document.querySelectorAll('.trigger-sound-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    });

    // Attach subtle audio feedback to interactive elements
    this.bindElementSounds();
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggle(forceState) {
    this.ensureContext();
    this.isEnabled = typeof forceState === 'boolean' ? forceState : !this.isEnabled;

    // Update UI states
    const toggles = document.querySelectorAll('.trigger-sound-toggle');
    toggles.forEach(btn => {
      btn.classList.toggle('sound-on', this.isEnabled);
      const textEl = btn.querySelector('.sound-status-label');
      if (textEl) {
        textEl.textContent = this.isEnabled ? 'AUDIO ON' : 'AUDIO OFF';
      }
    });

    if (this.isEnabled) {
      this.startEqualizer();
      this.playChirp(880, 1320, 0.08, 'sine', 0.05); // Welcome tone
      if (window.showToast) window.showToast('Audio Synthesizer: ON');
    } else {
      this.stopEqualizer();
      if (window.showToast) window.showToast('Audio Synthesizer: MUTED');
    }

    return this.isEnabled;
  }

  startEqualizer() {
    if (this.equalizerInterval) clearInterval(this.equalizerInterval);
    const bars = document.querySelectorAll('.eq-bar');
    if (!bars.length) return;

    this.equalizerInterval = setInterval(() => {
      if (!this.isEnabled) return;
      bars.forEach((bar, idx) => {
        // Organic heights between 4px and 16px
        const height = Math.floor(Math.random() * 12) + 4;
        bar.style.height = `${height}px`;
      });
    }, 110);
  }

  stopEqualizer() {
    if (this.equalizerInterval) {
      clearInterval(this.equalizerInterval);
      this.equalizerInterval = null;
    }
    const bars = document.querySelectorAll('.eq-bar');
    bars.forEach((bar) => {
      bar.style.height = '3px';
    });
  }

  // Soft hover tick
  playHoverTick() {
    if (!this.isEnabled) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.04);
  }

  // Tactile click snap
  playClickSnap() {
    if (!this.isEnabled) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  // Mode switch chime
  playModeChime(isBrief) {
    if (!this.isEnabled) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const f1 = isBrief ? 660 : 440;
    const f2 = isBrief ? 990 : 880;

    [f1, f2].forEach((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.025, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.13);
    });
  }

  playChirp(startFreq, endFreq, duration = 0.08, type = 'sine', volume = 0.04) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  bindElementSounds() {
    // Attach hover and click sounds to buttons and links
    document.addEventListener('pointerenter', (e) => {
      const target = e.target.closest('button, a, .interactive-zone, input[type="range"], .deck-nav-pill');
      if (target && this.isEnabled) {
        this.playHoverTick();
      }
    }, true);

    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a, .clickable, .deck-nav-pill, .dossier-tab-btn');
      if (target && this.isEnabled) {
        this.playClickSnap();
      }
    }, true);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.soundEngine = new SoundEngine();
});
