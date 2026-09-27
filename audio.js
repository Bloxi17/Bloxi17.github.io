/**
 * audio.js — Huyml.co Exact Audio Suite & Synthesizer
 * Integrates Huyml's actual production audio assets + procedural Web Audio fallback.
 * Volume calibrated per Framer spec:
 * - tickSound: volume 22% (hover ticks on project rows, links, buttons)
 * - openSound: volume 50% (drawer opening, modal reveal, coin flip)
 * - scrollSound: volume 23% (project threshold scrolling)
 */

class HuymlSoundEngine {
  constructor() {
    this.isEnabled = false;
    this.audioCtx = null;
    this.audioPool = {};
    
    // Exact Huyml CDN Asset URLs
    this.soundUrls = {
      tick: 'https://framerusercontent.com/assets/hxSMzW8WhffneAE4dlHetxMRI.mp3',
      open: 'https://framerusercontent.com/assets/TPy4R9I2nyWcMGl3iIx3nrZhdo.mp3',
      scroll: 'https://framerusercontent.com/assets/NwRpkuqMO8dekRRBn6RJjQlpM.mp3'
    };

    this.volumes = {
      tick: 0.22,
      open: 0.50,
      scroll: 0.23
    };

    this.init();
  }

  init() {
    // Restore saved audio state from localStorage if previously enabled
    const savedState = localStorage.getItem('huyml_audio_on');
    if (savedState === 'true') {
      this.isEnabled = true;
    }

    this.preloadAudios();
    this.bindEvents();
    this.updateUI();
  }

  preloadAudios() {
    for (const [key, url] of Object.entries(this.soundUrls)) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        audio.volume = this.volumes[key];
        this.audioPool[key] = audio;
      } catch (err) {
        console.warn(`Audio preload for ${key} failed, using synthesis fallback.`, err);
      }
    }
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggle(forceState) {
    this.ensureContext();
    this.isEnabled = typeof forceState === 'boolean' ? forceState : !this.isEnabled;
    localStorage.setItem('huyml_audio_on', this.isEnabled ? 'true' : 'false');
    
    this.updateUI();

    if (this.isEnabled) {
      this.playOpen();
      if (window.showToast) window.showToast('Audio Synthesizer: ON');
    } else {
      if (window.showToast) window.showToast('Audio Synthesizer: MUTED');
    }

    return this.isEnabled;
  }

  updateUI() {
    const buttons = document.querySelectorAll('.huyml-audio-toggle');
    buttons.forEach(btn => {
      btn.classList.toggle('active', this.isEnabled);
      const text = btn.querySelector('.huyml-audio-status');
      if (text) {
        text.textContent = this.isEnabled ? 'Audio On' : 'Audio Off';
      }
    });
  }

  playTick() {
    if (!this.isEnabled) return;
    this.ensureContext();

    if (this.audioPool.tick) {
      const sound = this.audioPool.tick.cloneNode();
      sound.volume = this.volumes.tick;
      sound.play().catch(() => this.synthTick());
    } else {
      this.synthTick();
    }
  }

  playOpen() {
    if (!this.isEnabled) return;
    this.ensureContext();

    if (this.audioPool.open) {
      const sound = this.audioPool.open.cloneNode();
      sound.volume = this.volumes.open;
      sound.play().catch(() => this.synthOpen());
    } else {
      this.synthOpen();
    }
  }

  playScroll() {
    if (!this.isEnabled) return;
    this.ensureContext();

    if (this.audioPool.scroll) {
      const sound = this.audioPool.scroll.cloneNode();
      sound.volume = this.volumes.scroll;
      sound.play().catch(() => this.synthScroll());
    } else {
      this.synthScroll();
    }
  }

  // --- Procedural Fallbacks using Web Audio API ---
  synthTick() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.02);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  synthOpen() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  synthScroll() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  bindEvents() {
    // Attach audio toggle listener
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.huyml-audio-toggle');
      if (toggleBtn) {
        e.preventDefault();
        this.toggle();
      }
    });

    // Hover sound for interactive elements
    document.addEventListener('pointerenter', (e) => {
      const target = e.target.closest('.huyml-project-row, .huyml-nav-link, .huyml-showreel-btn, .huyml-explore-btn, .huyml-coin-wrapper, .huyml-contact-link');
      if (target && this.isEnabled) {
        this.playTick();
      }
    }, true);

    // Click sound for interactive buttons & modal triggers
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-drawer-trigger], .huyml-showreel-btn, .huyml-coin-wrapper, .huyml-inquiry-btn');
      if (target && this.isEnabled) {
        this.playOpen();
      }
    }, true);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.soundEngine = new HuymlSoundEngine();
});
