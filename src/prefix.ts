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

const clickAudioSrc = 'resources/soundOfClick.mp3';

function playClick() {
  const audio = new Audio(clickAudioSrc);
  audio.play();
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 100);
}

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
  // Show the commander image but keep it mostly transparent so it doesn't
  // distract from the on-screen text.
  if (commandImg) commandImg.style.opacity = '0.2';

  const typeLine = (text: string, done: () => void) => {
    const lineEl = document.createElement('div');
    container.appendChild(lineEl);
    let i = 0;
    const typeNext = () => {
      if (i < text.length) {
        lineEl.textContent += text[i];
        playClick();
        i++;
        setTimeout(typeNext, 50);
      } else {
        setTimeout(done, 1000);
      }
    };
    typeNext();
  };

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
    typeLine(lineText, () => {
      index++;
      next();
    });
  };

  setTimeout(next, 500);
}
