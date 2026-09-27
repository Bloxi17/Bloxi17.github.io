/**
 * cursor.js — Two-Tier Fluid Magnetic Cursor Engine
 * Implements Apple fluid physics (critically damped spring follower + magnetic attraction)
 */

class MagneticCursor {
  constructor() {
    // Only run if device supports fine precision pointer (mouse / trackpad)
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    this.dot = document.getElementById('cursorDot');
    this.ring = document.getElementById('cursorRing');
    this.ringText = this.ring ? this.ring.querySelector('.cursor-text') : null;

    if (!this.dot || !this.ring) return;

    // Mouse coordinates (target)
    this.targetX = window.innerWidth / 2;
    this.targetY = window.innerHeight / 2;

    // Ring coordinates (smoothed with spring physics)
    this.ringX = this.targetX;
    this.ringY = this.targetY;
    this.ringVx = 0;
    this.ringVy = 0;

    // State flags
    this.isVisible = false;
    this.isHovering = false;
    this.activeMagnetEl = null;

    // Spring constants (Apple critically damped feel)
    this.stiffness = 180;
    this.damping = 20;

    this.bindEvents();
    this.startLoop();
  }

  bindEvents() {
    window.addEventListener('pointermove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;

      if (!this.isVisible) {
        this.isVisible = true;
        this.dot.classList.remove('is-hidden');
        this.ring.classList.remove('is-hidden');
      }

      // 1:1 instantaneous hardware dot tracking
      this.dot.style.transform = `translate3d(${this.targetX}px, ${this.targetY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      this.isVisible = false;
      this.dot.classList.add('is-hidden');
      this.ring.classList.add('is-hidden');
    });

    document.addEventListener('pointerenter', () => {
      this.isVisible = true;
      this.dot.classList.remove('is-hidden');
      this.ring.classList.remove('is-hidden');
    });

    // Magnetic interaction delegation
    document.addEventListener('pointerover', (e) => {
      const target = e.target.closest('a, button, [data-interactive="true"], .interactive-zone');
      const cursorMode = e.target.closest('[data-cursor]');

      if (cursorMode) {
        const mode = cursorMode.dataset.cursor;
        this.setMode(mode, cursorMode.dataset.cursorText);
      } else if (target) {
        this.setHovering(true);
        if (target.classList.contains('btn-magnetic') || target.classList.contains('btn')) {
          this.activeMagnetEl = target;
        }
      }
    });

    document.addEventListener('pointerout', (e) => {
      const target = e.target.closest('a, button, [data-interactive="true"], .interactive-zone');
      const cursorMode = e.target.closest('[data-cursor]');

      if (cursorMode) {
        this.resetMode();
      }
      if (target) {
        this.setHovering(false);
        if (this.activeMagnetEl === target) {
          this.activeMagnetEl.style.transform = '';
          this.activeMagnetEl = null;
        }
      }
    });

    // Pointer down scale feedback
    window.addEventListener('pointerdown', () => {
      this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0) translate(-50%, -50%) scale(0.85)`;
    });

    window.addEventListener('pointerup', () => {
      this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0) translate(-50%, -50%) scale(1)`;
    });
  }

  setHovering(state) {
    this.isHovering = state;
    if (state) {
      this.ring.classList.add('is-hovering');
    } else {
      this.ring.classList.remove('is-hovering');
    }
  }

  setMode(mode, text = '') {
    this.ring.classList.remove('is-hovering', 'is-drag', 'is-view');
    if (mode === 'drag') {
      this.ring.classList.add('is-drag');
      if (this.ringText) this.ringText.textContent = text || 'ORBIT';
    } else if (mode === 'view') {
      this.ring.classList.add('is-view');
      if (this.ringText) this.ringText.textContent = text || 'EXPLORE';
    }
  }

  resetMode() {
    this.ring.classList.remove('is-drag', 'is-view');
    if (this.ringText) this.ringText.textContent = '';
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Handle magnetic pull if near a magnetic element
      let destX = this.targetX;
      let destY = this.targetY;

      if (this.activeMagnetEl) {
        const rect = this.activeMagnetEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dist = Math.hypot(this.targetX - centerX, this.targetY - centerY);
        if (dist < 100) {
          // Magnetically pull button towards cursor slightly
          const pullFactor = 0.22;
          const pullX = (this.targetX - centerX) * pullFactor;
          const pullY = (this.targetY - centerY) * pullFactor;
          this.activeMagnetEl.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;

          // Pull ring towards center of button
          destX = centerX + (this.targetX - centerX) * 0.35;
          destY = centerY + (this.targetY - centerY) * 0.35;
        }
      }

      // Spring physics calculation (F = -k*x - c*v)
      const forceX = -this.stiffness * (this.ringX - destX) - this.damping * this.ringVx;
      const forceY = -this.stiffness * (this.ringY - destY) - this.damping * this.ringVy;

      this.ringVx += forceX * dt;
      this.ringVy += forceY * dt;

      this.ringX += this.ringVx * dt;
      this.ringY += this.ringVy * dt;

      // Render transform
      this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cursorInstance = new MagneticCursor();
});
