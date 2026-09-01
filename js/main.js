/**
 * Brampton FBLC - Ultra-Smooth High Performance Animation Engine
 * Optimized for 60-120 FPS buttery smooth rendering
 */

document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initNavbar();
  initMobileMenu();
  initScrollReveals();
  initCounters();
  initOptimizedParticles();
  initOptimizedParallax();
  initTeamFilters();
});

/* --- Fast Page Transitions --- */
function initPageTransitions() {
  const pt = document.getElementById('pt');
  if (pt) {
    document.body.classList.remove('pt-in');
    document.body.classList.add('pt-out');
  }

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('http') && !link.target) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('pt-out');
        document.body.classList.add('pt-in');
        setTimeout(() => {
          window.location.href = href;
        }, 220);
      });
    }
  });
}

/* --- Throttled Navbar Scroll --- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 30) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobMenu = document.getElementById('mob-menu');
  if (!hamburger || !mobMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobMenu.classList.toggle('open');
  });

  mobMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobMenu.classList.remove('open');
    });
  });
}

/* --- Intersection Observer Scroll Reveals --- */
function initScrollReveals() {
  const elements = document.querySelectorAll('.reveal, .rev-l, .rev-r, .rev-s');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        // Unobserve once visible for zero CPU overhead
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* --- Animated Number Counters --- */
function initCounters() {
  const counterEls = document.querySelectorAll('[data-count]');
  if (!counterEls.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  counterEls.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1400;
  const start = performance.now();
  const suffix = el.getAttribute('data-suffix') || '';

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

/* --- Lightweight GPU-Accelerated Canvas Particles (Zero ShadowBlur) --- */
function initOptimizedParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  }, { passive: true });

  // Moderate particle count for 120 FPS
  const count = Math.min(Math.floor(width / 35), 45);
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.35 + 0.1),
      alpha: Math.random() * 0.4 + 0.2
    });
  }

  let isVisible = true;
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  function render() {
    if (!isVisible) {
      requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Draw connecting lines in a single batched path
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < count; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 10000) { // 100px threshold squared
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
    }
    ctx.strokeStyle = 'rgba(74, 159, 216, 0.07)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 2. Draw particles in a single batched path
    ctx.fillStyle = 'rgba(74, 159, 216, 0.45)';
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.moveTo(p.x + p.r, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    }
    ctx.fill();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* --- RAF-Debounced Parallax Engine --- */
function initOptimizedParallax() {
  const bg = document.querySelector('.skyline-bg');
  if (!bg) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovering = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 12;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
    if (!isHovering) {
      isHovering = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  function updateParallax() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    bg.style.transform = `scale(1.04) translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

    if (Math.abs(mouseX - currentX) > 0.05 || Math.abs(mouseY - currentY) > 0.05) {
      requestAnimationFrame(updateParallax);
    } else {
      isHovering = false;
    }
  }
}

/* --- Team Hierarchy & Category Filter Engine --- */
function initTeamFilters() {
  const filterBtns = document.querySelectorAll('.team-filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-filter');
      
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const chartSection = document.getElementById('org-chart-section');
      const bodSection = document.getElementById('bod-section');
      const srBoaSection = document.getElementById('sr-boa-section');
      const boaSection = document.getElementById('boa-section');

      if (target === 'chart') {
        if (chartSection) {
          chartSection.style.display = 'block';
          chartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (bodSection) bodSection.style.display = 'block';
        if (srBoaSection) srBoaSection.style.display = 'block';
        if (boaSection) boaSection.style.display = 'block';
      } else if (target === 'all') {
        if (chartSection) chartSection.style.display = 'block';
        if (bodSection) bodSection.style.display = 'block';
        if (srBoaSection) srBoaSection.style.display = 'block';
        if (boaSection) boaSection.style.display = 'block';
      } else if (target === 'bod') {
        if (chartSection) chartSection.style.display = 'none';
        if (bodSection) {
          bodSection.style.display = 'block';
          bodSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (srBoaSection) srBoaSection.style.display = 'none';
        if (boaSection) boaSection.style.display = 'none';
      } else if (target === 'sr-boa') {
        if (chartSection) chartSection.style.display = 'none';
        if (bodSection) bodSection.style.display = 'none';
        if (srBoaSection) {
          srBoaSection.style.display = 'block';
          srBoaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (boaSection) boaSection.style.display = 'none';
      } else if (target === 'boa') {
        if (chartSection) chartSection.style.display = 'none';
        if (bodSection) bodSection.style.display = 'none';
        if (srBoaSection) srBoaSection.style.display = 'none';
        if (boaSection) {
          boaSection.style.display = 'block';
          boaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}
