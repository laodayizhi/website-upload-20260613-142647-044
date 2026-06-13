/* Static site interactions: mobile navigation, hero carousel, filters, search page, image fallback, and HLS player. */

(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var poster = image.closest('.movie-poster, .detail-cover, .hero-side-panel, .rank-item');
        if (poster) {
          poster.classList.add('poster-fallback');
        }
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }

      timer = window.setInterval(function () {
        activate(current + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        activate(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupCardFilters() {
    var scope = document.querySelector('[data-filter-scope]');

    if (!scope) {
      return;
    }

    var searchInput = scope.querySelector('[data-card-search]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var regionSelect = scope.querySelector('[data-region-filter]');
    var resultCount = document.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.tags
        ].join(' '));

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || card.dataset.year === year;
        var matchesType = !type || card.dataset.type === type;
        var matchesRegion = !region || card.dataset.region === region;
        var shouldShow = matchesQuery && matchesYear && matchesType && matchesRegion;

        card.classList.toggle('hidden-card', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-site-search-form]');
    var input = document.querySelector('[data-site-search-input]');
    var results = document.querySelector('[data-site-search-results]');
    var count = document.querySelector('[data-site-search-count]');

    if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function render(query) {
      var normalized = normalize(query);
      var data = window.MOVIE_SEARCH_INDEX;
      var matched = [];

      if (normalized) {
        matched = data.filter(function (item) {
          return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.tags + ' ' + item.oneLine).indexOf(normalized) !== -1;
        }).slice(0, 120);
      } else {
        matched = data.slice(0, 60);
      }

      results.innerHTML = matched.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="movie-poster" href="' + item.url + '" aria-label="观看 ' + item.title.replace(/"/g, '&quot;') + '">',
          '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + ' 封面" loading="lazy">',
          '    <span class="movie-year">' + item.year + '</span>',
          '    <span class="movie-play-icon">▶</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="movie-card-meta"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
          '    <h3><a href="' + item.url + '">' + item.title + '</a></h3>',
          '    <p>' + item.oneLine + '</p>',
          '    <div class="movie-tags"><span>' + item.category + '</span></div>',
          '  </div>',
          '</article>'
        ].join('\n');
      }).join('\n');

      count.textContent = '找到 ' + matched.length + ' 条相关结果';
      setupImageFallbacks();
    }

    input.value = getQueryFromUrl();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var newUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', newUrl);
      render(query);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(input.value);
  }

  function setupPlayer() {
    var shell = document.querySelector('[data-player-shell]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video[data-src]');
    var button = shell.querySelector('[data-player-start]');
    var status = shell.querySelector('[data-player-status]');
    var sourceUrl = video ? video.dataset.src : '';
    var hlsInstance = null;
    var prepared = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function prepareVideo() {
      if (!video || prepared || !sourceUrl) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        setStatus('正在使用浏览器原生 HLS 播放');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('HLS 播放源已就绪');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，可刷新页面后重试');
          }
        });
      } else {
        video.src = sourceUrl;
        setStatus('当前浏览器可能不支持 HLS，可尝试使用 Safari 或新版浏览器');
      }
    }

    function startPlayback() {
      prepareVideo();
      shell.classList.add('is-playing');

      if (video) {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('请再次点击播放按钮以开始播放');
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  ready(function () {
    setupMobileNavigation();
    setupImageFallbacks();
    setupHeroCarousel();
    setupCardFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
