from game.logic import GameLogic

def test_make_move_valid_updates_state() -> None:
    logic = GameLogic()
    assert logic.state.current_turn == "X"
    assert logic.make_move(0, 0, "X") is True
    assert logic.state.board[0][0] == "X"
    assert logic.state.current_turn == "O"
    assert logic.state.winner is None
    assert logic.state.game_over is False