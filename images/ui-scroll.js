(function () {
  const topbar = document.getElementById('topbar');
  const progressBar = document.getElementById('progressBar');
  const floatingTop = document.getElementById('floatingTop');

  function updateScrollUi() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (topbar) {
      topbar.classList.toggle('is-scrolled', scrollTop > 12);
    }
    if (progressBar) {
      progressBar.style.width = Math.min(progress, 100) + '%';
    }
    if (floatingTop) {
      floatingTop.classList.toggle('is-visible', scrollTop > 320);
    }
  }

  if (floatingTop) {
    floatingTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', updateScrollUi, { passive: true });
  window.addEventListener('resize', updateScrollUi);
  updateScrollUi();
})();