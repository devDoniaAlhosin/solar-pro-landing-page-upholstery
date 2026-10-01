const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(hover: none)').matches;
const ar = n => LANG === 'en' ? String(n) : Number(n).toLocaleString('ar-EG', {useGrouping:false});
const colorOf = id => COLORS.find(c => c.id === id);
const brandOf = id => BRANDS.find(b => b.id === id) || {id, name:id};
const brandMark = (b, cls) => b.mono
  ? `<span class="${cls} mono" style="--logo:url('${b.logo}');--ar:${b.ar}"></span>`
  : `<img class="${cls}" src="${b.logo}" alt="">`;
const projOf  = id => PROJECTS.find(p => p.id === id);
const plural  = n => LANG === 'en' ? (n === 1 ? '1 angle' : `${n} angles`) : (n === 1 ? 'زاوية واحدة' : n === 2 ? 'زاويتان' : n <= 10 ? `${ar(n)} زوايا` : `${ar(n)} زاوية`);
const bc = (br, pr) => `${t(br.name)} ${t(pr.car)}`;           // اسم الماركة + الموديل
const WA_MSG = {
  ask:  () => LANG === 'en' ? 'Hello, I would like to ask about upholstering my car.' : 'السلام عليكم، حابب أستفسر عن تنجيد سيارتي.',
  similar: (title, car) => LANG === 'en' ? `Hello, I would like the ${t(title)} in my car done in a similar way to your ${car} project. Could I get the details and price?` : `السلام عليكم، حابب أنجّد ${title} في سيارتي بشكل مشابه لعمل ${car}. ممكن التفاصيل والسعر؟`,
  design: lines => LANG === 'en' ? `Hello, I would like my car's cabin upholstered with this design:\n${lines}\nCould I get the details and price?` : `السلام عليكم، حابب أنجّد مقصورة سيارتي بهذا التصميم:\n${lines}\nممكن التفاصيل والسعر؟`,
};
const partOf  = id => PARTS.find(t => t.id === id);
const GAIN = 1.32;
const rgbOf = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const tintOf = hex => {
  const c = rgbOf(hex), g = Math.min(GAIN, 255 / Math.max(...c));
  return `rgb(${c.map(v => Math.min(255, Math.round(v * g))).join(',')})`;
};
/* الألوان الفاتحة تحتاج رفع إضاءة لأن الضرب فوق رمادي لا يُفتّح */
const liftOf = hex => { const [r, g, b] = rgbOf(hex); const L = (0.2126*r + 0.7152*g + 0.0722*b) / 255; return Math.max(0, Math.min(.62, (L - .58) * 1.75)).toFixed(3); };
const waLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const icon = id => `<svg class="i" aria-hidden="true"><use href="#${id}"/></svg>`;
const SEATW = 820, SEATH = 1219;
const THUMB = {x:430, y:500, s:240};      // منطقة النقشة المكبّرة داخل صورة الكرسي

/* ---------- theme toggle (dark is the default) ---------- */
function applyTheme(t, save){
  document.documentElement.setAttribute('data-theme', t);
  $$('.theme').forEach(b => b.setAttribute('aria-label', t === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'));
  if(save){ try{ localStorage.setItem('sp-theme', t); }catch(e){} }
}
$$('.theme').forEach(b => b.addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true)));
applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');

/* ---------- worn illustration (fallback for jobs without photos) ---------- */
const wearSVG = (w, variant) => `
<div class="wear" style="opacity:${(.55 + .45*w).toFixed(2)}"><svg viewBox="0 0 1127 1675" preserveAspectRatio="none" aria-hidden="true">
  <rect width="1127" height="1675" fill="#000" filter="url(#${variant ? 'stainB' : 'stainA'})" opacity=".8"/>
  <rect width="1127" height="1675" fill="#000" filter="url(#grain)" opacity=".16"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" ${variant ? 'transform="translate(1127 0) scale(-1 1)"' : ''}>
    <g stroke="#2a1b10" stroke-width="3" opacity=".85">
      <path d="M250 1150l40 22-14 30 46 26-8 34 36 18"/><path d="M520 1190l30-16 34 20-6 30 40 10"/>
      <path d="M690 700l36 24-10 38 40 30-4 44 30 20"/><path d="M420 620l22 40-18 36 24 44"/>
      <path d="M740 130l30 14-6 30 30 20"/><path d="M600 1010l40 12 22-22 38 8"/>
    </g>
  </g>
</svg></div>`;
const seatHTML = ({pattern=1, color='#888', insert, wear=0, variant=0, finish='smooth'}) => `
<div class="seat" data-finish="${finish}" style="--t1:${tintOf(color)};--t2:${tintOf(insert || color)};--l1:${liftOf(color)};--l2:${liftOf(insert || color)}">
  <div class="base b${pattern}"></div><div class="tint t1"></div><div class="tint t2"></div><div class="lift l1"></div><div class="lift l2"></div>
  <div class="sheen b${pattern}"></div><div class="gloss"></div>
  ${wear ? wearSVG(wear, variant) : ''}
</div>`;
const imgTag = (src, alt, focus) => `<img class="photo" src="${src}" alt="${alt}" draggable="false" style="object-position:${focus || '50% 50%'}">`;
const afterOf  = j => j.after  ? imgTag(j.after,  `${j.car} — ${j.title} بعد التنجيد`, j.focus) : seatHTML({pattern:j.pattern ?? 0, color:colorOf(j.color || 'cognac').hex});
const beforeOf = j => j.before ? imgTag(j.before, `${j.car} — ${j.title} قبل التنجيد`, j.focus) : seatHTML({pattern:1, color:j.old || '#9d8f7d', wear:j.wear ?? .9, variant:JOBS.indexOf(j)%2});
const setPanes = (cmp, j) => {
  $('.pane.before', cmp).innerHTML = beforeOf(j);
  $('.pane.after',  cmp).innerHTML = afterOf(j);
  $$('.pane', cmp).forEach(p => { p.classList.toggle('has-photo', !!j.after); });
  $('.pane.after', cmp).classList.toggle('quilt', !j.after);
};

/* ---------- reusable before/after slider ---------- */
const cmpInner = () => `
  <div class="pane before"></div><div class="pane after"></div>
  <button class="tag t-before" type="button" data-go="0">قبل</button>
  <button class="tag t-after" type="button" data-go="100">بعد</button>
  <div class="handle" role="slider" tabindex="0" aria-label="اسحب للمقارنة بين قبل وبعد" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
    <span class="grip" aria-hidden="true">${icon('i-cmp')}</span>
  </div>`;

function makeCompare(root){
  root.innerHTML = cmpInner();
  const handle = $('.handle', root);
  let pos = 50, raf = 0, drag = false;
  const set = p => { p = Math.max(0, Math.min(100, p)); pos = p; root.style.setProperty('--pos', p + '%'); handle.setAttribute('aria-valuenow', Math.round(p)); };
  const stop = () => cancelAnimationFrame(raf);
  const sweep = (from, to, ms) => {
    stop();
    if(reduce){ set(to); return; }
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3);
      set(from + (to - from) * e);
      if(t < 1) raf = requestAnimationFrame(step);
    };
    set(from); raf = requestAnimationFrame(step);
  };
  const at = x => { const r = root.getBoundingClientRect(); set((x - r.left) / r.width * 100); };
  root.addEventListener('pointerdown', e => {
    if(e.target.closest('.tag')) return;
    drag = true; stop(); root.setPointerCapture(e.pointerId); at(e.clientX);
    root.dispatchEvent(new CustomEvent('touched'));
  });
  root.addEventListener('pointermove', e => { if(drag) at(e.clientX); });
  const end = () => drag = false;
  root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
  handle.addEventListener('keydown', e => {
    const k = {ArrowLeft:-5, ArrowRight:5, Home:-100, End:100}[e.key];
    if(k === undefined) return; e.preventDefault(); stop(); set(pos + k);
    root.dispatchEvent(new CustomEvent('touched'));
  });
  $$('.tag', root).forEach(b => b.addEventListener('click', () => { sweep(pos, +b.dataset.go, 500); root.dispatchEvent(new CustomEvent('touched')); }));
  set(50);
  return {set, sweep, stop, el:root, get pos(){ return pos; }};
}


/* =====================================================================
   HERO — one seat, colors change by themselves, buttons take control
   ===================================================================== */
const HERO_MS = 3600;
const hero = {i:5, pattern:0, custom:null, playing:!reduce, timer:0, visible:true};
const multiSeatHTML = (id, finish='smooth') => `
  <div class="seat" id="${id}" data-finish="${finish}">
    ${PATTERNS.map((_, i) => `<div class="base b${i}" data-i="${i}"></div>`).join('')}
    <div class="tint t1"></div><div class="tint t2"></div><div class="lift l1"></div><div class="lift l2"></div>
    ${PATTERNS.map((_, i) => `<div class="sheen b${i}" data-i="${i}"></div>`).join('')}
    <div class="gloss"></div><div class="shine"></div>
  </div>`;
const paintColor = v => (typeof v === 'string' && v.charAt(0) === '#') ? {hex:v} : colorOf(v);
function applySeat(seat, {pattern, body, insert, finish}){
  const b = paintColor(body), s = paintColor(insert || body);
  seat.dataset.finish = finish || 'smooth';
  seat.style.setProperty('--t1', tintOf(b.hex)); seat.style.setProperty('--t2', tintOf(s.hex));
  seat.style.setProperty('--l1', liftOf(b.hex)); seat.style.setProperty('--l2', liftOf(s.hex));
  $$('.base', seat).forEach(el => el.style.opacity = +el.dataset.i === pattern ? 1 : 0);
  $$('.sheen', seat).forEach(el => el.style.opacity = +el.dataset.i === pattern ? '' : 0);
}
$('#seatHolder').innerHTML = multiSeatHTML('hSeat');
$('#hSws').innerHTML = COLORS.map((c, i) => `<button class="hsw" type="button" role="radio" data-i="${i}" aria-label="${c.name}" aria-checked="false" style="--c:${c.hex}" title="${c.name}"><i></i></button>`).join('');
const buildHeroPats = () => { $('#hPats').innerHTML = PATTERNS.map((p, i) => `<button type="button" data-p="${i}" aria-pressed="false" aria-label="${LANG === 'en' ? t(p.name) + ' pattern' : 'نقشة ' + p.name}">${icon(p.icon)}<span>${p.name}</span></button>`).join(''); };
buildHeroPats();

function heroColor(){
  return hero.custom ? {hex:hero.custom, name:'لون خاص'} : COLORS[hero.i];
}
function heroPaint(pulse){
  const c = heroColor(), seat = $('#hSeat'), pick = $('#hCustom').closest('.hcustom');
  applySeat(seat, {pattern:hero.pattern, body:c.hex, insert:c.hex, finish:'smooth'});
  $('#heroSeat').style.setProperty('--hc', c.hex);
  $('#hName').textContent = t(c.name); $('#hDot').style.background = c.hex;
  $('#hPatName').textContent = LANG === 'en' ? `· ${t(PATTERNS[hero.pattern].name)} pattern` : `· نقشة ${PATTERNS[hero.pattern].name}`;
  $$('#hSws .hsw').forEach((b, k) => b.setAttribute('aria-checked', !hero.custom && k === hero.i));
  pick.setAttribute('aria-checked', hero.custom ? 'true' : 'false');
  if(hero.custom) pick.style.setProperty('--pick', hero.custom);
  $$('#hPats button').forEach((b, k) => b.setAttribute('aria-pressed', k === hero.pattern));
  if(pulse && !reduce){ seat.classList.remove('pulse'); void seat.offsetWidth; seat.classList.add('pulse'); }
  i18nApply($('#heroSeat'));
}
function heroSchedule(){
  clearTimeout(hero.timer);
  if(!hero.playing) return;
  hero.timer = setTimeout(() => {
    if(document.hidden || !hero.visible){ heroSchedule(); return; }
    heroStep(1, true);
  }, HERO_MS);
}
function heroStep(d, auto){
  const n = COLORS.length;
  if(hero.custom) hero.custom = null;
  const next = hero.i + d;
  if(auto && next >= n) hero.pattern = (hero.pattern + 1) % PATTERNS.length;   // بعد كل دورة ألوان تتغيّر النقشة
  hero.i = (next + n) % n;
  heroPaint(true); heroSchedule();
}
$('#hSws').addEventListener('click', e => { const b = e.target.closest('.hsw'); if(!b) return; hero.custom = null; hero.i = +b.dataset.i; heroPaint(true); heroSchedule(); });
$('#hCustom').addEventListener('input', e => { hero.custom = e.target.value; heroPaint(true); heroSchedule(); });
$('#hPats').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; hero.pattern = +b.dataset.p; heroPaint(true); heroSchedule(); });
new IntersectionObserver(es => es.forEach(en => hero.visible = en.isIntersecting), {threshold:.2}).observe($('#hero'));
heroPaint(false); heroSchedule();
setTimeout(() => $('#mk1').classList.add('in'), 150);

/* =====================================================================
   FILTER STATE (works grid)
   ===================================================================== */
const state = {brand:'all', part:'all'};
const visible = () => JOBS.filter(j => (state.brand === 'all' || projOf(j.project).brand === state.brand) && (state.part === 'all' || j.part === state.part));
const visibleProjects = () => [...new Set(visible().map(j => j.project))];

/* =====================================================================
   WORKS — brands → projects → angles, hover to compare, full viewer
   ===================================================================== */
function drawFilters(){
  const pool = state.brand === 'all' ? JOBS : JOBS.filter(j => projOf(j.project).brand === state.brand);
  if(state.part !== 'all' && !pool.some(j => j.part === state.part)) state.part = 'all';
  const brands = BRANDS.filter(b => JOBS.some(j => projOf(j.project).brand === b.id));
  const parts = PARTS.filter(p => pool.some(j => j.part === p.id));
  const mark = item => item.logo ? brandMark(item, 'blogo') : (item.id && item.id !== 'all' ? `<span class="bmark">${item.name.trim().charAt(0)}</span>` : '');
  const group = (label, key, list, countOf, cls='') => list.length < 1 ? '' : `
    <div class="fgroup"><b>${label}</b><div class="chips" role="group" aria-label="${label}">
      ${[{id:'all', name:'الكل'}, ...list].map(item => `<button class="chip ${cls}" type="button" data-k="${key}" data-t="${item.id}" aria-pressed="${state[key] === item.id}">${cls ? mark(item) : ''}${item.name}<small>${ar(countOf(item.id))}</small></button>`).join('')}
    </div></div>`;
  $('#filters').innerHTML =
    group('الماركة', 'brand', brands, id => id === 'all' ? JOBS.length : JOBS.filter(j => projOf(j.project).brand === id).length, 'brand') +
    (parts.length > 1 ? group('الزاوية', 'part', parts, id => id === 'all' ? pool.length : pool.filter(j => j.part === id).length) : '');
  $('#filterOpen').classList.toggle('hot', state.brand !== 'all' || state.part !== 'all');
  i18nApply($('#filters'));
}
const filterMQ = matchMedia('(max-width:699px)');
function setFiltersOpen(on){
  on = !!(on && filterMQ.matches);
  $('#filterDrawer').classList.toggle('on', on);
  $('#filterDrawer').inert = filterMQ.matches && !on;
  $('#filterBack').hidden = !on;
  $('#filterOpen').setAttribute('aria-expanded', on ? 'true' : 'false');
  document.body.classList.toggle('filters-open', on);
}
$('#filterOpen').addEventListener('click', () => { setFiltersOpen(true); $('#filterClose').focus(); });
$('#filterClose').addEventListener('click', () => setFiltersOpen(false));
$('#filterBack').addEventListener('click', () => setFiltersOpen(false));
addEventListener('keydown', e => { if(e.key === 'Escape' && document.body.classList.contains('filters-open')) setFiltersOpen(false); });
filterMQ.addEventListener('change', () => setFiltersOpen(false));
setFiltersOpen(false);
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if(!b || state[b.dataset.k] === b.dataset.t) return;
  state[b.dataset.k] = b.dataset.t; drawFilters();
  const g = $('#gallery');
  if(reduce){ drawGallery(); return; }
  g.classList.add('out');
  setTimeout(() => { drawGallery(); g.classList.remove('out'); }, 200);
});

function tween(mini, from, to, ms, done){
  const t0 = performance.now();
  const step = now => {
    const t = Math.min(1, (now - t0) / ms), e = t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
    mini.style.setProperty('--pos', (from + (to - from) * e) + '%');
    if(t < 1) requestAnimationFrame(step); else done && done();
  };
  requestAnimationFrame(step);
}
const peekIO = new IntersectionObserver(es => es.forEach(en => {
  if(!en.isIntersecting) return;
  peekIO.unobserve(en.target);
  const mini = $('.mini', en.target);
  mini.classList.add('live');
  tween(mini, 100, 36, 800, () => tween(mini, 36, 50, 800, () => mini.classList.remove('live')));
}), {threshold:.7});

const tileClass = n => n === 0 ? 'lead' : '';
const imgT = (src, alt, focus) => src ? `<img class="photo" src="${src}" alt="${alt}" draggable="false" decoding="async" style="object-position:${focus || '50% 50%'}">` : '';
function drawGallery(){
  const jobs = visible(), pids = visibleProjects();
  if(!pids.length){ $('#gallery').innerHTML = '<p class="empty">لا توجد أعمال بهذا التصنيف حاليًا.</p>'; i18nApply($('#gallery')); return; }
  let gi = 0;
  $('#gallery').innerHTML = pids.map(pid => {
    const pr = projOf(pid), br = brandOf(pr.brand), list = jobs.filter(j => j.project === pid), total = JOBS.filter(j => j.project === pid).length;
    const tiles = list.map((j, n) => {
      const i = JOBS.indexOf(j), c = j.color && colorOf(j.color);
      return `<button class="tile ${tileClass(n)}" type="button" data-i="${i}" ${n === 0 ? 'data-peek="1"' : ''} aria-label="${bc(br, pr)} — ${t(j.title)}${LANG === 'en' ? ', ' : '، '}${t('عرض قبل وبعد')}">
        <span class="mini">
          <span class="pane before">${imgT(j.before, `${t(j.title)} — ${t('قبل التنجيد')}`, j.focus)}</span>
          <span class="pane after">${imgT(j.after, `${t(j.title)} — ${t('بعد التنجيد')}`, j.focus)}</span>
          <span class="div"></span>
          <span class="mlb b">قبل</span><span class="mlb a">بعد</span>
          <span class="kind">${partOf(j.part).name}</span>
          <span class="cmpico">${icon('i-cmp')}</span>
        </span>
        <span class="meta"><span class="nm"><b>${j.title}</b><small>${bc(br, pr)}</small></span>${c ? `<span class="dot" style="background:${c.hex}" title="${c.name}"></span>` : ''}</span>
      </button>`;
    }).join('');
    const first = JOBS.indexOf(list[0]);
    return `<section class="pgroup rv" aria-label="${bc(br, pr)}">
      <header class="phead">
        <div><h3>${br.logo ? brandMark(br, 'pbrand') : `<span class="bmark">${br.name.trim().charAt(0)}</span>`}<span><b>${t(br.name)}</b> ${t(pr.car)}${pr.year ? ' ' + ar(pr.year) : ''}</span></h3></div>
        <div class="pm"><span>${plural(total)}</span><button class="btn ghost small" type="button" data-open="${first}">افتح المشروع</button></div>
      </header>
      <div class="bento">${tiles}</div>
    </section>`;
  }).join('');
  $$('#gallery .tile').forEach(t => {
    const mini = $('.mini', t);
    t.addEventListener('pointermove', e => {
      if(e.pointerType === 'touch') return;
      const r = mini.getBoundingClientRect();
      mini.classList.add('live');
      const sx = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
      mini.style.setProperty('--pos', (LANG === 'en' ? 100 - sx : sx) + '%');
    });
    t.addEventListener('pointerleave', () => { mini.classList.remove('live'); mini.style.setProperty('--pos', '50%'); });
    t.addEventListener('click', () => openViewer(+t.dataset.i));
    if(!reduce && (coarse || t.dataset.peek)) peekIO.observe(t);
  });
  $$('#gallery [data-open]').forEach(b => b.addEventListener('click', () => openViewer(+b.dataset.open)));
  i18nApply($('#gallery'));
  observeRv();
}

/* ---------- viewer ---------- */
const look = $('#look');
const V = {job:0, mode:'slide', zoom:false, pos:50, raf:0, drag:false, hold:false, saved:50, flip:'after'};
const vEl = { canvas:$('#vdCanvas'), frames:$('#vdFrames'), zoom:$('#vdZoom'), handle:$('#vdHandle'), before:$('#vdBefore'), after:$('#vdAfter') };
const projJobs = pid => JOBS.filter(j => j.project === pid);

function vSet(p){
  p = Math.max(0, Math.min(100, p)); V.pos = p;
  vEl.frames.style.setProperty('--pos', p + '%');
  vEl.handle.setAttribute('aria-valuenow', Math.round(p));
  $('.vfig.vfa figcaption', vEl.frames).style.opacity = p > 14 ? 1 : 0;
  $('.vfig.vfb figcaption', vEl.frames).style.opacity = p < 86 ? 1 : 0;
}
function vSweep(from, to, ms){
  cancelAnimationFrame(V.raf);
  if(reduce){ vSet(to); return; }
  const t0 = performance.now();
  const step = now => { const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3); vSet(from + (to - from) * e); if(t < 1) V.raf = requestAnimationFrame(step); };
  vSet(from); V.raf = requestAnimationFrame(step);
}
function setMode(m){
  V.mode = m; vEl.canvas.dataset.mode = m;
  $$('#vdModes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
  if(m === 'flip'){ V.flip = 'after'; vEl.canvas.dataset.flip = 'after'; $('#vdState').textContent = t('بعد'); }
  if(m !== 'slide') setZoom(false);
  $('#vdZoomBtn').disabled = m === 'side';
  $('#vdHold').hidden = m === 'side';
  updateHint();
  if(m === 'slide') vSweep(V.pos, 55, 600);
}
function updateHint(){
  const en = LANG === 'en';
  $('#vdHint').textContent = V.mode === 'slide' ? (en ? 'Drag the line to compare · ↑ ↓ to switch angles' : 'اسحب الخط للمقارنة · ↑ ↓ للتنقل بين الزوايا')
    : V.mode === 'flip' ? (en ? 'Click the photo to flip between before and after · ↑ ↓ to switch angles' : 'اضغط على الصورة للتبديل بين قبل وبعد · ↑ ↓ للتنقل بين الزوايا')
    : (en ? '↑ ↓ to switch angles' : '↑ ↓ للتنقل بين الزوايا');
}
function setZoom(on){
  V.zoom = on;
  vEl.canvas.classList.toggle('zoomed', on);
  vEl.zoom.style.setProperty('--z', on ? 2.6 : 1);
  $('#vdZoomBtn').setAttribute('aria-pressed', on);
}
function vPan(e){
  const c = vEl.canvas.getBoundingClientRect(), zw = vEl.zoom.offsetWidth, zh = vEl.zoom.offsetHeight;
  const lx = (c.width - zw) / 2, ly = (c.height - zh) / 2;
  const x = Math.max(0, Math.min(100, (e.clientX - c.left - lx) / zw * 100)), y = Math.max(0, Math.min(100, (e.clientY - c.top - ly) / zh * 100));
  vEl.zoom.style.setProperty('--zx', x + '%'); vEl.zoom.style.setProperty('--zy', y + '%');
}
function fillViewer(swap){
  const j = JOBS[V.job], pr = projOf(j.project), br = brandOf(pr.brand), angles = projJobs(j.project), k = angles.indexOf(j);
  const apply = () => {
    vEl.before.src = j.before; vEl.after.src = j.after;
    vEl.before.alt = `${t(j.title)} — ${t('قبل التنجيد')}`; vEl.after.alt = `${t(j.title)} — ${t('بعد التنجيد')}`;
    for(const im of [vEl.before, vEl.after]) im.style.objectPosition = j.focus || '50% 50%';
    vEl.frames.classList.remove('swap');
  };
  if(swap && !reduce){ vEl.frames.classList.add('swap'); setTimeout(apply, 220); } else apply();
  $('#vdBrand').textContent = br.name;
  $('#vdTitle').textContent = `${bc(br, pr)}${pr.year ? ' ' + ar(pr.year) : ''}`;
  $('#vdStory').textContent = pr.story || '';
  $('#vdAngles').hidden = angles.length < 2;
  $('#vdAcount').textContent = plural(angles.length);
  $('#athumbs').innerHTML = angles.map((a, n) => `<button class="ath" type="button" data-i="${JOBS.indexOf(a)}" aria-current="${a === j}" aria-label="${a.title}"><img src="${a.after}" alt=""><img class="tb" src="${a.before}" alt=""><i></i><span>${a.title}</span></button>`).join('');
  const c = j.color && colorOf(j.color);
  $('#vdPart').textContent = j.title;
  $('#vdNote').textContent = j.note || '';
  $('#vdRows').innerHTML = `<div class="row"><dt>الجزء</dt><dd>${partOf(j.part).name}</dd></div>` + (c ? `<div class="row"><dt>اللون</dt><dd><span class="dot" style="background:${c.hex}"></span>${c.name}</dd></div>` : '');
  $('#dTry').hidden = !(c && ICOL.some(x => x.id === j.color));
  $('#vdPrevA').hidden = $('#vdNextA').hidden = angles.length < 2;
  const pids = visibleProjects(), pk = pids.indexOf(j.project);
  $('#dCount').textContent = pk < 0 ? '' : (LANG === 'en' ? `${pk + 1} of ${pids.length}` : `${ar(pk + 1)} من ${ar(pids.length)}`);
  $('#dPrev').disabled = $('#dNext').disabled = pids.length < 2;
  $('.vd-side .pager').hidden = pids.length < 2;
  i18nApply($('#look'));
}
const pageMain = document.querySelector('main'), pageFoot = document.querySelector('footer');
function showPage(which){
  pageMain.hidden = which !== 'home';
  pageFoot.hidden = which === 'look';
  $('#look').hidden = which !== 'look';
  if(which !== 'look') setZoom(false);
  scrollTo(0, 0);
}
function openViewer(i){
  V.job = i; setMode('slide'); setZoom(false); fillViewer(false);
  showPage('look');
  vSweep(4, 56, 1100);
}
function stepAngle(d){
  const angles = projJobs(JOBS[V.job].project); if(angles.length < 2) return;
  const k = angles.indexOf(JOBS[V.job]);
  V.job = JOBS.indexOf(angles[(k + d + angles.length) % angles.length]);
  setZoom(false); fillViewer(true); vSweep(4, 56, 900);
}
function stepProject(d){
  const pids = visibleProjects(); if(pids.length < 2) return;
  const k = Math.max(0, pids.indexOf(JOBS[V.job].project)), np = pids[(k + d + pids.length) % pids.length];
  V.job = JOBS.indexOf(visible().find(j => j.project === np));
  setZoom(false); fillViewer(true); vSweep(4, 56, 900);
}
/* slider drag (slide mode) */
const vAt = x => { const r = vEl.frames.getBoundingClientRect(), s = (x - r.left) / r.width * 100; vSet(LANG === 'en' ? 100 - s : s); };
vEl.frames.addEventListener('pointerdown', e => {
  if(V.mode === 'flip'){ V.flip = V.flip === 'after' ? 'before' : 'after'; vEl.canvas.dataset.flip = V.flip; $('#vdState').textContent = t(V.flip === 'after' ? 'بعد' : 'قبل'); return; }
  if(V.mode !== 'slide') return;
  if(V.zoom && !e.target.closest('.vh')) return;
  V.drag = true; cancelAnimationFrame(V.raf); vEl.frames.setPointerCapture(e.pointerId); vAt(e.clientX);
});
vEl.frames.addEventListener('pointermove', e => { if(V.drag) vAt(e.clientX); });
['pointerup','pointercancel'].forEach(ev => vEl.frames.addEventListener(ev, () => V.drag = false));
vEl.handle.addEventListener('keydown', e => {
  let k = {ArrowLeft:-5, ArrowRight:5, Home:-100, End:100}[e.key]; if(k === undefined) return;
  if(LANG === 'en') k = -k;
  e.preventDefault(); e.stopPropagation(); cancelAnimationFrame(V.raf); vSet(V.pos + k);
});
/* zoom pan (hover on desktop, drag on touch) */
vEl.canvas.addEventListener('pointermove', e => { if(!V.zoom) return; if(e.pointerType === 'touch' && !e.buttons && e.pressure === 0) return; vEl.canvas.classList.add('moving'); vPan(e); });
vEl.canvas.addEventListener('pointerleave', () => vEl.canvas.classList.remove('moving'));
vEl.canvas.addEventListener('pointerdown', e => { if(V.zoom && !e.target.closest('.vh')) vPan(e); });
/* controls */
$('#vdModes').addEventListener('click', e => { const b = e.target.closest('button'); if(b) setMode(b.dataset.m); });
$('#vdZoomBtn').addEventListener('click', () => { setZoom(!V.zoom); if(V.zoom){ const r = vEl.canvas.getBoundingClientRect(); vPan({clientX:r.left + r.width/2, clientY:r.top + r.height/2}); } });
const holdOn = e => { e.preventDefault(); if(V.hold) return; V.hold = true; V.saved = V.pos; if(V.mode === 'flip'){ vEl.canvas.dataset.flip = 'before'; } else { cancelAnimationFrame(V.raf); vSweep(V.pos, 0, 260); } };
const holdOff = () => { if(!V.hold) return; V.hold = false; if(V.mode === 'flip'){ vEl.canvas.dataset.flip = V.flip; } else vSweep(V.pos, V.saved, 320); };
const hb = $('#vdHold'); hb.addEventListener('pointerdown', holdOn); ['pointerup','pointerleave','pointercancel','blur'].forEach(ev => hb.addEventListener(ev, holdOff));
hb.addEventListener('keydown', e => { if(e.key === ' ' || e.key === 'Enter') holdOn(e); }); hb.addEventListener('keyup', holdOff);
const fsb = $('#vdFs'); if(!document.fullscreenEnabled) fsb.hidden = true;
fsb.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : $('#vdStage').requestFullscreen().catch(() => {}); });
$('#athumbs').addEventListener('click', e => { const b = e.target.closest('.ath'); if(!b) return; V.job = +b.dataset.i; setZoom(false); fillViewer(true); vSweep(4, 56, 900); });
$('#vdPrevA').addEventListener('click', () => stepAngle(-1));
$('#vdNextA').addEventListener('click', () => stepAngle(1));
$('#dPrev').addEventListener('click', () => stepProject(-1));
$('#dNext').addEventListener('click', () => stepProject(1));
$('#dlgClose').addEventListener('click', () => showPage('home'));
addEventListener('keydown', e => {
  if(look.hidden) return;
  if(e.key === 'Escape'){ showPage('home'); return; }
  if(e.key === 'ArrowUp'){ e.preventDefault(); stepAngle(-1); }
  else if(e.key === 'ArrowDown'){ e.preventDefault(); stepAngle(1); }
  else if((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && V.mode === 'slide' && !e.target.closest('input,button')){ e.preventDefault(); cancelAnimationFrame(V.raf); vSet(V.pos + (e.key === 'ArrowRight' ? 4 : -4) * (LANG === 'en' ? -1 : 1)); }
});
document.querySelector('.nav').addEventListener('click', e => { if(e.target.closest('a') && (pageMain.hidden)) showPage('home'); });
document.querySelector('.foot-links').addEventListener('click', e => { if(e.target.closest('a') && pageMain.hidden) showPage('home'); });
$('#dTry').addEventListener('click', () => {
  const j = JOBS[V.job]; showPage('home'); if(ICOL.some(c => c.id === j.color)) choice.seats = j.color; studio.preset = -1; paintStudio(); goStep(0);
  $('#design').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
});

const choice = Object.fromEntries(STEPS.map(s => [s.id, s.def]));
const studio = {step:0, view:'A', preset:-1};
const optOf = (st, id) => PAL[st.pal].find(o => o.id === id) || PAL[st.pal][0];
const resolved = st => { const id = choice[st.id] === 'match' ? choice.seats : choice[st.id]; return optOf(st, id); };
function fx(hex){
  const c = rgbOf(hex), g = Math.min(255 / GM, 255 / Math.max(...c));
  const lum = .2126*c[0] + .7152*c[1] + .0722*c[2], out = (GM / 255) * g * lum;
  return {rgb:`rgb(${c.map(v => Math.min(255, Math.round(v * g))).join(',')})`, lift:(0.72 * Math.max(0, Math.min(.85, (lum - out) / (255 - out)))).toFixed(3)};
}

function buildStudio(){
  const parts = {A:['seats','heads','doors','arm','roof'], B:['wheel','thread','seatB']};
  $('#vframe').innerHTML = ['A','B'].map(v => `
    <div class="vw ${v === studio.view ? 'on' : ''}" data-v="${v}">
      <i class="vbase vb-${v}"></i>
      ${parts[v].map(p => `<i class="vt mk-${v}-${p}" data-p="${v}:${p}"></i><i class="vl mk-${v}-${p}" data-p="${v}:${p}"></i><i class="vf mk-${v}-${p}" data-p="${v}:${p}"></i>`).join('')}
      <i class="vsheen vb-${v} mk-${v}-all"></i>
      ${STEPS.filter(st => st.view === v).map(st => `<button class="hot" type="button" data-s="${st.id}" style="left:${st.hot[0]}%;top:${st.hot[1]}%" aria-label="${st.name}"><span class="hping" aria-hidden="true"></span><span class="hdot" aria-hidden="true"></span><span class="htag">${st.name}</span></button>`).join('')}
    </div>`).join('');
  $('#vtabs').innerHTML = [['A','المقصورة'],['B','المقود']].map(([v, n]) => `<button type="button" data-v="${v}" aria-pressed="${v === studio.view}">${n}</button>`).join('');
  $('#vpre').innerHTML = `<b>ابدأ بتصميم</b>` + PRESETS_I.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="false">${p.name}</button>`).join('');
  $('#vframe').addEventListener('click', e => { const h = e.target.closest('.hot'); if(h) goStep(STEPS.findIndex(s => s.id === h.dataset.s)); });
  $('#vtabs').addEventListener('click', e => { const b = e.target.closest('button'); if(b) showView(b.dataset.v); });
  $('#vpre').addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if(b) applyPreset(+b.dataset.i); });
  $('#sBack').addEventListener('click', () => goStep(studio.step - 1));
  $('#sNext').addEventListener('click', () => goStep(studio.step + 1));
  const fs = $('#fsBtn');
  if(!document.fullscreenEnabled) fs.hidden = true;
  fs.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : $('#viewer').requestFullscreen().catch(() => {}); });
  if(coarse) $('#viewer').classList.add('touch');
  paintStudio(); renderStep(false);
  i18nApply($('#vframe')); i18nApply($('#vtabs')); i18nApply($('#vpre'));
}
function showView(v){
  studio.view = v;
  $$('#vframe .vw').forEach(el => el.classList.toggle('on', el.dataset.v === v));
  $$('#vtabs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
}
function paintStudio(){
  STEPS.forEach(st => {
    const o = resolved(st), f = fx(o.hex);
    st.parts.forEach(p => $$(`[data-p="${p}"]`).forEach(el => {
      if(el.classList.contains('vt')) el.style.setProperty('--c', f.rgb);
      if(el.classList.contains('vl')) el.style.setProperty('--a', f.lift);
    }));
  });
  $$('#vpre button[data-i]').forEach((b, i) => b.setAttribute('aria-pressed', i === studio.preset));
}
function flash(st){ st.parts.forEach(p => $$(`.vf[data-p="${p}"]`).forEach(el => { el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); })); }
function goStep(i){
  i = Math.max(0, Math.min(SUMMARY, i)); studio.step = i;
  const st = STEPS[i];
  if(st && st.view !== studio.view) showView(st.view);
  renderStep(true);
  if(st) flash(st);
}
function priceOf(stepId, optId){ const p = PRICES[`${stepId}:${optId}`]; return p ? (LANG === 'en' ? `+${p.toLocaleString('en-US')} SAR` : `+${ar(p.toLocaleString('en-US'))} ${CURRENCY}`.replace(/,/g,'٬')) : ''; }
function renderStep(){
  const i = studio.step, st = STEPS[i], total = STEPS.length + 1;
  $$('.hot').forEach(h => h.setAttribute('aria-current', !!st && h.dataset.s === st.id));
  $('#sCount').innerHTML = `${LANG === 'en' ? 'Step' : 'الخطوة'} <b>${ar(i + 1)}</b> / ${ar(total)}`;
  $('#sBack').disabled = i === 0;
  $('#sNext').hidden = i === SUMMARY;
  $('#sNext').textContent = i === SUMMARY - 1 ? 'النتيجة ‹' : 'التالي ‹';
  $('#matchRow').hidden = true; $('#swGrid').hidden = true; $('#oDesc').hidden = false;
  if(i === SUMMARY){ showFinale(); return; }
  $('#studioSteps').hidden = false;
  $('#studioResult').hidden = true;
  const o = resolved(st);
  $('#sTitle').textContent = st.name;
  const isMatch = choice[st.id] === 'match';
  $('#oName').textContent = isMatch ? `${t('مطابق للمقاعد')} — ${t(o.name)}` : o.name;
  $('#oDesc').textContent = DESC[o.id] || '';
  const pr = priceOf(st.id, o.id); $('#oPrice').hidden = !pr; $('#oPrice').textContent = pr;
  if(st.match){
    const mr = $('#matchRow'); mr.hidden = false;
    mr.innerHTML = `<button class="matchbtn" type="button" aria-pressed="${isMatch}"><span class="box"></span>مطابق لون المقاعد</button>`;
    mr.firstChild.addEventListener('click', () => { choice[st.id] = isMatch ? choice.seats : 'match'; studio.preset = -1; paintStudio(); renderStep(); flash(st); });
  }
  i18nApply($('#vpanel'));
  const grid = $('#swGrid'); grid.hidden = false;
  grid.innerHTML = PAL[st.pal].map(c => `<button class="swb" type="button" role="radio" data-id="${c.id}" aria-checked="${!isMatch && c.id === o.id}" style="--c:${c.hex}"><span class="ball"></span>${c.name}</button>`).join('');
  $$('.swb', grid).forEach(b => b.addEventListener('click', () => {
    choice[st.id] = b.dataset.id; studio.preset = -1;
    if(st.id === 'seats') flashAll(); else flash(st);
    paintStudio(); renderStep();
  }));
  i18nApply($('#vpanel'));
}
function flashAll(){ STEPS.filter(s => s.match || s.id === 'seats').forEach(flash); }
function showFinale(){
  $('#studioSteps').hidden = true;
  $('#studioResult').hidden = false;
  $('#finaleList').innerHTML = STEPS.map(st => {
    const o = resolved(st), m = choice[st.id] === 'match';
    return `<article class="fcard"><span class="fswatch" style="background:${o.hex}"></span><span class="fcopy"><span>${st.name}</span><b>${o.name}</b></span>${m ? '<em>مطابق</em>' : ''}</article>`;
  }).join('');
  i18nApply($('#studioResult'));
}
function resetStudio(){
  STEPS.forEach(st => { choice[st.id] = st.def; });
  studio.preset = -1; studio.step = 0;
  $('#studioResult').hidden = true;
  $('#studioSteps').hidden = false;
  paintStudio(); renderStep();
}
$('#resultBack').addEventListener('click', () => goStep(SUMMARY - 1));
$('#redo').addEventListener('click', resetStudio);
function applyPreset(i){
  const p = PRESETS_I[i]; Object.assign(choice, p.c); studio.preset = i;
  paintStudio(); renderStep(); flashAll(); STEPS.forEach(flash);
}

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
