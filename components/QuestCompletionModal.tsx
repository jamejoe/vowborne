import React from 'react';
import { Quest } from '../types';
import { BLUEPRINTS } from '../constants';

interface QuestCompletionModalProps {
  quests: Quest[];
  onClose: () => void;
}

const QuestCompletionModal: React.FC<QuestCompletionModalProps> = ({ quests, onClose }) => {
  if (quests.length === 0) return null;
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">의뢰 완료!</h2>
        <div className="w-full max-h-[60vh] overflow-y-auto space-y-8 p-4 text-left">
            {quests.map(quest => {
                const blueprintReward = quest.reward.blueprintId ? BLUEPRINTS[quest.reward.blueprintId] : null;
                return (
                    <div key={quest.id} className="bg-black/20 p-8 rounded-lg border-2 border-black/30">
                        <h3 className="text-5xl font-bold text-amber-600 mb-4">{quest.title}</h3>
                        <p className="text-4xl font-bold text-green-600 mb-3">보상:</p>
                        <ul className="list-disc list-inside text-4xl space-y-2">
                            {quest.reward.gold && <li><span className="text-yellow-500 font-bold">{quest.reward.gold} G</span></li>}
                            {quest.reward.exp && <li><span className="text-blue-500 font-bold">{quest.reward.exp} EXP</span></li>}
                            {blueprintReward && (
                                <li className="flex items-center gap-3">
                                    <img src={blueprintReward.icon} alt={blueprintReward.name} className="w-12 h-12 inline-block bg-black/30 rounded"/>
                                    <span>설계도: <span className="text-purple-500 font-bold">{blueprintReward.name}</span></span>
                                </li>
                            )}
                        </ul>
                    </div>
                );
            })}
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

export default QuestCompletionModal;