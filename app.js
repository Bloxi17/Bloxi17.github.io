/**
 * app.js — Main Application Controller
 * Handles scroll progress, command palette (⌘K), toast feedback,
 * 3D confidential folder dossier, Watermelon UI showcase widgets,
 * and physics playground controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initScrollProgress();
  initNavObserver();
  initCommandPalette();
  initClipboardToast();
  initPlaygroundControls();
  initKeyboardShortcuts();
  initFolderDossier();
  initLetsTalkPopover();
  initWatermelonShowcase();
  initDotMatrix();
  initRetroTerminal();
});

/* -------------------------------------------------------------
   LIVE IST CLOCK (UTC+5:30)
   ------------------------------------------------------------- */
function initClock() {
  const clockEl = document.getElementById('liveClock');
  const harshClockEl = document.getElementById('harshClock');
  if (!clockEl && !harshClockEl) return;

  function update() {
    const now = new Date();
    const istOptions = { 
      timeZone: 'Asia/Kolkata', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false 
    };
    const istTime = now.toLocaleTimeString('en-US', istOptions);
    const text = `${istTime} IST`;
    if (clockEl) clockEl.textContent = text;
    if (harshClockEl) harshClockEl.textContent = text;
  }

  update();
  setInterval(update, 1000);
}

/* -------------------------------------------------------------
   SCROLL PROGRESS BAR
   ------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

/* -------------------------------------------------------------
   NAVIGATION INTERSECTION OBSERVER
   ------------------------------------------------------------- */
function initNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
}

/* -------------------------------------------------------------
   COMMAND PALETTE (CMD + K)
   ------------------------------------------------------------- */
function initCommandPalette() {
  const modal = document.getElementById('cmdPaletteModal');
  const input = document.getElementById('cmdInput');
  const list = document.getElementById('cmdResultsList');
  const openBtns = document.querySelectorAll('.trigger-cmd-palette');
  const closeBtn = document.getElementById('closeCmdModal');

  if (!modal || !input || !list) return;

  const commands = [
    { title: 'Navigate: Hero / Radar Status', category: 'Navigation', shortcut: '#home', action: () => scrollToSection('home') },
    { title: 'Navigate: Confidential Case Study (3D Dossier)', category: 'Case Study', shortcut: '#projects', action: () => scrollToSection('projects') },
    { title: 'Navigate: Watermelon Interactive Component Lab', category: 'Showcase', shortcut: '#laboratory', action: () => scrollToSection('laboratory') },
    { title: 'Navigate: Engineered Capabilities & Stack', category: 'Skills', shortcut: '#capabilities', action: () => scrollToSection('capabilities') },
    { title: 'Navigate: Atmospheric Physics Calibration', category: 'Simulation', shortcut: '#playground', action: () => scrollToSection('playground') },
    { title: 'Navigate: Milestones & Journey Rail', category: 'Career', shortcut: '#journey', action: () => scrollToSection('journey') },
    { title: 'Navigate: Engineering Philosophy', category: 'About', shortcut: '#about', action: () => scrollToSection('about') },
    { title: 'Navigate: Direct Transmission / Contact', category: 'Contact', shortcut: '#contact', action: () => scrollToSection('contact') },
    { title: 'Action: Open Let\'s Talk Floating Channels', category: 'Connect', shortcut: 'T', action: () => window.toggleLetsTalkPopover(true) },
    { title: 'Action: Copy Verified Email', category: 'Clipboard', shortcut: 'E', action: () => copyEmailToClipboard() },
    { title: 'Action: Copy Terminal CLI Command', category: 'Clipboard', shortcut: 'CLI', action: () => copyCliCommand() },
    { title: 'Link: Open GitHub Profile (@Bloxi17)', category: 'External', shortcut: 'GH', action: () => window.open('https://github.com/Bloxi17', '_blank') },
    { title: 'Link: Open First Step School Live App', category: 'External', shortcut: 'LIVE', action: () => window.open('https://firststepschool-kbp6.onrender.com', '_blank') }
  ];

  function renderCommands(filterText = '') {
    list.innerHTML = '';
    const query = filterText.toLowerCase().trim();
    const filtered = commands.filter(cmd => 
      cmd.title.toLowerCase().includes(query) || 
      cmd.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      list.innerHTML = `<li class="cmd-item-empty" style="padding:1rem;color:var(--color-text-muted);font-size:13px;text-align:center;">No commands matching "${filterText}"</li>`;
      return;
    }

    filtered.forEach((cmd, idx) => {
      const li = document.createElement('li');
      li.className = `cmd-item ${idx === 0 ? 'selected' : ''}`;
      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="cmd-category-tag">${cmd.category}</span>
          <span>${cmd.title}</span>
        </div>
        <kbd class="cmd-shortcut">${cmd.shortcut}</kbd>
      `;

      li.addEventListener('click', () => {
        cmd.action();
        closeModal();
      });

      list.appendChild(li);
    });
  }

  function openModal() {
    modal.classList.add('open');
    input.value = '';
    renderCommands('');
    setTimeout(() => input.focus(), 50);
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  input.addEventListener('input', (e) => {
    renderCommands(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.cmd-item');
    let currentIdx = Array.from(items).findIndex(el => el.classList.contains('selected'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        if (currentIdx >= 0) items[currentIdx].classList.remove('selected');
        const nextIdx = (currentIdx + 1) % items.length;
        items[nextIdx].classList.add('selected');
        items[nextIdx].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        if (currentIdx >= 0) items[currentIdx].classList.remove('selected');
        const prevIdx = (currentIdx - 1 + items.length) % items.length;
        items[prevIdx].classList.add('selected');
        items[prevIdx].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIdx >= 0 && items[currentIdx]) {
        items[currentIdx].click();
      }
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });

  window.openCommandPalette = openModal;
  window.closeCommandPalette = closeModal;
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/* -------------------------------------------------------------
   CLIPBOARD & TOAST NOTIFICATION
   ------------------------------------------------------------- */
function initClipboardToast() {
  const copyPills = document.querySelectorAll('.trigger-copy-email, .email-copy-pill');
  copyPills.forEach(pill => {
    pill.addEventListener('click', () => {
      copyEmailToClipboard();
    });
  });
}

function copyEmailToClipboard() {
  const email = 'hamiltonjoel848@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    showToast('✓ Email copied: hamiltonjoel848@gmail.com');
  }).catch(() => {
    showToast('hamiltonjoel848@gmail.com');
  });
}
window.copyEmailToClipboard = copyEmailToClipboard;

function copyCliCommand() {
  const command = 'npx ainesh@latest inspect';
  navigator.clipboard.writeText(command).then(() => {
    const copyBtn = document.getElementById('copyCliBtn');
    const copyText = document.getElementById('copyCliText');
    if (copyText) copyText.textContent = 'Copied! ✓';
    showToast('✓ Command copied: npx ainesh@latest inspect');
    setTimeout(() => {
      if (copyText) copyText.textContent = 'Copy';
    }, 2000);
  }).catch(() => {
    showToast('npx ainesh@latest inspect');
  });
}

function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}
window.showToast = showToast;

/* -------------------------------------------------------------
   WATERMELON UI SHOWCASE WIDGET CONTROLLERS
   ------------------------------------------------------------- */
function initWatermelonShowcase() {
  // 1. Hero CLI Copy Button
  const cliBtn = document.getElementById('copyCliBtn');
  if (cliBtn) {
    cliBtn.addEventListener('click', (e) => {
      e.preventDefault();
      copyCliCommand();
    });
  }

  // 2. Adaptive Spring Slider
  const slider = document.getElementById('demoSlider');
  const sliderVal = document.getElementById('demoSliderVal');
  if (slider && sliderVal) {
    slider.addEventListener('input', (e) => {
      const val = e.target.value;
      sliderVal.textContent = val;
    });
  }

  // 3. Token & Gas Swap Widget
  const swapFrom = document.getElementById('swapFromAmount');
  const swapTo = document.getElementById('swapToAmount');
  const swapBtn = document.getElementById('swapTriggerBtn');
  const ethRate = 3250; // $3,250 USD per 1 ETH
  let isEthToUsd = true;

  function calculateSwap() {
    if (!swapFrom || !swapTo) return;
    const inputVal = parseFloat(swapFrom.value) || 0;
    if (isEthToUsd) {
      const usdVal = (inputVal * ethRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      swapTo.value = `$${usdVal}`;
    } else {
      const ethVal = (inputVal / ethRate).toFixed(4);
      swapTo.value = `${ethVal} ETH`;
    }
  }

  if (swapFrom) {
    swapFrom.addEventListener('input', calculateSwap);
  }

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      isEthToUsd = !isEthToUsd;
      const badges = document.querySelectorAll('.swap-token-badge');
      if (badges.length >= 2) {
        const temp = badges[0].textContent;
        badges[0].textContent = badges[1].textContent;
        badges[1].textContent = temp;
      }
      calculateSwap();
      showToast(isEthToUsd ? 'Swapping ETH → USD' : 'Swapping USD → ETH');
    });
  }

  // 4. Architecture Disclosure Accordion
  const disclosureItems = document.querySelectorAll('.disclosure-item');
  disclosureItems.forEach(item => {
    const trigger = item.querySelector('.disclosure-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        disclosureItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

/* -------------------------------------------------------------
   ATMOSPHERIC PHYSICS CALIBRATION DECK
   ------------------------------------------------------------- */
function initPlaygroundControls() {
  const forceSlider = document.getElementById('playForce');
  const forceVal = document.getElementById('playForceVal');
  const frictionSlider = document.getElementById('playFriction');
  const frictionVal = document.getElementById('playFrictionVal');
  const radiusSlider = document.getElementById('playRadius');
  const radiusVal = document.getElementById('playRadiusVal');

  const btnDefault = document.getElementById('btnPresetDefault');
  const btnExplosive = document.getElementById('btnPresetExplosive');
  const btnFloating = document.getElementById('btnPresetFloating');

  function updateAtmosphere(force, friction, radius) {
    if (window.atmosphericBackground) {
      window.atmosphericBackground.setPhysics(force, friction, radius);
    }
  }

  if (forceSlider && forceVal) {
    forceSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      forceVal.textContent = `${val} N`;
      updateAtmosphere(val, parseFloat(frictionSlider?.value || 0.95), parseInt(radiusSlider?.value || 200, 10));
    });
  }

  if (frictionSlider && frictionVal) {
    frictionSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      frictionVal.textContent = val.toFixed(2);
      updateAtmosphere(parseFloat(forceSlider?.value || 15), val, parseInt(radiusSlider?.value || 200, 10));
    });
  }

  if (radiusSlider && radiusVal) {
    radiusSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      radiusVal.textContent = `${val}px`;
      updateAtmosphere(parseFloat(forceSlider?.value || 15), parseFloat(frictionSlider?.value || 0.95), val);
    });
  }

  function applyPreset(force, friction, radius, activeBtn) {
    if (forceSlider) { forceSlider.value = force; forceVal.textContent = `${force} N`; }
    if (frictionSlider) { frictionSlider.value = friction; frictionVal.textContent = friction.toFixed(2); }
    if (radiusSlider) { radiusSlider.value = radius; radiusVal.textContent = `${radius}px`; }

    updateAtmosphere(force, friction, radius);

    [btnDefault, btnExplosive, btnFloating].forEach(b => b && b.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
    showToast(`Physics Preset: ${force}N force, ${friction} friction, ${radius}px radius`);
  }

  if (btnDefault) btnDefault.addEventListener('click', () => applyPreset(15, 0.95, 200, btnDefault));
  if (btnExplosive) btnExplosive.addEventListener('click', () => applyPreset(32, 0.91, 280, btnExplosive));
  if (btnFloating) btnFloating.addEventListener('click', () => applyPreset(8, 0.98, 160, btnFloating));
}

/* -------------------------------------------------------------
   KEYBOARD SHORTCUTS
   ------------------------------------------------------------- */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // ⌘K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (window.openCommandPalette) window.openCommandPalette();
    }
  });
}

/* -------------------------------------------------------------
   3D CONFIDENTIAL PROJECT DOSSIER CONTROLLER
   ------------------------------------------------------------- */
function initFolderDossier() {
  const tabs = document.querySelectorAll('.dossier-tab-btn');
  const sheets = document.querySelectorAll('.dossier-sheet');
  if (!tabs.length || !sheets.length) return;

  function switchSheet(targetIdx) {
    tabs.forEach(t => {
      const isTarget = t.dataset.target === targetIdx;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    sheets.forEach(s => {
      const isTarget = s.dataset.sheet === targetIdx;
      s.classList.toggle('active', isTarget);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = tab.dataset.target;
      if (target) switchSheet(target);
    });
  });

  // Clicking an inactive sheet brings it to front
  sheets.forEach(sheet => {
    sheet.addEventListener('click', () => {
      const idx = sheet.dataset.sheet;
      if (idx) switchSheet(idx);
    });
  });
}

/* -------------------------------------------------------------
   "LET'S TALK" FLOATING POPOVER CONTROLLER
   ------------------------------------------------------------- */
function initLetsTalkPopover() {
  const popover = document.getElementById('letsTalkPopover');
  const closeBtn = document.getElementById('closeLetsTalkBtn');
  const triggers = document.querySelectorAll('.trigger-lets-talk');

  if (!popover) return;

  window.toggleLetsTalkPopover = function(forceState) {
    const shouldOpen = typeof forceState === 'boolean' 
      ? forceState 
      : !popover.classList.contains('open');

    if (shouldOpen) {
      popover.classList.add('open');
      popover.setAttribute('aria-modal', 'true');
    } else {
      popover.classList.remove('open');
      popover.setAttribute('aria-modal', 'false');
    }
  };

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.toggleLetsTalkPopover();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.toggleLetsTalkPopover(false);
    });
  }

  // Dismiss on outside click
  document.addEventListener('click', (e) => {
    if (popover.classList.contains('open')) {
      if (!popover.contains(e.target) && !e.target.closest('.trigger-lets-talk') && !e.target.closest('[data-action="contact"]')) {
        window.toggleLetsTalkPopover(false);
      }
    }
  });

  // Dismiss on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover.classList.contains('open')) {
      window.toggleLetsTalkPopover(false);
    }
  });
}

/* -------------------------------------------------------------
   HARMONIC WAVE DOT MATRIX (11x11 Grid, 121 Nodes)
   Inspired by Harsh Dayal & Watermelon UI
   ------------------------------------------------------------- */
function initDotMatrix() {
  const grid = document.getElementById('harmonicDotMatrix');
  const waveCountEl = document.getElementById('matrixWaveCount');
  const pulseBtn = document.getElementById('btnPulseMatrix');
  const invertBtn = document.getElementById('btnInvertMatrix');
  if (!grid) return;

  grid.innerHTML = '';
  let isInverted = false;
  const dots = [];

  // Create 11x11 = 121 dots
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const dot = document.createElement('div');
      dot.className = 'dm-dot';
      dot.dataset.r = r;
      dot.dataset.c = c;
      
      // Calculate radial delay from center (5, 5)
      const dist = Math.sqrt((r - 5) ** 2 + (c - 5) ** 2);
      dot.style.animationDelay = `${(dist * 0.08).toFixed(2)}s`;
      
      // Hover effect: scale up dot and sound tick
      dot.addEventListener('mouseenter', () => {
        dot.classList.add('active');
        if (window.soundEngine?.isEnabled) {
          window.soundEngine.playHoverTick();
        }
        setTimeout(() => dot.classList.remove('active'), 250);
      });

      // Click effect: radial shockwave radiating from this dot
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerShockwave(r, c);
      });

      grid.appendChild(dot);
      dots.push({ el: dot, r, c });
    }
  }

  function triggerShockwave(originR, originC) {
    if (waveCountEl) waveCountEl.textContent = 'WAVE: PROPAGATING';
    if (window.soundEngine?.isEnabled) {
      window.soundEngine.playChirp(440, 880, 0.1, 'sine', 0.05);
    }

    dots.forEach(({ el, r, c }) => {
      const dist = Math.sqrt((r - originR) ** 2 + (c - originC) ** 2);
      const delayMs = dist * 38;
      setTimeout(() => {
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 220);
      }, delayMs);
    });

    const maxDist = Math.sqrt(10 ** 2 + 10 ** 2);
    setTimeout(() => {
      if (waveCountEl) waveCountEl.textContent = 'WAVE: ACTIVE';
    }, maxDist * 38 + 250);
  }

  if (pulseBtn) {
    pulseBtn.addEventListener('click', () => {
      triggerShockwave(5, 5);
      if (window.showToast) window.showToast('Shockwave Propagated from Center Node (5,5)');
    });
  }

  if (invertBtn) {
    invertBtn.addEventListener('click', () => {
      isInverted = !isInverted;
      dots.forEach(({ el, r, c }) => {
        const dist = Math.sqrt((r - 5) ** 2 + (c - 5) ** 2);
        const computedDist = isInverted ? (7.07 - dist) : dist;
        el.style.animationDelay = `${Math.max(0, computedDist * 0.08).toFixed(2)}s`;
      });
      if (window.showToast) {
        window.showToast(isInverted ? 'Harmonic Phase Inverted (Reverse Radial)' : 'Harmonic Phase Reset to Normal');
      }
      if (window.soundEngine?.isEnabled) {
        window.soundEngine.playClickSnap();
      }
    });
  }
}

/* -------------------------------------------------------------
   RETRO CRT ENGINEERING CONSOLE (Ainesh-DOS 6.22 / AH-CLI)
   ------------------------------------------------------------- */
function initRetroTerminal() {
  const terminal = document.getElementById('retroTerminalCard');
  const body = document.getElementById('terminalWindowBody');
  const form = document.getElementById('terminalForm');
  const input = document.getElementById('terminalInput');
  const overclockBtn = document.getElementById('terminalOverclockBtn');
  const chips = document.querySelectorAll('.terminal-chip');
  if (!terminal || !body || !input) return;

  let isOverclocked = false;

  function appendLog(text, className = '') {
    const row = document.createElement('div');
    row.className = `terminal-log-row ${className}`.trim();
    row.textContent = text;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function handleCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    appendLog(`A:\\> ${rawCmd}`, 'cmd-echo');
    if (window.soundEngine?.isEnabled) {
      window.soundEngine.playClickSnap();
    }

    switch (cmd) {
      case 'help':
        appendLog('AVAILABLE SYSTEM ROUTINES:', 'accent-cyan');
        appendLog('  help       - Print this command list');
        appendLog('  status     - Show architecture telemetry and frame rate');
        appendLog('  stack      - Display core backend and creative graphics tech stack');
        appendLog('  overclock  - Toggle 8-bit overclock CPU accelerator mode');
        appendLog('  matrix     - Trigger 11x11 quantum dot matrix shockwave');
        appendLog('  sound      - Toggle Web Audio API synthesizer');
        appendLog('  dossier    - Inspect First Step Sr. Sec. School case study');
        appendLog('  contact    - Open transmission channels');
        appendLog('  clear      - Clear terminal buffer');
        break;

      case 'status':
        appendLog('TELEMETRY STATUS REPORT:', 'accent-cyan');
        appendLog('  [HOST] bloxi17.github.io');
        appendLog('  [CPU] 60.0 FPS LOCKED (Hardware Accelerated Canvas)');
        appendLog('  [MEMORY] Zero-Leak Heap (Garbage Collector Optimized)');
        appendLog('  [ARCH] Resilient Full-Stack + Apple Fluid Motion');
        appendLog('  [CLEARANCE] LEVEL-4 ARCHITECT');
        break;

      case 'stack':
        appendLog('PRODUCTION ARCHITECTURAL STACK:', 'accent-gold');
        appendLog('  Backend:  Node.js · Express · better-sqlite3 (WAL) · PostgreSQL');
        appendLog('  Frontend: Next.js 15 · TypeScript · Tailwind CSS · GSAP');
        appendLog('  Graphics: Three.js · HTML5 Canvas 2D/3D · WebGL Shaders');
        appendLog('  Sound:    Procedural Web Audio API Synthesizer (0 KB mp3)');
        appendLog('  Machine:  /llms.txt & /llms-full.txt Spec Compliant');
        break;

      case 'overclock':
        toggleOverclock();
        break;

      case 'matrix':
        appendLog('Emitting quantum shockwave from node (5,5)...', 'accent-cyan');
        const pulseBtn = document.getElementById('btnPulseMatrix');
        if (pulseBtn) pulseBtn.click();
        break;

      case 'sound':
        if (window.soundEngine) {
          const state = window.soundEngine.toggle();
          appendLog(`Synthesizer Audio is now: ${state ? 'ENABLED' : 'MUTED'}`, state ? 'accent-cyan' : '');
        }
        break;

      case 'dossier':
        appendLog('Navigating to Confidential Dossier Archive...', 'accent-gold');
        const dossierSection = document.getElementById('projects');
        if (dossierSection) {
          dossierSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'contact':
        appendLog('Opening direct transmission modal...', 'accent-cyan');
        if (window.toggleLetsTalkPopover) {
          window.toggleLetsTalkPopover(true);
        }
        break;

      case 'clear':
      case 'cls':
        body.innerHTML = '';
        appendLog('Ainesh-DOS Version 6.22 (C) Copyright Ainesh Joel Hamilton 2026.');
        break;

      default:
        appendLog(`'${cmd}' is not recognized as an internal or external command.`, 'accent-gold');
        appendLog("Type 'help' for a list of valid commands.", 'accent-cyan');
        break;
    }
  }

  function toggleOverclock() {
    isOverclocked = !isOverclocked;
    terminal.classList.toggle('overclocked', isOverclocked);
    if (overclockBtn) {
      overclockBtn.innerHTML = `<span class="radar-dot" style="width: 5px; height: 5px; background: ${isOverclocked ? '#38bdf8' : '#e2b340'};"></span><span>OVERCLOCK: ${isOverclocked ? 'TURBO 120Hz' : '8-BIT'}</span>`;
    }
    appendLog(isOverclocked ? '>>> OVERCLOCK ENGAGED: 120Hz TURBO PIPELINE ACTIVE <<<' : '>>> OVERCLOCK RETURNED TO STANDARD 8-BIT RUNTIME <<<', isOverclocked ? 'accent-cyan' : 'accent-gold');
    if (window.soundEngine?.isEnabled) {
      window.soundEngine.playChirp(isOverclocked ? 400 : 800, isOverclocked ? 1200 : 300, 0.15, 'triangle', 0.08);
    }
    if (window.showToast) {
      window.showToast(isOverclocked ? 'Terminal Overclock: TURBO ENGAGED' : 'Terminal Overclock: STANDARD');
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      input.value = '';
      handleCommand(val);
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      if (cmd) {
        input.value = '';
        handleCommand(cmd);
      }
    });
  });

  if (overclockBtn) {
    overclockBtn.addEventListener('click', () => {
      toggleOverclock();
    });
  }
}

