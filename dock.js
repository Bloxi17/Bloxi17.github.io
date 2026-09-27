/**
 * dock.js — Cyber-Editorial Command Deck Controller
 * Inspired by huyml.co and harshdayal.dev
 * Features:
 * - Apple-grade sliding pill active indicator with spring interpolation
 * - Dual-mode architecture switcher (Experience Mode vs Brief Mode)
 * - Section navigation with smooth scroll and active state sync
 * - Quick action cluster triggers (Let's Talk, Cmd+K, Copy Email)
 */

class CommandDeck {
  constructor() {
    this.deck = document.getElementById('commandDeck');
    if (!this.deck) return;

    this.navPills = Array.from(this.deck.querySelectorAll('.deck-nav-pill'));
    this.indicator = this.deck.querySelector('.sliding-pill-indicator');
    this.modeButtons = Array.from(this.deck.querySelectorAll('.mode-toggle-btn'));
    
    this.activePill = this.navPills[0] || null;
    this.isBriefMode = false;

    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindModeSwitcher();
    this.bindScrollObserver();
    this.bindActionButtons();
    
    // Position indicator initially after layout settles
    requestAnimationFrame(() => {
      this.updateIndicatorPosition(this.activePill, false);
    });

    window.addEventListener('resize', () => {
      if (this.activePill) {
        this.updateIndicatorPosition(this.activePill, false);
      }
    }, { passive: true });
  }

  updateIndicatorPosition(targetPill, animate = true) {
    if (!this.indicator || !targetPill) return;

    const navContainer = targetPill.parentElement;
    const navRect = navContainer.getBoundingClientRect();
    const pillRect = targetPill.getBoundingClientRect();

    const left = pillRect.left - navRect.left;
    const width = pillRect.width;

    this.indicator.style.transition = animate ? 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    this.indicator.style.transform = `translateX(${left}px)`;
    this.indicator.style.width = `${width}px`;
    this.indicator.style.opacity = '1';
  }

  bindNavigation() {
    this.navPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = pill.dataset.target;
        if (!targetId) return;

        this.setActivePill(pill);
        this.scrollToSection(targetId);
      });

      // Hover preview preview move
      pill.addEventListener('pointerenter', () => {
        this.updateIndicatorPosition(pill, true);
      });
    });

    const navContainer = this.deck.querySelector('.deck-nav-cluster');
    if (navContainer) {
      navContainer.addEventListener('pointerleave', () => {
        if (this.activePill) {
          this.updateIndicatorPosition(this.activePill, true);
        }
      });
    }
  }

  setActivePill(pill) {
    if (!pill) return;
    this.activePill = pill;
    this.navPills.forEach(p => p.classList.toggle('active', p === pill));
    this.updateIndicatorPosition(pill, true);
  }

  scrollToSection(id) {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  bindScrollObserver() {
    const sections = this.navPills.map(p => document.getElementById(p.dataset.target)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const matchingPill = this.navPills.find(p => p.dataset.target === id);
          if (matchingPill && matchingPill !== this.activePill) {
            this.setActivePill(matchingPill);
          }
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach(s => observer.observe(s));
  }

  bindModeSwitcher() {
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.setMode(mode);
      });
    });
  }

  setMode(mode) {
    this.isBriefMode = mode === 'brief';
    document.documentElement.setAttribute('data-mode', mode);

    this.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (window.soundEngine) {
      window.soundEngine.playModeChime(this.isBriefMode);
    }

    if (window.showToast) {
      window.showToast(this.isBriefMode 
        ? '⚡ Brief Mode Active: Optimized for Fast Recruiter Scanning' 
        : '✦ Experience Mode Active: 60 FPS Particle Mesh & Interactive Physics');
    }

    // In brief mode, reduce background particle canvas distraction
    const canvas = document.getElementById('ambientCanvas');
    if (canvas) {
      canvas.style.transition = 'opacity 0.4s ease';
      canvas.style.opacity = this.isBriefMode ? '0.08' : '1';
    }
  }

  bindActionButtons() {
    // Quick Connect / Talk button
    const talkBtn = this.deck.querySelector('.deck-action-talk');
    if (talkBtn) {
      talkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.toggleLetsTalkPopover) {
          window.toggleLetsTalkPopover();
        }
      });
    }

    // Search button (Cmd+K)
    const searchBtn = this.deck.querySelector('.deck-action-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.openCommandPalette) {
          window.openCommandPalette();
        }
      });
    }

    // Email quick copy
    const emailBtn = this.deck.querySelector('.deck-action-email');
    if (emailBtn) {
      emailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.copyEmailToClipboard) {
          window.copyEmailToClipboard();
        }
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.commandDeck = new CommandDeck();
});
