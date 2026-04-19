/* ══════════════════════════════════════════
   CCNV ESPAÑA — main.js
   Limpio, comentado y optimizado
   ══════════════════════════════════════════ */

/* ════════════════════════════════════════════
   1. HAMBURGER / MENÚ MÓVIL
   ════════════════════════════════════════════ */
(function initMobileMenu() {
  const hamburger    = document.getElementById('hamburger');
  const mobileMenu   = document.getElementById('mobileMenu');
  const closeBtn     = document.getElementById('mobileMenuClose');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  closeBtn?.addEventListener('click', closeMenu);

  // Cerrar al hacer clic en cualquier link del menú
  mobileMenu.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });
})();

/* ════════════════════════════════════════════
   2. NAVBAR — efecto al hacer scroll
   ════════════════════════════════════════════ */
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ════════════════════════════════════════════
   3. REVEAL ON SCROLL — BIDIRECCIONAL
   Aparece al bajar y reaparece al subir de nuevo.
   Usa rootMargin para activar un poco antes de que el elemento
   entre en pantalla, dando tiempo a la animación CSS.
   ════════════════════════════════════════════ */
(function initReveal() {
  // ratio: qué porcentaje del elemento debe ser visible para activar
  const THRESHOLD_IN  = 0.10; // entra cuando el 10% es visible
  const THRESHOLD_OUT = 0.00; // sale cuando ya no es visible en absoluto

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Elemento entrando en viewport → mostrar
        entry.target.classList.add('visible');
      } else {
        // Elemento saliendo de viewport → ocultar para re-animar al volver
        // Solo si ha salido completamente (intersectionRatio ≈ 0)
        if (entry.intersectionRatio <= THRESHOLD_OUT) {
          entry.target.classList.remove('visible');
        }
      }
    });
  }, {
    threshold: [THRESHOLD_OUT, THRESHOLD_IN],
    rootMargin: '0px 0px -40px 0px' // activa 40px antes del borde inferior
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════
   4. CARRUSEL DE CITAS BÍBLICAS
   - Altura fija calculada desde el slide más alto → sin layout shift
   - Transición direccional (slide izq/der) + crossfade
   - Pausa en hover, swipe táctil
   ════════════════════════════════════════════ */
(function initCarruselCitas() {
  const track         = document.getElementById('citaTrack');
  const dotsContainer = document.getElementById('citaDots');
  const prevBtn       = document.getElementById('citaPrev');
  const nextBtn       = document.getElementById('citaNext');
  const citaSection   = document.getElementById('cita');

  if (!track) return;

  const slides     = Array.from(track.querySelectorAll('.cita-slide'));
  const total      = slides.length;
  let current      = 0;
  let autoTimer    = null;
  let isAnimating  = false;
  const AUTO_DELAY = 6000;
  const ANIM_DUR   = 560; // ms — debe coincidir con la transition CSS

  /* ── Calcular y fijar la altura del track ── */
  function calcHeight() {
    // Hacemos todos los slides temporalmente visibles para medir
    slides.forEach(s => {
      s.style.position = 'relative';
      s.style.opacity  = '1';
      s.style.transform = 'none';
    });
    const maxH = Math.max(...slides.map(s => s.offsetHeight));
    slides.forEach((s, i) => {
      // Restaurar estado inicial
      s.style.position  = '';
      s.style.opacity   = i === 0 ? '1' : '0';
      s.style.transform = i === 0 ? 'translateX(0)' : 'translateX(20px)';
    });
    // Aplicar al track via CSS custom property (permite transition en height)
    track.style.setProperty('--cita-h', maxH + 'px');
    // También fijamos en el elemento directamente como fallback
    track.style.height = maxH + 'px';
  }

  // Calcular en load y en resize (debounced)
  calcHeight();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(calcHeight, 200);
  }, { passive: true });

  /* ── Crear dots ── */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'cita-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Versículo ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => goTo(i, i > current ? 'next' : 'prev'));
    dotsContainer.appendChild(dot);
  });

  function getDots() {
    return Array.from(dotsContainer.querySelectorAll('.cita-dot'));
  }

  function goTo(index, direction = 'next') {
    if (isAnimating || index === current) return;
    isAnimating = true;

    const outSlide = slides[current];
    current = ((index % total) + total) % total;
    const inSlide  = slides[current];

    /* Slide saliente: animar hacia fuera */
    outSlide.classList.remove('active');
    outSlide.classList.add(direction === 'next' ? 'exit-right' : 'exit-left');

    /* Slide entrante: posicionar fuera y animar hacia dentro */
    inSlide.classList.add(direction === 'next' ? 'enter-right' : 'enter-left');

    // Forzar reflow para que la clase de entrada sea leída antes de animar
    void inSlide.offsetHeight;

    inSlide.classList.remove('enter-right', 'enter-left');
    inSlide.classList.add('active');

    /* Limpiar clases de salida tras la transición */
    setTimeout(() => {
      outSlide.classList.remove('exit-right', 'exit-left');
      isAnimating = false;
    }, ANIM_DUR);

    /* Actualizar dots */
    getDots().forEach((d, i) => d.classList.toggle('active', i === current));

    resetAuto();
  }

  function next() { goTo((current + 1) % total, 'next'); }
  function prev() { goTo((current - 1 + total) % total, 'prev'); }

  function startAuto() { autoTimer = setInterval(next, AUTO_DELAY); }
  function stopAuto()  { clearInterval(autoTimer); }
  function resetAuto() { stopAuto(); startAuto(); }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  /* Swipe táctil */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
  }, { passive: true });

  /* Pausar en hover */
  citaSection?.addEventListener('mouseenter', stopAuto);
  citaSection?.addEventListener('mouseleave', startAuto);

  startAuto();
})();

/* ════════════════════════════════════════════
   5. CARRUSEL DE TESTIMONIOS
   - Altura fija calculada (sin layout shift)
   - Transición direccional crossfade + slide
   - Autoplay con pausa en hover, swipe táctil
   ════════════════════════════════════════════ */
(function initCarruselTestimonios() {
  const track         = document.getElementById('testiTrack');
  const dotsContainer = document.getElementById('testiDots');
  const prevBtn       = document.getElementById('testiPrev');
  const nextBtn       = document.getElementById('testiNext');
  const section       = document.getElementById('testimonios');

  if (!track) return;

  const slides     = Array.from(track.querySelectorAll('.testi-slide'));
  const total      = slides.length;
  let current      = 0;
  let autoTimer    = null;
  let isAnimating  = false;
  const AUTO_DELAY = 7000;
  const ANIM_DUR   = 520;

  /* ── Calcular y fijar la altura del track ── */
  function calcHeight() {
    slides.forEach(s => {
      s.style.position  = 'relative';
      s.style.opacity   = '1';
      s.style.transform = 'none';
    });
    const maxH = Math.max(...slides.map(s => s.offsetHeight));
    slides.forEach((s, i) => {
      s.style.position  = '';
      s.style.opacity   = i === 0 ? '1' : '0';
      s.style.transform = i === 0 ? 'translateX(0)' : 'translateX(50px)';
    });
    track.style.setProperty('--testi-h', maxH + 'px');
    track.style.height = maxH + 'px';
  }

  calcHeight();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(calcHeight, 200);
  }, { passive: true });

  /* ── Crear dots ── */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => goTo(i, i > current ? 'next' : 'prev'));
    dotsContainer.appendChild(dot);
  });

  function getDots() {
    return Array.from(dotsContainer.querySelectorAll('.testi-dot'));
  }

  function goTo(index, direction = 'next') {
    if (isAnimating || index === current) return;
    isAnimating = true;

    const outSlide = slides[current];
    current = ((index % total) + total) % total;
    const inSlide  = slides[current];

    /* Salida */
    outSlide.classList.remove('active');
    outSlide.classList.add(direction === 'next' ? 'exit-right' : 'exit-left');

    /* Entrada: posicionar fuera del viewport */
    inSlide.classList.add(direction === 'next' ? 'enter-right' : 'enter-left');
    void inSlide.offsetHeight; // reflow
    inSlide.classList.remove('enter-right', 'enter-left');
    inSlide.classList.add('active');

    setTimeout(() => {
      outSlide.classList.remove('exit-right', 'exit-left');
      isAnimating = false;
    }, ANIM_DUR);

    getDots().forEach((d, i) => d.classList.toggle('active', i === current));
    resetAuto();
  }

  function next() { goTo((current + 1) % total, 'next'); }
  function prev() { goTo((current - 1 + total) % total, 'prev'); }

  function startAuto() { autoTimer = setInterval(next, AUTO_DELAY); }
  function stopAuto()  { clearInterval(autoTimer); }
  function resetAuto() { stopAuto(); startAuto(); }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  /* Swipe táctil */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
  }, { passive: true });

  /* Pausar en hover */
  section?.addEventListener('mouseenter', stopAuto);
  section?.addEventListener('mouseleave', startAuto);

  startAuto();
})();

/* ════════════════════════════════════════════
   6. FORMULARIO DE CONTACTO
   ════════════════════════════════════════════ */
function enviarFormulario() {
  const nombre = document.getElementById('nombre')?.value.trim();
  const email  = document.getElementById('email')?.value.trim();

  if (!nombre || !email) {
    alert('Por favor, rellena al menos el nombre y el email.');
    return;
  }

  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'block';
}