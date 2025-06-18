import { Spaceship, drawSpaceship } from './spaceship.js';
import { Star, createStar, updateStars, drawStars } from './background.js';
import { obstacles, missiles, spawnObstacle, fireMissile, updateObstacles, updateMissiles, drawMissiles, drawObstacles } from './enemy.js';
import { scoreboard, sendScoreToAirtable, fetchTopScores, displayScores } from './scoreboard.js';
import { drawTopInfo } from './topInfo.js';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const nameModal = document.getElementById('name-modal') as HTMLDivElement;
const nameForm = document.getElementById('name-form') as HTMLFormElement;
const nameInput = document.getElementById('username-input') as HTMLInputElement;
const ctx = canvas.getContext('2d')!;

const canvasWidth = (canvas.width = window.innerWidth);
const canvasHeight = (canvas.height = window.innerHeight);

const PLAYER_NAME_KEY = 'playerName';
const HIGH_SCORE_KEY = 'highScore';
let playerName: string | null = localStorage.getItem(PLAYER_NAME_KEY);
let topScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0');

const friendImage = new Image();
friendImage.src = 'resources/friend.png';
const enemyImage = new Image();
enemyImage.src = 'resources/enemy.png';
const bossImage = new Image();
bossImage.src = 'resources/boss.png';

const explosionSound = new Audio('resources/explosion-80108.mp3');
const laserSound = new Audio('resources/laser-zap-90575.mp3');
const hitSound = new Audio('resources/explosion-322491.mp3');

const spaceship = new Spaceship(canvasWidth, canvasHeight);
const stars: Star[] = [];
for (let i = 0; i < 100; i++) {
  stars.push(createStar(canvasWidth, canvasHeight));
}

let gameOver = false;
let paused = false;
let score = 0;
let lives = 3;
let nextLifeScore = 10;

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
  shipPieces.length = 0;
  freezeEnvironment = false;
  stars.splice(0, stars.length);
  for (let i = 0; i < 100; i++) {
    stars.push(createStar(canvasWidth, canvasHeight));
  }
  spaceship.x = canvasWidth / 2 - spaceship.width / 2;
  gameOver = false;
  paused = false;
  score = 0;
  lives = 3;
  nextLifeScore = 10;
  spawnsUntilBoss.value = Math.floor(Math.random() * 11) + 20;
  explosionTimer = 0;
  scoreboard.style.display = 'none';
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
        obstacles.splice(oi, 1);
        missiles.splice(mi, 1);
        score += 1 + (o.isBoss ? 10 : 0);
        if (score >= nextLifeScore) {
          lives++;
          nextLifeScore += 10;
        }
        break;
      }
    }
  }
}

function update() {
  if (freezeEnvironment) {
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
    spawnObstacle(canvasWidth, spawnsUntilBoss);
  }

  updateObstacles(canvasHeight);
  updateMissiles();
  updateStars(stars, canvasWidth, canvasHeight);
  checkCollisions();
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
  drawObstacles(ctx, enemyImage, bossImage);

  drawTopInfo(ctx, playerName, score, lives, topScore, canvasWidth);

  if (paused && !gameOver) {
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvasWidth / 2, canvasHeight / 2);
  }

  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('New Game', canvasWidth / 2, canvasHeight / 2);
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
  if (e.key === 'ArrowLeft') spaceship.moveLeft();
  if (e.key === 'ArrowRight') spaceship.moveRight();
  if (e.code === 'Space') fireMissile(spaceship, laserSound);
});

window.addEventListener('touchstart', e => {
  if (gameOver) {
    resetGame();
    return;
  }
  if (paused) return;
  const touch = e.touches[0];
  if (touch.clientX < canvasWidth / 2) spaceship.moveLeft();
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

window.addEventListener('deviceorientation', e => {
  if (gameOver || paused) return;
  if (e.gamma == null) return;
  const threshold = 10;
  if (e.gamma > threshold) {
    spaceship.moveRight();
  } else if (e.gamma < -threshold) {
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
