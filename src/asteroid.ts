export interface Asteroid {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Horizontal drift speed */
  speedX: number;
  /** Downward movement speed */
  speedY: number;
}

export const asteroids: Asteroid[] = [];

export function spawnAsteroid(canvasWidth: number) {
  const width = 60;
  const height = 40;
  const x = Math.random() * (canvasWidth - width);
  const y = -height;
  // Asteroids move twice as fast as regular enemies and
  // have a wider horizontal drift for more dramatic angles
  const speedY = 8 + Math.random() * 4; // 2x enemy speed (8 - 12)
  const speedX = (Math.random() - 0.5) * 8; // greater left/right movement
  asteroids.push({ x, y, width, height, speedX, speedY });
}

export function updateAsteroids(canvasWidth: number, canvasHeight: number) {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.x += a.speedX;
    a.y += a.speedY;
    if (a.x > canvasWidth + a.width || a.x < -a.width || a.y > canvasHeight + a.height) {
      asteroids.splice(i, 1);
    }
  }
}

export function drawAsteroids(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  asteroids.forEach(a => {
    ctx.save();
    const cx = a.x + a.width / 2;
    const cy = a.y + a.height / 2;
    ctx.translate(cx, cy);
    // Rotate the asteroid in the direction of its velocity so
    // the trailing part of the sprite aligns with its movement
    const angle = Math.atan2(a.speedY, a.speedX);
    ctx.rotate(angle);
    ctx.drawImage(img, -a.width / 2, -a.height / 2, a.width, a.height);
    ctx.restore();
  });
}
