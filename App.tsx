import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Character, Monster, SlotSymbol, HpChangeEffect, JobClass, BattleResult, Commander, Episode, Equipment, CombatDialogueKey, GoogleUser, RapportBonus, Blueprint, Quest, QuestType, QuestNotification, MercenaryRequest, BondingEpisode, WorldEvent, BattlefieldModifier, GuildPerk, LogType, DialogueLine, StatKey, CharacterEnding, TrainingCourse, HexCoord, HexTileEvent, Personality, Stage, LogEntry, ExplorationState } from './types';
import { gameService, getEffectiveStats } from './services/gameService';
import { ALL_SYMBOLS, EPISODES, JOB_CLASSES, PERSONALITIES, BLUEPRINTS, UNLOCKABLE_CHARACTERS, TRAINING_COURSES, GIFTS, RAPPORT_LEVELS, CRAFTING_MATERIALS, CHAPTER_QUESTS, SLOT_SYMBOLS, TRAINING_GROUND_UPGRADES, ARMORY_UPGRADES, WORLD_EVENTS, GUILD_LEVEL_THRESHOLDS, GUILD_PERKS, SLOT_SYMBOL_DESCRIPTIONS, COMMANDER_AVATARS, COMPASS_PIECES, findEpisodeById, RAPPORT_EVENTS, ENDING_SCRIPTS, BONDING_EPISODES, MONSTERS, BACKGROUND_IMAGES, CHAPTERS, HEX_EVENT_ICONS } from './constants';
import CharacterPanel from './components/CharacterPanel';
import SlotMachine from './components/SlotMachine';
import PartyPanel from './components/PartyPanel';
import LoginScreen from './components/LoginScreen';
import GameHub from './components/GameHub';
import WorldMap from './components/WorldMap';
import ExplorationMap from './components/ExplorationMap';
import Prologue from './components/Prologue';
import { TrainingGround } from './components/TrainingGround';
import LoadingSpinner from './components/LoadingSpinner';
import BattleHeader from './components/BattleHeader';
import MercenaryManagementScreen from './components/MercenaryManagementScreen';
import { Armory } from './components/Armory';
import QuestBoard from './components/QuestBoard';
import QuestToast from './components/QuestToast';
import CharacterUnlockModal from './components/CharacterUnlockModal';
import MercenaryRequestModal from './components/MercenaryRequestModal';
import CommandersOffice from './components/CommandersOffice';
import WorldEventModal from './components/WorldEventModal';
import GuildLevelUpModal from './components/GuildLevelUpModal';
import SkillEffectOverlay from './components/SkillEffectOverlay';
import StoryPlayerModal from './components/StoryPlayerModal';
import { IconExp, IconGold, IconTreasureChest } from './components/Icons';
import { jwtDecode } from 'jwt-decode';
import SetNameScreen from './components/SetNameScreen';
import QuestCompletionModal from './components/QuestCompletionModal';
import CharacterEndingPlayer from './components/CharacterEndingPlayer';
import BattleQuestTracker from './components/BattleQuestTracker';
import DiscoveryModal from './components/DiscoveryModal';
import PayTableModal from './components/PayTableModal';



const initialReels = Array(3).fill(null).map(() => Array(3).fill(ALL_SYMBOLS[0]));
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

type GameState = 'login' | 'prologue' | 'setName' | 'hub' | 'worldMap' | 'exploration' | 'loading' | 'playing' | 'battleResult' | 'gameover' | 'bag' | 'training' | 'mercenaryManagement' | 'questBoard' | 'commandersOffice' | 'armory';
type BattleStatus = 'IDLE' | 'PLAYER_ACTION' | 'MONSTER_ACTION' | 'BATTLE_ENDED';

type AnimatedEffect = {
    id: number;
    type: 'coin' | 'sword' | 'potion' | 'gem';
    symbol: SlotSymbol;
    startRect: DOMRect;
    targetId: string;
};

type NotificationType = 'mercenaryManagement' | 'questBoard' | 'requests';


const AnimatedExpBar: React.FC<{
  startExp: number;
  gainedExp: number;
  expToLevel: number;
  startLevel: number;
}> = ({ startExp, gainedExp, expToLevel, startLevel }) => {
  const [displayExp, setDisplayExp] = useState(startExp);
  const [displayLevel, setDisplayLevel] = useState(startLevel);
  const [currentExpToLevel, setCurrentExpToLevel] = useState(expToLevel);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    let currentExp = startExp;
    let remainingGained = gainedExp;
    let level = startLevel;
    let nextLevelExp = expToLevel;

    if (animationRef.current) {
        clearInterval(animationRef.current);
    }
    
    animationRef.current = window.setInterval(() => {
      if (remainingGained > 0) {
        const increment = Math.max(1, Math.floor(gainedExp / 100));
        const actualIncrement = Math.min(increment, remainingGained);
        
        currentExp += actualIncrement;
        remainingGained -= actualIncrement;

        if (currentExp >= nextLevelExp) {
          setIsLevelUp(true);
          setTimeout(() => setIsLevelUp(false), 500);
          level++;
          currentExp -= nextLevelExp;
          nextLevelExp = Math.floor(nextLevelExp * 1.5);
          setDisplayLevel(level);
          setCurrentExpToLevel(nextLevelExp);
        }
        setDisplayExp(currentExp);
      } else {
         if (animationRef.current) {
            clearInterval(animationRef.current);
        }
      }
    }, 20);

    return () => {
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }
    };
  }, [startExp, gainedExp, expToLevel, startLevel]);

  const percentage = currentExpToLevel > 0 ? (displayExp / currentExpToLevel) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-3xl mb-2">
        <span className={`font-bold text-5xl transition-transform duration-300 ${isLevelUp ? 'scale-125 text-yellow-300' : ''}`}>
          LV. {displayLevel}
        </span>
        <span className="font-mono">{Math.floor(displayExp)} / {currentExpToLevel} EXP</span>
      </div>
      <div className="w-full bg-black/50 rounded-full h-10 border-2 border-amber-800 overflow-hidden relative shadow-inner">
        <div
          className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};


interface BattleResultScreenProps {
  result: BattleResult | null;
  battleParty: Character[];
  commander: Commander | null;
  battleDamageTracker: Record<string, number>;
  onGoToHub: () => void;
  onRetryBattle: () => void;
  onNextStage: () => void;
  currentBattleInfo: { episodeId: string; stageIndex: number } | null;
  postBattleGameState: GameState;
}

const BattleResultScreen: React.FC<BattleResultScreenProps> = ({
  result, battleParty, commander, battleDamageTracker, onGoToHub, onRetryBattle, onNextStage, currentBattleInfo, postBattleGameState
}) => {
  if (!result || !commander) return null;

  const mvp = battleParty.find(p => p.id === result.mvpCharacterId);
  const isFieldBattle = currentBattleInfo?.episodeId === 'field_battle';
  const episode = currentBattleInfo ? findEpisodeById(currentBattleInfo.episodeId) : null;
  const isLastStage = episode ? currentBattleInfo!.stageIndex >= episode.stages.length - 1 : true;
  const canGoNext = result.isVictory && episode && !isLastStage && !isFieldBattle;

  return (
    <div className="modal-backdrop battle-result-screen">
      <div className="battle-result-content">
        <div className="w-full h-full flex">
          {/* Left Panel */}
          <div className="w-1/2 flex flex-col p-8 overflow-y-auto space-y-6">
            {result.isVictory ? (
              <>
                <div className="result-section">
                  <h3 className="result-section-title">단장 성장</h3>
                  <AnimatedExpBar 
                      startExp={result.commanderStateBefore.exp}
                      gainedExp={result.expGained}
                      expToLevel={result.commanderStateBefore.expToNextLevel}
                      startLevel={result.commanderStateBefore.level}
                  />
                </div>
                <div className="result-section">
                  <h3 className="result-section-title">획득 보상</h3>
                  <div className="space-y-4 text-4xl">
                    <p className="flex items-center gap-3">
                      <IconGold className="w-12 h-12 text-yellow-800"/>
                      <span>단장 골드: <span className="font-bold text-yellow-800">{result.settlement.commanderGold.toLocaleString()} G</span></span>
                    </p>
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-4xl">용병 정산금:</span>
                      <div className="pl-4 reward-settlement-list">
                        {result.settlement.mercenaryGains.map(gain => (
                          <p key={gain.name} className="bg-black/10 px-4 py-2 rounded">{gain.name} <span className="font-bold text-yellow-900">{gain.gold.toLocaleString()} G</span></p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {result.materialsGained && result.materialsGained.length > 0 && (
                  <div className="result-section">
                    <h3 className="result-section-title flex items-center gap-3">
                      <IconTreasureChest className="w-12 h-12 text-amber-800"/> 획득한 재료
                    </h3>
                    <div className="flex flex-wrap gap-8">
                      {result.materialsGained.map(mat => {
                        const matInfo = CRAFTING_MATERIALS[mat.id];
                        return matInfo ? (
                          <div key={mat.id} className="flex items-center gap-4 bg-black/10 p-4 rounded-lg" title={matInfo.description}>
                            <img src={matInfo.icon} alt={matInfo.name} className="w-28 h-28"/>
                            <span className="text-5xl font-bold">x{mat.quantity}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-4xl mt-12 text-center text-gray-700">전력을 보강하여 다시 도전하세요.</p>
            )}
          </div>
          {/* Right Panel */}
          <div className="w-1/2 relative battle-result-mvp-container">
            {mvp && (
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
                  <img src={mvp.avatar} alt={mvp.name} className="battle-result-mvp-img absolute inset-0 w-full h-full object-contain drop-shadow-2xl"/>
                  <div className="relative z-10 text-center bg-black/50 p-6 rounded-xl backdrop-blur-sm">
                      <h3 className="text-4xl text-yellow-300 font-bold">MVP</h3>
                      <h2 className="text-7xl font-bold text-white">{mvp.name}</h2>
                  </div>
              </div>
            )}
          </div>
        </div>
        <div className="result-footer">
          <button onClick={onGoToHub} className={`ui-button ${canGoNext || !result.isVictory ? 'ui-button-secondary' : 'ui-button-primary'}`}>
            {postBattleGameState === 'exploration' ? '탐험 계속하기' : '용병 캠프로'}
          </button>
          <button onClick={onRetryBattle} className="ui-button ui-button-secondary">
            다시 하기
          </button>
          {canGoNext && (
            <button onClick={onNextStage} className="ui-button ui-button-primary">
              다음 스테이지
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [postBattleGameState, setPostBattleGameState] = useState<GameState>('hub');
  const [reels, setReels] = useState<SlotSymbol[][]>(initialReels);
  const [isSpinning, setIsSpinning] = useState(false);
  const [party, setParty] = useState<Character[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [activeMercenaryIndex, setActiveMercenaryIndex] = useState(0);
  const [battleStatus, setBattleStatus] = useState<BattleStatus>('IDLE');
  const [hpChangeEffects, setHpChangeEffects] = useState<HpChangeEffect[]>([]);
  const [actingCharacterName, setActingCharacterName] = useState<string | null>(null);
  const [monsterImpact, setMonsterImpact] = useState<{ id: string, isCritical: boolean } | null>(null);
  const [damagedMembers, setDamagedMembers] = useState<string[]>([]);
  const [skillUser, setSkillUser] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [commander, setCommander] = useState<Commander | null>(null);
  const [currentBattleInfo, setCurrentBattleInfo] = useState<{ episodeId: string, stageIndex: number } | null>(null);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<[number, number][] | null>(null);
  const [battleDamageTracker, setBattleDamageTracker] = useState<Record<string, number>>({});
  const [questNotifications, setQuestNotifications] = useState<QuestNotification[]>([]);
  const [completedQuestsForModal, setCompletedQuestsForModal] = useState<Quest[]>([]);
  const [unlockedCharacter, setUnlockedCharacter] = useState<Character | null>(null);
  const [activeRequest, setActiveRequest] = useState<MercenaryRequest | null>(null);
  const [activeWorldEvent, setActiveWorldEvent] = useState<WorldEvent | null>(null);
  const [guildLevelUpInfo, setGuildLevelUpInfo] = useState<{ level: number, perk: GuildPerk } | null>(null);
  const [skillEffect, setSkillEffect] = useState<JobClass | null>(null);
  const [isPrologueFinished, setIsPrologueFinished] = useState(false);
  const [storyToPlay, setStoryToPlay] = useState<DialogueLine[] | null>(null);
  const [characterEnding, setCharacterEnding] = useState<CharacterEnding | null>(null);
  const [discovery, setDiscovery] = useState<{ title: string, content: string, icon: string } | null>(null);
  const [isPayTableVisible, setIsPayTableVisible] = useState(false);
  const [dialogueBubbles, setDialogueBubbles] = useState<Record<string, string | null>>({});
  const [initialMercManagementTab, setInitialMercManagementTab] = useState<'profile' | 'equipment' | 'training' | 'rapport' | 'deck'>();
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  const nextEffectId = useRef(0);
  const nextNotificationId = useRef(0);
  
  const previousGameState = useRef<GameState | undefined>(undefined);
  
  const handleClearNotifications = (menu: NotificationType) => {
    // Placeholder - implement logic to mark notifications as read if needed
  };

  const handleSymbolClick = (symbol: SlotSymbol) => {
    const symbolData = SLOT_SYMBOL_DESCRIPTIONS[symbol];
    const symbolIconInfo = SLOT_SYMBOLS[symbol];
    if (symbolData && symbolIconInfo) {
        setDiscovery({
            title: symbolData.name,
            content: symbolData.description,
            icon: symbolIconInfo.icon,
        });
    }
  };

  const handleUseSkill = async (characterId: string) => {
    if (battleStatus !== 'IDLE' || isSpinning) return;

    const playerIndex = party.findIndex(p => p.id === characterId);
    if (playerIndex === -1) return;

    const player = party[playerIndex];
    if (player.skillPower < player.maxSkillPower || player.hp <= 0) return;

    setBattleStatus('PLAYER_ACTION');
    setSkillUser(player.id);

    const { monsterDamage, partyHeal, message, isCritical, isArea } = gameService.useActiveSkill(player);

    setSkillEffect(player.jobClass);
    await delay(1500);
    setSkillEffect(null);

    let nextMonsters = monsters;
    if (monsterDamage > 0) {
        nextMonsters = monsters.map((m, index) => {
            if (m.hp > 0 && (isArea || index === 0)) {
                const newHp = Math.max(0, m.hp - monsterDamage);
                triggerHpChangeEffect(m.instanceId!, monsterDamage, 'damage', isCritical);
                setMonsterImpact({ id: m.instanceId!, isCritical: !!isCritical });
                return { ...m, hp: newHp };
            }
            return m;
        });
        setMonsters(nextMonsters);
        setBattleDamageTracker(prev => ({...prev, [player.id]: (Number(prev[player.id]) || 0) + monsterDamage }));
    }

    if (partyHeal > 0) {
      setParty(prev => prev.map(p => {
        const newHp = Math.min(p.maxHp, p.hp + partyHeal);
        if (newHp > p.hp) {
            triggerHpChangeEffect(p.id, newHp - p.hp, 'heal');
        }
        return { ...p, hp: newHp };
      }));
    }

    setParty(prev => prev.map(p => p.id === characterId ? { ...p, skillPower: 0 } : p));
    
    await delay(800);
    setSkillUser(null);
    setMonsterImpact(null);
    
    const monsterStillAlive = nextMonsters.some(m => m.hp > 0);
    if (monsterStillAlive) {
      setBattleStatus('MONSTER_ACTION');
    } else {
      setBattleStatus('BATTLE_ENDED');
    }
  };

  const handleUseSpecialSkill = (characterId: string) => {
    // Placeholder
  };
    
  const handleOpenRequestModal = (mercId: string) => {
    const request = commander?.requests.find(r => r.characterId === mercId);
    if(request) setActiveRequest(request);
  };

  const handleRequestResponse = (requestId: string, accepted: boolean) => {
      // Logic for handling request acceptance/rejection would go here.
      // For now, we just remove the request.
      setCommander(prev => {
          if (!prev) return null;
          return {
              ...prev,
              requests: prev.requests.filter(r => r.id !== requestId),
          };
      });
      setActiveRequest(null);
  };
  
  useEffect(() => {
    previousGameState.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (previousGameState.current === 'worldMap' && gameState === 'hub' && commander?.requests && commander.requests.length > 0) {
      setActiveRequest(commander.requests[0]);
    }
  }, [gameState, commander?.requests]);

  const notifications = useMemo(() => {
    const activePartyIds = new Set(commander?.activeParty.filter(id => id));
    const unlockedMercs = party.filter(p => !activePartyIds.has(p.id));
    const completableQuests = commander ? Object.values(CHAPTER_QUESTS).flatMap(Object.values).filter(q => {
        const progress = commander.questProgress[q.id];
        return progress && progress.status === 'unclaimed';
    }) : [];
    
    return {
        mercenaryManagement: unlockedMercs.length,
        questBoard: completableQuests.length,
        requests: commander?.requests.length || 0
    };
  }, [party, commander]);

  const triggerHpChangeEffect = useCallback((name: string, amount: number, type: 'heal' | 'damage', isCritical: boolean = false) => {
    const newEffect: HpChangeEffect = { id: nextEffectId.current++, name, amount, type, isCritical };
    setHpChangeEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
        setHpChangeEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 1500);
  }, []);

  const initializeNewGame = useCallback((commanderName: string = '단장') => {
    const initialWeapon: Equipment = { instanceId: 'w_001', blueprintId: 'training_sword', name: '훈련용 검', type: 'weapon', stats: { str: 1 }, icon: BLUEPRINTS['training_sword'].icon, description: '기본 검', salePrice: 0 };
    const initialArmor: Equipment = { instanceId: 'a_001', blueprintId: 'training_vest', name: '훈련용 조끼', type: 'armor', stats: { vit: 1 }, icon: BLUEPRINTS['training_vest'].icon, description: '기본 갑옷', salePrice: 0 };
    
    const baseCharacters: Character[] = [
      { id: 'warrior_rhea', name: '리아', jobClass: JobClass.Warrior, gender: 'female', avatar: UNLOCKABLE_CHARACTERS.find(c => c.id === 'paladin_iona')?.avatar || COMMANDER_AVATARS.base, personality: 'brave', backstory: '명예를 중시하는 용맹한 여기사. 동료를 지키기 위해서라면 목숨도 아끼지 않는다.', ...JOB_CLASSES[JobClass.Warrior].baseStats, hp: 0, maxHp: 0, weapon: initialWeapon, armor: initialArmor, skillPower: 0, maxSkillPower: 100, gold: 100, inventory: [], rapport: 0, rapportBonuses: [] },
      { id: 'priest_elina', name: '엘리나', jobClass: JobClass.Priest, gender: 'female', avatar: 'https://placehold.co/773x1000/e0f2f1/004d40.png?text=Elina', personality: 'jolly', backstory: '언제나 활기찬 신전의 사제. 모두에게 친절하며, 치유의 힘으로 아군을 돕는다.', ...JOB_CLASSES[JobClass.Priest].baseStats, hp: 0, maxHp: 0, weapon: null, armor: initialArmor, skillPower: 0, maxSkillPower: 100, gold: 100, inventory: [], rapport: 0, rapportBonuses: [] },
      { id: 'mage_celen', name: '셀렌', jobClass: JobClass.Mage, gender: 'female', avatar: 'https://placehold.co/773x1000/f3e5f5/4a148c.png?text=Celen', personality: 'stoic', backstory: '과거를 숨긴 채 살아가는 마법사. 차가워 보이지만, 사실은 마음이 여리다.', ...JOB_CLASSES[JobClass.Mage].baseStats, hp: 0, maxHp: 0, weapon: null, armor: initialArmor, skillPower: 0, maxSkillPower: 100, gold: 100, inventory: [], rapport: 0, rapportBonuses: [] },
    ];

    const updatedCharacters = baseCharacters.map(char => {
      const stats = getEffectiveStats(char);
      const maxHp = stats.maxHp;
      return { ...char, maxHp, hp: maxHp };
    });
    
    const initialActiveParty: (string | null)[] = updatedCharacters.map(c => c.id);
    while (initialActiveParty.length < 5) {
      initialActiveParty.push(null);
    }

    const newCommander: Commander = {
        level: 1, exp: 0, expToNextLevel: 100, gold: 500, materials: [], armoryStock: [initialWeapon, initialArmor],
        unlockedBlueprints: ['starter_sword', 'leather_armor'], unlockedMercenaries: [JobClass.Warrior, JobClass.Mage, JobClass.Priest],
        stageProgress: {}, gifts: [{ id: 'wildflower', quantity: 3 }, { id: 'shiny_stone', quantity: 5 }], activeParty: initialActiveParty,
        questProgress: {}, requests: [], trainingGroundLevel: 1, armoryLevel: 1, activeWorldEventId: null,
        battlefieldModifiers: [], guildPrestige: 0, guildLevel: 1, guildPerks: [],
        compassPiecesCollected: [], stamina: 100, maxStamina: 100,
        explorationProgress: { 'ch_1': { q: 0, r: 0 } },
        explorationState: 'IDLE',
        currentMoves: 0,
        visitedTiles: { 'ch_1': [{ q: 0, r: 0 }] },
        revealedEventTiles: {}, storyProgress: {}, unlockedChapterIds: ['ch_1'], currentChapterId: 'ch_1', completedHexEvents: {},
    };

    setParty(updatedCharacters);
    setCommander(newCommander);
    setUser(prev => prev ? { ...prev, name: commanderName } : { email: 'guest', name: commanderName, picture: '' });
  }, []);

  const handleLoginSuccess = useCallback((response: any) => {
    const decoded: { email: string; name: string; picture: string; } = jwtDecode(response.credential);
    setUser({ email: decoded.email, name: decoded.name, picture: decoded.picture });
    const saved = localStorage.getItem(`vowborne_save_${decoded.email}`);
    if (saved) {
      const savedData = JSON.parse(saved);
      setCommander(savedData.commander);
      setParty(savedData.party);
      setIsPrologueFinished(true); // Skip prologue if has save
      setGameState('hub');
    } else {
      setGameState('prologue');
    }
  }, []);

  const handleGuestLogin = useCallback(() => {
    const guestKey = 'vowborne_save_guest';
    const saved = localStorage.getItem(guestKey);
     if (saved) {
      const savedData = JSON.parse(saved);
      setCommander(savedData.commander);
      setParty(savedData.party);
      setUser({ email: 'guest', name: savedData.user.name, picture: '' });
      setIsPrologueFinished(true);
      setGameState('hub');
    } else {
      setUser({ email: 'guest', name: 'Guest', picture: '' });
      setGameState('prologue');
    }
  }, []);
  
  const handlePrologueEnd = useCallback(() => {
      setIsPrologueFinished(true);
      if (user?.name === 'Guest') {
          setGameState('setName');
      } else {
          initializeNewGame(user?.name || '단장');
          setGameState('hub');
      }
  }, [user, initializeNewGame]);

  const handleNameSet = useCallback((name: string) => {
    initializeNewGame(name);
    setGameState('hub');
  }, [initializeNewGame]);

  useEffect(() => {
    if (!commander || !party || !user || !isPrologueFinished) return;
    const key = `vowborne_save_${user.email}`;
    const dataToSave = JSON.stringify({ commander, party, user });
    localStorage.setItem(key, dataToSave);
  }, [commander, party, user, isPrologueFinished]);

  const addQuestProgress = useCallback((questType: QuestType, targetId: string, amount: number) => {
    setCommander(prev => {
        if (!prev) return null;
        const newProgress = { ...prev.questProgress };
        let updated = false;

        Object.values(CHAPTER_QUESTS).flatMap(Object.values).forEach(quest => {
            if (quest.type === questType && (quest.target.id === targetId || quest.target.id === 'any')) {
                const current = newProgress[quest.id] || { progress: 0 };
                if (current.status !== 'claimed' && current.status !== 'unclaimed') {
                    const newAmount = Math.min(current.progress + amount, quest.target.quantity);
                    if (newAmount > current.progress) {
                        newProgress[quest.id] = { ...current, progress: newAmount };
                        if (newAmount >= quest.target.quantity) {
                            newProgress[quest.id].status = 'unclaimed';
                             setQuestNotifications(prevNotifs => [
                                ...prevNotifs.slice(-4),
                                {
                                    id: nextNotificationId.current++,
                                    title: quest.title,
                                    icon: quest.reward.unlockedCharacterId 
                                        ? (UNLOCKABLE_CHARACTERS.find(c => c.id === quest.reward.unlockedCharacterId)?.avatar || SLOT_SYMBOLS[SlotSymbol.TreasureChest].icon)
                                        : (quest.reward.blueprintId ? BLUEPRINTS[quest.reward.blueprintId].icon : SLOT_SYMBOLS[SlotSymbol.Coin].icon),
                                    message: '의뢰 완료!',
                                }
                            ]);
                        }
                        updated = true;
                    }
                }
            }
        });

        if (updated) {
            return { ...prev, questProgress: newProgress };
        }
        return prev;
    });
  }, []);
  
    const handleClaimQuestReward = useCallback((questId: string) => {
        const quest = Object.values(CHAPTER_QUESTS).flatMap(Object.values).find(q => q.id === questId);
        if (!quest || !commander) return;
        const progress = commander.questProgress[questId];
        if (!progress || progress.status !== 'unclaimed') return;

        let newCommander = { ...commander };
        let newParty = [...party];

        if (quest.reward.gold) newCommander.gold = Number(newCommander.gold) + quest.reward.gold;
        if (quest.reward.exp) {
            let currentExp = Number(newCommander.exp) + quest.reward.exp;
            let currentLevel = newCommander.level;
            let expForNext = Number(newCommander.expToNextLevel);

            while (currentExp >= expForNext) {
                currentExp -= expForNext;
                currentLevel++;
                expForNext = Math.floor(expForNext * 1.5);
                addQuestProgress(QuestType.COMMANDER_LEVEL_UP, 'commander', currentLevel);
            }
            newCommander.exp = currentExp;
            newCommander.level = currentLevel;
            newCommander.expToNextLevel = expForNext;
        }

        if (quest.reward.blueprintId) {
            newCommander.unlockedBlueprints = [...new Set([...newCommander.unlockedBlueprints, quest.reward.blueprintId])];
        }
        if (quest.reward.unlockedCharacterId) {
            const charData = UNLOCKABLE_CHARACTERS.find(c => c.id === quest.reward.unlockedCharacterId);
            if (charData && !party.some(p => p.id === charData.id)) {
                const newChar: Character = {
                    ...charData,
                    hp: 0, maxHp: 0, weapon: null, armor: null, skillPower: 0, maxSkillPower: 100, gold: 100,
                    inventory: [], rapport: 0, rapportBonuses: []
                };
                const stats = getEffectiveStats(newChar);
                newChar.maxHp = stats.maxHp;
                newChar.hp = stats.maxHp;
                newParty.push(newChar);
                setUnlockedCharacter(newChar);
            }
        }
        
        newCommander.questProgress = {
            ...newCommander.questProgress,
            [questId]: { ...progress, status: 'claimed' },
        };
        
        setCommander(newCommander);
        setParty(newParty);
        setCompletedQuestsForModal(prev => [...prev, quest]);

    }, [commander, party, addQuestProgress]);

    const handleStartBattle = useCallback((episodeId: string, stageIndex: number, monstersOverride?: Monster[], postBattleState: GameState = 'hub') => {
        const episode = findEpisodeById(episodeId);
        if (!episode && !monstersOverride) return;
        
        const stageMonsters = monstersOverride || episode!.stages[stageIndex].monsters;

        const battleMonsters = stageMonsters.map((m, i) => ({
          ...m,
          instanceId: `${m.name}_${i}`,
          hp: m.maxHp,
          defenseDebuffTurns: 0,
        }));
        
        const activePartyMembers = commander!.activeParty
            .map(id => party.find(p => p.id === id))
            .filter((p): p is Character => !!p);

        if (activePartyMembers.length === 0) {
            alert("출정 부대에 용병이 없습니다!");
            return;
        }

        const battleParty = activePartyMembers.map(p => ({
            ...p,
            hp: p.maxHp,
            skillPower: 0,
        }));
        
        setMonsters(battleMonsters);
        setParty(battleParty);
        setCurrentBattleInfo({ episodeId, stageIndex });
        setGameState('playing');
        setPostBattleGameState(postBattleState);
        setBattleStatus('IDLE');
        setHpChangeEffects([]);
        setActiveMercenaryIndex(0);
        setBattleResult(null);
        setBattleDamageTracker({});
        setDialogueBubbles({});
        setIsAutoSpinning(false);
      }, [commander, party]);
    
    const handleSetExplorationState = useCallback((state: ExplorationState) => {
        setCommander(c => c ? { ...c, explorationState: state } : null);
    }, []);

    const handleSetCurrentMoves = useCallback((moves: number) => {
        setCommander(c => c ? { ...c, currentMoves: moves } : null);
    }, []);

    const handlePlayerMove = useCallback((path: HexCoord[]) => {
        if (!path.length) return;
        const destination = path[path.length - 1];
        setCommander(prev => {
        if (!prev) return null;
        const currentChapterId = prev.currentChapterId;
        const existingVisited = prev.visitedTiles[currentChapterId] || [];
        const newVisitedKeys = new Set(existingVisited.map(c => `${c.q},${c.r}`));
        path.forEach(p => newVisitedKeys.add(`${p.q},${p.r}`));
        
        const updatedVisited = Array.from(newVisitedKeys).map((key: string) => {
            const [q, r] = key.split(',').map(Number);
            return { q, r };
        });

        return {
            ...prev,
            explorationProgress: {
            ...prev.explorationProgress,
            [currentChapterId]: destination,
            },
            visitedTiles: {
            ...prev.visitedTiles,
            [currentChapterId]: updatedVisited,
            }
        };
        });
    }, []);

    const handleTileEvent = useCallback((event: HexTileEvent, coords: HexCoord) => {
        const eventKey = `${coords.q},${coords.r}`;

        if (event.type !== 'monster') {
            setCommander(prev => {
                if (!prev) return null;
                const chapterEvents = prev.completedHexEvents[prev.currentChapterId] || [];
                if (chapterEvents.includes(eventKey)) return prev;
                return {
                    ...prev,
                    completedHexEvents: {
                        ...prev.completedHexEvents,
                        [prev.currentChapterId]: [...chapterEvents, eventKey],
                    }
                };
            });
        }

        switch (event.type) {
            case 'monster':
                const monsterId = event.payload?.monsterId;
                const monsterTemplate = monsterId ? MONSTERS[monsterId] : null;
                if (monsterTemplate) {
                    handleStartBattle('field_battle', 0, [monsterTemplate], 'exploration');
                }
                break;
            case 'treasure':
            case 'ruins':
                if (event.payload?.treasure?.gold) {
                    const gold = event.payload.treasure.gold;
                    setCommander(c => c ? { ...c, gold: Number(c.gold) + gold } : null);
                    setDiscovery({ title: '보물 발견!', content: `${gold}G를 획득했습니다.`, icon: HEX_EVENT_ICONS.treasure });
                }
                break;
            case 'trap':
            case 'misfortune':
                if (event.payload?.goldLost) {
                    const gold = event.payload.goldLost;
                    setCommander(c => c ? { ...c, gold: Math.max(0, Number(c.gold) - gold) } : null);
                    setDiscovery({ title: '함정!', content: `${gold}G를 잃었습니다...`, icon: HEX_EVENT_ICONS.trap });
                }
                break;
            default:
                break;
        }
    }, [handleStartBattle]);

    const handleSpin = useCallback(async () => {
      if (isSpinning || battleStatus !== 'IDLE' || party.length === 0) return;

      const activePlayer = party[activeMercenaryIndex];
      if (activePlayer.hp <= 0) {
          setActiveMercenaryIndex(prev => (prev + 1) % party.length);
          return;
      }

      setBattleStatus('PLAYER_ACTION');
      setIsSpinning(true);
      setHighlightedLine(null);
      
      const { reels: newReels, wins } = gameService.processPlayerSpin(activePlayer, monsters[0]);
      setReels(newReels);

      await delay(2800);
      setIsSpinning(false);

      if (wins.length > 0) {
        for(const win of wins) {
          setHighlightedLine(win.lineCoords);
          await delay(300);
          
          if (win.monsterDamage > 0) {
            setMonsters(prevMonsters => prevMonsters.map(m => {
                const newHp = Math.max(0, m.hp - win.monsterDamage);
                triggerHpChangeEffect(m.instanceId!, win.monsterDamage, 'damage', win.isCritical);
                setMonsterImpact({ id: m.instanceId!, isCritical: win.isCritical });
                return { ...m, hp: newHp };
            }));
            setBattleDamageTracker(prev => ({...prev, [activePlayer.id]: (Number(prev[activePlayer.id]) || 0) + win.monsterDamage }));
          }
          if (win.partyHeal > 0) {
              setParty(prev => prev.map(p => {
                  const newHp = Math.min(p.maxHp, p.hp + win.partyHeal);
                  if (newHp > p.hp) triggerHpChangeEffect(p.id, newHp - p.hp, 'heal');
                  return { ...p, hp: newHp };
              }));
          } else if(win.playerHeal > 0) {
              setParty(prev => prev.map((p, i) => i === activeMercenaryIndex ? {...p, hp: Math.min(p.maxHp, p.hp + win.playerHeal)} : p));
              triggerHpChangeEffect(activePlayer.id, win.playerHeal, 'heal');
          }
           if (win.skillPowerGained > 0) {
              setParty(prev => prev.map((p, i) => i === activeMercenaryIndex ? {...p, skillPower: Math.min(p.maxSkillPower, p.skillPower + win.skillPowerGained)} : p));
          }
           if (win.monsterDefenseDebuff) {
               setMonsters(prev => prev.map(m => ({ ...m, defenseDebuffTurns: 2 })));
           }

          await delay(800);
          setHighlightedLine(null);
          setMonsterImpact(null);
        }
      } else {
        await delay(1000);
      }
      
      const monsterStillAlive = monsters.some(m => m.hp > 0);
      if (monsterStillAlive) {
        setBattleStatus('MONSTER_ACTION');
      } else {
        setBattleStatus('BATTLE_ENDED');
      }

    }, [isSpinning, battleStatus, party, activeMercenaryIndex, monsters, triggerHpChangeEffect]);
    
    // Auto Spin Logic
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        if (isAutoSpinning && gameState === 'playing' && battleStatus === 'IDLE' && !isSpinning && party.length > 0) {
            timeoutId = setTimeout(() => {
                handleSpin();
            }, 1000);
        }
        return () => clearTimeout(timeoutId);
    }, [isAutoSpinning, gameState, battleStatus, isSpinning, party, handleSpin]);


    useEffect(() => {
        if (gameState !== 'playing') return;

        const checkBattleEnd = () => {
            const allMonstersDead = monsters.every(m => m.hp <= 0);
            const allPlayersDead = party.every(p => p.hp <= 0);
            if (allMonstersDead || allPlayersDead) {
                setIsAutoSpinning(false);
                setBattleStatus('BATTLE_ENDED');
                
                // Process Battle End
                 setTimeout(() => {
                    const isVictory = allMonstersDead;
                    let expGained = 0;
                    let goldGained = 0;
                    let materialsGained: { id: string; quantity: number }[] = [];

                    if (isVictory && currentBattleInfo) {
                        const episode = findEpisodeById(currentBattleInfo.episodeId);
                        const stage = episode?.stages[currentBattleInfo.stageIndex];
                        if (stage) {
                            expGained = stage.expReward;
                            goldGained = stage.goldReward;
                            stage.monsters.forEach(monster => {
                                monster.drops?.forEach(drop => {
                                    if (Math.random() < drop.dropChance) {
                                        const quantity = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
                                        const existing = materialsGained.find(m => m.id === drop.materialId);
                                        if (existing) existing.quantity += quantity;
                                        else materialsGained.push({ id: drop.materialId, quantity });
                                    }
                                });
                            });
                        }
                    }

                    const commanderShare = Math.floor(goldGained * 0.5);
                    const mercenaryShareTotal = goldGained - commanderShare;
                    const mercenarySharePerPerson = Math.floor(mercenaryShareTotal / party.length);

                    const newCommanderState = { ...commander! };
                    newCommanderState.gold = Number(newCommanderState.gold) + commanderShare;
                    
                    // Add Materials
                    materialsGained.forEach(mat => {
                        const existing = newCommanderState.materials.find(m => m.id === mat.id);
                        if (existing) existing.quantity += mat.quantity;
                        else newCommanderState.materials.push({ ...mat });
                    });
                    
                    // Commander Exp
                    let currentExp = Number(newCommanderState.exp) + Number(expGained);
                    let currentLevel = newCommanderState.level;
                    let expForNext = newCommanderState.expToNextLevel;

                    while(currentExp >= expForNext) {
                        currentExp -= expForNext;
                        currentLevel++;
                        expForNext = Math.floor(expForNext * 1.5);
                        addQuestProgress(QuestType.COMMANDER_LEVEL_UP, 'commander', currentLevel);
                    }
                    newCommanderState.exp = currentExp;
                    newCommanderState.level = currentLevel;
                    newCommanderState.expToNextLevel = expForNext;
                    
                    // Update Stage Progress
                    if (isVictory && currentBattleInfo) {
                        const stageKey = `${currentBattleInfo.episodeId}_${currentBattleInfo.stageIndex}`;
                        newCommanderState.stageProgress[stageKey] = (Number(newCommanderState.stageProgress[stageKey]) || 0) + 1;
                    }
                    
                    setCommander(newCommanderState);

                    const newParty = party.map(p => ({
                        ...p,
                        gold: Number(p.gold) + mercenarySharePerPerson
                    }));
                    setParty(newParty);

                    const result: BattleResult = {
                        isVictory,
                        expGained,
                        goldGained,
                        settlement: {
                            commanderGold: commanderShare,
                            mercenaryGains: newParty.map(p => ({ name: p.name, gold: mercenarySharePerPerson }))
                        },
                        mvpCharacterId: Object.entries(battleDamageTracker).sort(([,a], [,b]) => b - a)[0]?.[0],
                        commanderStateBefore: {
                            level: commander!.level,
                            exp: commander!.exp,
                            expToNextLevel: commander!.expToNextLevel
                        },
                        materialsGained
                    };
                    
                    // Process Quests
                    if (isVictory) {
                         monsters.forEach(m => {
                             const template = Object.values(MONSTERS).find(tm => tm.name === m.name.split('_')[0]); // Very basic matching
                             if (template) {
                                 // Find key by value
                                 const monsterKey = Object.keys(MONSTERS).find(key => MONSTERS[key] === template);
                                 if (monsterKey) addQuestProgress(QuestType.MONSTER_HUNT, template.name, 1);
                             }
                         });
                         materialsGained.forEach(mat => {
                             addQuestProgress(QuestType.MATERIAL_HUNT, mat.id, mat.quantity);
                         });
                    }

                    setBattleResult(result);
                    setGameState('battleResult');

                 }, 1500);
                return true;
            }
            return false;
        };

        if (battleStatus === 'MONSTER_ACTION') {
            (async () => {
                await delay(1000);
                if (checkBattleEnd()) return;

                const damageReduction = 0; // Placeholder for now
                const { playerDamage, targetIndex, isCritical, isAreaAttack } = gameService.simulateMonsterTurn(party, monsters[0], damageReduction, commander!.level);
                
                if (isAreaAttack) {
                    setParty(prev => prev.map(p => {
                        if (p.hp > 0) {
                            const newHp = Math.max(0, p.hp - playerDamage);
                            triggerHpChangeEffect(p.id, playerDamage, 'damage', isCritical);
                            return {...p, hp: newHp};
                        }
                        return p;
                    }));
                } else {
                    const target = party[targetIndex];
                    setParty(prev => prev.map((p, i) => i === targetIndex ? {...p, hp: Math.max(0, p.hp - playerDamage)} : p));
                    triggerHpChangeEffect(target.id, playerDamage, 'damage', isCritical);
                }

                await delay(1000);
                if (checkBattleEnd()) return;
                
                let nextIndex = activeMercenaryIndex;
                let attempts = 0;
                do {
                    nextIndex = (nextIndex + 1) % party.length;
                    attempts++;
                } while (party[nextIndex].hp <= 0 && attempts < party.length);

                setActiveMercenaryIndex(nextIndex);
                setBattleStatus('IDLE');
            })();
        }

    }, [battleStatus, party, monsters, activeMercenaryIndex, triggerHpChangeEffect, commander, gameState, currentBattleInfo, addQuestProgress, battleDamageTracker]);

    const handleGoToHub = () => {
        setGameState(postBattleGameState);
    }
    const handleRetryBattle = () => {
        if (currentBattleInfo) {
            handleStartBattle(currentBattleInfo.episodeId, currentBattleInfo.stageIndex, undefined, postBattleGameState);
        }
    }
    const handleNextStage = () => {
        if (currentBattleInfo) {
            handleStartBattle(currentBattleInfo.episodeId, currentBattleInfo.stageIndex + 1, undefined, postBattleGameState);
        }
    }
    
    // Mercenary Management Handlers
    const handleSetActiveParty = (newPartyIds: (string | null)[]) => {
        setCommander(c => c ? { ...c, activeParty: newPartyIds } : null);
    };
    const handleStartTraining = (mercId: string, courseId: string, isBoosted: boolean) => {
        const course = TRAINING_COURSES.find(c => c.id === courseId);
        if (!course || !commander) return;
        const totalCost = course.cost + (isBoosted ? course.commanderBoost.cost : 0);
        if (commander.gold < totalCost) {
            alert("자금이 부족합니다.");
            return;
        }

        setCommander(c => c ? { ...c, gold: c.gold - totalCost } : null);
        setParty(p => p.map(merc => {
            if (merc.id === mercId) {
                const duration = course.durationMinutes * 60 * 1000 * (isBoosted ? 0.5 : 1);
                return { ...merc, trainingStatus: { courseId, endTime: Date.now() + duration, isBoosted } };
            }
            return merc;
        }));
        addQuestProgress(QuestType.MERC_TRAINING, 'any', 1);
    };
    const handleCancelTraining = (mercId: string) => {
        setParty(p => p.map(merc => merc.id === mercId ? { ...merc, trainingStatus: undefined } : merc));
    };
    const handleCompleteTrainingInstantly = (mercId: string) => {
        const merc = party.find(m => m.id === mercId);
        if (!merc || !merc.trainingStatus || !commander) return;
        const remainingMs = merc.trainingStatus.endTime - Date.now();
        const cost = Math.max(1, Math.ceil(remainingMs / 60000)) * 5; // 5G per minute
        if (commander.gold < cost) {
            alert("자금이 부족합니다.");
            return;
        }
        setCommander(c => c ? { ...c, gold: c.gold - cost } : null);
        // Complete training logic is handled by useEffect
        setParty(p => p.map(m => m.id === mercId && m.trainingStatus ? { ...m, trainingStatus: { ...m.trainingStatus, endTime: Date.now() } } : m));
    };
    const handleGiveGift = (mercId: string, giftId: string) => {
        if (!commander) return;
        const gift = GIFTS[giftId];
        const giftInStock = commander.gifts.find(g => g.id === giftId);
        if (!gift || !giftInStock || giftInStock.quantity <= 0) return;

        setCommander(c => ({
            ...c!,
            gifts: c!.gifts.map(g => g.id === giftId ? { ...g, quantity: g.quantity - 1 } : g).filter(g => g.quantity > 0)
        }));
        setParty(p => p.map(merc => merc.id === mercId ? { ...merc, rapport: merc.rapport + gift.rapportBoost } : merc));
    };
    const handleSpecialLesson = (mercId: string) => {
        if (!commander || commander.gold < 200) return;
        setCommander(c => ({...c!, gold: c!.gold - 200}));
        setParty(p => p.map(merc => merc.id === mercId ? { ...merc, rapport: merc.rapport + 15 } : merc));
    };
    const handleBondingEpisodeComplete = (mercId: string, episode: BondingEpisode) => {
        setParty(p => p.map(merc => {
            if (merc.id === mercId) {
                const newMerc = { ...merc, completedBondingEpisodes: [...(merc.completedBondingEpisodes || []), episode.id] };
                if(episode.reward.stat !== 'specialSkill'){
                    (newMerc as any)[episode.reward.stat] += episode.reward.value;
                }
                return newMerc;
            }
            return merc;
        }));
    };
    
    // Check for completed training every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            party.forEach(merc => {
                if (merc.trainingStatus && now >= merc.trainingStatus.endTime) {
                    const course = TRAINING_COURSES.find(c => c.id === merc.trainingStatus!.courseId);
                    if (course) {
                        setParty(prevParty => prevParty.map(p => {
                            if (p.id === merc.id) {
                                const newStats = { ...p };
                                for (const [stat, value] of Object.entries(course.statBoost)) {
                                    (newStats as any)[stat] += value;
                                }
                                return { ...newStats, trainingStatus: undefined };
                            }
                            return p;
                        }));
                        // Optionally add a notification
                    }
                }
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [party]);

    const renderGameState = () => {
        switch (gameState) {
            case 'login': return <LoginScreen onLoginSuccess={handleLoginSuccess} onGuestLogin={handleGuestLogin} />;
            case 'prologue': return <Prologue user={user} onPrologueEnd={handlePrologueEnd} />;
            case 'setName': return <SetNameScreen onNameSet={handleNameSet} />;
            case 'hub': return commander && party ? <GameHub user={user} commander={commander} party={party.filter(p => commander.unlockedMercenaries.includes(p.jobClass))} onStartExploration={() => setGameState('worldMap')} onLogout={() => { localStorage.clear(); window.location.reload(); }} onOpenMercenaryManagement={(tab) => { setInitialMercManagementTab(tab); setGameState('mercenaryManagement'); }} onOpenCommandersOffice={() => setGameState('commandersOffice')} onOpenQuestBoard={() => setGameState('questBoard')} onOpenRequestModal={handleOpenRequestModal} notifications={notifications} onClearNotifications={handleClearNotifications} /> : <LoadingSpinner />;
            case 'worldMap': return <WorldMap commander={commander!} onSelectChapter={(chapterId) => { setCommander(c => c ? {...c, currentChapterId: chapterId} : null); setGameState('exploration'); }} onBack={() => setGameState('hub')} />;
            case 'exploration': return <ExplorationMap commander={commander!} party={party} onBack={() => setGameState('worldMap')} onPlayerMove={handlePlayerMove} onTileEvent={handleTileEvent} onCompleteChapter={() => {}} onChapterChange={() => {}} onSetExplorationState={handleSetExplorationState} onSetCurrentMoves={handleSetCurrentMoves} />;
            case 'mercenaryManagement': return <MercenaryManagementScreen user={user} commander={commander!} party={party} onBack={() => setGameState('hub')} onSetActiveParty={handleSetActiveParty} onEquipItem={() => {}} onUnequipItem={() => {}} onStartTraining={handleStartTraining} onGiveGift={handleGiveGift} onSpecialLesson={handleSpecialLesson} onBondingEpisodeComplete={handleBondingEpisodeComplete} initialTab={initialMercManagementTab} />;
            case 'questBoard': return <QuestBoard commander={commander!} onBack={() => setGameState('hub')} onClaimReward={handleClaimQuestReward} />;
            case 'commandersOffice': return <CommandersOffice commander={commander} onBack={() => setGameState('hub')} onUpgradeFacility={() => {}} />;
            case 'armory': return <Armory commander={commander} party={party} onBack={() => setGameState('hub')} onCraft={()=>{}} onEquipItem={()=>{}}/>
            case 'playing':
                return (
                    <div className="h-full w-full flex flex-col bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.battlefield_goblinCave}')`}}>
                       <BattleHeader currentBattleInfo={currentBattleInfo} onRetreat={handleGoToHub} onPayTableToggle={() => setIsPayTableVisible(p => !p)} />
                       
                       {/* Main Battle Area */}
                       <div className="flex-grow flex flex-col items-center justify-between p-4 relative z-10">
                           {/* 1. Monster (Top) */}
                           <div className="flex-shrink-0 w-full h-[25%] flex items-center justify-center">
                               <CharacterPanel character={monsters[0]} impact={monsterImpact} tension={0} hpChangeEffects={hpChangeEffects}/>
                           </div>
                           
                           {/* 2. Mercenary Party (Middle) */}
                           <div className="flex-shrink-0 w-full h-[25%] flex items-end justify-center mb-4 z-20">
                               <PartyPanel party={party} activeMercenaryIndex={activeMercenaryIndex} hpChangeEffects={hpChangeEffects} dialogueBubbles={dialogueBubbles} onUseSkill={handleUseSkill} onUseSpecialSkill={handleUseSpecialSkill} damagedMembers={damagedMembers} skillUser={skillUser} actingCharacterName={actingCharacterName}/>
                           </div>

                           {/* 3. Slot Machine (Bottom) */}
                           <div className="flex-grow flex items-center justify-center scale-75 origin-center">
                               <SlotMachine result={reels} isSpinning={isSpinning} highlightedLine={highlightedLine} onSymbolClick={handleSymbolClick} />
                           </div>
                       </div>

                        {/* 4. Footer Controls */}
                       <div className="flex-shrink-0 p-6 w-full bg-black/80 border-t-4 border-amber-800 flex justify-center gap-8 z-30 relative">
                            <button 
                                onClick={handleSpin} 
                                disabled={isSpinning || isAutoSpinning || battleStatus !== 'IDLE'} 
                                className="ui-button ui-button-primary w-64 !text-4xl"
                            >
                                SPIN
                            </button>
                            <button 
                                onClick={() => setIsAutoSpinning(prev => !prev)} 
                                className={`ui-button w-64 !text-4xl ${isAutoSpinning ? 'ui-button-success' : 'ui-button-secondary'}`}
                            >
                                {isAutoSpinning ? 'AUTO STOP' : 'AUTO SPIN'}
                            </button>
                       </div>
                    </div>
                );
            case 'battleResult': return <BattleResultScreen result={battleResult} battleParty={party} commander={commander} battleDamageTracker={battleDamageTracker} onGoToHub={handleGoToHub} onRetryBattle={handleRetryBattle} onNextStage={handleNextStage} currentBattleInfo={currentBattleInfo} postBattleGameState={postBattleGameState} />;
            default: return <LoadingSpinner message="게임을 불러오는 중..." />;
        }
    }
    
    return (
        <div className="h-full w-full bg-black text-white relative">
            {renderGameState()}
            {isPayTableVisible && <PayTableModal onClose={() => setIsPayTableVisible(false)} />}
            {discovery && <DiscoveryModal {...discovery} onClose={() => setDiscovery(null)} />}
            {unlockedCharacter && <CharacterUnlockModal character={unlockedCharacter} onClose={() => setUnlockedCharacter(null)} />}
            {activeRequest && commander && party && <MercenaryRequestModal commander={commander} party={party} requests={[activeRequest]} onAccept={(id) => handleRequestResponse(id, true)} onDecline={(id) => handleRequestResponse(id, false)} onClose={() => setActiveRequest(null)} />}
            {completedQuestsForModal.length > 0 && <QuestCompletionModal quests={completedQuestsForModal} onClose={() => setCompletedQuestsForModal([])} />}
            <QuestToast notifications={questNotifications} onRemove={(id) => setQuestNotifications(notifs => notifs.filter(n => n.id !== id))} />
        </div>
    );
};

export default App;