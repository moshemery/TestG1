export function drawTopInfo(
  ctx: CanvasRenderingContext2D,
  name: string | null,
  score: number,
  lives: number,
  topScore: number,
  canvasWidth: number
) {
  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    `Name: ${name || 'Anonymous'} Score: ${score} Lives: ${lives} Top: ${topScore}`,
    canvasWidth - 20,
    30
  );
}
