// Lumina Strategy Solutions - page interactions

// Testimonials carousel - manual nav (prev/next/dots) with auto-advance + pause on hover
(function () {
  var card = document.querySelector('.testimonial-card');
  if (!card) return;
  var slides = Array.from(card.querySelectorAll('.testimonial-slide'));
  var dots = Array.from(card.querySelectorAll('.testimonial-dot'));
  var prevBtn = card.querySelector('[data-prev]');
  var nextBtn = card.querySelector('[data-next]');
  if (!slides.length) return;

  var current = 0;
  var timer = null;
  var AUTO_MS = 6000;

  function show(i) {
    current = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach(function (s, idx) {
      var isActive = idx === current;
      s.classList.toggle('active', isActive);
      s.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    dots.forEach(function (d, idx) {
      var isActive = idx === current;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  function startAuto() {
    stopAuto();
    timer = setInterval(next, AUTO_MS);
  }
  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restart() { stopAuto(); startAuto(); }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { show(i); restart(); });
  });

  card.addEventListener('mouseenter', stopAuto);
  card.addEventListener('mouseleave', startAuto);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startAuto();
})();

// Pinned announcement bar - appears after the user scrolls past the hero
(function () {
  var bar = document.getElementById('announcementBar');
  if (!bar) return;
  if (sessionStorage.getItem('luminaAnnouncementDismissed') === '1') return;

  var hero = document.querySelector('.hero');
  if (!hero) return;
  bar.hidden = false;

  var showAfter = hero.offsetTop + hero.offsetHeight - 80;
  var onScroll = function () {
    if (window.scrollY > showAfter) bar.classList.add('visible');
    else bar.classList.remove('visible');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    showAfter = hero.offsetTop + hero.offsetHeight - 80;
  });
  onScroll();

  bar.querySelector('[data-dismiss]').addEventListener('click', function () {
    bar.classList.remove('visible');
    sessionStorage.setItem('luminaAnnouncementDismissed', '1');
    setTimeout(function () { bar.hidden = true; }, 400);
  });
})();

// Hero person video - plays once on load, replays when re-entering the hero viewport
(function () {
  var video = document.querySelector('.hero-person-video');
  if (!video) return;

  // Track whether the video is currently considered "in view".
  // Starts true because the hero is at the top of the page on load.
  var isInView = true;

  function isVideoVisible() {
    var r = video.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function onScroll() {
    var currentlyInView = isVideoVisible();
    // Only replay when transitioning from out-of-view back into view
    if (currentlyInView && !isInView) {
      try {
        video.currentTime = 0;
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (_) {}
    }
    isInView = currentlyInView;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Stat count-up - animate from 0 → final value when stats scroll into view
(function () {
  var stats = document.querySelectorAll('.stat-value[data-target]');
  if (!stats.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setFinal(el) {
    el.textContent = el.dataset.target + (el.dataset.suffix || '');
    el.dataset.animated = '1';
  }

  function animate(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1400;
    var start = Date.now();
    var timer = setInterval(function () {
      var progress = Math.min((Date.now() - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(target * eased) + suffix;
      if (progress >= 1) {
        el.textContent = target + suffix;
        clearInterval(timer);
      }
    }, 16);
  }

  if (reduceMotion) {
    stats.forEach(setFinal);
    return;
  }

  // Pre-set to "0 + suffix" so they don't briefly flash the final value
  stats.forEach(function (el) { el.textContent = '0' + (el.dataset.suffix || ''); });

  function isInView(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  function tick() {
    var allDone = true;
    stats.forEach(function (s) {
      if (!s.dataset.animated) {
        if (isInView(s)) animate(s);
        else allDone = false;
      }
    });
    if (allDone) window.removeEventListener('scroll', tick);
  }

  // Initial check (in case stats are already visible above the fold) + on scroll
  tick();
  window.addEventListener('scroll', tick, { passive: true });
})();

// Audience toggle - switches between Business / Careers hero panes
// Persists choice in localStorage so returning visitors land on their last view
(function () {
  var toggleBtns = document.querySelectorAll('.audience-toggle button');
  var panes = document.querySelectorAll('.hero-pane');
  if (!toggleBtns.length || !panes.length) return;

  function setMode(mode) {
    toggleBtns.forEach(function (b) {
      var isActive = b.dataset.mode === mode;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    panes.forEach(function (p) {
      var isActive = p.dataset.pane === mode;
      p.classList.toggle('active', isActive);
      if (isActive) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });
    try { localStorage.setItem('lumina-audience', mode); } catch (_) {}
  }

  // Restore last choice
  try {
    var saved = localStorage.getItem('lumina-audience');
    if (saved === 'biz' || saved === 'career') setMode(saved);
  } catch (_) {}

  toggleBtns.forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.dataset.mode); });
  });
})();

// Widow prevention — bind the last 3 words of every text block with non-breaking spaces
// so single words never end up on their own line.
(function () {
  function fixWidows(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var lastTextNode = null;
    var n;
    while ((n = walker.nextNode())) {
      if (n.textContent.trim()) lastTextNode = n;
    }
    if (!lastTextNode) return;

    var text = lastTextNode.textContent;
    var trimmedEnd = text.replace(/\s+$/, '');
    var trailingWs = text.slice(trimmedEnd.length);

    // Replace the last two whitespace separators with non-breaking spaces
    var tokens = trimmedEnd.split(/(\s+)/);
    var replaced = 0;
    for (var i = tokens.length - 1; i >= 0 && replaced < 2; i--) {
      if (/^\s+$/.test(tokens[i])) {
        tokens[i] = ' ';
        replaced++;
      }
    }
    lastTextNode.textContent = tokens.join('') + trailingWs;
  }

  var selectors = 'h1, h2, h3, h4, p, blockquote, li, figcaption';
  document.querySelectorAll(selectors).forEach(fixWidows);
})();

// Mobile hamburger nav — opens/closes the primary nav dropdown
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelectorAll('.nav nav a');
  if (!header || !toggle) return;

  function setOpen(isOpen) {
    header.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!header.classList.contains('nav-open'));
  });

  // Close on link click (so smooth-scroll to anchors works clean)
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close on click outside the header
  document.addEventListener('click', function (e) {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) {
      setOpen(false);
    }
  });
})();

// Sticky header gets a shadow once you scroll
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var onScroll = function () {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Contact form: client-side validation + success state
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;
  var status = form.querySelector('.form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    if (!form.checkValidity()) {
      status.classList.add('error');
      status.textContent = 'Please fill in all required fields.';
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    status.classList.add('success');
    status.textContent = 'Thanks - your message has been received. We will be in touch shortly.';
    form.reset();
  });
})();

// CV application modal
(function () {
  var modal = document.getElementById('cvModal');
  if (!modal || typeof modal.showModal !== 'function') return;

  var titleEl = modal.querySelector('#cvModalTitle');
  var form = modal.querySelector('.cv-form');
  var status = form.querySelector('.form-status');
  var fileInput = modal.querySelector('#cvFileInput');
  var fileStatus = modal.querySelector('.file-input-status');
  var fileWrap = modal.querySelector('.file-input');
  var captchaInput = modal.querySelector('.cv-captcha');
  var expectedCaptcha = 0;

  function makeCaptcha() {
    var a = Math.floor(Math.random() * 9) + 1;
    var b = Math.floor(Math.random() * 9) + 1;
    expectedCaptcha = a + b;
    captchaInput.value = '';
    captchaInput.placeholder = a + ' + ' + b;
  }

  function resetFileField() {
    fileStatus.textContent = 'No file chosen';
    fileWrap.classList.remove('has-file');
  }

  function openModal(roleTitle) {
    titleEl.textContent = 'Join Our Team as ' + roleTitle + '!';
    form.reset();
    resetFileField();
    status.className = 'form-status';
    status.textContent = '';
    makeCaptcha();
    modal.showModal();
  }

  function closeModal() {
    modal.close();
  }

  // Open: intercept clicks on "Send your CV" anchors inside .job
  document.querySelectorAll('.job .btn').forEach(function (btn) {
    if (!/send your cv/i.test(btn.textContent)) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var job = btn.closest('.job');
      var role = job ? job.querySelector('.job-summary-text h3').textContent.trim() : 'Our Team';
      openModal(role);
    });
  });

  // Close: × button
  modal.querySelector('[data-close]').addEventListener('click', closeModal);

  // Close: click on backdrop (outside the dialog content)
  modal.addEventListener('mousedown', function (e) {
    if (e.target === modal) closeModal();
  });

  // File input: show filename when selected
  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files.length > 0) {
      fileStatus.textContent = fileInput.files[0].name;
      fileWrap.classList.add('has-file');
    } else {
      resetFileField();
    }
  });

  // Submit: validate (incl. captcha) and show success
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    if (!form.checkValidity()) {
      status.classList.add('error');
      status.textContent = 'Please fill in all required fields.';
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (parseInt(captchaInput.value, 10) !== expectedCaptcha) {
      status.classList.add('error');
      status.textContent = 'Captcha answer is incorrect.';
      captchaInput.focus();
      return;
    }

    status.classList.add('success');
    status.textContent = 'Thanks - your application has been received.';
    form.reset();
    resetFileField();
    makeCaptcha();
  });
})();
