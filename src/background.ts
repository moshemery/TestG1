export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export function createStar(canvasWidth: number, canvasHeight: number): Star {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 1 + 0.5,
  };
}

export function updateStars(stars: Star[], canvasWidth: number, canvasHeight: number) {
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvasHeight) {
      s.y = 0;
      s.x = Math.random() * canvasWidth;
    }
  });
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[]) {
  ctx.fillStyle = 'white';
  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
}
