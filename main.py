import os

import tornado.ioloop
import tornado.web
from core.config import config
from core.logger import setup_logger
from server.handlers import CreateRoomHandler, GameWebSocketHandler
from server.manager import RoomManager


def make_app():
    room_manager = RoomManager()

    print("STATIC_PATH =", config.STATIC_PATH)
    print("INDEX EXISTS =", os.path.exists(os.path.join(config.STATIC_PATH, "index.html")))

    return tornado.web.Application([
        (r"/api/create-room", CreateRoomHandler, dict(room_manager=room_manager)),
        (r"/ws", GameWebSocketHandler, dict(room_manager=room_manager)),
        (r"/(.*)", tornado.web.StaticFileHandler, {
            "path": config.STATIC_PATH,
            "default_filename": "index.html"
        }),
    ], debug=True)


if __name__ == "__main__":
    setup_logger()
    app = make_app()
    app.listen(config.PORT, address=config.LISTEN_ADDRESS)
    print(f"Servidor iniciado em http://localhost:{config.PORT}")
    tornado.ioloop.IOLoop.current().start()
