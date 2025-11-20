import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ExplorationState, ExplorationSymbol } from '../types';
import { ALL_EXPLORATION_SYMBOLS, EXPLORATION_SYMBOLS } from '../constants';

const REEL_LENGTH = 30;

const Reel: React.FC<{ result: ExplorationSymbol; isSpinning: boolean; delay: number; }> = ({ result, isSpinning, delay }) => {
    const reelRef = useRef<HTMLDivElement>(null);
    
    const strip = useMemo(() => {
        // We will spin "up" the strip, making the numbers fall "down"
        const generatedStrip = Array.from({ length: REEL_LENGTH }, () => ALL_EXPLORATION_SYMBOLS[Math.floor(Math.random() * ALL_EXPLORATION_SYMBOLS.length)]);
        // The visible symbol will be the one at index 1.
        generatedStrip[1] = result;
        return generatedStrip;
    }, [result]);

    useEffect(() => {
        if (!reelRef.current) return;
        const reel = reelRef.current;
        const symbolHeight = 128; // Corresponds to h-32 in Tailwind CSS

        // Final position shows the symbol at index 1.
        const finalPosition = -1 * symbolHeight;
        // Start from near the end of the strip.
        const startPosition = -((REEL_LENGTH - 2) * symbolHeight);

        if (isSpinning) {
            reel.style.transition = 'none';
            // Instantly jump to the start position (bottom of the strip).
            reel.style.transform = `translateY(${startPosition}px)`;
            
            // This is crucial to ensure the transition happens.
            reel.offsetHeight; 
            
            // Start the spin animation. Move the strip UP, making numbers fall DOWN.
            reel.style.transition = `transform ${3.0 + delay * 0.3}s cubic-bezier(0.33, 1, 0.68, 1)`; // Ease out curve
            reel.style.transform = `translateY(${finalPosition}px)`;
        } else {
            // When not spinning, jump to the final position.
            reel.style.transition = 'none';
            reel.style.transform = `translateY(${finalPosition}px)`;
        }
    }, [isSpinning, delay, strip]);

    return (
        <div className="w-24 h-32 bg-gray-900/70 border-y-2 border-amber-800 overflow-hidden shadow-inner shadow-black/50">
            <div ref={reelRef} className="flex flex-col">
                {strip.map((symbolId, i) => (
                    <div key={i} className="w-24 h-32 flex-shrink-0 flex items-center justify-center p-2">
                         <img src={EXPLORATION_SYMBOLS[symbolId].icon} alt={`Move ${EXPLORATION_SYMBOLS[symbolId].value}`} className="w-full h-full object-contain" />
                    </div>
                ))}
            </div>
        </div>
    );
};

interface DiceSlotMachineProps {
  onRoll: () => void;
  result: ExplorationSymbol[] | null;
  isSpinning: boolean;
  movesLeft: number;
  commanderLevel: number;
  explorationState: ExplorationState;
}

const DiceSlotMachine: React.FC<DiceSlotMachineProps> = ({ onRoll, result, isSpinning, movesLeft, commanderLevel, explorationState }) => {
    const total = result ? result.reduce((a, b) => a + EXPLORATION_SYMBOLS[b].value, 0) : 0;
    
    const isDisabled = explorationState !== 'IDLE' || isSpinning;
    
    const getStatusText = () => {
        if (isSpinning) return "주사위를 굴리는 중...";
        switch (explorationState) {
            case 'AWAITING_MOVE':
                return "타일을 선택하여 이동";
            case 'ANIMATING_MOVE':
                return "이동 중...";
            case 'EVENT':
                return "이벤트 발생!";
            case 'IDLE':
            default:
                return movesLeft > 0 ? `남은 칸: ${movesLeft}` : "탐험 시작";
        }
    };

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
             <div className="flex items-center gap-4 p-4 bg-black/70 rounded-lg border-2 border-amber-700 backdrop-blur-sm">
                <div className="flex gap-2">
                    {result ? result.map((symbol, i) => (
                        <Reel key={i} result={symbol} isSpinning={isSpinning} delay={i} />
                    )) : [0,0,0].map((_, i) => (
                        <div key={i} className="w-24 h-32 bg-gray-900/70 border-y-2 border-amber-800 flex items-center justify-center">
                             <span className="text-8xl font-bold text-white">-</span>
                        </div>
                    ))}
                </div>
                
                <div className="flex flex-col items-center justify-center w-48 text-center">
                    <p className="text-3xl text-gray-300">이동력</p>
                    <p className="text-8xl font-bold text-yellow-300">{isSpinning ? '...' : total}</p>
                     <p className="text-3xl text-amber-300 mt-2 font-bold h-10">
                        {getStatusText()}
                     </p>
                </div>

                <button onClick={onRoll} disabled={isDisabled} className="ui-button ui-button-primary !text-4xl !px-12 !py-8">
                    탐험
                </button>
            </div>
        </div>
    );
};

export default DiceSlotMachine;
