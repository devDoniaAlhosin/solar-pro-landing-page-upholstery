/* Full-screen before and after viewer */
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
