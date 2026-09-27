/**
 * app.js — Main Application Controller
 * Handles scroll observer, command palette (Cmd+K), toast feedback, and playground controls
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
  initStampTilt();
});

/* -------------------------------------------------------------
   LIVE UTC & IST CLOCK
   ------------------------------------------------------------- */
function initClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    // Indian Standard Time (UTC+5:30)
    const istOptions = { 
      timeZone: 'Asia/Kolkata', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false 
    };
    const istTime = now.toLocaleTimeString('en-US', istOptions);
    clockEl.textContent = `${istTime} IST`;
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
    { title: 'Navigate: Hero / Intro', category: 'Navigation', shortcut: '#home', action: () => scrollToSection('home') },
    { title: 'Navigate: Featured Project (3D Dossier)', category: 'Case Study', shortcut: '#projects', action: () => scrollToSection('projects') },
    { title: 'Navigate: Laboratory & Stamp Modules', category: 'Modules', shortcut: '#laboratory', action: () => scrollToSection('laboratory') },
    { title: 'Navigate: Technical Stack & Capabilities', category: 'Skills', shortcut: '#capabilities', action: () => scrollToSection('capabilities') },
    { title: 'Navigate: Particle Physics Calibration', category: 'Simulation', shortcut: '#playground', action: () => scrollToSection('playground') },
    { title: 'Navigate: Milestones & Journey Rail', category: 'Career', shortcut: '#journey', action: () => scrollToSection('journey') },
    { title: 'Navigate: Engineering Philosophy', category: 'About', shortcut: '#about', action: () => scrollToSection('about') },
    { title: 'Navigate: Get in Touch / Terminal', category: 'Contact', shortcut: '#contact', action: () => scrollToSection('contact') },
    { title: 'Action: Open Let\'s Talk Floating Popover', category: 'Connect', shortcut: 'T', action: () => window.toggleLetsTalkPopover(true) },
    { title: 'Action: Copy Verified Email', category: 'Clipboard', shortcut: 'E', action: () => copyEmailToClipboard() },
    { title: 'Link: Open GitHub Profile (@Bloxi17)', category: 'External', shortcut: 'GH', action: () => window.open('https://github.com/Bloxi17', '_blank') },
    { title: 'Link: Open First Step School Live App', category: 'External', shortcut: 'LIVE', action: () => window.open('https://firststepschool-kbp6.onrender.com', '_blank') },
    { title: 'Toggle: Pause Particle Simulation', category: 'Simulation', shortcut: 'P', action: () => toggleParticleEngine() }
  ];

  function renderCommands(filterText = '') {
    list.innerHTML = '';
    const query = filterText.toLowerCase().trim();
    const filtered = commands.filter(cmd => 
      cmd.title.toLowerCase().includes(query) || 
      cmd.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      list.innerHTML = `<li class="cmd-item-empty">No commands matching "${filterText}"</li>`;
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

let isParticlePaused = false;
function toggleParticleEngine() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  isParticlePaused = !isParticlePaused;
  canvas.style.opacity = isParticlePaused ? '0.1' : '1';
  showToast(isParticlePaused ? 'Particle Simulation Paused (Low-Power)' : 'Particle Simulation Active');
}

/* -------------------------------------------------------------
   CLIPBOARD & TOAST NOTIFICATION
   ------------------------------------------------------------- */
function initClipboardToast() {
  const copyPills = document.querySelectorAll('.trigger-copy-email');
  copyPills.forEach(pill => {
    pill.addEventListener('click', () => {
      copyEmailToClipboard();
    });
  });
}

function copyEmailToClipboard() {
  const email = 'hamiltonjoel848@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    showToast('✓ Email copied to clipboard');
  }).catch(() => {
    showToast('hamiltonjoel848@gmail.com');
  });
}
window.copyEmailToClipboard = copyEmailToClipboard;

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

/* -------------------------------------------------------------
   PLAYGROUND CONTROLS
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

  if (forceSlider && forceVal) {
    forceSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      forceVal.textContent = `${val} N`;
      if (window.particleTextEngine) {
        window.particleTextEngine.dispersionForce = val;
      }
    });
  }

  if (frictionSlider && frictionVal) {
    frictionSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      frictionVal.textContent = val.toFixed(2);
      if (window.particleTextEngine) {
        window.particleTextEngine.friction = val;
      }
    });
  }

  if (radiusSlider && radiusVal) {
    radiusSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      radiusVal.textContent = `${val}px`;
      if (window.particleTextEngine) {
        window.particleTextEngine.interactionRadius = val;
      }
    });
  }

  function applyPreset(force, friction, radius, activeBtn) {
    if (forceSlider) { forceSlider.value = force; forceVal.textContent = `${force} N`; }
    if (frictionSlider) { frictionSlider.value = friction; frictionVal.textContent = friction.toFixed(2); }
    if (radiusSlider) { radiusSlider.value = radius; radiusVal.textContent = `${radius}px`; }

    if (window.particleTextEngine) {
      window.particleTextEngine.dispersionForce = force;
      window.particleTextEngine.friction = friction;
      window.particleTextEngine.interactionRadius = radius;
    }

    [btnDefault, btnExplosive, btnFloating].forEach(b => b && b.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
    showToast(`Physics: ${force}N force, ${friction} friction, ${radius}px radius`);
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
    // Cmd+K or Ctrl+K
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
   PERFORATED STAMP CARDS 3D TILT
   ------------------------------------------------------------- */
function initStampTilt() {
  const cards = document.querySelectorAll('.stamp-card');
  if (!cards.length) return;

  // Only tilt on fine pointers (desktop)
  if (window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
