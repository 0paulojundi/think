/**
 * main.js – Inicializações principais
 * THINK Corporation
 */

(function () {
  'use strict';

  let particlesPaused = false;

  function isMotionSuppressed() {
    const mode = document.documentElement.getAttribute('data-motion');
    if (mode === 'none') return true;
    if (mode === 'reduced') return false;
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  async function loadComponent(placeholderId, filePath) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    try {
      const res = await fetch(filePath);
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const html = await res.text();
      placeholder.innerHTML = html;

      placeholder.querySelectorAll('script').forEach((oldScript) => {
        const newScript = document.createElement('script');
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
      });

      if (placeholderId === 'header-placeholder' && window.ThinkTheme) {
        window.ThinkTheme.apply(window.ThinkTheme.getTheme());
        window.ThinkTheme.applyA11y(window.ThinkTheme.getA11y());
      }
    } catch (err) {
      console.warn(`[THINK] Não foi possível carregar ${filePath}:`, err.message);
    }
  }

  function initNavbarScroll() {
    const handleScroll = () => {
      const navbar = document.querySelector('.think-navbar');
      if (!navbar) return;
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll('.think-nav-link').forEach((l) => l.classList.remove('active'));
            const id = entry.target.id;
            const link = document.querySelector(`.think-nav-link[href="#${id}"]`);
            if (link) link.classList.add('active');
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  }

  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor || anchor.hasAttribute('data-bs-toggle')) return;

      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.querySelector('.think-navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      const behavior = isMotionSuppressed() ? 'auto' : 'smooth';

      window.scrollTo({ top, behavior });

      const navCollapse = document.getElementById('mainNav');
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        bsCollapse?.hide();
      }
    });
  }

  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles, animId;

    const COUNT = window.innerWidth < 768 ? 36 : 72;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.35,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        life: Math.random(),
        speed: Math.random() * 0.01 + 0.005,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, createParticle);
    }

    function getColor() {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      return theme === 'dark' ? '255,255,255' : '0,0,0';
    }

    function draw() {
      if (particlesPaused || isMotionSuppressed()) {
        ctx.clearRect(0, 0, W, H);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      const color = getColor();

      particles.forEach((p) => {
        p.life += p.speed;
        const alpha = Math.abs(Math.sin(p.life)) * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.14;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    document.addEventListener('think:a11y-change', (e) => {
      const mode = e.detail?.motionMode;
      particlesPaused = mode === 'none';
      cancelAnimationFrame(animId);
      if (!particlesPaused && !isMotionSuppressed()) {
        draw();
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else if (!particlesPaused && !isMotionSuppressed()) {
        draw();
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(animId);
        init();
        if (!particlesPaused && !isMotionSuppressed()) draw();
      }, 250);
    });

    init();
    if (!particlesPaused && !isMotionSuppressed()) draw();
  }

  function initAOS() {
    if (typeof AOS === 'undefined') return;
    const mode = document.documentElement.getAttribute('data-motion');
    const disabled = isMotionSuppressed() || mode === 'none';
    AOS.init({
      duration: mode === 'reduced' ? 150 : 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: disabled,
    });
  }

  function initLazyLoad() {
    document.querySelectorAll('img:not([loading])').forEach((img) => {
      img.setAttribute('loading', 'lazy');
    });
  }

  function initTooltips() {
    if (typeof bootstrap === 'undefined') return;
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      bootstrap.Tooltip.getOrCreateInstance(el);
    });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    await loadComponent('header-placeholder', 'components/header.html');
    await loadComponent('footer-placeholder', 'components/footer.html');

    initNavbarScroll();
    initActiveLinks();
    initSmoothScroll();
    initParticles();
    initAOS();
    initLazyLoad();
    initTooltips();

    if (window.ThinkTheme) {
      window.ThinkTheme.apply(window.ThinkTheme.getTheme());
      window.ThinkTheme.applyA11y(window.ThinkTheme.getA11y());
    }

    console.info('[THINK Corporation] Site inicializado com sucesso. 🚀');
  });
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((reg) => console.log('Service Worker registrado com sucesso:', reg.scope))
      .catch((err) => console.error('Falha ao registrar o Service Worker:', err));
  });
}
