import React from 'react';
import { useChessStore } from '../../store/chessStore';
import ecoData from '../../data/eco.json';

export const OpeningExplorer: React.FC = () => {
  const { fen } = useChessStore();
  
  // Try to find the exact FEN in our simple database
  const positionData = (ecoData as any)[fen];

  return (
    <div className="bg-bg-panel rounded-md border border-gray-700 flex flex-col h-[400px] lg:h-[600px] overflow-hidden text-sm">
      <div className="p-3 border-b border-gray-700 bg-[#2c2b29]">
        <h2 className="font-semibold text-gray-200">Opening Explorer</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {positionData ? (
          <div>
            <h3 className="font-bold text-blue-400 mb-3">{positionData.name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 font-semibold mb-1">
                <span>Move</span>
                <span>Games</span>
              </div>
              {positionData.moves.map((move: any, i: number) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-[#33312e] p-1 rounded transition-colors">
                  <div className="flex gap-2 items-center">
                    <span className="w-8 font-bold text-gray-300">{move.san}</span>
                    <span className="text-gray-400 text-xs truncate max-w-[120px]">{move.name}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{move.games.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-10">
            <p>No opening data found for this position.</p>
            <p className="text-xs mt-2">Make a standard opening move (e.g. e4, d4) to see data.</p>
          </div>
        )}
      </div>
    </div>
  );
};
