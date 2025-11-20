import React from 'react';
import { Character } from '../types';

interface CharacterUnlockModalProps {
  character: Character;
  onClose: () => void;
}

const CharacterUnlockModal: React.FC<CharacterUnlockModalProps> = ({ character, onClose }) => {
  if (!character) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="character-unlock-modal ui-panel" onClick={e => e.stopPropagation()}>
        <div className="unlock-art-container">
          <img src={character.avatar} alt={character.name} className="unlock-art" />
        </div>
        <div className="unlock-info-panel">
            <p className="text-5xl text-amber-300 mb-3">새로운 동료 합류!</p>
            <h2 className="text-8xl font-bold font-cinzel text-yellow-300 mb-6">{character.name}</h2>
            <p className="text-4xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">{character.backstory}</p>
            <button onClick={onClose} className="ui-button ui-button-primary">
                확인
            </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterUnlockModal;