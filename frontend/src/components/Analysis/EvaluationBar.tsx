import React, { useMemo } from 'react';
import { useChessStore } from '../../store/chessStore';
import { Chess } from 'chess.js';

export const EvaluationBar: React.FC = () => {
  const { engineAnalysis, fen } = useChessStore();
  
  const mainLine = engineAnalysis[1]; // MultiPV 1
  
  const { percentage, text } = useMemo(() => {
    let evalText = '0.0';
    let evalScore = 0; // cp
    
    // Check whose turn it is to display correctly
    const isWhite = fen.split(' ')[1] === 'w';

    if (mainLine) {
      if (mainLine.score_mate !== undefined) {
        evalText = `M${Math.abs(mainLine.score_mate)}`;
        evalScore = mainLine.score_mate > 0 ? 10000 : -10000;
        if (!isWhite) {
            evalScore = -evalScore;
        }
      } else if (mainLine.score_cp !== undefined) {
        let cp = mainLine.score_cp;
        if (!isWhite) {
            cp = -cp;
        }
        evalText = (cp > 0 ? '+' : '') + (cp / 100).toFixed(1);
        evalScore = cp;
      }
    }

    // Convert centipawns to a percentage for the bar (cap at +/- 1000 cp = +/- 10.0)
    const MAX_CP = 1000;
    const clampedScore = Math.max(-MAX_CP, Math.min(MAX_CP, evalScore));
    
    // Non-linear scaling: small advantages are more visible
    // A simple approach: percentage = 50 + (clampedScore / MAX_CP) * 50
    // Actually, chess.com uses a sigmoid-like curve. Let's use simple scaling for now.
    let p = 50 + (clampedScore / 20); // 100cp = 5% shift
    p = Math.max(0, Math.min(100, p));
    
    return { percentage: p, text: evalText };
  }, [mainLine, fen]);

  return (
    <div className="w-full h-full min-h-[300px] bg-[#262421] border border-gray-700 flex flex-col relative overflow-hidden rounded-md">
      {/* Black fill (top) */}
      <div 
        className="w-full bg-[#403d39] transition-all duration-500 ease-out flex justify-center pt-2 text-xs font-bold text-gray-400"
        style={{ height: `${100 - percentage}%` }}
      >
        {percentage < 50 && <span>{text}</span>}
      </div>
      
      {/* White fill (bottom) */}
      <div 
        className="w-full bg-[#f8f8f8] transition-all duration-500 ease-out flex items-end justify-center pb-2 text-xs font-bold text-gray-800"
        style={{ height: `${percentage}%` }}
      >
        {percentage >= 50 && <span>{text}</span>}
      </div>
    </div>
  );
};
