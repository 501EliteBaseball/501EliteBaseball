(() => {
  const forms = document.querySelectorAll('[data-demo-form]');
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const notice = form.querySelector('[data-form-notice]');
      if (notice) {
        notice.hidden = false;
        notice.focus?.();
      }
    });
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();
