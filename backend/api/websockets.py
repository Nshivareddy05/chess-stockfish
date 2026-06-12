from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import logging
from ..core.engine_manager import engine_instance

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending websocket message: {e}")

manager = ConnectionManager()

# Global callback for EngineManager
async def engine_callback(data: dict):
    # Broadcast info lines to all connected clients
    await manager.broadcast({"type": "engine_info", "data": data})

engine_instance.subscribe(engine_callback)

@router.websocket("/ws/engine")
async def websocket_engine_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            action = message.get("action")
            
            if action == "start":
                # Ensure engine is started
                if not engine_instance.is_running:
                    await engine_instance.start()
                depth = message.get("depth")
                movetime = message.get("movetime")
                await engine_instance.start_analysis(depth=depth, movetime=movetime)
                
            elif action == "start_match":
                if not engine_instance.is_running:
                    await engine_instance.start()
                depth = message.get("depth")
                movetime = message.get("movetime")
                await engine_instance.start_match(depth=depth, movetime=movetime)
                
            elif action == "stop":
                await engine_instance.stop_analysis()
                
            elif action == "set_position":
                fen = message.get("fen")
                if fen:
                    await engine_instance.set_position(fen)
                    # Restart analysis automatically if it was running
                    if engine_instance.analysis_task:
                        await engine_instance.start_analysis()

            elif action == "set_option":
                name = message.get("name")
                value = message.get("value")
                if name and value:
                    engine_instance.settings[name] = str(value)
                    # Apply while running
                    if engine_instance.is_running:
                        await engine_instance._send_command(f"setoption name {name} value {value}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
