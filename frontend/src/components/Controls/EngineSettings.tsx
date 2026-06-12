import React from 'react';
import { useChessStore } from '../../store/chessStore';

export const EngineSettings: React.FC = () => {
  const { engineSettings, setEngineSetting, searchLimits, setSearchLimit } = useChessStore();

  return (
    <div className="bg-bg-panel p-4 rounded-md border border-gray-700 text-sm">
      <h3 className="font-semibold border-b border-gray-700 pb-2 mb-3 text-gray-200">Engine Configuration</h3>
      
      <div className="space-y-4">
        {/* Threads */}
        <div>
          <div className="flex justify-between mb-1 text-gray-400">
            <label>Threads</label>
            <span>{engineSettings.Threads}</span>
          </div>
          <input 
            type="range" 
            min="1" max="16" 
            value={engineSettings.Threads} 
            onChange={(e) => setEngineSetting('Threads', parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Hash */}
        <div>
          <div className="flex justify-between mb-1 text-gray-400">
            <label>Hash (MB)</label>
            <span>{engineSettings.Hash}</span>
          </div>
          <input 
            type="range" 
            min="16" max="16384" step="16"
            value={engineSettings.Hash} 
            onChange={(e) => setEngineSetting('Hash', parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* MultiPV */}
        <div>
          <div className="flex justify-between mb-1 text-gray-400">
            <label>MultiPV (Lines)</label>
            <span>{engineSettings.MultiPV}</span>
          </div>
          <input 
            type="range" 
            min="1" max="10" 
            value={engineSettings.MultiPV} 
            onChange={(e) => setEngineSetting('MultiPV', parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Skill Level */}
        <div>
          <div className="flex justify-between mb-1 text-gray-400">
            <label>Skill Level</label>
            <span>{engineSettings.SkillLevel}</span>
          </div>
          <input 
            type="range" 
            min="0" max="20" 
            value={engineSettings.SkillLevel} 
            onChange={(e) => setEngineSetting('SkillLevel', parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <h3 className="font-semibold border-b border-gray-700 pb-2 mt-6 mb-3 text-gray-200">Search Limits</h3>
      
      <div className="space-y-4">
        {/* Depth */}
        <div>
          <div className="flex justify-between mb-1 text-gray-400">
            <label>Depth</label>
            <span>{searchLimits.depth || 'Infinite'}</span>
          </div>
          <input 
            type="range" 
            min="0" max="30" 
            value={searchLimits.depth} 
            onChange={(e) => setSearchLimit('depth', parseInt(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>

        {/* Move Time */}
        <div>
          <div className="flex justify-between mb-1 text-gray-400">
            <label>Max Time (ms)</label>
            <span>{searchLimits.moveTime || 'Infinite'}</span>
          </div>
          <input 
            type="range" 
            min="0" max="10000" step="100"
            value={searchLimits.moveTime} 
            onChange={(e) => setSearchLimit('moveTime', parseInt(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>
      </div>
    </div>
  );
};
