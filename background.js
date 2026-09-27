/**
 * background.js — Atmospheric Background & Cursor Spotlight Engine
 * Inspired by Watermelon UI (ui.watermelon.sh) & high-end creative tech sites
 * Features:
 * - Dynamic cursor spotlight beam illuminating the technical grid
 * - Generative floating ambient aurora luminescence
 * - Interactive 60 FPS kinetic wave/particle simulation on HTML5 Canvas
 * - Card 3D tilt & dynamic specular glare tracking
 */

class AtmosphericBackground {
  constructor() {
    this.canvas = document.getElementById('ambientCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      vx: 0,
      vy: 0,
      isHovering: false
    };

    this.particles = [];
    this.particleCount = window.innerWidth < 768 ? 40 : 80;
    this.repulsionForce = 1.8;
    this.repulsionRadius = 200;
    this.connectionDistance = 120;
    this.friction = 0.95;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.bindEvents();
    if (this.canvas && this.ctx) {
      this.resizeCanvas();
      this.createParticles();
      this.startLoop();
    }
    this.initTiltCards();
  }

  bindEvents() {
    // Track pointer with smooth interpolation
    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.isHovering = true;

      // Update CSS variables for spotlight grid illumination
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      this.mouse.isHovering = false;
    });

    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.resizeCanvas();
        this.createParticles();
      }
    }, { passive: true });
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    this.particles = [];
    const count = window.innerWidth < 768 ? 35 : 75;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.4 + 0.1,
        baseAlpha: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  setPhysics(force, friction, radius) {
    this.repulsionForce = (force / 15) * 1.8;
    this.friction = friction;
    this.repulsionRadius = radius;
  }

  startLoop() {
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Interpolate mouse coordinates (smooth lag)
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Connect particles with subtle neural lines if close
      const count = this.particles.length;
      const radius = this.repulsionRadius;
      const forceMul = this.repulsionForce;

      for (let i = 0; i < count; i++) {
        const p1 = this.particles[i];

        // Move particle
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around boundaries
        if (p1.x < 0) p1.x = this.width;
        if (p1.x > this.width) p1.x = 0;
        if (p1.y < 0) p1.y = this.height;
        if (p1.y > this.height) p1.y = 0;

        // Mouse proximity reaction (gentle repulsion)
        if (this.mouse.isHovering) {
          const dx = p1.x - this.mouse.x;
          const dy = p1.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius && dist > 0) {
            const force = (radius - dist) / radius;
            p1.x += (dx / dist) * force * forceMul;
            p1.y += (dy / dist) * force * forceMul;
            p1.alpha = Math.min(0.85, p1.baseAlpha + force * 0.5);
          } else {
            p1.alpha += (p1.baseAlpha - p1.alpha) * 0.05;
          }
        }

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(56, 189, 248, ${p1.alpha})`; // Cyan accent
        this.ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < count; j++) {
          const p2 = this.particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < this.connectionDistance) {
            const lineAlpha = (1 - dist / this.connectionDistance) * 0.12;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`;
            this.ctx.lineWidth = 0.6;
            this.ctx.stroke();
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  // 3D Card Tilt with specular light reflection
  initTiltCards() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cards = document.querySelectorAll('[data-tilt="true"]');
    cards.forEach(card => {
      let isOver = false;

      card.addEventListener('pointerenter', () => {
        isOver = true;
      });

      card.addEventListener('pointermove', (e) => {
        if (!isOver) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        card.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
      });

      card.addEventListener('pointerleave', () => {
        isOver = false;
        card.style.transform = '';
      });
    });
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.atmosphericBackground = new AtmosphericBackground();
});
