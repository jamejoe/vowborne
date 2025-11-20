
import { JOB_CLASSES, SLOT_SYMBOLS } from '../constants';
import { SpinResult, SlotSymbol, Monster, Character, LogType, JobClass, Equipment, StatKey } from '../types';

export const getEffectiveStats = (character: Character): Record<StatKey, number> => {
  const baseStats: Partial<Record<StatKey, number>> = {
    str: character.str,
    int: character.int,
    vit: character.vit,
    agi: character.agi,
    dex: character.dex,
    luk: character.luk,
  };

  const equipment = [character.weapon, character.armor].filter(Boolean) as Equipment[];

  equipment.forEach(eq => {
    if (eq.stats) {
      for (const stat in eq.stats) {
        if (baseStats.hasOwnProperty(stat)) {
          baseStats[stat as keyof typeof baseStats]! += eq.stats[stat as keyof typeof eq.stats]!;
        }
      }
    }
  });

  if (character.rapportBonuses) {
    character.rapportBonuses.forEach(bonus => {
        if (bonus.stat !== 'specialSkill' && bonus.stat !== 'skillPower' && baseStats.hasOwnProperty(bonus.stat)) {
            baseStats[bonus.stat as keyof typeof baseStats]! += bonus.value;
        }
    });
  }

  const maxHp = (baseStats.vit ?? 0) * 10 + 50 + (character.rapportBonuses.find(b => b.stat === 'maxHp')?.value || 0);

  return {
    str: baseStats.str!,
    int: baseStats.int!,
    vit: baseStats.vit!,
    agi: baseStats.agi!,
    dex: baseStats.dex!,
    luk: baseStats.luk!,
    hp: character.hp,
    maxHp: maxHp,
    skillPower: character.skillPower,
  };
};

export interface WinDetails {
    lineCoords: [number, number][];
    symbol: SlotSymbol;
    count: number;
    monsterDamage: number;
    playerDamage: number;

    playerHeal: number;
    partyHeal: number;
    damageReduction: number;
    skillPowerGained: number;
    goldGained: number;
    isCritical: boolean;
    message: string;
    logType: LogType;
    monsterDefenseDebuff: boolean;
    monsterBonusAttack: boolean;
    isCombinationAttack?: boolean;
}

export const gameService = {
  processPlayerSpin: (player: Character, targetMonster: Monster | null): {
    reels: SlotSymbol[][];
    wins: WinDetails[];
  } => {
    const effectiveStats = getEffectiveStats(player);
    
    const playerSkillSymbol = player.jobClass ? JOB_CLASSES[player.jobClass].skillSymbol : null;
    
    const baseSymbols = [
        ...Array(25).fill(SlotSymbol.Sword),
        ...Array(15).fill(SlotSymbol.Shield),
        ...Array(15).fill(SlotSymbol.Potion),
        ...Array(12).fill(SlotSymbol.Coin),
        ...Array(8).fill(SlotSymbol.Gem),
        ...Array(5).fill(SlotSymbol.Skull),
        ...Array(5).fill(SlotSymbol.BrokenSword),
        ...Array(5).fill(SlotSymbol.TreasureChest),
    ];
    if (playerSkillSymbol) {
        baseSymbols.push(...Array(5).fill(playerSkillSymbol));
    }


    const reels: SlotSymbol[][] = Array(3).fill(null).map(() =>
      Array(3).fill(null).map(() =>
        baseSymbols[Math.floor(Math.random() * baseSymbols.length)]
      )
    );

    const wins: WinDetails[] = [];
    
    const symbolCounts: { [key in SlotSymbol]?: { count: number; coords: [number, number][] } } = {};
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const symbol = reels[r][c];
            if (!symbolCounts[symbol]) {
                symbolCounts[symbol] = { count: 0, coords: [] };
            }
            symbolCounts[symbol]!.count++;
            symbolCounts[symbol]!.coords.push([r, c]);
        }
    }

    Object.entries(symbolCounts).forEach(([symbolStr, data]) => {
        const symbol = symbolStr as SlotSymbol;
        if (data.count >= 3) {
            const symbolName = SLOT_SYMBOLS[symbol].name;
            const multiplier = data.count - 2; // 3 symbols = 1x, 4 = 2x etc.
            let message = `[${symbolName} x${data.count}!] `;
            let logType: LogType = 'special';
            let monsterDamage = 0;
            let playerDamage = 0;
            let playerHeal = 0;
            let partyHeal = 0; // New variable for party heal
            let damageReduction = 0;
            let skillPowerGained = 0;
            let goldGained = 0;
            let isCritical = false;
            let monsterDefenseDebuff = false;
            let monsterBonusAttack = false;
            let isCombinationAttack = false;

            const isASkillSymbol = Object.values(JOB_CLASSES).some(job => job.skillSymbol === symbol);

            if (isASkillSymbol) {
                if (symbol === playerSkillSymbol) {
                    skillPowerGained += (75 + 25 * multiplier);
                    message += `엄청난 힘이 느껴집니다!`;
                } else {
                    skillPowerGained += (20 * multiplier);
                }
            } else {
                switch (symbol) {
                    case SlotSymbol.Sword:
                        let swordDamage = 80 * (1 + effectiveStats.str / 10 + effectiveStats.dex / 25);
                        if (player.jobClass === JobClass.Warrior) swordDamage *= 1.2;
                        if (player.jobClass === JobClass.Berserker) swordDamage *= 1.3;
                        if (targetMonster && targetMonster.defenseDebuffTurns && targetMonster.defenseDebuffTurns > 0) {
                            swordDamage *= 1.5; // Apply armor break damage
                        }
                        monsterDamage += swordDamage * multiplier;
                        break;
                    case SlotSymbol.Shield:
                        let shieldReduction = 0.4 * multiplier;
                        if (player.jobClass === JobClass.Paladin) shieldReduction += 0.25;
                        damageReduction = Math.min(1, shieldReduction);
                        break;
                    case SlotSymbol.Potion:
                        let potionHealAmount = 50 * (1 + effectiveStats.int / 10);
                        if (player.jobClass === JobClass.Priest) {
                            partyHeal += potionHealAmount * multiplier; // Priest heals the party
                        } else {
                            playerHeal += potionHealAmount * multiplier; // Others heal themselves
                        }
                        logType = 'heal';
                        break;
                    case SlotSymbol.Gem:
                        let powerGain = 40 * multiplier;
                        if (player.jobClass === JobClass.Mage) powerGain *= 1.5;
                        skillPowerGained += powerGain;
                        break;
                    case SlotSymbol.Skull:
                        monsterBonusAttack = true;
                        break;
                    case SlotSymbol.Coin:
                        goldGained = Math.floor(25 * (1 + effectiveStats.luk / 8)) * multiplier;
                        break;
                    case SlotSymbol.TreasureChest:
                        playerHeal += 30 * (1 + effectiveStats.luk / 20) * multiplier;
                        skillPowerGained += 25 * (1 + effectiveStats.luk / 20) * multiplier;
                        goldGained = Math.floor(60 * (1 + effectiveStats.luk / 8)) * multiplier;
                        logType = 'heal';
                        break;
                    case SlotSymbol.BrokenSword:
                        monsterDefenseDebuff = true;
                        break;
                }
            }
            
            if (monsterDamage > 0) {
                if (player.rapport >= 150 && Math.random() < 0.20) {
                    isCombinationAttack = true;
                    monsterDamage *= 1.5; // 50% damage bonus
                }
                const critChance = 5 + effectiveStats.agi / 5 + effectiveStats.luk / 10;
                if (Math.random() * 100 < critChance) {
                    isCritical = true;
                    monsterDamage *= 1.75;
                }
            }
            
            const monsterDamageFinal = Math.floor(monsterDamage);
            if (isCombinationAttack) message = `연계 공격! ` + message;
            if (isCritical) message = `치명타! ` + message;
            if (monsterDamageFinal > 0) message += `${monsterDamageFinal}의 피해. `;
            if (playerHeal > 0) message += `${Math.floor(playerHeal)} HP 회복. `;
            if (partyHeal > 0) message += `파티 전체 ${Math.floor(partyHeal)} HP 회복. `;
            if (goldGained > 0) message += `${goldGained}G 획득. `;
            if (damageReduction > 0) message += `피해 감소 ${Math.round(damageReduction * 100)}%. `;
            if (playerDamage > 0) message += `${Math.floor(playerDamage)}의 피해를 받음. `;
            if (skillPowerGained > 0) message += `스킬 게이지 ${Math.floor(skillPowerGained)} 충전. `;
            if (monsterDefenseDebuff) message += `적의 방어구가 부서졌습니다!`;
            if (monsterBonusAttack) message += `몬스터가 분노했습니다!`;


            wins.push({
                lineCoords: data.coords,
                symbol: symbol,
                count: data.count,
                monsterDamage: monsterDamageFinal,
                playerDamage: Math.floor(playerDamage),
                playerHeal: Math.floor(playerHeal),
                partyHeal: Math.floor(partyHeal),
                damageReduction: damageReduction,
                skillPowerGained: Math.floor(skillPowerGained),
                goldGained: goldGained,
                isCritical: isCritical,
                message: message.trim(),
                logType: isCombinationAttack ? 'special' : logType,
                monsterDefenseDebuff,
                monsterBonusAttack,
                isCombinationAttack,
            });
        }
    });

    return { reels, wins };
  },

  simulateMonsterTurn: (
    party: Character[],
    monster: Monster,
    damageReduction: number,
    commanderLevel: number
  ): {
    playerDamage: number;
    specialMessage: string | null;
    targetIndex: number;
    isCritical: boolean;
    isAreaAttack: boolean;
  } => {
    const isAreaAttack = !!monster.canAreaAttack && Math.random() < 0.3; // 30% chance for area attack if capable
    
    let baseDamage = Math.floor((Number(monster.maxHp) || 0) / 10 + (Number(commanderLevel) || 0) * 0.5); 
    let targetIndex = -1;

    if (!isAreaAttack && party.length > 0) {
      targetIndex = Math.floor(Math.random() * party.length);
    }
    
    let finalDamage = Math.max(1, baseDamage * (1 - damageReduction));

    const isCritical = Math.random() < 0.1; // 10% monster crit chance
    if (isCritical) {
      finalDamage *= 1.5;
    }

    return {
      playerDamage: Math.floor(finalDamage),
      specialMessage: null,
      targetIndex: targetIndex,
      isCritical,
      isAreaAttack,
    };
  },

  useActiveSkill: (player: Character): { monsterDamage: number; partyHeal: number; message: string; logType: LogType; isCritical?: boolean, isArea?: boolean } => {
    let monsterDamage = 0;
    let partyHeal = 0;
    let message = '';
    let isArea = false;
    const logType: LogType = 'special';
    const effectiveStats = getEffectiveStats(player);

    if (!player.jobClass) {
        return { monsterDamage: 0, partyHeal: 0, message: '직업이 없어 스킬을 사용할 수 없습니다!', logType: 'system', isArea: false };
    }
    
    const skillName = JOB_CLASSES[player.jobClass].skill.name;

    let skillPowerBonus = 1.0;
    player.rapportBonuses.forEach(bonus => {
        if (bonus.stat === 'skillPower') {
            skillPowerBonus += bonus.value / 100;
        }
    });

    switch (player.jobClass) {
        case JobClass.Warrior:
            monsterDamage = (Math.floor(Math.random() * 50) + 100) * (1 + effectiveStats.str / 8 + effectiveStats.dex / 20);
            break;
        case JobClass.Hunter:
            isArea = true;
            monsterDamage = (Math.floor(Math.random() * 20) + 40) * (1 + effectiveStats.agi / 10 + effectiveStats.dex / 10);
            break;
        case JobClass.Mage:
            isArea = true;
            monsterDamage = (Math.floor(Math.random() * 30) + 60) * (1 + effectiveStats.int / 8);
            break;
        case JobClass.Priest:
            partyHeal = (Math.floor(Math.random() * 50) + 150) * (1 + effectiveStats.int / 10);
            break;
        case JobClass.Paladin:
            monsterDamage = (Math.floor(Math.random() * 20) + 80) * (1 + effectiveStats.str / 10 + effectiveStats.vit / 15);
            break;
        case JobClass.Bard:
            isArea = true;
            monsterDamage = (Math.floor(Math.random() * 10) + 20) * (1 + effectiveStats.int / 12 + effectiveStats.luk / 15);
            break;
        case JobClass.Rogue:
            monsterDamage = (Math.floor(Math.random() * 40) + 90) * (1 + effectiveStats.agi / 8 + effectiveStats.dex / 8);
            if (Math.random() < 0.5) { // High crit chance
                monsterDamage *= 2;
            }
            break;
        case JobClass.Berserker:
            const hpPercentage = player.hp / player.maxHp;
            const damageMultiplier = 1 + (1 - hpPercentage) * 2; // Up to 3x damage at low HP
            monsterDamage = (Math.floor(Math.random() * 30) + 70) * (1 + effectiveStats.str / 10) * damageMultiplier;
            break;
    }

    monsterDamage *= skillPowerBonus;
    partyHeal *= skillPowerBonus;
    
    message = `${player.name}의 ${skillName}!`;
    
    const critChance = 5 + effectiveStats.agi / 5 + effectiveStats.luk / 10;
    const isCritical = Math.random() * 100 < critChance;
    if (isCritical && monsterDamage > 0) {
        monsterDamage *= 1.75;
        message = `치명타! ` + message;
    }

    return {
        monsterDamage: Math.floor(monsterDamage),
        partyHeal: Math.floor(partyHeal),
        message,
        logType,
        isCritical,
        isArea,
    };
  },
};
