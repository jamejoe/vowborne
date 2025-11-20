import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Character, GoogleUser, JobClass, Commander } from '../types';
import { JOB_CLASSES, PERSONALITIES, HUB_BACKGROUNDS } from '../constants';
import {
  IconBountyBoard,
  IconDispatch,
  IconUsers,
  IconScroll,
  IconExp,
  IconTraining,
  IconSettings,
  IconGold,
  IconBarracks,
} from './Icons';

type NotificationType = 'mercenaryManagement' | 'questBoard' | 'requests';

interface GameHubProps {
  user: GoogleUser | null;
  commander: Commander | null;
  party: Character[];
  onStartExploration: () => void;
  onLogout: () => void;
  onOpenMercenaryManagement: (initialTab?: 'profile' | 'equipment' | 'training' | 'rapport' | 'deck') => void;
  onOpenCommandersOffice: () => void;
  onOpenQuestBoard: () => void;
  onOpenRequestModal: (mercId: string) => void;
  notifications: {
    mercenaryManagement: number;
    questBoard: number;
    requests: number;
  };
  onClearNotifications: (menu: NotificationType) => void;
}

const ExpBar: React.FC<{ current: number, max: number }> = ({ current, max }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="w-full bg-black/50 rounded-full h-10 border-2 border-amber-800 overflow-hidden relative shadow-inner" title={`${current} / ${max} EXP`}>
            <div
                className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-black tabular-nums">
                {Math.floor(current)} / {max}
            </span>
        </div>
    );
};

const Mercenary: React.FC<{merc: Character, position: {x: number, y: number}, dialogue: string | null, hasRequest: boolean, onClick: () => void}> = ({merc, position, dialogue, hasRequest, onClick}) => {
    return (
        <div 
            className="absolute transition-all duration-1000 flex flex-col items-center group cursor-pointer"
            style={{ 
                left: `${position.x}%`, 
                top: `${position.y}%`, 
                transform: 'translate(-50%, -50%)',
                zIndex: Math.round(position.y)
            }}
            onClick={onClick}
        >
             {hasRequest && (
                <div className="absolute top-0 right-0 z-10 animate-bounce" style={{transform: 'translate(20%, -20%)'}}>
                  <div className="relative">
                    <svg className="w-24 h-24 text-yellow-300 filter drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" ></path></svg>
                  </div>
                </div>
            )}
            {dialogue && (
                <div 
                    className="relative mb-4 w-max max-w-lg p-4 bg-black/80 rounded-lg text-center text-3xl animate-fade-in-scale-up border-2 border-gray-600"
                    style={{ order: -1 }}
                >
                    <p>{dialogue}</p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/80"></div>
                </div>
            )}
            <img src={merc.avatar} alt={merc.name} className={`w-[32rem] h-[32rem] object-contain drop-shadow-lg group-hover:scale-105 transition-transform ${merc.trainingStatus ? 'grayscale animate-pulse' : ''}`}/>
             {merc.trainingStatus && (
                <div className="absolute bottom-24 text-center">
                    <p className="text-4xl font-bold bg-black/80 px-6 py-2 rounded-full text-yellow-300 animate-pulse border-2 border-yellow-500">훈련중...</p>
                </div>
            )}
        </div>
    );
};

const GameHub: React.FC<GameHubProps> = ({ user, commander, party, onStartExploration, onLogout, onOpenMercenaryManagement, onOpenCommandersOffice, onOpenQuestBoard, onOpenRequestModal, notifications, onClearNotifications }) => {
  const [mercPositions, setMercPositions] = useState<{[key: string]: {x: number, y: number}}>({});
  const [mercDialogues, setMercDialogues] = useState<{[key: string]: string | null}>({});
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const dialogueIntervalRef = useRef<number | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const characterIdsWithRequests = useMemo(() => new Set(commander?.requests.map(r => r.characterId) || []), [commander?.requests]);

  useEffect(() => {
    const initialPositions: {[key: string]: {x: number, y: number}} = {};
    party.forEach((merc, index) => {
        initialPositions[merc.id] = {
            x: 20 + (index * 20) % 60,
            y: 65 + Math.floor(index / 3) * 10
        };
    });
    setMercPositions(initialPositions);

    const updateDialogues = () => {
        const newDialogues: {[key:string]: string | null} = {};
        party.forEach(merc => {
            if (!merc.trainingStatus && Math.random() < 0.2) { // 20% chance to speak
                const personalityDialogues = PERSONALITIES[merc.personality].dialogue;
                newDialogues[merc.id] = personalityDialogues[Math.floor(Math.random() * personalityDialogues.length)];
            } else {
                newDialogues[merc.id] = null;
            }
        });
        setMercDialogues(newDialogues);
    };

    dialogueIntervalRef.current = window.setInterval(updateDialogues, 8000);
    updateDialogues(); // Initial call

    return () => {
        if (dialogueIntervalRef.current) {
            clearInterval(dialogueIntervalRef.current);
        }
    };
  }, [party]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
            setIsSettingsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsMenuRef]);
  
  if (!commander) return <div>Loading...</div>;

  const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18;
  const backgroundIndex = Math.min(commander.guildLevel - 1, HUB_BACKGROUNDS.day.length - 1);
  const backgroundUrl = isDay ? HUB_BACKGROUNDS.day[backgroundIndex] : HUB_BACKGROUNDS.night[backgroundIndex];
  
  return (
    <div className="h-full w-full bg-cover bg-center relative flex flex-col items-center text-white overflow-hidden p-8" style={{backgroundImage: `url('${backgroundUrl}')`}}>
        <header className="hub-header">
            <div className="flex items-center gap-6">
                 <div className="text-4xl">
                    <p className="font-bold text-amber-300">Lv. {commander.level}</p>
                    <p className="flex items-center gap-2"><IconGold className="w-8 h-8 text-yellow-500" /> {commander.gold.toLocaleString()}</p>
                </div>
                <div className="w-96">
                    <ExpBar current={commander.exp} max={commander.expToNextLevel} />
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-5xl font-bold">용병 캠프</h2>
                <p className="text-3xl text-gray-400">활동 거점</p>
            </div>
            <div className="relative" ref={settingsMenuRef}>
                <button onClick={() => setIsSettingsMenuOpen(p => !p)} className="p-3 rounded-lg hover:bg-white/10 transition-colors">
                    <IconSettings className="w-16 h-16" />
                </button>
                {isSettingsMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900/90 border-2 border-amber-700 rounded-lg shadow-lg z-30 animate-fade-in-scale-up origin-top-right">
                        <button onClick={onLogout} className="w-full text-left px-6 py-4 text-3xl text-red-400 hover:bg-red-800/50 transition-colors">
                            로그아웃
                        </button>
                    </div>
                )}
            </div>
        </header>

        {/* Mercenaries */}
        <div className="w-full h-full absolute inset-0">
            {party.map(merc => (
                mercPositions[merc.id] && <Mercenary 
                    key={merc.id} 
                    merc={merc} 
                    position={mercPositions[merc.id]} 
                    dialogue={mercDialogues[merc.id]}
                    hasRequest={characterIdsWithRequests.has(merc.id)}
                    onClick={() => {
                        if (characterIdsWithRequests.has(merc.id)) {
                            onOpenRequestModal(merc.id);
                        }
                    }}
                 />
            ))}
        </div>
        
        <nav className="hub-nav-bar">
            <button onClick={() => { onOpenMercenaryManagement(); onClearNotifications('mercenaryManagement'); }} className="hub-nav-button relative">
                <IconUsers className="w-16 h-16"/>
                <span className="text-3xl font-bold">용병 관리</span>
                {notifications.mercenaryManagement > 0 && <span className="notification-badge">{notifications.mercenaryManagement}</span>}
            </button>
            <button onClick={() => { onOpenCommandersOffice(); }} className="hub-nav-button relative">
                <IconExp className="w-16 h-16"/>
                <span className="text-3xl font-bold">단장실</span>
            </button>
            <button onClick={onStartExploration} className="hub-nav-button relative">
                <IconDispatch className="w-16 h-16"/>
                <span className="text-3xl font-bold">월드 맵</span>
            </button>
            <button onClick={() => { onOpenQuestBoard(); onClearNotifications('questBoard'); }} className="hub-nav-button relative">
                <IconBountyBoard className="w-16 h-16"/>
                <span className="text-3xl font-bold">의뢰</span>
                 {notifications.questBoard > 0 && <span className="notification-badge">{notifications.questBoard}</span>}
            </button>
        </nav>
    </div>
  );
};

export default GameHub;