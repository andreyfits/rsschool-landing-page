/* Slider (index page): cyclic arrows + dots, pointer swipe (needed ≤640px) */
export function initSlider() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const track = slider.querySelector('.slider__track');
  const viewport = slider.querySelector('.slider__viewport');
  const slides = [...slider.querySelectorAll('.slider__slide')];
  const dots = [...document.querySelectorAll('.slider__dot')];
  const prevBtn = slider.querySelector('.slider__arrow--prev');
  const nextBtn = slider.querySelector('.slider__arrow--next');

  const count = slides.length;
  if (!track || !viewport || !count) return;

  let current = 0;
  const SWIPE_THRESHOLD = 50;

  const goTo = (index) => {
    current = ((index % count) + count) % count;
    track.style.transform = `translateX(${-current * 100}%)`;

    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('slider__dot--active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  /* touch / pointer swipe */
  let startX = null;

  viewport.addEventListener('pointerdown', ({ clientX }) => {
    startX = clientX;
    track.style.transition = 'none';
  });

  viewport.addEventListener('pointermove', ({ clientX }) => {
    if (startX === null) return;
    const dx = clientX - startX;
    track.style.transform = `translateX(calc(${-current * 100}% + ${dx}px))`;
  });

  const endDrag = ({ clientX }) => {
    if (startX === null) return;
    const dx = clientX - startX;
    startX = null;
    track.style.transition = '';
    goTo(Math.abs(dx) > SWIPE_THRESHOLD ? current + (dx < 0 ? 1 : -1) : current);
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', endDrag);

  goTo(0);
}
