export function drawTopInfo(ctx, name, score, lives, topScore, canvasWidth) {
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Name: ${name || 'Anonymous'} Score: ${score} Lives: ${lives} Top: ${topScore}`, canvasWidth - 20, 30);
}
