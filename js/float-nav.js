(function () {
  var nav = document.getElementById('floatNav');
  var toggle = document.getElementById('floatNavToggle');
  if (!nav || !toggle) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('float-nav--open');
  });

  nav.querySelectorAll('.float-nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('float-nav--open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) nav.classList.remove('float-nav--open');
  });

  // Active section tracking
  var sections = document.querySelectorAll('section[id^="sec-"]');
  var links = nav.querySelectorAll('.float-nav__link');
  var linkMap = {};
  links.forEach(function (l) {
    linkMap[l.getAttribute('href').slice(1)] = l;
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) {
          l.classList.remove('float-nav__link--active');
        });
        var active = linkMap[entry.target.id];
        if (active) active.classList.add('float-nav__link--active');
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(function (s) { observer.observe(s); });
})();
