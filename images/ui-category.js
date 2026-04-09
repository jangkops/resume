(function () {
  const categoryTree = document.getElementById('categoryTree');
  if (!categoryTree) return;

  const treeItems = Array.from(categoryTree.querySelectorAll('.tt_category li'));
  let topLevelOpened = false;

  function getDepth(item) {
    let depth = 0;
    let current = item.parentElement;
    while (current) {
      if ((current.tagName || '').toLowerCase() === 'li') depth += 1;
      current = current.parentElement;
    }
    return depth;
  }

  treeItems.forEach((item) => {
    const childList = item.querySelector(':scope > ul');
    if (!childList) return;

    const depth = getDepth(item);
    const anchor = item.querySelector(':scope > a');
    item.classList.add('is-parent');

    if (depth === 0 && !topLevelOpened) {
      item.classList.add('is-open', 'is-branch-active');
      topLevelOpened = true;
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cat-toggle';
    toggle.setAttribute('aria-label', '하위 카테고리 토글');
    toggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';

    function toggleBranch(event) {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = item.classList.toggle('is-open');
      item.classList.toggle('is-branch-active', isOpen);
    }

    toggle.addEventListener('click', toggleBranch);

    if (anchor) {
      anchor.setAttribute('href', '#');
      anchor.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
      anchor.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        item.classList.toggle('is-open');
        item.classList.toggle('is-branch-active', item.classList.contains('is-open'));
        anchor.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
      });
    }

    item.appendChild(toggle);
  });
})();
