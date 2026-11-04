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
