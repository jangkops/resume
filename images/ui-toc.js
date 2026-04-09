(function () {
  const article = document.querySelector('.js-article-content');
  const tocList = document.querySelector('.js-toc-list');
  const spyList = document.querySelector('.js-scrollspy-list');
  const tocBox = document.querySelector('.js-toc-box');
  const tocToggle = document.querySelector('.js-toc-toggle');

  if (!article || !tocList || !spyList) return;

  const headings = Array.from(article.querySelectorAll('h2, h3, h4'))
    .filter((heading) => heading.textContent.trim().length);

  if (!headings.length) {
    if (tocBox) tocBox.style.display = 'none';
    const scrollSpy = document.querySelector('.scrollspy-box');
    if (scrollSpy) scrollSpy.style.display = 'none';
    return;
  }

  const items = [];

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = 'heading-' + (index + 1);
    }

    const levelClass = 'level-' + heading.tagName.toLowerCase();
    const text = heading.textContent.trim();

    const tocItem = document.createElement('li');
    tocItem.className = levelClass;
    tocItem.innerHTML = '<a href="#' + heading.id + '">' + text + '</a>';
    tocList.appendChild(tocItem);

    const spyItem = document.createElement('li');
    spyItem.className = levelClass;
    spyItem.innerHTML = '<a href="#' + heading.id + '">' + text + '</a>';
    spyList.appendChild(spyItem);

    items.push({
      heading,
      links: [
        tocItem.querySelector('a'),
        spyItem.querySelector('a')
      ]
    });
  });

  function setActive() {
    const offset = 140;
    let activeIndex = 0;

    items.forEach((item, index) => {
      if (window.scrollY + offset >= item.heading.offsetTop) {
        activeIndex = index;
      }
    });

    items.forEach((item, index) => {
      item.links.forEach((link) => {
        link.classList.toggle('is-active', index === activeIndex);
      });
    });
  }

  if (tocToggle && tocBox) {
    tocToggle.addEventListener('click', function () {
      tocBox.classList.toggle('is-open');
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();