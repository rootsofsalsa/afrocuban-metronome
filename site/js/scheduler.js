// Lookahead scheduler: grid stepping, count-in, listen-then-play and speed trainer.
// A timer wakes every 25 ms and schedules every beat that starts within the next 120 ms on the
// audio clock, so timing never depends on setTimeout accuracy.
import { ctx, voice } from "./audio.js";
import { gridInfo, curMet, curHits, gapBarsPerUnit } from "./grid.js";

const LOOK = 0.12, TICK = 25;
let S = null, onTrainerStep = null;
let running = false, timer = null, nextT = 0, beatInBar = 0, bar = 0, totalBeats = 0, startT = 0, countInBeats = 0;
// Events for the display, queued as they are scheduled: {kind:"p", step} per grid step,
// {kind:"b", ...} per BPM beat (bar number, status badge, pattern-row dimming).
const queue = [];

export const isRunning = () => running;
export const startTime = () => startT;

// state is the live settings object, read on every beat so changes apply at once.
// trainerStep(bpm) is called when the speed trainer changes the tempo.
export function start(state, trainerStep){
  S = state; onTrainerStep = trainerStep;
  clearInterval(timer);
  beatInBar = 0; bar = 0; totalBeats = 0; queue.length = 0;
  countInBeats = S.countIn ? S.beats : 0;
  nextT = ctx.currentTime + 0.06; startT = nextT;
  running = true; timer = setInterval(loop, TICK); loop();
}

export function stop(){
  running = false; clearInterval(timer); queue.length = 0;
}

// Hand every event whose time has come to handle(ev), in queue order.
export function drain(now, handle){
  while(queue.length && queue[0].t <= now) handle(queue.shift());
}

// The meter changed: keep the beat counter inside the new bar.
export function clampBeat(beats){
  if(beatInBar >= beats) beatInBar = 0;
}

function scheduleBeat(t){
  const beatSec = 60 / S.bpm;
  const counting = countInBeats > 0;
  // Silent sections count in pattern cycles (or bars with no pattern)
  const g = gridInfo(S), bpc = gapBarsPerUnit(g), unit = Math.floor(bar / bpc), cycle = S.gap.play + S.gap.mute, phase = unit % cycle;
  const gapSilent = !counting && S.gap.on && phase >= S.gap.play;
  const what = g.pattern ? S.gap.what : "all";
  const muteClicks = gapSilent && what !== "pattern";
  const mutePat = gapSilent && what !== "clicks";
  const muted = muteClicks && mutePat;
  const gapLabel = !S.gap.on || counting ? "" : gapSilent ? `Your turn · ${phase - S.gap.play + 1} of ${S.gap.mute}` : `Listen · ${phase + 1} of ${S.gap.play}`;
  const lvl = counting ? (beatInBar === 0 ? 3 : 2) : (S.accents[beatInBar] ?? 2);
  const bv = (S.vol.beat/100)**2;
  if(counting){
    // Count-in: plain beat clicks
    voice(lvl === 3 ? S.downSound : S.sound, t, lvl === 3 ? bv : bv*0.62, lvl === 3 ? "accent" : "beat");
  } else {
    // Metronome row (and pattern row, if any) on one step grid
    const met = curMet(S), hits = g.pattern ? curHits(S) : [], pb = totalBeats;
    const pv = (S.vol.pat/100)**2;
    for(let k=0;k<g.spb;k++){
      const step = (pb*g.spb + k) % g.steps;
      const st = t + k*(beatSec/g.spb);
      if(S.metOn && !muteClicks){
        if(met[step] === 2) voice(S.downSound, st, bv, "accent");
        else if(met[step] === 1) voice(S.sound, st, bv*0.62, "beat");
      }
      if(g.pattern && S.patOn && !mutePat && hits.includes(step)) voice(S.patSound, st, pv, "accent");
      queue.push({t:st, kind:"p", step});
    }
  }
  queue.push({t, kind:"b", beat:beatInBar, bar, muted, counting, gapSilent, mutePat, gapLabel});
  // advance
  nextT += beatSec;
  beatInBar++;
  if(!counting) totalBeats++;
  if(counting) countInBeats--;
  if(beatInBar >= S.beats){
    beatInBar = 0;
    if(!counting) {
      bar++;
      if(S.tr.on && bar % Math.max(1,S.tr.every) === 0 && S.bpm !== S.tr.target){
        const dir = Math.sign(S.tr.target - S.bpm);
        const step = Math.abs(S.tr.step) * dir;
        let nb = S.bpm + step;
        if((dir > 0 && nb > S.tr.target) || (dir < 0 && nb < S.tr.target)) nb = S.tr.target;
        onTrainerStep(nb);
      }
    }
  }
}

function loop(){
  while(nextT < ctx.currentTime + LOOK) scheduleBeat(nextT);
}
