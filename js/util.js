/* Shared helpers, seat markup, and the compare slider */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(hover: none)').matches;
const ar = n => LANG === 'en' ? String(n) : Number(n).toLocaleString('ar-EG', {useGrouping:false});
const colorOf = id => COLORS.find(c => c.id === id) || CARD_COLORS.find(c => c.id === id);
const brandOf = id => BRANDS.find(b => b.id === id) || {id, name:id};
const brandMark = (b, cls) => b.mono
  ? `<span class="${cls} mono${b.mark ? ' ' + b.mark : ''}" style="--ar:${b.ar};--ink:${b.ink || 'currentColor'};-webkit-mask:url('${b.logo}') center/contain no-repeat;mask:url('${b.logo}') center/contain no-repeat"></span>`
  : `<img class="${cls}${b.mark ? ' ' + b.mark : ''}" src="${b.logo}" alt="">`;
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
const footLogo = $('.foot-logo');
if(footLogo){
  const d = $('.brand .lg-d').cloneNode(), l = $('.brand .lg-l').cloneNode();
  d.className = 'foot-logo lg-d'; l.className = 'foot-logo lg-l';
  footLogo.replaceWith(d, l);
}

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

