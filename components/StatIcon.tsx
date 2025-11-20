import React from 'react';

// Defines the props for the StatIcon component.
// It accepts a specific set of stat strings and an optional className.
interface StatIconProps {
  stat: 'str' | 'int' | 'vit' | 'agi' | 'dex' | 'luk';
  className?: string;
}

/**
 * A component that renders a specific SVG icon based on the character stat provided.
 * This helps to visually distinguish between different stats in the UI.
 * @param stat The stat to display an icon for.
 * @param className Optional additional CSS classes for styling the SVG.
 */
export const StatIcon: React.FC<StatIconProps> = ({ stat, className = 'w-8 h-8' }) => {
  // Common properties for all SVG icons to ensure consistency.
  const iconProps = {
    className: `inline-block mr-2 text-amber-200/90 ${className}`,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
  };

  switch (stat) {
    case 'str': // Strength: Lightning Bolt icon symbolizes power and speed.
      return (
        <svg {...iconProps}>
          <title>STR: 힘 (물리 공격력)</title>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      );
    case 'int': // Intelligence: Book icon symbolizes knowledge and magic.
      return (
        <svg {...iconProps}>
          <title>INT: 지능 (마법 공격력)</title>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      );
    case 'vit': // Vitality: Heart icon symbolizes health and life force.
      return (
        <svg {...iconProps}>
          <title>VIT: 체력 (생명력)</title>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      );
    case 'agi': // Agility: Feather icon symbolizes speed and evasion.
      return (
        <svg {...iconProps}>
          <title>AGI: 민첩 (회피 및 치명타)</title>
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
          <line x1="16" y1="8" x2="2" y2="22"></line>
          <line x1="17.5" y1="15" x2="9" y2="15"></line>
        </svg>
      );
    case 'dex': // Dexterity: Crosshair icon symbolizes accuracy.
      return (
        <svg {...iconProps}>
          <title>DEX: 손재주 (정확도)</title>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="22" y1="12" x2="18" y2="12"></line>
          <line x1="6" y1="12" x2="2" y2="12"></line>
          <line x1="12" y1="6" x2="12" y2="2"></line>
          <line x1="12" y1="22" x2="12" y2="18"></line>
        </svg>
      );
    case 'luk': // Luck: Four-leaf clover icon symbolizes fortune.
      return (
        <svg {...iconProps}>
          <title>LUK: 행운 (운)</title>
          <path d="M12 2c3.14 0 5.5 2.36 5.5 5.5s-2.36 5.5-5.5 5.5S6.5 10.64 6.5 7.5 8.86 2 12 2z"></path>
          <path d="M12 12c3.14 0 5.5 2.36 5.5 5.5s-2.36 5.5-5.5 5.5S6.5 20.64 6.5 17.5 8.86 12 12 12z"></path>
          <path d="M2 12c0 3.14 2.36 5.5 5.5 5.5s5.5-2.36 5.5-5.5S10.64 6.5 7.5 6.5 2 8.86 2 12z"></path>
          <path d="M22 12c0 3.14-2.36 5.5-5.5 5.5s-5.5-2.36-5.5-5.5S13.36 6.5 16.5 6.5 22 8.86 22 12z"></path>
        </svg>
      );
    default:
      return null;
  }
};