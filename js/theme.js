(function () {
  'use strict';

  var STORAGE_KEY = 'coffee-house-theme';
  var root = document.documentElement;
  var toggles = document.querySelectorAll('[data-theme-toggle]');

  function currentTheme() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    });
  }

  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* storage unavailable — theme still applies for this session */
    }
  }

  toggles.forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });

  applyTheme(currentTheme());
})();
