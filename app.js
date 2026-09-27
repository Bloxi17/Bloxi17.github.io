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
});

/* -------------------------------------------------------------
   LIVE IST CLOCK (UTC+5:30)
   ------------------------------------------------------------- */
function initClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

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
