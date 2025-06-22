import { SCALE } from './config.js';

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

export function createStar(
  canvasWidth: number,
  canvasHeight: number,
  stage: number
): Star {
  const base = {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: (Math.random() * 2 + 1) * SCALE,
    speed: Math.random() * 1 + 0.5,
  };
  const colors = ['white', 'blue', 'red', 'yellow'];
  const color = stage > 1 ? colors[Math.floor(Math.random() * colors.length)] : 'white';
  return { ...base, color };
}

export function updateStars(
  stars: Star[],
  canvasWidth: number,
  canvasHeight: number,
  stage: number
) {
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvasHeight) {
      s.y = 0;
      s.x = Math.random() * canvasWidth;
      if (stage > 1) {
        const colors = ['white', 'blue', 'red', 'yellow'];
        s.color = colors[Math.floor(Math.random() * colors.length)];
      }
    }
  });
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[]) {
  stars.forEach(s => {
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
}
