(function () {
  function extractText(node) {
    return node ? String(node.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function extractNumber(text) {
    var match = String(text || '').replace(/,/g, '').match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function normalizeCategoryLabel(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[()]/g, ' ')
      .replace(/&/g, ' and ')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncate(str, len) {
    var value = String(str || '');
    return value.length > len ? value.slice(0, len - 1) + '…' : value;
  }

  function getCategoryVisual(name) {
    var value = String(name || '').toLowerCase();
    var map = [
      { keys: ['aws', 'amazon'], icon: 'fa-brands fa-aws', tone: 'orange' },
      { keys: ['linux'], icon: 'fa-brands fa-linux', tone: 'yellow' },
      { keys: ['git'], icon: 'fa-brands fa-git-alt', tone: 'red' },
      { keys: ['github'], icon: 'fa-brands fa-github', tone: 'dark' },
      { keys: ['node'], icon: 'fa-brands fa-node-js', tone: 'green' },
      { keys: ['mysql', 'maria', 'database', 'db'], icon: 'fa-solid fa-database', tone: 'blue' },
      { keys: ['docker'], icon: 'fa-brands fa-docker', tone: 'blue' },
      { keys: ['kubernetes'], icon: 'fa-solid fa-dharmachakra', tone: 'blue' },
      { keys: ['javascript', 'js'], icon: 'fa-brands fa-js', tone: 'yellow' },
      { keys: ['css', 'style'], icon: 'fa-brands fa-css3-alt', tone: 'blue' },
      { keys: ['html', 'web'], icon: 'fa-solid fa-globe', tone: 'sky' },
      { keys: ['terraform'], icon: 'fa-solid fa-cubes', tone: 'purple' },
      { keys: ['server', 'tomcat', 'apache'], icon: 'fa-solid fa-server', tone: 'gray' },
      { keys: ['windows'], icon: 'fa-brands fa-windows', tone: 'sky' },
      { keys: ['openstack', 'cloud'], icon: 'fa-solid fa-cloud', tone: 'sky' }
    ];

    for (var i = 0; i < map.length; i += 1) {
      if (map[i].keys.some(function (key) { return value.indexOf(key) !== -1; })) return map[i];
    }

    return {
      icon: 'fa-solid fa-layer-group',
      tone: 'gray'
    };
  }

  function getDirectAnchor(li) {
    if (!li || !li.children) return null;
    for (var i = 0; i < li.children.length; i += 1) {
      if ((li.children[i].tagName || '').toLowerCase() === 'a') return li.children[i];
    }
    return li.querySelector('a');
  }

  function getDirectCountNode(anchor, li) {
    if (anchor && anchor.children) {
      for (var i = 0; i < anchor.children.length; i += 1) {
        var child = anchor.children[i];
        if (child.classList && child.classList.contains('c_cnt')) return child;
      }
    }
    if (!li || !li.children) return null;
    for (var j = 0; j < li.children.length; j += 1) {
      var node = li.children[j];
      if (node.classList && node.classList.contains('c_cnt')) return node;
    }
    return null;
  }

  function getDirectChildList(li) {
    if (!li || !li.children) return null;
    for (var i = 0; i < li.children.length; i += 1) {
      if ((li.children[i].tagName || '').toLowerCase() === 'ul') return li.children[i];
    }
    return null;
  }

  function getLiDepth(li) {
    var depth = 0;
    var current = li.parentElement;
    while (current) {
      if ((current.tagName || '').toLowerCase() === 'li') depth += 1;
      current = current.parentElement;
    }
    return depth;
  }

  function collectCategoryTree() {
    var treeRoot = document.querySelector('#categoryTree .tt_category');
    if (!treeRoot) treeRoot = document.getElementById('categoryTree');
    if (!treeRoot) return { top: [], all: [], totalPosts: 0 };

    var items = Array.prototype.slice.call(treeRoot.querySelectorAll('li'));
    var allCategories = [];
    var topCategories = [];
    var totalPosts = 0;

    items.forEach(function (li, index) {
      var anchor = getDirectAnchor(li);
      if (!anchor) return;

      var rawName = extractText(anchor).replace(/\(\d+\)/g, '').trim();
      var href = anchor.getAttribute('href') || '#';
      var countNode = getDirectCountNode(anchor, li);
      var count = extractNumber(countNode ? countNode.textContent : anchor.textContent);
      var depth = getLiDepth(li);

      var category = {
        key: href + '|' + rawName + '|' + index,
        name: rawName,
        href: href,
        count: count,
        depth: depth,
        children: [],
        li: li
      };

      allCategories.push(category);
      if (depth === 0) {
        topCategories.push(category);
        totalPosts += count;
      }
    });

    items.forEach(function (li) {
      var currentAnchor = getDirectAnchor(li);
      var parentLi = li.parentElement ? li.parentElement.closest('li') : null;
      if (!currentAnchor || !parentLi) return;

      var currentHref = currentAnchor.getAttribute('href') || '#';
      var currentName = extractText(currentAnchor).replace(/\(\d+\)/g, '').trim();
      var parentAnchor = getDirectAnchor(parentLi);
      if (!parentAnchor) return;

      var parentHref = parentAnchor.getAttribute('href') || '#';
      var parentName = extractText(parentAnchor).replace(/\(\d+\)/g, '').trim();

      var currentCategory = allCategories.find(function (item) {
        return item.li === li && item.href === currentHref && item.name === currentName;
      });
      var parentCategory = allCategories.find(function (item) {
        return item.li === parentLi && item.href === parentHref && item.name === parentName;
      });

      if (currentCategory && parentCategory) {
        parentCategory.children.push(currentCategory);
        currentCategory.parent = parentCategory;
      }
    });

    return {
      top: topCategories,
      all: allCategories,
      totalPosts: totalPosts
    };
  }

  function classifyTopCategories(topCategories) {
    var categoryConfig = {
      develop: ['html', 'mark', 'markup', 'style', 'css', 'sass', 'scss', 'frontend', 'react', 'next', 'vue', 'javascript', 'typescript', 'node', 'backend', 'spring', 'api', 'language', 'framework'],
      devops: ['aws', 'cloud', 'docker', 'kubernetes', 'terraform', 'devops', 'sre', 'observability', 'jenkins', 'github', 'git', 'linux', 'network', 'server', 'architecture', 'infra', 'platform', 'mlops', 'data'],
      devkit: ['tool', 'ide', 'vscode', 'intellij', 'cursor', 'chrome', 'cli', 'automation', 'utility', 'productivity', 'editor']
    };

    var buckets = { develop: [], devops: [], devkit: [] };
    var unknown = [];

    topCategories.forEach(function (category) {
      var haystack = [category.name, category.href].concat(category.children.map(function (child) {
        return child.name + ' ' + child.href;
      })).join(' ').toLowerCase();

      var bestPanel = null;
      var bestScore = 0;

      Object.keys(categoryConfig).forEach(function (panel) {
        var score = 0;
        categoryConfig[panel].forEach(function (keyword) {
          if (haystack.indexOf(keyword) !== -1) score += 1;
        });
        if (score > bestScore) {
          bestScore = score;
          bestPanel = panel;
        }
      });

      if (bestPanel) buckets[bestPanel].push(category);
      else unknown.push(category);
    });

    ['develop', 'devops', 'devkit'].forEach(function (panel, index) {
      unknown.filter(function (_, unknownIndex) {
        return unknownIndex % 3 === index;
      }).forEach(function (category) {
        buckets[panel].push(category);
      });
    });

    return buckets;
  }

  function findCategoryLink(treeData, keywords, fallbackHref) {
    var items = treeData.all || [];
    var lowered = (keywords || []).map(function (item) {
      return String(item).toLowerCase();
    });

    for (var i = 0; i < items.length; i += 1) {
      var haystack = (String(items[i].name || '') + ' ' + String(items[i].href || '')).toLowerCase();
      if (lowered.some(function (keyword) { return haystack.indexOf(keyword) !== -1; })) {
        return {
          label: items[i].name,
          href: items[i].href
        };
      }
    }

    return null;
  }

  function resolveLink(treeData, label, keywords, fallbackHref) {
    var matched = findCategoryLink(treeData, keywords, fallbackHref);
    return matched || { label: label, href: fallbackHref || '/category' };
  }

  function categoryPath() {
    var parts = Array.prototype.slice.call(arguments).filter(Boolean).map(function (part) {
      return encodeURIComponent(String(part).trim()).replace(/%20/g, '%20');
    });
    return '/category/' + parts.join('/');
  }

  function buildTreeCategoryHref(item) {
    if (!item || !item.name) return null;
    var label = normalizeCategoryLabel(item.name);
    var parentLabel = item.parent ? normalizeCategoryLabel(item.parent.name) : '';
    var aggregateTopMap = {
      'language': entryPath('category-language'),
      'ci and cd': entryPath('category-ci-cd'),
      'monitoring': entryPath('category-monitoring'),
      'os': entryPath('category-os'),
      'iac': entryPath('category-iac'),
      'logging': entryPath('category-logging'),
      'cloud': entryPath('category-cloud'),
      'ai': entryPath('category-ai'),
      'tools': entryPath('category-tools'),
      'activities': entryPath('category-activities'),
      'reference': entryPath('category-reference')
    };
    var directMap = {
      'kubernetes': entryPath('stack-kubernetes'),
      'docker': entryPath('stack-docker'),
      'gitlab': entryPath('stack-gitlab'),
      'github': entryPath('stack-github'),
      'argo cd': entryPath('stack-argo-cd'),
      'prometheus and grafana': entryPath('stack-prometheus'),
      'datasaker': entryPath('stack-datasaker'),
      'linux': entryPath('stack-linux'),
      'terraform': entryPath('stack-terraform'),
      'elastic stack': entryPath('stack-elastic-stack'),
      'message queue': entryPath('stack-message-queue'),
      'kafka': entryPath('stack-message-queue'),
      'amazon': entryPath('stack-aws'),
      'aws': entryPath('stack-aws'),
      'azure': entryPath('stack-azure'),
      'openstack private': entryPath('stack-openstack'),
      'openstack': entryPath('stack-openstack'),
      'datastore': entryPath('stack-datastore'),
      'database': entryPath('stack-database'),
      'open ai': entryPath('stack-open-ai'),
      'reference': entryPath('stack-참고-자료'),
      'eformsign': entryPath('stack-eformsign')
    };

    if (item.children && item.children.length) {
      return '#';
    }

    if (parentLabel === 'language') return entryPath('stack-programing-language');
    if (parentLabel === 'ci and cd' && directMap[label]) return directMap[label];
    if (parentLabel === 'monitoring' && directMap[label]) return directMap[label];
    if (parentLabel === 'cloud' && directMap[label]) return directMap[label];
    if (parentLabel === 'tools' && directMap[label]) return directMap[label];
    if (parentLabel === 'ai' && directMap[label]) return directMap[label];
    if (directMap[label]) return directMap[label];

    if (item.depth === 0 && aggregateTopMap[label]) {
      return aggregateTopMap[label];
    }
    if (item.depth === 0) return aggregateTopMap[label] || directMap[label] || categoryPath(item.name);
    if (item.parent && item.parent.name) return categoryPath(item.parent.name, item.name);
    return categoryPath(item.name);
  }

  function entryPath(slug) {
    return '/?stack=' + encodeURIComponent(String(slug || '').trim()).replace(/%20/g, '%20');
  }

  function buildCategoryHref(label) {
    var key = String(label || '').toLowerCase();
    var map = {
      'programing language': entryPath('category-language'),
      'language': entryPath('category-language'),
      'kubernetes': entryPath('stack-kubernetes'),
      'docker': entryPath('stack-docker'),
      'aws': entryPath('stack-aws'),
      'amazon': entryPath('stack-aws'),
      'azure': entryPath('stack-azure'),
      'gitlab': entryPath('stack-gitlab'),
      'github': entryPath('stack-github'),
      'argo cd': entryPath('stack-argo-cd'),
      'prometheus / grafana': entryPath('stack-prometheus'),
      'monitoring': entryPath('category-monitoring'),
      'linux': entryPath('stack-linux'),
      'os': entryPath('category-os'),
      'server': entryPath('stack-server'),
      'terraform': entryPath('stack-terraform'),
      'iac': entryPath('category-iac'),
      'elastic stack': entryPath('stack-elastic-stack'),
      'logging': entryPath('category-logging'),
      'message queue': entryPath('category-message-queue'),
      'openstack': entryPath('stack-openstack'),
      'cloud': entryPath('category-cloud'),
      'datastore': entryPath('stack-datastore'),
      'database': entryPath('stack-database'),
      'datasaker': entryPath('stack-datasaker'),
      'open ai': entryPath('stack-open-ai'),
      'ai': entryPath('category-ai'),
      'eformsign': entryPath('stack-eformsign'),
      'tools': entryPath('category-tools'),
      'activities': entryPath('category-activities'),
      'reference': entryPath('category-reference'),
      '참고 자료': entryPath('category-reference')
    };

    return map[key] || categoryPath(label || 'category');
  }

  function applyInternalLinks(treeData) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-category-keywords]'));
    if (!nodes.length) return;

    nodes.forEach(function (node) {
      var entrySlug = node.getAttribute('data-entry-slug');
      if (entrySlug) {
        node.setAttribute('href', entryPath(entrySlug));
        return;
      }

      var raw = node.getAttribute('data-category-keywords') || '';
      var keywords = raw.split(',').map(function (item) {
        return item.trim();
      }).filter(Boolean);

      var matched = findCategoryLink(treeData, keywords, '/category');
      if (matched && matched.href) {
        node.setAttribute('href', matched.href);
        node.setAttribute('data-resolved-category', matched.name || '');
      } else {
        var strong = node.querySelector('strong');
        var label = extractText(strong) || extractText(node);
        node.setAttribute('href', buildCategoryHref(label));
        node.setAttribute('data-resolved-category', '');
      }
    });
  }

  function buildSyntheticCountMap() {
    var pages = window.__CAUSE_STACK_PAGES__ || {};
    var docs = window.__CAUSE_STACK_DOCS__ || {};
    var counts = {};
    var normalizedCounts = {};

    function add(label, amount) {
      if (!label) return;
      counts[label] = (counts[label] || 0) + Number(amount || 0);
      normalizedCounts[normalizeCategoryLabel(label)] = counts[label];
    }

    function countDocs(predicate) {
      return Object.keys(docs).reduce(function (sum, key) {
        return sum + (predicate(docs[key]) ? 1 : 0);
      }, 0);
    }

    function breadcrumbHas(doc, token) {
      var normalized = normalizeCategoryLabel(token);
      return []
        .concat(doc.breadcrumb || [])
        .concat([doc.sectionLabel, doc.title, doc.stackTitle])
        .map(normalizeCategoryLabel)
        .some(function (value) {
          return value === normalized;
        });
    }

    function breadcrumbDepthEquals(doc, depth, token) {
      var breadcrumb = Array.isArray(doc.breadcrumb) ? doc.breadcrumb : [];
      if (!breadcrumb[depth]) return false;
      return normalizeCategoryLabel(breadcrumb[depth]) === normalizeCategoryLabel(token);
    }

    function exactToken(doc, token) {
      var normalized = normalizeCategoryLabel(token);
      return []
        .concat(doc.breadcrumb || [])
        .concat([doc.sectionLabel, doc.title, doc.stackTitle])
        .map(normalizeCategoryLabel)
        .some(function (value) {
          return value === normalized;
        });
    }

    function stackCount(slug) {
      return Number((pages[slug] && pages[slug].docCount) || 0);
    }

    add('Language', stackCount('stack-programing-language'));
    add('Python', countDocs(function (doc) {
      return doc.stackSlug === 'stack-programing-language' && (
        breadcrumbDepthEquals(doc, 1, 'Python') ||
        normalizeCategoryLabel(doc.title) === 'python'
      );
    }));
    add('Java', countDocs(function (doc) {
      return doc.stackSlug === 'stack-programing-language' && (
        breadcrumbDepthEquals(doc, 1, 'Java') ||
        normalizeCategoryLabel(doc.title) === 'java' ||
        normalizeCategoryLabel(doc.sectionLabel) === 'java'
      );
    }));
    add('BashShell', countDocs(function (doc) { return doc.stackSlug === 'stack-programing-language' && breadcrumbDepthEquals(doc, 1, 'BashShell'); }));
    add('JavaScript', countDocs(function (doc) {
      return doc.stackSlug === 'stack-programing-language' && (
        breadcrumbDepthEquals(doc, 1, 'JavaScript') ||
        normalizeCategoryLabel(doc.title) === 'javascript'
      );
    }));
    add('TypeScript', countDocs(function (doc) {
      return doc.stackSlug === 'stack-programing-language' && (
        breadcrumbDepthEquals(doc, 1, 'TypeScript') ||
        normalizeCategoryLabel(doc.title) === 'typescript'
      );
    }));

    add('Kubernetes', stackCount('stack-kubernetes'));
    add('Docker', stackCount('stack-docker'));

    add('Gitlab', stackCount('stack-gitlab'));
    add('Github', stackCount('stack-github'));
    add('Argo CD', stackCount('stack-argo-cd'));
    add('CI & CD', counts['Gitlab'] + counts['Github'] + counts['Argo CD']);

    add('Prometheus & Grafana', stackCount('stack-prometheus'));
    add('Datasaker', stackCount('stack-datasaker'));
    add('Monitoring', counts['Prometheus & Grafana'] + counts['Datasaker']);

    add('Linux', stackCount('stack-linux'));
    add('Windows', countDocs(function (doc) {
      return breadcrumbDepthEquals(doc, 1, 'Windows') || normalizeCategoryLabel(doc.title) === 'windows';
    }));
    add('OS', counts['Linux'] + counts['Windows']);

    add('Terraform', stackCount('stack-terraform'));
    add('Ansible', countDocs(function (doc) { return exactToken(doc, 'Ansible'); }));
    add('IaC', counts['Terraform'] + counts['Ansible']);

    add('Elastic Stack', stackCount('stack-elastic-stack'));
    add('Logging', counts['Elastic Stack']);

    add('Kafka', countDocs(function (doc) {
      return doc.stackSlug === 'stack-message-queue' && (
        breadcrumbDepthEquals(doc, 1, 'Kafka ( Apache )') ||
        normalizeCategoryLabel(doc.title) === 'kafka apache'
      );
    }));
    add('Message Queue', stackCount('stack-message-queue'));

    add('Amazon', stackCount('stack-aws'));
    add('Azure', stackCount('stack-azure'));
    add('Google', countDocs(function (doc) { return exactToken(doc, 'Google'); }));
    add('OpenStack(Private)', stackCount('stack-openstack'));
    add('Cloud', counts['Amazon'] + counts['Azure'] + counts['Google'] + counts['OpenStack(Private)']);

    add('Datastore', stackCount('stack-datastore'));
    add('Database', stackCount('stack-database'));

    add('MCP', countDocs(function (doc) { return exactToken(doc, 'MCP'); }));
    add('Open AI', stackCount('stack-open-ai'));
    add('AI', counts['MCP'] + counts['Open AI']);

    add('Vmware', countDocs(function (doc) { return breadcrumbDepthEquals(doc, 1, 'Vmware') || exactToken(doc, 'Vmware'); }));
    add('Virtualbox', countDocs(function (doc) {
      return breadcrumbDepthEquals(doc, 1, 'Virtualbox') ||
        exactToken(doc, 'Virtualbox') ||
        normalizeCategoryLabel(doc.title).indexOf('virtualbox') !== -1;
    }));
    add('Nutanix', countDocs(function (doc) { return breadcrumbDepthEquals(doc, 1, 'Nutanix') || exactToken(doc, 'Nutanix'); }));
    add('Tools', counts['Vmware'] + counts['Virtualbox'] + counts['Nutanix']);

    add('Activities', countDocs(function (doc) { return breadcrumbHas(doc, 'Activities'); }));
    add('Reference', stackCount('stack-참고-자료'));

    return {
      counts: counts,
      normalized: normalizedCounts
    };
  }

  function applySyntheticCategoryCounts(treeData) {
    var countMapBundle = buildSyntheticCountMap();
    var countMap = countMapBundle.counts;
    var normalizedMap = countMapBundle.normalized;
    if (!treeData || !treeData.all) return;

    treeData.all.forEach(function (item) {
      var label = String(item.name || '').trim();
      if (!label) return;
      var mappedCount = Number(normalizedMap[normalizeCategoryLabel(label)] || countMap[label] || 0);

      item.count = mappedCount;
      var countNode = item.li ? getDirectCountNode(getDirectAnchor(item.li), item.li) : null;
      if (!countNode) {
        var anchor = item.li ? getDirectAnchor(item.li) : null;
        if (anchor) {
          countNode = document.createElement('span');
          countNode.className = 'c_cnt';
          anchor.appendChild(document.createTextNode(' '));
          anchor.appendChild(countNode);
        }
      }
      if (countNode) countNode.textContent = '(' + mappedCount + ')';

      var anchor = item.li ? getDirectAnchor(item.li) : null;
      var href = buildTreeCategoryHref(item);
      if (anchor && href && label !== '분류 전체보기') {
        anchor.setAttribute('href', href);
      }
    });

    treeData.top.forEach(function (item) {
      if (item.children && item.children.length) {
        var childSum = item.children.reduce(function (sum, child) {
          return sum + Number(child.count || 0);
        }, 0);
        item.count = childSum;
        var countNode = item.li ? getDirectCountNode(getDirectAnchor(item.li), item.li) : null;
        if (countNode) countNode.textContent = '(' + childSum + ')';
      }
    });

    treeData.totalPosts = treeData.top.reduce(function (sum, item) {
      return sum + Number(item.count || 0);
    }, 0);

    var categoryRoot = document.querySelector('#categoryTree .tt_category .link_tit') || document.querySelector('#categoryTree .link_tit');
    if (categoryRoot) {
      var rootCountNode = categoryRoot.querySelector('.c_cnt');
      if (!rootCountNode) {
        rootCountNode = document.createElement('span');
        rootCountNode.className = 'c_cnt';
        categoryRoot.appendChild(document.createTextNode(' '));
        categoryRoot.appendChild(rootCountNode);
      }
      rootCountNode.textContent = '(' + treeData.totalPosts + ')';
    }
  }

  function renderMegaPanels(treeData) {
    var topnav = document.querySelector('.topnav');
    var megaNav = document.getElementById('sidebarMega');
    if (!topnav || !megaNav || !treeData || !treeData.top) return;

    var topItems = treeData.top.filter(function (item) {
      return item.name && item.name !== '분류 전체보기';
    });
    var normalizedIndex = {};
    topItems.forEach(function (item) {
      normalizedIndex[normalizeCategoryLabel(item.name)] = item;
    });

    function getTreeItem(label) {
      return normalizedIndex[normalizeCategoryLabel(label)] || null;
    }

    function getTopLevelHref(label, fallback) {
      var item = getTreeItem(label);
      if (!item) return fallback;
      if (item.depth === 0 && item.href) return item.href;
      return buildTreeCategoryHref(item) || fallback;
    }

    function getLeafHref(label, fallback) {
      var item = getTreeItem(label);
      if (!item) return fallback;
      return buildTreeCategoryHref(item) || item.href || fallback;
    }

    var groupedPanels = [
      {
        key: 'develop',
        label: 'Develop',
        href: entryPath('group-develop'),
        groups: [
          {
            title: 'Core',
            items: [
              { label: 'Language', href: entryPath('category-language') },
              { label: 'Kubernetes', href: getLeafHref('Kubernetes', '/?stack=stack-kubernetes') },
              { label: 'Docker', href: getLeafHref('Docker', '/?stack=stack-docker') }
            ]
          }
        ]
      },
      {
        key: 'devops',
        label: 'DevOps',
        href: entryPath('group-devops'),
        groups: [
          {
            title: 'Infra',
            items: [
              { label: 'CI & CD', href: entryPath('category-ci-cd') },
              { label: 'Monitoring', href: entryPath('category-monitoring') },
              { label: 'OS', href: entryPath('category-os') },
              { label: 'IaC', href: entryPath('category-iac') },
              { label: 'Logging', href: entryPath('category-logging') },
              { label: 'Message Queue', href: entryPath('category-message-queue') }
            ]
          },
          {
            title: 'Platform',
            items: [
              { label: 'Cloud', href: entryPath('category-cloud') },
              { label: 'Datastore', href: getLeafHref('Datastore', '/?stack=stack-datastore') },
              { label: 'Database', href: getLeafHref('Database', '/?stack=stack-database') },
              { label: 'AI', href: entryPath('category-ai') }
            ]
          }
        ]
      },
      {
        key: 'devkit',
        label: 'DevKit',
        href: entryPath('group-devkit'),
        groups: [
          {
            title: 'Workspace',
            items: [
              { label: 'Tools', href: entryPath('category-tools') },
              { label: 'Activities', href: entryPath('category-activities') },
              { label: 'Reference', href: entryPath('category-reference') }
            ]
          }
        ]
      },
      {
        key: 'page',
        label: 'Page',
        href: '/category',
        items: []
      }
    ];

    Array.prototype.slice.call(topnav.querySelectorAll('.topnav__link')).forEach(function (link, index) {
      var panel = groupedPanels[index];
      if (!panel) return;
      link.setAttribute('data-menu-target', panel.key);
      link.setAttribute('data-link', panel.href || '#');
      link.textContent = panel.label;
    });

    megaNav.innerHTML = groupedPanels.map(function (panel, index) {
      if (panel.key === 'page') {
        return [
          '<section class="mega-panel', index === 0 ? ' is-active' : '', '" data-panel="page">',
          '<h3 class="mega-panel__title">Page</h3>',
          '<div class="mega-auto">',
          '<div class="mega-group"><h4>SITE</h4><div class="mega-tags">',
          '<a href="/">홈</a>',
          '<a href="/category">전체 글</a>',
          '<a href="/tag">태그</a>',
          '<a href="/notice">공지사항</a>',
          '<a href="/guestbook">방명록</a>',
          '<a href="/rss">RSS</a>',
          '</div></div>',
          '<div class="mega-group"><h4>DOCS</h4><div class="mega-tags">',
          '<a href="/#portfolioDocs">Portfolio</a>',
          '<a href="/?home=1#summaryStack">Summary</a>',
          '<a href="/?home=1#knowledgeShelf">Knowledge Map</a>',
          '<a href="/?home=1#projectArchive">Project</a>',
          '<a href="/?home=1#contactBand">Contact</a>',
          '</div></div>',
          '</div>',
          '</section>'
        ].join('');
      }

      var groups = panel.groups || [];
      var groupsHtml = groups.map(function (group) {
        return [
          '<div class="mega-group">',
          '<h4>', escapeHtml(group.title), '</h4>',
          '<div class="mega-tags">',
          (group.items || []).map(function (link) {
            return '<a href="' + escapeHtml(link.href) + '">' + escapeHtml(link.label) + '</a>';
          }).join(''),
          '</div>',
          '</div>'
        ].join('');
      }).join('');

      return [
        '<section class="mega-panel', index === 0 ? ' is-active' : '', '" data-panel="', panel.key, '" data-group-count="', String(groups.length || 1), '">',
        '<h3 class="mega-panel__title">', escapeHtml(panel.label), '</h3>',
        '<div class="mega-auto">',
        groupsHtml,
        '</div>',
        '</section>'
      ].join('');
    }).join('');
  }

  function getSidebarItems(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector + ' .thumb-list__item')).map(function (item) {
      var link = item.querySelector('a');
      var title = extractText(item.querySelector('strong'));
      var date = extractText(item.querySelector('span'));
      var image = item.querySelector('img');
      return {
        href: link ? link.getAttribute('href') : '#',
        title: title,
        date: date,
        thumb: image ? image.getAttribute('src') : '',
        summary: title ? truncate(title, 58) + ' 관련 내용을 확인해보세요.' : '게시글 요약이 표시됩니다.'
      };
    }).filter(function (item) {
      return item.title;
    });
  }

  function renderCategoryRanking(treeData) {
    var container = document.querySelector('.js-category-rank');
    if (!container) return;

    var ranked = treeData.all
      .filter(function (item) { return item.name && item.count > 0; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 8);

    if (!ranked.length) return;

    container.innerHTML = ranked.map(function (item, index) {
      var visual = getCategoryVisual(item.name);
      var href = buildTreeCategoryHref(item) || item.href || buildCategoryHref(item.name);
      return [
        '<a class="category-rank-card" href="', escapeHtml(href), '">',
        '<span class="category-rank-card__rank">#', String(index + 1), '</span>',
        '<span class="category-rank-card__icon is-', escapeHtml(visual.tone), '"><i class="', escapeHtml(visual.icon), '"></i></span>',
        '<strong>', escapeHtml(item.name), '</strong>',
        '<span>', String(item.count), ' Articles</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  function renderLatestShowcase(posts) {
    var container = document.querySelector('.js-latest-showcase');
    if (!container || !posts.length) return;

    var featured = posts[0];
    var sidePosts = posts.slice(1, 4);
    var featuredThumb = featured.thumb
      ? '<div class="latest-card__thumb"><img src="' + escapeHtml(featured.thumb) + '" alt=""></div>'
      : '';

    container.innerHTML = [
      '<article class="latest-card">',
      '<a href="', escapeHtml(featured.href), '">',
      featuredThumb,
      '<div class="latest-card__body">',
      '<div class="latest-card__meta"><span>Latest</span><time>', escapeHtml(featured.date), '</time></div>',
      '<h3 class="latest-card__title">', escapeHtml(featured.title), '</h3>',
      '<p class="latest-card__summary">', escapeHtml(featured.summary), '</p>',
      '</div>',
      '</a>',
      '</article>',
      '<div class="latest-layout__side">',
      sidePosts.map(function (post) {
        var thumb = post.thumb
          ? '<a href="' + escapeHtml(post.href) + '" class="latest-side-card__thumb"><img src="' + escapeHtml(post.thumb) + '" alt=""></a>'
          : '<a href="' + escapeHtml(post.href) + '" class="latest-side-card__thumb"></a>';

        return [
          '<article class="latest-side-card">',
          thumb,
          '<div class="latest-side-card__body">',
          '<div class="latest-side-card__meta"><span>Update</span><time>', escapeHtml(post.date), '</time></div>',
          '<h3 class="latest-side-card__title"><a href="', escapeHtml(post.href), '">', escapeHtml(post.title), '</a></h3>',
          '<p class="latest-side-card__summary">', escapeHtml(post.summary), '</p>',
          '</div>',
          '</article>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function renderPopular(posts) {
    var container = document.querySelector('.js-popular-grid');
    if (!container || !posts.length) return;

    container.innerHTML = posts.slice(0, 4).map(function (post) {
      var thumb = post.thumb
        ? '<div class="popular-card__thumb"><img src="' + escapeHtml(post.thumb) + '" alt=""></div>'
        : '<div class="popular-card__thumb"></div>';

      return [
        '<article class="popular-card">',
        '<a href="', escapeHtml(post.href), '">',
        thumb,
        '<div class="popular-card__body">',
        '<div class="popular-card__meta"><span>Popular</span><time>', escapeHtml(post.date), '</time></div>',
        '<h3 class="popular-card__title">', escapeHtml(post.title), '</h3>',
        '<p class="popular-card__summary">', escapeHtml(post.summary), '</p>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderCategoryHub(treeData) {
    var container = document.querySelector('.js-category-hub');
    if (!container) return;

    var topCategories = treeData.top.filter(function (item) {
      return item.name;
    }).slice(0, 12);

    if (!topCategories.length) return;

    container.innerHTML = topCategories.map(function (category) {
      var childLinks = category.children.length
        ? category.children.slice(0, 6).map(function (child) {
            return '<a href="' + escapeHtml(child.href) + '">' + escapeHtml(child.name) + '</a>';
          }).join('')
        : '<a href="' + escapeHtml(category.href) + '">바로가기</a>';

      return [
        '<article class="hub-tree-card">',
        '<div class="hub-tree-card__head">',
        '<div>',
        '<strong><a href="', escapeHtml(category.href), '">', escapeHtml(category.name), '</a></strong>',
        '<span>', String(category.count), ' posts</span>',
        '</div>',
        '<a class="hub-tree-card__more" href="', escapeHtml(category.href), '"><i class="fa-solid fa-arrow-right"></i></a>',
        '</div>',
        '<div class="hub-tree-card__links">', childLinks, '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function updateStats(treeData, recentPosts) {
    var postCount = treeData.totalPosts || recentPosts.length || 0;
    var pages = window.__CAUSE_STACK_PAGES__ || {};
    var actualCategoryCount = Object.keys(pages).filter(function (slug) {
      var page = pages[slug];
      return slug.indexOf('stack-') === 0
        && page
        && page.categoryPath
        && page.categoryPath !== '/category'
        && Number(page.docCount || 0) > 0;
    }).length;
    var activeTopCategories = actualCategoryCount || treeData.top.filter(function (item) {
      return item.count > 0 || item.children.length;
    }).length;

    Array.prototype.slice.call(document.querySelectorAll('[data-stat="posts"]')).forEach(function (node) {
      node.textContent = String(postCount);
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-stat="categories"]')).forEach(function (node) {
      node.textContent = String(activeTopCategories);
    });

    var appRoot = document.getElementById('appRoot');
    var daysCount = document.getElementById('daysCount');
    var baseDays = appRoot ? parseInt(appRoot.getAttribute('data-days-base') || '211', 10) : 211;
    var baseDaysDate = appRoot ? appRoot.getAttribute('data-days-base-date') : '';
    if (daysCount && baseDaysDate) {
      var baseDate = new Date(baseDaysDate + 'T00:00:00');
      var today = new Date();
      var elapsed = Math.max(0, Math.floor((today - baseDate) / 86400000));
      daysCount.textContent = String(baseDays + elapsed);
    }

    var totalBase = appRoot ? parseInt(appRoot.getAttribute('data-total-base') || '13523', 10) : 13523;
    Array.prototype.slice.call(document.querySelectorAll('[data-total-counter]')).forEach(function (node) {
      var raw = String(node.textContent || '').replace(/[^\d]/g, '');
      var actual = raw ? parseInt(raw, 10) : 0;
      node.textContent = String(totalBase + actual);
    });
  }

  function renderRelatedPosts(posts) {
    var wrap = document.querySelector('.js-related-posts .related-posts__grid');
    if (!wrap || !posts.length) return;

    wrap.innerHTML = posts.slice(0, 3).map(function (post, index) {
      var thumb = post.thumb
        ? '<div class="related-post__thumb"><img src="' + escapeHtml(post.thumb) + '" alt=""></div>'
        : '<div class="related-post__thumb"></div>';

      return [
        '<article class="related-post">',
        '<a href="', escapeHtml(post.href), '">',
        thumb,
        '<div class="related-post__body">',
        '<div class="related-post__meta"><span>', index === 0 ? 'Recent' : 'Recommended', '</span><time>', escapeHtml(post.date), '</time></div>',
        '<h3 class="related-post__title">', escapeHtml(post.title), '</h3>',
        '<p class="related-post__summary">', escapeHtml(post.summary), '</p>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderFooterPosts(recentPosts, popularPosts) {
    function makeList(selector, posts) {
      var wrap = document.querySelector(selector);
      if (!wrap || !posts.length) return;

      wrap.innerHTML = posts.slice(0, 5).map(function (post) {
        var thumb = post.thumb
          ? '<img class="home-mini-posts__thumb" src="' + escapeHtml(post.thumb) + '" alt="">'
          : '<span class="home-mini-posts__thumb home-mini-posts__thumb--empty"><i class="fa-regular fa-file-lines"></i></span>';

        return [
          '<li>',
          '<a href="', escapeHtml(post.href), '" class="home-mini-posts__item">',
          thumb,
          '<span class="home-mini-posts__text">',
          '<strong>', escapeHtml(truncate(post.title, 42)), '</strong>',
          '<small>', escapeHtml(post.date), '</small>',
          '</span>',
          '</a>',
          '</li>'
        ].join('');
      }).join('');
    }

    makeList('.js-footer-recent', recentPosts);
    makeList('.js-footer-popular', popularPosts);
  }

  var treeData = collectCategoryTree();
  applySyntheticCategoryCounts(treeData);
  var recentPosts = getSidebarItems('.js-sidebar-recent');
  var popularPosts = getSidebarItems('.js-sidebar-popular');
  var relatedSource = recentPosts.concat(popularPosts).filter(function (item, index, arr) {
    return arr.findIndex(function (candidate) {
      return candidate.href === item.href;
    }) === index;
  });

  renderMegaPanels(treeData);
  applyInternalLinks(treeData);
  renderCategoryRanking(treeData);
  renderLatestShowcase(recentPosts);
  renderPopular(popularPosts);
  renderCategoryHub(treeData);
  updateStats(treeData, recentPosts);
  renderRelatedPosts(relatedSource);
  renderFooterPosts(recentPosts, popularPosts);
})();
