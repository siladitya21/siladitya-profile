// Theme toggle (light / night mode)
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;
const savedTheme = localStorage.getItem('theme');

function setThemeIcon(theme) {
  themeIcon.classList.remove('fa-moon', 'fa-sun');
  themeIcon.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
}

if (savedTheme) {
  body.setAttribute('data-theme', savedTheme);
  setThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
  const isDark = body.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setThemeIcon(next);
});

// Visual theme picker (default / sci-fi HUD / glass)
const STYLES = {
  default: { icon: 'fa-seedling', label: 'Default' },
  glass: { icon: 'fa-gem', label: 'Glassmorphism' },
  neu: { icon: 'fa-circle-half-stroke', label: 'Neumorphism' },
  clay: { icon: 'fa-cookie', label: 'Claymorphism' },
  hud: { icon: 'fa-crosshairs', label: 'Sci-fi HUD' },
  cyber: { icon: 'fa-bolt', label: 'Cyberpunk' },
  bento: { icon: 'fa-table-cells-large', label: 'Bento Grid' },
  swiss: { icon: 'fa-font', label: 'Swiss' },
  aurora: { icon: 'fa-wand-magic-sparkles', label: 'Aurora' },
  vapor: { icon: 'fa-compact-disc', label: 'Synthwave' },
  skeuo: { icon: 'fa-book-open', label: 'Skeuomorphism' }
};
const styleSwitcher = document.getElementById('style-switcher');
const styleToggle = document.getElementById('style-toggle');
const styleIcon = document.getElementById('style-icon');
const styleMenu = document.getElementById('style-menu');
const styleOptions = styleMenu.querySelectorAll('[data-style-option]');
const root = document.documentElement;

function applyStyle(style) {
  if (!STYLES[style]) style = 'default';
  if (style === 'default') root.removeAttribute('data-style');
  else root.setAttribute('data-style', style);

  Object.values(STYLES).forEach(s => styleIcon.classList.remove(s.icon));
  styleIcon.classList.add(STYLES[style].icon);
  const label = `Choose theme (current: ${STYLES[style].label})`;
  styleToggle.setAttribute('aria-label', label);
  styleToggle.setAttribute('title', label);
  styleOptions.forEach(opt => {
    opt.setAttribute('aria-checked', String(opt.dataset.styleOption === style));
  });
}

function openStyleMenu() {
  styleMenu.hidden = false;
  styleToggle.setAttribute('aria-expanded', 'true');
  const current = styleMenu.querySelector('[aria-checked="true"]') || styleOptions[0];
  current.focus();
}
function closeStyleMenu(returnFocus) {
  styleMenu.hidden = true;
  styleToggle.setAttribute('aria-expanded', 'false');
  if (returnFocus) styleToggle.focus();
}

applyStyle(root.getAttribute('data-style') || 'default');

styleToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (styleMenu.hidden) openStyleMenu();
  else closeStyleMenu(false);
});

styleOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const next = opt.dataset.styleOption;
    applyStyle(next);
    try { localStorage.setItem('style', next); } catch (e) {}
    closeStyleMenu(true);
  });
});

styleMenu.addEventListener('keydown', (e) => {
  const items = Array.from(styleOptions);
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  if (e.key === 'Escape') { e.preventDefault(); closeStyleMenu(true); }
  if (e.key === 'Tab') closeStyleMenu(false);
});

document.addEventListener('click', (e) => {
  if (!styleMenu.hidden && !styleSwitcher.contains(e.target)) closeStyleMenu(false);
});

// HUD readouts (clock + scroll position)
const hudClock = document.getElementById('hud-clock');
const hudScroll = document.getElementById('hud-scroll');

function updateHudClock() {
  hudClock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}
function updateHudScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
  hudScroll.textContent = String(pct).padStart(3, '0');
}
updateHudClock();
updateHudScroll();
setInterval(updateHudClock, 1000);
window.addEventListener('scroll', updateHudScroll, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal animation
const revealTargets = document.querySelectorAll(
  '.about-card, .highlight-card, .skill-pill, .project-card, .section-title'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));

// Project cards — click/Enter opens a modal with the full write-up
const projectCards = document.querySelectorAll('.project-card');
const projectModalOverlay = document.getElementById('project-modal-overlay');
const projectModalIcon = document.getElementById('project-modal-icon');
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalFull = document.getElementById('project-modal-full');
const projectModalTags = document.getElementById('project-modal-tags');
const projectModalServices = document.getElementById('project-modal-services');
const projectModalClose = document.getElementById('project-modal-close');
let lastFocusedCard = null;

function openProjectModal(card) {
  lastFocusedCard = card;
  projectModalIcon.innerHTML = `<i class="${card.dataset.icon}"></i>`;
  projectModalTitle.textContent = card.dataset.title;
  projectModalFull.textContent = card.dataset.full;
  projectModalTags.innerHTML = card.dataset.tags
    .split(',')
    .map(tag => `<span>${tag.trim()}</span>`)
    .join('');

  projectModalServices.innerHTML = '';
  if (card.dataset.services) {
    const services = JSON.parse(card.dataset.services);
    services.forEach(service => {
      const item = document.createElement('div');
      item.className = 'service-item';
      const title = document.createElement('h4');
      title.textContent = service.name;
      const desc = document.createElement('p');
      desc.textContent = service.desc;
      item.append(title, desc);
      projectModalServices.appendChild(item);
    });
  }

  projectModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  projectModalClose.focus();
}

function closeProjectModal() {
  projectModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocusedCard) lastFocusedCard.focus();
}

projectCards.forEach(card => {
  card.addEventListener('click', () => openProjectModal(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal(card);
    }
  });
});

projectModalClose.addEventListener('click', closeProjectModal);
projectModalOverlay.addEventListener('click', (e) => {
  if (e.target === projectModalOverlay) closeProjectModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectModalOverlay.classList.contains('open')) closeProjectModal();
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});
