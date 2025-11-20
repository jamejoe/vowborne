import React from 'react';
import { SLOT_SYMBOLS, SLOT_SYMBOL_DESCRIPTIONS } from '../constants';
import { SlotSymbol } from '../types';

interface PayTableModalProps {
  onClose: () => void;
}

const PayTableModal: React.FC<PayTableModalProps> = ({ onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content !w-auto !max-w-5xl" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">심볼 효과</h2>
        <div className="w-full max-h-[70vh] overflow-y-auto pr-4 space-y-4">
          {Object.entries(SLOT_SYMBOL_DESCRIPTIONS).map(([symbol, data]) => (
            <div key={symbol} className="flex items-center gap-6 p-4 bg-black/20 rounded-lg">
              <img src={SLOT_SYMBOLS[symbol as SlotSymbol].icon} alt={data.name} className="w-24 h-24 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-4xl font-bold text-yellow-300">{data.name}</h3>
                <p className="text-3xl text-gray-300">{data.description}</p>
                <p className="text-2xl text-gray-400 mt-1">3개 이상 맞추면 개수에 비례하여 효과가 증폭됩니다.</p>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="ui-button ui-button-primary">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default PayTableModal;
