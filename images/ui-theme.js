(function () {
  const storageKey = 'cause-theme-v20260319';
  const root = document.documentElement;
  const button = document.getElementById('themeToggle');

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    if (button) {
      button.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      button.setAttribute('aria-label', isDark ? '라이트 모드 전환' : '다크 모드 전환');
    }
  }

  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : 'light';
  applyTheme(initialTheme);

  if (button) {
    button.addEventListener('click', function () {
      const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
  }
})();
