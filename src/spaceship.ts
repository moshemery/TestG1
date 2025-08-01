import { vrMode, SCALE } from './config.js';

export class Spaceship {
  width = 40 * SCALE;
  height = 60 * SCALE;
  x: number;
  y: number;
  // Base speed adjusted when VR mode is active
  speed = 12 * (vrMode ? 0.7 : 1);

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - this.height - 10;
  }

  moveLeft(multiplier = 1) {
    this.x = Math.max(0, this.x - this.speed * multiplier);
  }

  moveRight(multiplier = 1) {
    this.x = Math.min(
      this.canvasWidth - this.width,
      this.x + this.speed * multiplier
    );
  }
}

export function drawSpaceship(ctx: CanvasRenderingContext2D, ship: Spaceship, img: HTMLImageElement) {
  ctx.drawImage(img, ship.x, ship.y, ship.width, ship.height);
}
