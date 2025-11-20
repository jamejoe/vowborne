import React, { useState } from 'react';
import { findEpisodeById } from '../constants';

interface BattleHeaderProps {
  currentBattleInfo: { episodeId: string; stageIndex: number } | null;
  onRetreat: () => void;
  onPayTableToggle: () => void;
}

const BattleHeader: React.FC<BattleHeaderProps> = ({ currentBattleInfo, onRetreat, onPayTableToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!currentBattleInfo) {
    return null;
  }

  const episode = findEpisodeById(currentBattleInfo.episodeId);
  const stage = episode?.stages[currentBattleInfo.stageIndex];
  
  const stageName = stage ? stage.name : '알 수 없는 지역';
  const stageNumber = episode ? `${episode.id.split('_')[1]}-${currentBattleInfo.stageIndex + 1}` : '??';

  return (
    <header className="relative z-20 p-4 bg-black/60 backdrop-blur-sm flex-shrink-0 w-full border-b-4 border-amber-800">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
        {/* Center: Battle Info */}
        <div className="text-center">
          <h1 className="text-5xl font-bold font-cinzel text-amber-300">{stageNumber}: {stageName}</h1>
          <p className="text-3xl text-gray-400">{episode?.name}</p>
        </div>

        {/* Right Side: Menu */}
        <div className="relative">
          <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-3 rounded-lg hover:bg-white/10 transition-colors">
             <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900/90 border-2 border-amber-700 rounded-lg shadow-lg z-30 animate-fade-in-scale-up origin-top-right">
              <button onClick={onPayTableToggle} className="w-full text-left px-6 py-4 text-3xl hover:bg-amber-800/50 transition-colors">
                페이 테이블
              </button>
              <button onClick={onRetreat} className="w-full text-left px-6 py-4 text-3xl text-red-400 hover:bg-red-800/50 transition-colors">
                전투 포기
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default BattleHeader;