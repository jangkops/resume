(function () {
  var transitionTimer = null;
  var stackMotifs = {
    'stack-kubernetes': { icon: '◌', accent: 'Pods · Cluster · Mesh', chips: ['73 docs', 'K8s'], layers: ['orb','grid','nodes'] },
    'stack-aws': { icon: 'A', accent: 'Cloud · Infra · IAM', chips: ['AWS', 'Infra'], layers: ['orb','wave','beam'] },
    'stack-programing-language': { icon: '</>', accent: 'Language · Script · Runtime', chips: ['Code', 'Docs'], layers: ['beam','grid','cards'] },
    'stack-github': { icon: 'GH', accent: 'GitOps · Actions · Repo', chips: ['GitHub', 'CI/CD'], layers: ['beam','nodes','cards'] },
    'stack-gitlab': { icon: 'GL', accent: 'Runner · Pipeline · Registry', chips: ['GitLab', 'Runner'], layers: ['wave','nodes','cards'] },
    'stack-server': { icon: 'SV', accent: 'Server · Middleware · Runtime', chips: ['Server', 'Ops'], layers: ['beam','grid','orb'] },
    'stack-database': { icon: 'DB', accent: 'RDBMS · SQL · Engine', chips: ['DB', 'Query'], layers: ['orb','rings','cards'] },
    'stack-elastic-stack': { icon: 'ES', accent: 'Search · Logs · Analytics', chips: ['Elastic', 'Search'], layers: ['rings','beam','cards'] },
    'stack-prometheus': { icon: 'PM', accent: 'Metrics · Alerts · Dashboards', chips: ['Observe', 'Metrics'], layers: ['grid','wave','rings'] },
    'stack-linux': { icon: 'LX', accent: 'Shell · Filesystem · Kernel', chips: ['Linux', 'CLI'], layers: ['beam','grid','wave'] },
    'stack-terraform': { icon: 'TF', accent: 'IaC · Plan · Apply', chips: ['IaC', 'State'], layers: ['cards','beam','grid'] },
    'stack-docker': { icon: 'DK', accent: 'Container · Image · Compose', chips: ['Docker', 'Runtime'], layers: ['wave','cards','orb'] },
    'stack-openstack': { icon: 'OS', accent: 'Private Cloud · Labs · Compute', chips: ['Labs', 'Cloud'], layers: ['orb','beam','nodes'] },
    'stack-argo-cd': { icon: 'AR', accent: 'GitOps · Sync · Delivery', chips: ['Argo', 'Deploy'], layers: ['cards','wave','rings'] },
    'stack-message-queue': { icon: 'MQ', accent: 'Queue · Event · Stream', chips: ['MQ', 'Async'], layers: ['nodes','beam','wave'] },
    'stack-datastore': { icon: 'DS', accent: 'Store · Segment · Analytics', chips: ['Store', 'Data'], layers: ['rings','grid','cards'] },
    'stack-datasaker': { icon: 'DK', accent: 'Monitor · SaaS · Event', chips: ['SaaS', 'Observe'], layers: ['wave','orb','grid'] },
    'stack-azure': { icon: 'AZ', accent: 'Azure · Resource · Cloud', chips: ['Azure', 'Resource'], layers: ['beam','orb','cards'] },
    'stack-open-ai': { icon: 'AI', accent: 'Prompt · Model · Agent', chips: ['AI', 'Prompt'], layers: ['rings','beam','nodes'] },
    'stack-eformsign': { icon: 'EF', accent: 'Sign · Form · Workflow', chips: ['Form', 'Docs'], layers: ['cards','grid','wave'] },
    'stack-참고-자료': { icon: 'RF', accent: 'Reference · Pattern · Notes', chips: ['Wiki', 'Refs'], layers: ['grid','cards','orb'] }
  };

  function decodeHtml(value) {
    var el = document.createElement('textarea');
    el.innerHTML = String(value || '');
    return el.value;
  }

  function normalizeCategoryToken(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function decodePathSegments(pathname) {
    return String(pathname || '')
      .split('/')
      .filter(Boolean)
      .map(function (part) {
        try {
          return decodeURIComponent(part);
        } catch (error) {
          return part;
        }
      });
  }

  function buildCategoryAwareRoute() {
    var pages = window.__CAUSE_STACK_PAGES__ || {};
    var segments = decodePathSegments(window.location.pathname || '');
    if (!segments.length || segments[0] !== 'category') return null;

    var categorySegments = segments.slice(1);
    if (!categorySegments.length) return null;

    var currentPath = '/category/' + categorySegments.map(function (part) {
      return encodeURIComponent(part).replace(/%20/g, '%20');
    }).join('/');

    var exactStackSlug = Object.keys(pages).find(function (slug) {
      return pages[slug] && pages[slug].categoryPath === currentPath;
    });
    if (exactStackSlug) {
      return { stack: exactStackSlug, doc: '', page: 1, categoryPath: currentPath, virtual: null };
    }

    var leaf = normalizeCategoryToken(categorySegments[categorySegments.length - 1]);
    var parent = normalizeCategoryToken(categorySegments[0]);

    var exactAliasMap = {
      'amazon': 'stack-aws',
      'aws': 'stack-aws',
      'azure': 'stack-azure',
      'kubernetes': 'stack-kubernetes',
      'docker': 'stack-docker',
      'gitlab': 'stack-gitlab',
      'github': 'stack-github',
      'argo cd': 'stack-argo-cd',
      'prometheus grafana': 'stack-prometheus',
      'prometheus / grafana': 'stack-prometheus',
      'datasaker': 'stack-datasaker',
      'linux': 'stack-linux',
      'server': 'stack-server',
      'terraform': 'stack-terraform',
      'elastic stack': 'stack-elastic-stack',
      'message queue': 'stack-message-queue',
      'openstack': 'stack-openstack',
      'datastore': 'stack-datastore',
      'database': 'stack-database',
      'open ai': 'stack-open-ai',
      'eformsign': 'stack-eformsign',
      'reference': 'stack-참고-자료',
      '참고 자료': 'stack-참고-자료',
      'language': 'stack-programing-language'
    };
    if (exactAliasMap[leaf]) {
      return { stack: exactAliasMap[leaf], doc: '', page: 1, categoryPath: currentPath, virtual: null };
    }

    var filteredMap = {
      'language/java': { stack: 'stack-programing-language', filter: 'java', title: 'Java' },
      'language/python': { stack: 'stack-programing-language', filter: 'python', title: 'Python' },
      'language/bashshell': { stack: 'stack-programing-language', filter: 'bashshell', title: 'BashShell' },
      'language/javascript': { stack: 'stack-programing-language', filter: 'javascript', title: 'JavaScript' },
      'language/typescript': { stack: 'stack-programing-language', filter: 'typescript', title: 'TypeScript' },
      'ci and cd/gitlab': { stack: 'stack-gitlab', title: 'Gitlab' },
      'ci and cd/github': { stack: 'stack-github', title: 'Github' },
      'ci and cd/argo cd': { stack: 'stack-argo-cd', title: 'Argo CD' },
      'monitoring/prometheus grafana': { stack: 'stack-prometheus', title: 'Prometheus & Grafana' },
      'monitoring/prometheus / grafana': { stack: 'stack-prometheus', title: 'Prometheus & Grafana' },
      'monitoring/datasaker': { stack: 'stack-datasaker', title: 'Datasaker' },
      'cloud/amazon': { stack: 'stack-aws', title: 'Amazon' },
      'cloud/aws': { stack: 'stack-aws', title: 'AWS' },
      'cloud/azure': { stack: 'stack-azure', title: 'AZURE' },
      'cloud/openstack': { stack: 'stack-openstack', title: 'OpenStack' },
      'os/linux': { stack: 'stack-linux', title: 'Linux' },
      'iac/terraform': { stack: 'stack-terraform', title: 'Terraform' },
      'logging/elastic stack': { stack: 'stack-elastic-stack', title: 'Elastic Stack' },
      'dbms/database': { stack: 'stack-database', title: 'Database' },
      'ai/open ai': { stack: 'stack-open-ai', title: 'Open AI' },
      'tools/eformsign': { stack: 'stack-eformsign', title: 'Eformsign' }
    };

    var key = parent + '/' + leaf;
    if (filteredMap[key]) {
      return {
        stack: filteredMap[key].stack,
        doc: '',
        page: 1,
        categoryPath: currentPath,
        virtual: { type: filteredMap[key].filter ? 'filter' : 'exact', title: filteredMap[key].title, filter: filteredMap[key].filter || '' }
      };
    }

    var aggregateMap = {
      'cloud': { title: 'Cloud', description: 'Cloud 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-aws', 'stack-azure', 'stack-openstack'] },
      'ci and cd': { title: 'CI & CD', description: 'CI & CD 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-gitlab', 'stack-github', 'stack-argo-cd'] },
      'monitoring': { title: 'Monitoring', description: '모니터링 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-prometheus', 'stack-datasaker'] },
      'os': { title: 'OS', description: '운영체제 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-linux'] },
      'iac': { title: 'IaC', description: 'IaC 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-terraform'] },
      'logging': { title: 'Logging', description: 'Logging 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-elastic-stack'] },
      'dbms': { title: 'DBMS', description: 'DBMS 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-database'] },
      'ai': { title: 'AI', description: 'AI 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-open-ai'] },
      'tools': { title: 'Tools', description: '도구 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-eformsign'] }
    };
    if (aggregateMap[leaf]) {
      return { stack: '', doc: '', page: 1, categoryPath: currentPath, virtual: { type: 'aggregate', title: aggregateMap[leaf].title, description: aggregateMap[leaf].description, children: aggregateMap[leaf].children } };
    }

    return null;
  }

  function buildVirtualRouteFromStackSlug(stackSlug) {
    var key = String(stackSlug || '').trim().toLowerCase();
    var map = {
      'group-develop': {
        stack: '',
        virtual: { type: 'aggregate', title: 'Develop', description: 'Develop 하위 스택을 모아보는 내부 허브 페이지입니다.', children: ['stack-programing-language', 'stack-kubernetes', 'stack-docker'] }
      },
      'group-devops': {
        stack: '',
        virtual: { type: 'aggregate', title: 'DevOps', description: 'DevOps 대분류 하위 카테고리와 스택을 한 번에 탐색하는 내부 허브 페이지입니다.', children: ['category-ci-cd', 'category-monitoring', 'category-os', 'category-iac', 'category-logging', 'category-message-queue', 'category-cloud', 'stack-datastore', 'stack-database', 'category-ai'] }
      },
      'group-devkit': {
        stack: '',
        virtual: { type: 'aggregate', title: 'DevKit', description: 'DevKit 대분류 하위 카테고리와 스택을 모아보는 내부 허브 페이지입니다.', children: ['category-tools', 'category-activities', 'category-reference'] }
      },
      'category-language': {
        stack: 'stack-programing-language',
        virtual: null
      },
      'category-ci-cd': {
        stack: '',
        virtual: { type: 'aggregate', title: 'CI & CD', description: 'CI & CD 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-gitlab', 'stack-github', 'stack-argo-cd'] }
      },
      'category-monitoring': {
        stack: '',
        virtual: { type: 'aggregate', title: 'Monitoring', description: '모니터링 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-prometheus', 'stack-datasaker'] }
      },
      'category-os': {
        stack: '',
        virtual: { type: 'aggregate', title: 'OS', description: '운영체제 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-linux'] }
      },
      'category-iac': {
        stack: '',
        virtual: { type: 'aggregate', title: 'IaC', description: 'IaC 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-terraform'] }
      },
      'category-logging': {
        stack: '',
        virtual: { type: 'aggregate', title: 'Logging', description: 'Logging 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-elastic-stack'] }
      },
      'category-message-queue': {
        stack: 'stack-message-queue',
        virtual: null
      },
      'category-cloud': {
        stack: '',
        virtual: { type: 'aggregate', title: 'Cloud', description: 'Cloud 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-aws', 'stack-azure', 'stack-openstack'] }
      },
      'category-ai': {
        stack: '',
        virtual: { type: 'aggregate', title: 'AI', description: 'AI 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-open-ai'] }
      },
      'category-tools': {
        stack: '',
        virtual: { type: 'aggregate', title: 'Tools', description: '도구 하위 스택을 묶어 보는 내부 카테고리 페이지입니다.', children: ['stack-eformsign'] }
      },
      'category-activities': {
        stack: '',
        virtual: { type: 'aggregate', title: 'Activities', description: '활동 자료를 묶어 보는 내부 카테고리 페이지입니다.', children: [] }
      },
      'category-reference': {
        stack: 'stack-참고-자료',
        virtual: null
      }
    };
    return map[key] || null;
  }

  function getRouteState() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var querySlug = params.get('stack') || '';
      var queryDoc = params.get('doc') || '';
      var queryPage = Number(params.get('page') || '1') || 1;
      if (querySlug && !queryDoc) {
        var virtualQuery = buildVirtualRouteFromStackSlug(querySlug);
        if (virtualQuery) {
          return {
            stack: virtualQuery.stack || querySlug,
            doc: '',
            page: queryPage > 0 ? queryPage : 1,
            categoryPath: '',
            virtual: virtualQuery.virtual
          };
        }
      }
      if (querySlug || queryDoc) {
        return {
          stack: querySlug,
          doc: queryDoc,
          page: queryPage > 0 ? queryPage : 1
        };
      }

      var hash = String(window.location.hash || '');
      var stackMatch = hash.match(/stack=([^&]+)/);
      var docMatch = hash.match(/doc=([^&]+)/);
      var hashed = {
        stack: stackMatch ? decodeURIComponent(stackMatch[1]) : '',
        doc: docMatch ? decodeURIComponent(docMatch[1]) : '',
        page: 1
      };
      if (hashed.stack || hashed.doc) return hashed;

      return buildCategoryAwareRoute() || { stack: '', doc: '', page: 1, categoryPath: '', virtual: null };
    } catch (error) {
      return { stack: '', doc: '', page: 1 };
    }
  }

  function updateRoute(stack, doc, page, push) {
    try {
      var url = new URL(window.location.href);
      if (stack) url.searchParams.set('stack', stack);
      else url.searchParams.delete('stack');
      if (doc) url.searchParams.set('doc', doc);
      else url.searchParams.delete('doc');
      if (!doc && page && page > 1) url.searchParams.set('page', String(page));
      else url.searchParams.delete('page');
      if (push) window.history.pushState({}, '', url.toString());
      else window.history.replaceState({}, '', url.toString());
    } catch (error) {}
  }

  function setTransitionState(active) {
    var shell = document.querySelector('.js-stack-shell');
    document.body.classList.toggle('is-stack-route-transition', active);
    if (shell) shell.classList.toggle('is-transitioning', active);
  }

  function navigateToStackRoute(stack, doc, page, mode) {
    updateRoute(stack, doc, page, mode !== 'replace');
    setTransitionState(true);
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(function () {
      renderStackPage();
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          setTransitionState(false);
        });
      });
    }, 170);
  }

  function setupCardReveal(scope) {
    var cards = Array.prototype.slice.call((scope || document).querySelectorAll('.stack-article-card'));
    if (!cards.length) return;

    cards.forEach(function (card, index) {
      card.classList.add('is-reveal-ready');
      card.classList.remove('is-visible');
      card.style.setProperty('--stack-delay', String(Math.min(index, 11) * 55) + 'ms');
    });
    window.requestAnimationFrame(function () {
      cards.forEach(function (card) {
        if (!card.hidden) card.classList.add('is-visible');
      });
    });
    window.setTimeout(function () {
      cards.forEach(function (card) {
        if (!card.hidden) card.classList.add('is-visible');
      });
    }, 120);
  }

  function getPaginationContainer(shell) {
    Array.prototype.slice.call(shell.querySelectorAll('.stack-detail-view__pagination, .js-stack-pagination, .stack-category-page__pagination')).forEach(function (node) {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });

    var grid = shell.querySelector('.stack-category-page__section .stack-article-grid') || shell.querySelector('.stack-article-grid');
    if (grid && grid.parentNode) {
      var dynamicContainer = document.createElement('div');
      dynamicContainer.className = 'stack-category-page__pagination js-stack-pagination-anchor';
      grid.parentNode.insertBefore(dynamicContainer, grid.nextSibling);
      return dynamicContainer;
    }
    return null;
  }

  function getShellCardCache(shell) {
    if (!shell) return {};
    if (!shell.__stackCardCache) shell.__stackCardCache = {};
    return shell.__stackCardCache;
  }

  function renderPagination(shell, stackSlug, totalPages, currentPage) {
    var container = getPaginationContainer(shell);
    if (!container) return;
    if (totalPages <= 1) {
      container.innerHTML = '';
      container.hidden = true;
      return;
    }

    container.hidden = false;
    container.innerHTML = '';

    var inner = document.createElement('div');
    inner.className = 'stack-pagination';

    var pages = [];
    var start = Math.max(1, currentPage - 2);
    var end = Math.min(totalPages, currentPage + 2);
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('…');
    for (var i = start; i <= end; i += 1) pages.push(i);
    if (end < totalPages - 1) pages.push('…');
    if (end < totalPages) pages.push(totalPages);

    function addButton(label, targetPage, disabled, current) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'stack-pagination__item' + (current ? ' is-current' : '');
      button.textContent = label;
      button.disabled = !!disabled;
      if (!disabled) {
        button.addEventListener('click', function () {
          navigateToStackRoute(stackSlug, '', targetPage, 'replace');
        });
      }
      inner.appendChild(button);
    }

    addButton('«', 1, currentPage <= 1, false);
    addButton('‹', currentPage - 1, currentPage <= 1, false);
    pages.forEach(function (page) {
      if (page === '…') {
        var spacer = document.createElement('span');
        spacer.className = 'stack-pagination__ellipsis';
        spacer.textContent = '…';
        inner.appendChild(spacer);
        return;
      }
      addButton(String(page), page, false, page === currentPage);
    });
    addButton('›', currentPage + 1, currentPage >= totalPages, false);
    addButton('»', totalPages, currentPage >= totalPages, false);

    container.appendChild(inner);
  }

  function extractStackCardsFromHtml(html) {
    var temp = document.createElement('div');
    temp.innerHTML = String(html || '');
    return Array.prototype.slice.call(temp.querySelectorAll('.stack-article-card')).map(function (card) {
      return card.outerHTML;
    });
  }

  function renderRootCards(articleNode, cardsHtml) {
    articleNode.innerHTML = [
      '<section class="stack-category-page__section">',
      '<div class="stack-article-grid">',
      (cardsHtml || []).join(''),
      '</div>',
      '<div class="stack-category-page__pagination js-stack-pagination-anchor"></div>',
      '</section>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildDocHref(stackSlug, docSlug) {
    return '/?stack=' + encodeURIComponent(stackSlug) + '&doc=' + encodeURIComponent(docSlug);
  }

  function getDocsForStack(stackSlug, docs) {
    return Object.keys(docs || {}).map(function (key) {
      return docs[key];
    }).filter(function (doc) {
      return doc && doc.stackSlug === stackSlug;
    }).sort(function (a, b) {
      return String(a.title || '').localeCompare(String(b.title || ''), 'ko');
    });
  }

  function buildCardsFromDocs(stackSlug, stackTitle, tone, docsForStack) {
    return (docsForStack || []).map(function (doc) {
      return buildCardHtml(
        buildDocHref(stackSlug, doc.slug),
        doc.sectionLabel || '세부 문서',
        doc.title,
        doc.summary,
        stackTitle,
        String((doc.depth || 0) + 1) + ' depth',
        tone,
        doc.sectionLabel || stackTitle
      );
    });
  }

  function buildCardsFromChildren(children, pages) {
    return (children || []).map(function (slug) {
      var childPage = pages[slug];
      if (!childPage) {
        var childVirtual = buildVirtualRouteFromStackSlug(slug);
        if (!childVirtual || !childVirtual.virtual) return null;
        var nestedCount = (childVirtual.virtual.children || []).reduce(function (sum, childSlug) {
          return sum + Number((pages[childSlug] && pages[childSlug].docCount) || 0);
        }, 0);
        return buildCardHtml(
          '/?stack=' + encodeURIComponent(slug),
          '하위 스택',
          childVirtual.virtual.title,
          childVirtual.virtual.description,
          childVirtual.virtual.title,
          String(nestedCount) + ' docs',
          (childVirtual.virtual.children || []).length ? (pages[childVirtual.virtual.children[0]] && pages[childVirtual.virtual.children[0]].tone) || 'blue' : 'blue',
          childVirtual.virtual.title
        );
      }
      return buildCardHtml(
        '/?stack=' + encodeURIComponent(slug),
        '하위 스택',
        childPage.title,
        childPage.description,
        childPage.title,
        String(Number(childPage.docCount || 0)) + ' docs',
        childPage.tone,
        childPage.title
      );
    }).filter(Boolean);
  }

  function enhanceStackRoot(shell, stackSlug, requestedPage, sourceCards) {
    var grid = shell.querySelector('.stack-category-page__section .stack-article-grid') || shell.querySelector('.stack-article-grid');
    var perPage = 12;
    if (!grid) {
      renderPagination(shell, stackSlug, 0, 1);
      return;
    }
    var cardCache = getShellCardCache(shell);
    var allCards = Array.isArray(sourceCards) && sourceCards.length
      ? sourceCards.slice()
      : (Array.isArray(cardCache[stackSlug]) && cardCache[stackSlug].length
          ? cardCache[stackSlug].slice()
          : Array.prototype.slice.call(grid.children).filter(function (child) {
              return child.classList && child.classList.contains('stack-article-card');
            }).map(function (card) {
              return card.outerHTML;
            }));

    if (!allCards.length) {
      renderPagination(shell, stackSlug, 0, 1);
      return;
    }
    cardCache[stackSlug] = allCards.slice();

    var totalPages = Math.max(1, Math.ceil(allCards.length / perPage));
    var currentPage = Math.min(Math.max(requestedPage || 1, 1), totalPages);
    var start = (currentPage - 1) * perPage;
    var end = start + perPage;

    grid.innerHTML = allCards.slice(start, end).join('');

    updateRoute(stackSlug, '', currentPage, false);
    renderPagination(shell, stackSlug, totalPages, currentPage);
    setupCardReveal(grid);
  }

  function hideOtherViews(shell) {
    var main = document.querySelector('.main-content');
    if (!main) return;
    Array.prototype.slice.call(main.children).forEach(function (child) {
      if (child === shell) {
        child.hidden = false;
        return;
      }
      child.hidden = true;
    });
    document.body.classList.add('is-stack-detail-open');
  }

  function showHomeViews(shell) {
    var main = document.querySelector('.main-content');
    if (!main) return;
    Array.prototype.slice.call(main.children).forEach(function (child) {
      child.hidden = false;
    });
    if (shell) shell.hidden = true;
    if (shell) {
      shell.classList.remove('is-stack-root');
      shell.classList.remove('is-stack-doc');
    }
    document.body.classList.remove('is-stack-detail-open');
    document.title = '[##_page_title_##] — [##_title_##]';
  }

  function setTitle(page) {
    if (!page) return;
    document.title = decodeHtml(page.title) + ' — Cause Dev';
  }

  function getMotifConfig(slug, tone, kind, active) {
    var preset = stackMotifs[slug] || {};
    var chips = (preset.chips || []).slice();
    if (kind === 'doc') {
      chips.unshift('Detail');
      if (active.depth) chips.push(String(active.depth) + ' depth');
    } else if (active.docCount) {
      chips.unshift(String(active.docCount) + ' docs');
    }
    return {
      icon: preset.icon || String((active.title || slug || 'ST').trim()).slice(0, 2).toUpperCase(),
      accent: preset.accent || ((tone || 'stack') + ' · library · notes'),
      layers: preset.layers || ['orb', 'grid', 'beam'],
      chips: chips.slice(0, 3)
    };
  }

  function renderHeroMeta(shell, active, kind, slug, tone) {
    var meta = shell.querySelector('.js-stack-hero-meta');
    if (!meta) return;
    var items = [];
    if (kind === 'doc') {
      items.push(active.stackTitle || slug);
      if (active.depth) items.push(String(active.depth) + ' depth');
      items.push('doc view');
    } else {
      items.push(active.categoryPath || 'Summary Stack');
      items.push(String(active.docCount || 0) + ' docs');
    }
    items = items.filter(Boolean).filter(function (item, index, arr) {
      return arr.indexOf(item) === index;
    });
    meta.innerHTML = items.map(function (item) {
      return '<span>' + decodeHtml(item) + '</span>';
    }).join('');
  }

  function renderHeroMotif(shell, slug, tone, kind, active) {
    var motif = shell.querySelector('.js-stack-motif');
    if (!motif) return;
    var config = getMotifConfig(slug, tone, kind, active);
    motif.innerHTML =
      '<div class="stack-motif stack-motif--' + (tone || 'blue') + '">' +
        '<div class="stack-motif__badge">' + decodeHtml(config.icon) + '</div>' +
        '<div class="stack-motif__accent">' + decodeHtml(config.accent) + '</div>' +
        '<div class="stack-motif__chips">' +
          config.chips.map(function (chip) {
            return '<span>' + decodeHtml(chip) + '</span>';
          }).join('') +
        '</div>' +
        '<div class="stack-motif__layers">' +
          config.layers.map(function (layer, index) {
            return '<i class="stack-motif__layer stack-motif__layer--' + layer + ' stack-motif__layer--' + (index + 1) + '"></i>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  function buildCardHtml(href, badge, title, summary, leftMeta, rightMeta, tone, thumbLabel) {
    return [
      '<article class="stack-article-card' + (tone ? ' tone-' + tone : '') + '">',
      '<a class="stack-article-card__link" href="' + href + '">',
      '<div class="stack-article-card__thumb"><span>' + decodeHtml(thumbLabel || leftMeta || 'Stack') + '</span></div>',
      '<div class="stack-article-card__body">',
      '<span class="stack-article-card__badge">' + decodeHtml(badge || '핵심 문서') + '</span>',
      '<h3 class="stack-article-card__title">' + decodeHtml(title || '') + '</h3>',
      '<p class="stack-article-card__summary">' + decodeHtml(summary || '내부 문서를 바로 확인할 수 있습니다.') + '</p>',
      '<div class="stack-article-card__meta"><span>' + decodeHtml(leftMeta || '') + '</span><span>' + decodeHtml(rightMeta || '') + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function buildVirtualAggregatePage(route, pages) {
    var info = route.virtual || {};
    var childPages = (info.children || []).map(function (slug) {
      if (pages[slug]) {
        return {
          slug: slug,
          title: pages[slug].title,
          description: pages[slug].description,
          categoryPath: pages[slug].categoryPath,
          tone: pages[slug].tone,
          docCount: Number(pages[slug].docCount || 0),
          href: '/?stack=' + encodeURIComponent(slug)
        };
      }

      var virtualRoute = buildVirtualRouteFromStackSlug(slug);
      if (!virtualRoute || !virtualRoute.virtual) return null;

      var nestedChildren = (virtualRoute.virtual.children || []).map(function (childSlug) {
        return pages[childSlug];
      }).filter(Boolean);
      var docCount = nestedChildren.reduce(function (sum, page) {
        return sum + Number(page.docCount || 0);
      }, 0);

      return {
        slug: slug,
        title: virtualRoute.virtual.title,
        description: virtualRoute.virtual.description,
        categoryPath: '/category/' + encodeURIComponent(virtualRoute.virtual.title),
        tone: nestedChildren[0] ? nestedChildren[0].tone : 'blue',
        docCount: docCount,
        href: '/?stack=' + encodeURIComponent(slug)
      };
    }).filter(Boolean);
    var totalDocs = childPages.reduce(function (sum, page) { return sum + Number(page.docCount || 0); }, 0);
      return {
        slug: 'virtual-' + info.title,
        title: info.title || 'Category',
        description: info.description || '카테고리 내부 스택을 모았습니다.',
        categoryPath: route.categoryPath || '/category',
        tone: childPages[0] ? childPages[0].tone : 'blue',
        docCount: totalDocs,
        cards: childPages.map(function (page) {
          return buildCardHtml(page.href, '하위 스택', page.title, page.description, info.title || 'Category', String(page.docCount || 0) + ' docs', page.tone, page.title);
        })
      };
  }

  function buildVirtualFilteredPage(route, pages, docs) {
    var info = route.virtual || {};
    var page = pages[route.stack];
    if (!page) return null;
    var token = normalizeCategoryToken(info.filter || info.title || '');
    var docList = Object.keys(docs).map(function (key) { return docs[key]; }).filter(function (doc) {
      if (doc.stackSlug !== route.stack) return false;
      var hay = [
        doc.title,
        doc.summary,
        doc.sectionLabel,
        (doc.breadcrumb || []).join(' ')
      ].join(' ').toLowerCase();
      return hay.indexOf(token) !== -1;
    });

    return {
      slug: route.stack,
      title: info.title || page.title,
      description: (info.title || page.title) + ' 관련 문서를 모아보는 내부 카테고리 페이지입니다.',
      categoryPath: route.categoryPath || page.categoryPath,
      tone: page.tone,
      docCount: docList.length,
      cards: docList.map(function (doc) {
        return buildCardHtml('/?stack=' + encodeURIComponent(route.stack) + '&doc=' + encodeURIComponent(doc.slug), doc.sectionLabel || '세부 문서', doc.title, doc.summary, page.title, (doc.depth + 1) + ' depth', page.tone, doc.sectionLabel || page.title);
      })
    };
  }

  function normalizeRenderedArticle(articleNode, kind) {
    if (!articleNode) return;

    var nestedShell = articleNode.firstElementChild;
    if (nestedShell && nestedShell.classList && nestedShell.classList.contains('stack-category-page')) {
      articleNode.classList.add('stack-category-page');
      articleNode.innerHTML = nestedShell.innerHTML;
    }

    if (kind === 'stack') {
      articleNode.classList.add('stack-category-page');
      Array.prototype.slice.call(articleNode.querySelectorAll('.stack-category-page__intro, .stack-root-entry')).forEach(function (node) {
        node.remove();
      });
      Array.prototype.slice.call(articleNode.querySelectorAll('.stack-category-page__pagination:not(.js-stack-pagination-anchor)')).forEach(function (node) {
        node.remove();
      });
      Array.prototype.slice.call(articleNode.children).forEach(function (node) {
        if (!(node.classList && node.classList.contains('stack-category-page__section'))) {
          node.remove();
        }
      });
    } else {
      articleNode.classList.remove('stack-category-page');
    }

    Array.prototype.slice.call(articleNode.querySelectorAll('p')).forEach(function (paragraph) {
      var text = String(paragraph.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || /^\[?\s*추가 필요한 파일\s*\]?$/i.test(text)) {
        paragraph.remove();
        return;
      }

      if (!paragraph.querySelector('a') && /^https?:\/\/\S+$/i.test(text)) {
        paragraph.classList.add('stack-link-paragraph');
        paragraph.innerHTML = '<a href="' + text + '" target="_blank" rel="noopener">' + text + '</a>';
      }
    });

    Array.prototype.slice.call(articleNode.querySelectorAll('.stack-detail-view__pagination, .js-stack-pagination')).forEach(function (node) {
      if (!node.classList.contains('js-stack-pagination-anchor')) node.remove();
    });
  }

  function renderStackPage() {
    var route = getRouteState();
    var slug = route.stack;
    var routeKey = route.stack;
    var docSlug = route.doc;
    var pageNumber = route.page;
    var shell = document.querySelector('.js-stack-shell');
    if (!slug) {
      showHomeViews(shell);
      return;
    }

    var pages = window.__CAUSE_STACK_PAGES__ || {};
    var docs = window.__CAUSE_STACK_DOCS__ || {};
    var page = pages[slug];
    if (!page && route.virtual && route.virtual.type === 'aggregate') {
      page = buildVirtualAggregatePage(route, pages);
    } else if (route.virtual && route.virtual.type === 'filter') {
      page = buildVirtualFilteredPage(route, pages, docs);
    }
    var doc = docSlug ? docs[slug + ':' + docSlug] : null;
    var active = doc || page;
    var kind = doc ? 'doc' : 'stack';
    var renderSlug = routeKey || (page && page.slug) || slug;

    if (!active || !shell) {
      showHomeViews(shell);
      return;
    }

    var titleNode = shell.querySelector('.js-stack-title');
    var categoryNode = shell.querySelector('.js-stack-category');
    var descNode = shell.querySelector('.js-stack-desc');
    var articleNode = shell.querySelector('.js-stack-article');
    var tone = (doc ? page && page.tone : active.tone) || (page && page.tone) || '';

    shell.classList.toggle('is-stack-root', kind === 'stack');
    shell.classList.toggle('is-stack-doc', kind === 'doc');
    if (tone) shell.setAttribute('data-stack-tone', tone);
    else shell.removeAttribute('data-stack-tone');
    if (renderSlug) shell.setAttribute('data-stack-slug', renderSlug);
    else shell.removeAttribute('data-stack-slug');

    if (titleNode) titleNode.textContent = decodeHtml(active.title || renderSlug);
    if (categoryNode) categoryNode.textContent = doc ? (active.stackTitle || page.title || 'Summary Stack') : (active.categoryPath || 'Summary Stack');
    if (descNode) {
      if (kind === 'doc') {
        descNode.textContent = '';
        descNode.hidden = true;
      } else {
        descNode.hidden = false;
        descNode.textContent = decodeHtml(active.description || '선택한 스택의 내부 상세 페이지입니다.');
      }
    }
    var sourceCards = [];
    if (articleNode) {
      if (kind === 'stack') {
        if (route.virtual && route.virtual.type === 'aggregate') {
          sourceCards = buildCardsFromChildren(route.virtual.children || [], pages);
        } else if (route.virtual && route.virtual.type === 'filter') {
          sourceCards = Array.isArray(active.cards) ? active.cards.slice() : [];
        } else {
          sourceCards = buildCardsFromDocs(renderSlug, active.title, active.tone, getDocsForStack(renderSlug, docs));
        }
        getShellCardCache(shell)[routeKey || renderSlug] = sourceCards.slice();
        renderRootCards(articleNode, sourceCards);
      } else {
        articleNode.innerHTML = active.html || '';
      }
      normalizeRenderedArticle(articleNode, kind);
    }
    renderHeroMeta(shell, active, kind, renderSlug, tone);
    renderHeroMotif(shell, renderSlug, tone, kind, active);
    hideOtherViews(shell);
    setTitle(active);
    if (kind === 'stack') {
      enhanceStackRoot(shell, routeKey || renderSlug, pageNumber, sourceCards);
    } else {
      renderPagination(shell, routeKey || renderSlug, 0, 1);
      setupCardReveal(articleNode);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function getStackRouteFromHref(href) {
    try {
      var url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return null;
      if (url.pathname !== window.location.pathname) return null;
      var stack = url.searchParams.get('stack') || '';
      var doc = url.searchParams.get('doc') || '';
      var page = Number(url.searchParams.get('page') || '1') || 1;
      if (!stack && !doc) return null;
      return { stack: stack, doc: doc, page: page > 0 ? page : 1 };
    } catch (error) {
      return null;
    }
  }

  function bindInternalRouteLinks() {
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var anchor = event.target.closest('a[href]');
      if (!anchor) return;
      var route = getStackRouteFromHref(anchor.getAttribute('href'));
      if (!route) return;

      event.preventDefault();
      navigateToStackRoute(route.stack, route.doc, route.page, 'push');
    });
  }

  document.addEventListener('DOMContentLoaded', renderStackPage);
  document.addEventListener('DOMContentLoaded', bindInternalRouteLinks);
  window.addEventListener('popstate', renderStackPage);
  window.addEventListener('hashchange', renderStackPage);
  window.addEventListener('pageshow', renderStackPage);
})();
