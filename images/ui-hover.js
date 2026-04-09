(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var dropdown = document.getElementById('hoverDropdown');
    var content = document.getElementById('hoverDropdownContent');
    var topbar = document.getElementById('topbar');
    var topnav = document.querySelector('.topnav');
    var closeTimer = null;
    var currentKey = null;
    var currentButton = null;

    if (!dropdown || !content || !topbar || !topnav) return;

    function getTopnavButtons() {
      return Array.prototype.slice.call(document.querySelectorAll('.topnav__link'));
    }

    function isDesktop() {
      return window.innerWidth > 1024;
    }

    function getDropdownWidth(key) {
      var widthByKey = {
        develop: 340,
        devops: 720,
        devkit: 340,
        page: 420
      };
      var fallback = widthByKey[String(key || currentKey || '').toLowerCase()] || 340;
      return Math.min(fallback, window.innerWidth - 32);
    }

    function updateDropdownPosition(button) {
      var activeButton = button || currentButton || (currentKey ? getTopnavButtons().find(function (item) {
        return item.getAttribute('data-menu-target') === currentKey;
      }) : null);
      var topbarRect = topbar.getBoundingClientRect();
      var buttonRect = activeButton ? activeButton.getBoundingClientRect() : topbarRect;
      var contentWidth = getDropdownWidth(activeButton && activeButton.getAttribute('data-menu-target'));
      var left = buttonRect.left;
      var minLeft = 16;
      var maxLeft = Math.max(minLeft, window.innerWidth - contentWidth - 16);
      left = Math.min(Math.max(left, minLeft), maxLeft);

      dropdown.style.top = (buttonRect.bottom + 4) + 'px';
      dropdown.style.left = left + 'px';
      dropdown.style.width = contentWidth + 'px';
    }

    function clearHoveredState() {
      getTopnavButtons().forEach(function (button) {
        button.classList.remove('is-hovered');
      });
    }

    function setHoveredState(key) {
      getTopnavButtons().forEach(function (button) {
        button.classList.toggle('is-hovered', button.getAttribute('data-menu-target') === key);
      });
    }

    function getPanelMarkup(key) {
      var panel = document.querySelector('.mega-panel[data-panel="' + key + '"]');
      if (!panel) return '';

      var groups = Array.prototype.slice.call(panel.querySelectorAll('.mega-group'));
      if (groups.length) {
        return groups.map(function (group) {
          return group.outerHTML;
        }).join('');
      }

      var auto = panel.querySelector('.mega-auto');
      return auto ? auto.innerHTML : '';
    }

    function getPanelColumns(key) {
      var panel = document.querySelector('.mega-panel[data-panel="' + key + '"]');
      if (!panel) return 1;
      var count = Number(panel.getAttribute('data-group-count'));
      return count > 0 ? count : 1;
    }

    function openDropdown(key, button) {
      if (!isDesktop() || !key) return;

      var html = getPanelMarkup(key);
      if (!html.trim()) {
        closeDropdown();
        return;
      }

      currentKey = key;
      currentButton = button || currentButton;
      var topSearch = document.getElementById('topSearch');
      if (topSearch) {
        topSearch.hidden = true;
        topSearch.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('top-search-open');
      }
      content.innerHTML = html;
      content.setAttribute('data-columns', String(getPanelColumns(key)));
      dropdown.classList.add('is-open');
      dropdown.setAttribute('aria-hidden', 'false');
      setHoveredState(key);
      updateDropdownPosition(button);
    }

    function closeDropdown() {
      currentKey = null;
      currentButton = null;
      dropdown.classList.remove('is-open');
      dropdown.setAttribute('aria-hidden', 'true');
      content.removeAttribute('data-columns');
      clearHoveredState();
    }

    function scheduleClose() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closeDropdown, 240);
    }

    function cancelClose() {
      clearTimeout(closeTimer);
    }

    topnav.addEventListener('mouseover', function (event) {
      if (!isDesktop()) return;
      var button = event.target.closest('.topnav__link');
      if (!button || !topnav.contains(button)) return;
      var key = button.getAttribute('data-menu-target');
      cancelClose();
      openDropdown(key, button);
    });

    topnav.addEventListener('click', function (event) {
      var button = event.target.closest('.topnav__link');
      if (!button || !topnav.contains(button)) return;
      var key = button.getAttribute('data-menu-target');
      var targetLink = button.getAttribute('data-link') || button.getAttribute('href') || '#';
      if (targetLink && targetLink !== '#') {
        event.preventDefault();
        window.location.href = targetLink;
        return;
      }
      if (!isDesktop()) return;
      if (button.getAttribute('href') === '#') event.preventDefault();
      cancelClose();
      if (currentKey === key && dropdown.classList.contains('is-open')) {
        closeDropdown();
        return;
      }
      openDropdown(key, button);
    });

    topnav.addEventListener('focusin', function (event) {
      if (!isDesktop()) return;
      var button = event.target.closest('.topnav__link');
      if (!button || !topnav.contains(button)) return;
      var key = button.getAttribute('data-menu-target');
      openDropdown(key, button);
    });

    topbar.addEventListener('mouseleave', function () {
      if (!isDesktop()) return;
      scheduleClose();
    });

    dropdown.addEventListener('mouseenter', cancelClose);
    dropdown.addEventListener('mouseleave', scheduleClose);
    dropdown.addEventListener('click', function (event) {
      var anchor = event.target.closest('a[href]');
      if (!anchor || !dropdown.contains(anchor)) return;
      var href = anchor.getAttribute('href');
      if (!href) return;
      event.preventDefault();
      closeDropdown();
      window.location.assign(anchor.href);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDropdown();
    });

    document.addEventListener('click', function (event) {
      if (!isDesktop()) return;
      if (!dropdown.classList.contains('is-open')) return;
      if (topnav.contains(event.target) || dropdown.contains(event.target)) return;
      closeDropdown();
    });

    window.addEventListener('resize', function () {
      if (!isDesktop()) closeDropdown();
      if (isDesktop() && currentKey) openDropdown(currentKey);
    });

    updateDropdownPosition();
  });
})();
