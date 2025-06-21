export const asteroids = [];
export function spawnAsteroid(canvasWidth, canvasHeight) {
    const width = 60;
    const height = 40;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const speed = 3 + Math.random() * 2;
    const x = direction === 1 ? -width : canvasWidth + width;
    const y = Math.random() * (canvasHeight * 0.4); // keep mostly in the upper half
    asteroids.push({ x, y, width, height, speed, direction });
}
export function updateAsteroids(canvasWidth) {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.speed * a.direction;
        if ((a.direction === 1 && a.x > canvasWidth + a.width) ||
            (a.direction === -1 && a.x < -a.width)) {
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
        const angle = a.direction === 1 ? -Math.PI / 6 : Math.PI / 6;
        ctx.rotate(angle);
        ctx.drawImage(img, -a.width / 2, -a.height / 2, a.width, a.height);
        ctx.restore();
    });
}
