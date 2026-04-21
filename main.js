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
/* ════════════════════════════════════════════
   6. FORMULARIO DE CONTACTO — con Google Sheets
   ════════════════════════════════════════════ */

// ⚠️ SUSTITUYE ESTA URL POR LA QUE COPIASTE EN EL PASO 3
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbywSxIeTilPGnC68iulsD8xfi9z2pxRXpY5LPzD-YkQUPZZxDqnvGuCX4DT1bdMRQC_/exec';

function enviarFormulario() {

  // ── Obtener referencias a los elementos ──
  const nombreInput  = document.getElementById('nombre');
  const emailInput   = document.getElementById('email');
  const ciudadInput  = document.getElementById('ciudad');
  const interesInput = document.getElementById('interes');
  const mensajeInput = document.getElementById('mensaje');
  const submitBtn    = document.querySelector('.btn-submit');

  // ── Limpiar errores anteriores ──
  limpiarErrores();

  // ── Validar ──
  const esValido = validarFormulario(nombreInput, emailInput);
  if (!esValido) return; // Detener si hay errores

  // ── Recoger datos ──
  const datos = {
    nombre  : nombreInput.value.trim(),
    email   : emailInput.value.trim(),
    ciudad  : ciudadInput?.value.trim()  || '',
    interes : interesInput?.value        || '',
    mensaje : mensajeInput?.value.trim() || ''
  };

  // ── Deshabilitar botón mientras se envía ──
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Enviando…';

  // ── Enviar a Google Sheets vía Apps Script ──
  fetch(APPS_SCRIPT_URL, {
    method      : 'POST',
    // Apps Script no acepta application/json en modo no-cors,
    // por eso usamos text/plain pero enviamos JSON como texto
    headers     : { 'Content-Type': 'text/plain' },
    body        : JSON.stringify(datos),
    mode        : 'no-cors' // necesario para evitar error CORS con Apps Script
  })
  .then(() => {
    // 'no-cors' siempre llega aquí aunque haya error en el script,
    // así que mostramos éxito si no hubo error de red
    mostrarExito();
  })
  .catch((error) => {
    console.error('Error al enviar:', error);
    mostrarErrorEnvio();
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Enviar mensaje →';
  });
}

/* ── Validación ── */
function validarFormulario(nombreInput, emailInput) {
  let valido = true;

  // Validar nombre
  if (!nombreInput.value.trim()) {
    mostrarError(nombreInput, 'El nombre es obligatorio.');
    valido = false;
  }

  // Validar email
  const emailVal   = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailVal) {
    mostrarError(emailInput, 'El email es obligatorio.');
    valido = false;
  } else if (!emailRegex.test(emailVal)) {
    mostrarError(emailInput, 'Introduce un email válido (ej: nombre@dominio.com).');
    valido = false;
  }

  return valido;
}

/* ── Mostrar un error bajo el campo ── */
function mostrarError(input, mensaje) {
  input.classList.add('input-error');
  const p       = document.createElement('p');
  p.className   = 'form-error-msg';
  p.textContent = mensaje;
  p.setAttribute('role', 'alert');
  input.parentNode.appendChild(p);
}

/* ── Limpiar todos los errores ── */
function limpiarErrores() {
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  document.querySelectorAll('.form-error-msg').forEach(el => el.remove());
}

/* ── Mostrar mensaje de éxito ── */
function mostrarExito() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'block';
}

/* ── Mostrar mensaje de error de red ── */
function mostrarErrorEnvio() {
  const form = document.getElementById('contactForm');
  // Insertar alerta de error al final del formulario si no existe ya
  if (!document.getElementById('formErrorMsg')) {
    const div       = document.createElement('div');
    div.id          = 'formErrorMsg';
    div.className   = 'form-send-error';
    div.setAttribute('role', 'alert');
    div.textContent = '❌ Hubo un problema al enviar. Por favor, inténtalo de nuevo o escríbenos directamente a ccnvespanya@gmail.com';
    form.appendChild(div);
  }
}
