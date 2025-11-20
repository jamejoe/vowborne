

import React from 'react';
import { Commander, Chapter } from '../types';
import { CHAPTERS, BACKGROUND_IMAGES, EPISODES, MONSTERS, CRAFTING_MATERIALS, CHAPTER_QUESTS, BLUEPRINTS, findEpisodeById } from '../constants';
import { IconLock } from './Icons';

interface WorldMapProps {
    commander: Commander;
    onSelectChapter: (chapterId: string) => void;
    onBack: () => void;
}

const getChapterRewards = (chapter: Chapter) => {
    const materials = new Set<string>();
    const blueprints = new Set<string>();

    // From monster drops
    chapter.episodeIds.forEach(epId => {
        const episode = findEpisodeById(epId);
        episode?.stages.forEach(stage => {
            stage.monsters.forEach(monster => {
                monster.drops?.forEach(drop => {
                    materials.add(drop.materialId);
                });
            });
        });
    });

    // From quest rewards
    const quests = CHAPTER_QUESTS[chapter.id];
    if (quests) {
        Object.values(quests).forEach(quest => {
            if (quest.reward.blueprintId) {
                blueprints.add(quest.reward.blueprintId);
            }
        });
    }

    return {
        materials: Array.from(materials).map(id => CRAFTING_MATERIALS[id]).filter(Boolean),
        blueprints: Array.from(blueprints).map(id => BLUEPRINTS[id]).filter(Boolean)
    };
};

const WorldMap: React.FC<WorldMapProps> = ({ commander, onSelectChapter, onBack }) => {

    return (
        <div className="h-full w-full bg-cover bg-center flex flex-col items-center text-white overflow-hidden relative" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.worldMap}')` }}>
            <div className="absolute inset-0 bg-black/30"></div>

            <header className="relative w-full z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent">
                <h1 className="ui-screen-title !text-6xl">월드 맵</h1>
                <button onClick={onBack} className="ui-button ui-button-secondary">&larr; 용병 캠프로</button>
            </header>

            <main className="w-full flex-grow flex items-center justify-start flex-col overflow-y-auto py-8 px-6">
                <div className="w-full max-w-6xl flex flex-col-reverse gap-8">
                    {CHAPTERS.map(chapter => {
                        const rewards = getChapterRewards(chapter);
                        const isUnlocked = commander.unlockedChapterIds.includes(chapter.id);
                        const isCurrent = commander.currentChapterId === chapter.id;

                        return (
                            <div key={chapter.id} className={`relative ui-panel transition-all duration-300 ${isCurrent ? 'border-yellow-400 border-[6px]' : ''} ${!isUnlocked ? 'opacity-60 grayscale' : ''}`}>
                                {!isUnlocked && (
                                    <div className="absolute inset-0 bg-black/60 rounded-lg z-10 flex flex-col items-center justify-center">
                                        <IconLock className="w-32 h-32 text-gray-400" />
                                        <p className="text-4xl font-bold text-gray-300 mt-4">잠김</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-2">
                                        <h2 className="text-6xl font-bold font-cinzel text-amber-300">{chapter.name.replace('Chapter ', '제 ').replace(':', '장:')}</h2>
                                        <p className="text-3xl text-gray-300 mt-2 mb-6">{chapter.description}</p>
                                        
                                        <div className="mt-4">
                                            <h3 className="text-3xl font-bold text-amber-200 mb-2">주요 획득 정보:</h3>
                                            <div className="flex flex-wrap gap-4">
                                                {rewards.materials.slice(0, 3).map(mat => (
                                                    <div key={mat.id} title={mat.name} className="w-20 h-20 bg-black/40 p-2 rounded-lg border-2 border-gray-600">
                                                        <img src={mat.icon} alt={mat.name} className="w-full h-full object-contain" />
                                                    </div>
                                                ))}
                                                {rewards.blueprints.slice(0, 2).map(bp => (
                                                    <div key={bp.id} title={bp.name} className="w-20 h-20 bg-black/40 p-2 rounded-lg border-2 border-purple-600">
                                                        <img src={bp.icon} alt={bp.name} className="w-full h-full object-contain" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex flex-col items-center justify-center">
                                         <button 
                                            onClick={() => onSelectChapter(chapter.id)} 
                                            disabled={!isUnlocked}
                                            className="ui-button ui-button-primary w-full"
                                        >
                                            탐험
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default WorldMap;
