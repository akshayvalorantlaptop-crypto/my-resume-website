/* Akshay Jaiswal portfolio: progress bar, scroll-spy, menu, reveals, filters, copy, count-up, marquee, tilt */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reading progress bar and nav scroll-spy (one rAF-throttled handler) */
  const bar = $('.progress'), links = $$('.nav-link');
  const targets = links.map(l => $(l.getAttribute('href')));
  let ticking = false;
  const update = () => {
    const de = document.documentElement, max = de.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1).toFixed(4) : 0);
    let cur = -1;
    targets.forEach((t, i) => { const r = t.getBoundingClientRect(); if (r.top <= 140 && r.bottom > 140) cur = i; });
    if (innerHeight + scrollY >= de.scrollHeight - 4) cur = targets.length - 1;
    links.forEach((l, i) => {
      l.classList.toggle('active', i === cur);
      if (i === cur) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  /* Mobile menu */
  const toggle = $('.nav-toggle'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  links.forEach(l => l.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Scroll-triggered reveals */
  const io = new IntersectionObserver(entries => {
    let k = 0;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.animationDelay = (k++ * 90) + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* Achievement filter tabs */
  const subs = $$('.achievement-subsection'), tabs = $$('.filter-tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => { const on = t === tab; t.classList.toggle('active', on); t.setAttribute('aria-pressed', String(on)); });
    const f = tab.dataset.f;
    subs.forEach(s => s.classList.add('is-out'));
    setTimeout(() => {
      subs.forEach(s => { s.hidden = !(f === 'all' || s.dataset.cat === f); s.classList.add('in'); });
      requestAnimationFrame(() => { subs.forEach(s => s.classList.remove('is-out')); update(); });
    }, reduce ? 0 : 260);
  }));

  /* Copy to clipboard with toast, and print */
  const toast = $('.toast');
  let timer;
  const say = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $$('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    const v = btn.dataset.copy;
    try { await navigator.clipboard.writeText(v); }
    catch (err) {
      const t = document.createElement('textarea');
      t.value = v; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    }
    say('Copied ' + v);
  }));
  $$('[data-print]').forEach(b => b.addEventListener('click', () => window.print()));

  /* Count-up stats */
  const nums = $$('[data-count]');
  if (!reduce) {
    nums.forEach(n => { n.textContent = (0).toFixed(+n.dataset.dec || 0) + (n.dataset.suf || ''); });
    const co = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const n = e.target, end = +n.dataset.count, dec = +n.dataset.dec || 0, suf = n.dataset.suf || '', start = performance.now();
      const step = t => {
        const p = Math.min((t - start) / 1600, 1);
        n.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    nums.forEach(n => co.observe(n));
  }

  /* Marquee: duplicate the track once for a seamless loop */
  const track = $('.marquee-track');
  if (track) track.insertAdjacentHTML('beforeend', track.innerHTML);

  /* Portrait tilt and flight-path control */
  const vis = $('.hero-visual'), tilt = $('.portrait-wrap'), flight = $('.flight');
  if (reduce) {
    if (flight && flight.setCurrentTime) { flight.setCurrentTime(4.5); flight.pauseAnimations(); }
  } else if (vis && tilt) {
    const set = (x, y) => { tilt.style.setProperty('--rx', x + 'deg'); tilt.style.setProperty('--ry', y + 'deg'); };
    vis.addEventListener('pointermove', e => {
      const r = vis.getBoundingClientRect();
      set((((e.clientY - r.top) / r.height - 0.5) * -10).toFixed(2), (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(2));
    });
    vis.addEventListener('pointerleave', () => set(0, 0));
  }
})();
