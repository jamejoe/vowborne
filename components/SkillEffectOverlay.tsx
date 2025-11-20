import React, { useState, useEffect } from 'react';
import { JobClass } from '../types';

interface SkillEffectOverlayProps {
  jobClass: JobClass | null;
}

// Helper to generate random properties for particle effects
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const SkillEffectOverlay: React.FC<SkillEffectOverlayProps> = ({ jobClass }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (jobClass) {
      // Remount the component to re-trigger CSS animation
      setKey(prev => prev + 1);
    }
  }, [jobClass]);

  if (!jobClass) {
    return null;
  }

  const renderEffect = () => {
    switch (jobClass) {
      case JobClass.Warrior:
        return <div className="slash"></div>;
      case JobClass.Priest:
        return <div className="light"></div>;
      case JobClass.Mage:
        return (
          <>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="shard"
                style={{
                  left: `${random(0, 100)}%`,
                  animationDelay: `${random(0, 0.5)}s`,
                  transform: `scale(${random(0.5, 1.2)})`,
                }}
              />
            ))}
          </>
        );
      case JobClass.Hunter:
         return (
          <>
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="arrow"
                style={{
                  top: `${random(20, 80)}%`,
                  animationDelay: `${random(0, 0.3)}s`,
                }}
              />
            ))}
          </>
        );
      case JobClass.Paladin:
        return <div className="barrier"></div>;
      case JobClass.Bard:
        const notes = ['♪', '♫', '♬'];
        const colors = ['#fde047', '#a7f3d0', '#f9a8d4', '#a5f3fc'];
        return (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="note"
                style={{
                  left: `${random(10, 90)}%`,
                  animationDelay: `${random(0, 1)}s`,
                  color: colors[Math.floor(random(0, colors.length))],
                  // @ts-ignore
                  '--x-end': `${random(-200, 200)}px`,
                }}
              >
                {notes[Math.floor(random(0, notes.length))]}
              </div>
            ))}
          </>
        );
      case JobClass.Rogue:
        return (
          <div className="shadow-slash">
            <div className="slash-flash"></div>
          </div>
        );
      case JobClass.Berserker:
        return <div className="rage-overlay"></div>;
      default:
        return null;
    }
  };

  return (
    <div key={key} className={`skill-effect-overlay skill-effect-${jobClass.toLowerCase()}`}>
      {renderEffect()}
    </div>
  );
};

export default SkillEffectOverlay;