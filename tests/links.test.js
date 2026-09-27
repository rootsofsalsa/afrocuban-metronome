// Homework links: the owner posts these in YouTube descriptions, so every link must keep working for good.
// The example links below are the contract. If one of these tests fails, fix the app, not the test.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { PATTERNS, SPANS } from "../site/js/patterns.js";
import { METERS, SUBS } from "../site/js/meters.js";
import { gridInfo, defaultMet, curSpan, curMet, curHits, metKey } from "../site/js/grid.js";
import { makeLink, readLink, LINK_WORDS, LIVE_SITE } from "../site/js/links.js";

const row = r => r.map(v => ".xD"[v]).join("");
const read = link => readLink(new URL(link).search);

// Everything a link must carry: what changes what the student hears or sees in the exercise.
// With a pattern, the tempo unit is the one its "One cycle" choice shows.
function essentials(s){
  const g = gridInfo(s);
  return {pattern:s.pattern, span:g.pattern ? s.span : null, beats:s.beats, sub:s.sub, unit:g.pattern ? curSpan(s).unit : s.unit, bpm:s.bpm,
    clicks:row(curMet(s)), strokes:g.pattern ? curHits(s).join() : null,
    metOn:s.metOn, patOn:g.pattern ? s.patOn : true,
    sound:s.sound, downSound:s.downSound, patSound:g.pattern ? s.patSound : null,
    gap:s.gap.on ? {...s.gap, what:g.pattern ? s.gap.what : "pattern"} : null, tr:s.tr.on ? s.tr : null, countIn:s.countIn};
}

test("the link words never change", () => {
  assert.deepEqual(LINK_WORDS, ["pattern", "cycle", "meter", "sub", "bpm", "clicks", "strokes", "mute",
    "click", "downbeat", "patternsound", "listen", "yourturn", "silence", "change", "every", "until", "countin", "title"]);
  assert.equal(LIVE_SITE, "https://metronome.rootsofsalsa.com/");
});

describe("example links read as expected and are written the same way", () => {
  test("Campana de Abakuá at 90, Listen, then play 2 and 2, with a title", () => {
    const link = "https://metronome.rootsofsalsa.com/?pattern=abakua&bpm=90&listen=2&yourturn=2&title=Week+40";
    const {settings:s, title} = read(link);
    assert.equal(title, "Week 40");
    assert.deepEqual(essentials(s), {pattern:"abakua", span:"dq", beats:2, sub:3, unit:"dotted quarter note", bpm:90,
      clicks:"DxxDxxDxxDxx", strokes:"0,2,5,7,9", metOn:true, patOn:true, sound:"wood", downSound:"click", patSound:"campana",
      gap:{on:true, play:2, mute:2, what:"pattern"}, tr:null, countIn:false});
    assert.equal(makeLink(s, title), link);
  });

  test("Catá Habanero at 70, downbeat clicks only, speed trainer to 100, count-in", () => {
    const link = "https://metronome.rootsofsalsa.com/?pattern=habanero&bpm=70&clicks=D---D---D---D---&change=2&every=4&until=100&countin=on";
    const {settings:s, title} = read(link);
    assert.equal(title, "");
    assert.deepEqual(essentials(s), {pattern:"habanero", span:"2bar", beats:2, sub:2, unit:"half note", bpm:70,
      clicks:"D...D...D...D...", strokes:"0,2,3,5,7,8,10,12,13,15", metOn:true, patOn:true, sound:"wood", downSound:"click",
      patSound:"cata", gap:null, tr:{on:true, step:2, every:4, target:100}, countIn:true});
    assert.equal(makeLink(s), link);
  });

  test("No pattern, 6/8 in 6 at 180", () => {
    const link = "https://metronome.rootsofsalsa.com/?pattern=off&meter=68in6&bpm=180";
    const {settings:s} = read(link);
    assert.deepEqual(essentials(s), {pattern:"none", span:null, beats:6, sub:1, unit:"eighth note", bpm:180,
      clicks:"DDDDDD", strokes:null, metOn:true, patOn:true, sound:"wood", downSound:"click", patSound:null,
      gap:null, tr:null, countIn:false});
    assert.equal(makeLink(s), link);
  });

  test("Catá de Columbia, edited, with every other option and an accented title", () => {
    const link = "https://metronome.rootsofsalsa.com/?pattern=columbia&bpm=60&strokes=x-xx-xxx-x-x&mute=metronome"
      + "&click=beep&downbeat=stick&patternsound=clave&listen=1&yourturn=3&silence=all&title=Cat%C3%A1+%C2%B7+Week+41";
    const {settings:s, title} = read(link);
    assert.equal(title, "Catá · Week 41");
    assert.deepEqual(essentials(s), {pattern:"columbia", span:"dq", beats:2, sub:3, unit:"dotted quarter note", bpm:60,
      clicks:"DxxDxxDxxDxx", strokes:"0,2,3,5,6,7,9,11", metOn:false, patOn:true, sound:"beep", downSound:"stick",
      patSound:"clave", gap:{on:true, play:1, mute:3, what:"all"}, tr:null, countIn:false});
    assert.equal(makeLink(s, title), link);
  });

  test("Clave Dos Tres, pattern row off, silencing the metronome, slowing down", () => {
    const link = "https://metronome.rootsofsalsa.com/?pattern=dostres&bpm=100&mute=pattern&listen=4&yourturn=4"
      + "&silence=metronome&change=-5&every=8&until=60";
    const {settings:s} = read(link);
    assert.deepEqual(essentials(s), {pattern:"dostres", span:"2bar", beats:2, sub:2, unit:"half note", bpm:100,
      clicks:"D.x.D.x.D.x.D.x.", strokes:"0,3,7,10,12", metOn:true, patOn:false, sound:"wood", downSound:"click",
      patSound:"clave", gap:{on:true, play:4, mute:4, what:"clicks"}, tr:{on:true, step:-5, every:8, target:60}, countIn:false});
    assert.equal(makeLink(s), link);
  });
});

// The owner removed the 16th-note grid and "counted in 6" on 2026-09-27, before any posted link used them.
test("cycle=1bar and cycle=in6 open the pattern's own setting, and new links leave the word out", () => {
  for(const [link, span] of [["?pattern=dostres&cycle=1bar&bpm=100", "2bar"], ["?pattern=columbia&cycle=in6&bpm=60", "dq"]]){
    const {settings:s} = read(LIVE_SITE + link);
    assert.equal(s.span, span);
    assert.equal(makeLink(s), LIVE_SITE + link.replace(/&cycle=\w+/, ""));
  }
});

test("anything a link doesn't mention starts from the same values for everyone", () => {
  const {settings:s} = read(LIVE_SITE + "?pattern=tresdos");
  assert.deepEqual(essentials(s), {pattern:"tresdos", span:"2bar", beats:2, sub:2, unit:"half note", bpm:80,
    clicks:"D.x.D.x.D.x.D.x.", strokes:"0,3,6,10,12", metOn:true, patOn:true, sound:"wood", downSound:"click",
    patSound:"clave", gap:null, tr:null, countIn:false});
  assert.equal(s.met, null);
  assert.equal(s.hits, null);
  assert.deepEqual(s.tr, {on:false, step:2, every:4, target:140});
  assert.deepEqual(s.gap, {on:false, play:2, mute:2, what:"pattern"});
  assert.equal(s.vol, undefined, "volume levels stay each person's own");
});

describe("every setup survives the trip through a link", () => {
  const setups = [];
  for(const [id, p] of Object.entries(PATTERNS)) if(p.steps) for(const sp of SPANS[p.steps]){
    const s = readLink("?pattern=" + id).settings;
    Object.assign(s, {span:sp.id, beats:sp.beats, accents:sp.accents.slice(), sub:sp.sub});
    setups.push([`${p.name}, ${sp.id}`, s]);
  }
  for(const m of METERS) for(const {n} of SUBS) setups.push([`no pattern, ${m.label}, sub ${n}`, readLink(`?pattern=off&meter=${m.id}&sub=${n}`).settings]);

  // Changes every setting a link carries away from its starting value.
  function changeEverything(s){
    const g = gridInfo(s);
    s[metKey(s)] = Array.from({length:g.steps}, (_, i) => i % 3 === 0 ? 2 : i % 2);
    if(g.pattern){ const h = PATTERNS[s.pattern].hits.slice(1); if(!h.includes(g.steps - 1)) h.push(g.steps - 1); s.hits = h; }
    Object.assign(s, {bpm:123, metOn:false, patOn:false, sound:"beep", downSound:"stick", patSound:"campana" === s.patSound ? "clave" : "campana",
      gap:{on:true, play:3, mute:1, what:"all"}, tr:{on:true, step:-3, every:2, target:60}, countIn:true});
    return s;
  }

  for(const [name, s] of setups){
    test(name, () => {
      assert.deepEqual(essentials(read(makeLink(s)).settings), essentials(s));
      const changed = changeEverything(structuredClone(s));
      assert.notEqual(row(curMet(changed)), row(defaultMet("beats", gridInfo(changed))));
      assert.deepEqual(essentials(read(makeLink(changed, "Test")).settings), essentials(changed));
    });
  }
});

describe("messy links never break the page", () => {
  const good = LIVE_SITE + "?pattern=abakua&bpm=90";

  test("an address without a pattern isn't a setup link", () => {
    assert.equal(readLink(""), null);
    assert.equal(readLink("?fbclid=abc123"), null);
    assert.equal(readLink("?title=Week+40"), null);
  });

  test("a pattern this app doesn't have opens nothing, but keeps the title", () => {
    assert.deepEqual(readLink("?pattern=songo&bpm=90&title=Week+40"), {settings:null, title:"Week 40"});
  });

  test("words the app doesn't know, like the tracking tags apps add, are ignored", () => {
    assert.deepEqual(read(good + "&fbclid=xyz&si=abc&utm_source=youtube").settings, read(good).settings);
  });

  test("bad values are ignored, and out-of-range numbers are brought into range", () => {
    const s = extra => read(good + extra).settings;
    assert.equal(read(LIVE_SITE + "?pattern=abakua&bpm=fast").settings.bpm, 80);
    assert.equal(read(LIVE_SITE + "?pattern=abakua&bpm=999").settings.bpm, 300);
    assert.equal(read(LIVE_SITE + "?pattern=abakua&bpm=5").settings.bpm, 20);
    assert.equal(s("&cycle=2bars").span, "dq", "a 16-step cycle word on a 12-step pattern");
    assert.equal(s("&clicks=D--D--").met, null, "wrong length");
    assert.equal(s("&clicks=D..D..D..D..").met, null, "dots aren't link characters");
    assert.equal(s("&strokes=x-x--x-x-x").hits, null, "wrong length");
    assert.equal(s("&mute=everything").metOn, true);
    assert.deepEqual(s("&listen=0&yourturn=99").gap, {on:true, play:1, mute:32, what:"pattern"});
    assert.deepEqual(s("&listen=2&silence=loud").gap, {on:true, play:2, mute:2, what:"pattern"});
    assert.deepEqual(s("&until=fast").tr, {on:true, step:2, every:4, target:140});
    assert.equal(s("&countin=yes").countIn, false);
    assert.equal(read(LIVE_SITE + "?pattern=off&meter=54&sub=5").settings.beats, 2, "unknown meter: 4/4 cut time");
    assert.equal(read(LIVE_SITE + "?pattern=off&meter=68in2&sub=5").settings.sub, 3, "unknown subdivision: the meter's own");
  });

  test("titles are trimmed and kept short", () => {
    assert.equal(read(good + "&title=++Week+40++").title, "Week 40");
    assert.equal(read(good + "&title=" + "a".repeat(200)).title.length, 80);
  });
});

test("links point at the address they're made on", () => {
  const {settings:s} = read(LIVE_SITE + "?pattern=guiro&bpm=100");
  assert.equal(makeLink(s), "https://metronome.rootsofsalsa.com/?pattern=guiro&bpm=100");
  assert.equal(makeLink(s, "", "http://localhost:8000/"), "http://localhost:8000/?pattern=guiro&bpm=100");
});
