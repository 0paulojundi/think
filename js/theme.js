/**
 * theme.js – Controle de tema claro/escuro e painel de acessibilidade
 * THINK Corporation
 */

(function () {
  'use strict';

  const THEME_KEY = 'think-theme';
  const A11Y_KEY  = 'think-a11y-settings';
  const DEFAULT_THEME = 'dark';

  const DEFAULT_A11Y = {
    highContrast: false,
    dyslexiaFont: false,
    lineHeight: 1,
    letterSpacing: 0,
    colorblind: 'none',
    motionMode: 'auto' // 'auto' | 'reduced' | 'none'
  };

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  }

  function getA11ySettings() {
    try {
      const raw = localStorage.getItem(A11Y_KEY);
      return raw ? Object.assign({}, DEFAULT_A11Y, JSON.parse(raw)) : Object.assign({}, DEFAULT_A11Y);
    } catch (_) {
      return Object.assign({}, DEFAULT_A11Y);
    }
  }

  function saveA11ySettings(settings) {
    localStorage.setItem(A11Y_KEY, JSON.stringify(settings));
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'
      );
    }

    const lightBtn = document.getElementById('a11yLightThemeBtn');
    if (lightBtn) {
      const isLight = theme === 'light';
      lightBtn.setAttribute('aria-pressed', String(isLight));
      lightBtn.textContent = isLight ? 'Tema Claro Ativo (Clique para Escuro)' : 'Ativar Tema Claro';
    }
  }

  function applyA11ySettings(settings) {
    const root = document.documentElement;

    root.setAttribute('data-contrast', settings.highContrast ? 'high' : 'normal');
    root.setAttribute('data-dyslexia', String(Boolean(settings.dyslexiaFont)));
    root.setAttribute('data-colorblind', settings.colorblind || 'none');
    root.setAttribute('data-motion', settings.motionMode || 'auto');

    root.style.setProperty('--line-height-scale', String(settings.lineHeight));
    root.style.setProperty('--letter-spacing-scale', `${settings.letterSpacing}px`);

    const contrastBtn = document.getElementById('a11yContrastBtn');
    if (contrastBtn) contrastBtn.setAttribute('aria-pressed', String(Boolean(settings.highContrast)));

    const dyslexiaBtn = document.getElementById('a11yDyslexiaBtn');
    if (dyslexiaBtn) dyslexiaBtn.setAttribute('aria-pressed', String(Boolean(settings.dyslexiaFont)));

    const lhRange = document.getElementById('a11yLineHeightRange');
    const lhVal   = document.getElementById('a11yLineHeightVal');
    if (lhRange) lhRange.value = String(settings.lineHeight);
    if (lhVal) lhVal.textContent = `${Number(settings.lineHeight).toFixed(1)}x`;

    const lsRange = document.getElementById('a11yLetterSpacingRange');
    const lsVal   = document.getElementById('a11yLetterSpacingVal');
    if (lsRange) lsRange.value = String(settings.letterSpacing);
    if (lsVal) lsVal.textContent = `${Number(settings.letterSpacing).toFixed(1)}px`;

    const cbSelect = document.getElementById('a11yColorblindSelect');
    if (cbSelect) cbSelect.value = settings.colorblind || 'none';

    const reduceBtn = document.getElementById('a11yReduceMotionBtn');
    const removeBtn = document.getElementById('a11yRemoveMotionBtn');
    if (reduceBtn) reduceBtn.setAttribute('aria-pressed', String(settings.motionMode === 'reduced'));
    if (removeBtn) removeBtn.setAttribute('aria-pressed', String(settings.motionMode === 'none'));

    document.dispatchEvent(new CustomEvent('think:a11y-change', { detail: settings }));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  function setPanelOpen(open) {
    const panel = document.getElementById('a11yPanel');
    const backdrop = document.getElementById('a11yBackdrop');
    const headerBtn = document.getElementById('a11yOpenBtn');
    const floatingBtn = document.getElementById('a11yFloatingBtn');

    if (!panel || !backdrop) return;

    panel.classList.toggle('d-none', !open);
    backdrop.classList.toggle('d-none', !open);

    if (headerBtn) headerBtn.setAttribute('aria-expanded', String(open));
    if (floatingBtn) floatingBtn.setAttribute('aria-expanded', String(open));

    if (open) {
      const closeBtn = document.getElementById('a11yCloseBtn');
      if (closeBtn) closeBtn.focus();
    } else if (floatingBtn) {
      floatingBtn.focus();
    }
  }

  applyTheme(getSavedTheme());
  applyA11ySettings(getA11ySettings());

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getSavedTheme());
    applyA11ySettings(getA11ySettings());

    document.addEventListener('click', function (e) {
      if (e.target.closest('#themeToggle')) {
        toggleTheme();
        const icon = document.getElementById('themeIcon');
        if (icon) {
          icon.style.transform = 'scale(1.35) rotate(18deg)';
          setTimeout(() => (icon.style.transform = ''), 280);
        }
        return;
      }

      if (e.target.closest('#a11yOpenBtn') || e.target.closest('#a11yFloatingBtn')) {
        const panel = document.getElementById('a11yPanel');
        const isOpen = panel && !panel.classList.contains('d-none');
        setPanelOpen(!isOpen);
        return;
      }

      if (e.target.closest('#a11yCloseBtn') || e.target.id === 'a11yBackdrop') {
        setPanelOpen(false);
        return;
      }

      const currentSettings = getA11ySettings();

      if (e.target.closest('#a11yLightThemeBtn')) {
        toggleTheme();
        return;
      }

      if (e.target.closest('#a11yContrastBtn')) {
        currentSettings.highContrast = !currentSettings.highContrast;
        saveA11ySettings(currentSettings);
        applyA11ySettings(currentSettings);
        return;
      }

      if (e.target.closest('#a11yDyslexiaBtn')) {
        currentSettings.dyslexiaFont = !currentSettings.dyslexiaFont;
        saveA11ySettings(currentSettings);
        applyA11ySettings(currentSettings);
        return;
      }

      if (e.target.closest('#a11yReduceMotionBtn')) {
        currentSettings.motionMode = currentSettings.motionMode === 'reduced' ? 'auto' : 'reduced';
        saveA11ySettings(currentSettings);
        applyA11ySettings(currentSettings);
        return;
      }

      if (e.target.closest('#a11yRemoveMotionBtn')) {
        currentSettings.motionMode = currentSettings.motionMode === 'none' ? 'auto' : 'none';
        saveA11ySettings(currentSettings);
        applyA11ySettings(currentSettings);
        return;
      }

      if (e.target.closest('#a11yVlibrasFocusBtn')) {
        const vwBtn = document.querySelector('[vw-access-button]');
        if (vwBtn) {
          vwBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          vwBtn.click();
        }
        return;
      }

      if (e.target.closest('#a11yResetBtn')) {
        localStorage.setItem(THEME_KEY, DEFAULT_THEME);
        saveA11ySettings(Object.assign({}, DEFAULT_A11Y));
        applyTheme(DEFAULT_THEME);
        applyA11ySettings(Object.assign({}, DEFAULT_A11Y));
      }
    });

    document.addEventListener('input', function (e) {
      const currentSettings = getA11ySettings();

      if (e.target.id === 'a11yLineHeightRange') {
        currentSettings.lineHeight = parseFloat(e.target.value) || 1;
        saveA11ySettings(currentSettings);
        applyA11ySettings(currentSettings);
      }

      if (e.target.id === 'a11yLetterSpacingRange') {
        currentSettings.letterSpacing = parseFloat(e.target.value) || 0;
        saveA11ySettings(currentSettings);
        applyA11ySettings(currentSettings);
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.id === 'a11yColorblindSelect') {
        const currentSettings = getA11ySettings();
        currentSettings.colorblind = e.target.value || 'none';
        saveA11ySettings(currentSettings);
        applyA11ySettings(currentSettings);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const panel = document.getElementById('a11yPanel');
        if (panel && !panel.classList.contains('d-none')) {
          setPanelOpen(false);
        }
      }
    });
  });

  window.ThinkTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    getTheme: getSavedTheme,
    getA11y: getA11ySettings,
    applyA11y: applyA11ySettings
  };
})();
