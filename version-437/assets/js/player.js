(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-hls-player"));

    players.forEach(function (video) {
      var url = video.getAttribute("data-hls");
      var shell = video.closest(".js-player-shell");
      var button = shell ? shell.querySelector(".js-play-button") : null;

      if (!url) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else {
        video.src = url;
      }

      function playVideo() {
        if (button) {
          button.classList.add("is-hidden");
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
    });
  });
})();
