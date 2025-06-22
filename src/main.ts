import { Spaceship, drawSpaceship } from './spaceship.js';
import { Star, createStar, updateStars, drawStars } from './background.js';
import {
  obstacles,
  missiles,
  spawnObstacle,
  fireMissile,
  updateObstacles,
  updateMissiles,
  drawMissiles,
  drawObstacles,
} from './enemy.js';
import {
  asteroids,
  spawnAsteroid,
  updateAsteroids,
  drawAsteroids,
} from './asteroid.js';
import { scoreboard, sendScoreToAirtable, fetchTopScores, displayScores } from './scoreboard.js';
import { drawTopInfo } from './topInfo.js';
import { vrMode, SCALE } from './config.js';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const nameModal = document.getElementById('name-modal') as HTMLDivElement;
const nameForm = document.getElementById('name-form') as HTMLFormElement;
const nameInput = document.getElementById('username-input') as HTMLInputElement;


// Display context always refers to the on-screen canvas
const displayCtx = canvas.getContext('2d')!;

// The actual game may render to an offscreen canvas when VR mode is active
let ctx: CanvasRenderingContext2D = displayCtx;

// Logical game dimensions. In VR mode the game renders at half the screen width
const canvasWidth = vrMode ? window.innerWidth / 2 : window.innerWidth;
const canvasHeight = window.innerHeight;

// Resize the visible canvas to fill the screen
canvas.width = vrMode ? window.innerWidth : canvasWidth;
canvas.height = canvasHeight;

// If in VR mode create an offscreen canvas to render the game once
let offscreenCanvas: HTMLCanvasElement | null = null;
if (vrMode) {
  offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
  ctx = offscreenCanvas.getContext('2d')!;
}

// Determine whether demo mode is active based on query parameter
const params = new URLSearchParams(window.location.search);
const demoMode = params.get('DemoMode') === 'true';
const portalInterval = demoMode ? 10 : 100;

const PLAYER_NAME_KEY = 'playerName';
const HIGH_SCORE_KEY = 'highScore';
let playerName: string | null = localStorage.getItem(PLAYER_NAME_KEY);
let topScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');

const friendImage = new Image();
friendImage.src = 'resources/friend.png';
const enemyImage = new Image();
enemyImage.src = 'resources/enemy.png';
const enemy3Image = new Image();
enemy3Image.src = 'resources/enemy3.png';
const bossImage = new Image();
bossImage.src = 'resources/boss.png';
const portalImage = new Image();
portalImage.src = 'resources/Portal2.png';
const asteroidImage = new Image();
asteroidImage.src = 'resources/stroid2.jpeg';

const explosionSound = new Audio('resources/explosion-80108.mp3');
const laserSound = new Audio('resources/laser-zap-90575.mp3');
const hitSound = new Audio('resources/explosion-322491.mp3');

const spaceship = new Spaceship(canvasWidth, canvasHeight);
// Keyboard controls move the ship twice as far per key press
const KEYBOARD_SPEED_MULTIPLIER = 2;
let stage = 1;
const stars: Star[] = [];
for (let i = 0; i < 100; i++) {
  stars.push(createStar(canvasWidth, canvasHeight, stage));
}

// flying asteroids introduced in later stages


let gameOver = false;
let paused = false;
let score = 0;
let lives = 3;
let nextLifeScore = 10;

interface Portal {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}
let portal: Portal | null = null;
let nextPortalScore = portalInterval;
let levelTransition = false;

interface ExplosionPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}
let enemyExplosions: ExplosionPiece[] = [];

interface ShipPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}
let shipPieces: ShipPiece[] = [];
let explosionTimer = 0;
let freezeEnvironment = false;

const spawnsUntilBoss = { value: Math.floor(Math.random() * 11) + 20 };

function resetGame() {
  obstacles.length = 0;
  missiles.length = 0;
  asteroids.length = 0;
  shipPieces.length = 0;
  enemyExplosions.length = 0;
  freezeEnvironment = false;
  stage = 1;
  stars.splice(0, stars.length);
  for (let i = 0; i < 100; i++) {
    stars.push(createStar(canvasWidth, canvasHeight, stage));
  }
  spaceship.x = canvasWidth / 2 - spaceship.width / 2;
  gameOver = false;
  paused = false;
  score = 0;
  lives = 3;
  nextLifeScore = 10;
  spawnsUntilBoss.value = Math.floor(Math.random() * 11) + 20;
  explosionTimer = 0;
  nextPortalScore = portalInterval;
  scoreboard.style.display = 'none';
  canvas.style.cursor = 'default';
}

function startNextLevel() {
  obstacles.length = 0;
  missiles.length = 0;
  asteroids.length = 0;
  shipPieces.length = 0;
  enemyExplosions.length = 0;
  stage++;
  stars.splice(0, stars.length);
  for (let i = 0; i < 100; i++) {
    stars.push(createStar(canvasWidth, canvasHeight, stage));
  }
  spaceship.x = canvasWidth / 2 - spaceship.width / 2;
  spawnsUntilBoss.value = Math.floor(Math.random() * 11) + 20;
  freezeEnvironment = false;
  levelTransition = false;
  portal = null;
  nextPortalScore += portalInterval;
}

function startShipExplosion() {
  shipPieces = [];
  const pieces = 20;
  for (let i = 0; i < pieces; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    shipPieces.push({
      x: spaceship.x + spaceship.width / 2,
      y: spaceship.y + spaceship.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 2,
    });
  }
  explosionTimer = 60;
  freezeEnvironment = true;
}

function spawnExplosion(x: number, y: number) {
  const pieces = 15;
  for (let i = 0; i < pieces; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 2;
    enemyExplosions.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20,
      maxLife: 20,
      size: Math.random() * 4 + 2,
    });
  }
}

function updateExplosions() {
  for (let i = enemyExplosions.length - 1; i >= 0; i--) {
    const p = enemyExplosions[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life--;
    if (p.life <= 0) {
      enemyExplosions.splice(i, 1);
    }
  }
}

function getExplosionColor(p: ExplosionPiece) {
  const half = p.maxLife / 2;
  if (p.life > half) {
    const t = (p.life - half) / half; // 0..1
    const g = Math.floor(255 * t);
    return `rgb(255,${g},0)`; // yellow -> red
  } else {
    const t = p.life / half; // 0..1
    const r = Math.floor(255 * t);
    return `rgb(${r},0,0)`; // red -> black
  }
}

function drawExplosions(ctx: CanvasRenderingContext2D) {
  enemyExplosions.forEach(p => {
    ctx.fillStyle = getExplosionColor(p);
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
}

function spawnPortal() {
  const width = 80 * SCALE;
  const height = 80 * SCALE;
  const x = Math.random() * (canvasWidth - width);
  const speed = 3;
  portal = { x, y: -height, width, height, speed };
}

function updatePortal() {
  if (!portal) return;
  portal.y += portal.speed;
  if (portal.y > canvasHeight + portal.height) {
    portal = null;
  }
}

function drawPortal(ctx: CanvasRenderingContext2D) {
  if (!portal) return;
  ctx.drawImage(portalImage, portal.x, portal.y, portal.width, portal.height);
}

function checkPortalCollision() {
  if (!portal) return;
  const sx = spaceship.x + spaceship.width / 2;
  const sy = spaceship.y + spaceship.height / 2;
  const px = portal.x + portal.width / 2;
  const py = portal.y + portal.height / 2;
  const dist = Math.hypot(sx - px, sy - py);
  if (dist < Math.min(portal.width, portal.height) / 4) {
    score += 20;
    levelTransition = true;
    freezeEnvironment = true;
    portal = null;
    setTimeout(startNextLevel, 5000);
  }
}

function checkCollisions() {
  for (let oi = obstacles.length - 1; oi >= 0; oi--) {
    const o = obstacles[oi];
    const collide =
      spaceship.x < o.x + o.width &&
      spaceship.x + spaceship.width > o.x &&
      spaceship.y < o.y + o.height &&
      spaceship.y + spaceship.height > o.y;
    if (collide) {
      explosionSound.currentTime = 0;
      explosionSound.play();
      startShipExplosion();
      obstacles.splice(oi, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
        canvas.style.cursor = 'pointer';
        const storedHigh = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');
        if (score > storedHigh) {
          localStorage.setItem(HIGH_SCORE_KEY, String(score));
          topScore = score;
        } else {
          topScore = storedHigh;
        }
        sendScoreToAirtable(score, playerName)
          .then(fetchTopScores)
          .then(displayScores);
      }
      break;
    }
  }
  for (let ai = asteroids.length - 1; ai >= 0; ai--) {
    const a = asteroids[ai];
    const collide =
      spaceship.x < a.x + a.width &&
      spaceship.x + spaceship.width > a.x &&
      spaceship.y < a.y + a.height &&
      spaceship.y + spaceship.height > a.y;
    if (collide) {
      explosionSound.currentTime = 0;
      explosionSound.play();
      startShipExplosion();
      asteroids.splice(ai, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
        canvas.style.cursor = 'pointer';
        const storedHigh = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');
        if (score > storedHigh) {
          localStorage.setItem(HIGH_SCORE_KEY, String(score));
          topScore = score;
        } else {
          topScore = storedHigh;
        }
        sendScoreToAirtable(score, playerName)
          .then(fetchTopScores)
          .then(displayScores);
      }
      break;
    }
  }
  for (let mi = missiles.length - 1; mi >= 0; mi--) {
    const m = missiles[mi];
    for (let oi = obstacles.length - 1; oi >= 0; oi--) {
      const o = obstacles[oi];
      const hit =
        m.x < o.x + o.width &&
        m.x + m.width > o.x &&
        m.y < o.y + o.height &&
        m.y + m.height > o.y;
      if (hit) {
        hitSound.currentTime = 0;
        hitSound.play();
        spawnExplosion(o.x + o.width / 2, o.y + o.height / 2);
        obstacles.splice(oi, 1);
        missiles.splice(mi, 1);
        let points = 1;
        if (o.isBoss) points += 10;
        if (o.isEnemy3) points += 1; // enemy3 gives total 2 points
        score += points;
        if (score >= nextLifeScore) {
          lives++;
          nextLifeScore += 10;
        }
        break;
      }
    }
    for (let ai = asteroids.length - 1; ai >= 0; ai--) {
      const a = asteroids[ai];
      const hit =
        m.x < a.x + a.width &&
        m.x + m.width > a.x &&
        m.y < a.y + a.height &&
        m.y + m.height > a.y;
      if (hit) {
        hitSound.currentTime = 0;
        hitSound.play();
        spawnExplosion(a.x + a.width / 2, a.y + a.height / 2);
        missiles.splice(mi, 1);
        break;
      }
    }
  }
}

function update() {
  if (freezeEnvironment) {
    if (levelTransition) {
      return;
    }
    shipPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
    });
    if (explosionTimer > 0) {
      explosionTimer--;
    } else {
      freezeEnvironment = false;
      shipPieces = [];
      if (!gameOver) {
        spaceship.x = canvasWidth / 2 - spaceship.width / 2;
      }
    }
    return;
  }

  if (gameOver || paused) return;
  if (Math.random() < 0.02) {
    spawnObstacle(canvasWidth, spawnsUntilBoss, stage);
  }

  if (stage >= 2 && Math.random() < 0.005) {
    spawnAsteroid(canvasWidth);
  }

  if (score >= nextPortalScore && !portal) {
    spawnPortal();
  }

  updateObstacles(canvasHeight);
  updateAsteroids(canvasWidth, canvasHeight);
  updateMissiles();
  updatePortal();
  updateExplosions();
  updateStars(stars, canvasWidth, canvasHeight, stage);
  checkCollisions();
  checkPortalCollision();
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  drawStars(ctx, stars);

  if (!freezeEnvironment) {
    drawSpaceship(ctx, spaceship, friendImage);
  } else {
    ctx.fillStyle = 'orange';
    shipPieces.forEach(p => {
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
  }

  drawMissiles(ctx);
  drawObstacles(ctx, enemyImage, bossImage, enemy3Image);
  drawAsteroids(ctx, asteroidImage);
  drawPortal(ctx);
  drawExplosions(ctx);

  drawTopInfo(ctx, playerName, score, lives, topScore, canvasWidth);

  if (levelTransition) {
    ctx.fillStyle = 'white';
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Stage ${stage + 1}`, canvasWidth / 2, canvasHeight / 2);
  }

  if (paused && !gameOver) {
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvasWidth / 2, canvasHeight / 2);
  }

  if (gameOver) {
    const text = 'New Game';
    ctx.fillStyle = 'blue';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - textWidth / 2, canvasHeight / 2 + 5);
    ctx.lineTo(canvasWidth / 2 + textWidth / 2, canvasHeight / 2 + 5);
    ctx.stroke();
  }

  // In VR mode copy the offscreen canvas to two slightly smaller areas on the
  // screen with margins. This provides a more comfortable view when a phone is
  // placed in a headset.
  if (vrMode && offscreenCanvas) {
    displayCtx.fillStyle = 'black';
    displayCtx.fillRect(0, 0, canvas.width, canvas.height);

    const marginX = canvas.width * 0.15;
    const marginY = canvas.height * 0.15;
    const viewWidth = (canvas.width - marginX * 3) / 2;
    const viewHeight = canvas.height - marginY * 2;

    displayCtx.drawImage(
      offscreenCanvas,
      marginX,
      marginY,
      viewWidth,
      viewHeight
    );
    displayCtx.drawImage(
      offscreenCanvas,
      marginX * 2 + viewWidth,
      marginY,
      viewWidth,
      viewHeight
    );
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

window.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'Enter') {
    paused = !paused;
    return;
  }
  if (paused) return;
  if (e.key === 'ArrowLeft') spaceship.moveLeft(KEYBOARD_SPEED_MULTIPLIER);
  if (e.key === 'ArrowRight') spaceship.moveRight(KEYBOARD_SPEED_MULTIPLIER);
  if (e.code === 'Space') fireMissile(spaceship, laserSound);
});

window.addEventListener('touchstart', e => {
  if (gameOver) {
    resetGame();
    return;
  }
  if (paused) return;
  const touch = e.touches[0];
  const half = vrMode ? window.innerWidth / 2 : canvasWidth / 2;
  if (touch.clientX < half) spaceship.moveLeft();
  else spaceship.moveRight();
});

window.addEventListener('click', () => {
  if (gameOver) {
    resetGame();
    return;
  }
  if (paused) return;
  fireMissile(spaceship, laserSound);
});

// Allow tilting the device to steer the ship. When the device is held
// horizontally the `gamma` value no longer represents the left/right tilt, so
// we switch to using `beta` instead. This ensures the ship can be moved in both
// portrait and landscape orientations.
window.addEventListener('deviceorientation', e => {
  if (gameOver || paused) return;
  const isLandscape = window.innerWidth > window.innerHeight;
  let tilt = isLandscape ? e.beta : e.gamma;
  if (tilt == null) return;
  if (vrMode) tilt = -tilt;
  const threshold = 10;
  if (tilt > threshold) {
    spaceship.moveRight();
  } else if (tilt < -threshold) {
    spaceship.moveLeft();
  }
});


if (!playerName) {
  paused = true;
  nameModal.style.display = 'block';
}

nameForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (name) {
    playerName = name;
    localStorage.setItem(PLAYER_NAME_KEY, name);
    topScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');
    nameModal.style.display = 'none';
    paused = false;
  }
});
