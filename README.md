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

## GitHub Pages

This repository includes a workflow that automatically builds the TypeScript code and publishes the game to the `gh-pages` branch. Once GitHub Pages is enabled for that branch, the game will be available online. After pushing to `main`, visit the repository settings on GitHub and enable GitHub Pages using the `gh-pages` branch as the source.
