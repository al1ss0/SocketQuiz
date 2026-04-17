export class WS {
    constructor(ui) {
        this.socket = null;
        this.ui = ui;
    }

    connect(roomId) {
        const url = `ws://localhost:8888/ws?sala=${roomId}`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('Conectado ao WebSocket');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            console.log('WebSocket fechado');
        };

        this.ui.setOnCellClick((row, col) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ action: 'move', row, col }));
            }
        });
    }

    handleMessage(data) {
        if (data.type === 'init') {
            this.ui.setStatus(`Você é o jogador ${data.symbol}`);
            this.ui.showBoard();
        } else if (data.type === 'wait') {
            this.ui.setStatus(data.message);
        } else if (data.type === 'update') {
            this.ui.updateBoard(data.state);
        } else if (data.type === 'full') {
            this.ui.setStatus(data.message);
        }
    }
}