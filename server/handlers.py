import json
import tornado.web
import tornado.websocket
from server.manager import RoomManager
from core.logger import get_logger

logger = get_logger(__name__)


class CreateRoomHandler(tornado.web.RequestHandler):
    def initialize(self, room_manager: RoomManager) -> None:
        self.room_manager = room_manager

    def get(self) -> None:
        room_id = self.room_manager.create_room()
        link = f"http://localhost:8888/?sala={room_id}"
        self.write({"room_id": room_id, "link": link})


class GameWebSocketHandler(tornado.websocket.WebSocketHandler):
    connections = {}  # sala -> lista de conexões

    def initialize(self, room_manager: RoomManager) -> None:
        self.room_manager = room_manager
        self.room_id = None
        self.player_id = None
        self.symbol = None

    def open(self) -> None:
        self.room_id = self.get_argument("sala", None)

        if not self.room_id:
            self.close()
            return

        room = self.room_manager.get_room(self.room_id)
        if not room:
            self.close()
            return

        self.player_id = str(id(self))
        self.symbol = room.assign_player(self.player_id)

        # adiciona conexão na sala
        GameWebSocketHandler.connections.setdefault(self.room_id, []).append(self)

        if self.symbol:
            self.write_message(json.dumps({
                "type": "init",
                "symbol": self.symbol,
                "room": self.room_id
            }))

            if room.can_start():
                self.broadcast_update(room)
            else:
                self.write_message(json.dumps({
                    "type": "wait",
                    "message": "Aguardando outro jogador..."
                }))
        else:
            self.write_message(json.dumps({
                "type": "full",
                "message": "Sala cheia"
            }))
            self.close()

    def on_message(self, message: str) -> None:
        try:
            data = json.loads(message)
            room = self.room_manager.get_room(self.room_id)

            if not room or data.get("action") != "move":
                return

            row, col = data["row"], data["col"]

            if room.make_move(row, col, self.symbol):
                self.broadcast_update(room)

        except Exception as e:
            logger.error(f"Erro no WebSocket: {e}")

    def on_close(self) -> None:
        if self.room_id and self.player_id:
            room = self.room_manager.get_room(self.room_id)
            if room:
                room.remove_player(self.player_id)

        # remove conexão da sala
        if self.room_id in GameWebSocketHandler.connections:
            GameWebSocketHandler.connections[self.room_id].remove(self)

            if not GameWebSocketHandler.connections[self.room_id]:
                del GameWebSocketHandler.connections[self.room_id]

    def broadcast_update(self, room) -> None:
        state = room.state.to_dict()
        message = json.dumps({
            "type": "update",
            "state": state
        })

        for handler in GameWebSocketHandler.connections.get(self.room_id, []):
            handler.write_message(message)