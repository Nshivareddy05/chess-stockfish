import asyncio
import logging

logger = logging.getLogger(__name__)

class EngineManager:
    def __init__(self, engine_path: str):
        self.engine_path = engine_path
        self.process = None
        self.is_running = False
        self.analysis_task = None
        self.analysis_subscribers = []
        
        # Engine state
        self.current_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        self.settings = {
            "Threads": "8",
            "Hash": "8192",
            "MultiPV": "5",
            "Ponder": "false"
        }

    async def start(self):
        if self.is_running:
            return
        try:
            self.process = await asyncio.create_subprocess_exec(
                self.engine_path,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            self.is_running = True
            
            await self._send_command("uci")
            # Wait for uciok
            while True:
                line = await self._read_line()
                if line == "uciok":
                    break
            
            await self._apply_settings()
            await self._send_command("isready")
            while True:
                line = await self._read_line()
                if line == "readyok":
                    break
                    
            logger.info("Engine started and ready.")
            
        except Exception as e:
            logger.error(f"Failed to start engine: {e}")
            self.is_running = False

    async def _apply_settings(self):
        for key, value in self.settings.items():
            await self._send_command(f"setoption name {key} value {value}")

    async def _send_command(self, cmd: str):
        if not self.is_running or not self.process:
            return
        logger.debug(f"Engine < {cmd}")
        self.process.stdin.write(f"{cmd}\n".encode("utf-8"))
        await self.process.stdin.drain()

    async def _read_line(self) -> str:
        if not self.is_running or not self.process:
            return ""
        line = await self.process.stdout.readline()
        line_str = line.decode("utf-8").strip()
        if line_str:
            logger.debug(f"Engine > {line_str}")
        return line_str

    def subscribe(self, callback):
        self.analysis_subscribers.append(callback)

    def unsubscribe(self, callback):
        if callback in self.analysis_subscribers:
            self.analysis_subscribers.remove(callback)

    async def _notify_subscribers(self, data):
        for callback in self.analysis_subscribers:
            await callback(data)

    async def set_position(self, fen: str):
        self.current_fen = fen
        await self._send_command(f"position fen {fen}")

    async def start_analysis(self, depth: int = None, movetime: int = None):
        if self.analysis_task:
            self.analysis_task.cancel()
        
        cmd = "go"
        if depth and depth > 0:
            cmd += f" depth {depth}"
        if movetime and movetime > 0:
            cmd += f" movetime {movetime}"
            
        if cmd == "go":
            cmd = "go infinite"
            
        await self._send_command(cmd)
        self.analysis_task = asyncio.create_task(self._read_analysis())

    async def stop_analysis(self):
        if self.analysis_task:
            await self._send_command("stop")
            self.analysis_task.cancel()
            self.analysis_task = None

    async def _read_analysis(self):
        try:
            while self.is_running and self.process and self.process.stdout:
                line = await self._read_line()
                if not line:
                    continue
                if line.startswith("info"):
                    parsed = self._parse_info_line(line)
                    if parsed:
                        await self._notify_subscribers(parsed)
                elif line.startswith("bestmove"):
                    # Analysis stopped
                    parts = line.split()
                    if len(parts) > 1:
                        best_move = parts[1]
                        if best_move != "(none)":
                            await self._notify_subscribers({"bestmove": best_move})
                    await self._notify_subscribers({"stopped": True})
                    break
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error reading analysis: {e}")

    def _parse_info_line(self, line: str):
        parts = line.split()
        data = {}
        try:
            if "depth" in parts:
                data["depth"] = int(parts[parts.index("depth") + 1])
            if "multipv" in parts:
                data["multipv"] = int(parts[parts.index("multipv") + 1])
            if "score" in parts:
                score_idx = parts.index("score")
                if parts[score_idx + 1] == "cp":
                    data["score_cp"] = int(parts[score_idx + 2])
                elif parts[score_idx + 1] == "mate":
                    data["score_mate"] = int(parts[score_idx + 2])
            if "pv" in parts:
                pv_idx = parts.index("pv")
                data["pv"] = parts[pv_idx + 1:]
            
            if "nodes" in parts:
                data["nodes"] = int(parts[parts.index("nodes") + 1])
            if "time" in parts:
                data["time"] = int(parts[parts.index("time") + 1])
                
            return data
        except (ValueError, IndexError):
            return None

    async def start_match(self, depth: int = None, movetime: int = None):
        if self.analysis_task:
            self.analysis_task.cancel()
        
        cmd = "go"
        if depth and depth > 0:
            cmd += f" depth {depth}"
        if movetime and movetime > 0:
            cmd += f" movetime {movetime}"
            
        if cmd == "go":
            cmd = "go movetime 1000"
            
        await self._send_command(cmd)
        self.analysis_task = asyncio.create_task(self._read_match())

    async def _read_match(self):
        try:
            while self.is_running and self.process and self.process.stdout:
                line = await self._read_line()
                if not line:
                    continue
                if line.startswith("info"):
                    parsed = self._parse_info_line(line)
                    if parsed:
                        await self._notify_subscribers(parsed)
                elif line.startswith("bestmove"):
                    parts = line.split()
                    if len(parts) > 1:
                        best_move = parts[1]
                        if best_move != "(none)":
                            # Notify websocket to apply this move on the frontend
                            await self._notify_subscribers({"bestmove": best_move})
                    await self._notify_subscribers({"stopped": True})
                    break
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error reading match: {e}")

    async def close(self):
        if self.is_running:
            if self.analysis_task:
                await self.stop_analysis()
            await self._send_command("quit")
            self.is_running = False
            self.process = None

# Global engine instance
engine_instance = EngineManager("/home/shiva-reddy/Desktop/Pro/py/stockfish/stockfish-ubuntu-x86-64-avx2")
