import React, { useEffect, useRef } from 'react';
import { Board } from './components/Board/ChessBoard';
import { EngineAnalysisPanel } from './components/Analysis/EngineAnalysisPanel';
import { EvaluationBar } from './components/Analysis/EvaluationBar';
import { GameControls } from './components/Controls/GameControls';
import { EngineSettings } from './components/Controls/EngineSettings';
import { useChessStore } from './store/chessStore';
import { Chess } from 'chess.js';

function App() {
  const wsRef = useRef<WebSocket | null>(null);
  const { 
    fen, 
    setFen,
    isEngineRunning, 
    isMatchMode,
    isHumanVsEngine,
    boardOrientation,
    updateEngineAnalysis, 
    clearEngineAnalysis,
    setEngineCommandDispatcher,
    engineSettings,
    searchLimits
  } = useChessStore();

  useEffect(() => {
    // Only connect once
    const ws = new WebSocket('ws://localhost:8000/ws/engine');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ action: "set_option", name: "MultiPV", value: String(engineSettings.MultiPV) }));
      ws.send(JSON.stringify({ action: "set_option", name: "Threads", value: String(engineSettings.Threads) }));
      ws.send(JSON.stringify({ action: "set_option", name: "Hash", value: String(engineSettings.Hash) }));
      ws.send(JSON.stringify({ action: "set_option", name: "Skill Level", value: String(engineSettings.SkillLevel) }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "engine_info") {
        if (msg.data.bestmove) {
          // Received a best move from match mode or analysis
          const store = useChessStore.getState();
          if (store.isMatchMode || store.isHumanVsEngine) {
            try {
              // Apply it locally
              const game = new Chess(store.fen);
              const moveStr = msg.data.bestmove;
              const moveObj = {
                from: moveStr.substring(0, 2),
                to: moveStr.substring(2, 4),
                promotion: moveStr.length > 4 ? moveStr.substring(4, 5) : undefined
              };
              game.move(moveObj);
              store.setFen(game.fen());
            } catch (e) {
              console.error("Invalid engine move:", msg.data.bestmove);
            }
          }
        } else if (msg.data.stopped) {
          const store = useChessStore.getState();
          if (!store.isMatchMode && !store.isHumanVsEngine) {
            store.setEngineRunning(false);
          }
        } else {
          updateEngineAnalysis(msg.data);
        }
      }
    };

    setEngineCommandDispatcher((cmd: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(cmd));
      }
    });

    return () => {
      ws.close();
      setEngineCommandDispatcher(() => {});
    };
  }, []); // Note: engineSettings.MultiPV etc in onopen might be stale on reconnect, but that's fine for now

  // Watch for Engine Start/Stop and position updates
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const isEngineTurn = isHumanVsEngine && (
        (boardOrientation === 'white' && fen.split(' ')[1] === 'b') || 
        (boardOrientation === 'black' && fen.split(' ')[1] === 'w')
      );

      if (isMatchMode || isEngineTurn) {
        clearEngineAnalysis();
        wsRef.current.send(JSON.stringify({ action: "set_position", fen }));
        wsRef.current.send(JSON.stringify({ 
          action: "start_match", 
          depth: searchLimits.depth, 
          movetime: searchLimits.moveTime 
        }));
      } else if (isEngineRunning) {
        clearEngineAnalysis();
        wsRef.current.send(JSON.stringify({ action: "set_position", fen }));
        wsRef.current.send(JSON.stringify({ 
          action: "start", 
          depth: searchLimits.depth, 
          movetime: searchLimits.moveTime 
        }));
      } else {
        wsRef.current.send(JSON.stringify({ action: "stop" }));
      }
    }
  }, [isEngineRunning, isMatchMode, isHumanVsEngine, boardOrientation, fen, searchLimits]);

  return (
    <div className="min-h-screen bg-bg-primary text-white flex flex-col">
      {/* Header */}
      <header className="bg-bg-secondary border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">♟️</span> Self-Hosted Chess
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 lg:items-start overflow-y-auto overflow-x-hidden">
        {/* Left Panel - Engine Settings */}
        <div className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 flex-col gap-4 hidden lg:flex">
          <EngineSettings />
        </div>

        {/* Center - Board and Eval Bar */}
        <div className="flex flex-col w-full max-w-[650px] mx-auto gap-4 flex-1">
          <div className="flex flex-row gap-2 sm:gap-4 w-full">
            <div className="w-6 sm:w-8 md:w-10 flex-shrink-0">
              <EvaluationBar />
            </div>
            <div className="flex-1 min-w-0">
              <Board />
            </div>
          </div>
          <GameControls />
        </div>

        {/* Right Panel - Engine Analysis */}
        <div className="flex flex-col gap-4 w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 pb-10">
          <EngineAnalysisPanel />
        </div>
      </main>
    </div>
  );
}

export default App;
