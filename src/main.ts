const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const canvasWidth = canvas.width = window.innerWidth;
const canvasHeight = canvas.height = window.innerHeight;

class Spaceship {
  width = 40;
  height = 60;
  x = canvasWidth / 2 - this.width / 2;
  y = canvasHeight - this.height - 10;
  speed = 7;

  moveLeft() {
    this.x = Math.max(0, this.x - this.speed);
  }

  moveRight() {
    this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
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
let gameOver = false;

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
  const width = 30;
  const height = 30;
  const x = Math.random() * (canvasWidth - width);
  const speed = 4 + Math.random() * 2;
  obstacles.push({ x, y: -height, width, height, speed });
}

function update() {
  if (gameOver) return;
  if (Math.random() < 0.02) {
    spawnObstacle();
  }

  obstacles.forEach(o => {
    o.y += o.speed;
  });

  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvasHeight) {
      s.y = 0;
      s.x = Math.random() * canvasWidth;
    }
  });

  checkCollisions();
  obstacles.filter(o => o.y < canvasHeight + o.height);
}

function checkCollisions() {
  obstacles.forEach(o => {
    const collide =
      spaceship.x < o.x + o.width &&
      spaceship.x + spaceship.width > o.x &&
      spaceship.y < o.y + o.height &&
      spaceship.y + spaceship.height > o.y;
    if (collide) {
      gameOver = true;
    }
  });
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = 'white';
  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });

  spaceship.draw();

  ctx.fillStyle = 'red';
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.width, o.height);
  });

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
  if (e.key === 'ArrowLeft') spaceship.moveLeft();
  if (e.key === 'ArrowRight') spaceship.moveRight();
});

window.addEventListener('touchstart', e => {
  if (gameOver) return;
  const touch = e.touches[0];
  if (touch.clientX < canvasWidth / 2) spaceship.moveLeft();
  else spaceship.moveRight();
});

