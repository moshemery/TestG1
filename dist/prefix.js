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
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const clickCtx = AudioCtx ? new AudioCtx() : null;
function playClick() {
    if (!clickCtx)
        return;
    const osc = clickCtx.createOscillator();
    const gain = clickCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800;
    osc.connect(gain);
    gain.connect(clickCtx.destination);
    gain.gain.setValueAtTime(0.1, clickCtx.currentTime);
    osc.start();
    osc.stop(clickCtx.currentTime + 0.05);
}
export let prefixActive = false;
export function showPrefixStory(playerName, onComplete, enemyName = DEFAULT_ENEMY_NAME) {
    const container = document.getElementById('prefix-container');
    const commandImg = document.getElementById('command-image');
    if (!container) {
        onComplete();
        return;
    }
    prefixActive = true;
    let index = 0;
    container.innerHTML = '';
    container.style.display = 'block';
    if (commandImg)
        commandImg.style.opacity = '1';
    const typeLine = (text, done) => {
        const lineEl = document.createElement('div');
        container.appendChild(lineEl);
        let i = 0;
        const typeNext = () => {
            if (i < text.length) {
                lineEl.textContent += text[i];
                playClick();
                i++;
                setTimeout(typeNext, 50);
            }
            else {
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
                const startHandler = (e) => {
                    if (e.key === 'Enter') {
                        window.removeEventListener('keydown', startHandler);
                        container.style.display = 'none';
                        prefixActive = false;
                        if (commandImg)
                            commandImg.style.opacity = '0';
                        onComplete();
                    }
                };
                window.addEventListener('keydown', startHandler);
            }
            else {
                container.style.display = 'none';
                prefixActive = false;
                if (commandImg)
                    commandImg.style.opacity = '0';
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
