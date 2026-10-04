/* Gallery filters and before/after cards */
/* =====================================================================
   FILTER STATE (works grid)
   ===================================================================== */
const state = {brand:BRANDS.find(b => JOBS.some(j => projOf(j.project).brand === b.id))?.id || BRANDS[0].id, part:'all'};
const brandJobs = id => JOBS.filter(j => projOf(j.project).brand === id);
const visible = () => brandJobs(state.brand).filter(j => state.part === 'all' || j.part === state.part);
const visibleProjects = () => [...new Set(visible().map(j => j.project))];

/* =====================================================================
   WORKS — brands → projects → angles, arrows compare, full viewer
   ===================================================================== */
function drawFilters(){
  const brands = BRANDS.filter(b => brandJobs(b.id).length);
  if(!brands.some(b => b.id === state.brand)) state.brand = brands[0]?.id;
  const pool = brandJobs(state.brand);
  if(state.part !== 'all' && !pool.some(j => j.part === state.part)) state.part = 'all';
  const parts = PARTS.filter(p => pool.some(j => j.part === p.id));
  const cats = brands.map(b => {
    const cars = PROJECTS.filter(p => p.brand === b.id && JOBS.some(j => j.project === p.id)).map(p => p.car).join(' · ');
    return `<button class="chip brand" type="button" data-k="brand" data-t="${b.id}" aria-pressed="${state.brand === b.id}" aria-label="${b.name}">
      ${brandMark(b, 'blogo')}<span class="bname"><b>${b.name}</b><small>${cars}</small></span><em>${ar(brandJobs(b.id).length)}</em>
    </button>`;
  }).join('');
  const angles = [{id:'all', name:'الكل'}, ...parts].map(item => {
    const n = item.id === 'all' ? pool.length : pool.filter(j => j.part === item.id).length;
    return `<button class="chip" type="button" data-k="part" data-t="${item.id}" aria-pressed="${state.part === item.id}" aria-label="${item.name}"><span>${item.name}</span><small>${ar(n)}</small></button>`;
  }).join('');
  $('#filters').innerHTML = `
    <div class="fgroup cats"><b>الماركة</b><div class="chips" role="group" aria-label="الماركة">${cats}</div></div>
    <div class="fgroup"><b>الزاوية</b><div class="chips" role="group" aria-label="الزاوية">${angles}</div></div>`;
  $('#filterOpen').classList.toggle('hot', state.part !== 'all');
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

const imgT = (src, alt, focus) => src ? `<img class="photo" src="${src}" alt="${alt}" draggable="false" decoding="async" style="object-position:${focus || '50% 50%'}">` : '';
function drawGallery(){
  const jobs = visible(), pids = visibleProjects();
  if(!pids.length){ $('#gallery').innerHTML = '<p class="empty">لا توجد أعمال بهذا التصنيف حاليًا.</p>'; i18nApply($('#gallery')); return; }
  let gi = 0;
  $('#gallery').innerHTML = pids.map(pid => {
    const pr = projOf(pid), br = brandOf(pr.brand), list = jobs.filter(j => j.project === pid), total = JOBS.filter(j => j.project === pid).length;
    const tiles = list.map(j => {
      const i = JOBS.indexOf(j), c = j.color && colorOf(j.color);
      return `<article class="tile" data-i="${i}" tabindex="0" aria-label="${bc(br, pr)} — ${t(j.title)}${LANG === 'en' ? ', ' : '، '}${t('عرض قبل وبعد')}">
        <span class="mini">
          <span class="pane before">${imgT(j.before, `${t(j.title)} — ${t('قبل التنجيد')}`, j.focus)}</span>
          <span class="pane after">${imgT(j.after, `${t(j.title)} — ${t('بعد التنجيد')}`, j.focus)}</span>
          <span class="div">
            <span class="cnub" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="اسحب للمقارنة بين قبل وبعد">
              <span class="carrow" aria-hidden="true">${icon('i-next')}</span>
              <span class="carrow" aria-hidden="true">${icon('i-prev')}</span>
            </span>
          </span>
          <span class="mlb b">قبل</span><span class="mlb a">بعد</span>
          <span class="kind">${partOf(j.part).name}</span>
        </span>
        <span class="meta"><span class="nm"><b>${j.title}</b><small>${bc(br, pr)}</small></span>${c ? `<span class="dot" style="background:${c.hex}" title="${c.name}"></span>` : ''}</span>
      </article>`;
    }).join('');
    const first = JOBS.indexOf(list[0]);
    return `<section class="pgroup rv" aria-label="${bc(br, pr)}">
      <header class="phead">
        <div><h3>${br.logo ? brandMark(br, 'pbrand') : `<span class="bmark">${br.name.trim().charAt(0)}</span>`}<span><b>${t(br.name)}</b> ${t(pr.car)}${pr.year ? ' ' + ar(pr.year) : ''}</span></h3></div>
        <div class="pm"><span>${plural(total)}</span><button class="btn ghost small" type="button" data-open="${first}">افتح المشروع</button></div>
      </header>
      <div class="bento rail">${tiles}</div>
      <div class="cdots" role="group" aria-label="التنقل بين الزوايا"></div>
    </section>`;
  }).join('');
  $$('#gallery .tile').forEach(t => {
    const mini = $('.mini', t), nub = $('.cnub', mini);
    const open = () => openViewer(+t.dataset.i);
    const setPos = p => {
      const n = Math.max(0, Math.min(100, p));
      mini.style.setProperty('--pos', n + '%');
      nub.setAttribute('aria-valuenow', Math.round(n));
    };
    const fromX = x => {
      const r = mini.getBoundingClientRect();
      if(!r.width) return 50;
      let p = (x - r.left) / r.width * 100;
      if(document.documentElement.dir === 'ltr') p = 100 - p;
      return p;
    };
    nub.addEventListener('pointerdown', e => {
      e.stopPropagation();
      e.preventDefault();
      mini.classList.add('live');
      nub.classList.add('drag');
      nub.setPointerCapture(e.pointerId);
      setPos(fromX(e.clientX));
    });
    nub.addEventListener('pointermove', e => { if(nub.classList.contains('drag')) setPos(fromX(e.clientX)); });
    const endDrag = () => { nub.classList.remove('drag'); mini.classList.remove('live'); };
    nub.addEventListener('pointerup', endDrag);
    nub.addEventListener('pointercancel', endDrag);
    nub.addEventListener('keydown', e => {
      const keys = {ArrowLeft:-5, ArrowRight:5, Home:0, End:100};
      if(!(e.key in keys)) return;
      e.preventDefault();
      e.stopPropagation();
      const ltr = document.documentElement.dir === 'ltr';
      if(e.key === 'Home') setPos(ltr ? 100 : 0);
      else if(e.key === 'End') setPos(ltr ? 0 : 100);
      else {
        const cur = parseFloat(getComputedStyle(mini).getPropertyValue('--pos')) || 50;
        setPos(cur + keys[e.key] * (ltr ? -1 : 1));
      }
    });
    t.addEventListener('click', e => { if(e.target.closest('.cnub')) return; open(); });
    t.addEventListener('keydown', e => {
      if(e.target.closest('.cnub')) return;
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); }
    });
  });
  $$('#gallery [data-open]').forEach(b => b.addEventListener('click', () => openViewer(+b.dataset.open)));
  $$('#gallery .pgroup').forEach(group => {
    const rail = $('.bento.rail', group), tiles = $$('.tile', rail), nav = $('.cdots', group);
    if(!nav || tiles.length < 2){ if(nav) nav.hidden = true; return; }
    const stops = () => {
      const gap = parseFloat(getComputedStyle(rail).gap) || 0;
      const step = tiles[0].offsetWidth + gap;
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const count = Math.max(1, Math.round(max / step) + 1);
      return Array.from({length:count}, (_, i) => i === count - 1 ? max : Math.min(max, i * step));
    };
    const mark = () => {
      const list = stops(), pos = Math.abs(rail.scrollLeft);
      let best = 0, bestDist = Infinity;
      list.forEach((s, i) => { const dist = Math.abs(s - pos); if(dist < bestDist){ bestDist = dist; best = i; } });
      $$('.cdot', nav).forEach((d, n) => { if(n === best) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    };
    const paint = () => {
      const list = stops();
      nav.hidden = list.length < 2;
      nav.innerHTML = list.map((_, n) => `<button class="cdot" type="button" aria-label="${n + 1}"${n ? '' : ' aria-current="true"'}></button>`).join('');
      $$('.cdot', nav).forEach((d, n) => d.addEventListener('click', () => {
        const sign = document.documentElement.dir === 'ltr' ? 1 : -1;
        rail.scrollTo({left:sign * stops()[n], behavior:reduce ? 'auto' : 'smooth'});
      }));
      mark();
    };
    paint();
    group._paintDots = paint;
    let frame = 0;
    rail.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(mark); }, {passive:true});
  });
  if(!drawGallery._resize){
    drawGallery._resize = () => $$('#gallery .pgroup').forEach(g => g._paintDots && g._paintDots());
    addEventListener('resize', drawGallery._resize);
  }
  i18nApply($('#gallery'));
  observeRv();
}
