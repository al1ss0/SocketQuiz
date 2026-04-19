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
            this.ui.setStatus('Conexão encerrada');
        };
    }

    sendAnswer(option) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                action: 'answer',
                option
            }));

            // Feedback imediato
            this.ui.setStatus('✅ Resposta enviada! Aguardando o outro jogador...');
            this.ui.disableOptions();
        }
    }

    handleMessage(data) {

        // Inicialização
        if (data.type === 'init') {
            this.playerName = data.player;
            this.ui.setStatus(`🎮 Você é o ${data.player}`);
        }

        // Esperando jogador
        else if (data.type === 'wait') {
            this.ui.setStatus(`⏳ ${data.message}`);
        }

        // Nova pergunta
        else if (data.type === 'question') {
            this.ui.setStatus(`🔥 Pergunta ativa - ${this.playerName ?? 'Jogador'}`);

            this.ui.renderQuestion(data.state, (optionIndex) => {
                this.sendAnswer(optionIndex);
            });
        }

        // Resultado da rodada
        else if (data.type === 'round_result') {
            this.ui.updateScoreboard(data.scores);
            this.ui.showRoundResult(data.correct_option);

            this.ui.setStatus('🎯 Resposta revelada!');
        }

        // Contador entre perguntas
        else if (data.type === 'next_question_timer') {
            this.ui.showNextQuestionTimer(data.seconds);
        }

        // 🏁 Fim do jogo
        else if (data.type === 'finished') {
            this.ui.showFinished(data.state);

            // Fechar conexão depois de 10s
            setTimeout(() => {
                if (this.socket) {
                    this.socket.close();
                }
            }, 10000);
        }

        // Sala cheia
        else if (data.type === 'full') {
            this.ui.setStatus(`❌ ${data.message}`);
        }
    }
}