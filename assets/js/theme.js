(function () {
  "use strict";

  var toggle = document.getElementById('theme-toggle');
  var icon = toggle.querySelector('i');

  function applyIcon(theme) {
    if (theme === 'dark') {
      icon.classList.remove('bx-moon');
      icon.classList.add('bx-sun');
    } else {
      icon.classList.remove('bx-sun');
      icon.classList.add('bx-moon');
    }
  }

  applyIcon(document.documentElement.getAttribute('data-theme'));

  toggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      // Ignore: persistence is best-effort; the toggle still works for this page view.
    }
    applyIcon(next);
  });
})();
