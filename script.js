(function () {
  'use strict';

  // Cross-browser forEach for NodeLists (older engines don't implement it)
  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  var fileMeta = {
    home:     { name: 'home.tsx',     ficon: 'tsx',  crumb: 'piyush-raj-portfolio › src › home.tsx',       lang: 'TypeScript React' },
    about:    { name: 'about.html',   ficon: 'html', crumb: 'piyush-raj-portfolio › src › about.html',     lang: 'HTML' },
    projects: { name: 'projects.js',  ficon: 'js',   crumb: 'piyush-raj-portfolio › src › projects.js',    lang: 'JavaScript' },
    skills:   { name: 'skills.json',  ficon: 'json', crumb: 'piyush-raj-portfolio › data › skills.json',   lang: 'JSON' },
    contact:  { name: 'contact.css',  ficon: 'css',  crumb: 'piyush-raj-portfolio › src › contact.css',    lang: 'CSS' },
    readme:   { name: 'README.md',    ficon: 'md',   crumb: 'piyush-raj-portfolio › README.md',            lang: 'Markdown' }
  };

  var ficonLabel = { tsx: 'TS', html: '5', js: 'JS', json: '{ }', css: '#', md: 'M' };

  var order = ['home', 'about', 'projects', 'skills', 'contact', 'readme'];
  var openTabs = order.slice();
  var activeFile = 'home';

  var tabBar = document.getElementById('tabBar');
  var breadcrumb = document.getElementById('breadcrumb');
  var sbLang = document.getElementById('sbLang');
  var fileListItems = document.querySelectorAll('#fileList li[data-file]');

  function renderTabs() {
    tabBar.innerHTML = '';
    openTabs.forEach(function (key) {
      var meta = fileMeta[key];
      var tab = document.createElement('div');
      tab.className = 'tab' + (key === activeFile ? ' active' : '');
      tab.setAttribute('data-file', key);

      var icon = document.createElement('span');
      icon.className = 'ficon ficon-' + meta.ficon;
      icon.textContent = ficonLabel[meta.ficon];

      var label = document.createElement('span');
      label.textContent = meta.name;

      var close = document.createElement('span');
      close.className = 'tab-close';
      close.innerHTML = '&#10005;';
      close.setAttribute('aria-label', 'Close ' + meta.name);
      close.addEventListener('click', function (e) {
        e.stopPropagation();
        closeTab(key);
      });

      tab.appendChild(icon);
      tab.appendChild(label);
      tab.appendChild(close);
      tab.addEventListener('click', function () { openFile(key); });
      tabBar.appendChild(tab);
    });
  }

  function closeTab(key) {
    var idx = openTabs.indexOf(key);
    if (idx === -1) return;
    openTabs.splice(idx, 1);
    if (activeFile === key) {
      var next = openTabs[idx] || openTabs[idx - 1];
      if (next) {
        setActive(next);
      } else {
        activeFile = null;
        each(document.querySelectorAll('.file-panel'), function (p) { p.classList.remove('active'); });
        breadcrumb.textContent = 'No file open — pick one from the sidebar';
      }
    }
    renderTabs();
    syncSidebar();
  }

  function syncSidebar() {
    each(fileListItems, function (li) {
      li.classList.toggle('active', li.getAttribute('data-file') === activeFile);
    });
  }

  function setActive(key) {
    activeFile = key;
    each(document.querySelectorAll('.file-panel'), function (p) {
      p.classList.toggle('active', p.id === 'panel-' + key);
    });
    breadcrumb.textContent = fileMeta[key].crumb;
    sbLang.textContent = fileMeta[key].lang;
    renderTabs();
    syncSidebar();

    if (key === 'skills') animateSkillBars();

    var scroller = document.getElementById('contentScroll');
    if (scroller) scroller.scrollTop = 0;

    closeSidebarMobile();
  }

  function openFile(key) {
    if (openTabs.indexOf(key) === -1) openTabs.push(key);
    setActive(key);
  }

  // Sidebar clicks
  each(fileListItems, function (li) {
    li.addEventListener('click', function () {
      openFile(li.getAttribute('data-file'));
    });
    li.setAttribute('tabindex', '0');
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFile(li.getAttribute('data-file'));
      }
    });
  });

  // Hero CTA buttons
  each(document.querySelectorAll('[data-goto]'), function (btn) {
    btn.addEventListener('click', function () {
      openFile(btn.getAttribute('data-goto'));
    });
  });

  renderTabs();
  breadcrumb.textContent = fileMeta[activeFile].crumb;

  // =========================================================
  // Typing effect on the home hero
  // =========================================================
  var words = ['learning', 'debugging', 'building', 'leveling up', 'shipping'];
  var typedEl = document.getElementById('typedWord');

  function typeLoop() {
    if (!typedEl) return;
    var wordIndex = 0;

    function step() {
      var word = words[wordIndex];
      var charIndex = 0;
      typedEl.textContent = '';

      function typeChar() {
        if (charIndex <= word.length) {
          typedEl.textContent = word.slice(0, charIndex);
          charIndex++;
          setTimeout(typeChar, 70);
        } else {
          setTimeout(eraseChar, 1300);
        }
      }
      function eraseChar() {
        if (charIndex >= 0) {
          typedEl.textContent = word.slice(0, charIndex);
          charIndex--;
          setTimeout(eraseChar, 40);
        } else {
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(step, 200);
        }
      }
      typeChar();
    }
    step();
  }
  typeLoop();

  // =========================================================
  // Skill bar animation (triggered when skills.json is opened)
  // =========================================================
  function animateSkillBars() {
    each(document.querySelectorAll('.skill-col'), function (col) {
      col.classList.remove('in-view');
    });
    each(document.querySelectorAll('.skill-row'), function (row) {
      var pct = row.getAttribute('data-pct');
      var fill = row.querySelector('.bar-fill');
      if (fill) fill.style.setProperty('--pct', pct + '%');
    });
    // force reflow then add class to trigger transition
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        each(document.querySelectorAll('.skill-col'), function (col) {
          col.classList.add('in-view');
        });
      });
    });
  }

  // =========================================================
  // Contact form -> mailto
  // =========================================================
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cf-name').value.trim();
      var email = document.getElementById('cf-email').value.trim();
      var subject = document.getElementById('cf-subject').value.trim() || 'Hello from your portfolio site';
      var message = document.getElementById('cf-message').value.trim();

      var body = 'From: ' + name + ' (' + email + ')\n\n' + message;
      var mailto = 'mailto:piyush76674@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      window.location.href = mailto;
    });
  }

  // =========================================================
  // Status bar clock
  // =========================================================
  var sbClock = document.getElementById('sbClock');
  function tickClock() {
    if (!sbClock) return;
    var d = new Date();
    var hh = ('0' + d.getHours()).slice(-2);
    var mm = ('0' + d.getMinutes()).slice(-2);
    sbClock.textContent = hh + ':' + mm;
  }
  tickClock();
  setInterval(tickClock, 1000 * 15);

  // =========================================================
  // Mobile sidebar drawer
  // =========================================================
  var appWindow = document.getElementById('appWindow');
  var hamburger = document.getElementById('hamburger');
  var overlay = document.getElementById('sidebarOverlay');

  function closeSidebarMobile() {
    if (window.innerWidth <= 700) appWindow.classList.remove('sidebar-open');
  }
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      appWindow.classList.toggle('sidebar-open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', closeSidebarMobile);
  }

  // =========================================================
  // Copilot popover
  // =========================================================
  var copilotPop = document.getElementById('copilotPop');
  function toggleCopilot() {
    copilotPop.classList.toggle('open');
  }
  var copilotToggle = document.getElementById('copilotToggle');
  var copilotToggleActivity = document.getElementById('copilotToggleActivity');
  if (copilotToggle) copilotToggle.addEventListener('click', toggleCopilot);
  if (copilotToggleActivity) copilotToggleActivity.addEventListener('click', toggleCopilot);
  document.addEventListener('click', function (e) {
    if (copilotPop.classList.contains('open') &&
        !copilotPop.contains(e.target) &&
        e.target !== copilotToggle && !copilotToggle.contains(e.target) &&
        e.target !== copilotToggleActivity && !copilotToggleActivity.contains(e.target)) {
      copilotPop.classList.remove('open');
    }
  });

})();
