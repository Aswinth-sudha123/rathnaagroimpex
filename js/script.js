// Rathna Agro Impex - header behaviour
(function () {
  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  var links = nav.querySelectorAll('a');

  // Shadow under the header once the page scrolls
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu open / close
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) setMenu(false);
  });

  // Close the mobile menu on click. Only same-page (#hash) links change the highlight;
  // links to other pages keep the highlight set by that page's own HTML.
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (link.getAttribute('href').charAt(0) === '#') {
        links.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
      setMenu(false);
    });
  });
})();
// Hero strip marquee: repeats the list so the scroll loops without a gap
(function () {
  var list = document.querySelector('.hero-strip ul');
  if (!list) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var originals = Array.prototype.slice.call(list.children);

  function build() {
    list.querySelectorAll('.is-clone').forEach(function (n) { n.remove(); });

    var setWidth = originals.reduce(function (sum, li) { return sum + li.offsetWidth; }, 0);
    if (!setWidth) return;

    var perHalf = Math.max(1, Math.ceil(window.innerWidth / setWidth));
    var totalSets = perHalf * 2;

    for (var s = 1; s < totalSets; s++) {
      originals.forEach(function (li) {
        var clone = li.cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        list.appendChild(clone);
      });
    }
  }

  build();
  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(build, 200);
  });
})();


// Products section: cards appear one after another the first time they scroll into view
(function () {
  var cards = document.querySelectorAll('.product-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach(function (card, i) {
    card.classList.add('reveal');
    card.style.transitionDelay = (i * 120) + 'ms';
  });

  var revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(function (card) { revealObserver.observe(card); });
})();

// Header: highlight the nav link of the section currently on screen
// (only for sections that have a matching #hash link in the navbar, e.g. on the home page)
(function () {
  var hashLinks = Array.prototype.filter.call(
    document.querySelectorAll('#siteNav a'),
    function (a) { return a.getAttribute('href').charAt(0) === '#'; }
  );
  var sections = Array.prototype.filter.call(
    document.querySelectorAll('main section[id]'),
    function (s) {
      return hashLinks.some(function (a) { return a.getAttribute('href') === '#' + s.id; });
    }
  );
  // No matching sections (e.g. product page): leave the page's own active link alone
  if (!sections.length || !('IntersectionObserver' in window)) return;

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      hashLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(function (s) { spy.observe(s); });
})();
// About + Why Choose Us: blocks fade in once, in order, as they scroll into view
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function revealOnScroll(selector, stagger) {
    var items = document.querySelectorAll(selector);
    if (!items.length) return;

    items.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * stagger) + 'ms';
    });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    items.forEach(function (el) { io.observe(el); });
  }

  revealOnScroll('.about-block', 150);
  revealOnScroll('.why-item', 100);
})();

// Export products: cards appear one after another the first time they scroll into view
(function () {
  var cards = document.querySelectorAll('.export-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach(function (card, i) {
    card.classList.add('reveal');
    card.style.transitionDelay = ((i % 2) * 120) + 'ms';
  });

  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(function (card) { io.observe(card); });
})();
// FAQ: opening one question closes the others
(function () {
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      items.forEach(function (other) {
        if (other !== item) other.removeAttribute('open');
      });
    });
  });
})();

// Contact form: validate, then send (or open the visitor's email app as a fallback)
(function () {
  var form = document.getElementById('enquiryForm');
  if (!form) return;

  var status = document.getElementById('formStatus');
  var btn = form.querySelector('button[type="submit"]');
  var btnText = btn.textContent;

  function say(message, type) {
    status.textContent = message;
    status.className = 'form-status ' + type;
  }

  function labelFor(el) {
    var label = form.querySelector('label[for="' + el.id + '"]');
    return label ? label.textContent.replace('*', '').trim() : el.name;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements['_gotcha'].value) return;          // a bot filled the hidden field

    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      say('Please fill in the highlighted fields.', 'error');
      form.querySelector(':invalid').focus();
      return;
    }

    var endpoint = form.getAttribute('data-endpoint');

    if (endpoint) {
      // Send through your form service (for example Formspree)
      btn.disabled = true;
      btn.textContent = 'Sending...';
      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('failed');
          form.reset();
          form.classList.remove('was-validated');
          say('Thank you! Your requirement has been sent. Our team will get back to you soon.', 'success');
        })
        .catch(function () {
          say('Sorry, your message could not be sent. Please try again or email us directly.', 'error');
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = btnText;
        });
      return;
    }

    // No form service set up yet: open the visitor's email app with everything filled in
    var lines = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.id && el.value && el.type !== 'hidden' && el.name !== '_gotcha') {
        lines.push(labelFor(el) + ': ' + el.value);
      }
    });
    var subject = 'Request a Quote - ' + form.elements['product'].value;
    window.location.href = 'mailto:' + form.getAttribute('data-email') +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    say('Your email app is opening with your details filled in. Please press send.', 'success');
  });
})();

if (window.location.pathname === "/index.html") {
window.location.replace("/");
}
// About page: types out the business keyword, pauses, erases, repeats
(function () {
  var el = document.getElementById('typedKeyword');
  if (!el) return;

  var phrases = [
    'Best Agricultural Products Exported from India',
    'Premium Garlic, Onion, Chillies & Turmeric',
    'Trusted by Importers Worldwide'
  ];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = phrases[0];
    return;
  }

  var p = 0, i = 0, deleting = false;

  function tick() {
    var text = phrases[p];
    el.textContent = text.slice(0, i);

    if (!deleting && i === text.length) {
      deleting = true;
      return setTimeout(tick, 2000);      // pause when fully typed
    }
    if (deleting && i === 0) {
      deleting = false;
      p = (p + 1) % phrases.length;
    }
    i += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 30 : 60);
  }
  tick();
})();
