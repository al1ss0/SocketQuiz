from game.entities import GameState, Question
from typing import Any, Optional

class GameLogic:
    def __init__(self) -> None:
        questions = [
            Question(
                text="Qual estrutura armazena pares chave-valor em Python?",
                options=["Lista", "Tupla", "Dicionário", "Set"],
                correct_option=2
            ),
            Question(
                text="Qual palavra-chave é usada para criar uma função em Python?",
                options=["func", "def", "function", "lambda"],
                correct_option=1
            ),
            Question(
                text="Qual estrutura é usada para repetição em Python?",
                options=["if", "for", "def", "return"],
                correct_option=1
            ),
            Question(
                text="Qual tipo de dado é mutável em Python?",
                options=["String", "Tupla", "Lista", "Inteiro"],
                correct_option=2
            ),
            Question(
                text="Qual palavra-chave é usada para condição em Python?",
                options=["when", "if", "case", "loop"],
                correct_option=1
            ),
        ]

        self._state = GameState(
            questions=questions,
            scores={"Jogador 1": 0, "Jogador 2": 0},
        )

    @property
    def state(self) -> GameState:
        return self._state

    def assign_player(self, player_id: str) -> str | None:
        if self._state.player_1_id is None:
            self._state = GameState(
                questions=self._state.questions,
                current_question_index=self._state.current_question_index,
                scores=self._state.scores,
                answers=self._state.answers,
                game_over=self._state.game_over,
                winner=self._state.winner,
                player_1_id=player_id,
                player_2_id=self._state.player_2_id,
            )
            return "Jogador 1"

        if self._state.player_2_id is None:
            self._state = GameState(
                questions=self._state.questions,
                current_question_index=self._state.current_question_index,
                scores=self._state.scores,
                answers=self._state.answers,
                game_over=self._state.game_over,
                winner=self._state.winner,
                player_1_id=self._state.player_1_id,
                player_2_id=player_id,
            )
            return "Jogador 2"

        return None

    def remove_player(self, player_id: str) -> None:
        player_1 = None if self._state.player_1_id == player_id else self._state.player_1_id
        player_2 = None if self._state.player_2_id == player_id else self._state.player_2_id

        self._state = GameState(
            questions=self._state.questions,
            current_question_index=self._state.current_question_index,
            scores=self._state.scores,
            answers=self._state.answers,
            game_over=self._state.game_over,
            winner=self._state.winner,
            player_1_id=player_1,
            player_2_id=player_2,
        )

    def is_full(self) -> bool:
        return self._state.player_1_id is not None and self._state.player_2_id is not None

    def can_start(self) -> bool:
        return self.is_full()

    def register_answer(self, player_name: str, option: int) -> bool:
        if self._state.game_over:
            return False

        if player_name in self._state.answers:
            return False

        if not (0 <= option < 4):
            return False

        new_answers = dict(self._state.answers)
        new_answers[player_name] = option

        self._state = GameState(
            questions=self._state.questions,
            current_question_index=self._state.current_question_index,
            scores=self._state.scores,
            answers=new_answers,
            game_over=self._state.game_over,
            winner=self._state.winner,
            player_1_id=self._state.player_1_id,
            player_2_id=self._state.player_2_id,
        )
        return True

    def all_answered(self) -> bool:
        return len(self._state.answers) == 2

    def finish_round(self) -> dict[str, Any]:
        question = self._state.questions[self._state.current_question_index]
        new_scores = dict(self._state.scores)

        for player_name, selected_option in self._state.answers.items():
            if selected_option == question.correct_option:
                new_scores[player_name] += 1

        next_index = self._state.current_question_index + 1
        game_over = next_index >= len(self._state.questions)

        winner = None
        if game_over:
            p1 = new_scores["Jogador 1"]
            p2 = new_scores["Jogador 2"]

            if p1 > p2:
                winner = "Jogador 1"
            elif p2 > p1:
                winner = "Jogador 2"
            else:
                winner = "Empate"

        self._state = GameState(
            questions=self._state.questions,
            current_question_index=next_index if not game_over else self._state.current_question_index,
            scores=new_scores,
            answers={},
            game_over=game_over,
            winner=winner,
            player_1_id=self._state.player_1_id,
            player_2_id=self._state.player_2_id,
        )

        return {
            "correct_option": question.correct_option,
            "scores": new_scores,
            "game_over": game_over,
            "winner": winner,
        }