/* Hero seat: colors, patterns, and autoplay */
/* =====================================================================
   HERO — one seat, colors change by themselves, buttons take control
   ===================================================================== */
const HERO_MS = 3600;
const hero = {i:5, pattern:0, custom:null, preview:null, hold:false, playing:!reduce, timer:0, visible:true};
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
function heroShown(){
  if(hero.preview) return {c:COLORS[hero.preview.i], pattern:hero.preview.pattern};
  return {c:heroColor(), pattern:hero.pattern};
}
function heroPaint(pulse){
  const {c, pattern} = heroShown(), seat = $('#hSeat'), pick = $('#hCustom').closest('.hcustom');
  applySeat(seat, {pattern, body:c.hex, insert:c.hex, finish:'smooth'});
  $('#hero').dataset.pat = pattern;
  $('#hero').style.setProperty('--hc', c.hex);
  const name = t(c.name), pat = LANG === 'en' ? `· ${t(PATTERNS[pattern].name)} pattern` : `· نقشة ${PATTERNS[pattern].name}`;
  const nameEl = $('#hName'), patEl = $('#hPatName'), pname = nameEl.parentElement;
  if(hero.painted && (nameEl.textContent !== name || patEl.textContent !== pat)){
    pname.classList.remove('flip'); void pname.offsetWidth; pname.classList.add('flip');
  }
  hero.painted = true;
  nameEl.textContent = name; $('#hDot').style.background = c.hex;
  patEl.textContent = pat;
  $$('#hSws .hsw').forEach((b, k) => {
    b.setAttribute('aria-checked', !hero.custom && k === hero.i);
    b.classList.toggle('peek', !!(hero.preview && hero.preview.i === k && !( !hero.custom && k === hero.i)));
  });
  pick.setAttribute('aria-checked', hero.custom && !hero.preview ? 'true' : 'false');
  if(hero.custom) pick.style.setProperty('--pick', hero.custom);
  $$('#hPats button').forEach((b, k) => {
    b.setAttribute('aria-pressed', k === hero.pattern);
    b.classList.toggle('peek', !!(hero.preview && hero.preview.pattern === k && k !== hero.pattern));
  });
  if(pulse && !reduce){ seat.classList.remove('pulse'); void seat.offsetWidth; seat.classList.add('pulse'); }
  i18nApply($('#heroSeat'));
}
function heroSchedule(){
  clearTimeout(hero.timer);
  if(!hero.playing || hero.hold) return;
  heroPlay.classList.remove('playing'); void heroPlay.offsetWidth; heroPlay.classList.add('playing');
  hero.timer = setTimeout(() => {
    if(document.hidden || !hero.visible || hero.hold){ heroSchedule(); return; }
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
$('#hSws').addEventListener('click', e => { const b = e.target.closest('.hsw'); if(!b) return; hero.custom = null; hero.preview = null; hero.i = +b.dataset.i; heroPaint(true); heroSchedule(); });
$('#hCustom').addEventListener('input', e => { hero.custom = e.target.value; hero.preview = null; heroPaint(true); heroSchedule(); });
$('#hPats').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; hero.preview = null; hero.pattern = +b.dataset.p; heroPaint(true); heroSchedule(); });
const heroPlay = document.querySelector('.hero-play');
const heroSeat = $('#heroSeat');
heroPlay.style.setProperty('--cycle', HERO_MS + 'ms');
function heroPeek(el){
  const sw = el && el.closest && el.closest('#hSws .hsw');
  const pat = el && el.closest && el.closest('#hPats button');
  if(!sw && !pat) return;
  const cur = hero.preview || {i:hero.i, pattern:hero.pattern};
  hero.preview = {i: sw ? +sw.dataset.i : cur.i, pattern: pat ? +pat.dataset.p : cur.pattern};
  heroPaint(false);
}
function heroRelease(next){
  if(next && heroPlay.contains(next)) return;
  hero.hold = false; hero.preview = null;
  heroPlay.classList.remove('live'); heroSeat.classList.remove('live');
  heroPaint(false); heroSchedule();
}
function heroHold(){
  hero.hold = true; clearTimeout(hero.timer);
  heroPlay.classList.add('live'); heroSeat.classList.add('live');
}
if(!coarse){
  heroPlay.addEventListener('pointerenter', heroHold);
  heroPlay.addEventListener('pointerover', e => heroPeek(e.target));
  heroPlay.addEventListener('pointermove', e => {
    const r = heroPlay.getBoundingClientRect();
    heroPlay.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    heroPlay.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });
  heroPlay.addEventListener('pointerleave', () => heroRelease(null));
}
heroPlay.addEventListener('focusin', e => { heroHold(); heroPeek(e.target); });
heroPlay.addEventListener('focusout', e => heroRelease(e.relatedTarget));
new IntersectionObserver(es => es.forEach(en => hero.visible = en.isIntersecting), {threshold:.2}).observe($('#hero'));
heroPaint(false); heroSchedule();
setTimeout(() => $('#mk1').classList.add('in'), 150);
