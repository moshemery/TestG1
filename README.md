# Spaceship Game

A simple TypeScript web game where you control a spaceship dodging obstacles. The spaceship moves left and right while stars and obstacles scroll downward giving a sense of forward motion.

## Development

Install dependencies and build:

```bash
npm install
npm run build
```

Open `index.html` in a browser to play.

## Controls

- **Desktop:** Use the left and right arrow keys to move and space bar to fire. Press **Enter** to pause or resume.
- **Mobile:** Tilt your device left or right to steer the ship and tap the screen to shoot.
- Destroy enemies to earn points. You start with three lives and gain an extra life every ten points. When all lives are lost, hit the Restart button to play again.
- Every so often a boss ship appears. Taking it down awards a 10 point bonus.
- Beginning with stage 3, a new enemy type appears. Roughly 30% of enemies will use the `enemy3.png` sprite and are worth 2 points when destroyed.
- Starting in stage 1 another enemy using `bos4.png` may appear. It occasionally shoots back and is worth 15 points when destroyed.
- From stage 3 another tough ship may show up using `boss5.png`. It appears far
  less frequently (about 20% as often as normal enemies), requires two hits to
  destroy and awards 5 points.

## GitHub Pages

This repository includes a workflow that automatically builds the TypeScript code and publishes the game to the `gh-pages` branch. Once GitHub Pages is enabled for that branch, the game will be available online. After pushing to `main`, visit the repository settings on GitHub and enable GitHub Pages using the `gh-pages` branch as the source.

## Special Query Parameters

To modify the game's behavior via the URL, see [QUERY_PARAMS.md](QUERY_PARAMS.md).
