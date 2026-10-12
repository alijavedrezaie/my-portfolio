const nav = document.querySelector('#navigation');
const menu = document.querySelector('.menu-toggle');
function closeMenu() { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded','false'); }
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); menu.focus(); } });
nav?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealSelector = '.section-heading,.split-intro > div,.project,.service-row,.service-detail,.process-step,.value,.supporting-item,.faq details,.cta-grid > *, .contact-grid > *';
  document.querySelectorAll(revealSelector).forEach(node => {
    node.classList.add('reveal');
    node.style.setProperty('--reveal-delay', `${Math.min([...node.parentElement.children].indexOf(node) * 80, 240)}ms`);
  });
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold:0.08 });
  document.querySelectorAll('.reveal').forEach(n => observer.observe(n));
  // Keyboard focus must never land on a visually hidden control.
  document.addEventListener('focusin', event => {
    event.target.closest('.reveal')?.classList.add('visible');
  });
}

// Small, reversible movement follows native scroll without changing document layout.
const scrollMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
  const motionNodes = [...document.querySelectorAll('.project,.value,.process-step,.supporting-item,.section-heading,.split-intro > div,.service-detail,.cta-grid > *')].filter(node => !node.closest('.work-page-grid'));
  const activeMotionNodes = new Set();
  let motionFrame = 0;
  const updateScrollMotion = () => {
    motionFrame = 0;
    const viewport = window.innerHeight;
    const mobile = window.innerWidth <= 760;
    const updates = [];
    activeMotionNodes.forEach(node => {
      if (!node.getClientRects().length) return;
      const rect = node.getBoundingClientRect();
      // Remove the previous translation from the measurement to avoid feedback.
      const top = rect.top - (node.matches(':focus-within') ? 0 : Number(node.dataset.scrollOffset || 0));
      const progress = Math.max(0, Math.min(1, (viewport - top) / (viewport + rect.height)));
      const travel = mobile ? 12 : node.matches('.project,.value,.process-step,.supporting-item') ? 28 : 18;
      const offset = (1 - progress * 2) * travel;
      updates.push({ node, offset });
    });
    updates.forEach(({ node, offset }) => {
      node.dataset.scrollOffset = String(offset);
      node.style.setProperty('--scroll-offset', `${offset.toFixed(2)}px`);
    });
  };
  const scheduleScrollMotion = () => {
    if (!scrollMotionPreference.matches && !motionFrame) motionFrame = requestAnimationFrame(updateScrollMotion);
  };
  const motionObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) activeMotionNodes.add(target);
      else activeMotionNodes.delete(target);
    });
    scheduleScrollMotion();
  }, { rootMargin: '80px 0px' });
  motionNodes.forEach(node => { node.classList.add('scroll-motion'); motionObserver.observe(node); });
  window.addEventListener('scroll', scheduleScrollMotion, { passive: true });
  window.addEventListener('resize', scheduleScrollMotion, { passive: true });
  document.addEventListener('click', scheduleScrollMotion);
  scrollMotionPreference.addEventListener('change', () => {
    if (motionFrame) cancelAnimationFrame(motionFrame);
    motionFrame = 0;
    motionNodes.forEach(node => {
      node.style.removeProperty('--scroll-offset');
      delete node.dataset.scrollOffset;
    });
    scheduleScrollMotion();
  });
}

const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  let count = 0;
  projects.forEach(project => { const show = filter === 'all' || project.dataset.category === filter; project.hidden = !show; if (show) count++; });
  const status = document.querySelector('#filter-result');
  if (status) status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
}));

const cases = {
  identity: {
    label:'PERSONAL PROJECT / VISUAL IDENTITY', title:'A signature built to tell stories.', image:'assets/identity.svg', alt:'Ali Rezaie brand identity in Cream, Black and Cardinal Red',
    description:'My personal identity brings graphic design and filmmaking into one visual language. The final AR mark, a focused red lens and a disciplined three-color palette create recognition across print, screens and motion.',
    role:'Visual identity, brand strategy, typography, guidelines and application design.',
    approach:'Preserve the final logo geometry, build a clear Inter hierarchy, and use cinematic framing with generous space. The system includes 48 pages of guidelines and reusable application templates.',
    link:'assets/brand-guidelines.pdf', linkLabel:'Explore the brand guide', service:'graphic-design'
  },
  digital: {
    label:'PERSONAL PROJECT / WEB DESIGN',title:'A portfolio with a clear purpose.',image:'assets/digital.svg',alt:'Responsive portfolio website design concept',
    description:'This portfolio translates the identity into an accessible, responsive website. It gives visitors a focused view of the work, explains freelance services and makes it easy to start a project conversation.',
    role:'Website direction, interface design, responsive HTML/CSS and front-end development.',
    approach:'A typography-led homepage, dedicated service descriptions, honest project labels and a useful inquiry builder. Shared design tokens keep the experience consistent across desktop and mobile.',
    link:'services.html',linkLabel:'Explore the services',service:'web-design'
  },
  motion: {
    label:'CONCEPT STUDY / MOTION DIRECTION',title:'A quiet entrance. A lasting signature.',image:'assets/motion.svg',alt:'Brand film title-card study using the approved AR mark',
    description:'A brand motion study exploring how a title, logo and restrained transition can set the tone for a film. This is an illustrative screen-graphics concept, not a client film or a claim of completed production work.',
    role:'Art direction, title-card design and an interactive motion demonstration.',
    approach:'Keep the logo geometry static. Let the title enter with a measured fade and subtle shift. Use a simple black field, Cream typography and one intentional red accent.',
    link:'contact.html?service=video-production',linkLabel:'Discuss a video project',service:'video-production',motion:true
  },
  stationery: {
    label:'PERSONAL PROJECT / PRINT SYSTEM',title:'Identity you can hold.',image:'assets/stationery.svg',alt:'Ali Rezaie business cards and stationery design',
    description:'An extension of the personal identity into business cards, correspondence and project documents. Quiet layouts, warm Cream and a consistent signature make the system feel considered in print.',
    role:'Business-card design, stationery, document templates and production guidance.',
    approach:'Keep content dominant, use the unchanged logo on a black carrier, and create a consistent typographic hierarchy. The guide documents trim, bleed, safe areas and color-proofing decisions.',
    link:'assets/brand-guidelines.pdf',linkLabel:'View the print guidelines',service:'graphic-design'
  }
};
const dialog = document.querySelector('#project-dialog');
let lastProjectTrigger;
document.querySelectorAll('[data-project]').forEach(trigger => trigger.addEventListener('click', e => {
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const item = cases[trigger.dataset.project];
  if (!item) return;
  e.preventDefault(); lastProjectTrigger = trigger;
  dialog.querySelector('[data-case-label]').textContent = item.label;
  dialog.querySelector('[data-case-title]').textContent = item.title;
  dialog.querySelector('[data-case-description]').textContent = item.description;
  dialog.querySelector('[data-case-role]').textContent = item.role;
  dialog.querySelector('[data-case-approach]').textContent = item.approach;
  const image = dialog.querySelector('[data-case-image]'); image.src = item.image; image.alt = item.alt;
  const link = dialog.querySelector('[data-case-link]'); link.href = item.link; link.textContent = item.linkLabel + ' ↗';
  link.target = item.link.endsWith('.pdf') ? '_blank' : '_self'; link.rel = 'noopener';
  dialog.querySelector('[data-case-contact]').href = `contact.html?service=${encodeURIComponent(item.service)}`;
  const demo = dialog.querySelector('.motion-demo'); demo.hidden = !item.motion; image.hidden = Boolean(item.motion);
  demo.classList.remove('playing'); dialog.querySelector('.motion-controls').textContent = 'Play title study';
  dialog.showModal();
}));
dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close(); });
dialog?.addEventListener('close', () => lastProjectTrigger?.focus());
dialog?.querySelector('.motion-controls').addEventListener('click', event => {
  const demo = dialog.querySelector('.motion-demo');demo.classList.remove('playing');
  requestAnimationFrame(() => requestAnimationFrame(() => demo.classList.add('playing')));
  event.currentTarget.textContent = reducedMotion ? 'Replay static title study' : 'Replay title study';
});

const form = document.querySelector('#inquiry-form');
if (form) {
  const service = new URLSearchParams(window.location.search).get('service');
  if ([...form.elements.service.options].some(o => o.value === service)) form.elements.service.value = service;
  const status = document.querySelector('#form-status');
  const getBrief = () => {
    const f = new FormData(form);
    const serviceLabel = form.elements.service.selectedOptions[0].textContent;
    return {
      subject:`Project inquiry — ${serviceLabel} — ${String(f.get('name')).trim()}`,
      body:`Hi Ali,\n\nI’d like to discuss a project.\n\nName: ${String(f.get('name')).trim()}\nEmail: ${String(f.get('email')).trim()}\nService: ${serviceLabel}\nBudget: ${f.get('budget') || 'To be discussed'}\nTimeline: ${f.get('timeline') || 'Flexible'}\n\nProject brief:\n${String(f.get('details')).trim()}\n\nBest,\n${String(f.get('name')).trim()}`
    };
  };
  const download = brief => {
    const blob = new Blob([brief.subject + '\n\n' + brief.body], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');a.href = URL.createObjectURL(blob);a.download='project-brief.txt';a.click();setTimeout(() => URL.revokeObjectURL(a.href),1000);
  };
  form.addEventListener('submit', event => {
    event.preventDefault();if (!form.reportValidity()) return;
    const brief = getBrief();
    window.location.href = `mailto:alijavedrezaie@gmail.com?subject=${encodeURIComponent(brief.subject)}&body=${encodeURIComponent(brief.body)}`;
    status.textContent = 'Your email draft is ready. Review and send it in your email app. If it did not open, copy or download your brief below.';
  });
  document.querySelector('#copy-brief').addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    const brief = getBrief();
    try { await navigator.clipboard.writeText(brief.subject+'\n\n'+brief.body); status.textContent='Brief copied. Paste it into an email to alijavedrezaie@gmail.com.'; }
    catch { download(brief);status.textContent='Clipboard access was unavailable, so your brief was downloaded instead.'; }
  });
  document.querySelector('#download-brief').addEventListener('click', () => {
    if (!form.reportValidity()) return;download(getBrief());status.textContent='Brief downloaded. You can attach it to your project inquiry.';
  });
}


// Inline artwork also works when the portfolio is opened directly as a local file.
const lensPointerMedia = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
const lensMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
const lensPointer = document.createElement('div');
lensPointer.className = 'lens-pointer';
lensPointer.setAttribute('aria-hidden', 'true');
const supportsLensPopover = typeof lensPointer.showPopover === 'function';
if (supportsLensPopover) lensPointer.setAttribute('popover', 'manual');
lensPointer.hidden = true;
lensPointer.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\">\n  <circle cx=\"16\" cy=\"16\" r=\"14\" fill=\"#171713\" stroke=\"#faedd6\" stroke-width=\"1.5\"/>\n  <path d=\"M16 2 A14 14 0 0 1 30 16\" fill=\"none\" stroke=\"#cf1e24\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n  <circle cx=\"16\" cy=\"3\" r=\"1.5\" fill=\"#faedd6\"/>\n  <circle cx=\"16\" cy=\"16\" r=\"10.5\" fill=\"#292929\" stroke=\"#cf1e24\"/>\n  <g fill=\"none\" stroke=\"#faedd6\" stroke-opacity=\".55\" stroke-width=\".7\">\n    <path d=\"M16 5.5 20 12M25.1 10.75 21.5 16M25.1 21.25 18 21M16 26.5 12 20M6.9 21.25 10.5 16M6.9 10.75 14 11\"/>\n  </g>\n  <circle class=\"lens-aperture\" cx=\"16\" cy=\"16\" r=\"5.5\" fill=\"#000\" stroke=\"#cf1e24\" stroke-width=\"1\"/>\n  <circle cx=\"14\" cy=\"14\" r=\"1.5\" fill=\"#faedd6\" opacity=\".65\"/>\n</svg>\n";
document.body.append(lensPointer);
const lensAperture = lensPointer.querySelector('.lens-aperture');
const lensArtwork = lensPointer.querySelector('svg');
let lensAnimation, lensFrame = 0, lensLastTime = 0, lensRotation = 0, lensVelocity = 0;
let lensX = 0, lensY = 0, lensLayer = null;
function hideLensPointer() {
  document.documentElement.classList.remove('lens-pointer-active');
  if (supportsLensPopover && lensPointer.matches(':popover-open')) lensPointer.hidePopover();
  lensPointer.hidden = true;
  cancelAnimationFrame(lensFrame);
  lensFrame = 0; lensLastTime = 0; lensVelocity = 0;
  lensAnimation?.cancel();
}
function renderLensPointer(time) {
  lensFrame = 0;
  if (lensPointer.hidden) return;
  const dt = lensLastTime ? Math.min((time - lensLastTime) / 1000, .05) : 1 / 60;
  lensLastTime = time;
  lensRotation = (lensRotation + lensVelocity * dt) % 360;
  lensVelocity *= Math.exp(-5 * dt);
  // Translate the outer shell and rotate the artwork independently of its shutter.
  lensPointer.style.transform = `translate3d(${lensX - 16}px,${lensY - 16}px,0)`;
  lensArtwork.style.rotate = `${lensRotation}deg`;
  if (lensVelocity > .5) lensFrame = requestAnimationFrame(renderLensPointer);
  else lensLastTime = 0;
}
function positionLensPointer(event) {
  const nativeControl = event.target.closest('input,textarea,select,[contenteditable],button:disabled');
  if (event.pointerType !== 'mouse' || !lensPointerMedia.matches || lensMotionMedia.matches || nativeControl) {
    hideLensPointer(); return false;
  }
  const entering = lensPointer.hidden;
  const distance = entering ? 0 : Math.hypot(event.clientX - lensX, event.clientY - lensY);
  lensX = event.clientX; lensY = event.clientY;
  lensVelocity = Math.min(900, lensVelocity + Math.min(distance, 60) * 9);
  const layer = event.target.closest('dialog[open]');
  if (supportsLensPopover) {
    if (layer !== lensLayer && lensPointer.matches(':popover-open')) lensPointer.hidePopover();
    lensPointer.hidden = false;
    if (!lensPointer.matches(':popover-open')) lensPointer.showPopover();
  } else {
    (layer || document.body).append(lensPointer);
    lensPointer.hidden = false;
  }
  lensLayer = layer;
  // Initial placement and clicks are exact; movement renders at most once per frame.
  if (entering || event.type === 'pointerdown') lensPointer.style.transform = `translate3d(${lensX - 16}px,${lensY - 16}px,0)`;
  document.documentElement.classList.add('lens-pointer-active');
  if (!lensFrame) lensFrame = requestAnimationFrame(renderLensPointer);
  return true;
}
document.addEventListener('pointermove', positionLensPointer, { passive: true });
document.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !positionLensPointer(event)) return;
  lensAnimation?.cancel();
  lensAnimation = lensAperture.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(.04)', offset: .4 },
    { transform: 'scale(.04)', offset: .5 },
    { transform: 'scale(1)' }
  ], { duration: 280, easing: 'ease-in-out' });
}, { passive: true });
document.documentElement.addEventListener('pointerleave', hideLensPointer);
window.addEventListener('blur', hideLensPointer);
document.addEventListener('visibilitychange', () => { if (document.hidden) hideLensPointer(); });
lensPointerMedia.addEventListener('change', hideLensPointer);
lensMotionMedia.addEventListener('change', hideLensPointer);


// Set data-resume-file on the resume layout to a local PDF path when ready.
const resumeLayout = document.querySelector('[data-resume-file]');
if (resumeLayout?.dataset.resumeFile) {
  const resumeUrl = new URL(resumeLayout.dataset.resumeFile, window.location.href);
  if (resumeUrl.origin === window.location.origin && resumeUrl.pathname.toLowerCase().endsWith('.pdf')) {
    resumeLayout.querySelector('[data-resume-view]').href = resumeUrl.href;
    resumeLayout.querySelector('[data-resume-download]').href = resumeUrl.href;
    resumeLayout.querySelector('[data-resume-placeholder]').hidden = true;
    resumeLayout.querySelector('[data-resume-actions]').hidden = false;
  }
}
