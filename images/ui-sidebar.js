(function () {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const mask = document.getElementById('sidebarMask');
  const openBtn = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('sidebarClose');
  const searchInput = document.getElementById('keyword');
  const sidebarSearchButton = document.querySelector('.search-box__button');
  const topSearchButton = document.getElementById('topbarSearchButton');
  const quickSearchButton = document.getElementById('sidebarQuickSearch');
  const topSearch = document.getElementById('topSearch');
  const topSearchInput = document.getElementById('topSearchInput');
  const topSearchClose = document.getElementById('topSearchClose');
  const topSearchResults = document.getElementById('topSearchResults');
  let sidebarResultsBox = null;

  function setSidebarState(isOpen) {
    body.classList.toggle('sidebar-open', isOpen);
    if (sidebar) sidebar.setAttribute('aria-hidden', String(!isOpen));
  }

  function syncDockedState() {
    body.classList.remove('sidebar-docked');
    if (sidebar) {
      sidebar.setAttribute('aria-hidden', String(!body.classList.contains('sidebar-open')));
    }
  }

  function openSidebar() {
    setSidebarState(true);
  }

  function closeSidebar() {
    setSidebarState(false);
  }

  function activatePanel(target, shouldOpenSidebar) {
    if (!target) return;

    Array.from(document.querySelectorAll('.topnav__link')).forEach(function (button) {
      button.classList.toggle('is-active', button.dataset.menuTarget === target);
    });

    Array.from(document.querySelectorAll('.mega-panel')).forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.panel === target);
    });

    if (shouldOpenSidebar) openSidebar();
  }

  function getSidebarResultsBox() {
    if (sidebarResultsBox) return sidebarResultsBox;
    const searchWidget = searchInput ? searchInput.closest('.sidebar-widget') : null;
    if (!searchWidget) return null;
    sidebarResultsBox = document.createElement('div');
    sidebarResultsBox.className = 'stack-search-results';
    sidebarResultsBox.hidden = true;
    searchWidget.appendChild(sidebarResultsBox);
    return sidebarResultsBox;
  }

  function collectSearchIndex() {
    const pages = window.__CAUSE_STACK_PAGES__ || {};
    const docs = window.__CAUSE_STACK_DOCS__ || {};
    const index = [];

    Object.keys(pages).forEach(function (slug) {
      const page = pages[slug];
      index.push({
        kind: 'stack',
        title: page.title,
        summary: page.description || '',
        href: '/?stack=' + encodeURIComponent(slug),
        meta: page.categoryPath || 'Summary Stack'
      });
    });

    Object.keys(docs).forEach(function (key) {
      const doc = docs[key];
      index.push({
        kind: 'doc',
        title: doc.title,
        summary: doc.summary || '',
        href: '/?stack=' + encodeURIComponent(doc.stackSlug) + '&doc=' + encodeURIComponent(doc.slug),
        meta: (doc.stackTitle || '') + ' · ' + (doc.depth + 1) + ' depth'
      });
    });

    return index;
  }

  function scoreSearchItem(query, item) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return 0;
    const title = String(item.title || '').toLowerCase();
    const summary = String(item.summary || '').toLowerCase();
    const meta = String(item.meta || '').toLowerCase();
    let score = 0;
    if (title === q) score += 100;
    if (title.indexOf(q) !== -1) score += 40;
    if (meta.indexOf(q) !== -1) score += 18;
    if (summary.indexOf(q) !== -1) score += 12;
    return score;
  }

  function runSearch(query) {
    const q = String(query || '').trim();
    if (!q) return [];

    return collectSearchIndex()
      .map(function (item) {
        return { item: item, score: scoreSearchItem(q, item) };
      })
      .filter(function (entry) {
        return entry.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 8)
      .map(function (entry) {
        return entry.item;
      });
  }

  function buildResultsMarkup(results) {
    if (!results.length) {
      return '<div class="stack-search-results__empty">내부 문서에서 일치하는 결과를 찾지 못했습니다.</div>';
    }

    return results.map(function (item) {
      return [
        '<a class="stack-search-results__item" href="', item.href, '">',
        '<strong>', item.title, '</strong>',
        '<span>', item.meta, '</span>',
        '<small>', item.summary, '</small>',
        '</a>'
      ].join('');
    }).join('');
  }

  function renderSidebarSearchResults(query) {
    const box = getSidebarResultsBox();
    if (!box) return [];
    const q = String(query || '').trim();
    if (!q) {
      box.hidden = true;
      box.innerHTML = '';
      return [];
    }

    const results = runSearch(q);
    box.hidden = false;
    box.innerHTML = buildResultsMarkup(results);
    return results;
  }

  function renderTopSearchResults(query) {
    if (!topSearchResults) return [];
    const q = String(query || '').trim();
    if (!q) {
      topSearchResults.innerHTML = '';
      return [];
    }

    const results = runSearch(q);
    topSearchResults.innerHTML = buildResultsMarkup(results);
    return results;
  }

  function submitSidebarSearch() {
    if (!searchInput) return;
    const query = String(searchInput.value || '').trim();
    if (!query) return;
    const results = renderSidebarSearchResults(query);
    if (results.length) {
      window.location.href = results[0].href;
      return;
    }
    window.location.href = '/search/' + encodeURIComponent(query);
  }

  function submitTopSearch() {
    if (!topSearchInput) return;
    const query = String(topSearchInput.value || '').trim();
    if (!query) return;
    const results = renderTopSearchResults(query);
    if (results.length) {
      closeTopSearch();
      window.location.href = results[0].href;
      return;
    }
    closeTopSearch();
    window.location.href = '/search/' + encodeURIComponent(query);
  }

  function openSidebarSearch(event) {
    if (event) event.preventDefault();
    openSidebar();
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      renderSidebarSearchResults(searchInput.value || '');
    }
  }

  function openTopSearch(event) {
    if (event) event.preventDefault();
    if (!topSearch || !topSearchInput) return;
    topSearch.hidden = false;
    topSearch.setAttribute('aria-hidden', 'false');
    body.classList.add('top-search-open');
    topSearchInput.focus();
    topSearchInput.select();
    renderTopSearchResults(topSearchInput.value || '');
  }

  function closeTopSearch() {
    if (!topSearch) return;
    topSearch.hidden = true;
    topSearch.setAttribute('aria-hidden', 'true');
    body.classList.remove('top-search-open');
    if (topSearchResults) topSearchResults.innerHTML = '';
  }

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      openSidebar();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      closeSidebar();
    });
  }

  if (mask) {
    mask.addEventListener('click', closeSidebar);
  }

  if (topSearchButton) {
    topSearchButton.addEventListener('click', openTopSearch);
  }

  if (quickSearchButton) {
    quickSearchButton.addEventListener('click', openSidebarSearch);
  }

  if (topSearchClose) {
    topSearchClose.addEventListener('click', function (event) {
      event.preventDefault();
      closeTopSearch();
    });
  }

  if (topSearch) {
    topSearch.addEventListener('click', function (event) {
      if (event.target === topSearch) closeTopSearch();
    });
  }

  if (searchInput) {
    searchInput.removeAttribute('onkeypress');
    searchInput.addEventListener('input', function () {
      renderSidebarSearchResults(this.value || '');
    });
    searchInput.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      submitSidebarSearch();
    });
  }

  if (topSearchInput) {
    topSearchInput.addEventListener('input', function () {
      renderTopSearchResults(this.value || '');
    });
    topSearchInput.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      submitTopSearch();
    });
  }

  if (sidebarSearchButton) {
    sidebarSearchButton.removeAttribute('onclick');
    sidebarSearchButton.addEventListener('click', function (event) {
      event.preventDefault();
      submitSidebarSearch();
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('.topnav__link');
    if (!button) return;
    const target = button.dataset.menuTarget;
    if (isDesktop()) {
      if (button.getAttribute('href') === '#') event.preventDefault();
      activatePanel(target, false);
      return;
    }
    if (button.getAttribute('href') === '#') {
      event.preventDefault();
    }
    activatePanel(target, true);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (topSearch && !topSearch.hidden) {
        closeTopSearch();
        return;
      }
      closeSidebar();
    }
  });

  window.addEventListener('resize', function () {
    syncDockedState();
  });

  syncDockedState();
})();
