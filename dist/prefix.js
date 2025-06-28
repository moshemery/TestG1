export const prefixStory = [
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
export function showPrefixStory(playerName, onComplete, enemyName = DEFAULT_ENEMY_NAME) {
    const container = document.getElementById('prefix-container');
    if (!container) {
        onComplete();
        return;
    }
    let index = 0;
    container.innerHTML = '';
    container.style.display = 'block';
    const next = () => {
        if (index >= prefixStory.length) {
            if (!isMobile) {
                const message = document.createElement('div');
                message.textContent = 'Click enter to begin';
                container.appendChild(message);
                const startHandler = (e) => {
                    if (e.key === 'Enter') {
                        window.removeEventListener('keydown', startHandler);
                        container.style.display = 'none';
                        onComplete();
                    }
                };
                window.addEventListener('keydown', startHandler);
            }
            else {
                container.style.display = 'none';
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
    next();
}
