import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Character, Commander, TrainingCourse, StatKey } from '../types';
import { TRAINING_COURSES, STAT_DESCRIPTIONS, BACKGROUND_IMAGES } from '../constants';
import { StatIcon } from './StatIcon';

// Helper to format time from milliseconds
const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Custom hook for countdown timer
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

interface TrainingGroundProps {
  commander: Commander | null;
  party: Character[];
  onStartTraining: (mercId: string, courseId: string, isBoosted: boolean) => void;
  onBack: () => void;
  onCompleteTrainingInstantly: (mercId: string) => void;
  onCancelTraining: (mercId: string) => void;
  initialSelectedMercId?: string | null;
}

export const TrainingGround: React.FC<TrainingGroundProps> = ({ commander, party, onStartTraining, onBack, onCompleteTrainingInstantly, onCancelTraining, initialSelectedMercId }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [dragInfo, setDragInfo] = useState({ active: false, start: 0, dragged: 0 });
    const wasDraggedRef = useRef(false);
    const [confirmationModal, setConfirmationModal] = useState<{ merc: Character; course: TrainingCourse; isBoosted: boolean; } | null>(null);
    const [cancelConfirmationModal, setCancelConfirmationModal] = useState<Character | null>(null);

    useEffect(() => {
        if (initialSelectedMercId) {
            const initialIndex = party.findIndex(p => p.id === initialSelectedMercId);
            if (initialIndex !== -1) {
                setSelectedIndex(initialIndex);
            }
        }
    }, [initialSelectedMercId, party]);

    const selectedMerc = useMemo(() => party.length > 0 ? party[selectedIndex] : null, [selectedIndex, party]);
    const selectedCourse = useMemo(() => selectedCourseId ? TRAINING_COURSES.find(c => c.id === selectedCourseId) : null, [selectedCourseId]);

    const remainingTime = useCountdown(selectedMerc?.trainingStatus?.endTime);

    useEffect(() => {
        if (selectedIndex >= party.length && party.length > 0) {
            setSelectedIndex(party.length - 1);
        }
    }, [party, selectedIndex]);
    
    useEffect(() => {
        setSelectedCourseId(null);
    }, [selectedIndex]);

    const handleStartTrainingClick = (isBoosted: boolean) => {
      if (!selectedMerc || !selectedCourse) return;
      setConfirmationModal({ merc: selectedMerc, course: selectedCourse, isBoosted });
    };

    const executeTraining = () => {
        if (confirmationModal) {
            onStartTraining(confirmationModal.merc.id, confirmationModal.course.id, confirmationModal.isBoosted);
            setConfirmationModal(null);
        }
    };
    
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        setDragInfo({ active: true, start: pageX, dragged: 0 });
        wasDraggedRef.current = false;
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragInfo.active) return;
        e.preventDefault();
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        const delta = pageX - dragInfo.start;
        if (Math.abs(delta) > 10) wasDraggedRef.current = true;
        setDragInfo(prev => ({ ...prev, dragged: delta }));
    };

    const handleDragEnd = () => {
        if (!dragInfo.active) return;
        const dragThreshold = 100;
        if (Math.abs(dragInfo.dragged) > dragThreshold) {
            if (dragInfo.dragged < 0) { // Swiped left
                setSelectedIndex(i => Math.min(i + 1, party.length - 1));
            } else { // Swiped right
                setSelectedIndex(i => Math.max(i - 1, 0));
            }
        }
        setDragInfo({ active: false, start: 0, dragged: 0 });
    };

    if (!commander) return null;
    
    const canAffordMerc = selectedMerc && selectedCourse ? selectedMerc.gold >= selectedCourse.cost : false;
    const canAffordCommander = selectedCourse ? commander.gold >= selectedCourse.commanderBoost.cost : false;

    return (
        <div className="h-full w-full bg-cover bg-center flex flex-col p-6 text-white overflow-hidden" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.trainingGround}')` }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
            
            <header className="relative z-20 flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="ui-screen-title">훈련소</h1>
                     <p className="text-4xl text-amber-200/80">
                        단장 자금: <span className="font-bold text-yellow-400">{commander.gold.toLocaleString()} G</span>
                    </p>
                </div>
                <button onClick={onBack} className="ui-button ui-button-secondary">&larr; 용병 캠프로</button>
            </header>

            <main 
                className="flex-grow w-full relative cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd} onTouchCancel={handleDragEnd}
            >
                {party.map((merc, index) => {
                    const offset = index - selectedIndex;
                    const dragOffset = dragInfo.active ? dragInfo.dragged : 0;
                    
                    if (Math.abs(offset) > 2) return null;

                    return (
                        <div
                            key={merc.id}
                            className="training-merc-slide"
                            style={{
                                transform: `
                                    translateX(calc(-50% + ${offset * 60}% + ${dragOffset}px)) 
                                    translateY(-50%) 
                                    scale(${1 - Math.abs(offset) * 0.35})
                                `,
                                zIndex: party.length - Math.abs(offset),
                                filter: `blur(${Math.abs(offset) * 4}px) grayscale(${Math.abs(offset) * 50}%)`,
                                opacity: 1 - Math.abs(offset) * 0.6,
                                transition: dragInfo.active ? 'none' : undefined,
                            }}
                        >
                            <img src={merc.avatar} alt={merc.name} />
                        </div>
                    );
                })}
            </main>

            <footer className="training-footer-panel flex-shrink-0">
                {selectedMerc ? (
                    <div className="w-full h-full flex flex-col animate-fade-in-scale-up">
                        <div className="text-center mb-6 flex-shrink-0">
                            <h2 className="text-7xl font-bold font-cinzel">{selectedMerc.name}</h2>
                            <p className="text-5xl text-yellow-400 font-mono">{selectedMerc.gold.toLocaleString()} G</p>
                        </div>
                        
                        {selectedMerc.trainingStatus ? (
                            <div className="text-center flex-grow flex flex-col items-center justify-center">
                                <h3 className="text-5xl font-bold text-yellow-300">{selectedMerc.name} 훈련 중...</h3>
                                <p className="text-9xl font-mono my-8 text-white">{formatTime(remainingTime)}</p>
                                <div className="flex justify-center gap-8">
                                    <button
                                        onClick={() => {
                                            if (selectedMerc) {
                                                const remainingMinutes = Math.max(1, Math.ceil(remainingTime / 60000));
                                                const cost = remainingMinutes * 5;
                                                if (window.confirm(`${selectedMerc.name}의 훈련을 즉시 완료하시겠습니까? (비용: ${cost}G)`)) {
                                                    onCompleteTrainingInstantly(selectedMerc.id);
                                                }
                                            }
                                        }}
                                        className="ui-button ui-button-success"
                                    >
                                        즉시 완료
                                    </button>
                                    <button
                                        onClick={() => selectedMerc && setCancelConfirmationModal(selectedMerc)}
                                        className="ui-button ui-button-danger"
                                    >
                                        훈련 취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-grow grid grid-cols-2 gap-8 overflow-hidden">
                                <div className="flex flex-col ui-panel p-4">
                                    <h3 className="ui-section-title !text-4xl flex-shrink-0">훈련 과정 선택</h3>
                                    <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                                        {TRAINING_COURSES.map(course => (
                                            <div
                                                key={course.id}
                                                onClick={() => setSelectedCourseId(course.id)}
                                                className={`p-5 rounded-lg cursor-pointer transition-all border-4 training-card ${selectedCourseId === course.id ? 'bg-amber-800/50 border-amber-500' : 'bg-gray-800/70 border-gray-700'}`}
                                            >
                                                <h4 className="font-bold text-4xl">{course.name}</h4>
                                                <p className="text-3xl text-gray-300">{course.durationMinutes}분 / {course.cost.toLocaleString()}G</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="ui-panel p-6 flex flex-col justify-between">
                                    {selectedCourse ? (
                                        <>
                                            <div>
                                                <h3 className="text-5xl font-bold text-yellow-300">{selectedCourse.name}</h3>
                                                <p className="text-3xl text-gray-300 my-4">{selectedCourse.description}</p>
                                                <div className="my-4 border-t-2 border-gray-600 pt-4 space-y-2">
                                                    {Object.entries(selectedCourse.statBoost).map(([stat, value]) => {
                                                        const statKey = stat as StatKey;
                                                        const isIconAvailable = ['str', 'int', 'vit', 'agi', 'dex', 'luk'].includes(statKey);
                                                        return (
                                                            <div key={stat} className="flex items-center text-4xl" title={STAT_DESCRIPTIONS[stat]}>
                                                                {isIconAvailable ? (
                                                                    <StatIcon stat={statKey as 'str' | 'int' | 'vit' | 'agi' | 'dex' | 'luk'} />
                                                                ) : (
                                                                    <div className="w-8 h-8 mr-2" />
                                                                )}
                                                                <span className="uppercase font-bold w-32">{stat}</span>
                                                                <span className="font-mono text-green-300">+{value}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-6">
                                                    <h4 className="text-3xl font-bold text-yellow-500">단장 지원</h4>
                                                    <p className="text-3xl text-gray-300">{selectedCourse.commanderBoost.description}</p>
                                                    <p className="text-3xl">비용: <span className="font-bold text-yellow-400">{selectedCourse.commanderBoost.cost.toLocaleString()} G</span></p>
                                                </div>
                                            </div>
                                            <div className="mt-auto grid grid-cols-2 gap-6">
                                                <button
                                                    onClick={() => handleStartTrainingClick(false)}
                                                    disabled={!canAffordMerc}
                                                    className="ui-button ui-button-secondary"
                                                >
                                                    일반 훈련
                                                </button>
                                                <button
                                                    onClick={() => handleStartTrainingClick(true)}
                                                    disabled={!canAffordMerc || !canAffordCommander}
                                                    className="ui-button ui-button-primary"
                                                >
                                                    특별 훈련
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-4xl text-gray-400 p-6 text-center">
                                            훈련 과정을 선택하세요.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-5xl text-gray-400">
                        훈련 보낼 용병이 없습니다.
                    </div>
                )}
            </footer>

            {confirmationModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2 className="modal-title">훈련 확인</h2>
                        <p className="modal-body">
                            {confirmationModal.merc.name}에게 '{confirmationModal.course.name}' 훈련을 시작하시겠습니까?
                            {confirmationModal.isBoosted && ` (단장 지원 포함)`}
                        </p>
                        <div className="modal-footer">
                            <button onClick={() => setConfirmationModal(null)} className="ui-button ui-button-secondary">취소</button>
                            <button onClick={executeTraining} className="ui-button ui-button-primary">시작</button>
                        </div>
                    </div>
                </div>
            )}

            {cancelConfirmationModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2 className="modal-title">훈련 취소 확인</h2>
                        <p className="modal-body">
                            {cancelConfirmationModal.name}의 훈련을 취소하시겠습니까? <br/>
                            <span className="text-red-400 text-3xl">비용은 환불되지 않습니다.</span>
                        </p>
                        <div className="modal-footer">
                            <button onClick={() => setCancelConfirmationModal(null)} className="ui-button ui-button-secondary">아니요</button>
                            <button onClick={() => { onCancelTraining(cancelConfirmationModal.id); setCancelConfirmationModal(null); }} className="ui-button ui-button-danger">예, 취소합니다</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};