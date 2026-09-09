/**
 * Timber & Plank Craft Studio - Core Application Logic
 * Navigation, Sample Drawer, Toasts, Auth Flow, Dark Mode, RTL Support
 */

// State Management for Free Wood Samples
const SampleManager = {
  STORAGE_KEY: 'timber_plank_samples',

  getSamples() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  addSample(sample) {
    let samples = this.getSamples();
    const exists = samples.some(item => item.id === sample.id);
    if (exists) {
      showToast(`"${sample.name}" is already in your sample box.`, 'info');
      return false;
    }
    if (samples.length >= 5) {
      showToast('Maximum 5 complimentary samples per consultation.', 'warning');
      return false;
    }
    samples.push(sample);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(samples));
    this.updateUI();
    showToast(`Added "${sample.name}" to complimentary sample box!`, 'success');
    return true;
  },

  removeSample(id) {
    let samples = this.getSamples();
    samples = samples.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(samples));
    this.updateUI();
    showToast('Sample removed from box.', 'info');
  },

  clearSamples() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateUI();
  },

  updateUI() {
    const samples = this.getSamples();
    const badges = document.querySelectorAll('.sample-count-badge');
    badges.forEach(b => {
      b.textContent = samples.length;
      if (samples.length > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });

    const drawerList = document.getElementById('drawer-samples-list');
    const emptyMsg = document.getElementById('drawer-empty-message');
    const orderBtn = document.getElementById('drawer-order-btn');

    if (!drawerList) return;

    if (samples.length === 0) {
      drawerList.innerHTML = '';
      if (emptyMsg) emptyMsg.classList.remove('hidden');
      if (orderBtn) orderBtn.classList.add('opacity-50', 'pointer-events-none');
    } else {
      if (emptyMsg) emptyMsg.classList.add('hidden');
      if (orderBtn) orderBtn.classList.remove('opacity-50', 'pointer-events-none');

      drawerList.innerHTML = samples.map(item => `
        <div class="flex items-center gap-3 p-3 bg-[#fbf9f5] border border-[#e8dfd3] rounded-xl hover:border-[#c58940] transition">
          <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg border border-[#e3d7c5]">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-[#1b130e] truncate">${item.name}</h4>
            <p class="text-xs text-[#8c786a]">${item.type || 'Natural Timber'} • ${item.finish || 'Matte'}</p>
            <span class="inline-block mt-1 text-[11px] font-medium text-[#c58940]">Free Showroom Swatch</span>
          </div>
          <button onclick="SampleManager.removeSample('${item.id}')" class="p-1.5 text-gray-400 hover:text-red-600 transition" title="Remove sample">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      `).join('');
    }
  }
};

// Global Toast Utility
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';

  const icons = {
    success: `<svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
    warning: `<svg class="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
    error: `<svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    info: `<svg class="w-5 h-5 text-[#c58940] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  };

  toast.innerHTML = `
    ${icons[type] || icons.info}
    <div class="text-sm font-medium leading-snug flex-1">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Authentication & Session Management
const AuthManager = {
  STORAGE_KEY: 'timber_plank_logged_in',

  isLoggedIn() {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  },

  login() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    window.location.href = 'index.html';
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    showToast('Signed out successfully. Returning to Sign In...', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 400);
  },

  updateUI() {
    const loggedIn = this.isLoggedIn();
    const authBtns = document.querySelectorAll('.auth-btn');

    authBtns.forEach(btn => {
      const textSpan = btn.querySelector('.auth-btn-text');
      const iconSvg = btn.querySelector('.auth-icon-login');

      if (loggedIn) {
        btn.setAttribute('href', '#');
        btn.onclick = (e) => {
          e.preventDefault();
          AuthManager.logout();
        };
        if (textSpan) textSpan.textContent = 'Logout';
        if (iconSvg) {
          iconSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>`;
        }
        btn.title = 'Click to Logout';
        btn.classList.remove('bg-gradient-to-r', 'from-[#c58940]', 'to-[#b37833]', 'text-white');
        btn.classList.add('border', 'border-[#c58940]', 'bg-white', 'text-[#c58940]', 'hover:bg-[#c58940]', 'hover:text-white');
      } else {
        btn.setAttribute('href', 'login.html');
        btn.onclick = null;
        if (textSpan) textSpan.textContent = 'Login';
        if (iconSvg) {
          iconSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>`;
        }
        btn.title = 'Client & Trade Login';
        btn.classList.remove('border', 'border-[#c58940]', 'bg-white', 'text-[#c58940]', 'hover:bg-[#c58940]');
        btn.classList.add('bg-gradient-to-r', 'from-[#c58940]', 'to-[#b37833]', 'text-white');
      }
    });
  }
};

// Dark / Light Theme Toggle Management
const ThemeManager = {
  STORAGE_KEY: 'timber_plank_theme',

  getTheme() {
    return localStorage.getItem(this.STORAGE_KEY) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  },

  toggle() {
    const nextTheme = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Showroom' : 'Light Showroom'} mode`, 'info');
  },

  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    const moons = document.querySelectorAll('.theme-icon-moon');
    const suns = document.querySelectorAll('.theme-icon-sun');
    const mobileLabels = document.querySelectorAll('.theme-mobile-label');

    moons.forEach(m => m.classList.toggle('hidden', theme === 'dark'));
    suns.forEach(s => s.classList.toggle('hidden', theme === 'light'));
    mobileLabels.forEach(l => {
      l.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  },

  init() {
    const currentTheme = this.getTheme();
    this.applyTheme(currentTheme);

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    });
  }
};

// RTL / LTR Direction Management
const DirectionManager = {
  STORAGE_KEY: 'timber_plank_direction',

  getDir() {
    return localStorage.getItem(this.STORAGE_KEY) || 'ltr';
  },

  setDir(dir) {
    localStorage.setItem(this.STORAGE_KEY, dir);
    this.applyDir(dir);
  },

  toggle() {
    const nextDir = this.getDir() === 'rtl' ? 'ltr' : 'rtl';
    this.setDir(nextDir);
    showToast(`Direction layout: ${nextDir.toUpperCase()}`, 'info');
  },

  applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.classList.toggle('rtl-mode', dir === 'rtl');

    const rtlTexts = document.querySelectorAll('.rtl-btn-text');
    rtlTexts.forEach(t => {
      t.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  },

  init() {
    const currentDir = this.getDir();
    this.applyDir(currentDir);

    document.querySelectorAll('.rtl-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    });
  }
};

// Mobile Menu and Sample Drawer Toggle
function initNavigation() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const sampleDrawer = document.getElementById('sample-drawer');
  const sampleTriggers = document.querySelectorAll('.open-sample-drawer');
  const closeDrawer = document.getElementById('close-sample-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  function openDrawer() {
    if (sampleDrawer && drawerOverlay) {
      sampleDrawer.classList.remove('translate-x-full');
      sampleDrawer.classList.add('translate-x-0');
      drawerOverlay.classList.remove('hidden');
      SampleManager.updateUI();
    }
  }

  function closeDrawerFn() {
    if (sampleDrawer && drawerOverlay) {
      sampleDrawer.classList.add('translate-x-full');
      sampleDrawer.classList.remove('translate-x-0');
      drawerOverlay.classList.add('hidden');
    }
  }

  sampleTriggers.forEach(btn => btn.addEventListener('click', openDrawer));
  if (closeDrawer) closeDrawer.addEventListener('click', closeDrawerFn);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawerFn);

  // Sample Dispatch Form Simulation
  const orderBtn = document.getElementById('drawer-order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      const samples = SampleManager.getSamples();
      if (samples.length === 0) return;
      window.location.href = `contact.html?samples=${encodeURIComponent(samples.map(s => s.name).join(', '))}`;
    });
  }
}

// Newsletter Signup Handler
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      showToast('Thank you for subscribing to our timber craftsmanship digest!', 'success');
      input.value = '';
    }
  });
}

// Initialized on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  DirectionManager.init();
  AuthManager.updateUI();
  initNavigation();
  initNewsletter();
  SampleManager.updateUI();
});
