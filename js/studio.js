/* Cabin designer steps and results */
const choice = Object.fromEntries(STEPS.map(s => [s.id, s.def]));
const studio = {step:0, view:'A', preset:-1};
const picked = new Set();
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
  $('#vpanel').style.setProperty('--p', String((i + 1) / total));
  $$('.hot').forEach(h => h.setAttribute('aria-current', !!st && h.dataset.s === st.id));
  $('#sCount').innerHTML = `${LANG === 'en' ? 'Step' : 'الخطوة'} <b>${ar(i + 1)}</b> / ${ar(total)}`;
  $('#sBack').disabled = i === 0;
  $('#sNext').hidden = i === SUMMARY;
  $('#sNext').textContent = i === SUMMARY - 1 ? 'النتيجة ‹' : 'التالي ‹';
  $('#matchRow').hidden = true; $('#swGrid').hidden = true; $('#oDesc').hidden = false;
  $('#vpanel').classList.toggle('is-done', i === SUMMARY);
  renderBoard();
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
    mr.firstChild.addEventListener('click', () => { choice[st.id] = isMatch ? choice.seats : 'match'; picked.add(st.id); studio.preset = -1; paintStudio(); renderStep(); flash(st); });
  }
  i18nApply($('#vpanel'));
  const grid = $('#swGrid'); grid.hidden = false;
  grid.innerHTML = PAL[st.pal].map(c => `<button class="swb" type="button" role="radio" data-id="${c.id}" aria-checked="${!isMatch && c.id === o.id}" style="--c:${c.hex}"><span class="ball"></span>${c.name}</button>`).join('');
  $$('.swb', grid).forEach(b => b.addEventListener('click', () => {
    choice[st.id] = b.dataset.id; picked.add(st.id); studio.preset = -1;
    if(st.id === 'seats') flashAll(); else flash(st);
    paintStudio(); renderStep();
  }));
  i18nApply($('#vpanel'));
}
function renderBoard(){
  const board = $('#pickBoard');
  board.innerHTML = `<p class="pick-kicker">اختياراتك</p><p class="pick-note">اضغط أي جزء لتعديله</p><div class="pick-list">` + STEPS.map((st, i) => {
    const o = resolved(st), m = choice[st.id] === 'match';
    const set = picked.has(st.id) ? ' is-set' : '';
    return `<button type="button" class="pick${set}" data-i="${i}" ${i === studio.step ? 'aria-current="step"' : ''}><span class="pick-ico" aria-hidden="true"><img class="pick-glyph" src="${STEP_ICONS[st.id]}" alt="">${set ? '<i class="pick-ok"></i>' : ''}</span><span class="pick-copy"><span>${st.name}</span><span class="pick-val"><b>${o.name}</b>${m ? '<em>مطابق</em>' : ''}</span></span><span class="pick-sw" style="background:${o.hex}"></span></button>`;
  }).join('') + `</div>`;
  $$('.pick', board).forEach(b => b.addEventListener('click', () => goStep(+b.dataset.i)));
  i18nApply(board);
}
function flashAll(){ STEPS.filter(s => s.match || s.id === 'seats').forEach(flash); }
function showFinale(){
  $('#studioSteps').hidden = true;
  $('#studioResult').hidden = false;
  $('#finaleList').innerHTML = STEPS.map((st, i) => {
    const o = resolved(st), m = choice[st.id] === 'match';
    return `<button type="button" class="fcard" data-i="${i}"><span class="pick-ico" aria-hidden="true"><img class="pick-glyph" src="${STEP_ICONS[st.id]}" alt=""></span><span class="fswatch" style="background:${o.hex}"></span><span class="fcopy"><span>${st.name}</span><b>${o.name}</b></span>${m ? '<em>مطابق</em>' : ''}</button>`;
  }).join('');
  $$('#finaleList .fcard').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.i)));
  i18nApply($('#studioResult'));
}
function resetStudio(){
  STEPS.forEach(st => { choice[st.id] = st.def; });
  picked.clear();
  studio.preset = -1; studio.step = 0;
  $('#studioResult').hidden = true;
  $('#studioSteps').hidden = false;
  paintStudio(); renderStep();
}
$('#resultBack').addEventListener('click', () => goStep(SUMMARY - 1));
$('#redo').addEventListener('click', resetStudio);
function applyPreset(i){
  const p = PRESETS_I[i]; Object.assign(choice, p.c); studio.preset = i;
  STEPS.forEach(st => picked.add(st.id));
  paintStudio(); renderStep(); flashAll(); STEPS.forEach(flash);
}
