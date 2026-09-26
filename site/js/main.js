// UI wiring: settings, controls, playhead drawing, saved setups and keyboard shortcuts.
import { PATTERNS, SPANS } from "./patterns.js";
import { METERS, SUBS, SPAN_TO_METER } from "./meters.js";
import { gridInfo, defaultMet, curSpan, curHits, curMet, metKey, gapBarsPerUnit, rowLength } from "./grid.js";
import { store, KEYS } from "./storage.js";
import { SOUNDS, ctx, unlockAudio, pauseKeepAlive, resumeAudio, setMasterVolume, voice } from "./audio.js";
import * as scheduler from "./scheduler.js";

const $ = id => document.getElementById(id);

/* ---------- State ---------- */
const DEFAULT = {
  bpm:80, beats:2, accents:[3,2], sub:2, unit:"half note", per:2,
  sound:"wood", downSound:"click", patSound:"clave",
  met:null, freeMet:null, metOn:true, patOn:true,
  vol:{master:80, beat:85, pat:80},
  pattern:"tresdos", hits:null, span:"2bar",
  tr:{on:false, step:2, every:4, target:140}, gap:{on:false, play:2, mute:2, what:"pattern"}, countIn:false,
};
const S = Object.assign(structuredClone(DEFAULT), store.get(KEYS.state, {}));
S.vol = Object.assign({}, DEFAULT.vol, S.vol); S.tr = Object.assign({}, DEFAULT.tr, S.tr); S.gap = Object.assign({}, DEFAULT.gap, S.gap);
if(!PATTERNS[S.pattern]){ S.pattern = "none"; S.hits = null; }
const save = () => store.set(KEYS.state, S);

/* ---------- Transport ---------- */
let wake = null;
async function start(){
  if(scheduler.isRunning()) return;
  // Unlock audio right here in the tap, with no await first (iPhone rule). The clock can start while the
  // audio finishes waking up: audio time stands still until it runs, so no beat is lost or bunched.
  unlockAudio(S.vol.master);
  scheduler.start(S, setBpm);
  $("play").textContent = "Stop"; $("play").classList.add("on");
  requestAnimationFrame(draw);
  keepAwake();
}
// Keep the screen on while playing. Only works over HTTPS or on localhost, and the phone may refuse
// (low battery mode, for example), so a refusal is simply ignored.
async function keepAwake(){
  if(wake || !navigator.wakeLock) return;
  try{
    const lock = await navigator.wakeLock.request("screen");
    if(scheduler.isRunning()){ wake = lock; lock.addEventListener("release", () => { if(wake === lock) wake = null; }); }
    else lock.release().catch(() => {});   // Stop was tapped while the request was pending
  }catch(e){}
}
function stop(){
  scheduler.stop();
  pauseKeepAlive();
  $("play").textContent = "Start"; $("play").classList.remove("on");
  document.querySelectorAll(".cell.now").forEach(e => e.classList.remove("now"));
  $("stateOut").innerHTML = '<span class="pill">Stopped</span>';
  $("patLane").classList.remove("silent");
  wake?.release().catch(() => {}); wake = null;
}
const toggle = () => scheduler.isRunning() ? stop() : start();
$("play").onclick = toggle;
// Coming back to the page: iPhone suspends audio for calls, Siri and app switches, so wake it up again.
// The browser also drops the screen wake lock whenever the page is hidden, so ask for it again.
document.addEventListener("visibilitychange", () => {
  if(document.visibilityState !== "visible") return;
  resumeAudio();
  if(scheduler.isRunning()) keepAwake();
});

/* ---------- Visuals ---------- */
function draw(){
  if(!scheduler.isRunning()) return;
  const now = ctx.currentTime;
  scheduler.drain(now, ev => {
    if(ev.kind === "b"){
      $("barOut").textContent = ev.counting ? "count-in" : (ev.bar + 1);
      $("stateOut").innerHTML = ev.counting ? '<span class="pill silent">Count-in</span>' : ev.gapSilent ? `<span class="pill silent">${ev.gapLabel}</span>` : ev.gapLabel ? `<span class="pill live">${ev.gapLabel}</span>` : '<span class="pill live">Playing</span>';
      $("patLane").classList.toggle("silent", !!ev.mutePat);
    } else {
      document.querySelectorAll(".cell.now").forEach(e => e.classList.remove("now"));
      const c = $("cells").children[ev.step]; if(c) c.classList.add("now");
      const m = $("metCells").children[ev.step]; if(m) m.classList.add("now");
    }
  });
  const el = Math.max(0, now - scheduler.startTime());
  $("timeOut").textContent = Math.floor(el/60) + ":" + String(Math.floor(el%60)).padStart(2,"0");
  requestAnimationFrame(draw);
}

/* ---------- UI builders ---------- */
function unitLabel(){ const sp = curSpan(S); return "per " + (sp ? sp.unit : (S.unit || "quarter note")); }
function setBpm(v){
  v = Math.round(Math.min(300, Math.max(20, v)));
  S.bpm = v;
  $("bpmOut").textContent = v; $("bpm").value = v;
  if(document.activeElement !== $("bpmNum")) $("bpmNum").value = v;
  $("marking").textContent = unitLabel();
  renderTrainer();
  save();
}
function renderTrainer(){
  $("trainerOut").innerHTML = S.tr.on ? (S.bpm === S.tr.target ? `Trainer <b>at target</b>` : `Trainer → <b>${S.tr.target}</b>`) : "";
}
// Highlight the free-mode meter chip that matches the settings, then redraw the grid.
function renderMeter(){
  document.querySelectorAll("#meters .chip").forEach(c => {
    const m = METERS[+c.dataset.i];
    c.classList.toggle("on", m.beats === S.beats && m.acc.join() === S.accents.join() && m.unit === S.unit);
  });
  renderPattern();
}
function setBeats(n, acc){
  S.beats = n; S.accents = acc.slice(); S.freeMet = null;
  scheduler.clampBeat(n);
  renderMeter(); save();
}
function chips(boxId, items, getOn, onPick){
  const box = $(boxId);
  box.querySelectorAll(".chip").forEach(c => c.remove());
  items.forEach((it, i) => {
    const c = document.createElement("button"); c.className = "chip"; c.textContent = it.label; c.dataset.i = i;
    c.onclick = () => { onPick(it, i); };
    box.appendChild(c);
  });
  const refresh = () => box.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", getOn(items[+c.dataset.i])));
  refresh(); return refresh;
}
function applyMeter(m, withSub){ S.unit = m.unit; S.per = m.per; if(withSub){ S.sub = m.sub; refreshSubs(); } setBeats(m.beats, m.acc); }
chips("meters", METERS, () => false, m => applyMeter(m, true));
const refreshSubs = chips("subs", SUBS, it => it.n === S.sub, it => { S.sub = it.n; S.freeMet = null; refreshSubs(); renderPattern(); save(); });
const refreshSounds = chips("sounds", SOUNDS, it => it.id === S.sound, it => { S.sound = it.id; refreshSounds(); save(); preview(it.id); });
const refreshDownSounds = chips("downSounds", SOUNDS, it => it.id === S.downSound, it => { S.downSound = it.id; refreshDownSounds(); save(); preview(it.id); });
const refreshPatSounds = chips("patSounds", SOUNDS, it => it.id === S.patSound, it => { S.patSound = it.id; refreshPatSounds(); save(); preview(it.id); });
function preview(kind){ if(scheduler.isRunning()) return; unlockAudio(S.vol.master); voice(kind, ctx.currentTime + 0.02, (S.vol.beat/100)**2, "accent"); }

/* Pattern UI */
const patSel = $("pattern");
Object.entries(PATTERNS).forEach(([id, p]) => { const o = document.createElement("option"); o.value = id; o.textContent = p.name; patSel.appendChild(o); });
function renderSpanOptions(){
  const p = PATTERNS[S.pattern]; const sel = $("span"); sel.innerHTML = "";
  sel.disabled = !p.steps;
  if(!p.steps){ const o = document.createElement("option"); o.textContent = "—"; sel.appendChild(o); return; }
  SPANS[p.steps].forEach(s => { const o = document.createElement("option"); o.value = s.id; o.textContent = s.label; sel.appendChild(o); });
  if(!SPANS[p.steps].some(s => s.id === S.span)) S.span = SPANS[p.steps][0].id;
  sel.value = S.span;
}
function applySpanMeter(){
  const sp = curSpan(S); if(!sp) return;
  setBeats(sp.beats, sp.accents);
  S.sub = sp.sub; refreshSubs();
}
function renderPattern(){
  const p = PATTERNS[S.pattern], g = gridInfo(S), met = curMet(S);
  patSel.value = S.pattern;
  $("marking").textContent = unitLabel();
  const bpc = gapBarsPerUnit(g);
  document.querySelectorAll(".gapUnit").forEach(e => e.textContent = g.pattern ? "cycles" : "bars");
  $("gapHint").textContent = g.pattern ? `One cycle = ${bpc} bar${bpc > 1 ? "s" : ""} of ${p.name}.` : "With no pattern selected, silence applies to the clicks.";
  $("gapWhat").disabled = !g.pattern;
  $("gridNote").hidden = !g.pattern;
  $("meterSum").hidden = !g.pattern;
  $("freeMeter").hidden = g.pattern;
  $("patLane").hidden = !g.pattern;
  $("patHint").hidden = !g.pattern;
  let sep, group;
  if(g.pattern){
    const sp = curSpan(S);
    $("sigOut").textContent = sp.sig; $("sigNote").textContent = sp.note; $("sigSub").textContent = sp.sub2;
    $("patLaneName").textContent = p.name + (S.hits ? " (edited)" : "");
    $("patInfo").textContent = `${g.steps} steps · ${sp.label.split(" (")[0]}`;
    group = g.steps === 16 ? 4 : 3;
    sep = (c, i) => { if(i > 0 && i % (g.steps/2) === 0) c.classList.add("half"); else if(i > 0 && i % group === 0) c.classList.add("gs"); };
  } else {
    const subName = S.sub > 1 ? " · " + SUBS.find(x => x.n === S.sub).label.toLowerCase() : "";
    $("patInfo").textContent = `1 bar · ${S.beats} beat${S.beats === 1 ? "" : "s"}${subName}`;
    group = g.spb;
    sep = (c, i) => { if(g.spb > 1 && i > 0 && i % g.spb === 0) c.classList.add("half"); else if(g.spb === 1 && i > 0) c.classList.add("gs"); };
  }
  // On narrow screens the grid wraps onto more rows (see rowLength). A row's first cell needs no divider.
  const perRow = rowLength(g.steps, group, cellsAcross());
  const divide = (c, i) => { if(i % perRow) sep(c, i); };
  const cols = `repeat(${perRow}, minmax(0,1fr))`;
  // Metronome row
  $("metLane").classList.toggle("off", !S.metOn);
  $("metToggle").classList.toggle("on", S.metOn); $("metToggle").setAttribute("aria-pressed", S.metOn);
  $("patLane").classList.toggle("off", !S.patOn);
  $("patToggle").classList.toggle("on", S.patOn); $("patToggle").setAttribute("aria-pressed", S.patOn);
  const mbox = $("metCells"); mbox.innerHTML = "";
  mbox.style.gridTemplateColumns = cols;
  for(let i=0;i<g.steps;i++){
    const c = document.createElement("button");
    c.className = "cell" + (met[i] ? " m" + met[i] : ""); divide(c, i);
    c.setAttribute("aria-label", `Metronome step ${i+1}, ${["off","click","downbeat click"][met[i]]}`);
    c.onclick = () => { const m = curMet(S).slice(); m[i] = (m[i] + 1) % 3; S[metKey(S)] = m; renderPattern(); save(); };
    mbox.appendChild(c);
  }
  // Pattern row
  const box = $("cells"); box.innerHTML = "";
  if(!g.pattern) return;
  const hits = curHits(S);
  box.style.gridTemplateColumns = cols;
  for(let i=0;i<g.steps;i++){
    const c = document.createElement("button");
    c.className = "cell" + (hits.includes(i) ? " hit" : ""); divide(c, i);
    c.setAttribute("aria-label", `Step ${i+1}${hits.includes(i) ? ", stroke" : ""}`);
    c.onclick = () => {
      const h = curHits(S).slice(); const at = h.indexOf(i);
      at >= 0 ? h.splice(at,1) : h.push(i); h.sort((a,b)=>a-b);
      S.hits = h.join() === PATTERNS[S.pattern].hits.join() ? null : h;
      renderPattern(); save();
    };
    box.appendChild(c);
  }
}
// How many grid cells fit across. On a touch screen each cell's tap area (the cell plus the 6px gap)
// must be at least 40px wide; with a mouse, 24px is enough.
const coarse = matchMedia("(pointer: coarse)");
function cellsAcross(){
  return Math.max(1, Math.floor(($("metCells").clientWidth + 6) / (coarse.matches ? 40 : 24)));
}
// Re-wrap the grid when the width changes (rotating the phone, resizing the window).
let across = 0;
new ResizeObserver(() => { const n = cellsAcross(); if(n !== across){ across = n; renderPattern(); } }).observe($("metCells"));

patSel.onchange = () => { const prev = curSpan(S); S.pattern = patSel.value;
  if(!curSpan(S)) applyMeter(METERS.find(m => m.id === (prev ? SPAN_TO_METER[prev.id] : "44in2")), true);
  S.hits = null; S.met = null; renderSpanOptions(); applySpanMeter(); renderPattern(); save(); };
$("span").onchange = e => { S.span = e.target.value; S.met = null; applySpanMeter(); renderPattern(); save(); };
$("metToggle").onclick = () => { S.metOn = !S.metOn; renderPattern(); save(); };
$("patToggle").onclick = () => { S.patOn = !S.patOn; renderPattern(); save(); };
document.querySelectorAll("[data-met]").forEach(b => b.onclick = () => { S[metKey(S)] = defaultMet(b.dataset.met, gridInfo(S)); renderPattern(); save(); });

/* Tempo controls */
$("bpm").oninput = e => setBpm(+e.target.value);
$("bpmNum").onchange = e => setBpm(+e.target.value || S.bpm);
$("minus").onclick = () => setBpm(S.bpm - 1);
$("plus").onclick = () => setBpm(S.bpm + 1);
let taps = [];
function tap(){
  const now = performance.now();
  if(taps.length && now - taps[taps.length-1] > 2000) taps = [];
  taps.push(now); if(taps.length > 7) taps.shift();
  if(taps.length >= 2){
    const iv = []; for(let i=1;i<taps.length;i++) iv.push(taps[i]-taps[i-1]);
    setBpm(60000 / (iv.reduce((a,b)=>a+b,0)/iv.length));
  }
  const b = $("tap"); b.classList.add("hit"); setTimeout(() => b.classList.remove("hit"), 90);
}
$("tap").onclick = tap;

/* Mix */
[["vMaster","master"],["vBeat","beat"],["vPat","pat"]].forEach(([id,k]) => {
  const el = $(id); el.value = S.vol[k]; $(id+"Out").textContent = S.vol[k];
  el.oninput = () => { S.vol[k] = +el.value; $(id+"Out").textContent = el.value; if(k === "master") setMasterVolume(S.vol.master); save(); };
});

/* Practice */
function bindNum(id, obj, key, min, max){
  const el = $(id); el.value = obj[key];
  el.onchange = () => { let v = Math.round(+el.value); if(isNaN(v)) v = obj[key]; v = Math.min(max, Math.max(min, v)); obj[key] = v; el.value = v; renderTrainer(); save(); };
}
bindNum("trStep", S.tr, "step", -20, 20); bindNum("trEvery", S.tr, "every", 1, 64); bindNum("trTarget", S.tr, "target", 20, 300);
bindNum("gapPlay", S.gap, "play", 1, 32); bindNum("gapMute", S.gap, "mute", 1, 32);
$("trOn").checked = S.tr.on; $("trOn").onchange = e => { S.tr.on = e.target.checked; renderTrainer(); save(); };
$("gapWhat").value = S.gap.what || "pattern"; $("gapWhat").onchange = e => { S.gap.what = e.target.value; save(); };
$("gapOn").checked = S.gap.on; $("gapOn").onchange = e => { S.gap.on = e.target.checked; save(); };
$("countIn").checked = S.countIn; $("countIn").onchange = e => { S.countIn = e.target.checked; save(); };

/* Presets */
const EXAMPLES = [
  {name:"Salsa · Clave Tres Dos", ex:true, s:{bpm:90, beats:2, accents:[3,2], sub:2, sound:"cowbell", patSound:"clave", pattern:"tresdos", hits:null, span:"2bar"}},
  {name:"Yambú · Clave de Yambú Matancera", ex:true, s:{bpm:44, beats:2, accents:[3,2], sub:2, sound:"wood", patSound:"clave", pattern:"yambu", hits:null, span:"2bar"}},
  {name:"Abakuá · Campana de Abakuá", ex:true, s:{bpm:100, beats:2, accents:[3,2], sub:3, sound:"wood", patSound:"cowbell", pattern:"abakua", hits:null, span:"dq"}},
];
let presets = (store.get(KEYS.presets, null) || EXAMPLES.slice()).filter(p => PATTERNS[p.s.pattern]);
function renderPresets(){
  const box = $("presetList"); box.innerHTML = "";
  if(!presets.length){ box.innerHTML = '<p class="empty">No saved setups yet.</p>'; return; }
  presets.forEach((p, i) => {
    const d = document.createElement("div"); d.className = "preset";
    const pat = PATTERNS[p.s.pattern]?.steps ? " · " + PATTERNS[p.s.pattern].name : "";
    const info = document.createElement("div"), title = document.createElement("div"), meta = document.createElement("div");
    title.textContent = p.name;
    if(p.ex){ const tag = document.createElement("span"); tag.className = "hint"; tag.textContent = "example"; title.append(" ", tag); }
    meta.className = "meta"; meta.textContent = `${p.s.bpm} BPM · ${p.s.beats} beats${pat}`;
    info.append(title, meta);
    const btns = document.createElement("div");
    const load = document.createElement("button"); load.textContent = "Load"; load.onclick = () => loadPreset(p.s);
    const del = document.createElement("button"); del.textContent = "Delete"; del.onclick = () => { presets.splice(i,1); store.set(KEYS.presets, presets); renderPresets(); };
    btns.append(load, del); d.append(info, btns); box.appendChild(d);
  });
}
function loadPreset(s){
  Object.assign(S, {met:null, freeMet:null, metOn:true, patOn:true, downSound:"click"}, structuredClone(s));
  const sp = curSpan(S); if(sp){ S.beats = sp.beats; S.accents = sp.accents.slice(); }
  S.accents = S.accents.slice(0, S.beats);
  renderAll(); save();
}
$("savePreset").onclick = () => {
  const name = $("presetName").value.trim() || `${S.bpm} BPM · ${S.beats} beats`;
  const {bpm,beats,accents,sub,unit,per,sound,downSound,patSound,pattern,hits,span,met,freeMet,metOn,patOn} = S;
  presets.unshift({name, s:structuredClone({bpm,beats,accents,sub,unit,per,sound,downSound,patSound,pattern,hits,span,met,freeMet,metOn,patOn})});
  store.set(KEYS.presets, presets); $("presetName").value = ""; renderPresets();
};
$("presetName").onkeydown = e => { if(e.key === "Enter") $("savePreset").click(); };

/* Keyboard */
document.addEventListener("keydown", e => {
  const tag = e.target.tagName;
  if(tag === "INPUT" && e.target.type !== "range" && e.target.type !== "checkbox") return;
  if(tag === "SELECT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
  if(e.code === "Space"){ e.preventDefault(); toggle(); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); setBpm(S.bpm + (e.shiftKey ? 5 : 1)); }
  else if(e.key === "ArrowDown"){ e.preventDefault(); setBpm(S.bpm - (e.shiftKey ? 5 : 1)); }
  else if(e.key === "t" || e.key === "T"){ tap(); }
});

function renderAll(){
  if(!curSpan(S) && !METERS.some(m => m.beats === S.beats && m.unit === S.unit)) applyMeter(METERS[0], true);
  if(![1,2,3,4,6].includes(S.sub)) S.sub = 2;
  setBpm(S.bpm); renderMeter(); refreshSubs(); refreshSounds(); refreshDownSounds(); refreshPatSounds();
  renderSpanOptions(); renderPattern(); renderPresets(); renderTrainer();
}
renderAll();
