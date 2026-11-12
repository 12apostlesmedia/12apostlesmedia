// 0) Animación de inicio: el arco se acerca y revela el fresco a pantalla completa
const inicio = document.querySelector('.s-inicio');
const sinAnimaciones = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Tiempos de cada paso en milisegundos (cámbialos para hacerla más rápida o más lenta)
const pasos = [
  ['paso-1', 100],   // aparece el arco con las nubes
  ['paso-2', 450],   // la cámara se acerca al arco mientras aparece la luz
  ['paso-3', 1550],  // el destello cubre el final del acercamiento
  ['paso-4', 2200],  // el destello se apaga y aparece el contenido
];
function empezarIntro() {
  if (sinAnimaciones) {
    pasos.forEach(([clase]) => inicio.classList.add(clase));
    return;
  }
  pasos.forEach(([clase, ms]) => setTimeout(() => inicio.classList.add(clase), ms));
}
// Espera a que las imágenes del inicio estén cargadas para que la animación no salga a trozos
Promise.all([...inicio.querySelectorAll('img')].map((img) =>
  img.complete ? Promise.resolve() : new Promise((ok) => { img.onload = img.onerror = ok; })
)).then(empezarIntro);

// 1) Textos que aparecen al hacer scroll
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.revelar').forEach((el) => observador.observe(el));

// 2) Animación de contacto al entrar en pantalla
const contacto = document.querySelector('.contacto');
if (contacto) {
  if ('IntersectionObserver' in window && !sinAnimaciones) {
    contacto.classList.add('motion-ready');
    const observadorContacto = new IntersectionObserver((entradas, observer) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        contacto.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observadorContacto.observe(contacto);
  } else {
    contacto.classList.add('is-visible');
  }
}

// 3) Carrusel de celulares: flechas para pasar de celular
const carrusel = document.querySelector('#carrusel');
const flechaAnterior = document.querySelector('.carrusel-anterior');
const flechaSiguiente = document.querySelector('.carrusel-siguiente');
if (carrusel) {
  // oculta la flecha cuando ya no se puede seguir en esa dirección
  const actualizarFlechas = () => {
    const maximo = carrusel.scrollWidth - carrusel.clientWidth;
    flechaAnterior.disabled = carrusel.scrollLeft <= 1;
    flechaSiguiente.disabled = maximo - carrusel.scrollLeft <= 1;
  };
  flechaAnterior.addEventListener('click', () => carrusel.scrollBy({ left: -carrusel.clientWidth * 0.8 }));
  flechaSiguiente.addEventListener('click', () => carrusel.scrollBy({ left: carrusel.clientWidth * 0.8 }));
  carrusel.addEventListener('scroll', actualizarFlechas, { passive: true });
  window.addEventListener('resize', actualizarFlechas);
  actualizarFlechas();
}

// 4) Ventana con los posts: al tocar un celular se abre con los posts de esa marca
//    Los posts están en img/celulares/<marca>/posts/01.webp, 02.webp... (data-posts dice cuántos hay)
const ventana = document.querySelector('#ventana-posts');
if (ventana) {
  const titulo = ventana.querySelector('#ventana-titulo');
  const grilla = ventana.querySelector('.ventana-grilla');

  document.querySelectorAll('.celular-boton').forEach((boton) => {
    boton.addEventListener('click', () => {
      const marca = boton.dataset.brand;
      const nombre = boton.dataset.name;
      const cantidad = Number(boton.dataset.posts) || 0;
      titulo.textContent = nombre;
      grilla.replaceChildren(...Array.from({ length: cantidad }, (_, i) => {
        const img = document.createElement('img');
        img.src = `img/celulares/${marca}/posts/${String(i + 1).padStart(2, '0')}.webp`;
        img.alt = `Post de ${nombre}`;
        img.loading = 'lazy';
        return img;
      }));
      ventana.showModal();
      ventana.scrollTop = 0;
    });
  });

  ventana.querySelector('.ventana-cerrar').addEventListener('click', () => ventana.close());
  // cerrar tocando fuera de la ventana
  ventana.addEventListener('click', (e) => { if (e.target === ventana) ventana.close(); });
}

// 5) Servicios: cuando una tarjeta queda tapada por la siguiente, se achica y oscurece un poco
const servicios = [...document.querySelectorAll('.servicio')];
function apilarServicios() {
  servicios.forEach((tarjeta, i) => {
    const siguiente = servicios[i + 1];
    if (!siguiente) return;
    const arriba = tarjeta.getBoundingClientRect().top;
    const sig = siguiente.getBoundingClientRect().top;
    // p = 0 cuando la siguiente está lejos, 1 cuando ya la tapó
    const p = Math.min(Math.max(1 - (sig - arriba) / window.innerHeight, 0), 1);
    tarjeta.style.transform = `scale(${1 - p * 0.06})`;
    tarjeta.style.filter = `brightness(${1 - p * 0.35})`;
  });
}
window.addEventListener('scroll', apilarServicios, { passive: true });
apilarServicios();

// Si una tarjeta es más alta que la pantalla, se queda pegada más arriba
// para que se vea entera (con su descripción) antes de que la tape la siguiente
function ajustarTarjetas() {
  servicios.forEach((tarjeta) => {
    tarjeta.style.top = '';                                   // vuelve al valor del CSS
    const arribaNormal = parseFloat(getComputedStyle(tarjeta).top);
    const sobra = window.innerHeight - tarjeta.offsetHeight - 16;
    tarjeta.style.top = `${Math.min(arribaNormal, sobra)}px`;
  });
}
window.addEventListener('resize', ajustarTarjetas);
window.addEventListener('load', ajustarTarjetas);
ajustarTarjetas();
