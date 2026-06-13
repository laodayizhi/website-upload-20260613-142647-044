(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
      showSlide(0);
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
      var keyword = filterPanel.querySelector("[data-filter-keyword]");
      var type = filterPanel.querySelector("[data-filter-type]");
      var year = filterPanel.querySelector("[data-filter-year]");
      var button = filterPanel.querySelector("[data-filter-button]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty-result]");

      function applyFilter() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region")).toLowerCase();
          var ok = true;

          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      if (button) {
        button.addEventListener("click", applyFilter);
      }
    }
  });
})();
