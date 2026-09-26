// AudioContext and synthesized voices. Sample loading and choke come in Phase 4.

export const SOUNDS = [{id:"click",label:"Click"},{id:"wood",label:"Woodblock"},{id:"clave",label:"Clave"},{id:"cowbell",label:"Cowbell"},{id:"stick",label:"Rim"},{id:"beep",label:"Beep"}];

// ctx is created on the first Start or sound preview (browsers only allow audio after a user gesture).
// Importers see it update, because ES module exports are live bindings.
export let ctx = null;
let master = null, noise = null;

// Volumes are 0-100; the gain curve is squared so the sliders feel even.
export function initAudio(masterVol){
  if(ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)({latencyHint:"interactive"});
  master = ctx.createGain(); master.gain.value = (masterVol/100)**2;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -6; comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate*0.5, ctx.sampleRate);
  const d = noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
}

export function setMasterVolume(vol){
  if(master) master.gain.setTargetAtTime((vol/100)**2, ctx.currentTime, 0.02);
}

function env(g, t, peak, dec){
  peak = Math.max(peak, 0.0002);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t+0.0015);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dec);
}
function osc(type, f, t, dur, dest){ const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t+dur+0.02); return o; }
function burst(t, dur, dest){ const s = ctx.createBufferSource(); s.buffer = noise; s.connect(dest); s.start(t); s.stop(t+dur+0.02); }

// Play one stroke of a voice at audio time t. role: "accent", "beat" or anything else (softest).
export function voice(kind, t, gain, role){
  if(gain <= 0.001) return;
  const g = ctx.createGain(); g.connect(master);
  const R = (a,b,c) => role === "accent" ? a : role === "beat" ? b : c;
  switch(kind){
    case "click": { env(g,t,gain*0.9,0.035); osc("sine",R(2000,1500,1100),t,0.04,g); break; }
    case "beep":  { env(g,t,gain*0.6,0.11); osc("sine",R(1320,880,660),t,0.12,g); break; }
    case "wood": {
      const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.Q.value=3; const f = R(1050,820,640); bp.frequency.value=f*1.2; bp.connect(g);
      env(g,t,gain*1.4,0.075);
      const o = osc("triangle",f,t,0.08,bp); o.frequency.exponentialRampToValueAtTime(f*0.86,t+0.05);
      const ng = ctx.createGain(); env(ng,t,gain*0.25,0.012); ng.connect(bp); burst(t,0.015,ng);
      break;
    }
    case "clave": { env(g,t,gain*0.75,R(0.14,0.12,0.08)); osc("sine",R(2750,2500,2250),t,0.15,g);
      const ng = ctx.createGain(); const hp = ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=3000; ng.connect(hp).connect(master); env(ng,t,gain*0.15,0.008); burst(t,0.01,ng); break; }
    case "cowbell": {
      const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=1100; bp.Q.value=1.2; bp.connect(g);
      env(g,t,gain*0.5,R(0.38,0.22,0.08));
      osc("square",562,t,0.4,bp); osc("square",845,t,0.4,bp); break;
    }
    case "stick": {
      const hp = ctx.createBiquadFilter(); hp.type="bandpass"; hp.frequency.value=R(4200,3600,3000); hp.Q.value=2; hp.connect(g);
      env(g,t,gain*2.2,0.03); burst(t,0.035,hp);
      const g2 = ctx.createGain(); g2.connect(master); env(g2,t,gain*0.3,0.02); osc("sine",R(2200,1800,1500),t,0.03,g2); break;
    }
  }
}
