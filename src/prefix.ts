export interface PrefixLine {
  id: string;
  text: string;
}

export const prefixStory: PrefixLine[] = [
  { id: 'greeting', text: 'Hello {{playerName}}, this is Commander Omer.' },
  {
    id: 'alert',
    text: 'The world has been attacked by {{enemyName}}, spreading chaos across the galaxy.'
  },
  { id: 'mission', text: 'You are the last spaceship with enough power to save the world.' },
  { id: 'charge', text: 'We are counting on you—go out there and destroy them all!' }
];

const DEFAULT_ENEMY_NAME = 'the enemy forces';

import { isMobile } from './config.js';

export let prefixActive = false;

export function showPrefixStory(
  playerName: string,
  onComplete: () => void,
  enemyName: string = DEFAULT_ENEMY_NAME
) {
  const container = document.getElementById('prefix-container') as HTMLDivElement;
  const commandImg = document.getElementById('command-image') as HTMLImageElement | null;
  if (!container) {
    onComplete();
    return;
  }

  prefixActive = true;

  let index = 0;
  container.innerHTML = '';
  container.style.display = 'block';
  if (commandImg) commandImg.style.opacity = '1';

  const next = () => {
    if (index >= prefixStory.length) {
      if (!isMobile) {
        const message = document.createElement('div');
        message.textContent = 'Click enter to begin';
        container.appendChild(message);
        const startHandler = (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            window.removeEventListener('keydown', startHandler);
            container.style.display = 'none';
            prefixActive = false;
            if (commandImg) commandImg.style.opacity = '0';
            onComplete();
          }
        };
        window.addEventListener('keydown', startHandler);
      } else {
        container.style.display = 'none';
        prefixActive = false;
        if (commandImg) commandImg.style.opacity = '0';
        onComplete();
      }
      return;
    }
    const lineText = prefixStory[index].text
      .replace('{{playerName}}', playerName)
      .replace('{{enemyName}}', enemyName);
    const lineEl = document.createElement('div');
    lineEl.textContent = lineText;
    container.appendChild(lineEl);
    index++;
    setTimeout(next, 3000);
  };

  setTimeout(next, 500);
}
