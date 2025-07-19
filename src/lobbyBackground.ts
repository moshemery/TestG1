import { Star, createStar, updateStars, drawStars } from './background.js';
import { SCALE } from './config.js';

interface DemoObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface DemoAsteroid {
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
}

const enemyImage = new Image();
enemyImage.src = 'resources/enemy.png';
const asteroidImage = new Image();
asteroidImage.src = 'resources/stroid2.png';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let canvasWidth = 0;
let canvasHeight = 0;
let rafId: number | null = null;

const stars: Star[] = [];
const obstacles: DemoObstacle[] = [];
const asteroids: DemoAsteroid[] = [];

function spawnObstacle() {
  const width = 40 * SCALE;
  const height = 40 * SCALE;
  const x = Math.random() * (canvasWidth - width);
  const speed = 4 + Math.random() * 2;
  obstacles.push({ x, y: -height, width, height, speed });
}

function spawnAsteroid() {
  const width = 60 * SCALE;
  const height = 40 * SCALE;
  const x = Math.random() * (canvasWidth - width);
  const y = -height;
  const speedY = 8 + Math.random() * 4;
  const speedX = (Math.random() - 0.5) * 8;
  asteroids.push({ x, y, width, height, speedX, speedY });
}

function update() {
  updateStars(stars, canvasWidth, canvasHeight, 2);

  if (Math.random() < 0.02) spawnObstacle();
  if (Math.random() < 0.005) spawnAsteroid();

  obstacles.forEach(o => {
    o.y += o.speed;
  });
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].y > canvasHeight + obstacles[i].height) {
      obstacles.splice(i, 1);
    }
  }

  asteroids.forEach(a => {
    a.x += a.speedX;
    a.y += a.speedY;
  });
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    if (a.x > canvasWidth + a.width || a.x < -a.width || a.y > canvasHeight + a.height) {
      asteroids.splice(i, 1);
    }
  }
}

function draw() {
  if (!ctx) return;
  const c = ctx;
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvasWidth, canvasHeight);

  drawStars(c, stars);

  obstacles.forEach(o => {
    c.drawImage(enemyImage, o.x, o.y, o.width, o.height);
  });

  asteroids.forEach(a => {
    c.save();
    const cx = a.x + a.width / 2;
    const cy = a.y + a.height / 2;
    c.translate(cx, cy);
    const angle = Math.atan2(a.speedY, a.speedX);
    c.rotate(angle);
    c.drawImage(asteroidImage, -a.width / 2, -a.height / 2, a.width, a.height);
    c.restore();
  });
}

function loop() {
  update();
  draw();
  rafId = requestAnimationFrame(loop);
}

export function startLobbyBackground() {
  canvas = document.getElementById('lobby-bg') as HTMLCanvasElement | null;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  canvas.style.display = 'block';

  stars.length = 0;
  obstacles.length = 0;
  asteroids.length = 0;
  for (let i = 0; i < 100; i++) {
    stars.push(createStar(canvasWidth, canvasHeight, 2));
  }

  loop();
}

export function stopLobbyBackground() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (canvas) {
    canvas.style.display = 'none';
  }
}

