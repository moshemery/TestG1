export class Spaceship {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 40;
        this.height = 60;
        // Increase speed by roughly 30% for snappier keyboard control
        this.speed = 12;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 10;
    }
    moveLeft(multiplier = 1) {
        this.x = Math.max(0, this.x - this.speed * multiplier);
    }
    moveRight(multiplier = 1) {
        this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed * multiplier);
    }
}
export function drawSpaceship(ctx, ship, img) {
    ctx.drawImage(img, ship.x, ship.y, ship.width, ship.height);
}
