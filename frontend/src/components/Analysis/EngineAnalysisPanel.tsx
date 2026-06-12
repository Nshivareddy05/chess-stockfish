import React from 'react';
import { useChessStore } from '../../store/chessStore';

export const EngineAnalysisPanel: React.FC = () => {
  const { engineAnalysis, isEngineRunning, setEngineRunning } = useChessStore();

  const lines = Object.values(engineAnalysis).sort((a, b) => a.multipv - b.multipv);

  const toggleEngine = () => {
    // This will be connected to websocket in App.tsx
    setEngineRunning(!isEngineRunning);
  };

  return (
    <div className="w-full h-[400px] lg:h-[600px] bg-[var(--color-bg-panel)] rounded-md border border-gray-700 flex flex-col overflow-hidden text-sm">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-[#2c2b29]">
        <div className="font-semibold text-gray-200">Local Stockfish AVX2</div>
        <button 
          onClick={toggleEngine}
          className={`px-3 py-1 rounded-sm font-medium transition-colors ${isEngineRunning ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'}`}
        >
          {isEngineRunning ? 'Stop Engine' : 'Start Engine'}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 font-mono space-y-2">
        {lines.length === 0 && (
          <div className="text-gray-500 text-center mt-10">
            {isEngineRunning ? 'Analyzing...' : 'Engine stopped.'}
          </div>
        )}
        {lines.map((line) => {
          let evalText = '0.00';
          if (line.score_mate !== undefined) {
            evalText = `M${line.score_mate}`;
          } else if (line.score_cp !== undefined) {
            evalText = (line.score_cp > 0 ? '+' : '') + (line.score_cp / 100).toFixed(2);
          }
          
          return (
            <div key={line.multipv} className="flex gap-3 text-gray-300 hover:bg-[#33312e] p-1 rounded transition-colors cursor-pointer">
              <div className="w-12 text-right font-bold flex-shrink-0 text-[#a0a0a0]">
                {evalText}
              </div>
              <div className="w-8 text-right text-gray-500 flex-shrink-0">
                {line.depth}
              </div>
              <div className="flex-1 truncate text-[#c4c4c4]">
                {line.pv.slice(0, 10).join(' ')}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Stats footer */}
      {lines[0] && (
        <div className="p-2 border-t border-gray-700 bg-[#2c2b29] text-xs text-gray-400 flex justify-between">
          <span>Depth: {lines[0].depth}</span>
          <span>Nodes: {(lines[0].nodes || 0).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};
