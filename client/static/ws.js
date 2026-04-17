export class WS {
    constructor(ui) {
        this.socket = null;
        this.ui = ui;
        this.playerName = null;
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
            this.ui.setStatus('Conexão encerrada.');
        };
    }

    sendAnswer(option) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                action: 'answer',
                option
            }));
            this.ui.setStatus('Resposta enviada. Aguardando o outro jogador...');
            this.ui.disableOptions();
        }
    }

    handleMessage(data) {
        if (data.type === 'init') {
            this.playerName = data.player;
            this.ui.setStatus(`Você é o ${data.player}`);
        } else if (data.type === 'wait') {
            this.ui.setStatus(data.message);
        } else if (data.type === 'question') {
            this.ui.setStatus(`Quiz em andamento - ${this.playerName ?? 'Jogador'}`);
            this.ui.renderQuestion(data.state, (optionIndex) => {
                this.sendAnswer(optionIndex);
            });
        } else if (data.type === 'round_result') {
            this.ui.updateScoreboard(data.scores);
            this.ui.showRoundResult(data.correct_option);
            this.ui.disableOptions();
            this.ui.setStatus('Todos responderam. A resposta correta foi destacada em verde.');
        } else if (data.type === 'finished') {
            this.ui.showFinished(data.state);
        } else if (data.type === 'full') {
            this.ui.setStatus(data.message);
        }
    }
}