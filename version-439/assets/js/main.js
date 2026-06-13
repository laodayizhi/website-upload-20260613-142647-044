(function () {
  const ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  };

  const toNumber = function (value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const normalize = function (value) {
    return String(value || "").trim().toLowerCase();
  };

  function setupMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    const forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "search.html";
        }
      });
    });
  }

  function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }
    let active = 0;
    let timer = null;

    const show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(toNumber(dot.getAttribute("data-hero-dot")));
        restart();
      });
    });

    restart();
  }

  function setupCatalog() {
    const grid = document.querySelector("[data-grid]");
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll(".catalog-card"));
    const searchInput = document.querySelector("[data-search-input]");
    const categoryFilter = document.querySelector("[data-category-filter]");
    const typeFilter = document.querySelector("[data-type-filter]");
    const yearFilter = document.querySelector("[data-year-filter]");
    const sortSelect = document.querySelector("[data-sort-select]");
    const countNode = document.querySelector("[data-visible-count]");
    const clearButton = document.querySelector("[data-clear-search]");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (searchInput && query) {
      searchInput.value = query;
    }

    const apply = function () {
      const keyword = normalize(searchInput ? searchInput.value : "");
      const category = categoryFilter ? categoryFilter.value : "";
      const type = typeFilter ? typeFilter.value : "";
      const year = yearFilter ? yearFilter.value : "";
      const sort = sortSelect ? sortSelect.value : "default";
      let visible = cards.filter(function (card) {
        const matchesKeyword = !keyword || normalize(card.dataset.search).includes(keyword) || normalize(card.dataset.title).includes(keyword);
        const matchesCategory = !category || card.dataset.category === category;
        const matchesType = !type || card.dataset.type === type;
        const matchesYear = !year || card.dataset.year === year;
        return matchesKeyword && matchesCategory && matchesType && matchesYear;
      });

      visible.sort(function (first, second) {
        if (sort === "views") {
          return toNumber(second.dataset.views) - toNumber(first.dataset.views);
        }
        if (sort === "likes") {
          return toNumber(second.dataset.likes) - toNumber(first.dataset.likes);
        }
        if (sort === "year") {
          return toNumber(second.dataset.year) - toNumber(first.dataset.year);
        }
        if (sort === "title") {
          return normalize(first.dataset.title).localeCompare(normalize(second.dataset.title), "zh-Hans-CN");
        }
        return toNumber(first.dataset.cardId) - toNumber(second.dataset.cardId);
      });

      cards.forEach(function (card) {
        card.classList.add("is-hidden");
      });
      visible.forEach(function (card) {
        card.classList.remove("is-hidden");
        grid.appendChild(card);
      });
      if (countNode) {
        countNode.textContent = String(visible.length);
      }
    };

    [searchInput, categoryFilter, typeFilter, yearFilter, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }
        if (categoryFilter) {
          categoryFilter.value = "";
        }
        if (typeFilter) {
          typeFilter.value = "";
        }
        if (yearFilter) {
          yearFilter.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function setupPlayers() {
    const shells = document.querySelectorAll("[data-player-source]");
    shells.forEach(function (shell) {
      const video = shell.querySelector("video");
      const button = shell.querySelector("[data-play-button]");
      const source = shell.getAttribute("data-player-source");
      let hls = null;

      if (!video || !source) {
        return;
      }

      const attachSource = function () {
        if (video.dataset.loaded === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        video.dataset.loaded = "1";
      };

      const begin = function () {
        attachSource();
        shell.classList.add("is-playing");
        if (button) {
          button.setAttribute("hidden", "hidden");
        }
        const request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            if (button) {
              button.removeAttribute("hidden");
            }
            shell.classList.remove("is-playing");
          });
        }
      };

      if (button) {
        button.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (video.dataset.loaded !== "1" || video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.setAttribute("hidden", "hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.removeAttribute("hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupCatalog();
    setupPlayers();
  });
})();
