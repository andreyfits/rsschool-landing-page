import { lockScroll, unlockScroll } from './scroll-lock.js';

/* Burger menu (≤768px): slide-in panel, scroll lock, Escape/link/resize close */
export function initBurgerMenu(mqMobile) {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  const header = document.querySelector('.header');
  if (!burger || !nav) return;

  let menuOpen = false;

  const syncNavTop = () => {
    if (header) {
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    }
  };

  const openMenu = () => {
    if (menuOpen) return;
    menuOpen = true;
    syncNavTop();
    nav.classList.add('nav--open');
    burger.classList.add('burger--open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    lockScroll();
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    menuOpen = false;
    nav.classList.remove('nav--open');
    burger.classList.remove('burger--open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    unlockScroll();
  };

  burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

  nav.addEventListener('click', ({ target }) => {
    if (target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', ({ key }) => {
    if (key === 'Escape') closeMenu();
  });

  mqMobile.addEventListener('change', ({ matches }) => {
    if (!matches) closeMenu();
  });

  window.addEventListener('resize', syncNavTop);
}
