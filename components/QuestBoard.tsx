import React, { useState } from 'react';
import { Commander, Quest, SlotSymbol } from '../types';
import { CRAFTING_MATERIALS, BLUEPRINTS, CHAPTER_QUESTS, SLOT_SYMBOLS, UNLOCKABLE_CHARACTERS, BACKGROUND_IMAGES, CHAPTERS } from '../constants';
import { IconCheckCircle, IconGold, IconExp } from './Icons';

interface QuestBoardProps {
  commander: Commander | null;
  onBack: () => void;
  onClaimReward: (questId: string) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ commander, onBack, onClaimReward }) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(CHAPTERS[0].id);

  if (!commander) return null;

  const questsForChapter = Object.values(CHAPTER_QUESTS[activeChapterId] || {});

  const renderQuestCard = (quest: Quest) => {
    const progressData = commander.questProgress[quest.id] || { progress: 0, status: 'incomplete' };
    const { progress, status } = progressData;

    const blueprintReward = quest.reward.blueprintId ? BLUEPRINTS[quest.reward.blueprintId] : null;
    const unlockedCharacter = quest.reward.unlockedCharacterId ? UNLOCKABLE_CHARACTERS.find(c => c.id === quest.reward.unlockedCharacterId) : null;
    
    const targetId = quest.target.id;
    const targetName = CRAFTING_MATERIALS[targetId]?.name || BLUEPRINTS[targetId]?.name || (quest.type === 'COMMANDER_LEVEL_UP' ? '단장 레벨' : targetId);
    const isSpecialQuest = !!unlockedCharacter;

    return (
      <div key={quest.id} className={`quest-card ${isSpecialQuest ? 'quest-card-special' : ''} ${status === 'claimed' ? 'claimed' : ''}`}>
        <div className="flex-grow">
          {status === 'claimed' && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-green-800/80 rounded-full text-2xl font-bold text-white shadow-lg">
              <IconCheckCircle className="w-8 h-8" />
              <span>완료</span>
            </div>
          )}
          <h3 className="text-4xl font-bold text-amber-900 pr-32 mb-3 pb-2 border-b-2 border-amber-900/20 font-cinzel">{quest.title}</h3>
          <p className="text-3xl my-3">{quest.description}</p>
        </div>
        
        <div className="mt-auto">
          <div className="w-full bg-black/20 rounded-full h-6 mt-4 border border-black/30 overflow-hidden">
              <div className="bg-green-600 h-full rounded-full transition-all" style={{width: `${(progress / quest.target.quantity) * 100}%`}}></div>
          </div>
          <p className="text-right text-2xl font-mono mt-1">{targetName}: {progress} / {quest.target.quantity}</p>
          
          <div className="mt-5 pt-4 border-t-2 border-amber-900/30">
              <p className="text-3xl font-bold text-green-800 mb-3">보상:</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-3xl">
                  {quest.reward.gold && ( <span className="flex items-center gap-2 font-bold"><IconGold className="w-8 h-8 text-yellow-700"/> <span className="text-yellow-800">{quest.reward.gold} G</span></span> )}
                  {quest.reward.exp && ( <span className="flex items-center gap-2 font-bold"><IconExp className="w-8 h-8 text-blue-700"/> <span className="text-blue-800">{quest.reward.exp} EXP</span></span> )}
                  {blueprintReward && ( <span className="flex items-center gap-2 font-bold"><img src={blueprintReward.icon} alt={blueprintReward.name} className="w-10 h-10 bg-black/20 rounded"/> <span className="text-purple-800">설계도: {blueprintReward.name}</span></span> )}
                  {unlockedCharacter && ( <span className="flex items-center gap-2 font-bold"><img src={unlockedCharacter.avatar} alt={unlockedCharacter.name} className="w-12 h-12 rounded-full"/> <span className="text-red-800">동료: {unlockedCharacter.name}</span></span> )}
              </div>
          </div>

          {status === 'unclaimed' && (
            <div className="absolute bottom-6 right-6">
              <button
                onClick={() => onClaimReward(quest.id)}
                className="ui-button ui-button-success"
              >
                보상 받기
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full w-full bg-cover bg-center flex flex-col p-6 text-white overflow-hidden" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.hubNightGarrison}')` }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center animate-fade-in-scale-up h-full">
        <header className="w-full text-center flex-shrink-0 my-6 flex justify-between items-center">
          <h1 className="ui-screen-title">의뢰 게시판</h1>
          <button onClick={onBack} className="ui-button ui-button-secondary">
            &larr; 용병 캠프로
          </button>
        </header>

        <div className="flex-shrink-0 flex justify-center gap-6 mb-6">
            {CHAPTERS.map(chapter => (
                 <button key={chapter.id} onClick={() => setActiveChapterId(chapter.id)} className={`px-10 py-4 text-4xl font-bold rounded-t-lg transition-colors ${activeChapterId === chapter.id ? 'bg-black/40 text-yellow-300 border-b-4 border-yellow-300' : 'bg-black/20 text-gray-400'}`}>
                    {chapter.name.split(':')[0]}
                 </button>
            ))}
        </div>

        <main className="w-full flex-grow overflow-y-auto pr-4">
            <div className="quest-card-grid">
                {questsForChapter.length > 0 ? (
                    questsForChapter.map(renderQuestCard)
                ) : (
                    <div className="h-full flex items-center justify-center py-24 col-span-full">
                        <p className="text-center text-gray-400 text-4xl">
                            해당 챕터의 의뢰가 없습니다.
                        </p>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default QuestBoard;