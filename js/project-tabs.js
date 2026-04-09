(function () {
  var tabs = document.getElementById('projectTabs');
  if (!tabs) return;

  tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('.project-tabs__btn');
    if (!btn) return;

    var filter = btn.dataset.filter;

    tabs.querySelectorAll('.project-tabs__btn').forEach(function (b) {
      b.classList.remove('project-tabs__btn--active');
    });
    btn.classList.add('project-tabs__btn--active');

    document.querySelectorAll('#projectGrid .project-card').forEach(function (card) {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('project-card--hidden');
      } else {
        card.classList.add('project-card--hidden');
      }
    });
  });
})();
