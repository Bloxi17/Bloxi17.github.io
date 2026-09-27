/**
 * app.js — Main Controller for Huyml.co Reverse-Engineered Architecture
 * Ainesh Joel Hamilton®
 * Features:
 * - Live IST Clock
 * - Custom difference cursor with hover states
 * - Cursor-trailing floating media preview card with spring lerp
 * - 3D Gyroscopic Coin Badge (Face 1 & Face 2 flipping)
 * - Lateral sliding drawer system (About, Contact, Playground, Case Studies)
 * - '26 Showreel fullscreen procedural canvas simulation
 * - Tactile clipboard copy with micro-pill toast
 * - 11x11 Harmonic Wave Dot Matrix & Mini CRT Console
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initCursor();
  initProjectHoverPreview();
  init3DCoinBadge();
  initDrawers();
  initProjectModal();
  initShowreel();
  initClipboardToast();
  initPlaygroundFeatures();
});

/* --------------------------------------------------------------------------
   1. Live IST Clock (India Standard Time UTC+5:30)
   -------------------------------------------------------------------------- */
function initClock() {
  const clockEl = document.getElementById('headerLiveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const istString = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    clockEl.textContent = istString;
  }

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   2. Custom Difference Cursor
   -------------------------------------------------------------------------- */
function initCursor() {
  const cursor = document.getElementById('cursorDot');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function render() {
    // Smooth lerp for liquid feel
    cursorX += (mouseX - cursorX) * 0.22;
    cursorY += (mouseY - cursorY) * 0.22;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Hover states
  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('button, a, .huyml-coin-wrapper, .huyml-contact-link');
    const projectRow = e.target.closest('.huyml-project-row');

    if (projectRow) {
      cursor.classList.add('hovering', 'view-cursor');
    } else if (target) {
      cursor.classList.add('hovering');
      cursor.classList.remove('view-cursor');
    } else {
      cursor.classList.remove('hovering', 'view-cursor');
    }
  });
}

/* --------------------------------------------------------------------------
   3. Cursor-Trailing Floating Media Preview Card
   -------------------------------------------------------------------------- */
function initProjectHoverPreview() {
  const preview = document.getElementById('hoverPreviewCard');
  const previewImg = document.getElementById('hoverPreviewImg');
  const previewTitle = document.getElementById('hoverPreviewTitle');
  const previewCategory = document.getElementById('hoverPreviewCategory');
  const rows = document.querySelectorAll('.huyml-project-row');

  if (!preview || !rows.length || window.matchMedia('(pointer: coarse)').matches) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isVisible = false;

  window.addEventListener('pointermove', (e) => {
    // Position preview slightly offset from pointer
    targetX = e.clientX + 30;
    targetY = e.clientY - 105;

    // Prevent clipping right/bottom edge
    if (targetX + 340 > window.innerWidth) {
      targetX = e.clientX - 350;
    }
    if (targetY + 230 > window.innerHeight) {
      targetY = window.innerHeight - 240;
    }
    if (targetY < 80) targetY = 80;
  }, { passive: true });

  function renderPreview() {
    if (isVisible) {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      preview.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
    requestAnimationFrame(renderPreview);
  }
  requestAnimationFrame(renderPreview);

  rows.forEach(row => {
    row.addEventListener('pointerenter', () => {
      const src = row.dataset.preview;
      const title = row.dataset.title;
      const category = row.dataset.category;

      if (previewImg && src) previewImg.src = src;
      if (previewTitle && title) previewTitle.textContent = title;
      if (previewCategory && category) previewCategory.textContent = category;

      isVisible = true;
      preview.classList.add('visible');
    });

    row.addEventListener('pointerleave', () => {
      isVisible = false;
      preview.classList.remove('visible');
    });
  });
}

/* --------------------------------------------------------------------------
   4. 3D Interactive Coin / Flipping Face Badge
   -------------------------------------------------------------------------- */
function init3DCoinBadge() {
  const wrapper = document.getElementById('huymlCoin');
  const card = document.getElementById('huymlCoinCard');
  if (!wrapper || !card) return;

  let isFlipped = false;

  wrapper.addEventListener('pointermove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotX = -(y / (rect.height / 2)) * 18;
    const rotY = (x / (rect.width / 2)) * 18;
    const flipDeg = isFlipped ? 180 : 0;

    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY + flipDeg}deg)`;
  });

  wrapper.addEventListener('pointerleave', () => {
    const flipDeg = isFlipped ? 180 : 0;
    card.style.transform = `rotateX(0deg) rotateY(${flipDeg}deg)`;
  });

  wrapper.addEventListener('click', () => {
    isFlipped = !isFlipped;
    const flipDeg = isFlipped ? 180 : 0;
    card.style.transform = `rotateY(${flipDeg}deg)`;
    if (window.soundEngine) {
      window.soundEngine.playOpen();
    }
    showToast(isFlipped ? 'Coin: 60 FPS Stamp' : 'Coin: Monogram Face');
  });
}

/* --------------------------------------------------------------------------
   5. Lateral Sliding Drawers (About, Contact, Playground)
   -------------------------------------------------------------------------- */
function initDrawers() {
  const backdrop = document.getElementById('drawerBackdrop');
  const triggers = document.querySelectorAll('[data-drawer-trigger]');
  const closeBtns = document.querySelectorAll('[data-drawer-close]');
  const allDrawers = document.querySelectorAll('.huyml-drawer');

  function openDrawer(drawerId) {
    allDrawers.forEach(d => d.classList.remove('active'));
    const target = document.getElementById(`${drawerId}Drawer`);
    if (!target) return;

    target.classList.add('active');
    backdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.soundEngine) window.soundEngine.playOpen();
  }

  function closeAllDrawers() {
    allDrawers.forEach(d => d.classList.remove('active'));
    backdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const id = trigger.dataset.drawerTrigger;
      if (id) openDrawer(id);
    });
  });

  closeBtns.forEach(btn => btn.addEventListener('click', closeAllDrawers));
  backdrop?.addEventListener('click', closeAllDrawers);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDrawers();
  });
}

/* --------------------------------------------------------------------------
   6. Project Case Study Detail Modal
   -------------------------------------------------------------------------- */
const PROJECT_DETAILS = {
  'first-step': {
    title: 'First Step Sr. Sec. School Platform',
    role: 'Lead Full-Stack Systems Architect & Creative UI Engineer',
    year: '2025 – 2026',
    preview: 'https://framerusercontent.com/images/FoYPkj63CnTXaljvLBaCO9gL9dE.jpg',
    stack: ['Node.js', 'Express', 'better-sqlite3', 'HTML5 Canvas', 'JWT Auth', 'Render Cloud'],
    overview: 'Spearheaded full architectural redesign and deployment for a premier 34-year educational institution. Designed a high-integrity SQLite persistence pipeline running with WAL mode for sub-millisecond queries, custom cryptographic admin sessions, and an in-house trigonometric 60 FPS Canvas wave animation with zero layout lag.',
    metrics: [
      { label: 'Query Latency', val: '< 0.8ms' },
      { label: 'Frame Rate', val: '60.0 FPS' },
      { label: 'Uptime', val: '99.98%' }
    ],
    liveUrl: 'https://bloxi17.github.io'
  },
  'watermelon': {
    title: 'Watermelon UI Micro-Lab Primitives',
    role: 'Creative UI Engineer',
    year: '2026',
    preview: 'https://framerusercontent.com/images/75mCZ5SdSy2FaX0ameAhFh9ynE.jpg',
    stack: ['TypeScript', 'WebGL', 'CSS GPU Transforms', 'Spring Dynamics'],
    overview: 'Isolated conceptual UI primitives inspired by modern design engineering: adaptive spring sliders with live numerical telemetry, real-time token/fiat swap cards, and fluid hardware-accelerated accordions.',
    metrics: [
      { label: 'Bundle Size', val: '0 KB External JS' },
      { label: 'Interaction Latency', val: '< 16ms' }
    ],
    liveUrl: 'https://ui.watermelon.sh'
  },
  'harmonic-matrix': {
    title: '11×11 Harmonic Wave Dot Matrix',
    role: 'Physics & Graphics Engineer',
    year: '2026',
    preview: 'https://framerusercontent.com/images/BsJb1GV0DDjj2B5ELG33XfWmQ.jpg',
    stack: ['Web Audio API', 'Mathematics', 'CSS Keyframes'],
    overview: 'An interactive 121-node quantum dot matrix with distance-calibrated phase delay propagation: delay = sqrt((x-5)^2 + (y-5)^2) * 0.08s. Clicking any node fires a radial shockwave across the grid with procedural audio ticks.',
    metrics: [
      { label: 'Grid Elements', val: '121 Nodes' },
      { label: 'Propagation Delay', val: '38ms / node' }
    ],
    liveUrl: '#playground'
  },
  'retro-terminal': {
    title: 'Ainesh-DOS 6.22 CRT Console',
    role: 'Systems Architect',
    year: '2026',
    preview: 'https://framerusercontent.com/images/OUq4sSIJXVqet1DGXpjpnXuC1qc.jpg',
    stack: ['CLI Parser', 'Phosphor CRT Shader', 'Web Audio Synthesizer'],
    overview: 'Simulated retro terminal emulator with phosphor scanline textures, command parser supporting diagnostics (status, stack, overclock, matrix), and an interactive 8-bit overclock badge button toggling 120Hz turbo mode.',
    metrics: [
      { label: 'Command Parser', val: 'Sub-1ms' },
      { label: 'Overclock State', val: 'Turbo 120Hz' }
    ],
    liveUrl: '#playground'
  },
  'obsidian-engine': {
    title: 'Obsidian Relational Engine',
    role: 'Database Architect',
    year: '2025',
    preview: 'https://framerusercontent.com/images/Ce5CMDqNJqwWN1TC3B0xbsBq47M.jpg',
    stack: ['SQLite', 'WAL Mode', 'Prepared Statements', 'Zero Injection'],
    overview: 'Direct C-level synchronous bindings via better-sqlite3 with WAL mode enabled. Sub-millisecond reads with zero network overhead, parameter sanitization, and ACID atomic commit transactions.',
    metrics: [
      { label: 'Transaction Speed', val: '14,000 ops/sec' },
      { label: 'Integrity', val: '100% ACID' }
    ],
    liveUrl: 'https://github.com/Bloxi17'
  },
  'apple-motion': {
    title: 'Apple Fluid Motion Interfaces',
    role: 'Design Engineer',
    year: '2025',
    preview: 'https://framerusercontent.com/images/FZyOyyrz0ZctFkAK2kROsql2w1A.jpg',
    stack: ['Spring Physics', 'Direct 1:1 Touch', 'Velocity Preservation'],
    overview: 'Eliminating the feeling of artificial delay with critically damped springs, direct manipulation touch response, and interruptible state transitions that feel native to iOS and macOS.',
    metrics: [
      { label: 'Damping Ratio', val: '0.82 / 1.00' },
      { label: 'Touch Latency', val: 'Instant' }
    ],
    liveUrl: '#work'
  },
  'llms-txt': {
    title: 'AI Machine Surface (/llms.txt)',
    role: 'Autonomous Protocol Architect',
    year: '2026',
    preview: 'https://framerusercontent.com/images/AHnUuCwiIe3u0k9N4az6316yTbU.jpg',
    stack: ['Markdown RFC', 'Agent Discovery', 'Zero Hallucination'],
    overview: 'Structured machine-readable engineering profile allowing autonomous AI agents, scrapers, and recruiters to inspect Ainesh Joel Hamilton’s technical competencies without hallucination or truncation.',
    metrics: [
      { label: 'Spec Standards', val: 'llms.txt + llms-full.txt' },
      { label: 'Machine Readiness', val: '100%' }
    ],
    liveUrl: 'llms.txt'
  }
};

function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const backdrop = document.getElementById('drawerBackdrop');
  const header = document.getElementById('projectModalHeader');
  const content = document.getElementById('projectModalContent');
  const rows = document.querySelectorAll('.huyml-project-row');

  if (!modal || !content) return;

  rows.forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.project;
      const data = PROJECT_DETAILS[key];
      if (!data) return;

      header.textContent = `CASE STUDY // ${data.title.toUpperCase()}`;

      content.innerHTML = `
        <div style="border-radius: 10px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <img src="${data.preview}" alt="${data.title}" style="width: 100%; height: auto; display: block;">
        </div>

        <div>
          <div class="huyml-drawer-section-title">Overview</div>
          <p class="huyml-drawer-text">${data.overview}</p>
        </div>

        <div>
          <div class="huyml-drawer-section-title">Telemetry &amp; Benchmarks</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
            ${data.metrics.map(m => `
              <div style="background: var(--bg-card); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
                <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">${m.label}</div>
                <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${m.val}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="huyml-drawer-section-title">Architectural Stack</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${data.stack.map(s => `<span class="huyml-badge-pill highlight">${s}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <a href="${data.liveUrl}" target="_blank" rel="noopener" class="huyml-showreel-btn" style="text-decoration: none;">
            <span>Inspect Live Repository ↗</span>
          </a>
        </div>
      `;

      modal.classList.add('active');
      backdrop?.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (window.soundEngine) window.soundEngine.playOpen();
    });
  });
}

/* --------------------------------------------------------------------------
   7. '26 Showreel Fullscreen Procedural Canvas Player
   -------------------------------------------------------------------------- */
function initShowreel() {
  const modal = document.getElementById('showreelModal');
  const openBtn = document.getElementById('openShowreelBtn');
  const closeBtn = document.getElementById('closeShowreelBtn');
  const canvas = document.getElementById('showreelCanvas');

  if (!modal || !canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId = null;
  let t = 0;

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function drawSimulation() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;

    ctx.fillStyle = '#08090c';
    ctx.fillRect(0, 0, w, h);

    // Procedural wave ribbons
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const hue = 190 + i * 15;
      ctx.strokeStyle = `hsla(${hue}, 85%, 60%, ${0.25 + i * 0.1})`;

      for (let x = 0; x < w; x += 10) {
        const y = h / 2 + Math.sin(x * 0.005 + t * 0.04 + i) * 60 + Math.cos(x * 0.008 + t * 0.02) * 40;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Floating particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let p = 0; p < 24; p++) {
      const px = (p * 55 + t * 20) % w;
      const py = (h * 0.3 + Math.sin(p + t * 0.03) * 80);
      ctx.beginPath();
      ctx.arc(px, py, (p % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    t += 1;
    animationId = requestAnimationFrame(drawSimulation);
  }

  function open() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resizeCanvas();
    t = 0;
    animationId = requestAnimationFrame(drawSimulation);
    if (window.soundEngine) window.soundEngine.playOpen();
  }

  function close() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (animationId) cancelAnimationFrame(animationId);
  }

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);

  window.addEventListener('resize', () => {
    if (modal.classList.contains('active')) resizeCanvas();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) close();
  });
}

/* --------------------------------------------------------------------------
   8. Clipboard Copy & Toast Feedback
   -------------------------------------------------------------------------- */
function showToast(message) {
  const toast = document.getElementById('huymlToast');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}
window.showToast = showToast;

function initClipboardToast() {
  const copyBtns = document.querySelectorAll('.trigger-copy-email');
  const email = 'hamiltonjoel848@gmail.com';

  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied to clipboard: ' + email);
        if (window.soundEngine) window.soundEngine.playOpen();
      }).catch(() => {
        showToast('Direct mail: ' + email);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   9. Playground Micro-Lab: 11x11 Harmonic Wave Dot Matrix & Mini CRT
   -------------------------------------------------------------------------- */
function initPlaygroundFeatures() {
  const matrixGrid = document.getElementById('playgroundMatrixGrid');
  const matrixState = document.getElementById('matrixStateLabel');
  const pulseBtn = document.getElementById('btnTriggerShockwave');

  if (matrixGrid) {
    matrixGrid.innerHTML = '';
    const dots = [];

    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.35);
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        `;

        dot.addEventListener('mouseenter', () => {
          dot.style.transform = 'scale(1.8)';
          dot.style.background = '#38bdf8';
          if (window.soundEngine) window.soundEngine.playTick();
          setTimeout(() => {
            dot.style.transform = 'scale(1)';
            dot.style.background = 'rgba(56, 189, 248, 0.35)';
          }, 200);
        });

        dot.addEventListener('click', () => {
          triggerMatrixShockwave(r, c);
        });

        matrixGrid.appendChild(dot);
        dots.push({ el: dot, r, c });
      }
    }

    function triggerMatrixShockwave(originR, originC) {
      if (matrixState) matrixState.textContent = 'PROPAGATING';
      if (window.soundEngine) window.soundEngine.playTick();

      dots.forEach(({ el, r, c }) => {
        const dist = Math.sqrt((r - originR) ** 2 + (c - originC) ** 2);
        setTimeout(() => {
          el.style.transform = 'scale(1.8)';
          el.style.background = '#38bdf8';
          setTimeout(() => {
            el.style.transform = 'scale(1)';
            el.style.background = 'rgba(56, 189, 248, 0.35)';
          }, 200);
        }, dist * 35);
      });

      setTimeout(() => {
        if (matrixState) matrixState.textContent = 'ACTIVE';
      }, 500);
    }

    if (pulseBtn) {
      pulseBtn.addEventListener('click', () => triggerMatrixShockwave(5, 5));
    }
  }

  // Mini CRT Terminal Chips
  const termChips = document.querySelectorAll('.mini-term-chip');
  const termLogs = document.getElementById('miniTerminalLogs');

  termChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      if (!termLogs) return;

      const row = document.createElement('div');
      row.style.marginTop = '4px';

      if (cmd === 'status') {
        row.textContent = '> [TELEMETRY] 60.0 FPS LOCKED · HEAP NOMINAL';
        row.style.color = '#38bdf8';
      } else if (cmd === 'stack') {
        row.textContent = '> [STACK] Node.js · better-sqlite3 · TypeScript · Canvas 2D';
        row.style.color = '#e2b340';
      } else if (cmd === 'overclock') {
        row.textContent = '> [TURBO] 120Hz OVERCLOCK PIPELINE ENGAGED';
        row.style.color = '#10b981';
      }

      termLogs.appendChild(row);
      termLogs.scrollTop = termLogs.scrollHeight;
      if (window.soundEngine) window.soundEngine.playTick();
    });
  });
}
