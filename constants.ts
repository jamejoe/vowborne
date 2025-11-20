









import React from 'react';
// FIX: Added missing constant imports.
import { SlotSymbol, SlotSymbolData, Character, Monster, JobClass, Episode, Chapter, Personality, Equipment, CombatDialogueKey, TrainingCourse, Stage, Gift, RapportBonus, StatKey, Blueprint, CraftingMaterial, Quest, QuestType, BondingEpisode, WorldEvent, GuildPerk, DialogueLine, CharacterEnding, HexTile, HexTileEvent, HexTerrain, ExplorationSymbol } from './types';

// Updated Image Constants
export const BACKGROUND_IMAGES = {
  title: 'https://i.postimg.cc/xT85M0Sd/02-Title-Bg.png',
  hubDayCamp: 'https://i.postimg.cc/dVpqRRNz/Bg-Day.png',
  hubNightCamp: 'https://i.postimg.cc/nhgHKKwJ/Bg-Night.png',
  // Use hub images for garrison too as placeholders if specific garrison ones aren't provided, or reuse hub
  hubDayGarrison: 'https://i.postimg.cc/dVpqRRNz/Bg-Day.png',
  hubNightGarrison: 'https://i.postimg.cc/nhgHKKwJ/Bg-Night.png',
  
  battlefield_goblinCave: 'https://i.postimg.cc/h4rZVyz0/Bg-Area04.png',
  battlefield_mushroomForest: 'https://i.postimg.cc/3rBf2S4t/Bg-Area02.png',
  battlefield_dwarvenRuins: 'https://i.postimg.cc/593K87Yg/Bg-Area03.png',
  battlefield_voidWasteland: 'https://i.postimg.cc/tR5vFSZ6/Bg-Area01.png', // Grassland as placeholder or if intended
  battlefield_finalArena: 'https://i.postimg.cc/1RH7DCnJ/Bg-Area05.png',
  
  trainingGround: 'https://i.postimg.cc/dVpqRRNz/Bg-Day.png', // Reuse Hub for now
  worldMap: 'https://i.postimg.cc/tR5vFSZ6/Bg-Area01.png',
  explorationMap: 'https://i.postimg.cc/tR5vFSZ6/Bg-Area01.png',
};

export const HEX_TILE_IMAGES = {
  dirt: 'https://i.postimg.cc/vZt1x0rg/Hex-Tile-Dirt.png',
  grass: 'https://i.postimg.cc/t4N1nB3x/Hex-Tile-Grass.png',
  ice: 'https://i.postimg.cc/YCz4Ld6g/Hex-Tile-Ice.png',
  snow: 'https://i.postimg.cc/13rgVvGF/Hex-Tile-Snow.png',
  water: 'https://i.postimg.cc/tgRs3FkJ/Hex-Tile-Water.png',
};

export const HEX_ICON_CAMP = 'https://i.postimg.cc/2S7qL0Q6/Hex_Icon_Camp.png';
export const HEX_ICON_UNKNOWN = 'https://placehold.co/100x100/000000/ffffff.png?text=?'; // Keep placeholder for unknown if not provided

export const HEX_EVENT_ICONS: Record<HexTileEvent['type'], string> = {
    monster: 'https://i.postimg.cc/vZRhs7wK/Hex_Icon_Battle.png',
    misfortune: 'https://i.postimg.cc/3J01VSVm/Hex_Icon_Misfortune.png',
    portal: 'https://i.postimg.cc/XYMLbK6f/Hex_Icon_Portal.png',
    ruins: 'https://i.postimg.cc/bwXgh0fH/Hex_Icon_Ruins.png',
    story: 'https://i.postimg.cc/HkGzg019/Hex_Icon_Story.png',
    trap: 'https://i.postimg.cc/K8Xf27h7/Hex_Icon_Trap.png',
    treasure: 'https://i.postimg.cc/7Zv9k1rK/Hex_Icon_Treasure.png',
    start: 'https://i.postimg.cc/2S7qL0Q6/Hex_Icon_Camp.png',
    empty: '',
};

export const MAP_CONFIGS: Record<string, {
    radius: number;
    eventCounts: Partial<Record<HexTileEvent['type'], number>>;
}> = {
    'ch_1': { radius: 16, eventCounts: { monster: 448, treasure: 139, story: 2, ruins: 57, trap: 65, misfortune: 57 } },
    'ch_2': { radius: 20, eventCounts: { monster: 692, treasure: 214, story: 3, ruins: 88, trap: 101, misfortune: 88 } },
    'ch_3': { radius: 24, eventCounts: { monster: 989, treasure: 306, story: 2, ruins: 126, trap: 144, misfortune: 126 } },
    'ch_4': { radius: 28, eventCounts: { monster: 1339, treasure: 414, story: 0, ruins: 170, trap: 195, misfortune: 170 } },
    'ch_5': { radius: 32, eventCounts: { monster: 1742, treasure: 538, story: 0, ruins: 222, trap: 253, misfortune: 222 } },
};

export const HUB_BACKGROUNDS = {
  day: [
    BACKGROUND_IMAGES.hubDayCamp,
    BACKGROUND_IMAGES.hubDayCamp,
    BACKGROUND_IMAGES.hubDayCamp,
  ],
  night: [
    BACKGROUND_IMAGES.hubNightCamp,
    BACKGROUND_IMAGES.hubNightCamp,
    BACKGROUND_IMAGES.hubNightCamp,
  ]
};

export const STAT_DESCRIPTIONS: Record<string, string> = {
  str: '힘: 물리 공격력. 검과 관련된 물리 기술의 위력에 영향을 줍니다.',
  int: '지능: 마법 공격력과 치유력. 마법 주문과 회복 능력에 영향을 줍니다.',
  vit: '체력: 생명력. 최대 HP에 직접적인 영향을 줍니다.',
  agi: '민첩: 순발력. 치명타 확률과 일부 직업의 공격력을 약간 증가시킵니다.',
  dex: '손재주: 정확도. 공격의 최소 피해량을 보정하고, 일부 기술의 위력을 높입니다.',
  luk: '행운: 운. 슬롯에서 좋은 결과를 얻을 확률과 보너스 획득량에 영향을 줍니다.',
};

export const CRAFTING_MATERIALS: Record<string, CraftingMaterial> = {
  'goblin_ear': { id: 'goblin_ear', name: '고블린의 귀', icon: 'https://placehold.co/100x100/558b2f/ffffff.png?text=Ear', description: '전리품으로, 혹은 재료로 쓰이는 고블린의 뾰족한 귀.' },
  'tough_leather': { id: 'tough_leather', name: '질긴 가죽', icon: 'https://placehold.co/100x100/795548/ffffff.png?text=Leather', description: '웬만한 공격은 막아낼 수 있을 것 같은 질긴 가죽.' },
  'magic_stone': { id: 'magic_stone', name: '마력석', icon: 'https://placehold.co/100x100/7b1fa2/ffffff.png?text=Stone', description: '희미한 마력이 느껴지는 돌. 장비에 마법을 부여할 때 쓰인다.' },
  'spore_sac': { id: 'spore_sac', name: '포자 주머니', icon: 'https://placehold.co/100x100/d84315/ffffff.png?text=Spore', description: '버섯 괴물의 포자가 가득 담긴 주머니. 독성이 있을 수 있다.' },
  'ancient_gear': { id: 'ancient_gear', name: '고대 부품', icon: 'https://placehold.co/100x100/607d8b/ffffff.png?text=Gear', description: '고대 골렘의 동력원으로 쓰이던 부품.' },
  'obsidian_core': { id: 'obsidian_core', name: '흑요석 핵', icon: 'https://placehold.co/100x100/212121/ffffff.png?text=Core', description: '엄청난 에너지가 압축된 흑요석.' },
  'shadow_essence': { id: 'shadow_essence', name: '그림자 정수', icon: 'https://placehold.co/100x100/311b92/ffffff.png?text=Essence', description: '공허 생물의 정수. 불길한 기운이 느껴진다.' },
  'void_crystal': { id: 'void_crystal', name: '공허의 수정', icon: 'https://placehold.co/100x100/6a1b9a/ffffff.png?text=Crystal', description: '차원의 틈새에서만 발견되는 뒤틀린 수정.' },
  'traitor_emblem': { id: 'traitor_emblem', name: '배신자의 문장', icon: 'https://placehold.co/100x100/b71c1c/ffffff.png?text=Emblem', description: '한때 동료였던 자가 남긴 타락한 증표.' },
  'dragon_scale': { id: 'dragon_scale', name: '공허 용의 비늘', icon: 'https://placehold.co/100x100/ffd600/000000.png?text=Scale', description: '세계를 위협했던 용의 단단한 비늘.' },
};

export const TRAINING_GROUND_UPGRADES = [
  { level: 2, cost: 2000, description: "훈련 시간 10% 단축" },
  { level: 3, cost: 5000, description: "대성공 확률 5% 증가" },
  { level: 4, cost: 12000, description: "훈련 시간 15% 추가 단축 (총 25%)" },
  { level: 5, cost: 30000, description: "모든 훈련에 '단장의 격려' 효과 자동 적용" },
];

export const ARMORY_UPGRADES = [
  { level: 2, cost: 2500, description: "강철 장비 설계도 해금 (강철 검, 사슬 갑옷)" },
  { level: 3, cost: 6000, description: "제작 비용 10% 감소" },
  { level: 4, cost: 15000, description: "마법 부여 장비 설계도 해금 (마력 깃든 지팡이)" },
  { level: 5, cost: 40000, description: "제작 시 대성공 확률 발생 (더 좋은 능력치)" },
];

export const GUILD_LEVEL_THRESHOLDS = [
  { level: 1, prestige: 0 },
  { level: 2, prestige: 1000 },
  { level: 3, prestige: 2500 },
  { level: 4, prestige: 5000 },
  { level: 5, prestige: 10000 },
  { level: 6, prestige: 20000 },
];

export const GUILD_PERKS: Record<number, GuildPerk> = {
  2: { id: 'tough_physique', name: '강인한 육체', description: '모든 용병의 최대 HP가 10% 영구적으로 증가합니다.', effect: { type: 'stat_buff', payload: { stat: 'maxHp', percent: 0.1 } } },
  3: { id: 'negotiation_skills', name: '협상의 기술', description: '의뢰 완료 시 획득하는 골드가 10% 증가합니다.', effect: { type: 'reward_buff', payload: { source: 'quest', type: 'gold', percent: 0.1 } } },
  4: { id: 'efficient_training', name: '효율적인 훈련법', description: '훈련으로 얻는 모든 능력치 획득량이 10% 증가합니다.', effect: { type: 'training_buff', payload: { percent: 0.1 } } },
  5: { id: 'battle_wisdom', name: '전장의 지혜', description: '전투 승리 시 단장이 획득하는 경험치가 15% 증가합니다.', effect: { type: 'reward_buff', payload: { source: 'battle', type: 'exp', percent: 0.15 } } },
};

const questsData: Record<string, Quest> = {
  // Chapter 1
  'ch1_q1': { id: 'ch1_q1', chapterId: 'ch_1', title: '첫걸음: 고블린의 귀', description: '장비 제작의 기초가 되는 고블린의 귀 5개를 모으세요.', type: QuestType.MATERIAL_HUNT, target: { id: 'goblin_ear', quantity: 5 }, reward: { gold: 100, exp: 50 } },
  'ch1_q2': { id: 'ch1_q2', chapterId: 'ch_1', title: '정찰병 소탕', description: '주변을 어지럽히는 고블린 정찰병을 3마리 처치하세요.', type: QuestType.MONSTER_HUNT, target: { id: '고블린', quantity: 3 }, reward: { gold: 150, exp: 70 } },
  'ch1_q3': { id: 'ch1_q3', chapterId: 'ch_1', title: '기본 장비 제작', description: '모아온 재료로 낡은 검을 1개 제작하여 제작의 기본을 익혀봅시다.', type: QuestType.CRAFT_ITEM, target: { id: 'starter_sword', quantity: 1 }, reward: { gold: 50, exp: 100, blueprintId: 'steel_sword' } },
  'ch1_q4': { id: 'ch1_q4', chapterId: 'ch_1', title: '새로운 시작', description: '단장 레벨 2를 달성하여 용병단을 이끌 자질을 증명하세요.', type: QuestType.COMMANDER_LEVEL_UP, target: { id: 'commander', quantity: 2 }, reward: { gold: 200, exp: 50 } },
  'ch1_q5': { id: 'ch1_q5', chapterId: 'ch_1', title: '기초 훈련', description: '용병 훈련을 1회 완료하여 부대원의 성장을 도모하세요.', type: QuestType.MERC_TRAINING, target: { id: 'any', quantity: 1 }, reward: { gold: 100 } },
  'ch1_q6': { id: 'ch1_q6', chapterId: 'ch_1', title: '족장의 도전', description: '고블린 소굴의 우두머리, 고블린 족장을 처치하여 당신의 힘을 증명하세요!', type: QuestType.MONSTER_HUNT, target: { id: '오우거', quantity: 1 }, reward: { gold: 500, exp: 300, unlockedCharacterId: 'paladin_iona' } },
  // Chapter 2
  'ch2_q1': { id: 'ch2_q1', chapterId: 'ch_2', title: '늑대의 위협', description: '숲을 위협하는 늑대인간 5마리를 처치하세요.', type: QuestType.MONSTER_HUNT, target: { id: '늑대인간', quantity: 5 }, reward: { gold: 300, exp: 150 } },
  'ch2_q2': { id: 'ch2_q2', chapterId: 'ch_2', title: '질긴 가죽 수집', description: '장비 강화에 필요한 질긴 가죽 10개를 모으세요.', type: QuestType.MATERIAL_HUNT, target: { id: 'tough_leather', quantity: 10 }, reward: { gold: 200, exp: 200 } },
  'ch2_q3': { id: 'ch2_q3', chapterId: 'ch_2', title: '마녀 토벌', description: '푸른탑의 마녀를 처치하여 숲의 오염을 막으세요.', type: QuestType.MONSTER_HUNT, target: { id: '푸른탑의 마녀', quantity: 1 }, reward: { gold: 1000, exp: 500, blueprintId: 'steel_sword' } },
  // Chapter 3
  'ch3_q1': { id: 'ch3_q1', chapterId: 'ch_3', title: '언데드 소탕', description: '묘지를 배회하는 해골병사 10마리를 처치하세요.', type: QuestType.MONSTER_HUNT, target: { id: '해골병사', quantity: 10 }, reward: { gold: 600, exp: 300 } },
  'ch3_q2': { id: 'ch3_q2', chapterId: 'ch_3', title: '왕의 안식', description: '죽은 자들의 왕, 리치왕을 처치하세요.', type: QuestType.MONSTER_HUNT, target: { id: '혹한의 리치왕', quantity: 1 }, reward: { gold: 2000, exp: 1000 } },
  // Chapter 4
  'ch4_q1': { id: 'ch4_q1', chapterId: 'ch_4', title: '공허 정화', description: '황무지의 트롤 3마리를 처치하세요.', type: QuestType.MONSTER_HUNT, target: { id: '트롤', quantity: 3 }, reward: { gold: 1500, exp: 800 } },
  'ch4_q2': { id: 'ch4_q2', chapterId: 'ch_4', title: '고대의 수호자', description: '태초의 골렘을 처치하세요.', type: QuestType.MONSTER_HUNT, target: { id: '태초의 골렘', quantity: 1 }, reward: { gold: 4000, exp: 2000 } },
  // Chapter 5
  'ch5_q1': { id: 'ch5_q1', chapterId: 'ch_5', title: '용 사냥', description: '협곡의 블루 와이번을 처치하세요.', type: QuestType.MONSTER_HUNT, target: { id: '블루와이번', quantity: 1 }, reward: { gold: 3000, exp: 1500 } },
  'ch5_q2': { id: 'ch5_q2', chapterId: 'ch_5', title: '최후의 결전', description: '어둠의 군주를 처치하고 세계를 구하세요!', type: QuestType.MONSTER_HUNT, target: { id: '어둠의 군주', quantity: 1 }, reward: { gold: 10000, exp: 5000 } },
};

// FIX: Group quests by chapter and export for use in other components.
export const CHAPTER_QUESTS: Record<string, Record<string, Quest>> = Object.values(questsData).reduce((acc, quest) => {
    if (!acc[quest.chapterId]) {
        acc[quest.chapterId] = {};
    }
    acc[quest.chapterId][quest.id] = quest;
    return acc;
}, {} as Record<string, Record<string, Quest>>);

// FIX: Added missing constant definitions.

export const JOB_CLASSES: Record<JobClass, {
  name: string;
  skillSymbol: SlotSymbol;
  baseStats: { str: number; int: number; vit: number; agi: number; dex: number; luk: number; };
  skill: { name: string; description: string; };
}> = {
  [JobClass.Warrior]: { name: '전사', skillSymbol: SlotSymbol.WarriorSkill, baseStats: { str: 12, int: 5, vit: 10, agi: 8, dex: 8, luk: 7 }, skill: { name: '강타', description: '적에게 강력한 일격을 가합니다.' } },
  [JobClass.Mage]: { name: '마법사', skillSymbol: SlotSymbol.MageSkill, baseStats: { str: 4, int: 15, vit: 6, agi: 7, dex: 8, luk: 10 }, skill: { name: '파이어볼', description: '모든 적에게 화염 피해를 입힙니다.' } },
  [JobClass.Priest]: { name: '사제', skillSymbol: SlotSymbol.PriestSkill, baseStats: { str: 6, int: 12, vit: 8, agi: 6, dex: 7, luk: 11 }, skill: { name: '성스러운 빛', description: '모든 아군의 HP를 회복시킵니다.' } },
  [JobClass.Hunter]: { name: '사냥꾼', skillSymbol: SlotSymbol.HunterSkill, baseStats: { str: 8, int: 6, vit: 7, agi: 12, dex: 12, luk: 5 }, skill: { name: '연발 사격', description: '모든 적에게 화살비를 퍼붓습니다.' } },
  [JobClass.Paladin]: { name: '성기사', skillSymbol: SlotSymbol.PaladinSkill, baseStats: { str: 10, int: 8, vit: 12, agi: 5, dex: 6, luk: 9 }, skill: { name: '신성 방패', description: '적에게 피해를 주고 아군을 보호합니다.' } },
  [JobClass.Bard]: { name: '음유시인', skillSymbol: SlotSymbol.BardSkill, baseStats: { str: 5, int: 10, vit: 7, agi: 8, dex: 8, luk: 12 }, skill: { name: '용기의 노래', description: '적에게 피해를 주고 아군을 격려합니다.' } },
  [JobClass.Rogue]: { name: '도적', skillSymbol: SlotSymbol.RogueSkill, baseStats: { str: 7, int: 5, vit: 6, agi: 14, dex: 10, luk: 8 }, skill: { name: '급소 찌르기', description: '적의 약점을 노려 치명적인 피해를 입힙니다.' } },
  [JobClass.Berserker]: { name: '광전사', skillSymbol: SlotSymbol.BerserkerSkill, baseStats: { str: 14, int: 3, vit: 11, agi: 9, dex: 5, luk: 8 }, skill: { name: '피의 갈망', description: '자신의 HP가 낮을수록 더 강력한 피해를 입힙니다.' } },
};

export const PERSONALITIES: Record<Personality, { dialogue: string[] }> = {
  brave: { dialogue: ["이 정도는 아무것도 아니야!", "모두, 나를 따르라!", "정면으로 돌파한다!"] },
  cautious: { dialogue: ["잠깐, 신중하게 접근해야 해.", "주변을 경계하는 게 좋겠어.", "함정일지도 몰라..."] },
  jolly: { dialogue: ["와, 신나는 모험이네요!", "다 함께 힘내요!", "이것도 재미있어!"] },
  stoic: { dialogue: ["...임무를 계속한다.", "감정은 불필요하다.", "결과로 증명할 뿐."] },
  sarcastic: { dialogue: ["오, 정말 대단한 작전이네. (비꼬는 말투)", "이게 최선이야? 진짜로?", "잘못되면 네 탓인 거 알지?"] },
};

export const BLUEPRINTS: Record<string, Blueprint> = {
  'training_sword': { id: 'training_sword', name: '훈련용 검', type: 'weapon', stats: { str: 1 }, craftingCost: 0, materials: [], icon: 'https://i.postimg.cc/fWjpBWFV/Sym01-Sword.png', description: '기본적인 훈련용 검.' },
  'training_vest': { id: 'training_vest', name: '훈련용 조끼', type: 'armor', stats: { vit: 1 }, craftingCost: 0, materials: [], icon: 'https://i.postimg.cc/kMFzfMZW/Sym02-Shield.png', description: '기본적인 훈련용 조끼.' },
  'starter_sword': { id: 'starter_sword', name: '낡은 검', type: 'weapon', stats: { str: 3 }, craftingCost: 50, materials: [{ materialId: 'goblin_ear', quantity: 3 }], icon: 'https://i.postimg.cc/y6Xtv65X/Sym08-Broken-Sword.png', description: '초보 모험가에게 어울리는 검.' },
  'leather_armor': { id: 'leather_armor', name: '가죽 갑옷', type: 'armor', stats: { vit: 3 }, craftingCost: 50, materials: [{ materialId: 'tough_leather', quantity: 3 }], icon: 'https://i.postimg.cc/kMFzfMZW/Sym02-Shield.png', description: '질긴 가죽으로 만든 갑옷.' },
  'steel_sword': { id: 'steel_sword', name: '강철 검', type: 'weapon', stats: { str: 8 }, craftingCost: 200, materials: [{ materialId: 'tough_leather', quantity: 5 }], icon: 'https://i.postimg.cc/fWjpBWFV/Sym01-Sword.png', description: '강철로 만들어져 예리하고 튼튼하다.' },
};

export const UNLOCKABLE_CHARACTERS: Omit<Character, 'hp' | 'maxHp' | 'weapon' | 'armor' | 'skillPower' | 'maxSkillPower' | 'gold' | 'inventory' | 'rapport' | 'rapportBonuses'>[] = [
    { id: 'paladin_iona', name: '아이오나', jobClass: JobClass.Paladin, gender: 'female', avatar: 'https://i.postimg.cc/TPtv7dhz/04-Char-A.png', personality: 'cautious', backstory: '신념을 위해 싸우는 성기사. 언제나 동료의 안전을 최우선으로 생각한다.', ...JOB_CLASSES[JobClass.Paladin].baseStats },
];

export const CHARACTER_IMAGES: Record<string, string> = {
    'warrior_rhea': 'https://i.postimg.cc/s2TC6j10/01-Char-A.png',
    'priest_elina': 'https://i.postimg.cc/zfxYtzVZ/02-Char-A.png',
    'mage_celen': 'https://i.postimg.cc/3wtQS8dM/03-Char-A.png',
    'paladin': 'https://i.postimg.cc/TPtv7dhz/04-Char-A.png',
    'rogue': 'https://i.postimg.cc/SKgbTSJh/05-Char-A.png',
    'berserker': 'https://i.postimg.cc/q71HbJzk/06-Char-A.png',
    'hunter': 'https://i.postimg.cc/4dnkjDhj/07-Char-A.png',
    'bard': 'https://i.postimg.cc/xCqDBwbW/08-Char-A.png',
};

export const TRAINING_COURSES: TrainingCourse[] = [
  { id: 'basic_str', name: '기초 근력 훈련', description: '기초적인 근력을 향상시킵니다.', durationMinutes: 10, cost: 50, statBoost: { str: 1 }, commanderBoost: { cost: 100, description: '훈련 시간 50% 단축', successRateIncrease: 0 } },
  { id: 'basic_int', name: '기초 명상', description: '집중력을 높여 지능을 향상시킵니다.', durationMinutes: 10, cost: 50, statBoost: { int: 1 }, commanderBoost: { cost: 100, description: '훈련 시간 50% 단축', successRateIncrease: 0 } },
  { id: 'basic_vit', name: '체력 단련', description: '기초 체력을 길러 생존력을 높입니다.', durationMinutes: 15, cost: 70, statBoost: { vit: 1 }, commanderBoost: { cost: 120, description: '훈련 시간 50% 단축', successRateIncrease: 0 } },
];

export const GIFTS: Record<string, Gift> = {
  'wildflower': { id: 'wildflower', name: '들꽃', description: '소박하지만 아름다운 들꽃. (+1 친밀도)', rapportBoost: 1, icon: 'https://placehold.co/100x100/81c784/ffffff.png?text=Flower' },
  'shiny_stone': { id: 'shiny_stone', name: '반짝이는 돌', description: '길가에서 주운 예쁜 돌. (+1 친밀도)', rapportBoost: 1, icon: 'https://placehold.co/100x100/90a4ae/ffffff.png?text=Stone' },
};

export const RAPPORT_LEVELS: { level: number; requiredRapport: number; bonus: RapportBonus }[] = [
    { level: 1, requiredRapport: 50, bonus: { stat: 'maxHp', value: 20, description: '최대 HP +20' } },
    { level: 2, requiredRapport: 150, bonus: { stat: 'specialSkill', value: 1, description: '특별 스킬 해금: 연계 공격' } },
];

export const MONSTERS: Record<string, Monster> = {
  slime: { name: '슬라임', hp: 50, maxHp: 50, avatar: 'https://i.postimg.cc/hvzJ4ZHg/01-Mon-Normal-Slime.png', drops: [{ materialId: 'goblin_ear', dropChance: 0.5, min: 1, max: 2 }] },
  bat: { name: '박쥐', hp: 60, maxHp: 60, avatar: 'https://i.postimg.cc/VvrSsZ3v/02-Mon-Normal-Bat.png', drops: [] },
  goblin: { name: '고블린', hp: 80, maxHp: 80, avatar: 'https://i.postimg.cc/2ybqj9PZ/03-Mon-Normal-Gblin-Low.png', drops: [{ materialId: 'goblin_ear', dropChance: 0.8, min: 1, max: 3 }] },
  werewolf: { name: '늑대인간', hp: 150, maxHp: 150, avatar: 'https://i.postimg.cc/VvxJJB8L/04-Mon-Wolf-Normal.png', drops: [{ materialId: 'tough_leather', dropChance: 0.5, min: 1, max: 2 }] },
  spider: { name: '거미', hp: 100, maxHp: 100, avatar: 'https://i.postimg.cc/FzdfFC2k/05-Mon-Spider-Normal.png', drops: [] },
  skeleton: { name: '해골병사', hp: 120, maxHp: 120, avatar: 'https://i.postimg.cc/d3bhhmYh/06-Mon-Normal-Skeleton.png', drops: [] },
  zombie: { name: '좀비', hp: 180, maxHp: 180, avatar: 'https://i.postimg.cc/yxMDDXHS/07-Mon-Zombie-Normal.png', drops: [] },
  ghoul: { name: '구울', hp: 200, maxHp: 200, avatar: 'https://i.postimg.cc/cCpvvMSn/08-Mon-Ghoul-Normal.png', drops: [] },
  gargoyle: { name: '가고일', hp: 300, maxHp: 300, avatar: 'https://i.postimg.cc/x8wXXy2m/09-Mon-Gargoyle-Elite.png', drops: [{ materialId: 'magic_stone', dropChance: 0.3, min: 1, max: 1 }] },
  mimic: { name: '미믹', hp: 250, maxHp: 250, avatar: 'https://i.postimg.cc/8c277BSd/10-Mon-Mimic-Elite.png', drops: [] },
  kobold: { name: '코볼드', hp: 220, maxHp: 220, avatar: 'https://i.postimg.cc/MHCnnbSY/11-Mon-Kobold-Elite.png', drops: [] },
  skeleton_archer: { name: '해골궁수', hp: 180, maxHp: 180, avatar: 'https://i.postimg.cc/j2pDDQbc/12-Mon-Skeleton-Archer-Elite.png', drops: [] },
  ogre: { name: '오우거', hp: 400, maxHp: 400, avatar: 'https://i.postimg.cc/C53RRHgc/13-Mon-Ogre-Elite.png', drops: [{ materialId: 'tough_leather', dropChance: 0.8, min: 2, max: 4 }] },
  troll: { name: '트롤', hp: 500, maxHp: 500, avatar: 'https://i.postimg.cc/BZkL7sKG/14-Mon-Troll-Elite.png', drops: [] },
  blue_wyvern: { name: '블루와이번', hp: 800, maxHp: 800, avatar: 'https://i.postimg.cc/44q72Z9g/15-Mon-Wyvern-Mid-Boss.png', drops: [{ materialId: 'dragon_scale', dropChance: 0.2, min: 1, max: 1 }] },
  witch: { name: '푸른탑의 마녀', hp: 700, maxHp: 700, avatar: 'https://i.postimg.cc/xjhJpYzf/16-Mon-Witch-Mid-Boss.png', drops: [{ materialId: 'magic_stone', dropChance: 0.5, min: 2, max: 3 }] },
  lich_king: { name: '혹한의 리치왕', hp: 1000, maxHp: 1000, avatar: 'https://i.postimg.cc/3rV4f7vd/17-Mon-The-Lich-King-Mid-Boss.png', drops: [{ materialId: 'shadow_essence', dropChance: 0.3, min: 1, max: 2 }] },
  minotaur: { name: '미궁의 미노타우르스', hp: 1200, maxHp: 1200, avatar: 'https://i.postimg.cc/9XKRgV74/18-Mon-Minos-Mid-Boss.png', drops: [] },
  golem: { name: '태초의 골렘', hp: 1500, maxHp: 1500, avatar: 'https://i.postimg.cc/SQ321qM2/19-Mon-Orichalk-BOSS.png', drops: [{ materialId: 'ancient_gear', dropChance: 0.5, min: 1, max: 3 }, { materialId: 'obsidian_core', dropChance: 0.1, min: 1, max: 1 }] },
  gold_dragon: { name: '황금의 드래곤', hp: 2000, maxHp: 2000, avatar: 'https://i.postimg.cc/y6tgpBZZ/20-Mon-The-Lord-BOSS.png', drops: [{ materialId: 'dragon_scale', dropChance: 0.8, min: 1, max: 2 }] },
  dark_lord: { name: '어둠의 군주', hp: 5000, maxHp: 5000, avatar: 'https://i.postimg.cc/jdfWG9HW/21-Mon-The-Dark-Lord-Raid-BOSS.png', drops: [{ materialId: 'void_crystal', dropChance: 1, min: 1, max: 1 }] }
};

export const CHAPTERS: Chapter[] = [
  { id: 'ch_1', name: 'Chapter 1: 새로운 시작', description: '모든 것이 시작된 고블린의 숲.', episodeIds: ['ep_1_1', 'ep_1_2'], mapPosition: { x: 20, y: 80 }, storyPoints: 2, terrainTypes: ['grass', 'dirt'] },
  { id: 'ch_2', name: 'Chapter 2: 버섯과 폐허', description: '축축한 버섯 숲과 고대 유적.', episodeIds: ['ep_2_1', 'ep_2_2'], mapPosition: { x: 35, y: 65 }, storyPoints: 3, terrainTypes: ['grass', 'dirt'] },
  { id: 'ch_3', name: 'Chapter 3: 죽은 자의 땅', description: '언데드가 배회하는 음산한 묘지.', episodeIds: ['ep_3_1', 'ep_3_2'], mapPosition: { x: 55, y: 75 }, storyPoints: 3, terrainTypes: ['dirt'] },
  { id: 'ch_4', name: 'Chapter 4: 공허의 문턱', description: '차원의 틈새에서 흘러나온 공허의 기운.', episodeIds: ['ep_4_1', 'ep_4_2'], mapPosition: { x: 70, y: 60 }, storyPoints: 4, terrainTypes: ['dirt'] },
  { id: 'ch_5', name: 'Chapter 5: 최후의 결전', description: '세계의 운명을 건 마지막 싸움.', episodeIds: ['ep_5_1', 'ep_5_2'], mapPosition: { x: 85, y: 50 }, storyPoints: 5, terrainTypes: ['dirt'] },
  ];

const ep_1_1_stages: Stage[] = [
    { name: "고블린 정찰병", monsters: [MONSTERS.goblin], expReward: 10, goldReward: 20 },
    { name: "고블린 무리", monsters: [MONSTERS.goblin, MONSTERS.goblin], expReward: 25, goldReward: 50 },
];
const ep_1_2_stages: Stage[] = [
    { name: "고블린 족장", monsters: [MONSTERS.ogre], expReward: 50, goldReward: 100 },
];
// Chapter 2 Stages
const ep_2_1_stages: Stage[] = [
    { name: "버섯 괴물", monsters: [MONSTERS.spider], expReward: 60, goldReward: 120 },
    { name: "늑대인간 무리", monsters: [MONSTERS.werewolf, MONSTERS.werewolf], expReward: 80, goldReward: 150 },
];
const ep_2_2_stages: Stage[] = [
    { name: "푸른탑의 마녀", monsters: [MONSTERS.witch], expReward: 150, goldReward: 300, isBoss: true },
];
// Chapter 3 Stages
const ep_3_1_stages: Stage[] = [
    { name: "해골 병사들", monsters: [MONSTERS.skeleton, MONSTERS.skeleton], expReward: 120, goldReward: 200 },
    { name: "부패한 구울", monsters: [MONSTERS.ghoul, MONSTERS.zombie], expReward: 150, goldReward: 250 },
];
const ep_3_2_stages: Stage[] = [
    { name: "혹한의 리치왕", monsters: [MONSTERS.lich_king], expReward: 300, goldReward: 600, isBoss: true },
];
// Chapter 4 Stages
const ep_4_1_stages: Stage[] = [
    { name: "미믹", monsters: [MONSTERS.mimic], expReward: 200, goldReward: 400 },
    { name: "트롤", monsters: [MONSTERS.troll], expReward: 250, goldReward: 500 },
];
const ep_4_2_stages: Stage[] = [
    { name: "태초의 골렘", monsters: [MONSTERS.golem], expReward: 500, goldReward: 1000, isBoss: true },
];
// Chapter 5 Stages
const ep_5_1_stages: Stage[] = [
    { name: "블루 와이번", monsters: [MONSTERS.blue_wyvern], expReward: 400, goldReward: 800 },
    { name: "미노타우르스", monsters: [MONSTERS.minotaur], expReward: 450, goldReward: 900 },
];
const ep_5_2_stages: Stage[] = [
    { name: "어둠의 군주", monsters: [MONSTERS.dark_lord], expReward: 1000, goldReward: 2000, isBoss: true },
];

export const EPISODES: Episode[] = [
    { id: 'ep_1_1', name: '고블린 소굴', description: '숲을 점령한 고블린들을 소탕하세요.', requiredLevel: 1, stages: ep_1_1_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_mushroomForest, storyIntro: [], storyOutro: [], compassPieceId: 'piece_1' },
    { id: 'ep_1_2', name: '족장의 동굴', description: '고블린 족장을 물리치고 숲에 평화를 되찾으세요.', requiredLevel: 2, stages: ep_1_2_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_goblinCave, storyIntro: [], storyOutro: [], compassPieceId: 'piece_2' },
    { id: 'ep_2_1', name: '안개 낀 버섯 숲', description: '독버섯과 흉포한 늑대인간이 도사리고 있습니다.', requiredLevel: 5, stages: ep_2_1_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_mushroomForest, storyIntro: [], storyOutro: [], compassPieceId: 'piece_3' },
    { id: 'ep_2_2', name: '푸른탑', description: '숲을 오염시키는 마녀를 처치하세요.', requiredLevel: 8, stages: ep_2_2_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_dwarvenRuins, storyIntro: [], storyOutro: [], compassPieceId: 'piece_4' },
    { id: 'ep_3_1', name: '망자의 묘지', description: '끊임없이 되살아나는 언데드를 잠재우세요.', requiredLevel: 10, stages: ep_3_1_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_goblinCave, storyIntro: [], storyOutro: [], compassPieceId: 'piece_5' },
    { id: 'ep_3_2', name: '얼어붙은 왕좌', description: '죽은 자들의 왕, 리치왕에게 안식을 선사하세요.', requiredLevel: 14, stages: ep_3_2_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_dwarvenRuins, storyIntro: [], storyOutro: [], compassPieceId: 'piece_6' },
    { id: 'ep_4_1', name: '공허의 황무지', description: '차원의 틈새에서 기어나온 이계의 존재들.', requiredLevel: 18, stages: ep_4_1_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_voidWasteland, storyIntro: [], storyOutro: [], compassPieceId: 'piece_7' },
    { id: 'ep_4_2', name: '태초의 제단', description: '세계를 지키던 고대의 수호자를 막으세요.', requiredLevel: 22, stages: ep_4_2_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_finalArena, storyIntro: [], storyOutro: [], compassPieceId: 'piece_8' },
    { id: 'ep_5_1', name: '용의 협곡', description: '고룡들이 지키는 마지막 관문.', requiredLevel: 25, stages: ep_5_1_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_voidWasteland, storyIntro: [], storyOutro: [], compassPieceId: 'piece_9' },
    { id: 'ep_5_2', name: '어둠의 심장부', description: '모든 악의 근원을 파괴하고 세계에 평화를 되찾으세요.', requiredLevel: 30, stages: ep_5_2_stages, backgroundUrl: BACKGROUND_IMAGES.battlefield_finalArena, storyIntro: [], storyOutro: [], compassPieceId: 'piece_10' },
];

export const findEpisodeById = (id: string): Episode | undefined => EPISODES.find(e => e.id === id);

export const WORLD_EVENTS: Record<string, WorldEvent> = {
  'traveling_merchant': {
    id: 'traveling_merchant', title: '수상한 상인', description: '한 상인이 희귀한 물건을 팔고 있습니다.',
    choices: [{ text: '산다', outcome: { description: '샀다.', effects: [{ type: 'gold_change', payload: { amount: -100 } }] } }, { text: '안 산다', outcome: { description: '안 샀다.', effects: [] } }]
  }
};

export const COMPASS_PIECES: Record<string, { name: string; description: string; }> = {
    'piece_1': { name: '나침반 조각 1', description: '고대의 나침반 조각.' },
    'piece_2': { name: '나침반 조각 2', description: '고대의 나침반 조각.' },
    'piece_3': { name: '나침반 조각 3', description: '고대의 나침반 조각.' },
    'piece_4': { name: '나침반 조각 4', description: '고대의 나침반 조각.' },
    'piece_5': { name: '나침반 조각 5', description: '고대의 나침반 조각.' },
    'piece_6': { name: '나침반 조각 6', description: '고대의 나침반 조각.' },
    'piece_7': { name: '나침반 조각 7', description: '고대의 나침반 조각.' },
    'piece_8': { name: '나침반 조각 8', description: '고대의 나침반 조각.' },
    'piece_9': { name: '나침반 조각 9', description: '고대의 나침반 조각.' },
    'piece_10': { name: '나침반 조각 10', description: '고대의 나침반 조각.' },
};

export const RAPPORT_EVENTS: Record<string, any> = {
    'gift_from_rhea': { id: 'gift_from_rhea', characterId: 'warrior_rhea', type: 'give_gift', payload: { gift: { type: 'material', id: 'tough_leather', quantity: 3 } } }
};

export const BONDING_EPISODES: Record<string, BondingEpisode> = {
    'rhea_ep_1': {
        id: 'rhea_ep_1', characterId: 'warrior_rhea', title: '첫 번째 훈련',
        prerequisites: { rapport: 20 },
        story: [{ speaker: 'rhea', line: '단장, 내 훈련을 좀 도와줘.' }, { speaker: 'commander', line: '좋아, 리아.' }],
        reward: { stat: 'str', value: 2, description: '힘 +2' }
    }
};

export const ENDING_SCRIPTS: Record<string, CharacterEnding> = {
    'warrior_rhea': { characterId: 'warrior_rhea', story: [{ speaker: 'rhea', line: '단장, 당신과 함께해서 기뻤어.' }] }
};

export const SLOT_SYMBOLS: Record<SlotSymbol, SlotSymbolData> = {
    [SlotSymbol.Sword]: { id: SlotSymbol.Sword, icon: 'https://i.postimg.cc/fWjpBWFV/Sym01-Sword.png', name: '검' },
    [SlotSymbol.Shield]: { id: SlotSymbol.Shield, icon: 'https://i.postimg.cc/kMFzfMZW/Sym02-Shield.png', name: '방패' },
    [SlotSymbol.Potion]: { id: SlotSymbol.Potion, icon: 'https://i.postimg.cc/NG7SpGV8/Sym03-Potion.png', name: '포션' },
    [SlotSymbol.Gem]: { id: SlotSymbol.Gem, icon: 'https://i.postimg.cc/sf9qwf87/Sym04-Gem.png', name: '보석' },
    [SlotSymbol.Skull]: { id: SlotSymbol.Skull, icon: 'https://i.postimg.cc/66LgY6Sd/Sym05-Skull.png', name: '해골' },
    [SlotSymbol.Coin]: { id: SlotSymbol.Coin, icon: 'https://i.postimg.cc/kMFzfMZv/Sym06-Coin.png', name: '코인' },
    [SlotSymbol.TreasureChest]: { id: SlotSymbol.TreasureChest, icon: 'https://i.postimg.cc/2jFM2jJT/Sym07-Chest.png', name: '보물상자' },
    [SlotSymbol.BrokenSword]: { id: SlotSymbol.BrokenSword, icon: 'https://i.postimg.cc/y6Xtv65X/Sym08-Broken-Sword.png', name: '부서진 검' },
    [SlotSymbol.WarriorSkill]: { id: SlotSymbol.WarriorSkill, icon: 'https://i.postimg.cc/Pfz92fc2/Sym09-Char-A.png', name: '전사 스킬' },
    [SlotSymbol.PriestSkill]: { id: SlotSymbol.PriestSkill, icon: 'https://i.postimg.cc/kMFzfMZY/Sym10-Char-A.png', name: '사제 스킬' },
    [SlotSymbol.MageSkill]: { id: SlotSymbol.MageSkill, icon: 'https://i.postimg.cc/J7cvP7gd/Sym11-Char-A.png', name: '마법사 스킬' },
    [SlotSymbol.PaladinSkill]: { id: SlotSymbol.PaladinSkill, icon: 'https://i.postimg.cc/7PMdmPcc/Sym12-Char-A.png', name: '성기사 스킬' },
    [SlotSymbol.HunterSkill]: { id: SlotSymbol.HunterSkill, icon: 'https://i.postimg.cc/Pfz92fc9/Sym13-Char-A.png', name: '사냥꾼 스킬' },
    [SlotSymbol.BardSkill]: { id: SlotSymbol.BardSkill, icon: 'https://i.postimg.cc/TYdSSMM7/Sym14-Char-A.png', name: '음유시인 스킬' },
    [SlotSymbol.RogueSkill]: { id: SlotSymbol.RogueSkill, icon: 'https://i.postimg.cc/SKgbTSJh/05-Char-A.png', name: '도적 스킬' }, 
    [SlotSymbol.BerserkerSkill]: { id: SlotSymbol.BerserkerSkill, icon: 'https://i.postimg.cc/q71HbJzk/06-Char-A.png', name: '광전사 스킬' },
};

export const ALL_SYMBOLS = Object.values(SlotSymbol);

export const EXPLORATION_SYMBOLS: Record<ExplorationSymbol, { id: ExplorationSymbol; icon: string; value: number }> = {
    [ExplorationSymbol.Move0]: { id: ExplorationSymbol.Move0, icon: 'https://placehold.co/100x100/9e9e9e/ffffff.png?text=0', value: 0 },
    [ExplorationSymbol.Move1]: { id: ExplorationSymbol.Move1, icon: 'https://placehold.co/100x100/81c784/ffffff.png?text=1', value: 1 },
    [ExplorationSymbol.Move2]: { id: ExplorationSymbol.Move2, icon: 'https://placehold.co/100x100/4caf50/ffffff.png?text=2', value: 2 },
    [ExplorationSymbol.Move3]: { id: ExplorationSymbol.Move3, icon: 'https://placehold.co/100x100/2e7d32/ffffff.png?text=3', value: 3 },
};

export const ALL_EXPLORATION_SYMBOLS = Object.values(ExplorationSymbol);

export const SLOT_SYMBOL_DESCRIPTIONS = {
  [SlotSymbol.Sword]: { name: '검', description: '기본 공격. 힘(STR)과 손재주(DEX)에 따라 피해량이 증가합니다.' },
  [SlotSymbol.Shield]: { name: '방패', description: '방어. 몬스터의 다음 공격 피해량을 감소시킵니다.' },
  [SlotSymbol.Potion]: { name: '포션', description: '회복. 자신의 HP를 회복합니다. 사제가 사용 시 파티 전체를 회복시킵니다.' },
  [SlotSymbol.Gem]: { name: '보석', description: '마력 충전. 스킬 게이지를 채웁니다. 마법사가 사용 시 효과가 증폭됩니다.' },
  [SlotSymbol.Skull]: { name: '해골', description: '위험! 몬스터가 즉시 추가 공격을 합니다.' },
  [SlotSymbol.Coin]: { name: '코인', description: '골드를 획득합니다. 행운(LUK)에 따라 획득량이 증가합니다.' },
  [SlotSymbol.TreasureChest]: { name: '보물상자', description: 'HP, 스킬 게이지, 골드를 모두 소량 획득합니다.' },
  [SlotSymbol.BrokenSword]: { name: '부서진 검', description: '방어구 부수기. 2턴간 몬스터의 방어력을 약화시켜 받는 피해를 증가시킵니다.' },
  [SlotSymbol.WarriorSkill]: { name: '전사 스킬', description: '전사의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
  [SlotSymbol.PriestSkill]: { name: '사제 스킬', description: '사제의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
  [SlotSymbol.MageSkill]: { name: '마법사 스킬', description: '마법사의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
  [SlotSymbol.PaladinSkill]: { name: '성기사 스킬', description: '성기사의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
  [SlotSymbol.HunterSkill]: { name: '사냥꾼 스킬', description: '사냥꾼의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
  [SlotSymbol.BardSkill]: { name: '음유시인 스킬', description: '음유시인의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
  [SlotSymbol.RogueSkill]: { name: '도적 스킬', description: '도적의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
  [SlotSymbol.BerserkerSkill]: { name: '광전사 스킬', description: '광전사의 스킬 게이지를 크게 채웁니다. 다른 직업도 소량 채울 수 있습니다.' },
};

export const COMMANDER_AVATARS = {
  base: 'https://i.postimg.cc/VNnDvDPT/01-Commander-Base.png',
  scared: 'https://i.postimg.cc/nzxTDBnW/01-Commander-Scary.png',
  serious: 'https://i.postimg.cc/DZh5XL7j/01-Commander-serious.png',
  summon: 'https://i.postimg.cc/MTwtQVzF/01-Commander-Summon.png',
};

export const EXPLORATION_PLAYER_TOKEN = 'https://placehold.co/100x100/ffd600/000000.png?text=P';