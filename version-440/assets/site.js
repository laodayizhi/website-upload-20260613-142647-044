
(function () {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const open = mobilePanel.hasAttribute('hidden');
      if (open) {
        mobilePanel.removeAttribute('hidden');
      } else {
        mobilePanel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('.hero-carousel');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-to') || 0));
        restart();
      });
    });

    restart();
  }

  const filterInput = document.querySelector('.category-filter-input');
  const filterGrid = document.querySelector('.filterable-grid');
  const sortSelect = document.querySelector('.category-sort');

  function applyFilter() {
    if (!filterInput || !filterGrid) {
      return;
    }
    const term = filterInput.value.trim().toLowerCase();
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      const text = (card.getAttribute('data-keywords') || '').toLowerCase();
      card.classList.toggle('is-hidden', term.length > 0 && text.indexOf(term) === -1);
    });
  }

  function applySort() {
    if (!sortSelect || !filterGrid) {
      return;
    }
    const mode = sortSelect.value;
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
    cards.sort(function (a, b) {
      if (mode === 'views') {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }
      if (mode === 'likes') {
        return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
      }
      if (mode === 'year') {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
    });
    cards.forEach(function (card) {
      filterGrid.appendChild(card);
    });
    applyFilter();
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  const rankingTabs = Array.from(document.querySelectorAll('.ranking-tab'));
  const rankingPanels = Array.from(document.querySelectorAll('[data-ranking-panel]'));

  rankingTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.getAttribute('data-ranking-tab');
      rankingTabs.forEach(function (item) {
        item.classList.toggle('active', item === tab);
      });
      rankingPanels.forEach(function (panel) {
        panel.classList.toggle('hidden-panel', panel.getAttribute('data-ranking-panel') !== target);
      });
    });
  });

  const results = document.getElementById('search-results');
  const heading = document.getElementById('search-heading');
  const searchInput = document.getElementById('search-page-input');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.href) + '">',
      '  <div class="card-poster">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="score-badge">★ ' + escapeHtml(movie.rating) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </div>',
      '  <div class="card-content">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  if (results && heading && Array.isArray(window.SITE_MOVIES)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    if (searchInput) {
      searchInput.value = query;
    }
    const lower = query.toLowerCase();
    const matches = lower
      ? window.SITE_MOVIES.filter(function (movie) {
          const haystack = [
            movie.title,
            movie.oneLine,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.category,
            (movie.tags || []).join(' ')
          ].join(' ').toLowerCase();
          return haystack.indexOf(lower) !== -1;
        })
      : window.SITE_MOVIES.slice(0, 48);

    heading.textContent = query ? '搜索结果：' + query : '热门内容';
    results.innerHTML = matches.slice(0, 96).map(movieCard).join('');
  }
})();
