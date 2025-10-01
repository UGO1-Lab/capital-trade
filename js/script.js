// js/script.js
document.addEventListener('DOMContentLoaded', function () {
  console.log('JS loaded');

  // ============================
  // 1) HAMBURGER / DRAWER
  // ============================
  var header = document.querySelector('header');
  var hamburger = document.querySelector('.hamburger');
  var navbar = document.querySelector('.navbar');

  // Ensure 3 bars exist for the X animation
  if (hamburger && hamburger.children.length === 0) {
    hamburger.setAttribute('aria-label', 'Toggle menu');
    hamburger.innerHTML =
      '<span class="bar"></span>' +
      '<span class="bar"></span>' +
      '<span class="bar"></span>';
  }

  function openMenu() {
    if (!header || !navbar) return;
    navbar.classList.add('active');
    header.classList.add('open'); // CSS animates bars -> X
  }
  function closeMenu() {
    if (!header || !navbar) return;
    navbar.classList.remove('active');
    header.classList.remove('open');
  }
  function toggleMenu() {
    if (!navbar) return;
    if (navbar.classList.contains('active')) closeMenu();
    else openMenu();
  }

  if (hamburger && navbar && header) {
    hamburger.addEventListener('click', toggleMenu);

    // click outside to close
    window.addEventListener('click', function (e) {
      var insideNav = navbar.contains(e.target);
      var onHamburger = hamburger.contains(e.target);
      if (!insideNav && !onHamburger && navbar.classList.contains('active')) {
        closeMenu();
      }
    });

    // ESC closes
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navbar.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ============================
  // 2) HERO SLIDESHOW
  // ============================
  var slides = Array.prototype.slice.call(document.getElementsByClassName('mySlides'));
  var prev = document.querySelector('.prev');
  var next = document.querySelector('.next');
  var slideIndex = 0;
  var slideTimer = null;

  function showSlide(i) {
    if (!slides.length) return;
    for (var k = 0; k < slides.length; k++) {
      slides[k].style.display = 'none';
    }
    slideIndex = (i + slides.length) % slides.length;
    slides[slideIndex].style.display = 'block';
  }

  function startSlidesAuto() {
    stopSlidesAuto();
    slideTimer = setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5000);
  }

  function stopSlidesAuto() {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  }

  if (slides.length) {
    showSlide(0);
    startSlidesAuto();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(slideIndex - 1);
      startSlidesAuto();
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showSlide(slideIndex + 1);
      startSlidesAuto();
    });
  }

  // ============================
  // 3) FEATURES SLIDER (cards)
  // ============================
  var viewport = document.querySelector('.f-viewport');
  var track = document.querySelector('.f-track');
  var cards = track && track.children ? Array.prototype.slice.call(track.children) : [];
  var fPrev = document.querySelector('.f-prev');
  var fNext = document.querySelector('.f-next');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.f-dot')) || [];
  var page = 0;
  var featuresTimer = null;

  function perView() {
    return window.innerWidth >= 992 ? Math.min(2, cards.length) : 1;
  }
  function totalPages() {
    var pv = perView();
    return Math.max(1, Math.ceil(cards.length / pv));
  }
  function goTo(p) {
    if (!viewport || !track || !cards.length) return;
    var maxPage = totalPages() - 1;
    if (p < 0) p = 0;
    if (p > maxPage) p = maxPage;
    page = p;
    var w = viewport.clientWidth;
    track.style.transform = 'translateX(' + (-page * w) + 'px)';
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === page);
    }
  }
  function nextPage() {
    var tp = totalPages();
    var n = page + 1 >= tp ? 0 : page + 1;
    goTo(n);
  }
  function startFeaturesAuto() {
    stopFeaturesAuto();
    featuresTimer = setInterval(nextPage, 4000);
  }
  function stopFeaturesAuto() {
    if (featuresTimer) {
      clearInterval(featuresTimer);
      featuresTimer = null;
    }
  }

  if (viewport && track && cards.length) {
    goTo(0);
    startFeaturesAuto();

    if (fNext) fNext.addEventListener('click', function () { nextPage(); startFeaturesAuto(); });
    if (fPrev) fPrev.addEventListener('click', function () { goTo(page - 1); startFeaturesAuto(); });
    if (dots && dots.length) {
      dots.forEach(function (d, i) {
        d.addEventListener('click', function () { goTo(i); startFeaturesAuto(); });
      });
    }

    // keep alignment on resize
    var raf;
    window.addEventListener('resize', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { goTo(page); });
    });

    // pause auto on hover (desktop)
    var slider = document.querySelector('.features-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stopFeaturesAuto);
      slider.addEventListener('mouseleave', startFeaturesAuto);
    }
  }

  console.log('✅ All modules initialized');
});


// ================================
// Stats Counter (replays on re-enter)
// ================================
(function () {
  const section = document.querySelector(".stats");
  if (!section) return;

  const nums = [...section.querySelectorAll(".num")];
  let animating = false;

  // K/M/B/T abbreviations
  const abbr = (n) => {
    const abs = Math.abs(n);
    if (abs >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
    if (abs >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (abs >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  };

  // Reset numbers so animation can play again
  function resetNumbers() {
    nums.forEach((el) => {
      const prefix = el.dataset.prefix || "";
      el.textContent = prefix + "0";
      el.closest(".ring")?.classList.remove("pulse");
    });
  }

  function animateCount(el, target, duration = 1800) {
    const ring = el.closest(".ring");
    const startTime = performance.now();
    const start = 0;
    const useAbbr = el.dataset.format === "abbr";
    const prefix = el.dataset.prefix || "";
    const locale = navigator.language || "en-US";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effective = reduce ? 0 : duration;

    if (ring) ring.classList.add("pulse");

    function frame(now) {
      const t = Math.min((now - startTime) / effective, 1);
      const eased = effective === 0 ? 1 : 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = Math.floor(start + (target - start) * eased);
      el.textContent = prefix + (useAbbr ? abbr(value) : value.toLocaleString(locale));
      if (t < 1) requestAnimationFrame(frame);
      else {
        if (ring) ring.classList.remove("pulse");
        el.textContent = prefix + (useAbbr ? abbr(target) : target.toLocaleString(locale));
      }
    }
    requestAnimationFrame(frame);
  }

  function playAll() {
    if (animating) return;
    animating = true;
    nums.forEach((n) => {
      const target = parseInt(n.dataset.target, 10) || 0;
      animateCount(n, target);
    });
    // allow another run after the last one finishes
    setTimeout(() => (animating = false), 2100);
  }

  // Replay whenever the section fully leaves and later re-enters
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playAll();
        } else {
          // When it leaves view, reset to 0 so it can replay next time
          resetNumbers();
        }
      });
    },
    { threshold: 0.35 }
  );

  // Init
  resetNumbers();
  io.observe(section);
})();

// ================================
// Safe initialiser
// ================================
document.addEventListener("DOMContentLoaded", () => {
  initHamburger();
  initHeroSlider();
  initFeaturesSlider();
  initStatsCounters();
  initTestimonialsSlider();
});

// Small helper
function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

// ================================
// 1) HAMBURGER / DRAWER
// ================================
function initHamburger() {
  const hamburger = document.querySelector(".hamburger");
  const navbar = document.querySelector(".navbar");
  const closeBtn = document.querySelector(".close-btn");

  if (!hamburger || !navbar) return;

  const open = () => {
    navbar.classList.add("active");
    navbar.setAttribute("aria-hidden", "false");
    if (closeBtn) closeBtn.style.display = "block";
    if (hamburger) hamburger.style.visibility = "hidden";
  };

  const close = () => {
    navbar.classList.remove("active");
    navbar.setAttribute("aria-hidden", "true");
    if (closeBtn) closeBtn.style.display = "none";
    if (hamburger) hamburger.style.visibility = "visible";
  };

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    open();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
    });
  }

  // click outside to close
  window.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && e.target !== hamburger) close();
  });

  // ESC to close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// ================================
// 2) HERO SLIDESHOW (full-width banners)
// ================================
function initHeroSlider() {
  const slides = document.querySelectorAll(".mySlides");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  if (!slides || slides.length === 0) return;

  let index = 0;
  let timerId = null;

  const show = (i) => {
    slides.forEach(s => (s.style.display = "none"));
    slides[i].style.display = "block";
  };

  const next = () => {
    index = (index + 1) % slides.length;
    show(index);
  };

  const prev = () => {
    index = (index - 1 + slides.length) % slides.length;
    show(index);
  };

  const startAuto = () => {
    stopAuto();
    timerId = setInterval(next, 5000);
  };
  const stopAuto = () => {
    if (timerId) clearInterval(timerId);
    timerId = null;
  };

  // init
  show(index);
  startAuto();

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAuto(); next(); startAuto();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAuto(); prev(); startAuto();
    });
  }
}

// ================================
// 3) FEATURES SLIDER (cards + dots)
// ================================
function initFeaturesSlider() {
  const viewport = document.querySelector(".f-viewport");
  const track = document.querySelector(".f-track");
  const items = document.querySelectorAll(".f-track .feature-card");
  const prevBtn = document.querySelector(".f-prev");
  const nextBtn = document.querySelector(".f-next");
  const dots = document.querySelectorAll(".f-dot");

  if (!viewport || !track || items.length === 0) return;

  let index = 0;

  const slideTo = (i) => {
    index = clamp(i, 0, items.length - 1);
    const w = viewport.clientWidth;
    track.style.transform = `translateX(${-index * w}px)`;
    // dots
    dots.forEach(d => d.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");
  };

  // nav
  if (prevBtn) prevBtn.addEventListener("click", () => slideTo(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => slideTo(index + 1));

  dots.forEach(d => {
    d.addEventListener("click", () => {
      const i = Number(d.getAttribute("data-i") || 0);
      slideTo(i);
    });
  });

  // handle resize
  let rAF = null;
  window.addEventListener("resize", () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => slideTo(index));
  });

  // init
  slideTo(0);
}

// ================================
// 4) STATS COUNTERS (count when visible)
// ================================
function initStatsCounters() {
  const nums = document.querySelectorAll(".stats .num");
  if (nums.length === 0) return;

  const formatAbbr = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  const animate = (el) => {
    const target = Number(el.getAttribute("data-target") || 0);
    const prefix = el.getAttribute("data-prefix") || "";
    const useAbbr = el.getAttribute("data-format") === "abbr";
    const duration = 1400; // ms

    let start = null;

    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const val = Math.floor(target * p);
      el.textContent = prefix + (useAbbr ? formatAbbr(val) : val.toLocaleString());
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // run once when section visible
  const section = document.querySelector(".stats");
  if (!section) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        nums.forEach(animate);
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });

  io.observe(section);
}

// ===================== Testimonials Slider (scoped) =====================
(function () {
  function initTestimonials() {
    var viewport = document.querySelector('.testi-viewport');
    var track = document.querySelector('.testi-track');
    var items = document.querySelectorAll('.testi-track .testi-item');
    var prevBtn = document.querySelector('.testi-prev');
    var nextBtn = document.querySelector('.testi-next');
    var dotsWrap = document.querySelector('.testi-dots');

    if (!viewport || !track || items.length === 0 || !dotsWrap) return;

    // (Re)build dots to match slides (in case you tweak count later)
    dotsWrap.innerHTML = '';
    items.forEach(function (_, i) {
      var b = document.createElement('button');
      b.className = 'testi-dot';
      b.setAttribute('data-i', i);
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dotsWrap.appendChild(b);
    });
    var dots = [].slice.call(dotsWrap.querySelectorAll('.testi-dot'));

    var index = 0, autoId = null;

    function slideTo(i) {
      index = (i + items.length) % items.length;
      var w = viewport.clientWidth;
      track.style.transform = 'translateX(' + (-index * w) + 'px)';
      dots.forEach(function (d) { d.classList.remove('is-active'); });
      if (dots[index]) dots[index].classList.add('is-active');
    }

    function startAuto() {
      stopAuto();
      autoId = setInterval(function () { slideTo(index + 1); }, 6000);
    }
    function stopAuto() { if (autoId) { clearInterval(autoId); autoId = null; } }

    // controls
    if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); slideTo(index - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); slideTo(index + 1); startAuto(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var i = Number(d.getAttribute('data-i') || 0);
        stopAuto(); slideTo(i); startAuto();
      });
    });

    // keep alignment on resize
    var raf;
    window.addEventListener('resize', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { slideTo(index); });
    });

    // init
    slideTo(0);
    startAuto();
  }

  // run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonials);
  } else {
    initTestimonials();
  }
})();


function initFAQ() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item => {
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", initFAQ);


// === Footer helpers (safe, scoped) ===
(function () {
  // Year
  var y = document.getElementById('footer-year');
  if (y) y.textContent = new Date().getFullYear();

  // Back-to-top show/hide
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var toggle = function () {
      if (window.scrollY > 400) {
        toTop.style.display = 'grid';
        toTop.style.opacity = '1';
      } else {
        toTop.style.opacity = '0';
        toTop.style.display = 'none';
      }
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Newsletter (demo only)
  var nl = document.querySelector('.footer-newsletter');
  if (nl) {
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nl.querySelector('input[type="email"]');
      var email = input ? input.value.trim() : '';
      if (!email) return;
      alert('Thanks! We\'ve added ' + email + ' to our newsletter.');
      input.value = '';
    });
  }
})();


