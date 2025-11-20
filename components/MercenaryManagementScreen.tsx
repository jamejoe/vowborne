
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Character, Commander, GoogleUser, Equipment, StatKey, BondingEpisode, DialogueLine } from '../types';
import { BACKGROUND_IMAGES, STAT_DESCRIPTIONS, TRAINING_COURSES, GIFTS, BONDING_EPISODES, COMMANDER_AVATARS } from '../constants';
import { StatIcon } from './StatIcon';

interface MercenaryManagementScreenProps {
  user: GoogleUser | null;
  commander: Commander;
  party: Character[];
  onBack: () => void;
  onSetActiveParty: (newPartyIds: (string | null)[]) => void;
  onEquipItem: (mercId: string, itemInstanceId: string) => void;
  onUnequipItem: (mercId: string, itemType: 'weapon' | 'armor') => void;
  onStartTraining: (mercId: string, courseId: string, isBoosted: boolean) => void;
  onGiveGift: (characterId: string, giftId: string) => void;
  onSpecialLesson: (characterId: string) => void;
  onBondingEpisodeComplete: (characterId: string, episode: BondingEpisode) => void;
  initialTab?: 'profile' | 'equipment' | 'training' | 'rapport' | 'deck';
}

const getEffectiveStats = (merc: Character) => {
    const stats: Record<StatKey, number> = {
        str: merc.str, int: merc.int, vit: merc.vit, agi: merc.agi, dex: merc.dex, luk: merc.luk,
        hp: merc.hp, maxHp: merc.maxHp, skillPower: merc.skillPower,
    };
    const bonusStats: Partial<Record<StatKey, number>> = {};

    [merc.weapon, merc.armor].forEach(eq => {
        if (eq?.stats) {
            for (const [stat, value] of Object.entries(eq.stats)) {
                bonusStats[stat as StatKey] = (bonusStats[stat as StatKey] || 0) + value;
            }
        }
    });
     merc.rapportBonuses.forEach(bonus => {
        if (bonus.stat !== 'specialSkill' && bonus.stat !== 'skillPower' ) {
            bonusStats[bonus.stat as StatKey] = (bonusStats[bonus.stat as StatKey] || 0) + bonus.value;
        }
    });

    const totalStats = { ...stats };
    for (const [stat, value] of Object.entries(bonusStats)) {
        if (stat in totalStats) {
            (totalStats as any)[stat] += value;
        }
    }
    
    return { base: stats, bonus: bonusStats, total: totalStats };
};

const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const useCountdown = (endTime: number | undefined) => {
    const [remainingTime, setRemainingTime] = useState(endTime ? endTime - Date.now() : 0);
    useEffect(() => {
        if (!endTime) {
            setRemainingTime(0);
            return;
        };
        const interval = setInterval(() => {
            const remaining = endTime - Date.now();
            setRemainingTime(remaining > 0 ? remaining : 0);
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);
    return remainingTime;
};

interface BondingEpisodePlayerProps {
  episode: BondingEpisode;
  character: Character;
  user: GoogleUser | null;
  onComplete: () => void;
}

const BondingEpisodePlayer: React.FC<BondingEpisodePlayerProps> = ({ episode, character, user, onComplete }) => {
    const [lineIndex, setLineIndex] = useState(0);
    const currentLine = episode.story[lineIndex];

    const isCommanderSpeaking = currentLine.speaker === 'commander' || currentLine.speaker === character.id;

    const speakerInfo = isCommanderSpeaking
        ? (currentLine.speaker === 'commander' ? { name: user?.name || "단장", avatar: COMMANDER_AVATARS.base } : { name: character.name, avatar: character.avatar })
        : { name: character.name, avatar: character.avatar };
    
    const speakerAvatar = isCommanderSpeaking
        ? (currentLine.speaker === 'commander' ? (currentLine.avatar || COMMANDER_AVATARS.serious) : character.avatar)
        : character.avatar;

    const handleNext = () => {
        if (lineIndex < episode.story.length - 1) {
            setLineIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };
    
    const processText = (text: string) => {
        const commanderName = user?.name;
        if (commanderName) {
          return text.replace(/단장(님)?/g, (match, p1) => `${commanderName} 단장${p1 || ''}`);
        }
        return text;
    };

    return (
        <div className="absolute inset-0 z-50 h-full w-full bg-cover bg-center flex flex-col p-6 text-white cursor-pointer" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.hubNightGarrison}')` }} onClick={handleNext}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-0"></div>
            <div className="relative z-10 flex-grow w-full flex flex-col items-center justify-center animate-fade-in-scale-up">
                <img src={speakerAvatar} alt={speakerInfo.name} className="w-[60rem] h-[60rem] object-contain drop-shadow-2xl"/>
            </div>
            <div className="relative z-20 w-full flex-shrink-0 min-h-[35%] bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col justify-end p-10">
                <div className="w-full max-w-6xl mx-auto pb-6">
                    <p className="text-5xl font-bold text-yellow-300 mb-4">{speakerInfo.name}</p>
                    <p className="text-4xl text-white font-['Noto_Sans_KR'] min-h-[8rem]">{processText(currentLine.line)}</p>
                    <div className="absolute bottom-0 right-0 animate-pulse text-3xl text-yellow-300 font-bold flex items-center gap-2">
                        <span>다음</span>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MercenaryManagementScreen: React.FC<MercenaryManagementScreenProps> = (props) => {
    const { user, commander, party, onBack, onSetActiveParty, onEquipItem, onUnequipItem, onStartTraining, onGiveGift, onSpecialLesson, onBondingEpisodeComplete, initialTab } = props;
    const [selectedMercIndex, setSelectedMercIndex] = useState(0);
    const [activeDetailTab, setActiveDetailTab] = useState<'profile' | 'equipment' | 'training' | 'rapport' | 'deck'>(initialTab || 'profile');
    const [playingEpisode, setPlayingEpisode] = useState<BondingEpisode | null>(null);
    const [deckSelectionId, setDeckSelectionId] = useState<string | null>(null);
    const [dragInfo, setDragInfo] = useState({ active: false, start: 0, dragged: 0 });

    const selectedMerc = useMemo(() => party.length > 0 ? party[selectedMercIndex] : null, [selectedMercIndex, party]);
    const remainingTime = useCountdown(selectedMerc?.trainingStatus?.endTime);

    const { reserveMembers, activeSlots } = useMemo(() => {
        const activeIds = new Set(commander.activeParty.filter(id => id !== null));
        const reserve = party.filter(p => !activeIds.has(p.id));
        const slots = Array.from({ length: 5 }).map((_, i) => {
            const mercId = commander.activeParty[i];
            return party.find(p => p.id === mercId) || null;
        });
        return { reserveMembers: reserve, activeSlots: slots };
    }, [commander.activeParty, party]);

    useEffect(() => {
        if (initialTab) setActiveDetailTab(initialTab);
    }, [initialTab]);

     useEffect(() => {
        if (selectedMercIndex >= party.length && party.length > 0) {
            setSelectedMercIndex(party.length - 1);
        }
    }, [party, selectedMercIndex]);

    const changeMerc = (direction: number) => {
        if (party.length === 0) return;
        const newIndex = (selectedMercIndex + direction + party.length) % party.length;
        setSelectedMercIndex(newIndex);
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        setDragInfo({ active: true, start: pageX, dragged: 0 });
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragInfo.active) return;
        e.preventDefault();
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        const delta = pageX - dragInfo.start;
        setDragInfo(prev => ({ ...prev, dragged: delta }));
    };

    const handleDragEnd = () => {
        if (!dragInfo.active) return;
        const dragThreshold = 100;
        if (Math.abs(dragInfo.dragged) > dragThreshold) {
            if (dragInfo.dragged < 0) {
                changeMerc(1);
            } else {
                changeMerc(-1);
            }
        }
        setDragInfo({ active: false, start: 0, dragged: 0 });
    };


    const handleDeckInteraction = (target: { type: 'merc' | 'slot' | 'reserve_area', mercId?: string, slotIndex?: number }) => {
        if (!deckSelectionId) {
            if (target.type === 'merc' && target.mercId) setDeckSelectionId(target.mercId);
            return;
        }
        if (target.type === 'merc' && target.mercId === deckSelectionId) {
            setDeckSelectionId(null);
            return;
        }
    
        const newActiveParty = [...commander.activeParty];
        while(newActiveParty.length < 5) newActiveParty.push(null); 
    
        const selectedId = deckSelectionId;
        const isSelectedReserve = !newActiveParty.includes(selectedId);
    
        if (target.type === 'slot' || (target.type === 'merc' && newActiveParty.includes(target.mercId))) {
            const targetIndex = target.type === 'slot' ? target.slotIndex! : newActiveParty.indexOf(target.mercId!);
            
            if (isSelectedReserve) {
                const existingIndex = newActiveParty.indexOf(selectedId);
                if(existingIndex > -1) newActiveParty[existingIndex] = null;

                newActiveParty[targetIndex] = selectedId;
            } else { 
                const sourceIndex = newActiveParty.indexOf(selectedId);
                const targetContent = newActiveParty[targetIndex];
                
                newActiveParty[targetIndex] = selectedId;
                newActiveParty[sourceIndex] = targetContent;
            }
        } 
        else if (target.type === 'reserve_area') {
            if (!isSelectedReserve) {
                const sourceIndex = newActiveParty.indexOf(selectedId);
                if (sourceIndex > -1) newActiveParty[sourceIndex] = null;
            } else {
                 setDeckSelectionId(null);
                 return;
            }
        }
        else if (target.type === 'merc' && !newActiveParty.includes(target.mercId!)) {
            setDeckSelectionId(target.mercId!);
            return;
        } else {
            setDeckSelectionId(null);
            return;
        }
    
        onSetActiveParty(newActiveParty.slice(0, 5));
        setDeckSelectionId(null);
    };

    const renderProfileTab = (merc: Character) => {
        const { total, bonus } = getEffectiveStats(merc);
        const STAT_ORDER = ['str', 'int', 'vit', 'agi', 'dex', 'luk'] as const;

        return (
            <div className="space-y-6 animate-fade-in-scale-up">
                <div>
                    <h3 className="ui-section-title !text-4xl">능력치</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-3xl">
                        {STAT_ORDER.map(stat => (
                            <div key={stat} className="flex items-center" title={STAT_DESCRIPTIONS[stat]}>
                                <StatIcon stat={stat} />
                                <span className="uppercase font-bold w-24">{stat}</span>
                                <span className="font-mono w-20 text-right">{total[stat]}</span>
                                {bonus[stat] ? <span className="text-green-400 font-mono ml-3">(+{bonus[stat]})</span> : null}
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="ui-section-title !text-4xl">배경 이야기</h3>
                    <p className="text-3xl text-gray-300 leading-relaxed">{merc.backstory}</p>
                </div>
            </div>
        );
    };
    
    const renderEquipmentTab = (merc: Character) => {
        const availableEquipment = commander.armoryStock;
        
        const renderEquipSlot = (item: Equipment | null, type: 'weapon' | 'armor') => (
            <div className="text-center relative">
                <p className="text-3xl font-bold mb-2">{type === 'weapon' ? '무기' : '방어구'}</p>
                <div className="w-48 h-48 bg-black/40 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                    {item ? <img src={item.icon} alt={item.name} title={item.name} className="w-32 h-32"/> : <span className="text-gray-500 text-2xl">없음</span>}
                </div>
                {item && <button onClick={() => onUnequipItem(merc.id, type)} className="ui-button ui-button-danger !p-2 !text-2xl mt-2">해제</button>}
            </div>
        );

        return (
            <div className="animate-fade-in-scale-up">
                <h3 className="ui-section-title !text-4xl">장착 중인 장비</h3>
                <div className="flex justify-center gap-12 mb-8">
                    {renderEquipSlot(merc.weapon, 'weapon')}
                    {renderEquipSlot(merc.armor, 'armor')}
                </div>
                <h3 className="ui-section-title !text-4xl">보유 장비 (교체)</h3>
                 <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
                    {availableEquipment.length > 0 ? availableEquipment.map(item => (
                        <button key={item.instanceId} onClick={() => onEquipItem(merc.id, item.instanceId)} className="bag-item-card" title={`[${item.type}] ${item.name}`}>
                             <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-2" />
                        </button>
                    )) : <p className="text-3xl text-gray-400 col-span-full text-center py-8">교체할 장비가 없습니다.</p>}
                </div>
            </div>
        );
    };

    const renderTrainingTab = (merc: Character) => {
        if (merc.trainingStatus) {
            const course = TRAINING_COURSES.find(c => c.id === merc.trainingStatus!.courseId);
            return (
                <div className="text-center flex-grow flex flex-col items-center justify-center animate-fade-in-scale-up">
                    <h3 className="text-5xl font-bold text-yellow-300">{merc.name} 훈련 중...</h3>
                    <p className="text-4xl mt-4">'{course?.name || '알 수 없는 훈련'}'</p>
                    <p className="text-9xl font-mono my-8 text-white">{formatTime(remainingTime)}</p>
                </div>
            );
        }

        return (
            <div className="h-full overflow-y-auto pr-2 animate-fade-in-scale-up">
                 <h3 className="ui-section-title !text-4xl">훈련 과정 선택</h3>
                 <div className="space-y-4">
                    {TRAINING_COURSES.map(course => (
                        <div key={course.id} className="p-4 rounded-lg bg-black/30 border-2 border-gray-700">
                            <h4 className="font-bold text-4xl">{course.name}</h4>
                            <p className="text-3xl text-gray-300">{course.description}</p>
                             <p className="text-3xl">시간: {course.durationMinutes}분 / 비용: {course.cost}G</p>
                             <div className="flex justify-end gap-4 mt-2">
                                <button onClick={() => onStartTraining(merc.id, course.id, false)} className="ui-button ui-button-secondary !text-3xl !p-3">일반 훈련</button>
                                <button onClick={() => onStartTraining(merc.id, course.id, true)} className="ui-button ui-button-primary !text-3xl !p-3">특별 훈련 (+{course.commanderBoost.cost}G)</button>
                             </div>
                        </div>
                    ))}
                 </div>
            </div>
        );
    };

    const renderRapportTab = (merc: Character) => {
        return (
            <div className="grid grid-cols-2 gap-6 h-full overflow-y-auto pr-2 animate-fade-in-scale-up">
                <div className="space-y-6">
                  <div>
                      <h3 className="ui-section-title !text-4xl !mb-2">친밀도 보너스</h3>
                       <div className="space-y-2">
                        {merc.rapportBonuses.length > 0 ? merc.rapportBonuses.map((bonus, i) => {
                            const isIconAvailable = ['str', 'int', 'vit', 'agi', 'dex', 'luk'].includes(String(bonus.stat));
                            return (
                                <p key={i} className="text-3xl text-green-300 ml-4 flex items-center">
                                    {isIconAvailable ? ( <StatIcon stat={bonus.stat as 'str' | 'int' | 'vit' | 'agi' | 'dex' | 'luk'} /> ) : ( <div className="w-8 h-8 mr-2 shrink-0" /> )}
                                    {bonus.description}
                                </p>
                            );
                        }) : <p className="text-3xl text-gray-400 ml-4">아직 보너스가 없습니다.</p>}
                      </div>
                  </div>
                  <div>
                      <h3 className="ui-section-title !text-4xl !mb-2">특별한 이야기</h3>
                      <div className="space-y-2">
                        {Object.values(BONDING_EPISODES)
                          .filter((ep: BondingEpisode) => ep.characterId === merc.id)
                          .sort((a,b) => a.prerequisites.rapport - b.prerequisites.rapport)
                          .map(episode => {
                           const isCompleted = (merc.completedBondingEpisodes || []).includes(episode.id);
                           const isUnlocked = merc.rapport >= episode.prerequisites.rapport;
                           return (
                               <button key={episode.id} onClick={() => setPlayingEpisode(episode)} 
                                   disabled={!isUnlocked || isCompleted}
                                   className={`w-full p-4 rounded-lg text-left text-3xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 ${isCompleted ? 'bg-gray-700/50 border-gray-600 text-gray-400' : isUnlocked ? 'bg-purple-800/50 hover:bg-purple-700/50 border-purple-500' : 'bg-black/40 border-gray-700'}`}
                               >
                                   {isCompleted ? `[완료] ` : ''}{episode.title}
                                   {!isUnlocked && <span className="text-sm text-red-400"> (친밀도 {episode.prerequisites.rapport} 필요)</span>}
                               </button>
                           );
                        })}
                      </div>
                  </div>
                </div>
                <div className="bg-black/30 p-6 rounded-lg flex flex-col justify-between">
                    <div>
                        <h3 className="ui-section-title !text-4xl !mb-2">선물하기</h3>
                        <div className="flex flex-wrap gap-4">
                            {commander.gifts.length > 0 ? commander.gifts.map(giftItem => {
                                const gift = GIFTS[giftItem.id];
                                return gift ? (
                                <button key={gift.id} onClick={() => onGiveGift(merc.id, gift.id)} className="ui-button ui-button-secondary !text-3xl !p-3 flex items-center gap-3">
                                    <img src={gift.icon} alt={gift.name} className="w-12 h-12" />
                                    (x{giftItem.quantity})
                                </button>
                                ) : null
                            }) : <p className="text-gray-400 text-3xl ml-4">선물이 없습니다.</p>}
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <h3 className="text-5xl font-bold mb-4 text-yellow-300">특별 수업</h3>
                        <p className="text-3xl text-gray-300 mb-6">단장과의 1:1 수업으로 친밀도를 크게 향상시킵니다. (+15)</p>
                        <p className={`text-4xl mb-4 ${commander.gold < 200 ? 'text-red-400' : 'text-yellow-400'}`}>
                            비용: <span className="font-bold">{commander.gold.toLocaleString()} / 200 G</span>
                        </p>
                        <button onClick={() => onSpecialLesson(merc.id)} disabled={commander.gold < 200} className="ui-button ui-button-primary !text-4xl w-full">실시</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDeckManagementTab = () => {
        return (
            <div className="flex flex-col h-full gap-6 animate-fade-in-scale-up">
                <div className="flex flex-col">
                    <h3 className="ui-section-title !text-4xl !mb-2 text-center">출정 부대 ({commander.activeParty.filter(id => id).length} / 5)</h3>
                    <div className="grid grid-cols-5 gap-4">
                        {activeSlots.map((merc, i) => (
                            merc ? (
                                <div key={merc.id} onClick={() => handleDeckInteraction({ type: 'merc', mercId: merc.id })} className={`bg-black/40 rounded-lg relative shadow-md cursor-pointer aspect-square overflow-hidden transition-all duration-200 ${deckSelectionId === merc.id ? 'deck-slot-selected' : 'hover:bg-black/60'}`}>
                                    <img src={merc.avatar} alt={merc.name} className="w-full h-full object-cover object-top" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent text-center">
                                        <p className="text-3xl font-bold truncate text-white">{merc.name}</p>
                                        <p className="text-2xl text-gray-300">{merc.jobClass}</p>
                                    </div>
                                </div>
                            ) : (
                                <div key={`empty-${i}`} onClick={() => handleDeckInteraction({ type: 'slot', slotIndex: i })} className="p-3 bg-black/20 rounded-lg border-4 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:bg-black/40 hover:border-amber-500 transition-all aspect-square">
                                    <span className="text-8xl text-gray-500">+</span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
                <div className="flex flex-col flex-grow overflow-hidden" onClick={() => handleDeckInteraction({ type: 'reserve_area' })}>
                    <h3 className="ui-section-title !text-4xl !mb-2 text-center">예비 부대 ({reserveMembers.length})</h3>
                    <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 flex-grow">
                        {reserveMembers.map(merc => (
                             <div key={merc.id} onClick={(e) => { e.stopPropagation(); handleDeckInteraction({ type: 'merc', mercId: merc.id }); }} className={`bg-black/40 rounded-lg relative shadow-md cursor-pointer aspect-square overflow-hidden transition-all duration-200 ${deckSelectionId === merc.id ? 'deck-slot-selected' : 'hover:bg-black/60'}`}>
                                <img src={merc.avatar} alt={merc.name} className="w-full h-full object-cover object-top" />
                                <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent text-center">
                                    <p className="text-2xl font-bold truncate text-white">{merc.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
  
    const TABS: { id: 'profile' | 'equipment' | 'training' | 'rapport' | 'deck'; label: string }[] = [
        { id: 'profile', label: '프로필' }, { id: 'equipment', label: '장비' },
        { id: 'training', label: '훈련' }, { id: 'rapport', label: '관계' },
        { id: 'deck', label: '덱 편성' }
    ];

    return (
        <div className="h-full w-full bg-cover bg-center flex flex-col p-6 text-white overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.hubDayGarrison}')` }}></div>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
            
            <header className="relative z-20 w-full text-center flex-shrink-0 my-6 flex justify-between items-center">
                <h1 className="ui-screen-title">용병 관리</h1>
                <button onClick={onBack} className="ui-button ui-button-secondary">&larr; 용병 캠프로</button>
            </header>

            <main 
                className="flex-grow w-full relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <button onClick={() => changeMerc(-1)} className="absolute left-8 top-1/2 -translate-y-1/2 z-30 ui-button ui-button-secondary !p-4 !text-5xl">&lt;</button>
                
                <div className="absolute w-full h-full">
                     {party.map((merc, index) => {
                        const offset = index - selectedMercIndex;
                        const dragOffset = dragInfo.active ? dragInfo.dragged : 0;
                        const transitionStyle = dragInfo.active ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                        if (Math.abs(offset) > 2) return null;

                        return (
                            <div
                                key={merc.id}
                                className="absolute top-0 left-0 w-full h-full flex items-end justify-center pointer-events-none"
                                style={{
                                    transform: `translateX(calc(${offset * 70}% + ${dragOffset}px)) scale(${1 - Math.abs(offset) * 0.3})`,
                                    zIndex: party.length - Math.abs(offset),
                                    opacity: 1 - Math.abs(offset) * 0.4,
                                    transition: transitionStyle,
                                }}
                            >
                                <img
                                    src={merc.avatar}
                                    alt={merc.name}
                                    className="h-full max-h-[80vh] object-contain drop-shadow-2xl"
                                />
                            </div>
                        );
                    })}
                </div>

                <button onClick={() => changeMerc(1)} className="absolute right-8 top-1/2 -translate-y-1/2 z-30 ui-button ui-button-secondary !p-4 !text-5xl">&gt;</button>
            </main>

            <footer className="relative z-10 w-full flex-shrink-0 h-[60%] ui-panel p-6 flex flex-col">
                {selectedMerc ? (
                    <div key={selectedMerc.id} className="w-full h-full flex flex-col animate-fade-in-scale-up">
                        <div className="text-center mb-4 flex-shrink-0">
                            <h2 className="text-7xl font-bold font-cinzel">{selectedMerc.name}</h2>
                            <p className="text-4xl text-gray-400">{selectedMerc.jobClass}</p>
                        </div>
                        <div className="armory-primary-tabs flex-shrink-0">
                           {TABS.map(tab => (
                               <button key={tab.id} onClick={() => setActiveDetailTab(tab.id)} className={`armory-tab-button ${activeDetailTab === tab.id ? 'active' : ''}`}>
                                   {tab.label}
                               </button>
                           ))}
                        </div>
                        <div className="flex-grow overflow-hidden p-4">
                            {activeDetailTab === 'profile' && renderProfileTab(selectedMerc)}
                            {activeDetailTab === 'equipment' && renderEquipmentTab(selectedMerc)}
                            {activeDetailTab === 'training' && renderTrainingTab(selectedMerc)}
                            {activeDetailTab === 'rapport' && renderRapportTab(selectedMerc)}
                            {activeDetailTab === 'deck' && renderDeckManagementTab()}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-5xl text-gray-400">
                        소속된 용병이 없습니다.
                    </div>
                )}
            </footer>

             {playingEpisode && selectedMerc && (
                <BondingEpisodePlayer
                    episode={playingEpisode}
                    character={selectedMerc}
                    user={user}
                    onComplete={() => {
                        onBondingEpisodeComplete(selectedMerc.id, playingEpisode);
                        setPlayingEpisode(null);
                    }}
                />
            )}
        </div>
    );
};

export default MercenaryManagementScreen;
