"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvas = document.getElementById('game');
const restartButton = document.getElementById('restart');
const nameModal = document.getElementById('name-modal');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('username-input');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width = window.innerWidth;
const canvasHeight = canvas.height = window.innerHeight;
const PLAYER_NAME_KEY = 'playerName';
let playerName = localStorage.getItem(PLAYER_NAME_KEY);
// Airtable configuration
const AIRTABLE_API_KEY = 'patipkX905rbyd9jI.5f1856e68ce599923e05fc3423c5f5d61805a64ae757bfdf0595e36267f401da';
// TODO: replace with your Airtable Base ID
const AIRTABLE_BASE_ID = 'app2CnjHccmeNtrXz';
const AIRTABLE_TABLE_NAME = 'Game Scores';
const friendImage = new Image();
friendImage.src = 'resources/friend.png';
const enemyImage = new Image();
enemyImage.src = 'resources/enemy.png';
const bossImage = new Image();
bossImage.src = 'resources/boss.png';
// Load sound effects
const explosionSound = new Audio('resources/explosion-80108.mp3');
const laserSound = new Audio('resources/laser-zap-90575.mp3');
const hitSound = new Audio('resources/explosion-322491.mp3');
class Spaceship {
    constructor() {
        this.width = 40;
        this.height = 60;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 10;
        this.speed = 9; // increased by ~30% for faster web play
    }
    moveLeft() {
        this.x = Math.max(0, this.x - this.speed);
    }
    moveRight() {
        this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
    }
    draw() {
        ctx.drawImage(friendImage, this.x, this.y, this.width, this.height);
    }
}
const spaceship = new Spaceship();
const obstacles = [];
const stars = [];
const missiles = [];
let gameOver = false;
let paused = false;
let score = 0;
let lives = 3;
let nextLifeScore = 10;
let shipPieces = [];
let explosionTimer = 0;
let freezeEnvironment = false;
function formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}
function sendScoreToAirtable(finalScore, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
        const body = {
            records: [
                {
                    fields: {
                        Score: finalScore,
                        Name: name || 'Anonymous',
                        'Date of Play': formatDate(new Date()),
                    },
                },
            ],
        };
        try {
            yield fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
        }
        catch (err) {
            console.error('Failed to send score to Airtable', err);
        }
    });
}
function randomBossInterval() {
    return Math.floor(Math.random() * 11) + 20;
}
let spawnsUntilBoss = randomBossInterval();
function resetGame() {
    obstacles.length = 0;
    missiles.length = 0;
    shipPieces.length = 0;
    freezeEnvironment = false;
    stars.splice(0, stars.length);
    for (let i = 0; i < 100; i++) {
        stars.push(createStar());
    }
    spaceship.x = canvasWidth / 2 - spaceship.width / 2;
    gameOver = false;
    paused = false;
    score = 0;
    lives = 3;
    nextLifeScore = 10;
    spawnsUntilBoss = randomBossInterval();
    explosionTimer = 0;
    restartButton.style.display = 'none';
}
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
    const width = 40;
    const height = 40;
    const x = Math.random() * (canvasWidth - width);
    const speed = 4 + Math.random() * 2;
    spawnsUntilBoss--;
    const isBoss = spawnsUntilBoss <= 0;
    if (isBoss) {
        spawnsUntilBoss = randomBossInterval();
    }
    obstacles.push({ x, y: -height, width, height, speed, isBoss });
}
function fireMissile() {
    const width = 5;
    const height = 10;
    const x = spaceship.x + spaceship.width / 2 - width / 2;
    const y = spaceship.y - height;
    const speed = 10;
    missiles.push({ x, y, width, height, speed });
    laserSound.currentTime = 0;
    laserSound.play();
}
function startShipExplosion() {
    shipPieces = [];
    const pieces = 20;
    for (let i = 0; i < pieces; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        shipPieces.push({
            x: spaceship.x + spaceship.width / 2,
            y: spaceship.y + spaceship.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
        });
    }
    explosionTimer = 60;
    freezeEnvironment = true;
}
function update() {
    if (freezeEnvironment) {
        shipPieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
        });
        if (explosionTimer > 0) {
            explosionTimer--;
        }
        else {
            freezeEnvironment = false;
            shipPieces = [];
            if (!gameOver) {
                spaceship.x = canvasWidth / 2 - spaceship.width / 2;
            }
        }
        return;
    }
    if (gameOver || paused)
        return;
    if (Math.random() < 0.02) {
        spawnObstacle();
    }
    obstacles.forEach(o => {
        o.y += o.speed;
    });
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        if (o.y > canvasHeight + o.height) {
            obstacles.splice(i, 1);
        }
    }
    for (let i = missiles.length - 1; i >= 0; i--) {
        const m = missiles[i];
        m.y -= m.speed;
        if (m.y + m.height < 0) {
            missiles.splice(i, 1);
        }
    }
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvasHeight) {
            s.y = 0;
            s.x = Math.random() * canvasWidth;
        }
    });
    checkCollisions();
}
function checkCollisions() {
    for (let oi = obstacles.length - 1; oi >= 0; oi--) {
        const o = obstacles[oi];
        const collide = spaceship.x < o.x + o.width &&
            spaceship.x + spaceship.width > o.x &&
            spaceship.y < o.y + o.height &&
            spaceship.y + spaceship.height > o.y;
        if (collide) {
            explosionSound.currentTime = 0;
            explosionSound.play();
            startShipExplosion();
            obstacles.splice(oi, 1);
            lives--;
            if (lives <= 0) {
                gameOver = true;
                sendScoreToAirtable(score, playerName);
                restartButton.style.display = 'block';
            }
            break;
        }
    }
    for (let mi = missiles.length - 1; mi >= 0; mi--) {
        const m = missiles[mi];
        for (let oi = obstacles.length - 1; oi >= 0; oi--) {
            const o = obstacles[oi];
            const hit = m.x < o.x + o.width &&
                m.x + m.width > o.x &&
                m.y < o.y + o.height &&
                m.y + m.height > o.y;
            if (hit) {
                hitSound.currentTime = 0;
                hitSound.play();
                obstacles.splice(oi, 1);
                missiles.splice(mi, 1);
                score += 1 + (o.isBoss ? 10 : 0);
                if (score >= nextLifeScore) {
                    lives++;
                    nextLifeScore += 10;
                }
                break;
            }
        }
    }
}
function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'white';
    stars.forEach(s => {
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    if (!freezeEnvironment) {
        spaceship.draw();
    }
    else {
        ctx.fillStyle = 'orange';
        shipPieces.forEach(p => {
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
    }
    ctx.fillStyle = 'yellow';
    missiles.forEach(m => {
        ctx.fillRect(m.x, m.y, m.width, m.height);
    });
    obstacles.forEach(o => {
        ctx.drawImage(o.isBoss ? bossImage : enemyImage, o.x, o.y, o.width, o.height);
    });
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score} Lives: ${lives}`, canvasWidth - 20, 30);
    if (paused && !gameOver) {
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', canvasWidth / 2, canvasHeight / 2);
    }
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
    if (gameOver)
        return;
    if (e.key === 'Enter') {
        paused = !paused;
        return;
    }
    if (paused)
        return;
    if (e.key === 'ArrowLeft')
        spaceship.moveLeft();
    if (e.key === 'ArrowRight')
        spaceship.moveRight();
    if (e.code === 'Space')
        fireMissile();
});
window.addEventListener('touchstart', e => {
    if (gameOver || paused)
        return;
    const touch = e.touches[0];
    if (touch.clientX < canvasWidth / 2)
        spaceship.moveLeft();
    else
        spaceship.moveRight();
});
window.addEventListener('click', () => {
    if (gameOver || paused)
        return;
    fireMissile();
});
window.addEventListener('deviceorientation', e => {
    if (gameOver || paused)
        return;
    if (e.gamma == null)
        return;
    const threshold = 10;
    if (e.gamma > threshold) {
        spaceship.moveRight();
    }
    else if (e.gamma < -threshold) {
        spaceship.moveLeft();
    }
});
restartButton.addEventListener('click', () => {
    resetGame();
});
if (!playerName) {
    paused = true;
    nameModal.style.display = 'block';
}
nameForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        localStorage.setItem(PLAYER_NAME_KEY, name);
        nameModal.style.display = 'none';
        paused = false;
    }
});
