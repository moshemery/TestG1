export const obstacles = [];
export const missiles = [];
export function spawnObstacle(canvasWidth, spawnsUntilBoss, stage) {
    const width = 40;
    const height = 40;
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
    obstacles.push({ x, y: -height, width, height, speed, isBoss, isEnemy3 });
}
export function fireMissile(ship, laserSound) {
    const width = 5;
    const height = 10;
    const x = ship.x + ship.width / 2 - width / 2;
    const y = ship.y - height;
    const speed = 10;
    missiles.push({ x, y, width, height, speed });
    laserSound.currentTime = 0;
    laserSound.play();
}
export function updateObstacles(canvasHeight) {
    obstacles.forEach(o => {
        o.y += o.speed;
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
export function drawMissiles(ctx) {
    ctx.fillStyle = 'yellow';
    missiles.forEach(m => {
        ctx.fillRect(m.x, m.y, m.width, m.height);
    });
}
export function drawObstacles(ctx, enemyImage, bossImage, enemy3Image) {
    obstacles.forEach(o => {
        const img = o.isBoss
            ? bossImage
            : o.isEnemy3
                ? enemy3Image
                : enemyImage;
        ctx.drawImage(img, o.x, o.y, o.width, o.height);
    });
}
