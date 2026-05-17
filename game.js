"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const ui = {
  lives: document.getElementById("lives"),
  coins: document.getElementById("coins"),
  stage: document.getElementById("stage"),
  wave: document.getElementById("wave"),
  preview: document.getElementById("wavePreview"),
  startWave: document.getElementById("startWave"),
  pause: document.getElementById("pause"),
  speed: document.getElementById("speed"),
  restartStage: document.getElementById("restartStage"),
  music: document.getElementById("music"),
  towerButtons: document.getElementById("towerButtons"),
  inspect: document.getElementById("inspect"),
  toast: document.getElementById("toast"),
  stageMap: document.getElementById("stageMap"),
  stageNodes: document.getElementById("stageNodes"),
  beginStage: document.getElementById("beginStage"),
  gameOver: document.getElementById("gameOver"),
  endKicker: document.getElementById("endKicker"),
  endTitle: document.getElementById("endTitle"),
  endText: document.getElementById("endText"),
  finalStats: document.getElementById("finalStats"),
  scoreForm: document.getElementById("scoreForm"),
  playerName: document.getElementById("playerName"),
  leaderboard: document.getElementById("leaderboard"),
  restart: document.getElementById("restart"),
};

const W = 1280;
const H = 760;
const TAU = Math.PI * 2;
const LEADERBOARD_KEY = "bloomguard.leaderboard.v1";
const enemyPortraitFiles = [
  "assets/enemy-1.png",
  "assets/enemy-2.png",
  "assets/enemy-3.png",
  "assets/enemy-4.png",
];
const enemyPortraits = enemyPortraitFiles.map((src) => {
  const img = new Image();
  img.src = src;
  img.onerror = () => {
    img.failed = true;
  };
  return img;
});
const enemyPortraitByType = {
  sprout: 2,
  skitter: 3,
  brute: 0,
  flyer: 1,
  shield: 3,
  elite: 0,
  boss: 1,
};
const fallbackPortraits = [
  { label: "1", skin: "#d9a384", hair: "#1c1417", accent: "#26345f" },
  { label: "2", skin: "#d99a6f", hair: "#141414", accent: "#f5f7fb" },
  { label: "3", skin: "#d8b48c", hair: "#d9d9d9", accent: "#8f6c3a" },
  { label: "4", skin: "#d89a76", hair: "#161616", accent: "#6e9b5b" },
];

const stageLayouts = [
  {
    ground: ["#aee778", "#66bd68"],
    river: "bottom",
    path: [
      { x: -50, y: 170 }, { x: 130, y: 165 }, { x: 250, y: 265 }, { x: 440, y: 225 },
      { x: 565, y: 350 }, { x: 735, y: 320 }, { x: 870, y: 455 }, { x: 1045, y: 405 },
      { x: 1160, y: 520 }, { x: 1330, y: 510 },
    ],
    spots: [
      { x: 170, y: 78 }, { x: 294, y: 152 }, { x: 372, y: 333 }, { x: 490, y: 128 },
      { x: 620, y: 252 }, { x: 650, y: 465 }, { x: 800, y: 232 }, { x: 930, y: 560 },
      { x: 1008, y: 312 }, { x: 1120, y: 610 }, { x: 225, y: 410 }, { x: 540, y: 560 },
      { x: 108, y: 265 }, { x: 448, y: 350 }, { x: 878, y: 330 }, { x: 1185, y: 420 },
      { x: 255, y: 365 }, { x: 735, y: 430 }, { x: 352, y: 180 }, { x: 980, y: 510 },
    ],
  },
  {
    ground: ["#b7df72", "#73c56b"],
    river: "left",
    path: [
      { x: -50, y: 430 }, { x: 115, y: 430 }, { x: 205, y: 280 }, { x: 365, y: 315 },
      { x: 470, y: 150 }, { x: 640, y: 190 }, { x: 720, y: 365 }, { x: 900, y: 340 },
      { x: 1015, y: 505 }, { x: 1330, y: 510 },
    ],
    spots: [
      { x: 120, y: 330 }, { x: 250, y: 500 }, { x: 310, y: 210 }, { x: 455, y: 285 },
      { x: 545, y: 85 }, { x: 650, y: 285 }, { x: 795, y: 455 }, { x: 875, y: 235 },
      { x: 1035, y: 390 }, { x: 1135, y: 590 }, { x: 575, y: 510 }, { x: 1010, y: 645 },
      { x: 145, y: 535 }, { x: 360, y: 420 }, { x: 720, y: 255 }, { x: 960, y: 520 },
      { x: 235, y: 185 }, { x: 805, y: 455 }, { x: 720, y: 160 }, { x: 1100, y: 430 },
    ],
  },
  {
    ground: ["#c8efd7", "#80c7a8"],
    river: "middle",
    path: [
      { x: -50, y: 255 }, { x: 140, y: 255 }, { x: 235, y: 385 }, { x: 395, y: 455 },
      { x: 515, y: 315 }, { x: 675, y: 410 }, { x: 815, y: 250 }, { x: 985, y: 285 },
      { x: 1085, y: 440 }, { x: 1330, y: 510 },
    ],
    spots: [
      { x: 130, y: 150 }, { x: 250, y: 300 }, { x: 310, y: 500 }, { x: 445, y: 385 },
      { x: 505, y: 210 }, { x: 650, y: 300 }, { x: 745, y: 505 }, { x: 820, y: 150 },
      { x: 970, y: 390 }, { x: 1125, y: 330 }, { x: 1160, y: 610 }, { x: 595, y: 575 },
      { x: 160, y: 365 }, { x: 400, y: 555 }, { x: 735, y: 315 }, { x: 1055, y: 505 },
      { x: 545, y: 455 }, { x: 880, y: 250 }, { x: 250, y: 175 }, { x: 925, y: 200 },
    ],
  },
  {
    ground: ["#a7e4ba", "#6ac0a3"],
    river: "islands",
    path: [
      { x: -50, y: 115 }, { x: 170, y: 145 }, { x: 255, y: 330 }, { x: 420, y: 360 },
      { x: 515, y: 545 }, { x: 690, y: 500 }, { x: 795, y: 330 }, { x: 970, y: 355 },
      { x: 1095, y: 500 }, { x: 1330, y: 510 },
    ],
    spots: [
      { x: 150, y: 245 }, { x: 245, y: 70 }, { x: 345, y: 275 }, { x: 425, y: 470 },
      { x: 555, y: 405 }, { x: 645, y: 615 }, { x: 745, y: 425 }, { x: 820, y: 210 },
      { x: 980, y: 250 }, { x: 1060, y: 610 }, { x: 1135, y: 395 }, { x: 545, y: 185 },
      { x: 185, y: 360 }, { x: 505, y: 600 }, { x: 715, y: 260 }, { x: 980, y: 500 },
      { x: 305, y: 420 }, { x: 885, y: 450 }, { x: 360, y: 260 }, { x: 1160, y: 600 },
    ],
  },
  {
    ground: ["#bce77b", "#76bd62"],
    river: "top",
    path: [
      { x: -50, y: 575 }, { x: 150, y: 535 }, { x: 230, y: 375 }, { x: 390, y: 410 },
      { x: 500, y: 250 }, { x: 670, y: 265 }, { x: 780, y: 430 }, { x: 940, y: 430 },
      { x: 1045, y: 575 }, { x: 1330, y: 510 },
    ],
    spots: [
      { x: 110, y: 435 }, { x: 210, y: 300 }, { x: 305, y: 485 }, { x: 380, y: 300 },
      { x: 515, y: 380 }, { x: 610, y: 150 }, { x: 705, y: 360 }, { x: 790, y: 535 },
      { x: 895, y: 320 }, { x: 1015, y: 470 }, { x: 1120, y: 610 }, { x: 610, y: 555 },
      { x: 145, y: 610 }, { x: 545, y: 205 }, { x: 835, y: 360 }, { x: 1015, y: 615 },
      { x: 300, y: 390 }, { x: 735, y: 250 }, { x: 445, y: 185 }, { x: 1070, y: 430 },
    ],
  },
  {
    ground: ["#b0d487", "#67af72"],
    river: "cross",
    path: [
      { x: -50, y: 345 }, { x: 125, y: 235 }, { x: 295, y: 260 }, { x: 400, y: 470 },
      { x: 560, y: 470 }, { x: 650, y: 245 }, { x: 830, y: 215 }, { x: 930, y: 420 },
      { x: 1085, y: 380 }, { x: 1330, y: 510 },
    ],
    spots: [
      { x: 135, y: 355 }, { x: 210, y: 135 }, { x: 335, y: 355 }, { x: 395, y: 585 },
      { x: 535, y: 360 }, { x: 640, y: 135 }, { x: 745, y: 330 }, { x: 850, y: 105 },
      { x: 925, y: 535 }, { x: 1045, y: 290 }, { x: 1140, y: 470 }, { x: 680, y: 585 },
      { x: 215, y: 305 }, { x: 500, y: 565 }, { x: 790, y: 135 }, { x: 1010, y: 505 },
      { x: 575, y: 290 }, { x: 900, y: 310 }, { x: 315, y: 160 }, { x: 770, y: 465 },
    ],
  },
  {
    ground: ["#bddf8b", "#70b965"],
    river: "bottom",
    path: [
      { x: -50, y: 225 }, { x: 145, y: 220 }, { x: 260, y: 355 }, { x: 405, y: 300 },
      { x: 545, y: 405 }, { x: 690, y: 245 }, { x: 830, y: 300 }, { x: 915, y: 470 },
      { x: 1085, y: 430 }, { x: 1330, y: 540 },
    ],
    spots: [
      { x: 120, y: 120 }, { x: 165, y: 345 }, { x: 285, y: 245 }, { x: 345, y: 425 },
      { x: 430, y: 205 }, { x: 505, y: 505 }, { x: 575, y: 300 }, { x: 640, y: 160 },
      { x: 735, y: 355 }, { x: 795, y: 210 }, { x: 850, y: 380 }, { x: 955, y: 560 },
      { x: 1010, y: 345 }, { x: 1115, y: 520 }, { x: 1185, y: 455 }, { x: 230, y: 475 },
      { x: 360, y: 190 }, { x: 690, y: 465 }, { x: 875, y: 215 }, { x: 1045, y: 555 },
    ],
  },
  {
    ground: ["#b3e6c9", "#63b989"],
    river: "left",
    path: [
      { x: -50, y: 500 }, { x: 170, y: 455 }, { x: 250, y: 250 }, { x: 405, y: 250 },
      { x: 515, y: 410 }, { x: 675, y: 390 }, { x: 775, y: 190 }, { x: 950, y: 245 },
      { x: 1025, y: 420 }, { x: 1330, y: 455 },
    ],
    spots: [
      { x: 105, y: 590 }, { x: 150, y: 350 }, { x: 245, y: 535 }, { x: 300, y: 165 },
      { x: 365, y: 345 }, { x: 460, y: 155 }, { x: 500, y: 315 }, { x: 565, y: 520 },
      { x: 650, y: 300 }, { x: 720, y: 490 }, { x: 780, y: 315 }, { x: 845, y: 105 },
      { x: 925, y: 350 }, { x: 1010, y: 235 }, { x: 1110, y: 500 }, { x: 1175, y: 360 },
      { x: 205, y: 245 }, { x: 430, y: 430 }, { x: 760, y: 115 }, { x: 1065, y: 325 },
    ],
  },
];

let path = [];
let buildSpots = [];
let pathSegments = [];
let pathLength = 1;

const towerTypes = {
  archer: {
    name: "Archer", icon: "➶", color: "#9bd85e", unlock: 1, cost: 55, range: 150,
    fireRate: 0.62, damage: 16, projectile: "arrow", targetsFlying: true, desc: "Fast single shots",
  },
  cannon: {
    name: "Cannon", icon: "●", color: "#f2a24a", unlock: 2, cost: 95, range: 132,
    fireRate: 1.55, damage: 38, splash: 72, projectile: "shell", desc: "Splash bursts",
  },
  frost: {
    name: "Frost", icon: "❄", color: "#8ee9f2", unlock: 3, cost: 105, range: 126,
    fireRate: 1.22, damage: 8, splash: 94, slow: 0.46, slowTime: 2.2, projectile: "frost", desc: "Group slows",
  },
  lightning: {
    name: "Lightning", icon: "ϟ", color: "#d7b2ff", unlock: 4, cost: 130, range: 160,
    fireRate: 1.0, damage: 24, chains: 3, projectile: "bolt", targetsFlying: true, desc: "Chain zaps",
  },
  fire: {
    name: "Fire", icon: "♨", color: "#ff826f", unlock: 5, cost: 145, range: 142,
    fireRate: 0.66, damage: 14, burn: 34, burnTime: 3.1, projectile: "fire", desc: "Fast burns",
  },
  grenade: {
    name: "Grenade", icon: "G", color: "#8fd16a", unlock: 4, cost: 160, range: 168,
    fireRate: 1.08, damage: 82, splash: 130, projectile: "grenade", desc: "Huge blasts",
  },
  crystal: {
    name: "Crystal", icon: "◆", color: "#79d6ff", unlock: 5, cost: 230, range: 190,
    fireRate: 0.38, damage: 20, beam: true, targetsFlying: true, desc: "Bright beam",
  },
  turret: {
    name: "Turret", icon: "✚", color: "#bfc8b3", unlock: 6, cost: 190, range: 152,
    fireRate: 0.18, damage: 8, projectile: "pellet", targetsFlying: true, desc: "Rapid shots",
  },
};

const enemyTypes = {
  sprout: { name: "Sproutling", hp: 42, speed: 58, reward: 8, color: "#70be45", kind: "ground" },
  skitter: { name: "Skitter", hp: 34, speed: 92, reward: 9, color: "#f4bc54", kind: "ground" },
  brute: { name: "Brute", hp: 150, speed: 42, reward: 18, color: "#b7855e", kind: "ground", armor: 0.28 },
  flyer: { name: "Cloud Imp", hp: 78, speed: 76, reward: 15, color: "#8ac9ff", kind: "flying" },
  shield: { name: "Shell Guard", hp: 118, speed: 52, reward: 16, color: "#8eacbb", kind: "ground", resistBasic: 0.45 },
  elite: { name: "Glimmer Rogue", hp: 210, speed: 68, reward: 26, color: "#ba7df5", kind: "ground", armor: 0.18 },
  boss: { name: "Moss King", hp: 780, speed: 30, reward: 85, color: "#5c9e3d", kind: "ground", boss: true, armor: 0.18 },
};

const stages = [
  { name: "Sunny Stump", lives: 20, coins: 145, unlockText: "Archer towers ready", waves: [["sprout", 8], ["sprout", 12], ["sprout", 10, "skitter", 4], ["sprout", 18, "skitter", 8]] },
  { name: "Pebble Bend", lives: 20, coins: 165, unlockText: "Cannon tower unlocked", waves: [["sprout", 12, "skitter", 8], ["skitter", 16], ["sprout", 18, "skitter", 12], ["brute", 4, "skitter", 16]] },
  { name: "Frost Ferns", lives: 22, coins: 190, unlockText: "Frost tower unlocked", waves: [["brute", 7, "sprout", 14], ["shield", 7, "skitter", 12], ["brute", 9, "shield", 8], ["brute", 12, "shield", 10, "skitter", 18]] },
  { name: "Skycap Grove", lives: 22, coins: 210, unlockText: "Lightning and grenade towers unlocked", waves: [["flyer", 10, "sprout", 12], ["flyer", 16, "skitter", 14], ["flyer", 18, "shield", 10], ["flyer", 24, "brute", 9, "shield", 10]] },
  { name: "Castle Picnic", lives: 24, coins: 340, unlockText: "Fire and crystal towers unlocked", waves: [["elite", 4, "flyer", 8], ["shield", 16, "brute", 14], ["elite", 12, "flyer", 24], ["boss", 1, "elite", 14, "flyer", 18]] },
  { name: "Gearflower Vale", lives: 24, coins: 300, unlockText: "Mechanical turret unlocked", waves: [["elite", 18, "flyer", 24], ["boss", 1, "shield", 24], ["elite", 28, "brute", 24, "flyer", 28], ["boss", 2, "elite", 24, "flyer", 34]] },
  { name: "Boomcap Orchard", lives: 25, coins: 330, unlockText: "Boomcap boss waves unlocked", waves: [["shield", 18, "elite", 12], ["brute", 20, "flyer", 26], ["elite", 26, "shield", 24, "skitter", 24], ["boss", 2, "elite", 28, "flyer", 30]] },
  { name: "Moonwheel Keep", lives: 26, coins: 360, unlockText: "Final keep defense", waves: [["elite", 30, "flyer", 32], ["boss", 2, "shield", 30, "brute", 22], ["elite", 36, "flyer", 40, "shield", 30], ["boss", 3, "elite", 34, "flyer", 44]] },
];

const state = {
  stageIndex: 0,
  maxStage: 0,
  lives: 20,
  coins: 145,
  waveIndex: 0,
  selectedTowerType: "archer",
  selectedTower: null,
  placing: true,
  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],
  floaters: [],
  spawnQueue: [],
  spawnTimer: 0,
  waveActive: false,
  paused: false,
  speed: 1,
  last: 0,
  mouse: { x: -999, y: -999 },
  stagePicker: true,
  gameEnded: false,
  runKilled: 0,
  runTotal: 0,
  stageKilled: 0,
  stageTotal: 0,
  stageTallied: [],
  finalScore: 0,
};

let nextEnemyId = 1;

const audio = {
  ctx: null,
  enabled: false,
  musicTimer: 0,
  melodyStep: 0,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = true;
    this.ctx.resume();
  },
  tone(freq, dur = 0.12, type = "sine", gain = 0.04, when = 0) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const vol = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    vol.gain.setValueAtTime(0.0001, now);
    vol.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(vol).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  },
  noise(dur = 0.18, gain = 0.05) {
    if (!this.ctx || !this.enabled) return;
    const sr = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, sr * dur, sr);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    const vol = this.ctx.createGain();
    vol.gain.value = gain;
    src.buffer = buffer;
    src.connect(vol).connect(this.ctx.destination);
    src.start();
  },
  sfx(name) {
    const map = {
      build: [520, 720, 980],
      upgrade: [440, 660, 880, 1170],
      arrow: [900],
      cannon: [92, 64],
      lightning: [740, 1280],
      frost: [880, 660],
      hit: [180],
      defeat: [540, 350],
      coin: [1060, 1320],
      wave: [392, 523, 784],
      clear: [523, 659, 784, 1046],
      over: [220, 165, 110],
    };
    (map[name] || [440]).forEach((f, i) => this.tone(f, 0.1 + i * 0.02, name === "cannon" ? "sawtooth" : "triangle", 0.04, i * 0.055));
    if (name === "cannon") this.noise(0.2, 0.04);
  },
  update(dt) {
    if (!this.ctx || !this.enabled || state.paused || state.stagePicker) return;
    this.musicTimer -= dt;
    if (this.musicTimer <= 0) {
      const melody = [523, 587, 659, 784, 659, 587, 523, 392, 440, 523, 659, 587];
      const bass = [196, 196, 220, 247];
      const note = melody[this.melodyStep % melody.length];
      this.tone(note, 0.18, "triangle", 0.018);
      if (this.melodyStep % 3 === 0) this.tone(bass[Math.floor(this.melodyStep / 3) % bass.length], 0.32, "sine", 0.025);
      this.melodyStep++;
      this.musicTimer = 0.34;
    }
  },
};

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function closestPointOnSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy || 1;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq, 0, 1);
  return { x: a.x + dx * t, y: a.y + dy * t };
}

function closestPointOnPath(p, route) {
  let best = { point: route[0], distance: Infinity };
  for (let i = 0; i < route.length - 1; i++) {
    const point = closestPointOnSegment(p, route[i], route[i + 1]);
    const distance = dist(p, point);
    if (distance < best.distance) best = { point, distance };
  }
  return best;
}

function prepareBuildSpots(layout) {
  const minUsefulDistance = 62;
  const maxUsefulDistance = 92;
  return layout.spots.map((spot) => {
    const nearest = closestPointOnPath(spot, layout.path);
    if (nearest.distance >= minUsefulDistance && nearest.distance <= maxUsefulDistance) {
      return { ...spot, tower: null };
    }

    const dx = spot.x - nearest.point.x;
    const dy = spot.y - nearest.point.y;
    const len = Math.hypot(dx, dy) || 1;
    const targetDistance = nearest.distance < minUsefulDistance ? minUsefulDistance : maxUsefulDistance;
    return {
      x: clamp(nearest.point.x + (dx / len) * targetDistance, 55, W - 85),
      y: clamp(nearest.point.y + (dy / len) * targetDistance, 70, H - 80),
      tower: null,
    };
  });
}

function setStageLayout(index) {
  const layout = stageLayouts[index % stageLayouts.length];
  path = layout.path.map((p) => ({ ...p }));
  buildSpots = prepareBuildSpots(layout);
  pathSegments = path.slice(0, -1).map((p, i) => {
    const q = path[i + 1];
    return { a: p, b: q, len: dist(p, q) };
  });
  pathLength = Math.max(1, pathSegments.reduce((sum, s) => sum + s.len, 0));
}

function pointAt(progress) {
  let d = progress * pathLength;
  for (const s of pathSegments) {
    if (d <= s.len) {
      const t = d / s.len;
      return {
        x: lerp(s.a.x, s.b.x, t),
        y: lerp(s.a.y, s.b.y, t),
        angle: Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x),
      };
    }
    d -= s.len;
  }
  const last = path[path.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
}

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = W * ratio;
  canvas.height = H * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function currentStage() {
  return stages[state.stageIndex];
}

function resetRunStats() {
  state.runKilled = 0;
  state.runTotal = 0;
  state.stageKilled = 0;
  state.stageTotal = 0;
  state.stageTallied = Array(stages.length).fill(false);
  state.finalScore = 0;
}

function tallyCurrentStage() {
  if (state.stageTallied[state.stageIndex]) return;
  state.runKilled += state.stageKilled;
  state.runTotal += state.stageTotal;
  state.stageTallied[state.stageIndex] = true;
}

function calculateFinalScore() {
  const killPct = state.runTotal ? state.runKilled / state.runTotal : 0;
  return Math.round(
    state.runKilled * 100 +
    state.coins * 6 +
    state.lives * 350 +
    Math.round(killPct * 5000)
  );
}

function loadLeaderboard() {
  try {
    const scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    return Array.isArray(scores)
      ? scores.filter((s) => s && s.name && Number.isFinite(s.score)).sort((a, b) => b.score - a.score).slice(0, 10)
      : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(scores) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores.slice(0, 10)));
}

function isTopScore(score) {
  const scores = loadLeaderboard();
  return scores.length < 10 || score > scores[scores.length - 1].score;
}

function renderLeaderboard(scores = loadLeaderboard()) {
  if (!ui.leaderboard) return;
  ui.leaderboard.classList.remove("hidden");
  const rows = scores.length
    ? scores.map((entry) => `<li><strong>${escapeHtml(entry.name)}</strong> - ${entry.score.toLocaleString()} <small>${entry.killPct}% eliminated</small></li>`).join("")
    : "<li>No champions yet</li>";
  ui.leaderboard.innerHTML = `<h3>Leaderboard by Score</h3><ol>${rows}</ol>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[ch]));
}

function availableTowers() {
  return Object.entries(towerTypes).filter(([, t]) => t.unlock <= state.stageIndex + 1);
}

function resetForStage(index) {
  const st = stages[index];
  state.stageIndex = index;
  setStageLayout(index);
  state.lives = st.lives;
  state.coins = st.coins + Math.max(0, index - 1) * 25;
  state.waveIndex = 0;
  state.towers = [];
  state.enemies = [];
  state.projectiles = [];
  state.particles = [];
  state.floaters = [];
  state.spawnQueue = [];
  state.waveActive = false;
  state.spawnTimer = 0;
  state.stageKilled = 0;
  state.stageTotal = 0;
  state.selectedTower = null;
  state.selectedTowerType = availableTowers()[0][0];
  state.placing = true;
  state.gameEnded = false;
  state.paused = false;
  ui.gameOver.classList.add("hidden");
  ui.scoreForm?.classList.add("hidden");
  ui.finalStats?.classList.add("hidden");
  ui.leaderboard?.classList.add("hidden");
  updateUi();
  renderTowerButtons();
  showToast(st.unlockText);
}

function restartCurrentStage() {
  const keepMaxStage = state.maxStage;
  const stage = state.stageIndex;
  resetForStage(stage);
  state.maxStage = keepMaxStage;
  state.stagePicker = false;
  ui.stageMap.classList.add("hidden");
  ui.gameOver.classList.add("hidden");
  showToast(`Restarted ${currentStage().name}`);
}

function buildWaveQueue(items) {
  const queue = [];
  for (let i = 0; i < items.length; i += 2) {
    const type = items[i];
    const count = items[i + 1];
    for (let n = 0; n < count; n++) queue.push({ type, delay: 0.44 + Math.random() * 0.25 });
  }
  queue.sort(() => Math.random() - 0.5);
  return queue;
}

function waveSummary() {
  const wave = currentStage().waves[state.waveIndex];
  if (!wave) return "Stage clear";
  const parts = [];
  for (let i = 0; i < wave.length; i += 2) parts.push(`${wave[i + 1]} ${enemyTypes[wave[i]].name}`);
  return parts.join(", ");
}

function startWave() {
  if (state.waveActive || state.stagePicker || state.gameEnded) return;
  audio.init();
  const wave = currentStage().waves[state.waveIndex];
  if (!wave) return;
  state.spawnQueue = buildWaveQueue(wave);
  state.spawnTimer = 0.2;
  state.waveActive = true;
  audio.sfx("wave");
  showToast(`Wave ${state.waveIndex + 1}: ${waveSummary()}`);
  updateUi();
}

function spawnEnemy(type) {
  const base = enemyTypes[type];
  const stageScale = 1 + state.stageIndex * 0.22;
  const hp = Math.round(base.hp * stageScale * (base.boss ? 1 + state.stageIndex * 0.15 : 1));
  const e = {
    id: `enemy-${nextEnemyId++}`,
    type,
    name: base.name,
    hp,
    maxHp: hp,
    speed: base.speed * (1 + state.stageIndex * 0.035),
    reward: Math.round(base.reward * (1 + state.stageIndex * 0.12)),
    color: base.color,
    kind: base.kind,
    armor: base.armor || 0,
    resistBasic: base.resistBasic || 0,
    boss: !!base.boss,
    progress: 0,
    x: path[0].x,
    y: path[0].y,
    angle: 0,
    slow: 1,
    slowTimer: 0,
    burnTimer: 0,
    burnDps: 0,
    wobble: Math.random() * TAU,
    hitFlash: 0,
  };
  state.stageTotal++;
  state.enemies.push(e);
}

function damageEnemy(enemy, amount, source = "magic") {
  let dmg = amount;
  if (enemy.armor) dmg *= 1 - enemy.armor;
  if (enemy.resistBasic && source === "basic") dmg *= 1 - enemy.resistBasic;
  enemy.hp -= dmg;
  enemy.hitFlash = 0.12;
  if (enemy.hp <= 0) defeatEnemy(enemy);
}

function defeatEnemy(enemy) {
  if (!state.enemies.includes(enemy)) return;
  state.enemies = state.enemies.filter((e) => e !== enemy);
  state.stageKilled++;
  state.coins += enemy.reward;
  addFloater(enemy.x, enemy.y - 24, `+${enemy.reward}`, "#ffe176");
  burst(enemy.x, enemy.y, enemy.boss ? 32 : 14, enemy.color);
  audio.sfx(enemy.boss ? "clear" : "defeat");
  updateUi();
}

function burst(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x, y, color,
      vx: Math.cos((i / count) * TAU) * (40 + Math.random() * 110),
      vy: Math.sin((i / count) * TAU) * (40 + Math.random() * 110),
      life: 0.45 + Math.random() * 0.35,
      max: 0.8,
      r: 3 + Math.random() * 4,
    });
  }
}

function addFloater(x, y, text, color = "#ffffff") {
  state.floaters.push({ x, y, text, color, life: 1, max: 1 });
}

function placeTower(spot, type) {
  const def = towerTypes[type];
  if (state.coins < def.cost) {
    showToast("Not enough coins yet");
    return;
  }
  if (spot.tower) return;
  const tower = {
    type,
    x: spot.x,
    y: spot.y,
    level: 1,
    cooldown: Math.random() * 0.2,
    angle: -Math.PI / 2,
    pulse: 0,
    spot,
  };
  spot.tower = tower;
  state.towers.push(tower);
  state.coins -= def.cost;
  state.selectedTower = null;
  state.placing = true;
  audio.sfx("build");
  burst(tower.x, tower.y, 12, def.color);
  updateUi();
}

function upgradeTower(tower) {
  const def = towerTypes[tower.type];
  const cost = Math.round(def.cost * (0.72 + tower.level * 0.58));
  if (tower.level >= 3) return showToast("This tower is fully upgraded");
  if (state.coins < cost) return showToast("Save a few more coins for that upgrade");
  state.coins -= cost;
  tower.level++;
  tower.pulse = 0.5;
  audio.sfx("upgrade");
  burst(tower.x, tower.y - 18, 20, def.color);
  updateUi();
}

function sellTower(tower) {
  const def = towerTypes[tower.type];
  state.coins += Math.round(def.cost * (0.55 + tower.level * 0.16));
  tower.spot.tower = null;
  state.towers = state.towers.filter((t) => t !== tower);
  state.selectedTower = null;
  state.placing = true;
  updateUi();
}

function towerStats(tower) {
  const def = towerTypes[tower.type];
  const mult = 1 + (tower.level - 1) * 0.45;
  return {
    range: def.range + (tower.level - 1) * 18,
    damage: def.damage * mult,
    fireRate: def.fireRate * (1 - (tower.level - 1) * 0.08),
    splash: def.splash ? def.splash + (tower.level - 1) * 14 : 0,
  };
}

function findTarget(tower) {
  const def = towerTypes[tower.type];
  const stats = towerStats(tower);
  const options = state.enemies.filter((e) => {
    if (e.kind === "flying" && !def.targetsFlying && tower.type !== "lightning") return false;
    return dist(tower, e) <= stats.range;
  });
  options.sort((a, b) => b.progress - a.progress);
  return options[0];
}

function fireTower(tower, target) {
  const def = towerTypes[tower.type];
  const stats = towerStats(tower);
  tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);
  tower.cooldown = stats.fireRate;
  tower.pulse = 0.15;

  if (def.beam) {
    damageEnemy(target, stats.damage, "magic");
    state.projectiles.push({ kind: "beam", x: tower.x, y: tower.y - 20, tx: target.x, ty: target.y, life: 0.12, color: def.color });
    audio.sfx("lightning");
    return;
  }

  if (def.chains) {
    const chained = [target];
    let current = target;
    for (let i = 1; i < def.chains + tower.level; i++) {
      const next = state.enemies
        .filter((e) => !chained.includes(e) && dist(current, e) < 150)
        .sort((a, b) => dist(current, a) - dist(current, b))[0];
      if (!next) break;
      chained.push(next);
      current = next;
    }
    chained.forEach((e, i) => damageEnemy(e, stats.damage * (1 - i * 0.18), "magic"));
    for (let i = 0; i < chained.length - 1; i++) {
      state.projectiles.push({ kind: "beam", x: chained[i].x, y: chained[i].y, tx: chained[i + 1].x, ty: chained[i + 1].y, life: 0.16, color: "#f9e6ff" });
    }
    state.projectiles.push({ kind: "beam", x: tower.x, y: tower.y - 20, tx: target.x, ty: target.y, life: 0.16, color: "#fff27f" });
    audio.sfx("lightning");
    return;
  }

  state.projectiles.push({
    kind: def.projectile,
    x: tower.x,
    y: tower.y - 24,
    target,
    speed: def.projectile === "shell" || def.projectile === "grenade" ? 430 : 620,
    damage: stats.damage,
    splash: stats.splash,
    slow: def.slow,
    slowTime: def.slowTime,
    burn: def.burn,
    burnTime: def.burnTime,
    source: tower.type === "archer" ? "basic" : "magic",
    color: def.color,
  });
  audio.sfx(tower.type === "cannon" || tower.type === "grenade" ? "cannon" : tower.type === "frost" ? "frost" : tower.type === "archer" ? "arrow" : "hit");
}

function hitProjectile(p) {
  if (!p.target) return;
  const x = p.target.x;
  const y = p.target.y;
  if (p.splash) {
    for (const e of [...state.enemies]) {
      if (dist({ x, y }, e) <= p.splash) {
        damageEnemy(e, p.damage, p.source);
        if (p.slow) {
          e.slow = p.slow;
          e.slowTimer = p.slowTime;
        }
        if (p.burn) {
          e.burnDps = p.burn;
          e.burnTimer = p.burnTime;
        }
      }
    }
    burst(x, y, p.kind === "frost" ? 24 : p.kind === "grenade" ? 30 : 18, p.color);
  } else {
    damageEnemy(p.target, p.damage, p.source);
    if (p.burn) {
      p.target.burnDps = p.burn;
      p.target.burnTimer = p.burnTime;
      burst(x, y, 8, "#ffb13b");
    }
  }
}

function update(dt) {
  if (state.paused || state.stagePicker || state.gameEnded) {
    audio.update(dt);
    return;
  }

  const step = dt * state.speed;
  audio.update(step);

  if (state.waveActive && state.spawnQueue.length) {
    state.spawnTimer -= step;
    if (state.spawnTimer <= 0) {
      const next = state.spawnQueue.shift();
      spawnEnemy(next.type);
      state.spawnTimer = next.delay;
    }
  }

  for (const e of [...state.enemies]) {
    e.wobble += step * 7;
    if (e.slowTimer > 0) {
      e.slowTimer -= step;
      if (e.slowTimer <= 0) e.slow = 1;
    }
    if (e.burnTimer > 0) {
      e.burnTimer -= step;
      damageEnemy(e, e.burnDps * step, "magic");
      if (!state.enemies.includes(e)) continue;
    }
    e.hitFlash = Math.max(0, e.hitFlash - step);
    e.progress += ((e.speed * e.slow) / pathLength) * step;
    const p = pointAt(e.progress);
    e.x = p.x;
    e.y = p.y + (e.kind === "flying" ? Math.sin(e.wobble) * 12 - 36 : Math.sin(e.wobble) * 2);
    e.angle = p.angle;
    if (e.progress >= 1) {
      state.enemies = state.enemies.filter((x) => x !== e);
      state.lives -= e.boss ? 5 : 1;
      burst(W - 55, 510, e.boss ? 30 : 12, "#e96b73");
      audio.sfx("hit");
      if (state.lives <= 0) endGame(false);
      updateUi();
    }
  }

  for (const t of state.towers) {
    t.cooldown -= step;
    t.pulse = Math.max(0, t.pulse - step);
    if (t.cooldown <= 0) {
      const target = findTarget(t);
      if (target) fireTower(t, target);
    }
  }

  for (const p of [...state.projectiles]) {
    if (p.kind === "beam") {
      p.life -= step;
      if (p.life <= 0) state.projectiles = state.projectiles.filter((x) => x !== p);
      continue;
    }
    if (!p.target || !state.enemies.includes(p.target)) {
      state.projectiles = state.projectiles.filter((x) => x !== p);
      continue;
    }
    const a = Math.atan2(p.target.y - p.y, p.target.x - p.x);
    p.x += Math.cos(a) * p.speed * step;
    p.y += Math.sin(a) * p.speed * step;
    p.angle = a;
    if (dist(p, p.target) < 18) {
      hitProjectile(p);
      state.projectiles = state.projectiles.filter((x) => x !== p);
    }
  }

  for (const fx of [...state.particles]) {
    fx.life -= step;
    fx.x += fx.vx * step;
    fx.y += fx.vy * step;
    fx.vy += 120 * step;
    if (fx.life <= 0) state.particles = state.particles.filter((x) => x !== fx);
  }
  for (const f of [...state.floaters]) {
    f.life -= step;
    f.y -= 42 * step;
    if (f.life <= 0) state.floaters = state.floaters.filter((x) => x !== f);
  }

  if (state.waveActive && !state.spawnQueue.length && state.enemies.length === 0) {
    state.waveActive = false;
    state.waveIndex++;
    state.coins += 35 + state.stageIndex * 12;
    audio.sfx("coin");
    if (state.waveIndex >= currentStage().waves.length) {
      stageClear();
    } else {
      showToast("Wave cleared. Spend coins before the next one.");
    }
    updateUi();
  }
}

function stageClear() {
  audio.sfx("clear");
  tallyCurrentStage();
  const nextStage = Math.min(stages.length - 1, state.stageIndex + 1);
  state.maxStage = Math.max(state.maxStage, nextStage);
  if (state.stageIndex >= stages.length - 1) return endGame(true);
  showToast(`Stage clear! ${stages[nextStage].unlockText}`);
  state.stageIndex = nextStage;
  state.stagePicker = true;
  setTimeout(() => openStageMap(), 950);
}

function endGame(won) {
  state.gameEnded = true;
  ui.gameOver.classList.remove("hidden");
  ui.endKicker.textContent = won ? "Bloomguard is safe and sparkling" : "The gate needs patching";
  ui.endTitle.textContent = won ? "Adventure Complete" : "Game Over";
  ui.endText.textContent = won ? "You cleared all 8 stages. Your final score and enemy elimination rate are below." : "Too many mischievous visitors reached the castle gate.";
  ui.scoreForm?.classList.add("hidden");
  if (won) {
    state.finalScore = calculateFinalScore();
    const killPct = state.runTotal ? Math.round((state.runKilled / state.runTotal) * 100) : 0;
    ui.finalStats.classList.remove("hidden");
    ui.finalStats.innerHTML = `
      <div><span>Your Score</span>${state.finalScore.toLocaleString()}</div>
      <div><span>Enemies</span>${state.runKilled}/${state.runTotal}</div>
      <div><span>Eliminated</span>${killPct}%</div>
    `;
    renderLeaderboard();
    if (isTopScore(state.finalScore)) {
      ui.scoreForm.classList.remove("hidden");
      ui.playerName.value = "";
      setTimeout(() => ui.playerName.focus(), 50);
    }
  } else {
    ui.finalStats?.classList.add("hidden");
    renderLeaderboard();
  }
  audio.sfx(won ? "clear" : "over");
}

function showToast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => ui.toast.classList.add("hidden"), 2300);
}

function updateUi() {
  ui.lives.textContent = Math.max(0, state.lives);
  ui.coins.textContent = state.coins;
  ui.stage.textContent = state.stageIndex + 1;
  ui.wave.textContent = `${Math.min(state.waveIndex + (state.waveActive ? 1 : 0), currentStage().waves.length)}/${currentStage().waves.length}`;
  ui.preview.textContent = state.waveActive ? "Wave in progress" : waveSummary();
  ui.startWave.disabled = state.waveActive || state.stagePicker || state.gameEnded || state.waveIndex >= currentStage().waves.length;
  ui.restartStage.disabled = state.stagePicker || state.gameEnded;
  ui.pause.textContent = state.paused ? "▶" : "Ⅱ";
  ui.speed.textContent = `${state.speed}x`;
  renderTowerButtons();
  renderInspect();
}

function renderTowerButtons() {
  ui.towerButtons.innerHTML = "";
  for (const [key, def] of Object.entries(towerTypes)) {
    const unlocked = def.unlock <= state.stageIndex + 1;
    const btn = document.createElement("button");
    btn.className = `tower-btn ${state.placing && state.selectedTowerType === key ? "active" : ""}`;
    btn.disabled = !unlocked;
    btn.innerHTML = `
      <span class="tower-icon" style="background:${def.color}">${def.icon}</span>
      <span>${def.name}<small>${unlocked ? def.desc : `Unlocks stage ${def.unlock}`}</small></span>
      <strong>${def.cost}</strong>
    `;
    btn.addEventListener("click", () => {
      state.selectedTower = null;
      state.selectedTowerType = key;
      state.placing = true;
      updateUi();
    });
    ui.towerButtons.appendChild(btn);
  }
}

function renderInspect() {
  if (state.selectedTower) {
    const t = state.selectedTower;
    const def = towerTypes[t.type];
    const stats = towerStats(t);
    const upCost = Math.round(def.cost * (0.72 + t.level * 0.58));
    ui.inspect.innerHTML = `
      <h2>${def.name} Lv ${t.level}</h2>
      <p>Damage ${Math.round(stats.damage)} · Range ${Math.round(stats.range)} · ${def.desc}</p>
      <button id="upgrade" class="primary">${t.level >= 3 ? "Max Level" : `Upgrade ${upCost}`}</button>
      <button id="sell">Sell Tower</button>
    `;
    document.getElementById("upgrade").disabled = t.level >= 3 || state.coins < upCost;
    document.getElementById("upgrade").addEventListener("click", () => upgradeTower(t));
    document.getElementById("sell").addEventListener("click", () => sellTower(t));
  } else {
    const def = towerTypes[state.selectedTowerType];
    ui.inspect.innerHTML = `
      <h2>${def.name}</h2>
      <p>${def.desc}. Cost ${def.cost}. Place it on any glowing stump flag.</p>
    `;
  }
}

function openStageMap() {
  state.stagePicker = true;
  ui.stageMap.classList.remove("hidden");
  ui.stageNodes.innerHTML = "";
  stages.forEach((st, i) => {
    const btn = document.createElement("button");
    btn.className = `stage-node ${i === state.stageIndex ? "active" : ""} ${i > state.maxStage ? "locked" : ""}`;
    btn.disabled = i > state.maxStage;
    btn.innerHTML = `<strong>${i + 1}</strong><br>${st.name}<br><small>${st.unlockText}</small>`;
    btn.addEventListener("click", () => {
      state.stageIndex = i;
      [...ui.stageNodes.children].forEach((n) => n.classList.remove("active"));
      btn.classList.add("active");
    });
    ui.stageNodes.appendChild(btn);
  });
}

function closeStageMap() {
  resetForStage(state.stageIndex);
  state.stagePicker = false;
  ui.stageMap.classList.add("hidden");
  updateUi();
}

function screenToGame(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * W,
    y: ((evt.clientY - rect.top) / rect.height) * H,
  };
}

function handlePointer(evt) {
  const p = screenToGame(evt);
  state.mouse = p;
  const clickedTower = state.towers.find((t) => dist(t, p) < 34);
  if (clickedTower) {
    state.selectedTower = clickedTower;
    state.placing = false;
    updateUi();
    return;
  }
  if (state.placing) {
    const spot = buildSpots.find((s) => !s.tower && dist(s, p) < 34);
    if (spot) placeTower(spot, state.selectedTowerType);
    return;
  }
  state.selectedTower = null;
  updateUi();
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();
}

function drawMap() {
  const layout = stageLayouts[state.stageIndex % stageLayouts.length];
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, layout.ground[0]);
  sky.addColorStop(1, layout.ground[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let y = 30; y < H; y += 56) {
    for (let x = 20; x < W; x += 70) {
      ctx.fillStyle = (x + y) % 3 ? "#efff9a" : "#4aa857";
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(y) * 8, y, 6, 2, -0.5, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  drawRiver();
  drawPath();
  drawScenery();
  drawBase();
  drawBuildSpots();
}

function drawRiver() {
  const layout = stageLayouts[state.stageIndex % stageLayouts.length];
  ctx.save();
  ctx.beginPath();
  if (layout.river === "left") {
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(85, 160, 42, 315, 115, 520);
    ctx.bezierCurveTo(150, 620, 90, 690, 150, 760);
    ctx.lineTo(0, 760);
  } else if (layout.river === "middle") {
    ctx.moveTo(0, 640);
    ctx.bezierCurveTo(260, 540, 370, 625, 520, 520);
    ctx.bezierCurveTo(710, 385, 850, 470, 1280, 285);
    ctx.lineTo(1280, 410);
    ctx.bezierCurveTo(880, 555, 710, 505, 545, 635);
    ctx.bezierCurveTo(380, 760, 220, 690, 0, 735);
  } else if (layout.river === "islands") {
    ctx.moveTo(0, 620);
    ctx.bezierCurveTo(220, 530, 360, 675, 535, 555);
    ctx.bezierCurveTo(695, 445, 850, 600, 1280, 455);
    ctx.lineTo(1280, 760);
    ctx.lineTo(0, 760);
    ctx.moveTo(875, 70);
    ctx.bezierCurveTo(1000, 20, 1140, 85, 1280, 35);
    ctx.lineTo(1280, 0);
    ctx.lineTo(875, 0);
  } else if (layout.river === "top") {
    ctx.moveTo(0, 0);
    ctx.lineTo(1280, 0);
    ctx.lineTo(1280, 135);
    ctx.bezierCurveTo(980, 210, 720, 55, 490, 155);
    ctx.bezierCurveTo(285, 245, 120, 105, 0, 185);
  } else if (layout.river === "cross") {
    ctx.moveTo(0, 705);
    ctx.bezierCurveTo(310, 570, 430, 675, 600, 530);
    ctx.bezierCurveTo(760, 395, 910, 500, 1280, 365);
    ctx.lineTo(1280, 480);
    ctx.bezierCurveTo(930, 610, 760, 525, 625, 650);
    ctx.bezierCurveTo(470, 790, 260, 690, 0, 760);
    ctx.moveTo(1030, 0);
    ctx.bezierCurveTo(960, 160, 1055, 255, 980, 405);
    ctx.lineTo(1085, 385);
    ctx.bezierCurveTo(1165, 245, 1080, 130, 1160, 0);
  } else {
    ctx.moveTo(0, 670);
    ctx.bezierCurveTo(250, 590, 370, 720, 560, 650);
    ctx.bezierCurveTo(760, 575, 910, 690, 1280, 600);
    ctx.lineTo(1280, 760);
    ctx.lineTo(0, 760);
  }
  ctx.closePath();
  ctx.fillStyle = "#76d8e7";
  ctx.fill();
  ctx.strokeStyle = "#e9ffff";
  ctx.lineWidth = 5;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.restore();
}

function drawPath() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#8f653e";
  ctx.lineWidth = 84;
  ctx.beginPath();
  path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.strokeStyle = "#d9a35f";
  ctx.lineWidth = 70;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,230,0.34)";
  ctx.lineWidth = 4;
  ctx.setLineDash([16, 22]);
  ctx.stroke();
  ctx.restore();
}

function drawScenery() {
  const trees = [
    [75, 62], [80, 305], [340, 70], [415, 505], [720, 90], [855, 120], [1070, 125],
    [1210, 260], [100, 525], [1180, 92], [760, 610], [1140, 690],
  ];
  for (const [x, y] of trees) drawTree(x, y);
  const props = [[530, 70, "tent"], [1180, 410, "barrel"], [325, 585, "fence"], [930, 190, "rocks"], [82, 430, "flowers"], [1030, 655, "flowers"]];
  props.forEach(([x, y, type]) => {
    if (type === "tent") drawTent(x, y);
    if (type === "barrel") drawBarrel(x, y);
    if (type === "fence") drawFence(x, y);
    if (type === "rocks") drawRocks(x, y);
    if (type === "flowers") drawFlowers(x, y);
  });
}

function drawTree(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#8e623f";
  ctx.strokeStyle = "#5e472e";
  ctx.lineWidth = 3;
  ctx.fillRect(-8, 20, 16, 38);
  ctx.strokeRect(-8, 20, 16, 38);
  ["#4ea64e", "#67bd56", "#3f9144"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc((i - 1) * 14, 14 - i * 8, 30 - i * 2, 0, TAU);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function drawTent(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f4d16c";
  ctx.strokeStyle = "#6e5530";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-42, 42);
  ctx.lineTo(0, -22);
  ctx.lineTo(46, 42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#df6f5d";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(16, 42);
  ctx.lineTo(-12, 42);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBarrel(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#b36b39";
  ctx.strokeStyle = "#654027";
  ctx.lineWidth = 3;
  drawRoundedRect(-18, -20, 36, 42, 8);
  ctx.strokeStyle = "#f6cf79";
  ctx.beginPath();
  ctx.moveTo(-18, -7);
  ctx.lineTo(18, -7);
  ctx.moveTo(-18, 12);
  ctx.lineTo(18, 12);
  ctx.stroke();
  ctx.restore();
}

function drawFence(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#805833";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 24, -20);
    ctx.lineTo(i * 24, 26);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.lineTo(108, -14);
  ctx.moveTo(-12, 18);
  ctx.lineTo(108, 8);
  ctx.stroke();
  ctx.restore();
}

function drawRocks(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#9cab9c";
  ctx.strokeStyle = "#657865";
  ctx.lineWidth = 3;
  [[0, 0, 20], [24, 8, 15], [-22, 12, 14]].forEach(([rx, ry, r]) => {
    ctx.beginPath();
    ctx.ellipse(rx, ry, r, r * 0.72, -0.2, 0, TAU);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function drawFlowers(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ["#ff7ca3", "#fff067", "#a67bff", "#ffffff"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc((i % 2) * 24, Math.floor(i / 2) * 20, 6, 0, TAU);
    ctx.fill();
  });
  ctx.restore();
}

function drawBase() {
  ctx.save();
  ctx.translate(1215, 504);
  ctx.fillStyle = "#eedaa7";
  ctx.strokeStyle = "#6e6448";
  ctx.lineWidth = 5;
  drawRoundedRect(-28, -52, 86, 92, 8);
  ctx.fillStyle = "#df7c68";
  ctx.beginPath();
  ctx.moveTo(-38, -48);
  ctx.lineTo(15, -92);
  ctx.lineTo(70, -48);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#7f5b42";
  drawRoundedRect(2, -3, 26, 43, 7);
  ctx.restore();
}

function drawBuildSpots() {
  for (const s of buildSpots) {
    if (s.tower) continue;
    const hover = dist(state.mouse, s) < 34;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.fillStyle = hover && state.placing ? "rgba(255,255,190,0.8)" : "rgba(255,245,166,0.52)";
    ctx.strokeStyle = "#8b7242";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8b5a35";
    ctx.fillRect(-5, -24, 10, 24);
    ctx.fillStyle = "#ffdc6e";
    ctx.beginPath();
    ctx.moveTo(5, -22);
    ctx.lineTo(30, -14);
    ctx.lineTo(5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawTower(t) {
  const def = towerTypes[t.type];
  const scale = 1 + (t.level - 1) * 0.13 + t.pulse * 0.22;
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(52, 48, 32, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 25, 32, 14, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#b9834a";
  ctx.strokeStyle = "#5e4a32";
  ctx.lineWidth = 4;
  drawRoundedRect(-24, -24, 48, 52, 8);
  ctx.fillStyle = def.color;
  if (t.type === "cannon") {
    ctx.rotate(t.angle);
    drawRoundedRect(-4, -10, 46, 20, 8);
  } else if (t.type === "grenade") {
    ctx.rotate(t.angle);
    drawRoundedRect(-10, -12, 40, 24, 8);
    ctx.beginPath();
    ctx.arc(34, 0, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff0a6";
    ctx.beginPath();
    ctx.arc(-14, 0, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();
  } else if (t.type === "crystal") {
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(24, -22);
    ctx.lineTo(0, 5);
    ctx.lineTo(-24, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (t.type === "turret") {
    ctx.rotate(t.angle);
    drawRoundedRect(-8, -12, 44, 12, 4);
    drawRoundedRect(-8, 3, 44, 12, 4);
  } else {
    ctx.beginPath();
    ctx.arc(0, -30, 25, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff8c7";
    ctx.font = "800 24px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(def.icon, 0, -30);
  }
  ctx.restore();

  if (state.selectedTower === t) {
    const stats = towerStats(t);
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, stats.range, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.restore();
  }
}

function getEnemyPortrait(enemy) {
  const index = enemyPortraitByType[enemy.type] ?? 0;
  const img = enemyPortraits[index];
  return img && img.complete && !img.failed && img.naturalWidth > 0 ? img : null;
}

function drawEnemy(e) {
  drawEnemyPortrait(e, getEnemyPortrait(e));
  return;

  ctx.save();
  ctx.translate(e.x, e.y);
  if (e.kind === "ground") ctx.rotate(Math.sin(e.wobble) * 0.08);
  const s = e.boss ? 1.8 : e.type === "brute" ? 1.25 : 1;
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(46, 39, 27, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 20, 22, 8, 0, 0, TAU);
  ctx.fill();
  if (e.kind === "flying") {
    ctx.fillStyle = "#e8f9ff";
    ctx.beginPath();
    ctx.ellipse(-22, -5, 18, 10, Math.sin(e.wobble) * 0.4, 0, TAU);
    ctx.ellipse(22, -5, 18, 10, -Math.sin(e.wobble) * 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = e.hitFlash > 0 ? "#fff7d5" : e.color;
  ctx.strokeStyle = "#38513a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 25, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  if (e.armor || e.resistBasic) {
    ctx.fillStyle = "rgba(230,245,255,0.7)";
    ctx.beginPath();
    ctx.arc(0, -3, 25, Math.PI * 0.15, Math.PI * 0.85);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-8, -5, 6, 0, TAU);
  ctx.arc(8, -5, 6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#26352b";
  ctx.beginPath();
  ctx.arc(-7, -4, 2.6, 0, TAU);
  ctx.arc(9, -4, 2.6, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#26352b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 7, 8, 0.1, Math.PI - 0.1);
  ctx.stroke();
  if (e.slow < 1) {
    ctx.strokeStyle = "#dffbff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, TAU);
    ctx.stroke();
  }
  if (e.burnTimer > 0) {
    ctx.fillStyle = "#ffb13b";
    ctx.beginPath();
    ctx.arc(12, -24, 6 + Math.sin(e.wobble) * 2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  const w = e.boss ? 72 : 42;
  ctx.fillStyle = "rgba(70,40,30,0.38)";
  ctx.fillRect(e.x - w / 2, e.y - (e.boss ? 62 : 42), w, 7);
  ctx.fillStyle = e.hp / e.maxHp > 0.45 ? "#7ee05f" : "#f0735f";
  ctx.fillRect(e.x - w / 2, e.y - (e.boss ? 62 : 42), w * clamp(e.hp / e.maxHp, 0, 1), 7);
}

function drawEnemyPortrait(e, img) {
  const portraitIndex = enemyPortraitByType[e.type] ?? 0;
  const fallback = fallbackPortraits[portraitIndex];
  const bob = Math.sin(e.wobble) * (e.kind === "flying" ? 5 : 2);
  const radius = e.boss ? 56 : e.type === "brute" ? 42 : 34;
  const y = e.y + bob;

  ctx.save();
  ctx.fillStyle = "rgba(46, 39, 27, 0.2)";
  ctx.beginPath();
  ctx.ellipse(e.x, e.y + radius * 0.78, radius * 0.9, radius * 0.3, 0, 0, TAU);
  ctx.fill();

  if (e.kind === "flying") {
    ctx.fillStyle = "#e8f9ff";
    ctx.strokeStyle = "#5f7f89";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(e.x - radius * 0.8, y, radius * 0.55, radius * 0.28, Math.sin(e.wobble) * 0.4, 0, TAU);
    ctx.ellipse(e.x + radius * 0.8, y, radius * 0.55, radius * 0.28, -Math.sin(e.wobble) * 0.4, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(e.x, y, radius + 5, 0, TAU);
  ctx.clip();
  if (img) {
    drawPortraitImageCover(img, e.x, y, radius + 5);
  } else {
    drawFallbackPortrait(e.x, y, radius + 5, fallback);
  }
  if (e.hitFlash > 0) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff7d5";
    ctx.fillRect(e.x - radius - 5, y - radius - 5, (radius + 5) * 2, (radius + 5) * 2);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  ctx.lineWidth = e.boss ? 6 : 4;
  ctx.strokeStyle = e.slow < 1 ? "#dffbff" : e.boss ? "#6d4a22" : "#222629";
  ctx.beginPath();
  ctx.arc(e.x, y, radius + 2, 0, TAU);
  ctx.stroke();

  if (e.armor || e.resistBasic) {
    ctx.strokeStyle = "rgba(230,245,255,0.85)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(e.x, y, radius + 8, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }

  if (e.burnTimer > 0) {
    ctx.fillStyle = "#ffb13b";
    ctx.beginPath();
    ctx.arc(e.x + radius * 0.48, y - radius * 0.82, 6 + Math.sin(e.wobble) * 2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  const w = e.boss ? 88 : e.type === "brute" ? 58 : 50;
  ctx.fillStyle = "rgba(70,40,30,0.38)";
  ctx.fillRect(e.x - w / 2, e.y - (e.boss ? 88 : e.type === "brute" ? 64 : 56), w, 7);
  ctx.fillStyle = e.hp / e.maxHp > 0.45 ? "#7ee05f" : "#f0735f";
  ctx.fillRect(e.x - w / 2, e.y - (e.boss ? 88 : e.type === "brute" ? 64 : 56), w * clamp(e.hp / e.maxHp, 0, 1), 7);
}

function drawPortraitImageCover(img, x, y, radius) {
  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;
  const sourceSize = Math.min(naturalWidth, naturalHeight);
  const sx = Math.max(0, (naturalWidth - sourceSize) / 2);
  const sy = 0;
  ctx.drawImage(img, sx, sy, sourceSize, sourceSize, x - radius, y - radius, radius * 2, radius * 2);
}

function drawFallbackPortrait(x, y, radius, portrait) {
  const grad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  grad.addColorStop(0, "#fff2d3");
  grad.addColorStop(1, portrait.skin);
  ctx.fillStyle = grad;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

  ctx.fillStyle = portrait.hair;
  ctx.beginPath();
  ctx.ellipse(x, y - radius * 0.48, radius * 0.78, radius * 0.38, 0, Math.PI, TAU);
  ctx.fill();

  ctx.fillStyle = portrait.accent;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.roundRect(x - radius * 0.55, y - radius * 0.1, radius * 1.1, radius * 0.26, 6);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#2b201b";
  ctx.beginPath();
  ctx.arc(x - radius * 0.26, y - radius * 0.05, radius * 0.07, 0, TAU);
  ctx.arc(x + radius * 0.26, y - radius * 0.05, radius * 0.07, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#5f2c2f";
  ctx.lineWidth = Math.max(2, radius * 0.08);
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.28, radius * 0.22, 0.1, Math.PI - 0.1);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `900 ${Math.max(12, radius * 0.55)}px Trebuchet MS`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(portrait.label, x, y + radius * 0.62);
}

function drawProjectile(p) {
  ctx.save();
  if (p.kind === "beam") {
    ctx.globalAlpha = clamp(p.life / 0.16, 0, 1);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.tx, p.ty);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle || 0);
  ctx.fillStyle = p.color;
  ctx.strokeStyle = "#5b4935";
  ctx.lineWidth = 2;
  if (p.kind === "arrow") {
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-12, -5);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, p.kind === "shell" || p.kind === "grenade" ? 10 : 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    if (p.kind === "grenade") {
      ctx.fillStyle = "#fff0a6";
      ctx.beginPath();
      ctx.arc(3, -3, 3, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawEffects() {
  for (const fx of state.particles) {
    ctx.save();
    ctx.globalAlpha = clamp(fx.life / fx.max, 0, 1);
    ctx.fillStyle = fx.color;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, fx.r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  for (const f of state.floaters) {
    ctx.save();
    ctx.globalAlpha = clamp(f.life / f.max, 0, 1);
    ctx.fillStyle = f.color;
    ctx.strokeStyle = "rgba(53,52,34,0.5)";
    ctx.lineWidth = 3;
    ctx.font = "900 20px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawMap();
  state.towers.forEach(drawTower);
  [...state.enemies].sort((a, b) => a.y - b.y).forEach(drawEnemy);
  state.projectiles.forEach(drawProjectile);
  drawEffects();

  if (state.placing && !state.stagePicker) {
    const def = towerTypes[state.selectedTowerType];
    const spot = buildSpots.find((s) => !s.tower && dist(s, state.mouse) < 34);
    if (spot) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, def.range, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  if (state.paused && !state.stagePicker) {
    ctx.save();
    ctx.fillStyle = "rgba(39,57,39,0.35)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff9df";
    ctx.font = "900 56px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("Paused", W / 2, H / 2);
    ctx.restore();
  }
}

function loop(t) {
  const dt = Math.min(0.05, (t - state.last) / 1000 || 0);
  state.last = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

ui.startWave.addEventListener("click", startWave);
ui.pause.addEventListener("click", () => {
  state.paused = !state.paused;
  updateUi();
});
window.addEventListener("keydown", (evt) => {
  if (evt.code !== "Space" || state.stagePicker || state.gameEnded) return;
  const tag = document.activeElement?.tagName;
  if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  evt.preventDefault();
  state.paused = !state.paused;
  updateUi();
});
ui.speed.addEventListener("click", () => {
  state.speed = state.speed === 1 ? 2 : state.speed === 2 ? 3 : 1;
  updateUi();
});
ui.restartStage.addEventListener("click", restartCurrentStage);
ui.music.addEventListener("click", () => {
  if (!audio.ctx || !audio.enabled) {
    audio.init();
    showToast("Music and sound are awake");
  } else {
    audio.enabled = false;
    showToast("Music and sound are resting");
  }
});
ui.beginStage.addEventListener("click", closeStageMap);
ui.scoreForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const name = ui.playerName.value.trim() || "Player";
  const killPct = state.runTotal ? Math.round((state.runKilled / state.runTotal) * 100) : 0;
  const scores = loadLeaderboard();
  scores.push({
    name,
    score: state.finalScore,
    killPct,
    date: new Date().toISOString(),
  });
  scores.sort((a, b) => b.score - a.score);
  saveLeaderboard(scores);
  ui.scoreForm.classList.add("hidden");
  renderLeaderboard(scores.slice(0, 10));
  showToast("Score saved to the leaderboard");
});
ui.restart.addEventListener("click", () => {
  state.stageIndex = 0;
  state.maxStage = 0;
  resetRunStats();
  resetForStage(0);
  openStageMap();
});
canvas.addEventListener("pointerdown", handlePointer);
canvas.addEventListener("pointermove", (evt) => {
  state.mouse = screenToGame(evt);
});
window.addEventListener("resize", resize);

resize();
resetRunStats();
resetForStage(0);
openStageMap();
requestAnimationFrame(loop);
