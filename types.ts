

import React from 'react';

// Slot Machine and Battle
export enum SlotSymbol {
  Sword = 'SWORD',
  Shield = 'SHIELD',
  Potion = 'POTION',
  Gem = 'GEM',
  Skull = 'SKULL',
  Coin = 'COIN',
  TreasureChest = 'TREASURE_CHEST',
  BrokenSword = 'BROKEN_SWORD',
  WarriorSkill = 'WARRIOR_SKULL',
  PriestSkill = 'PRIEST_SKILL',
  MageSkill = 'MAGE_SKILL',
  PaladinSkill = 'PALADIN_SKILL',
  HunterSkill = 'HUNTER_SKILL',
  BardSkill = 'BARD_SKILL',
  RogueSkill = 'ROGUE_SKILL',
  BerserkerSkill = 'BERSERKER_SKILL',
}

export enum ExplorationSymbol {
    Move0 = 'MOVE_0',
    Move1 = 'MOVE_1',
    Move2 = 'MOVE_2',
    Move3 = 'MOVE_3',
}

export interface SlotSymbolData {
  id: SlotSymbol;
  icon: string;
  name: string;
}

export interface SpinResult {
  reels: SlotSymbol[][];
  wins: any[]; // Define more strictly if needed
}

export type LogType = 'player' | 'boss' | 'counter' | 'heal' | 'special' | 'system';

export interface LogEntry {
  id: number;
  player?: string;
  message: string;
  type: LogType;
}

export interface HpChangeEffect {
  id: number;
  name: string;
  amount: number;
  type: 'heal' | 'damage';
  isCritical: boolean;
}

// Characters and Monsters
export enum JobClass {
  Warrior = 'WARRIOR',
  Mage = 'MAGE',
  Priest = 'PRIEST',
  Hunter = 'HUNTER',
  Paladin = 'PALADIN',
  Bard = 'BARD',
  Rogue = 'ROGUE',
  Berserker = 'BERSERKER',
}

export type Personality = 'brave' | 'cautious' | 'jolly' | 'stoic' | 'sarcastic';

export type StatKey = 'str' | 'int' | 'vit' | 'agi' | 'dex' | 'luk' | 'hp' | 'skillPower' | 'maxHp';

export interface Equipment {
  instanceId: string;
  blueprintId: string;
  name: string;
  type: 'weapon' | 'armor';
  stats: Partial<Record<StatKey, number>>;
  icon: string;
  description: string;
  salePrice: number;
}

export interface RapportBonus {
  stat: StatKey | 'specialSkill' | 'skillPower';
  value: number;
  description: string;
}

export interface SpecialSkill {
  name: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  avatar: string;
  jobClass: JobClass;
  gender: 'male' | 'female';
  personality: Personality;
  str: number;
  int: number;
  vit: number;
  agi: number;
  dex: number;
  luk: number;
  weapon: Equipment | null;
  armor: Equipment | null;
  skillPower: number;
  maxSkillPower: number;
  gold: number;
  inventory: Equipment[];
  rapport: number;
  rapportBonuses: RapportBonus[];
  trainingStatus?: {
    courseId: string;
    endTime: number;
    isBoosted: boolean;
  };
  completedBondingEpisodes?: string[];
  hasUnlockedSpecialSkill?: boolean;
  specialSkill?: SpecialSkill;
  backstory: string;
}

export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  avatar: string;
  instanceId?: string;
  description?: string;
  isBoss?: boolean;
  canAreaAttack?: boolean;
  defenseDebuffTurns?: number;
  drops?: {
    materialId: string;
    dropChance: number;
    min: number;
    max: number;
  }[];
}

// Commander and Guild
export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

export interface CraftingMaterial {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  rapportBoost: number;
  icon: string;
}

export interface QuestProgress {
  progress: number;
  status?: 'incomplete' | 'unclaimed' | 'claimed';
}

export interface BattlefieldModifier {
  id: string;
  description: string;
  effect: any; // Define more strictly if needed
}

export interface GuildPerk {
  id: string;
  name: string;
  description: string;
  effect: any; // Define more strictly if needed
}

export type ExplorationState = 'IDLE' | 'AWAITING_MOVE' | 'ANIMATING_MOVE' | 'EVENT';

export interface Commander {
  level: number;
  exp: number;
  expToNextLevel: number;
  gold: number;
  materials: { id: string; quantity: number }[];
  gifts: { id: string; quantity: number }[];
  armoryStock: Equipment[];
  unlockedBlueprints: string[];
  unlockedMercenaries: JobClass[];
  stageProgress: Record<string, number>;
  activeParty: (string | null)[];
  questProgress: Record<string, QuestProgress>;
  requests: MercenaryRequest[];
  trainingGroundLevel: number;
  armoryLevel: number;
  activeWorldEventId: string | null;
  battlefieldModifiers: BattlefieldModifier[];
  guildPrestige: number;
  guildLevel: number;
  guildPerks: GuildPerk[];
  compassPiecesCollected: string[];
  stamina: number;
  maxStamina: number;
  explorationProgress: Record<string, HexCoord>; // chapterId -> HexCoord
  explorationState: ExplorationState;
  currentMoves: number;
  visitedTiles: Record<string, HexCoord[]>; // chapterId -> HexCoord[]
  revealedEventTiles: Record<string, HexCoord[]>; // chapterId -> HexCoord[]
  completedHexEvents: Record<string, string[]>; // chapterId -> eventKey[]
  storyProgress: Record<string, any>;
  unlockedChapterIds: string[];
  currentChapterId: string;
}

// Items and Crafting
export interface Blueprint {
  id: string;
  name: string;
  type: 'weapon' | 'armor';
  stats: Partial<Record<StatKey, number>>;
  craftingCost: number;
  materials: { materialId: string; quantity: number }[];
  icon: string;
  description: string;
}

// World, Chapters, and Episodes
export interface Stage {
  name: string;
  monsters: Monster[];
  expReward: number;
  goldReward: number;
  story?: DialogueLine[];
  isBoss?: boolean;
}

export interface Episode {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  stages: Stage[];
  backgroundUrl: string;
  storyIntro: DialogueLine[];
  storyOutro: DialogueLine[];
  compassPieceId: string;
}

export type HexTerrain = 'dirt' | 'grass' | 'ice' | 'snow' | 'water';

export interface Chapter {
  id: string;
  name: string;
  description: string;
  episodeIds: string[];
  mapPosition: { x: number; y: number };
  storyPoints: number;
  terrainTypes: HexTerrain[];
}

// Quests and Events
export enum QuestType {
  MONSTER_HUNT = 'MONSTER_HUNT',
  MATERIAL_HUNT = 'MATERIAL_HUNT',
  CRAFT_ITEM = 'CRAFT_ITEM',
  COMMANDER_LEVEL_UP = 'COMMANDER_LEVEL_UP',
  MERC_TRAINING = 'MERC_TRAINING',
}

export interface Quest {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  type: QuestType;
  target: { id: string; quantity: number };
  reward: {
    gold?: number;
    exp?: number;
    blueprintId?: string;
    unlockedCharacterId?: string;
  };
}

export interface QuestNotification {
  id: number;
  title: string;
  icon: string;
  message: string;
}

export interface MercenaryRequest {
  id: string;
  characterId: string;
  type: 'craft' | 'train' | 'outing' | 'give_gift';
  payload: {
    blueprintId?: string;
    courseId?: string;
    eventId?: string;
  };
  dialogue: string;
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    text: string;
    outcome: {
      description: string;
      effects: any[]; // Define more strictly if needed
    };
  }[];
}

// Training and Rapport
export interface TrainingCourse {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  cost: number;
  statBoost: Partial<Record<StatKey, number>>;
  commanderBoost: {
    cost: number;
    description: string;
    successRateIncrease: number;
  };
}

export interface BondingEpisode {
  id: string;
  characterId: string;
  title: string;
  prerequisites: {
    rapport: number;
  };
  story: DialogueLine[];
  reward: {
    stat: StatKey | 'specialSkill';
    value: number;
    description: string;
  };
}

// Story and Dialogue
export type CombatDialogueKey =
  | 'onBattleStart'
  | 'onTakingDamage'
  | 'onDealingDamage'
  | 'onUsingSkill'
  | 'onVictory';

export interface DialogueLine {
  speaker: string; // characterId or 'commander'
  line: string;
  avatar?: string; // Optional override
  commanderAvatar?: string;
}

export interface CharacterEnding {
  characterId: string;
  story: DialogueLine[];
}

// Battle Results
export interface BattleResult {
  isVictory: boolean;
  expGained: number;
  goldGained: number;
  settlement: {
    commanderGold: number;
    mercenaryGains: { name: string; gold: number }[];
  };
  mvpCharacterId?: string;
  commanderStateBefore: {
    level: number;
    exp: number;
    expToNextLevel: number;
  };
  materialsGained?: { id: string; quantity: number }[];
}

// Exploration Map
export interface HexCoord {
  q: number;
  r: number;
}

export interface HexTileEvent {
    type: 'monster' | 'treasure' | 'story' | 'trap' | 'ruins' | 'misfortune' | 'portal' | 'start' | 'empty';
    payload?: {
        monsterId?: string;
        treasure?: { gold?: number; material?: { id: string, quantity: number } };
        storyId?: string;
        goldLost?: number;
    };
}

export interface HexTile {
  coords: HexCoord;
  terrain: HexTerrain;
  event: HexTileEvent;
}
