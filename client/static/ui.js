export class UI {
    constructor() {
        this.board = document.getElementById('board');
        this.status = document.getElementById('status');
        this.roomLink = document.getElementById('roomLink');
    }

    init() {
        this.board.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.onCellClick(row, col);
            }
        });
    }

    setOnCellClick(callback) {
        this.onCellClick = callback;
    }

    updateBoard(state) {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                const value = state.board[r][c] || '';
                cell.textContent = value;
                cell.classList.remove('x', 'o');
                if (value === 'X') {
                    cell.classList.add('x');
                } else if (value === 'O') {
                    cell.classList.add('o');
                }
            }
        }
        this.updateStatus(state);
    }

    updateStatus(state) {
        if (state.game_over) {
            if (state.winner === 'Draw') {
                this.status.textContent = 'Empate!';
            } else {
                this.status.textContent = `Jogador ${state.winner} venceu!`;
            }
        } else {
            this.status.textContent = `Vez do jogador ${state.current_turn}`;
        }
    }

    showBoard() {
        this.board.style.display = 'grid';
    }

    showRoomLink(link) {
        this.roomLink.innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
        this.roomLink.style.display = 'block';
    }

    setStatus(message) {
        this.status.textContent = message;
    }
}