(() => {
  'use strict';
  const slider = document.querySelector('.partition-slider');
  if (!slider) return;
  const track = slider.querySelector('.partition-track');
  const slides = [...track.querySelectorAll('.partition-slide')];
  const controls = slider.querySelector('.partition-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const position = slider.querySelector('.partition-position');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let width = track.clientWidth;
  const clamp = index => Math.max(0, Math.min(slides.length - 1, index));
  const update = () => {
    // ResizeObserver restores the selected slide before new scroll offsets are read.
    if (track.clientWidth !== width) return;
    current = clamp(Math.round(track.scrollLeft / width));
    position.textContent = `${current + 1} / ${slides.length}`;
    buttons[0].disabled = current === 0;
    buttons[1].disabled = current === slides.length - 1;
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index !== current));
      slide.querySelector('a').tabIndex = index === current ? 0 : -1;
    });
  };
  const go = index => {
    const next = clamp(index);
    slides[next].querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    track.scrollTo({left: next * width, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  };
  buttons.forEach(button => button.addEventListener('click', () => go(current + Number(button.dataset.partitionScroll))));
  slider.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const keys = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1};
    if (Object.prototype.hasOwnProperty.call(keys, event.key)) {
      event.preventDefault();
      go(keys[event.key]);
    }
  });
  track.addEventListener('scroll', update, {passive: true});
  new ResizeObserver(() => {
    const nextWidth = track.clientWidth;
    if (nextWidth > 0 && nextWidth !== width) {
      width = nextWidth;
      track.scrollTo({left: current * width, behavior: 'instant'});
    }
    update();
  }).observe(track);
  controls.hidden = false;
  update();
})();
