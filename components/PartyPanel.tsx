import React from 'react';
import { Character, HpChangeEffect } from '../types';
import { JOB_CLASSES } from '../constants';

const HealthBar: React.FC<{ current: number, max: number }> = ({ current, max }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="w-full bg-black/50 rounded-full h-8 border-2 border-gray-600 overflow-hidden relative shadow-inner">
            <div
                className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white tabular-nums" style={{ textShadow: '1px 1px 2px black' }}>
                {Math.ceil(current)}/{max}
            </span>
        </div>
    );
};

const SkillBar: React.FC<{ current: number, max: number, onClick: () => void, disabled: boolean }> = ({ current, max, onClick, disabled }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const isReady = percentage >= 100;
    return (
        <div 
            className={`w-full bg-black/50 rounded-full h-6 border-2 border-gray-700 overflow-hidden relative mt-1 transition-all ${isReady && !disabled ? 'cursor-pointer skill-ready-glow' : ''} ${disabled ? 'opacity-50' : ''}`}
            onClick={!disabled && isReady ? onClick : undefined}
            title={isReady ? '스킬 사용 가능!' : `스킬 게이지: ${Math.floor(current)}/${max}`}
        >
            <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%`, boxShadow: `0 0 ${percentage / 15}px #06b6d4` }}
            />
            {isReady && <span className="absolute inset-0 text-center font-bold text-white animate-pulse text-lg">SKILL</span>}
        </div>
    );
};

interface PartyPanelProps {
  party: Character[];
  activeMercenaryIndex: number;
  actingCharacterName?: string | null;
  hpChangeEffects: HpChangeEffect[];
  skillUser?: string | null;
  damagedMembers: string[];
  dialogueBubbles: Record<string, string | null>;
  onUseSkill: (characterId: string) => void;
  onUseSpecialSkill: (characterId: string) => void;
}

const PartyPanel: React.FC<PartyPanelProps> = ({ party, activeMercenaryIndex, actingCharacterName, hpChangeEffects, skillUser, damagedMembers, dialogueBubbles, onUseSkill, onUseSpecialSkill }) => {
  if (!party || party.length === 0) {
    return null;
  }

  const slots = Array.from({ length: 5 });
    
  return (
    <div className="w-full">
        <div className="flex flex-row justify-center items-end gap-3">
            {slots.map((_, index) => {
              if (index < party.length) {
                const member = party[index];
                const isTurn = index === activeMercenaryIndex;
                const isActing = member.name === actingCharacterName;
                const isUsingSkill = member.id === skillUser;
                const isDamaged = damagedMembers.includes(member.id);
                const hasHealEffect = hpChangeEffects.some(effect => effect.name === member.id && effect.type === 'heal');
                const dialogue = dialogueBubbles[member.name];

                const attackStyle: React.CSSProperties = {};
                if (isActing) {
                    const partySize = party.length;
                    const centerIndex = (partySize - 1) / 2;
                    const offset = index - centerIndex;
                    attackStyle.transform = `translateX(${offset * -20}%) translateY(-30%) scale(1.1)`;
                    attackStyle.zIndex = 10;
                }
                
                return (
                    <div key={member.id} className={`relative transition-all duration-300 ${isTurn ? 'scale-110 z-10' : ''} ${isActing ? 'z-10' : ''}`}>
                        {dialogue && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-sm p-3 bg-black/80 rounded-lg text-center text-2xl animate-fade-in-scale-up border-2 border-gray-600 z-20">
                                <p>{dialogue}</p>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/80"></div>
                            </div>
                        )}
                        <div className={`w-56 rounded-lg bg-black/50 transition-all duration-300 overflow-hidden ${isTurn ? 'shadow-yellow-400/50 shadow-lg' : 'shadow-md'} ${isDamaged ? 'animate-damage' : ''} ${hasHealEffect ? 'animate-heal' : ''} ${isUsingSkill ? 'animate-skill' : ''}`} style={attackStyle}>
                            <div className="relative">
                                <img src={member.avatar} alt={member.name} className={`w-full h-64 object-cover object-top transition-all duration-300 ${member.hp <= 0 ? 'grayscale opacity-60' : ''}`} />
                                <div className={`absolute inset-0 border-4 transition-all duration-300 rounded-lg ${isTurn ? 'border-yellow-400' : 'border-transparent'}`} style={{ pointerEvents: 'none' }}></div>
                                {hpChangeEffects.filter(e => e.name === member.id).map(effect => (
                                    <span key={effect.id} className={`hp-change-effect absolute top-1/2 left-1/2 -translate-x-1/2 ${effect.type === 'heal' ? 'text-green-400' : 'text-red-500'} ${effect.isCritical ? 'critical' : ''}`}>
                                        {effect.type === 'heal' ? '+' : '-'}{effect.amount}
                                    </span>
                                ))}
                            </div>
                            <div className="w-full p-2">
                                <p className="text-2xl font-bold text-center truncate">{member.name}</p>
                                <HealthBar current={member.hp} max={member.maxHp} />
                                <SkillBar current={member.skillPower} max={member.maxSkillPower} onClick={() => onUseSkill(member.id)} disabled={member.hp <= 0 || member.skillPower < member.maxSkillPower} />
                            </div>
                        </div>
                    </div>
                );
              } else {
                 return (
                      <div key={`empty-${index}`} className="w-56 h-[22rem] p-2 rounded-lg bg-black/20 flex items-center justify-center">
                          <div className="w-full h-full bg-black/30 rounded-lg border-4 border-dashed border-gray-600"></div>
                      </div>
                  );
              }
            })}
        </div>
    </div>
  );
};

export default PartyPanel;