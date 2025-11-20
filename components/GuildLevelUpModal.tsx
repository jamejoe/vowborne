import React from 'react';
import { GuildPerk } from '../types';

interface GuildLevelUpModalProps {
  level: number;
  perk: GuildPerk;
  onClose: () => void;
}

const GuildLevelUpModal: React.FC<GuildLevelUpModalProps> = ({ level, perk, onClose }) => {
  return (
    <div className="modal-backdrop guild-level-up-modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">용병단 등급 상승!</h2>
        
        <div className="my-8 flex flex-col items-center gap-6">
            <div className="new-level-badge">
                등급 {level}
            </div>
            <p className="text-4xl text-gray-300 mb-4">새로운 특전 해금!</p>
            <div className="perk-container">
                <p className="perk-name">{perk.name}</p>
                <p className="perk-desc">{perk.description}</p>
            </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="ui-button ui-button-primary">
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuildLevelUpModal;
