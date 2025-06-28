export function showLobby(playerName, onPlay) {
    const lobby = document.getElementById('lobby');
    const nameSpan = document.getElementById('lobby-name');
    const playEl = document.getElementById('lobby-play');
    if (!lobby || !nameSpan || !playEl) {
        onPlay();
        return;
    }
    nameSpan.textContent = playerName;
    lobby.style.display = 'flex';
    const handler = () => {
        lobby.style.display = 'none';
        playEl.removeEventListener('click', handler);
        onPlay();
    };
    playEl.addEventListener('click', handler);
}
