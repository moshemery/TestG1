const canvas = document.getElementById('game') as HTMLCanvasElement;
const restartButton = document.getElementById('restart') as HTMLButtonElement;
const ctx = canvas.getContext('2d')!;

const canvasWidth = canvas.width = window.innerWidth;
const canvasHeight = canvas.height = window.innerHeight;

const friendImage = new Image();
friendImage.src = 'resources/friend.png';

const enemyImage = new Image();
enemyImage.src = 'resources/enemy.png';

// Load sound effects
const explosionSound = new Audio('resources/explosion-80108.mp3');
const laserSound = new Audio('resources/laser-zap-90575.mp3');
const hitSound = new Audio('resources/explosion-322491.mp3');

class Spaceship {
  width = 40;
  height = 60;
  x = canvasWidth / 2 - this.width / 2;
  y = canvasHeight - this.height - 10;
  speed = 9; // increased by ~30% for faster web play

  moveLeft() {
    this.x = Math.max(0, this.x - this.speed);
  }

  moveRight() {
    this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
  }

  draw() {
    ctx.drawImage(friendImage, this.x, this.y, this.width, this.height);
  }
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

const spaceship = new Spaceship();
const obstacles: Obstacle[] = [];
const stars: { x: number; y: number; size: number; speed: number }[] = [];
interface Missile {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}
const missiles: Missile[] = [];
let gameOver = false;
let paused = false;
let score = 0;
let lives = 3;
let nextLifeScore = 10;
let slideHandled = false; // track slide gesture for pausing on mobile

function resetGame() {
  obstacles.length = 0;
  missiles.length = 0;
  stars.splice(0, stars.length);
  for (let i = 0; i < 100; i++) {
    stars.push(createStar());
  }
  spaceship.x = canvasWidth / 2 - spaceship.width / 2;
  gameOver = false;
  paused = false;
  score = 0;
  lives = 3;
  nextLifeScore = 10;
  restartButton.style.display = 'none';
}

function createStar() {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 1 + 0.5,
  };
}

for (let i = 0; i < 100; i++) {
  stars.push(createStar());
}

function spawnObstacle() {
  const width = 40;
  const height = 40;
  const x = Math.random() * (canvasWidth - width);
  const speed = 4 + Math.random() * 2;
  obstacles.push({ x, y: -height, width, height, speed });
}

function fireMissile() {
  const width = 5;
  const height = 10;
  const x = spaceship.x + spaceship.width / 2 - width / 2;
  const y = spaceship.y - height;
  const speed = 10;
  missiles.push({ x, y, width, height, speed });
  laserSound.currentTime = 0;
  laserSound.play();
}

function update() {
  if (gameOver || paused) return;
  if (Math.random() < 0.02) {
    spawnObstacle();
  }

  obstacles.forEach(o => {
    o.y += o.speed;
  });

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.y > canvasHeight + o.height) {
      obstacles.splice(i, 1);
    }
  }

  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];
    m.y -= m.speed;
    if (m.y + m.height < 0) {
      missiles.splice(i, 1);
    }
  }

  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvasHeight) {
      s.y = 0;
      s.x = Math.random() * canvasWidth;
    }
  });

  checkCollisions();
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
      obstacles.splice(oi, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
        restartButton.style.display = 'block';
      } else {
        spaceship.x = canvasWidth / 2 - spaceship.width / 2;
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
        score++;
        if (score >= nextLifeScore) {
          lives++;
          nextLifeScore += 10;
        }
        break;
      }
    }
  }
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = 'white';
  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });

  spaceship.draw();

  ctx.fillStyle = 'yellow';
  missiles.forEach(m => {
    ctx.fillRect(m.x, m.y, m.width, m.height);
  });

  obstacles.forEach(o => {
    ctx.drawImage(enemyImage, o.x, o.y, o.width, o.height);
  });

  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Score: ${score} Lives: ${lives}`, canvasWidth - 20, 30);

  if (paused && !gameOver) {
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvasWidth / 2, canvasHeight / 2);
  }

  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvasWidth / 2, canvasHeight / 2);
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
  if (e.code === 'Space') fireMissile();
});

window.addEventListener('touchstart', e => {
  if (gameOver || paused) return;
  slideHandled = false;
  const touch = e.touches[0];
  if (touch.clientX < canvasWidth / 2) spaceship.moveLeft();
  else spaceship.moveRight();
});

window.addEventListener('touchmove', () => {
  if (gameOver) return;
  if (!slideHandled) {
    paused = !paused;
    slideHandled = true;
  }
});

window.addEventListener('click', () => {
  if (gameOver || paused) return;
  fireMissile();
});

window.addEventListener('dblclick', () => {
  if (gameOver) return;
  paused = !paused;
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

restartButton.addEventListener('click', () => {
  resetGame();
});

