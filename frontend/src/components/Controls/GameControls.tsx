import React from 'react';
import { useChessStore } from '../../store/chessStore';
import { Chess } from 'chess.js';

export const GameControls: React.FC = () => {
  const { setFen, boardOrientation, setBoardOrientation, clearEngineAnalysis, isMatchMode, setMatchMode } = useChessStore();

  const handleNewGame = () => {
    const newGame = new Chess();
    setFen(newGame.fen());
    clearEngineAnalysis();
    setMatchMode(false);
  };

  const handleFlipBoard = () => {
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
  };

  const toggleMatchMode = () => {
    setMatchMode(!isMatchMode);
    if (!isMatchMode) useChessStore.getState().setHumanVsEngine(false);
  };

  const toggleHumanVsEngine = () => {
    useChessStore.getState().setHumanVsEngine(!useChessStore.getState().isHumanVsEngine);
    if (!useChessStore.getState().isHumanVsEngine) setMatchMode(false);
  };

  return (
    <div className="flex flex-wrap gap-2 bg-bg-panel p-3 rounded-md border border-gray-700 mt-4 justify-center shadow-lg">
      <button 
        onClick={handleNewGame}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors text-sm"
      >
        New Game
      </button>
      <button 
        onClick={handleFlipBoard}
        className="px-4 py-2 bg-[#33312e] hover:bg-[#403d39] text-gray-200 rounded font-medium transition-colors text-sm"
      >
        Flip Board
      </button>
      <button 
        onClick={toggleHumanVsEngine}
        className={`px-4 py-2 ${useChessStore.getState().isHumanVsEngine ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-[#33312e] hover:bg-[#403d39] text-gray-200'} rounded font-medium transition-colors text-sm`}
      >
        {useChessStore.getState().isHumanVsEngine ? 'Stop Playing' : 'Play vs Engine'}
      </button>
      <button 
        onClick={toggleMatchMode}
        className={`px-4 py-2 ${isMatchMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-[#33312e] hover:bg-[#403d39] text-gray-200'} rounded font-medium transition-colors text-sm`}
      >
        {isMatchMode ? 'Stop Match' : 'Engine vs Engine'}
      </button>
      <button 
        onClick={handleNewGame}
        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded font-medium transition-colors text-sm"
      >
        Reset
      </button>
    </div>
  );
};
