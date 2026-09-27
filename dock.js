/**
 * dock.js — macOS Magnification Dock Component
 * Fluid magnification effects, spring physics, and tooltips
 * Adapted from Framer Motion MagnificationDock implementation
 */

class MagnificationDock {
  constructor(options = {}) {
    this.container = document.getElementById('magnificationDock');
    if (!this.container) return;

    this.panel = this.container.querySelector('.dock-panel');
    this.items = Array.from(this.container.querySelectorAll('.dock-item'));
    if (!this.items.length) return;

    // Configuration
    this.distance = options.distance || 180;
    this.panelHeight = options.panelHeight || 68;
    this.baseItemSize = options.baseItemSize || 50;
    this.magnification = options.magnification || 78;

    // Spring Physics parameters: { mass: 0.1, stiffness: 150, damping: 12 }
    this.stiffness = 150;
    this.damping = 12;
    this.mass = 0.1;

    // State per item: { currentSize, targetSize, velocity, el, labelEl }
    this.itemStates = this.items.map(el => ({
      el,
      labelEl: el.querySelector('.dock-label'),
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
    this.panel.addEventListener('pointerenter', () => {
      this.isHoveringDock = true;
      this.startLoop();
    });

    this.panel.addEventListener('pointermove', (e) => {
      this.mouseX = e.clientX;
      this.calculateTargets();
    });

    this.panel.addEventListener('pointerleave', () => {
      this.isHoveringDock = false;
      this.mouseX = Infinity;
      this.itemStates.forEach(item => {
        item.targetSize = this.baseItemSize;
      });
    });

    // Touch support / click handlers
    this.items.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        const action = item.dataset.action;
        if (action) {
          this.handleAction(action);
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
        // Cosine smooth curve from baseItemSize to magnification
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
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'capabilities':
        document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'playground':
        document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'about':
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'contact':
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'github':
        window.open('https://github.com/Bloxi17', '_blank');
        break;
      case 'search':
        if (window.openCommandPalette) window.openCommandPalette();
        break;
      case 'email':
        if (window.copyEmailToClipboard) window.copyEmailToClipboard();
        break;
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
        const icon = item.el.querySelector('.dock-icon');
        if (icon) {
          icon.style.transform = `scale(${Math.min(1.4, Math.max(1, scale * 0.95)).toFixed(2)})`;
        }

        if (Math.abs(item.velocity) > 0.05 || Math.abs(displacement) > 0.1) {
          stillMoving = true;
        }
      });

      if (stillMoving || this.isHoveringDock) {
        requestAnimationFrame(loop);
      } else {
        this.animating = false;
        // Settle cleanly to base
        this.itemStates.forEach(item => {
          item.currentSize = this.baseItemSize;
          item.el.style.width = `${this.baseItemSize}px`;
          item.el.style.height = `${this.baseItemSize}px`;
          const icon = item.el.querySelector('.dock-icon');
          if (icon) icon.style.transform = 'scale(1)';
        });
      }
    };

    requestAnimationFrame(loop);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.magnificationDock = new MagnificationDock({
    distance: 180,
    panelHeight: 68,
    baseItemSize: 50,
    magnification: 78
  });
});
