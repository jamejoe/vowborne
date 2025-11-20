
import React from 'react';
import { Quest, QuestType, SlotSymbol } from '../types';
import { CRAFTING_MATERIALS, BLUEPRINTS, SLOT_SYMBOLS } from '../constants';

const getQuestTargetIcon = (quest: Quest): string => {
  const material = CRAFTING_MATERIALS[quest.target.id];
  if (material) return material.icon;

  const blueprint = BLUEPRINTS[quest.target.id];
  if (blueprint) return blueprint.icon;

  if (quest.type === QuestType.MONSTER_HUNT) {
    return SLOT_SYMBOLS[SlotSymbol.Skull].icon;
  }

  // Default fallback
  return SLOT_SYMBOLS[SlotSymbol.Sword].icon;
};

interface QuestWithProgress extends Quest {
  progress: number;
}

interface BattleQuestTrackerProps {
  activeQuests: QuestWithProgress[];
}

const BattleQuestTracker: React.FC<BattleQuestTrackerProps> = ({ activeQuests }) => {
  if (activeQuests.length === 0) {
    return null;
  }

  return (
    <div className="battle-quest-tracker-icons">
      {activeQuests.map(quest => (
        <div key={quest.id} className="quest-icon-container">
          <img src={getQuestTargetIcon(quest)} alt={quest.title} className="quest-icon-image" />
          <span className="quest-icon-progress">
            {quest.progress} / {quest.target.quantity}
          </span>
          <div className="quest-icon-tooltip">
            {quest.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BattleQuestTracker;
