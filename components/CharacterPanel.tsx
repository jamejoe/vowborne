import React from 'react';
import { Monster, HpChangeEffect } from '../types';

interface HealthBarProps {
  current: number;
  max: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  return (
    <div className="w-full bg-black/50 rounded-full h-12 border-4 border-gray-600 overflow-hidden shadow-inner shadow-black/50 relative">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-red-600 to-red-400`}
        style={{ width: `${percentage}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white tabular-nums" style={{ textShadow: '2px 2px 3px black' }}>
        {Math.ceil(current)} / {max}
      </span>
    </div>
  );
};

const TensionBar: React.FC<{ tension: number }> = ({ tension }) => {
  const percentage = Math.min(100, tension);
  return (
    <div className="w-4/5 bg-black/50 rounded-full h-10 border-2 border-purple-400/50 overflow-hidden shadow-md mt-3 relative">
      <div
        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300 ease-linear"
        style={{ width: `${percentage}%`, boxShadow: `0 0 ${percentage / 10}px #f0abfc` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
        긴장감
      </span>
    </div>
  );
};

interface CharacterPanelProps {
  character: Monster;
  isBoss?: boolean;
  impact: { id: string, isCritical: boolean } | null;
  tension: number;
  hpChangeEffects?: HpChangeEffect[];
  isAttacking?: boolean;
  attackStyle?: React.CSSProperties;
  dialogue?: string | null;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ character, isBoss = false, impact, tension, hpChangeEffects = [], isAttacking = false, attackStyle = {}, dialogue = null }) => {
  const { name, hp, maxHp, avatar, instanceId, description } = character;
  const isDead = hp <= 0;
  const isImpacted = impact?.id === instanceId;

  return (
    <div data-id={instanceId} className={`relative flex flex-col items-center justify-end h-full w-full max-w-full mx-auto transition-all duration-300 ${isDead ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex-grow flex items-center justify-center w-full relative">
        <img 
          src={avatar} 
          alt={name} 
          className={`object-contain w-auto h-2/3 ${isImpacted ? (impact.isCritical ? 'critical-flash' : 'animate-damage') : ''} ${isAttacking ? 'animate-monster-attack' : ''}`}
          style={isAttacking ? attackStyle : {}}
        />
         {/* Effects and Dialogue container relative to the image area */}
        <div className="absolute inset-0 pointer-events-none">
            {hpChangeEffects
              .filter(effect => effect.name === instanceId)
              .map(effect => (
                <span key={effect.id} className={`hp-change-effect absolute top-1/2 left-1/2 -translate-x-1/2 ${
                  effect.type === 'heal' ? 'text-green-400' : 'text-red-500'
                } ${effect.isCritical ? 'critical' : ''}`}>
                  {effect.type === 'heal' ? '+' : '-'}{effect.amount}
                </span>
            ))}
            
            {dialogue && (
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-20 w-max max-w-[400px] p-5 bg-black/80 rounded-lg text-center text-4xl animate-fade-in-scale-up border-2 border-gray-600">
                  <p>{dialogue}</p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/80"></div>
              </div>
            )}
        </div>
      </div>
      <div className="w-full flex-shrink-0 flex flex-col items-center py-4">
        <div className="w-2/3">
          <HealthBar current={hp} max={maxHp} />
        </div>
        <h2 className="mt-2 text-5xl font-bold text-gray-200" style={{ textShadow: '2px 2px 4px black' }}>{name}</h2>
        {description && <p className="text-3xl text-gray-400 truncate w-full text-center">{description}</p>}
        {isBoss && <TensionBar tension={tension} />}
      </div>
    </div>
  );
};

export default CharacterPanel;