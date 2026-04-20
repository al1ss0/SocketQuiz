export class UI {
    constructor() {
        this.status = document.getElementById('status');
        this.roomLink = document.getElementById('roomLink');
        this.quizArea = document.getElementById('quizArea');
        this.questionText = document.getElementById('questionText');
        this.options = document.getElementById('options');
        this.scoreboard = document.getElementById('scoreboard');
        this.questionMeta = document.getElementById('questionMeta');
        this.timerBar = document.getElementById('timerBar');
        this.selectedOption = null;
        this.timerInterval = null;
    }

    init() {}

    showQuiz() {
        this.quizArea.classList.remove('hidden');
    }

    showRoomLink(link) {
        this.roomLink.innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
        this.roomLink.classList.remove('hidden');
    }

    setStatus(message) {
        this.status.textContent = message;
    }

    updateScoreboard(scores) {
        this.scoreboard.innerHTML = `
            <div>Jogador 1: ${scores["Jogador 1"] ?? 0}</div>
            <div>Jogador 2: ${scores["Jogador 2"] ?? 0}</div>
        `;
    }

    renderQuestion(state, onOptionClick) {
        this.showQuiz();
        this.selectedOption = null;

        // Limpa timer antigo
        clearInterval(this.timerInterval);

        const question = state.current_question;
        if (!question) return;

        this.questionMeta.textContent =
            `Pergunta ${state.current_question_index + 1} de ${state.total_questions}`;

        this.questionText.textContent = question.text;
        this.options.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');

            button.className =
                'option-btn w-full text-left rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 transition hover:border-indigo-400 hover:bg-slate-800';

            button.textContent = option;

            button.addEventListener('click', () => {
                this.selectedOption = index;

                const buttons = this.options.querySelectorAll('.option-btn');
                buttons.forEach(btn => btn.classList.remove('selected'));

                button.classList.add('selected');

                this.disableOptions();

                onOptionClick(index);
            });

            this.options.appendChild(button);
        });

        this.updateScoreboard(state.scores);

        // Inicia timer 
        this.startTimer(60);
    }

    // Timer
    startTimer(seconds) {
        let time = seconds;

        if (this.timerBar) {
            this.timerBar.style.width = '100%';
        }

        this.timerInterval = setInterval(() => {
            this.status.textContent = `⏱️ ${time}s`;

            if (this.timerBar) {
                this.timerBar.style.width = `${(time / seconds) * 100}%`;
            }

            time--;

            if (time < 0) {
                clearInterval(this.timerInterval);
            }
        }, 1000);
    }

    // Desabilita opções
    disableOptions() {
        const buttons = this.options.querySelectorAll('.option-btn');

        buttons.forEach((btn) => {
            btn.disabled = true;
            btn.classList.add('opacity-80', 'cursor-not-allowed');
        });
    }

    // Resultado 
    showRoundResult(correctOption) {
        clearInterval(this.timerInterval);

        const buttons = this.options.querySelectorAll('.option-btn');

        buttons.forEach((btn, index) => {
            btn.classList.remove('correct', 'wrong');

            if (index === correctOption) {
                btn.classList.add('correct'); // 🟢
            } else if (index === this.selectedOption) {
                btn.classList.add('wrong'); // 🔴
            }

            btn.disabled = true;
        });

        this.status.textContent = "✅ Resposta revelada!";
    }

    // Contador entre as perguntas
    showNextQuestionTimer(seconds) {
        this.status.textContent = `⏳ Próxima pergunta em ${seconds}s`;
    }

    // Final do Jogo
    showFinished(state) {
        clearInterval(this.timerInterval);

        this.showQuiz();
        this.updateScoreboard(state.scores);
        this.disableOptions();

        if (state.winner === "Empate") {
            this.setStatus("🏁 Empate!");
        } else {
            this.setStatus(`🏆 Vencedor: ${state.winner}`);
        }

        this.questionText.textContent = "Fim do quiz!";
        this.options.innerHTML = '';
        this.questionMeta.textContent = `Total de perguntas: ${state.total_questions}`;
    }
}