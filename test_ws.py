import asyncio
import websockets
import json

async def test():
    async with websockets.connect("ws://localhost:8000/ws/engine") as ws:
        await ws.send(json.dumps({"action": "start", "depth": 1, "movetime": 1000}))
        msg = await ws.recv()
        print(msg)

asyncio.run(test())
