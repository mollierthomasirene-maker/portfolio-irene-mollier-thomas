// Carrousel réutilisable : flèches, points, swipe tactile.
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel__track');
  const slides = Array.from(carousel.querySelectorAll('.carousel__slide'));
  const prevBtn = carousel.querySelector('.carousel__btn--prev');
  const nextBtn = carousel.querySelector('.carousel__btn--next');
  const dotsContainer = carousel.querySelector('.carousel__dots');
  if (!track || slides.length === 0) return;

  let index = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Aller à l'image ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  function goTo(i) {
    carousel.querySelectorAll('video').forEach(video => video.pause());
    index = (i + slides.length) % slides.length;
    update();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

  let startX = null;
  track.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  track.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? 1 : -1));
    startX = null;
  });

  update();
});

// Lightbox : cliquer sur une image du carrousel pour la voir en grand
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button type="button" class="lightbox__close" aria-label="Fermer l'image">&times;</button>
  <img class="lightbox__img" src="" alt="">
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('.lightbox__img');
const lightboxClose = lightbox.querySelector('.lightbox__close');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.classList.remove('is-zoomed');
  lightboxImg.classList.remove('is-zoomed');
  lightbox.classList.add('is-open');
  document.body.classList.add('lightbox-open');
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.classList.remove('is-zoomed');
  lightboxImg.classList.remove('is-zoomed');
  document.body.classList.remove('lightbox-open');
}

document.querySelectorAll('.carousel__slide img').forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src, img.alt));
});

lightboxImg.addEventListener('click', (e) => {
  e.stopPropagation();
  const zoomed = lightboxImg.classList.toggle('is-zoomed');
  lightbox.classList.toggle('is-zoomed', zoomed);
  lightbox.scrollTop = 0;
  lightbox.scrollLeft = 0;
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
