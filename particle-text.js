/**
 * particle-text.js — Monochromatic Physics-Based Particle Text Engine
 * Spec:
 * - 92% dots (filled), 4% rings (stroked 0.5px), 4% crosses (stroked 0.5px)
 * - Space Grotesk typography at 14vw, font-weight 500, letter-spacing -0.05em
 * - 200px interaction radius, friction 0.95, ease 0.05-0.1, continuous drift (+/- 0.5px)
 * - Real-time prompt input regeneration
 * - Monochromatic: #f5f3f0 background and #000000 particles
 */

class ParticleTextEngine {
  constructor(options = {}) {
    this.canvas = document.getElementById('particleCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.displayTextEl = document.getElementById('heroDisplayText');
    this.triggerOverlay = document.getElementById('heroTriggerOverlay');
    this.inputEl = document.getElementById('promptInput');

    this.text = (this.inputEl && this.inputEl.value.trim()) || 'AINESH';
    this.particles = [];
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse coordinates relative to canvas
    this.mouse = {
      x: null,
      y: null,
      isHoveringText: false
    };

    // Configuration
    this.interactionRadius = 200; // 200px radius
    this.friction = 0.95;
    this.dispersionForce = 15;

    this.isFontLoaded = false;
    this.animationFrameId = null;

    this.init();
  }

  async init() {
    // MUST: Ensure font-family 'Space Grotesk' is fully loaded
    try {
      await document.fonts.load('500 48px "Space Grotesk"');
      await document.fonts.ready;
      this.isFontLoaded = true;
    } catch (e) {
      console.warn('Font load timeout or error, proceeding with fallback:', e);
      this.isFontLoaded = true;
    }

    this.resize();
    this.generateParticles(this.text);
    this.bindEvents();
    this.startLoop();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    if (this.isFontLoaded && this.particles.length > 0) {
      this.generateParticles(this.text);
    }
  }

  generateParticles(newText) {
    if (!newText || newText.trim() === '') {
      newText = ' ';
    }
    this.text = newText.toUpperCase();

    // Calculate font size: 14vw with letter-spacing -0.05em
    const targetFontSize = Math.max(48, Math.min(220, window.innerWidth * 0.14));
    
    // Create offscreen canvas to sample text silhouette
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    offCanvas.width = this.width;
    offCanvas.height = this.height;

    offCtx.fillStyle = '#000000';
    offCtx.font = `500 ${targetFontSize}px "Space Grotesk", sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.letterSpacing = '-0.05em';

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    offCtx.fillText(this.text, centerX, centerY);

    // Update static HTML display text for SEO / accessibility
    if (this.displayTextEl) {
      this.displayTextEl.textContent = this.text;
      this.displayTextEl.style.fontSize = `${targetFontSize}px`;
    }

    // Adaptive sampling gap based on string length and screen width
    // Shorter text = denser (2px grid), longer text = adaptive (3-4px grid)
    let sampleGap = 2;
    if (this.text.length > 6 || window.innerWidth < 640) {
      sampleGap = Math.max(2, Math.round((this.text.length / 5) * (window.innerWidth < 640 ? 3 : 2)));
    }
    if (sampleGap > 4) sampleGap = 4;

    const imgData = offCtx.getImageData(0, 0, this.width, this.height);
    const data = imgData.data;

    const newParticles = [];

    // Scan the silhouette on the grid
    for (let y = 0; y < this.height; y += sampleGap) {
      for (let x = 0; x < this.width; x += sampleGap) {
        const index = (y * this.width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 128) {
          // Determine particle primitive type:
          // 92% dots (filled), 4% rings (stroked 0.5px), 4% crosses (stroked 0.5px)
          const randType = Math.random();
          let type = 'dot';
          if (randType >= 0.92 && randType < 0.96) {
            type = 'ring';
          } else if (randType >= 0.96) {
            type = 'cross';
          }

          // Random ease value between 0.05 and 0.1 for fluid, natural snap-back motion
          const ease = 0.05 + Math.random() * 0.05;

          // Continuous slow drift (+/- 0.5px per frame)
          const driftPhaseX = Math.random() * Math.PI * 2;
          const driftPhaseY = Math.random() * Math.PI * 2;
          const driftSpeed = 0.01 + Math.random() * 0.02;

          newParticles.push({
            originX: x,
            originY: y,
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            ease: ease,
            type: type,
            driftPhaseX: driftPhaseX,
            driftPhaseY: driftPhaseY,
            driftSpeed: driftSpeed
          });
        }
      }
    }

    this.particles = newParticles;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Track mouse over canvas / hero container
    const heroSection = document.getElementById('home');
    const targetElement = heroSection || this.canvas;

    const onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      // Check if mouse is within interaction zone of text
      const bounds = this.getTextBounds();
      const pad = 120;
      if (
        this.mouse.x >= bounds.left - pad &&
        this.mouse.x <= bounds.right + pad &&
        this.mouse.y >= bounds.top - pad &&
        this.mouse.y <= bounds.bottom + pad
      ) {
        if (!this.mouse.isHoveringText) {
          this.mouse.isHoveringText = true;
          // MUST: Toggle visibility of the static hero text to 0 opacity instantly upon hover
          if (this.displayTextEl) {
            this.displayTextEl.style.opacity = '0';
          }
        }
      } else {
        if (this.mouse.isHoveringText) {
          this.mouse.isHoveringText = false;
        }
      }
    };

    const onPointerLeave = () => {
      this.mouse.x = null;
      this.mouse.y = null;
      this.mouse.isHoveringText = false;
      if (this.displayTextEl) {
        this.displayTextEl.style.opacity = '1';
      }
    };

    targetElement.addEventListener('pointermove', onPointerMove, { passive: true });
    targetElement.addEventListener('pointerleave', onPointerLeave);

    // If trigger overlay exists
    if (this.triggerOverlay) {
      this.triggerOverlay.addEventListener('pointerenter', () => {
        this.mouse.isHoveringText = true;
        if (this.displayTextEl) this.displayTextEl.style.opacity = '0';
      });
      this.triggerOverlay.addEventListener('pointerleave', () => {
        this.mouse.isHoveringText = false;
        if (this.displayTextEl) this.displayTextEl.style.opacity = '1';
      });
    }

    // Real-time Prompt Input Listener
    if (this.inputEl) {
      let debounceTimeout = null;
      this.inputEl.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase();
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          this.generateParticles(val);
        }, 50);
      });
    }
  }

  getTextBounds() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const approxWidth = (this.text.length * (window.innerWidth * 0.14)) * 0.6;
    const approxHeight = window.innerWidth * 0.14;

    return {
      left: centerX - approxWidth / 2,
      right: centerX + approxWidth / 2,
      top: centerY - approxHeight / 2,
      bottom: centerY + approxHeight / 2
    };
  }

  startLoop() {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      const hasMouse = this.mouse.x !== null && this.mouse.y !== null;
      const count = this.particles.length;

      // Group rendering for peak performance
      let dotPoints = [];
      let ringPoints = [];
      let crossPoints = [];

      for (let i = 0; i < count; i++) {
        const p = this.particles[i];

        // 1. Dispersion physics when mouse is present
        if (hasMouse) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // 200px interaction radius
          if (dist < this.interactionRadius && dist > 0.001) {
            // Force: ((200 - distance) / 200) * 15
            const force = ((this.interactionRadius - dist) / this.interactionRadius) * this.dispersionForce;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // 2. Snap back to original 'text shape' coordinates using random ease (0.05 - 0.1)
        const returnX = (p.originX - p.x) * p.ease;
        const returnY = (p.originY - p.y) * p.ease;
        p.vx += returnX;
        p.vy += returnY;

        // 3. Friction 0.95
        p.vx *= this.friction;
        p.vy *= this.friction;

        // 4. Continuous slow drift (+/- 0.5px per frame)
        p.driftPhaseX += p.driftSpeed;
        p.driftPhaseY += p.driftSpeed;
        const driftX = Math.sin(p.driftPhaseX) * 0.45;
        const driftY = Math.cos(p.driftPhaseY) * 0.45;

        p.x += p.vx + driftX;
        p.y += p.vy + driftY;

        // Sort by type for batch canvas drawing
        if (p.type === 'dot') {
          dotPoints.push(p);
        } else if (p.type === 'ring') {
          ringPoints.push(p);
        } else {
          crossPoints.push(p);
        }
      }

      // Render 92% Dots: filled 1.2px circles in #000000
      if (dotPoints.length > 0) {
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        for (let i = 0; i < dotPoints.length; i++) {
          const p = dotPoints[i];
          this.ctx.moveTo(p.x + 1.2, p.y);
          this.ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        }
        this.ctx.fill();
      }

      // Render 4% Rings: stroked 2px circles, 0.5px line width in #000000
      if (ringPoints.length > 0) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        for (let i = 0; i < ringPoints.length; i++) {
          const p = ringPoints[i];
          this.ctx.moveTo(p.x + 2, p.y);
          this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        }
        this.ctx.stroke();
      }

      // Render 4% Crosses: '+' shape, stroked 0.5px line width in #000000
      if (crossPoints.length > 0) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        for (let i = 0; i < crossPoints.length; i++) {
          const p = crossPoints[i];
          this.ctx.moveTo(p.x - 2.5, p.y);
          this.ctx.lineTo(p.x + 2.5, p.y);
          this.ctx.moveTo(p.x, p.y - 2.5);
          this.ctx.lineTo(p.x, p.y + 2.5);
        }
        this.ctx.stroke();
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.particleTextEngine = new ParticleTextEngine();
});
