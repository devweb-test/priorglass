(() => {
  'use strict';
  const menu = document.querySelector('#mobile-nav');
  const toggle = document.querySelector('.menu-toggle');
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
    menu.hidden = true;
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 901px)');
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = index => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(index === i));
      tab.tabIndex = index === i ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = index !== i;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(i));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = (i + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault(); selectTab(next); tabs[next].focus();
      }
    });
  });

  const track = document.querySelector('.projects-track');
  const arrows = [...document.querySelectorAll('[data-scroll]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateArrows = () => {
    arrows[0].disabled = track.scrollLeft <= 2;
    arrows[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  arrows.forEach(arrow => arrow.addEventListener('click', () => {
    const card = track.querySelector('.project-card');
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.scrollBy({left: Number(arrow.dataset.scroll) * (card.offsetWidth + gap), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }));
  track.addEventListener('scroll', updateArrows, {passive: true});
  window.addEventListener('resize', updateArrows, {passive: true});
  updateArrows();

  const dialog = document.querySelector('#inquiry-dialog');
  const form = document.querySelector('#inquiry-form');
  const title = document.querySelector('#inquiry-title');
  const status = document.querySelector('.form-status');
  let lastTrigger;
  document.querySelectorAll('[data-inquiry]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      lastTrigger = trigger;
      title.textContent = trigger.dataset.inquiry;
      status.hidden = true;
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }});
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    lastTrigger?.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const phone = String(data.get('phone')).replace(/\D/g, '');
    if (phone.length < 7 || phone.length > 15) {
      form.elements.phone.setCustomValidity('Укажите корректный номер телефона, от 7 до 15 цифр.');
      form.elements.phone.reportValidity();
      return;
    }
    const body = `Здравствуйте!\n\n${title.textContent}\nИмя: ${String(data.get('name')).trim()}\nТелефон: ${String(data.get('phone')).trim()}\n\n${String(data.get('message')).trim()}`;
    const url = `mailto:info@priorglass.ru?subject=${encodeURIComponent('Заявка с сайта: ' + title.textContent)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    status.textContent = 'Завершите отправку в почтовой программе. Если она не открылась, напишите на info@priorglass.ru или позвоните нам.';
    status.hidden = false;
  });
  form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
})();
