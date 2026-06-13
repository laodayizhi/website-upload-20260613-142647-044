(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  ready(function () {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-search-region]");
    var type = document.querySelector("[data-search-type]");
    var year = document.querySelector("[data-search-year]");
    var results = document.querySelector("[data-search-results]");
    var movies = window.flashMovies || [];

    if (!form || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(movie) {
      return "<article class=\"movie-card\">" +
        "<a href=\"" + escapeHtml(movie.detail) + "\">" +
        "<div class=\"movie-cover\"><img src=\"" + escapeHtml(movie.imagePath) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><div class=\"cover-layer\"><span>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.type) + "</span></div></div>" +
        "<div class=\"movie-info\"><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"movie-tags\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div></div>" +
        "</a></article>";
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";

      var filtered = movies.filter(function (movie) {
        var text = (movie.title + " " + movie.oneLine + " " + movie.tags + " " + movie.region + " " + movie.genre).toLowerCase();
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (selectedRegion && movie.region !== selectedRegion) {
          return false;
        }
        if (selectedType && movie.type !== selectedType) {
          return false;
        }
        if (selectedYear && movie.year !== selectedYear) {
          return false;
        }
        return true;
      }).slice(0, 96);

      if (!filtered.length) {
        results.innerHTML = "<div class=\"empty-result\">没有找到匹配的影片，请尝试其他关键词。</div>";
        return;
      }

      results.innerHTML = "<div class=\"movie-grid\">" + filtered.map(card).join("") + "</div>";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  });
})();
