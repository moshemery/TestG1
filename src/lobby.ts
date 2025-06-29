import { startLobbyBackground, stopLobbyBackground } from './lobbyBackground.js';

export function showLobby(playerName: string, onPlay: () => void) {
  const lobby = document.getElementById('lobby') as HTMLDivElement | null;
  const nameSpan = document.getElementById('lobby-name') as HTMLSpanElement | null;
  const playEl = document.getElementById('lobby-play') as HTMLDivElement | null;
  if (!lobby || !nameSpan || !playEl) {
    onPlay();
    return;
  }

  nameSpan.textContent = playerName;
  lobby.style.display = 'flex';
  startLobbyBackground();

  const handler = () => {
    lobby.style.display = 'none';
    stopLobbyBackground();
    playEl.removeEventListener('click', handler);
    onPlay();
  };

  playEl.addEventListener('click', handler);
}
