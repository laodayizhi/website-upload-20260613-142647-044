
(function () {
  const shells = Array.from(document.querySelectorAll('.player-shell'));

  shells.forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.player-start');
    const source = video ? video.getAttribute('data-src') : '';
    let ready = false;
    let hls = null;

    function prepare() {
      if (!video || !source || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
    }

    function start() {
      if (!video) {
        return;
      }
      prepare();
      const action = video.play();
      shell.classList.add('playing');
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          shell.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
