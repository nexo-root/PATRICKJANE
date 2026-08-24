/* ═══════════════════════════════════════════════════════════════
   El Mentalista · Patrick Jane — motor del deck (9 slides)

   Regla de diseño: NINGUNA slide entra igual que otra. Si dos usan el
   mismo fade-in se nota, y parece plantilla.

   Teclas:  ← →  cambiar   ·   G  guion   ·   F  pantalla completa
   URL:     ?slide=N   ?static=1 (quieto, para capturas)
            ?print=1 (todas visibles, para PDF)   ?auto=1 (auto-avance)
   ═══════════════════════════════════════════════════════════════ */

const slides = [...document.querySelectorAll('.slide')];
const cajaGuion = document.getElementById('guion');
const ayuda = document.getElementById('ayuda');
const params = new URLSearchParams(location.search);

// Si GSAP no cargó, o el sistema pide menos movimiento, se muestra todo quieto.
// Vale más una diapositiva legible que una animación que no llega.
const SIN_GSAP = typeof gsap === 'undefined';
const MENOS_MOVIMIENTO = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ESTATICO = params.has('static') || SIN_GSAP || MENOS_MOVIMIENTO;
const IMPRIMIR = params.has('print');

let actual = 0;
let animando = false;

/* ── Escalado del escenario 1600x900 ─────────────────────────── */
function escalar() {
  if (IMPRIMIR) return;
  const k = Math.min(innerWidth / 1600, innerHeight / 900);
  // OJO: setProperty necesita un STRING. Pasarle el número directo hacía que
  // algunos navegadores lo guardaran como "0" -> scale(0) -> pantalla EN BLANCO.
  // Fue exactamente el bug que rompió la versión publicada en GitHub Pages.
  document.documentElement.style.setProperty('--k', String(k > 0 ? k : 1));
}
addEventListener('resize', escalar);
escalar();

/* ── Utilidades ──────────────────────────────────────────────── */

// Parte un texto en palabras envueltas, para animarlas de a una.
// GSAP core no trae SplitText y para esto alcanza.
function partirPalabras(el) {
  if (el.dataset.partido) return [...el.querySelectorAll('.pal')];
  const frag = document.createDocumentFragment();
  el.childNodes.forEach(nodo => {
    if (nodo.nodeType === 3) {
      nodo.textContent.split(/(\s+)/).forEach(t => {
        if (!t.trim()) return frag.appendChild(document.createTextNode(t));
        const s = document.createElement('span');
        s.className = 'pal'; s.style.display = 'inline-block'; s.textContent = t;
        frag.appendChild(s);
      });
    } else {
      const s = document.createElement('span');
      s.className = 'pal'; s.style.display = 'inline-block';
      s.appendChild(nodo.cloneNode(true));
      frag.appendChild(s);
    }
  });
  el.innerHTML = ''; el.appendChild(frag); el.dataset.partido = '1';
  return [...el.querySelectorAll('.pal')];
}

const q = (slide, sel) => [...slide.querySelectorAll(sel)];
const E = 'power3.out';

/* ── Una coreografía por slide ───────────────────────────────── */
const coreografias = {

  // 1 · PORTADA — la foto respira, el nombre sube tapado desde abajo.
  s1(s, tl) {
    tl.fromTo(q(s, '.foto img'), { scale: 1.15 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
      .fromTo(q(s, '.velo'), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .fromTo(q(s, '.sello'), { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: .8, ease: E }, .3)
      .fromTo(q(s, 'h1'), { yPercent: 110 }, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: .14 }, .45)
      .fromTo(q(s, '.cuerpo, .meta'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: E }, 1.15);
  },

  // 2 · FICHA — el formulario se llena fila por fila; la placa gira al final.
  s2(s, tl) {
    tl.fromTo(q(s, '.sello, h2'), { opacity: 0, x: -26 }, { opacity: 1, x: 0, duration: .7, stagger: .1, ease: E }, 0)
      .fromTo(q(s, '.ficha'), { scaleY: .04, transformOrigin: 'top' }, { scaleY: 1, duration: .55, ease: 'power2.inOut' }, .3)
      .fromTo(q(s, '.fila'), { opacity: 0 }, { opacity: 1, duration: .3, stagger: .1 }, .78)
      .fromTo(q(s, '.foto'), { opacity: 0, x: 70 }, { opacity: 1, x: 0, duration: 1, ease: 'power4.out' }, .4)
      .fromTo(s.querySelector('img[alt*="Placa"]'), { opacity: 0, scale: .5, rotate: -60 },
              { opacity: .94, scale: 1, rotate: 0, duration: .9, ease: 'back.out(1.6)' }, 1.15);
  },

  // 3 · METODO — entran de a una desde la izquierda; el sello CAE de golpe.
  s3(s, tl) {
    tl.fromTo(q(s, '.foto img'), { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .fromTo(q(s, '.sello, h2'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: E }, .1)
      .fromTo(q(s, '.tecnica'), { opacity: 0, x: -90, skewX: 8 },
              { opacity: 1, x: 0, skewX: 0, duration: .72, stagger: .17, ease: 'power4.out' }, .4)
      .fromTo(q(s, '.goma'), { opacity: 0, scale: 2.5, rotate: 24 },
              { opacity: .8, scale: 1, rotate: -13, duration: .48, ease: 'power4.in' }, 1.55);
  },

  // 4 · EVIDENCIA — cada pista DIBUJA su línea y después aparece el texto.
  s4(s, tl) {
    tl.fromTo(q(s, '.sello, h2'), { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: E }, 0)
      .fromTo(q(s, '.pista'), { scaleX: 0, transformOrigin: 'left' },
              { scaleX: 1, duration: .5, stagger: .2, ease: 'power2.inOut' }, .35)
      .fromTo(q(s, '.pista h4, .pista p'), { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: .5, stagger: .06, ease: E }, .62)
      .fromTo(q(s, '.foto'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, .5);
  },

  // 5 · RED JOHN — el smiley de sangre aparece como pintándose; el texto entra.
  s5(s, tl) {
    tl.fromTo(q(s, '.smiley'), { opacity: 0, scale: .55, rotate: -10 },
              { opacity: 1, scale: 1, rotate: 0, duration: 1.15, ease: 'back.out(1.3)' }, .2)
      .fromTo(q(s, '.sello, h2'), { opacity: 0, x: -34 }, { opacity: 1, x: 0, duration: .8, stagger: .12, ease: E }, .3)
      .fromTo(q(s, '.cuerpo, .meta'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: E }, .8);
  },

  // 6 · LA CULPA — la palabra crece, las consecuencias entran por derecha.
  s6(s, tl) {
    tl.fromTo(q(s, '.sello'), { opacity: 0 }, { opacity: 1, duration: .4 }, 0)
      .fromTo(q(s, 'h2'), { opacity: 0, scale: .82, transformOrigin: 'left center' },
              { opacity: 1, scale: 1, duration: 1, ease: 'power4.out' }, .12)
      .fromTo(q(s, '.pista'), { opacity: 0, x: 80 },
              { opacity: 1, x: 0, duration: .72, stagger: .16, ease: E }, .45)
      .fromTo(q(s, '.foto'), { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: .9, ease: 'back.out(1.2)' }, .7);
  },

  // 7 · CONDUCTISMO — el título se destapa de izquierda a derecha.
  s7(s, tl) {
    tl.fromTo(q(s, '.foto img'), { scale: 1.14 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
      .fromTo(q(s, '.sello'), { opacity: 0 }, { opacity: 1, duration: .4 }, .1)
      .fromTo(q(s, 'h2'), { clipPath: 'inset(0 100% 0 0)' },
              { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.inOut' }, .18)
      .fromTo(q(s, '.cuerpo').slice(0, 1), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .8, ease: E }, .8)
      .fromTo(q(s, '[style*="border-top"]'), { opacity: 0, scaleX: 0, transformOrigin: 'left' },
              { opacity: 1, scaleX: 1, duration: .7, ease: 'power2.inOut' }, 1.05);
  },

  // 8 · DIAGRAMA — los eslabones aparecen de a uno, las flechas después.
  s8(s, tl) {
    tl.fromTo(q(s, '.sello, h2'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: E }, 0)
      .fromTo(q(s, '.eslabon'), { opacity: 0, scale: .78, y: 30 },
              { opacity: 1, scale: 1, y: 0, duration: .6, stagger: .34, ease: 'back.out(1.5)' }, .35)
      .fromTo(q(s, '.flecha'), { opacity: 0, x: -22 },
              { opacity: 1, x: 0, duration: .42, stagger: .34, ease: E }, .62)
      .fromTo(q(s, '.foto'), { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .9, ease: E }, .7)
      .fromTo(q(s, '.cuerpo'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .7, ease: E }, 1.25);
  },

  // 9 · CIERRE — las dos mitades se cierran como un libro y sube el remate.
  s9(s, tl) {
    const izq = s.children[0], linea = s.children[1], der = s.children[2], remate = s.children[3];
    tl.fromTo(izq, { opacity: 0, x: -120 }, { opacity: 1, x: 0, duration: .9, ease: 'power4.out' }, 0)
      .fromTo(der, { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: .9, ease: 'power4.out' }, 0)
      .fromTo(linea, { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: .7, ease: 'power2.inOut' }, .45)
      .fromTo(remate, { yPercent: 100 }, { yPercent: 0, duration: .85, ease: 'power4.out' }, .6);
  }
};

/* ── Guion del orador (tecla G) ──────────────────────────────── */
const guion = {
  s1: "Portada. <b>Buenas.</b> Vamos a analizar la serie El Mentalista y a su protagonista, Patrick Jane. Yo cuento de qué va la serie y quién es el personaje; después mi compañero explica qué escuela psicológica sigue.",
  s2: "La ficha. El Mentalista sigue a Patrick Jane, un <b>ex falso médium</b> convertido en consultor de la policía de California, el CBI. Antes se ganaba la vida fingiendo que hablaba con los muertos; ahora usa las mismas técnicas para resolver homicidios.",
  s3: "El método. Cuatro herramientas: <b>observación, lectura corporal, memoria y sugestión</b>. Ninguna es un poder. Y esto es lo más importante del trabajo: <b>no tiene poderes reales, tiene atención.</b>",
  s4: "Qué mira. Resuelve crímenes leyendo detalles que los demás pasan por alto: <b>gestos</b>, una mano que tiembla; <b>contradicciones</b>, lo que dice contra lo que su cuerpo ya mostró; y <b>hábitos</b>, lo que uno repite sin darse cuenta.",
  s5: "Red John. Acá cambia el tono. El motor de la serie es su búsqueda de Red John, que <b>mató a su esposa y a su hija</b> como venganza porque Jane se burló de él en televisión. En la foto se ve su firma: la cara sonriente pintada en la pared, al lado de la taza de té de Jane.",
  s6: "La consecuencia. Esa culpa lo vuelve <b>manipulador, impulsivo y dispuesto a romper las reglas</b>. Por eso choca constantemente con la <b>agente Teresa Lisbon</b>: ella es el procedimiento y la prueba, él es el atajo.",
  s7: "Conductismo. <i>(Acá arranca tu compañero.)</i> Jane <b>no interpreta el inconsciente</b> ni hace introspección tipo Freud. Se basa en la conducta observable: gestos, tono de voz, postura, sudor, pupilas, tics.",
  s8: "El mecanismo. Deduce <b>estímulo y respuesta</b>, y con eso predice. Encuentra patrones de refuerzo, condicionamiento y aprendizaje previo. Es un observador conductista extremo: no busca entender la mente profunda, busca predecir.",
  s9: "El contraste y el cierre. El conductismo lee a alguien <b>por lo que hace</b>; el psicoanálisis, por lo que siente por dentro. Si a alguien le tiembla la mano, Jane concluye que miente; Freud preguntaría qué reprime. <b>Jane no adivina: observa, registra y predice.</b> Gracias."
};

/* ── Navegación ──────────────────────────────────────────────── */
function mostrar(i, animar = true) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  if (animando && animar) return;
  slides.forEach(s => s.classList.remove('viva'));
  const s = slides[i];
  s.classList.add('viva');
  actual = i;
  cajaGuion.innerHTML = guion[s.id] || '';
  const c = document.getElementById('cuenta');
  if (c) c.textContent = `${i + 1} / ${slides.length}`;

  const barra = s.querySelector('.barra');

  if (SIN_GSAP || !animar) {
    if (!SIN_GSAP) {
      gsap.killTweensOf(s.querySelectorAll('*'));
      gsap.set(s.querySelectorAll('*'), { clearProps: 'opacity,transform,clipPath,filter,scale' });
    }
    if (barra) barra.style.width = '100%';
    return;
  }

  gsap.killTweensOf(s.querySelectorAll('*'));
  gsap.set(s.querySelectorAll('*'), { clearProps: 'opacity,transform,clipPath,filter,scale' });

  animando = true;
  const tl = gsap.timeline({ onComplete: () => { animando = false; clearTimeout(seguro); } });
  if (barra) tl.fromTo(barra, { width: 0 }, { width: '100%', duration: 1.1, ease: 'power2.inOut' }, 0);
  (coreografias[s.id] || ((_s, t) => t.fromTo(_s.children, { opacity: 0 }, { opacity: 1, duration: .6, stagger: .08 })))(s, tl);

  // RED DE SEGURIDAD. Ninguna coreografía pasa de ~2,8 s. Si a los 4 s la línea
  // de tiempo no terminó, algo la trabó (pestaña en segundo plano, máquina lenta,
  // el navegador del colegio) y el texto quedaría INVISIBLE en plena exposición.
  // Antes que una animación linda, la diapositiva se ve.
  const seguro = setTimeout(() => {
    if (tl.progress() < 1) { tl.progress(1); animando = false; }
  }, 4000);
}

const siguiente = () => mostrar(actual + 1);
const anterior = () => mostrar(actual - 1);
const pantallaCompleta = () =>
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();

/* ── Indicador de orador: quién habla cada diapositiva ──
   Persona 1 = Felipe (diapositivas 1 a 6: quién es Jane + qué estudia).
   Persona 2 = el compañero (diapositivas 7 a 9: el conductismo).
   Se inyecta en cada slide, así también sale en el PDF. */
const PERSONA_1_HASTA = 6;   // slides 1..6 las dice la persona 1
slides.forEach((s, i) => {
  const p2 = i >= PERSONA_1_HASTA;
  const badge = document.createElement('div');
  badge.className = 'orador' + (p2 ? ' p2' : '');
  badge.innerHTML = `<span class="n">${p2 ? 2 : 1}</span>`;
  s.appendChild(badge);
});

const cuenta = document.getElementById('cuenta');

addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); siguiente(); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); anterior(); }
  else if (e.key === 'Home') mostrar(0);
  else if (e.key === 'End') mostrar(slides.length - 1);
  else if (e.key.toLowerCase() === 'g') cajaGuion.classList.toggle('abierto');
  else if (e.key.toLowerCase() === 'f') pantallaCompleta();
});

// Click en el escenario avanza; los clics en la barra de controles o el guion no.
const controles = document.getElementById('controles');
addEventListener('click', e => {
  if (cajaGuion.contains(e.target) || controles.contains(e.target)) return;
  siguiente();
});

document.getElementById('btn-prev').addEventListener('click', anterior);
document.getElementById('btn-next').addEventListener('click', siguiente);
document.getElementById('btn-full').addEventListener('click', pantallaCompleta);

/* ── Modos de arranque ───────────────────────────────────────── */
if (IMPRIMIR) {
  document.documentElement.style.setProperty('--k', 1);
  slides.forEach(s => {
    s.classList.add('viva');
    const b = s.querySelector('.barra');
    if (b) b.style.width = '100%';
  });
  ayuda.remove();
} else {
  mostrar(Math.max(0, (parseInt(params.get('slide')) || 1) - 1), !ESTATICO);
  if (ESTATICO) ayuda.remove();
  else setTimeout(() => { ayuda.style.opacity = 0; setTimeout(() => ayuda.remove(), 700); }, 5200);
  if (params.has('auto')) setInterval(() => { if (!animando) siguiente(); }, 4600);
}
