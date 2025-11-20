import React, { useMemo, useEffect, useRef } from 'react';
import { SlotSymbol } from '../types';
import { SLOT_SYMBOLS, ALL_SYMBOLS } from '../constants';

const REEL_STRIP_LENGTH = 30;

const Reel: React.FC<{ 
    symbols: SlotSymbol[]; 
    isSpinning: boolean; 
    delay: number; 
    colIndex: number;
    highlightedLine: [number, number][] | null;
    onSymbolClick: (symbol: SlotSymbol) => void; 
}> = ({ symbols, isSpinning, delay, colIndex, highlightedLine, onSymbolClick }) => {
  const reelRef = useRef<HTMLDivElement>(null);

  const symbolsForReel = useMemo(() => {
    const strip = Array.from({ length: REEL_STRIP_LENGTH }, () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]);
    
    if (symbols && symbols.length === 3) {
      strip[0] = symbols[0];
      strip[1] = symbols[1];
      strip[2] = symbols[2];
    }
    
    return strip;
  }, [symbols]);

  useEffect(() => {
    if (!reelRef.current) return;
    
    const reelElement = reelRef.current;
    const symbolElement = reelElement.querySelector<HTMLDivElement>(':scope > div');
    const symbolHeight = symbolElement ? symbolElement.offsetHeight : 224;
    
    const finalPosition = 0; 
    const startPosition = -(REEL_STRIP_LENGTH - 3) * symbolHeight;
    
    if (isSpinning) {
        reelElement.style.transition = 'none';
        reelElement.style.transform = `translateY(${startPosition}px)`;
        reelElement.offsetHeight; 
        reelElement.style.transition = `transform ${2.5 + delay * 0.2}s cubic-bezier(0.25, 1, 0.5, 1)`;
        reelElement.style.transform = `translateY(${finalPosition}px)`;
    } else {
        reelElement.style.transition = 'none';
        reelElement.style.transform = `translateY(${finalPosition}px)`;
    }
  }, [isSpinning, delay, symbolsForReel]);

  return (
    <div className="w-[20rem] h-[42rem] bg-gray-900/70 border-y-4 border-amber-800 overflow-hidden relative shadow-inner shadow-black/50">
      <div ref={reelRef} className="flex flex-col">
        {symbolsForReel.map((symbolId, index) => {
          const iconUrl = SLOT_SYMBOLS[symbolId]?.icon || SLOT_SYMBOLS[SlotSymbol.Sword].icon;
          const symbolName = SLOT_SYMBOLS[symbolId]?.name || '';
          const isVisibleSymbol = index <= 2;
          const rowIndex = index;
          const isHighlighted = isVisibleSymbol && highlightedLine?.some(([r, c]) => r === rowIndex && c === colIndex);
          
          return (
            <div 
              key={index} 
              className={`w-[20rem] h-[14rem] flex-shrink-0 flex items-center justify-center p-4 transition-all duration-300 ${isHighlighted ? 'symbol-win-glow' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSymbolClick(symbolId);
              }}
            >
              <img src={iconUrl} alt={symbolName} className="w-full h-full object-contain cursor-help" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SlotMachineProps {
  result: SlotSymbol[][];
  isSpinning: boolean;
  highlightedLine: [number, number][] | null;
  onSymbolClick: (symbol: SlotSymbol) => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ result, isSpinning, highlightedLine, onSymbolClick }) => {
  const columns = useMemo(() => {
    if (!result || result.length !== 3 || result.some(row => !row || row.length !== 3)) {
      const defaultSymbol = ALL_SYMBOLS[0];
      return Array(3).fill(null).map(() => Array(3).fill(defaultSymbol));
    }
    return [0, 1, 2].map(colIndex => [
      result[0][colIndex],
      result[1][colIndex],
      result[2][colIndex],
    ]);
  }, [result]);

  return (
    <div className="relative p-3 rounded-lg bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-900 border-4 border-yellow-600 shadow-xl shadow-black/50">
        <div className="relative flex justify-center items-center gap-3 p-3 bg-black/60 rounded-md shadow-inner shadow-black">
            <div className="flex gap-3">
            {columns.map((columnSymbols, colIndex) => (
                <Reel
                  key={colIndex}
                  symbols={columnSymbols}
                  isSpinning={isSpinning}
                  delay={colIndex}
                  colIndex={colIndex}
                  highlightedLine={highlightedLine}
                  onSymbolClick={onSymbolClick}
                />
            ))}
            </div>
            {/* Payline Indicator */}
            <div className="absolute inset-y-0 left-0 w-full flex items-center pointer-events-none">
                <div className="w-full h-[14rem] border-y-4 border-red-500/80 bg-red-500/10 shadow-[0_0_20px_rgba(255,0,0,0.6)]"></div>
            </div>
        </div>
    </div>
  );
};

export default SlotMachine;