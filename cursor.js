/**
 * cursor.js — Custom 12px Black Circle Cursor with mix-blend-mode: difference
 * Spec:
 * - 12px black circle cursor
 * - mix-blend-mode: difference
 * - Disappears when hovering interactive text elements
 */

class DifferenceCursor {
  constructor() {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    this.cursor = document.getElementById('cursorDot');
    if (!this.cursor) {
      this.cursor = document.createElement('div');
      this.cursor.id = 'cursorDot';
      this.cursor.className = 'custom-difference-cursor';
      document.body.appendChild(this.cursor);
    }

    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.isVisible = false;
    this.isOverInteractiveText = false;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('pointermove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (!this.isVisible) {
        this.isVisible = true;
        this.cursor.style.opacity = '1';
      }

      this.cursor.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      this.isVisible = false;
      this.cursor.style.opacity = '0';
    });

    document.addEventListener('pointerenter', () => {
      this.isVisible = true;
      if (!this.isOverInteractiveText) {
        this.cursor.style.opacity = '1';
      }
    });

    // Check hovering over interactive text elements
    document.addEventListener('pointerover', (e) => {
      const interactiveText = e.target.closest('input, textarea, [contenteditable="true"], .interactive-text, #promptInput');
      if (interactiveText) {
        this.isOverInteractiveText = true;
        this.cursor.classList.add('cursor-hidden');
      } else {
        if (this.isOverInteractiveText) {
          this.isOverInteractiveText = false;
          this.cursor.classList.remove('cursor-hidden');
        }
      }
    });

    document.addEventListener('pointerout', (e) => {
      const interactiveText = e.target.closest('input, textarea, [contenteditable="true"], .interactive-text, #promptInput');
      if (interactiveText) {
        this.isOverInteractiveText = false;
        this.cursor.classList.remove('cursor-hidden');
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.customCursor = new DifferenceCursor();
});
