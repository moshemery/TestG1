import { Spaceship } from './spaceship.js';
import { SCALE } from './config.js';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isBoss: boolean;
  /** Whether this obstacle uses the stage 3 sprite */
  isEnemy3?: boolean;
  /** New enemy type that appears from stage 1 */
  isBos4?: boolean;
  /** Enemy that requires two hits starting in stage 3 */
  isBoss5?: boolean;
  /** Remaining health points */
  health: number;
}

export interface Missile {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export const obstacles: Obstacle[] = [];
export const missiles: Missile[] = [];
export const enemyShots: Missile[] = [];

export function spawnObstacle(
  canvasWidth: number,
  spawnsUntilBoss: { value: number },
  stage: number
) {
  const width = 40 * SCALE;
  const height = 40 * SCALE;
  const x = Math.random() * (canvasWidth - width);
  const speed = 4 + Math.random() * 2;
  spawnsUntilBoss.value--;
  const isBoss = spawnsUntilBoss.value <= 0;
  if (isBoss) {
    spawnsUntilBoss.value = Math.floor(Math.random() * 11) + 20;
  }
  let isEnemy3 = false;
  if (!isBoss && stage >= 3) {
    // 30% chance to use the new enemy sprite
    isEnemy3 = Math.random() < 0.3;
  }
  let isBos4 = false;
  if (!isBoss && Math.random() < 0.1) {
    isBos4 = true;
  }
  let isBoss5 = false;
  let health = 1;
  if (!isBoss && stage >= 3 && Math.random() < 0.2) {
    isBoss5 = true;
    health = 2;
    // When this enemy appears, do not treat it as other special types
    isEnemy3 = false;
    isBos4 = false;
  }
  obstacles.push({
    x,
    y: -height,
    width,
    height,
    speed,
    isBoss,
    isEnemy3,
    isBos4,
    isBoss5,
    health,
  });
}

export function fireMissile(ship: Spaceship, laserSound: HTMLAudioElement) {
  const width = 5 * SCALE;
  const height = 10 * SCALE;
  const x = ship.x + ship.width / 2 - width / 2;
  const y = ship.y - height;
  const speed = 10;
  missiles.push({ x, y, width, height, speed });
  laserSound.currentTime = 0;
  laserSound.play();
}

export function updateObstacles(canvasHeight: number) {
  obstacles.forEach(o => {
    o.y += o.speed;
    if (o.isBos4 && Math.random() < 0.02) {
      const width = 5 * SCALE;
      const height = 10 * SCALE;
      const x = o.x + o.width / 2 - width / 2;
      const y = o.y + o.height;
      const speed = 8;
      enemyShots.push({ x, y, width, height, speed });
    }
  });
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.y > canvasHeight + o.height) {
      obstacles.splice(i, 1);
    }
  }
}

export function updateMissiles() {
  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];
    m.y -= m.speed;
    if (m.y + m.height < 0) {
      missiles.splice(i, 1);
    }
  }
}

export function updateEnemyShots(canvasHeight: number) {
  for (let i = enemyShots.length - 1; i >= 0; i--) {
    const s = enemyShots[i];
    s.y += s.speed;
    if (s.y > canvasHeight) {
      enemyShots.splice(i, 1);
    }
  }
}

export function drawMissiles(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'yellow';
  missiles.forEach(m => {
    ctx.fillRect(m.x, m.y, m.width, m.height);
  });
}

export function drawEnemyShots(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'red';
  enemyShots.forEach(s => {
    ctx.fillRect(s.x, s.y, s.width, s.height);
  });
}

export function drawObstacles(
  ctx: CanvasRenderingContext2D,
  enemyImage: HTMLImageElement,
  bossImage: HTMLImageElement,
  enemy3Image: HTMLImageElement,
  bos4Image: HTMLImageElement,
  boss5Image: HTMLImageElement
) {
  obstacles.forEach(o => {
    const img = o.isBoss
      ? bossImage
      : o.isBoss5
      ? boss5Image
      : o.isBos4
      ? bos4Image
      : o.isEnemy3
      ? enemy3Image
      : enemyImage;
    ctx.drawImage(img, o.x, o.y, o.width, o.height);
  });
}
