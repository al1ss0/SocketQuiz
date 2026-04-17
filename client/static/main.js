import { UI } from './ui.js';
import { WS } from './ws.js';

const ui = new UI();
const ws = new WS(ui);

ui.init();

document.getElementById('createRoom').addEventListener('click', async () => {
    const response = await fetch('/api/create-room');
    const data = await response.json();
    ui.showRoomLink(data.link);
    history.replaceState(null, '', `?sala=${data.room_id}`);
    ws.connect(data.room_id);
});

// Verificar se já há uma sala na URL (segundo jogador entrando via link)
const roomId = new URLSearchParams(window.location.search).get('sala');
if (roomId) {
    ws.connect(roomId);
}