export const asteroids = [];
export function spawnAsteroid(canvasWidth) {
    const width = 60;
    const height = 40;
    const x = Math.random() * (canvasWidth - width);
    const y = -height;
    const speedY = 3 + Math.random() * 2;
    const speedX = (Math.random() - 0.5) * 2; // slight horizontal drift
    asteroids.push({ x, y, width, height, speedX, speedY });
}
export function updateAsteroids(canvasWidth, canvasHeight) {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.speedX;
        a.y += a.speedY;
        if (a.x > canvasWidth + a.width || a.x < -a.width || a.y > canvasHeight + a.height) {
            asteroids.splice(i, 1);
        }
    }
}
export function drawAsteroids(ctx, img) {
    asteroids.forEach(a => {
        ctx.save();
        const cx = a.x + a.width / 2;
        const cy = a.y + a.height / 2;
        ctx.translate(cx, cy);
        const angle = Math.atan2(a.speedX, a.speedY);
        ctx.rotate(angle);
        ctx.drawImage(img, -a.width / 2, -a.height / 2, a.width, a.height);
        ctx.restore();
    });
}
