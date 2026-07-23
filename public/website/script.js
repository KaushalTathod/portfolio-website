/* ============================================================
   PORTFOLIO — behaviour layer
   Pairs with the enhanced style.css. No external dependencies.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------------------------------------------------
     0. Number the Experience section's card badges (01, 02…)
  --------------------------------------------------------- */
  document.querySelectorAll('.experience .timeline-dot').forEach((dot, i) => {
    dot.setAttribute('data-index', String(i + 1).padStart(2, '0'));
  });

  /* ---------------------------------------------------------
     1. Loader — hide once the page has finished loading
  --------------------------------------------------------- */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 300);
    });
    // Safety net in case 'load' already fired before this script ran
    if (document.readyState === 'complete') {
      setTimeout(() => loader.classList.add('hidden'), 300);
    }
  }

  /* ---------------------------------------------------------
     2. Navbar: scrolled state + active link highlighting
  --------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const navLinks = document.querySelectorAll('#navMenu ul li a[href^="#"]');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  /* ---------------------------------------------------------
     3. Mobile menu toggle
  --------------------------------------------------------- */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenuList = document.querySelector('#navMenu ul');
  if (mobileToggle && navMenuList) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenuList.classList.toggle('open');
    });
    navMenuList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenuList.classList.remove('open');
      });
    });
  }

  /* ---------------------------------------------------------
     4. Theme toggle (persisted in localStorage)
  --------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next === 'light' ? '' : next);
      if (next === 'light') root.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', next === 'light' ? '' : next);

      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

      themeToggle.classList.remove('spin');
      void themeToggle.offsetWidth; // restart animation
      themeToggle.classList.add('spin');
    });
  }

/* ---------------------------------------------------------
   5. Custom cursor (desktop only) — simple, single dot
--------------------------------------------------------- */
if (!isTouch && !prefersReducedMotion) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });

    document.querySelectorAll('a, button, .service-card, .portfolio-item').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
}

// o

  /* ---------------------------------------------------------
     6. Scroll-reveal (stats, timeline, services, portfolio, blog…)
  --------------------------------------------------------- */
  function revealAndUnobserve(entries, obs) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }

  const revealObserver = new IntersectionObserver(revealAndUnobserve, { threshold: 0.2 });
  document.querySelectorAll(
    '.section-header, .stat-item, .timeline, .timeline-item, .service-card, .portfolio-item, .blog-card, .reveal-up'
  ).forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------
     7. Animated stat counters (data-count="123")
  --------------------------------------------------------- */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    const suffix = (el.textContent.match(/[^\d]+$/) || [''])[0];
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const num = entry.target.querySelector('.stat-number[data-count]');
        if (num && !num.dataset.counted) {
          num.dataset.counted = 'true';
          prefersReducedMotion
            ? (num.textContent = num.getAttribute('data-count') + (num.textContent.match(/[^\d]+$/) || [''])[0])
            : animateCount(num);
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-item').forEach(el => countObserver.observe(el));

  /* ---------------------------------------------------------
     8. Animated skill progress bars (data-percent="85")
  --------------------------------------------------------- */
  const skillObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.progress-fill');
        if (fill) {
          const pct = fill.getAttribute('data-width') || fill.getAttribute('data-percent') || '0';
          requestAnimationFrame(() => { fill.style.width = pct + '%'; });
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.skill-item').forEach(el => skillObserver.observe(el));

  /* ---------------------------------------------------------
     9. Portfolio filter
  --------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';

      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category') || '';
        const matches = filter === 'all' || category === filter;

        if (matches) {
          item.style.display = '';
          requestAnimationFrame(() => item.classList.remove('filtering-out'));
        } else {
          item.classList.add('filtering-out');
          setTimeout(() => { if (item.classList.contains('filtering-out')) item.style.display = 'none'; }, 300);
        }
      });
    });
  });

  /* ---------------------------------------------------------
     10. Lightbox
  --------------------------------------------------------- */
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-content');
  const closeLightbox = document.querySelector('.close-lightbox');

  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('show');
      }
    });
  });

  function hideLightbox() { if (lightbox) lightbox.classList.remove('show'); }
  if (closeLightbox) closeLightbox.addEventListener('click', hideLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox(); });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideLightbox(); });

  /* ---------------------------------------------------------
     11. Testimonial slider
  --------------------------------------------------------- */
  const track = document.querySelector('.testimonial-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsWrap = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.slider-btn.prev, [data-slider="prev"]');
  const nextBtn = document.querySelector('.slider-btn.next, [data-slider="next"]');

  if (track && cards.length) {
    let current = 0;
    let dots = [];

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      cards.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
      dots = Array.from(dotsWrap.children);
    }

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    let autoplay = setInterval(() => goTo(current + 1), 6000);
    track.closest('.testimonial-slider')?.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.closest('.testimonial-slider')?.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goTo(current + 1), 6000);
    });
  }

  /* ---------------------------------------------------------
     12. Back to top button
  --------------------------------------------------------- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     13. Scroll progress bar
  --------------------------------------------------------- */
  let progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
  }
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------------
     14. Contact form validation (client-side, non-blocking)
  --------------------------------------------------------- */
  const contactForm = document.querySelector('.contact-form-container form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      let valid = true;

      contactForm.querySelectorAll('.form-group').forEach(group => {
        const field = group.querySelector('input, textarea');
        if (!field) return;
        group.classList.remove('error');

        const isEmpty = field.hasAttribute('required') && !field.value.trim();
        const isBadEmail = field.type === 'email' && field.value && !/^\S+@\S+\.\S+$/.test(field.value);

        if (isEmpty || isBadEmail) {
          group.classList.add('error');
          valid = false;
        }
      });

      if (!valid) {
        e.preventDefault();
        return;
      }

      // Let the form submit normally if it has a real action;
      // otherwise show an inline success message instead of a hard navigation.
      if (!contactForm.getAttribute('action')) {
        e.preventDefault();
        const success = contactForm.querySelector('.form-success');
        if (success) {
          success.classList.add('show');
          contactForm.reset();
          setTimeout(() => success.classList.remove('show'), 4000);
        }
      }
    });

    // clear error state as the person starts fixing a field
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => field.closest('.form-group')?.classList.remove('error'));
    });
  }

  /* ---------------------------------------------------------
     15. Footer year (optional element: <span id="year"></span>)
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});

// proffesion
document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('proffesion');
    if (!el) return;

    const phrases = el.dataset.phrases.split('|').map(p => p.trim()).filter(Boolean);

    // Sirf ek hi phrase hai to animation ki zaroorat nahi
    if (phrases.length <= 1) return;

    // Reduced motion users ke liye animation skip
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typingSpeed = 100;
    const deletingSpeed = 30;
    const pauseAfterType = 1600;
    const pauseAfterDelete = 400;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            charIndex--;
            el.textContent = currentPhrase.substring(0, charIndex);
        } else {
            charIndex++;
            el.textContent = currentPhrase.substring(0, charIndex);
        }

        let delay = isDeleting ? deletingSpeed : typingSpeed;

        if (!isDeleting && charIndex === currentPhrase.length) {
            delay = pauseAfterType;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = pauseAfterDelete;
        }

        setTimeout(type, delay);
    }

    type();
});

document.addEventListener('DOMContentLoaded', () => {
    const layer = document.getElementById('starsLayer');
    if (!layer) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ===== Background twinkling stars =====
    const starCount = window.innerWidth < 768 ? 60 : 120;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1; // 1px - 3px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.setProperty('--dur', `${2 + Math.random() * 3}s`);
        star.style.setProperty('--delay', `${Math.random() * 4}s`);
        layer.appendChild(star);
    }

    // ===== Shooting stars =====
const shootingStarCount = 6;
for (let i = 0; i < shootingStarCount; i++) {
    const shoot = document.createElement('div');
    shoot.className = 'shooting-star';
    
    const duration = 5 + Math.random() * 3; // 5-8s
    
    shoot.style.setProperty('--start-top', `${Math.random() * 40}%`);
    shoot.style.setProperty('--start-left', `${Math.random() * 40}%`);
    shoot.style.setProperty('--duration', `${duration}s`);
    shoot.style.setProperty('--delay', `-${Math.random() * duration}s`); // NEGATIVE delay
    layer.appendChild(shoot);
}
});