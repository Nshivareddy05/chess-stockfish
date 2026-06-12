import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useChessStore } from '../../store/chessStore';

export const Board: React.FC = () => {
  const { fen, setFen, boardOrientation } = useChessStore();
  const [game, setGame] = useState(new Chess(fen));

  // Sync internal game with global FEN if it changes externally
  useEffect(() => {
    if (fen !== game.fen()) {
      try {
        const newGame = new Chess(fen);
        setGame(newGame);
      } catch (e) {
        console.error("Invalid FEN", e);
      }
    }
  }, [fen, game]);

  const onDrop = useCallback((sourceSquare: string, targetSquare: string, piece: string) => {
    // Check if it's a pawn moving to the 1st or 8th rank
    const isPawn = piece[1] === 'P' || piece[1] === 'p';
    const isPromotion = isPawn && (targetSquare[1] === '1' || targetSquare[1] === '8');

    const move: any = {
      from: sourceSquare,
      to: targetSquare,
    };

    if (isPromotion) {
      move.promotion = 'q'; // Automatically promote to Queen
    }

    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);

      if (result) {
        setGame(newGame);
        setFen(newGame.fen());
        return true;
      }
    } catch (e) {
      // Invalid move
    }
    return false;
  }, [game, setFen]);

  return (
    <div className="w-full aspect-square shadow-2xl rounded-sm overflow-hidden border border-gray-800">
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop}
        boardOrientation={boardOrientation}
        customDarkSquareStyle={{ backgroundColor: 'var(--color-board-dark)' }}
        customLightSquareStyle={{ backgroundColor: 'var(--color-board-light)' }}
        animationDuration={200}
      />
    </div>
  );
};
