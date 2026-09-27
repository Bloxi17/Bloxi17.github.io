/**
 * dock.js — macOS Magnification Dock Component
 * Fluid magnification effects, spring physics, and tooltips
 * Adapted from Framer Motion MagnificationDock implementation
 */

class MagnificationDock {
  constructor(options = {}) {
    this.container = document.getElementById('magnificationDock');
    if (!this.container) return;

    this.hitArea = this.container.querySelector('.dock-hit-area') || this.container;
    this.panel = this.container.querySelector('.dock-panel');
    this.items = Array.from(this.container.querySelectorAll('.dock-item'));
    if (!this.items.length) return;

    // Detect touch / coarse pointer
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;

    // Configuration
    this.distance = options.distance || 190;
    this.panelHeight = options.panelHeight || 68;
    this.baseItemSize = options.baseItemSize || 50;
    this.magnification = options.magnification || 78;

    // Spring Physics parameters: { mass: 0.1, stiffness: 150, damping: 12 }
    this.stiffness = 150;
    this.damping = 12;
    this.mass = 0.1;

    // State per item
    this.itemStates = this.items.map(el => ({
      el,
      labelEl: el.querySelector('.dock-label'),
      iconEl: el.querySelector('.dock-icon'),
      currentSize: this.baseItemSize,
      targetSize: this.baseItemSize,
      velocity: 0
    }));

    this.mouseX = Infinity;
    this.isHoveringDock = false;
    this.animating = false;

    this.bindEvents();
  }

  bindEvents() {
    // On touch devices, skip hover magnification to ensure 100% reliable instant taps
    if (!this.isTouch) {
      // Use hitArea (with top padding) to prevent jitter when cursor reaches top of magnified icon
      this.hitArea.addEventListener('pointerenter', () => {
        this.isHoveringDock = true;
        this.startLoop();
      });

      this.hitArea.addEventListener('pointermove', (e) => {
        this.mouseX = e.clientX;
        this.calculateTargets();
        if (!this.animating) {
          this.startLoop();
        }
      });

      this.hitArea.addEventListener('pointerleave', () => {
        this.isHoveringDock = false;
        this.mouseX = Infinity;
        this.itemStates.forEach(item => {
          item.targetSize = this.baseItemSize;
        });
      });
    }

    // Direct, bulletproof click / tap handling on each item
    this.items.forEach((item) => {
      // Handle click
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = item.dataset.action;
        if (action) {
          this.handleAction(action);
        }
      });

      // Pointerdown feedback
      item.addEventListener('pointerdown', () => {
        item.style.transform = 'scale(0.92)';
      });

      const release = () => {
        item.style.transform = '';
      };
      item.addEventListener('pointerup', release);
      item.addEventListener('pointercancel', release);
      item.addEventListener('mouseleave', release);

      // Keyboard Accessibility (Enter / Space)
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const action = item.dataset.action;
          if (action) {
            this.handleAction(action);
          }
        }
      });
    });
  }

  calculateTargets() {
    if (this.mouseX === Infinity) {
      this.itemStates.forEach(item => {
        item.targetSize = this.baseItemSize;
      });
      return;
    }

    this.itemStates.forEach(item => {
      const rect = item.el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const dist = Math.abs(this.mouseX - centerX);

      if (dist < this.distance) {
        // Cosine smooth bell-curve magnification from baseItemSize to magnification
        const factor = Math.cos((dist / this.distance) * (Math.PI / 2));
        item.targetSize = this.baseItemSize + (this.magnification - this.baseItemSize) * factor;
      } else {
        item.targetSize = this.baseItemSize;
      }
    });
  }

  handleAction(action) {
    switch (action) {
      case 'home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'projects':
        this.scrollTo('projects');
        break;
      case 'laboratory':
        this.scrollTo('laboratory');
        break;
      case 'capabilities':
        this.scrollTo('capabilities');
        break;
      case 'playground':
        this.scrollTo('playground');
        break;
      case 'about':
        this.scrollTo('about');
        break;
      case 'contact':
        if (window.toggleLetsTalkPopover) {
          window.toggleLetsTalkPopover(true);
        } else {
          this.scrollTo('contact');
        }
        break;
      case 'github':
        window.open('https://github.com/Bloxi17', '_blank');
        break;
      case 'search':
        if (window.openCommandPalette) {
          window.openCommandPalette();
        } else {
          const btn = document.querySelector('.trigger-cmd-palette');
          if (btn) btn.click();
        }
        break;
      case 'email':
        if (window.copyEmailToClipboard) {
          window.copyEmailToClipboard();
        } else {
          navigator.clipboard?.writeText('hamiltonjoel848@gmail.com');
          alert('Email copied: hamiltonjoel848@gmail.com');
        }
        break;
    }
  }

  scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  startLoop() {
    if (this.animating) return;
    this.animating = true;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;

      let stillMoving = false;

      this.itemStates.forEach(item => {
        // Spring physics: F = -k*(x - target) - c*v
        const displacement = item.currentSize - item.targetSize;
        const springForce = -this.stiffness * displacement;
        const dampingForce = -this.damping * item.velocity;
        const acceleration = (springForce + dampingForce) / this.mass;

        item.velocity += acceleration * dt;
        item.currentSize += item.velocity * dt;

        // Apply width and height
        item.el.style.width = `${item.currentSize.toFixed(1)}px`;
        item.el.style.height = `${item.currentSize.toFixed(1)}px`;

        // Scale icon inside
        const scale = item.currentSize / this.baseItemSize;
        if (item.iconEl) {
          item.iconEl.style.transform = `scale(${Math.min(1.4, Math.max(1, scale * 0.95)).toFixed(2)})`;
        }

        if (Math.abs(item.velocity) > 0.05 || Math.abs(displacement) > 0.1) {
          stillMoving = true;
        }
      });

      if (stillMoving || this.isHoveringDock) {
        requestAnimationFrame(loop);
      } else {
        this.animating = false;
        // Settle cleanly to base size
        this.itemStates.forEach(item => {
          item.currentSize = this.baseItemSize;
          item.el.style.width = `${this.baseItemSize}px`;
          item.el.style.height = `${this.baseItemSize}px`;
          if (item.iconEl) item.iconEl.style.transform = 'scale(1)';
        });
      }
    };

    requestAnimationFrame(loop);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.magnificationDock = new MagnificationDock({
    distance: 190,
    panelHeight: 68,
    baseItemSize: 50,
    magnification: 78
  });
});
