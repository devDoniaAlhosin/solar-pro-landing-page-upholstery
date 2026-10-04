/* Scroll, language, and page startup */
/* =====================================================================
   FOOTER + INIT
   ===================================================================== */
$('#social').innerHTML = SOCIAL.map(s => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}">${icon(s.icon)}</a>`).join('');
/* ---------- scroll effects: progress line, hero parallax, reveals ---------- */
const rvIO = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); rvIO.unobserve(en.target); } }), {threshold:.12, rootMargin:'0px 0px -6% 0px'});
function observeRv(){ $$('.rv:not(.in)').forEach(el => rvIO.observe(el)); }
const heroEl = $('#hero'), heroCopy = $('#heroCopy'), seatHolder = $('#seatHolder'), root = document.documentElement;
let ticking = false;
function onScroll(){
  if(ticking) return; ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = scrollY, max = Math.max(1, root.scrollHeight - innerHeight);
    root.style.setProperty('--sp', Math.min(1, y / max).toFixed(4));
    document.querySelector('.top').classList.toggle('on', y > 12 || pageMain.hidden);
    if(reduce) return;
    const p = Math.min(1, Math.max(0, y / Math.max(1, heroEl.offsetHeight)));
    heroCopy.style.transform = `translate3d(0,${(-p * 46).toFixed(1)}px,0)`;
    heroCopy.style.opacity = (1 - p * .75).toFixed(3);
    seatHolder.style.transform = `translate3d(0,${(p * 80).toFixed(1)}px,0) rotate(${(-p * 6).toFixed(2)}deg) scale(${(1 - p * .1).toFixed(3)})`;
  });
}
addEventListener('scroll', onScroll, {passive:true}); addEventListener('resize', onScroll);
drawFilters(); drawGallery(); buildStudio(); observeRv(); onScroll();

/* ---------- language switch (عربي / EN) ---------- */
const TITLES = {ar:'Solar Pro | تنجيد سيارات فاخر', en:'Solar Pro | Premium Car Upholstery'};
const DESCS  = {ar:'أعمال تنجيد سيارات حقيقية قبل وبعد، وصمّم كرسيك بنفسك بالنقشة واللون والخامة.', en:'Real before-and-after car upholstery work organized by brand, plus a step-by-step builder to design your own cabin.'};
function applyLang(l, save){
  LANG = l === 'en' ? 'en' : 'ar';
  const de = document.documentElement;
  de.lang = LANG; de.dir = LANG === 'en' ? 'ltr' : 'rtl';
  document.title = TITLES[LANG];
  const md = document.querySelector('meta[name="description"]'); if(md) md.setAttribute('content', DESCS[LANG]);
  $$('.lang').forEach(g => { g.dataset.on = LANG; });
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === LANG));
  if(save){ de.classList.remove('lang-swap'); void de.offsetWidth; de.classList.add('lang-swap'); }
  applyTheme(de.getAttribute('data-theme') || 'dark');
  drawFilters(); drawGallery();
  buildHeroPats(); heroPaint(false);
  renderStep(); updateHint();
  $('#social').innerHTML = SOCIAL.map(s => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}">${icon(s.icon)}</a>`).join('');
  if(!look.hidden) fillViewer(false);
  i18nApply(document.body);
  if(save){ try{ localStorage.setItem('sp-lang', LANG); }catch(e){} }
}
$$('.lang').forEach(g => g.addEventListener('click', e => { const b = e.target.closest('button'); if(b && b.dataset.l !== LANG) applyLang(b.dataset.l, true); }));
if(LANG === 'en') applyLang('en'); else i18nApply(document.body);

/* ---------- store display mode: add ?store to the address ---------- */
if(/[?&#]store/.test(location.search + location.hash)){
  let last = Date.now(), seeDesign = false;
  ['pointerdown','keydown','touchstart','wheel'].forEach(ev => addEventListener(ev, () => last = Date.now(), {passive:true}));
  new IntersectionObserver(es => es.forEach(en => seeDesign = en.isIntersecting), {threshold:.35}).observe($('#design'));
  setInterval(() => {
    if(Date.now() - last < 20000) return;
    if(!look.hidden){ stepAngle(1); return; }
    heroAuto = true;
    if(seeDesign) applyPreset(Math.floor(Math.random() * PRESETS_I.length));
  }, 7000);
}
