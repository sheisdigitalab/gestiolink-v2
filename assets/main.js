const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Menú móvil */
const header = document.querySelector('.header');
const menuBtn = document.querySelector('.menu-btn');
const mnav = document.getElementById('mnav');
const setMenu = open => {
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.classList.toggle('menu-open', open);
  if (open) {
    mnav.hidden = false;
    requestAnimationFrame(() => mnav.classList.add('is-open'));
    mnav.querySelector('a').focus({ preventScroll: true });
  } else {
    mnav.classList.remove('is-open');
    setTimeout(() => { if (menuBtn.getAttribute('aria-expanded') === 'false') mnav.hidden = true; }, reduceMotion ? 0 : 300);
  }
};
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (menuBtn.getAttribute('aria-expanded') !== 'true') return;
  if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); }
  if (e.key === 'Tab') {
    // El foco se queda dentro del menú (botón de cerrar incluido)
    const items = [menuBtn, ...mnav.querySelectorAll('a')];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
  }
});
window.matchMedia('(min-width: 1081px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* Cabecera compacta al bajar */
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

document.getElementById('year').textContent = new Date().getFullYear();

/* Aparición de bloques al hacer scroll */
const revealTargets = document.querySelectorAll([
  '.section__head', '.prog > *', '.process__step', '.finder', '.tile', '.row',
  '.value', '.dl', '.cli > *', '.checks li', '.about > *', '.products > *',
  '.warranty', '.welcome__text', '.welcome__media', '.quote .wrap', '.cta__box', '.facts li', '.contact > *', '.remote > *', '.collage'
].join(','));

if (!reduceMotion) {
  // Comprobación directa en scroll (sin depender de IntersectionObserver):
  // lo que ya está en pantalla se muestra al momento, nunca queda nada oculto.
  let pending = [...revealTargets];
  pending.forEach(el => {
    const i = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
  });
  const check = () => {
    const limit = window.innerHeight * 0.92;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); return false; }
      return true;
    });
    if (!pending.length) window.removeEventListener('scroll', check);
  };
  const below = [...revealTargets].filter(el => el.getBoundingClientRect().top >= window.innerHeight * 0.92);
  below.forEach(el => el.classList.add('reveal'));
  pending = below;
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  document.addEventListener('visibilitychange', check);
}

/* Contadores de cifras */
const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const co = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count;
      const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1400;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      co.unobserve(el);
    });
  }, { threshold: .6 });
  counters.forEach(c => co.observe(c));
}

/* Tarjeta de la portada que va mostrando trabajo real */
const ticker = document.querySelector('[data-ticker]');
if (ticker && !reduceMotion) {
  const card = ticker.closest('.float');
  const title = card.querySelector('[data-ticker-title]');
  const feed = [
    ['Incidencia resuelta', 'Impresora de recepción · 11:42, en remoto'],
    ['Copia verificada', 'Servidor de oficina · 12:05, sin errores'],
    ['Equipo configurado', 'Portátil nuevo listo para usar · 12:30'],
    ['Wifi resuelto', 'Sala de reuniones · en 8 minutos'],
    ['Factura emitida', 'Programa de gestión · F-0915 enviada']
  ];
  let n = 0;
  setInterval(() => {
    card.classList.add('ticking');
    setTimeout(() => {
      n = (n + 1) % feed.length;
      [title.textContent, ticker.textContent] = feed[n];
      card.classList.remove('ticking');
    }, 300);
  }, 3200);
}

/* Profundidad al mover el ratón sobre la portada */
document.querySelectorAll('[data-parallax]').forEach(scene => {
  if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
  const layers = scene.querySelectorAll('[data-depth]');
  scene.closest('section').addEventListener('pointermove', e => {
    const r = scene.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    layers.forEach(l => {
      const d = +l.dataset.depth;
      l.style.setProperty('--px', `${(-x * d).toFixed(1)}px`);
      l.style.setProperty('--py', `${(-y * d).toFixed(1)}px`);
    });
  });
});

/* Cinta de servicios con botón de pausa */
const marquee = document.querySelector('.marquee');
if (marquee) {
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z"/></svg>';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'marquee__toggle';
  const sync = () => {
    const paused = marquee.classList.contains('paused');
    btn.innerHTML = paused ? playIcon : pauseIcon;
    btn.setAttribute('aria-label', paused ? 'Reanudar la cinta de servicios' : 'Pausar la cinta de servicios');
  };
  btn.addEventListener('click', () => { marquee.classList.toggle('paused'); sync(); });
  if (reduceMotion) marquee.classList.add('paused');
  sync();
  marquee.appendChild(btn);
}

/* ¿Qué necesita tu empresa? */
const finder = document.querySelector('[data-finder]');
if (finder) {
  const data = {
    programa: {
      img: 'colegas.jpg', title: 'Programa de gestión a medida',
      text: 'Facturación, almacén y clientes en una sola herramienta hecha para tu forma de trabajar, con plazos y precio cerrado.',
      list: ['Facturas y albaranes conectados', 'Control de stock y pedidos', 'Migramos tus datos actuales'],
      more: 'servicios.html#programas-a-medida', cta: 'Pedir presupuesto'
    },
    mantenimiento: {
      img: 'llamada.jpg', title: 'Mantenimiento informático',
      text: 'Una cuota ajustada a tu empresa para que tus equipos no fallen y, si lo hacen, se resuelva el mismo día.',
      list: ['Soporte inmediato por teléfono o en remoto', 'Revisiones y copias preventivas', 'Prioridad para ir a tu oficina'],
      more: 'servicios.html#mantenimiento', cta: 'Calcular mi cuota'
    },
    redes: {
      img: 'redes.jpg', title: 'Redes y cableado',
      text: 'Diseñamos e instalamos la red de tu oficina, cableada y wifi, ordenada y documentada para que crezca contigo.',
      list: ['Estudio de tu oficina', 'Cableado estructurado y wifi', 'Documentación de toda la instalación'],
      more: 'servicios.html#redes', cta: 'Pedir presupuesto'
    },
    tecnico: {
      img: 'tecnico.jpg', title: 'Servicio técnico',
      text: 'Reparamos, ampliamos y mejoramos portátiles, sobremesas, pantallas e impresoras, en taller o en tu oficina.',
      list: ['Diagnóstico rápido', 'Ampliaciones de memoria y disco', 'Garantía en cada reparación'],
      more: 'servicios.html#tecnico', cta: 'Pedir cita'
    },
    equipos: {
      img: 'equipos.jpg', title: 'Equipos y periféricos',
      text: 'Te asesoramos y te instalamos ordenadores, servidores, impresoras y consumibles de primeras marcas, listos para trabajar.',
      list: ['Distribuidores oficiales', 'Configurado e instalado', 'Precios ajustados'],
      more: 'servicios.html#hardware', cta: 'Pedir presupuesto'
    },
    urgente: {
      img: 'soporte.jpg', title: 'Soporte remoto inmediato',
      text: 'Descarga el programa de soporte, llámanos al 607 640 200 y nos conectamos a tu equipo en minutos.',
      list: ['Sin esperas ni desplazamientos', 'Ves en todo momento lo que hacemos', 'El 99 % se resuelve el mismo día'],
      more: 'programas.html', cta: 'Llamar ahora', href: 'tel:+34607640200'
    }
  };
  const card = finder.querySelector('.finder__card');
  const f = k => card.querySelector(`[data-f="${k}"]`);
  const arrow = f('cta').querySelector('svg').outerHTML;
  finder.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      finder.querySelectorAll('.chip-btn').forEach(c => c.setAttribute('aria-pressed', c === chip));
      const d = data[chip.dataset.key];
      card.classList.add('swap');
      setTimeout(() => {
        f('img').src = `assets/img/${d.img}`;
        f('title').textContent = d.title;
        f('text').textContent = d.text;
        f('list').innerHTML = d.list.map(t => `<li>${t}</li>`).join('');
        f('cta').innerHTML = `${d.cta} ${arrow}`;
        f('cta').href = d.href || `contacto.html?servicio=${chip.dataset.key}`;
        f('more').href = d.more;
        card.classList.remove('swap');
      }, reduceMotion ? 0 : 220);
    });
  });
}

/* Formulario de contacto */
const form = document.getElementById('form');
if (form) {
  const pre = new URLSearchParams(location.search).get('servicio');
  const select = form.querySelector('#f-topic');
  if (pre && select.querySelector(`option[value="${pre}"]`)) select.value = pre;
  if (pre === 'urgente') select.value = 'tecnico';

  form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = form.querySelector('.form__msg');
    if (!form.checkValidity()) {
      msg.textContent = 'Revisa tu nombre, tu email y acepta la política de privacidad.';
      form.querySelector(':invalid').focus();
      return;
    }
    msg.textContent = 'Gracias. Te respondemos enseguida.';
    form.reset();
  });
}

/* Navegación de página (servicios y textos legales): marca el apartado visible */
document.querySelectorAll('.subnav, .toc').forEach(nav => {
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = () => {
    const line = window.innerHeight * 0.35;
    let current = targets[0];
    targets.forEach(t => { if (t.getBoundingClientRect().top <= line) current = t; });
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + current.id;
      a.setAttribute('aria-current', on);
      if (on && nav.classList.contains('subnav')) {
        const ul = a.closest('ul');
        const r = a.getBoundingClientRect(), u = ul.getBoundingClientRect();
        if (r.left < u.left || r.right > u.right) ul.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();
});

/* Vídeo de bienvenida: se carga solo al pulsar reproducir */
document.querySelectorAll('.welcome__video').forEach(box => {
  const video = box.querySelector('video');
  box.querySelector('.welcome__play').addEventListener('click', () => {
    video.controls = true;
    box.classList.add('playing');
    video.play();
  });
});
