/* ============================================================================
   app.ts — améliorations progressives.
   Le site reste entièrement lisible et navigable sans ce script.
   ========================================================================== */

const root = document.documentElement;
root.classList.remove('no-js');
root.classList.add('js');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

/* --------------------------------------------------------------------------
   1. Barre haute — fond opaque après 80 px
   -------------------------------------------------------------------------- */
const nav = document.querySelector<HTMLElement>('[data-nav]');
if (nav) {
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 80);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   2. Ancre active au défilement
   -------------------------------------------------------------------------- */
const anchors = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLElement>('[data-anchor]').forEach((a) => {
  const href = a.getAttribute('data-anchor');
  if (href) anchors.set(href, a);
});
const sections = document.querySelectorAll<HTMLElement>('[data-section]');
if (sections.length && anchors.size) {
  const setActive = (id: string | null) => {
    anchors.forEach((a, href) => {
      a.toggleAttribute('aria-current', href === id);
      if (href === id) a.setAttribute('aria-current', 'true');
    });
  };
  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        const id = (visible.target as HTMLElement).dataset.section ?? null;
        if (anchors.has(id ?? '')) setActive(id);
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
  );
  sections.forEach((s) => spy.observe(s));
}

/* --------------------------------------------------------------------------
   3. Menu mobile plein écran
   -------------------------------------------------------------------------- */
const menu = document.querySelector<HTMLElement>('[data-menu]');
const menuOpenBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const menuCloseBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
let scrollLock = 0;

const lockScroll = (on: boolean) => {
  if (on) {
    scrollLock++;
    document.body.style.overflow = 'hidden';
  } else {
    scrollLock = Math.max(0, scrollLock - 1);
    if (scrollLock === 0) document.body.style.overflow = '';
  }
};

const openMenu = () => {
  if (!menu || !menuOpenBtn) return;
  menu.hidden = false;
  requestAnimationFrame(() => menu.classList.add('is-open'));
  menuOpenBtn.setAttribute('aria-expanded', 'true');
  lockScroll(true);
  menuCloseBtn?.focus();
};
const closeMenu = () => {
  if (!menu || !menuOpenBtn) return;
  menu.classList.remove('is-open');
  menuOpenBtn.setAttribute('aria-expanded', 'false');
  lockScroll(false);
  const done = () => {
    menu.hidden = true;
    menu.removeEventListener('transitionend', done);
  };
  if (reduced) menu.hidden = true;
  else menu.addEventListener('transitionend', done);
  menuOpenBtn.focus();
};

menuOpenBtn?.addEventListener('click', openMenu);
menuCloseBtn?.addEventListener('click', closeMenu);
menu?.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((l) =>
  l.addEventListener('click', closeMenu),
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu && !menu.hidden) closeMenu();
});

/* --------------------------------------------------------------------------
   4. Apparition au défilement + cascade
   -------------------------------------------------------------------------- */
const reveals = document.querySelectorAll<HTMLElement>('.reveal');
if (reduced) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        el.classList.add('is-in');
        const step = Number(el.dataset.stagger || 0);
        if (step > 0) {
          Array.from(el.children).forEach((child, i) => {
            (child as HTMLElement).style.transition =
              'opacity .5s ease, transform .6s cubic-bezier(.16,1,.3,1)';
            (child as HTMLElement).style.transitionDelay = `${i * step}ms`;
            (child as HTMLElement).style.opacity = '0';
            (child as HTMLElement).style.transform = 'translateY(18px)';
            requestAnimationFrame(() => {
              (child as HTMLElement).style.opacity = '1';
              (child as HTMLElement).style.transform = 'none';
            });
          });
        }
        obs.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  reveals.forEach((el) => revealObserver.observe(el));
}

/* --------------------------------------------------------------------------
   5. Comptage des chiffres
   -------------------------------------------------------------------------- */
type Counter = { el: HTMLElement; pre: string; val: number; dec: number; post: string; done: boolean };

const counters: Counter[] = [];
document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
  const raw = (el.textContent || '').trim();
  const m = raw.match(/^(\D*?)([\d][\d .,]*[\d]|[\d])(.*)$/);
  if (!m) return;
  const core = m[2].replace(/\s/g, '');
  const decMatch = core.match(/[.,](\d+)$/);
  counters.push({
    el,
    pre: m[1],
    val: parseFloat(core.replace(',', '.')),
    dec: decMatch ? decMatch[1].length : 0,
    post: m[3],
    done: false,
  });
  el.dataset.final = raw;
});

const fr = (n: number, dec: number) => n.toFixed(dec).replace('.', ',');

const runCounter = (c: Counter) => {
  if (c.done) return;
  c.done = true;
  if (reduced) {
    c.el.textContent = c.el.dataset.final ?? c.el.textContent;
    return;
  }
  const t0 = performance.now();
  const D = 900;
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / D);
    const e = 1 - Math.pow(1 - p, 3);
    c.el.textContent = c.pre + fr(c.val * e, c.dec) + c.post;
    if (p < 1) requestAnimationFrame(tick);
    else c.el.textContent = c.el.dataset.final ?? c.el.textContent;
  };
  // départ à zéro
  c.el.textContent = c.pre + fr(0, c.dec) + c.post;
  requestAnimationFrame(tick);
};

if (counters.length) {
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const c = counters.find((x) => x.el === e.target);
        if (c) runCounter(c);
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((c) => countObserver.observe(c.el));
}

/* --------------------------------------------------------------------------
   6. Onde au clic (ripple)
   -------------------------------------------------------------------------- */
if (!reduced) {
  document.addEventListener(
    'pointerdown',
    (ev) => {
      const target = (ev.target as HTMLElement)?.closest<HTMLElement>('.rippling');
      if (!target) return;
      const r = target.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.2;
      const ink = document.createElement('span');
      ink.className = 'ripple';
      if (target.closest('.on-cream')) ink.classList.add('ripple--ink');
      else if (target.classList.contains('pill--solid')) ink.classList.add('ripple--bright');
      ink.style.width = ink.style.height = `${d}px`;
      ink.style.left = `${ev.clientX - r.left - d / 2}px`;
      ink.style.top = `${ev.clientY - r.top - d / 2}px`;
      target.appendChild(ink);
      requestAnimationFrame(() => {
        ink.style.transform = 'scale(1)';
        ink.style.opacity = '0';
      });
      setTimeout(() => ink.remove(), 650);
    },
    { passive: true },
  );
}

/* --------------------------------------------------------------------------
   7. Vignettes Travaux — vidéo au survol / à l'entrée, ouverture lightbox
   -------------------------------------------------------------------------- */
const works = document.querySelectorAll<HTMLElement>('.work');
works.forEach((w) => {
  const video = w.querySelector<HTMLVideoElement>('[data-work-video]');
  const play = () => {
    if (!video) return;
    w.classList.add('is-playing');
    video.play().catch(() => {});
  };
  const stop = () => {
    if (!video) return;
    w.classList.remove('is-playing');
    video.pause();
  };
  if (canHover) {
    w.addEventListener('mouseenter', play);
    w.addEventListener('mouseleave', stop);
    w.addEventListener('focusin', play);
    w.addEventListener('focusout', stop);
  } else if (video && !reduced) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? play() : stop())),
      { threshold: 0.6 },
    );
    io.observe(w);
  }
});

/* --------------------------------------------------------------------------
   8. Carrousel mobile — indicateurs
   -------------------------------------------------------------------------- */
const carousel = document.querySelector<HTMLElement>('[data-carousel]');
const counter = document.querySelector<HTMLElement>('[data-counter]');
if (carousel && counter) {
  // ignore les séparateurs de groupe (.works__divider) : seules les vraies
  // vignettes comptent pour l'indexation et le compteur.
  const items = Array.from(carousel.querySelectorAll<HTMLElement>(':scope > .work'));
  const total = String(items.length).padStart(2, '0');
  // vignette dont le bord gauche est le plus proche du défilement courant.
  let currentIndex = 0;
  const closestIndex = () => {
    let idx = 0;
    let best = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft - carousel.scrollLeft);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    return idx;
  };
  const sync = () => {
    currentIndex = closestIndex();
    counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${total}`;
  };
  carousel.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  sync();

  // Défilement automatique — en boucle, mis en pause dès que la personne
  // interagit (glisser, survol, tactile), désactivé sous prefers-reduced-motion.
  const autoplayMs = Number(carousel.dataset.autoplay || 0);
  if (autoplayMs > 0 && items.length > 1 && !reduced) {
    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      const next = (closestIndex() + 1) % items.length;
      carousel.scrollTo({ left: items[next].offsetLeft, behavior: 'smooth' });
    };
    const play = () => {
      if (timer) return;
      timer = setInterval(tick, autoplayMs);
    };
    const pause = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    play();
    carousel.addEventListener('pointerdown', pause);
    carousel.addEventListener('pointerup', play);
    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', play);
    carousel.addEventListener('touchstart', pause, { passive: true });
    carousel.addEventListener('touchend', play, { passive: true });
  }

  // Flèches de navigation — le glisser seul n'est pas assez explicite,
  // ces boutons rendent le défilement évident.
  const worksWrap = carousel.closest<HTMLElement>('.works');
  const prevBtn = worksWrap?.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const nextBtn = worksWrap?.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const goTo = (i: number) => {
    const idx = Math.max(0, Math.min(items.length - 1, i));
    carousel.scrollTo({ left: items[idx].offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
  };
  prevBtn?.addEventListener('click', () => goTo(closestIndex() - 1));
  nextBtn?.addEventListener('click', () => goTo(closestIndex() + 1));

  // Glisser à la souris/trackpad — le tactile a déjà son scroll natif
  // (overflow-x + scroll-snap), mais un clic-glisser à la souris ne déclenche
  // aucun scroll par défaut dans un navigateur de bureau.
  let dragging = false;
  let dragMoved = false;
  let startX = 0;
  let startScroll = 0;
  carousel.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    dragging = true;
    dragMoved = false;
    startX = e.clientX;
    startScroll = carousel.scrollLeft;
    carousel.setPointerCapture(e.pointerId);
    carousel.classList.add('is-grabbing');
  });
  carousel.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) dragMoved = true;
    carousel.scrollLeft = startScroll - dx;
  });
  const endDrag = () => {
    dragging = false;
    carousel.classList.remove('is-grabbing');
  };
  carousel.addEventListener('pointerup', endDrag);
  carousel.addEventListener('pointerleave', endDrag);
  carousel.addEventListener('pointercancel', endDrag);
  // évite d'ouvrir une vignette si on vient de la faire glisser
  carousel.addEventListener(
    'click',
    (e) => {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true },
  );
}

/* --------------------------------------------------------------------------
   9. Lightbox
   -------------------------------------------------------------------------- */
const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
const lbMedia = dialog?.querySelector<HTMLElement>('[data-lightbox-media]');
const lbCap = dialog?.querySelector<HTMLElement>('[data-lightbox-cap]');
const lbClose = dialog?.querySelector<HTMLButtonElement>('[data-lightbox-close]');
let lastFocused: HTMLElement | null = null;

const buildMedia = (btn: HTMLElement) => {
  const src = btn.dataset.src || '';
  const type = btn.dataset.mediaType || 'video';
  const fmt = btn.dataset.format || '9:16';
  const title = btn.dataset.title || '';
  if (src && type === 'video') {
    return `<video src="${src}" controls autoplay loop playsinline style="width:100%;height:auto;max-height:88svh"></video>`;
  }
  if (src && type === 'image') {
    return `<img src="${src}" alt="${title}" style="width:100%;height:auto" />`;
  }
  return `<div class="ph" style="aspect-ratio:${fmt.replace(':', ' / ')}" role="img" aria-label="${title}"><span aria-hidden="true">${
    type === 'image' ? 'CARROUSEL' : 'REEL'
  } ${fmt}<br>${title.toUpperCase()}</span></div>`;
};

const openLightbox = (btn: HTMLElement) => {
  if (!dialog || !lbMedia || !lbCap) return;
  lastFocused = document.activeElement as HTMLElement;
  lbMedia.innerHTML = buildMedia(btn);
  const sector = (btn.dataset.sector || '').toUpperCase();
  const title = btn.dataset.title || '';
  lbCap.textContent = [title, sector].filter(Boolean).join(' — ');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  lockScroll(true);
  lbClose?.focus();
};

const closeLightbox = () => {
  if (!dialog || !lbMedia) return;
  if (dialog.open && typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
  lbMedia.innerHTML = '';
  lockScroll(false);
  lastFocused?.focus();
};

document.querySelectorAll<HTMLElement>('[data-lightbox]').forEach((btn) => {
  btn.addEventListener('click', () => openLightbox(btn));
});
lbClose?.addEventListener('click', closeLightbox);
dialog?.addEventListener('cancel', (e) => {
  e.preventDefault();
  closeLightbox();
});
dialog?.addEventListener('click', (e) => {
  if (e.target === dialog) closeLightbox();
});

/* fermeture par glissement vers le bas (mobile) */
if (dialog) {
  let startY = 0;
  let dy = 0;
  dialog.addEventListener(
    'touchstart',
    (e) => {
      startY = e.touches[0].clientY;
      dy = 0;
    },
    { passive: true },
  );
  dialog.addEventListener(
    'touchmove',
    (e) => {
      dy = e.touches[0].clientY - startY;
    },
    { passive: true },
  );
  dialog.addEventListener('touchend', () => {
    if (dy > 90) closeLightbox();
  });
}

/* --------------------------------------------------------------------------
   10. Formulaire de contact
   Pas de service tiers (Formspree, etc.) — choix explicite d'Adrien. Le
   formulaire ouvre directement le client mail du visiteur, avec un sujet et
   un corps de message déjà composés à partir des 3 champs. L'attribut
   `action="mailto:…" method="get"` sur le <form> (cf. Contact.astro) sert
   de repli natif si le JS ne charge pas — cette version JS, plus riche,
   prend le relais dès qu'elle s'exécute.
   -------------------------------------------------------------------------- */
const form = document.querySelector<HTMLFormElement>('[data-form]');
const statusEl = form?.querySelector<HTMLElement>('[data-status]');

if (form && statusEl) {
  const mailTo = form.dataset.mailto || '';
  const nomInput = form.querySelector<HTMLInputElement>('#cf-nom');
  const emailInput = form.querySelector<HTMLInputElement>('#cf-email');
  const msgInput = form.querySelector<HTMLTextAreaElement>('#cf-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      statusEl.dataset.state = 'error';
      statusEl.textContent = 'Merci de compléter les trois champs (e-mail valide).';
      form.reportValidity();
      return;
    }

    const nom = nomInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const message = msgInput?.value.trim() || '';

    const subject = `Nouveau projet — ${nom}`;
    const body = `Nom / marque : ${nom}\nE-mail : ${email}\n\nÉchéance & volume visé :\n${message}`;
    window.location.href = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    statusEl.dataset.state = 'ok';
    statusEl.textContent = `Ouverture de votre messagerie — si rien ne se passe, écrivez directement à ${mailTo}.`;
    form.reset();
  });
}

