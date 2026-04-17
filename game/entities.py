from dataclasses import dataclass, field
from typing import Optional, Any

@dataclass(frozen=True)
class Question:
    text: str
    options: list[str]
    correct_option: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "text": self.text,
            "options": self.options,
        }


@dataclass(frozen=True)
class GameState:
    questions: list[Question] = field(default_factory=list)
    current_question_index: int = 0
    scores: dict[str, int] = field(default_factory=dict)
    answers: dict[str, int] = field(default_factory=dict)
    game_over: bool = False
    winner: Optional[str] = None
    player_1_id: Optional[str] = None
    player_2_id: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        current_question = None
        if self.current_question_index < len(self.questions):
            current_question = self.questions[self.current_question_index].to_dict()

        return {
            "current_question_index": self.current_question_index,
            "total_questions": len(self.questions),
            "current_question": current_question,
            "scores": self.scores,
            "answers_count": len(self.answers),
            "game_over": self.game_over,
            "winner": self.winner,
            "player_1": {"active": self.player_1_id is not None},
            "player_2": {"active": self.player_2_id is not None},
        }