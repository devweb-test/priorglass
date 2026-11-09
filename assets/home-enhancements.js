(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reducedMotion.matches ? 'instant' : 'smooth';
  const syncBody = () => document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
  const outsideDialog = (dialog, event) => {
    if (event.target !== dialog) return false;
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };

  const video = document.getElementById('video-dialog');
  const videoFrame = video.querySelector('.video-frame');
  let videoTrigger;
  document.querySelectorAll('[data-video]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    videoTrigger = link;
    const iframe = document.createElement('iframe');
    iframe.title = 'Видео о компании Приоргласс';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    const id = link.dataset.video;
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`;
    videoFrame.replaceChildren(iframe);
    video.showModal();
    syncBody();
  }));
  video.querySelector('.video-close').addEventListener('click', () => video.close());
  video.addEventListener('click', event => { if (outsideDialog(video, event)) video.close(); });
  video.addEventListener('close', () => {
    videoFrame.replaceChildren();
    syncBody();
    videoTrigger?.focus({preventScroll: true});
  });

  const top = document.querySelector('.floating-top');
  const stickyHeader = document.querySelector('.header-v4');
  const updateTop = () => {
    const scrollY = window.scrollY;
    top.hidden = scrollY < 550;
    stickyHeader.classList.toggle('is-scrolled', scrollY > 32);
  };
  window.addEventListener('scroll', updateTop, {passive: true});
  updateTop();
  top.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: behavior()});
    const main = document.getElementById('main');
    main.setAttribute('tabindex', '-1');
    main.focus({preventScroll: true});
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), {once: true});
  });

  const mail = document.getElementById('mail-dialog');
  const mailForm = document.getElementById('mail-form');
  const mailStatus = document.querySelector('.mail-status');
  let mailTrigger;
  document.querySelectorAll('[data-mail]').forEach(button => button.addEventListener('click', () => {
    mailTrigger = button;
    mailStatus.hidden = true;
    mail.showModal();
    syncBody();
  }));
  document.querySelector('.mail-close').addEventListener('click', () => mail.close());
  mail.addEventListener('click', event => { if (outsideDialog(mail, event)) mail.close(); });
  mail.addEventListener('close', () => { syncBody(); mailTrigger?.focus(); });
  mailForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!mailForm.reportValidity()) return;
    const data = new FormData(mailForm);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const phone = String(data.get('phone')).trim();
    const message = String(data.get('message')).trim();
    if (!name || !message) {
      mailStatus.textContent = 'Укажите имя и напишите сообщение.';
      mailStatus.hidden = false;
      return;
    }
    const body = `Здравствуйте!\n\n${message}\n\nИмя: ${name}\nЭлектронная почта: ${email}${phone ? '\nТелефон: ' + phone : ''}`;
    window.location.href = `mailto:info@priorglass.ru?subject=${encodeURIComponent('Письмо с сайта Приоргласс')}&body=${encodeURIComponent(body)}`;
    mailStatus.textContent = 'Завершите отправку в почтовой программе. Если она не открылась, напишите на info@priorglass.ru или позвоните: +7 (495) 777-33-54.';
    mailStatus.hidden = false;
  });

  document.querySelectorAll('[data-document-slider]').forEach(slider => {
    const track = slider.querySelector('.document-track');
    const cards = [...track.querySelectorAll('.document-card')];
    const buttons = [...slider.querySelectorAll('[data-document-scroll]')];
    const position = slider.querySelector('.document-position');
    const step = () => cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
    const update = () => {
      buttons[0].disabled = track.scrollLeft <= 2;
      buttons[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
      const visible = Math.max(1, Math.round(track.clientWidth / step()));
      const first = Math.max(0, Math.round(track.scrollLeft / step()));
      const end = Math.min(cards.length, first + visible);
      position.textContent = `${first + 1}${end > first + 1 ? '–' + end : ''} / ${cards.length}`;
    };
    const move = direction => track.scrollBy({left: direction * step(), behavior: behavior()});
    buttons.forEach(button => button.addEventListener('click', () => move(Number(button.dataset.documentScroll))));
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); track.scrollTo({left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: behavior()});
      }
    });
    track.addEventListener('scroll', update, {passive: true});
    new ResizeObserver(update).observe(track);
    update();
  });

  const viewer = document.getElementById('document-viewer');
  const viewerImage = viewer.querySelector('.viewer-image');
  const viewerTitle = document.getElementById('document-viewer-title');
  const stage = viewer.querySelector('.viewer-stage');
  const zoom = viewer.querySelector('.viewer-zoom');
  const download = viewer.querySelector('.viewer-download');
  const counter = viewer.querySelector('.viewer-counter');
  const error = viewer.querySelector('.viewer-error');
  const galleries = new Map();
  let current = [];
  let index = 0;
  let viewerTrigger;

  document.querySelectorAll('[data-gallery]').forEach(link => {
    const group = link.dataset.gallery;
    if (!galleries.has(group)) galleries.set(group, []);
    galleries.get(group).push(link);
    link.addEventListener('click', event => {
      event.preventDefault();
      current = galleries.get(group);
      index = current.indexOf(link);
      viewerTrigger = link;
      viewer.showModal();
      syncBody();
      showDocument();
    });
  });

  const setZoom = value => {
    stage.classList.toggle('is-zoomed', value);
    zoom.setAttribute('aria-pressed', String(value));
    zoom.setAttribute('aria-label', value ? 'Уменьшить масштаб документа' : 'Увеличить масштаб документа');
    stage.scrollTo({left: 0, top: 0, behavior: 'instant'});
  };
  const showDocument = () => {
    const link = current[index];
    const title = link.dataset.caption;
    setZoom(false);
    error.hidden = true;
    viewerImage.hidden = false;
    viewerTitle.textContent = title;
    viewerImage.alt = title;
    viewerImage.src = link.href;
    download.href = link.href;
    counter.textContent = `${index + 1} / ${current.length}`;
  };
  viewerImage.addEventListener('load', () => {
    stage.style.setProperty('--zoom-width', `${Math.max(viewerImage.naturalWidth, stage.clientWidth * 1.4)}px`);
  });
  viewerImage.addEventListener('error', () => { viewerImage.hidden = true; error.hidden = false; });
  viewerImage.addEventListener('click', () => setZoom(!stage.classList.contains('is-zoomed')));
  zoom.addEventListener('click', () => setZoom(!stage.classList.contains('is-zoomed')));
  const navigate = direction => { index = (index + direction + current.length) % current.length; showDocument(); };
  viewer.querySelector('.viewer-prev').addEventListener('click', () => navigate(-1));
  viewer.querySelector('.viewer-next').addEventListener('click', () => navigate(1));
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => { if (outsideDialog(viewer, event)) viewer.close(); });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); navigate(event.key === 'ArrowRight' ? 1 : -1);
    }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(true); }
    if (event.key === '-') { event.preventDefault(); setZoom(false); }
  });
  viewer.addEventListener('close', () => {
    setZoom(false);
    viewerImage.removeAttribute('src');
    download.removeAttribute('href');
    syncBody();
    viewerTrigger?.focus({preventScroll: true});
  });
})();
