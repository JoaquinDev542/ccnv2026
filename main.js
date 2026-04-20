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
   4. VERSÍCULO BÍBLICO — Estático (sin JS necesario)
   La sección #cita ahora muestra Juan 3:16 de forma fija.
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   5. SLIDER DE TESTIMONIOS
   Desktop (≥900px): 3 visibles, avanza 1 a 1
   Móvil   (<900px): 1 visible,  avanza 1 a 1
   Autoplay · Flechas · Dots · Swipe táctil
   ════════════════════════════════════════════ */
(function initSliderTestimonios() {
  const track         = document.getElementById('testiTrack');
  const dotsContainer = document.getElementById('testiDots');
  const prevBtn       = document.getElementById('testiPrev');
  const nextBtn       = document.getElementById('testiNext');
  const section       = document.getElementById('testimonios');

  if (!track) return;

  const cards      = Array.from(track.querySelectorAll('.testi-card'));
  const total      = cards.length;
  let current      = 0;         // índice del primer card visible
  let autoTimer    = null;
  const AUTO_DELAY = 5000;

  /* ── Cuántas cards son visibles según el viewport ── */
  function getVisible() {
    return window.innerWidth >= 900 ? 3 : 1;
  }

  /* ── Número máximo de posiciones (steps) ── */
  function maxStep() {
    return total - getVisible();
  }

  /* ── Mover el track al índice 'index' ── */
  function goTo(index) {
    const vis   = getVisible();
    const max   = maxStep();
    // Clamp: no pasar de los límites
    current     = Math.max(0, Math.min(index, max));

    // Calcular el ancho de una card incluyendo su gap
    // gap es 1.25rem = 20px (igual que en CSS)
    const gap       = parseFloat(getComputedStyle(track).gap) || 20;
    const cardW     = cards[0].offsetWidth;
    const offset    = current * (cardW + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Actualizar dots
    updateDots(vis);

    // Actualizar estado de flechas
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= max;
  }

  /* ── Crear / actualizar dots ── */
  function buildDots() {
    const vis   = getVisible();
    const steps = maxStep() + 1; // número de posiciones posibles
    dotsContainer.innerHTML = '';

    for (let i = 0; i < steps; i++) {
      const dot = document.createElement('button');
      dot.className   = 'testi-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Posición ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots(vis) {
    const dots = Array.from(dotsContainer.querySelectorAll('.testi-dot'));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  /* ── Autoplay ── */
  function startAuto() {
    autoTimer = setInterval(() => {
      // Al llegar al final, vuelve al principio
      goTo(current >= maxStep() ? 0 : current + 1);
    }, AUTO_DELAY);
  }
  function stopAuto()  { clearInterval(autoTimer); }
  function resetAuto() { stopAuto(); startAuto(); }

  /* ── Flechas ── */
  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  /* ── Swipe táctil ── */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      delta < 0 ? goTo(current + 1) : goTo(current - 1);
      resetAuto();
    }
  }, { passive: true });

  /* ── Pausa en hover ── */
  section?.addEventListener('mouseenter', stopAuto);
  section?.addEventListener('mouseleave', startAuto);

  /* ── Recalcular en resize (debounced) ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Si el current queda fuera del nuevo maxStep, ajustar
      if (current > maxStep()) current = maxStep();
      buildDots();
      goTo(current);
    }, 150);
  }, { passive: true });

  /* ── Inicializar ── */
  buildDots();
  goTo(0);
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
