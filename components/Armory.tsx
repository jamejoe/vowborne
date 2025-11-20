import React, { useState, useMemo, useEffect } from 'react';
import { Commander, Character, Equipment, Blueprint, StatKey, Gift, CraftingMaterial } from '../types';
import { BLUEPRINTS, CRAFTING_MATERIALS, STAT_DESCRIPTIONS, GIFTS, BACKGROUND_IMAGES } from '../constants';
import { StatIcon } from './StatIcon';

interface BagProps {
  commander: Commander | null;
  party: Character[];
  onBack: () => void;
  onCraft: (blueprintId: string) => void;
  onEquipItem: (mercId: string, itemInstanceId: string) => void;
  preselectedBlueprintId?: string | null;
  initialSelectedMercId?: string | null;
}

export const Armory: React.FC<BagProps> = ({ commander, party, onBack, onCraft, onEquipItem, preselectedBlueprintId, initialSelectedMercId }) => {
    const [activePrimaryTab, setActivePrimaryTab] = useState<'bag' | 'armory'>('bag');
    const [activeBagSubTab, setActiveBagSubTab] = useState<'equipment' | 'items'>('equipment');
    const [selectedMercId, setSelectedMercId] = useState<string | null>(party.length > 0 ? party[0].id : null);
    const [selectedEntity, setSelectedEntity] = useState<Equipment | Blueprint | (CraftingMaterial & { quantity: number }) | (Gift & { quantity: number }) | null>(null);

    useEffect(() => {
        if (preselectedBlueprintId) {
            const blueprint = BLUEPRINTS[preselectedBlueprintId];
            if (blueprint) {
                setActivePrimaryTab('armory');
                setSelectedEntity(blueprint);
            }
        }
    }, [preselectedBlueprintId]);

    useEffect(() => {
        if (initialSelectedMercId) {
            const mercExists = party.some(p => p.id === initialSelectedMercId);
            if (mercExists) {
                setSelectedMercId(initialSelectedMercId);
            }
        }
    }, [initialSelectedMercId, party]);

    if (!commander) return null;
    
    const selectedMerc = useMemo(() => party.find(p => p.id === selectedMercId), [party, selectedMercId]);

    const handleItemSelect = (item: any) => {
        setSelectedEntity(item);
    };
    
    const renderEquipmentTab = () => {
      if (!selectedMerc) return <div className="flex items-center justify-center h-full text-4xl text-gray-400">용병을 선택하세요.</div>;

      const allItems = [...commander.armoryStock, ...selectedMerc.inventory];

      return (
        <div className="bag-inventory-grid p-6">
            {allItems.map(item => (
                <button key={item.instanceId} className="bag-item-card" onClick={() => handleItemSelect(item)}>
                    <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                </button>
            ))}
        </div>
      );
    };

    const renderCraftTab = () => {
      return (
        <div className="bag-crafting-grid p-6">
          {commander.unlockedBlueprints.map(bpId => {
            const bp = BLUEPRINTS[bpId];
            if (!bp) return null;
            return (
              <button key={bp.id} onClick={() => handleItemSelect(bp)} className="bag-item-card">
                 <img src={bp.icon} alt={bp.name} className="w-full h-full object-contain" />
              </button>
            );
          })}
        </div>
      );
    };

     const renderItemsTab = () => {
        const allCommanderItems = [
            ...Object.values(CRAFTING_MATERIALS).map(matInfo => {
                const owned = commander.materials.find(m => m.id === matInfo.id);
                return owned ? { ...matInfo, quantity: owned.quantity, type: 'material' as const } : null;
            }).filter((item): item is CraftingMaterial & { quantity: number; type: 'material' } => item !== null),
            ...commander.gifts.map(giftItem => {
                const giftInfo = GIFTS[giftItem.id];
                return giftInfo ? { ...giftInfo, quantity: giftItem.quantity, type: 'gift' as const } : null;
            }).filter((item): item is Gift & { quantity: number; type: 'gift' } => item !== null),
        ];

        return (
            <div className="bag-inventory-grid p-6">
            {allCommanderItems.map((item) => (
                <button key={`${item.type}-${item.id}`} className="bag-item-card" onClick={() => handleItemSelect(item)}>
                    <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                    <span className="absolute bottom-2 right-3 text-4xl font-bold text-white" style={{textShadow: '2px 2px 3px black'}}>
                    x{item.quantity}
                    </span>
                </button>
            ))}
            </div>
        );
    };

    const renderDetailPanel = () => {
        if (!selectedEntity) {
            return <div className="flex items-center justify-center h-full text-4xl text-gray-400 p-6 text-center">아이템을 선택하여<br/>상세 정보를 확인하세요.</div>;
        }

        const isBlueprint = 'craftingCost' in selectedEntity;
        const isEquipment = 'instanceId' in selectedEntity;
        const isMaterial = 'description' in selectedEntity && 'quantity' in selectedEntity && 'type' in selectedEntity;
        
        let itemToCompare: Equipment | null = null;
        let statComparison: Record<StatKey, number> = {} as any;

        if(selectedMerc && isEquipment) {
            itemToCompare = selectedEntity.type === 'weapon' ? selectedMerc.weapon : selectedMerc.armor;
            if(itemToCompare) {
              const allStats = new Set([...Object.keys(selectedEntity.stats), ...Object.keys(itemToCompare.stats)]);
              allStats.forEach(stat => {
                const key = stat as StatKey;
                const selectedValue = selectedEntity.stats[key] || 0;
                const equippedValue = itemToCompare!.stats[key] || 0;
                statComparison[key] = selectedValue - equippedValue;
              });
            }
        }

        const canCraftGold = isBlueprint ? commander.gold >= selectedEntity.craftingCost : false;
        const canCraftMaterials = isBlueprint ? selectedEntity.materials.every(mat => {
            const owned = commander.materials.find(m => m.id === mat.materialId)?.quantity || 0;
            return owned >= mat.quantity;
        }) : false;
        const canCraft = canCraftGold && canCraftMaterials;

        return (
            <div className="p-6 flex flex-col h-full">
                <div className="text-center flex-shrink-0">
                    <div className="bag-detail-icon mx-auto">
                        <img src={selectedEntity.icon} alt={selectedEntity.name} className="w-full h-full object-contain" />
                    </div>
                    <h2 className="bag-detail-name">{selectedEntity.name}</h2>
                    <p className="bag-detail-desc">{'description' in selectedEntity ? selectedEntity.description : ''}</p>
                </div>

                <div className="my-4 border-t-2 border-amber-800/50 flex-grow overflow-y-auto pr-2">
                    {/* Stats Section */}
                    {(isEquipment || isBlueprint) && 'stats' in selectedEntity && (
                        <div className="mt-4">
                            <h3 className="bag-detail-section-title">능력치</h3>
                            <div className="space-y-1">
                                {Object.entries(selectedEntity.stats).map(([stat, value]) => {
                                    const key = stat as StatKey;
                                    const comparisonValue = statComparison[key];
                                    const isIconAvailable = ['str', 'int', 'vit', 'agi', 'dex', 'luk'].includes(key);

                                    return (
                                        <div key={stat} className="flex items-center text-3xl" title={STAT_DESCRIPTIONS[stat]}>
                                            {isIconAvailable ? (
                                                <StatIcon stat={key as 'str' | 'int' | 'vit' | 'agi' | 'dex' | 'luk'} />
                                            ) : <div className="w-8 h-8 mr-2" />}
                                            <span className="uppercase font-bold w-24">{stat}</span>
                                            <span>{value}</span>
                                            {itemToCompare && comparisonValue !== undefined && (
                                                <span className={`ml-4 font-bold ${comparisonValue > 0 ? 'text-green-400' : comparisonValue < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                                    ({comparisonValue > 0 ? `+${comparisonValue}` : comparisonValue})
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* Crafting Materials Section */}
                    {isBlueprint && (
                        <div className="mt-4">
                            <h3 className="bag-detail-section-title">필요 재료</h3>
                            <div className="space-y-2">
                                {selectedEntity.materials.map(mat => {
                                    const matInfo = CRAFTING_MATERIALS[mat.materialId];
                                    const owned = commander.materials.find(m => m.id === mat.materialId)?.quantity || 0;
                                    return matInfo ? (
                                        <div key={mat.materialId} className={`flex items-center justify-between text-3xl p-2 rounded ${owned >= mat.quantity ? 'text-gray-300' : 'text-red-400'}`}>
                                            <div className="flex items-center gap-2">
                                                <img src={matInfo.icon} alt={matInfo.name} className="w-12 h-12"/>
                                                <span>{matInfo.name}</span>
                                            </div>
                                            <span>{owned} / {mat.quantity}</span>
                                        </div>
                                    ) : null;
                                })}
                                <p className={`text-3xl text-right ${canCraftGold ? 'text-gray-300' : 'text-red-400'}`}>
                                    비용: {commander.gold} / {selectedEntity.craftingCost} G
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex-shrink-0">
                    {isEquipment && selectedMerc && (
                        <button onClick={() => onEquipItem(selectedMerc.id, selectedEntity.instanceId)} className="ui-button ui-button-primary w-full">
                            장착
                        </button>
                    )}
                    {isBlueprint && (
                        <button onClick={() => onCraft(selectedEntity.id)} disabled={!canCraft} className="ui-button ui-button-success w-full">
                            제작
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full bg-cover bg-center flex flex-col p-6 text-white overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.hubNightGarrison}')` }}></div>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
            
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-stretch animate-fade-in-scale-up h-full">
                <header className="w-full text-center flex-shrink-0 my-6 flex justify-between items-center">
                    <h1 className="ui-screen-title">대장간</h1>
                    <button onClick={onBack} className="ui-button ui-button-secondary">&larr; 용병 캠프로</button>
                </header>
                
                <div className="bag-container ui-panel">
                    <div className="armory-primary-tabs">
                        <button onClick={() => setActivePrimaryTab('bag')} className={`armory-tab-button ${activePrimaryTab === 'bag' ? 'active' : ''}`}>가방</button>
                        <button onClick={() => setActivePrimaryTab('armory')} className={`armory-tab-button ${activePrimaryTab === 'armory' ? 'active' : ''}`}>제작</button>
                    </div>

                    <div className="bag-main-content">
                        <div className="bag-left-panel">
                            {activePrimaryTab === 'bag' && (
                                <>
                                    <div className="armory-secondary-tabs">
                                        <button onClick={() => setActiveBagSubTab('equipment')} className={`armory-subtab-button ${activeBagSubTab === 'equipment' ? 'active' : ''}`}>장비</button>
                                        <button onClick={() => setActiveBagSubTab('items')} className={`armory-subtab-button ${activeBagSubTab === 'items' ? 'active' : ''}`}>아이템</button>
                                    </div>
                                    <div className="flex-grow overflow-y-auto pr-2">
                                        {activeBagSubTab === 'equipment' ? renderEquipmentTab() : renderItemsTab()}
                                    </div>
                                </>
                            )}
                            {activePrimaryTab === 'armory' && (
                                <div className="flex-grow overflow-y-auto pr-2">
                                    {renderCraftTab()}
                                </div>
                            )}
                        </div>

                        <div className="bag-middle-panel ui-panel p-0">
                            {renderDetailPanel()}
                        </div>
                        
                        <div className="bag-right-panel">
                            <h3 className="ui-section-title !text-4xl text-center">용병</h3>
                            <div className="flex-grow overflow-y-auto pr-2">
                                <div className="space-y-4">
                                {party.map(merc => {
                                    const isSelected = merc.id === selectedMercId;
                                    return (
                                        <button key={merc.id} onClick={() => setSelectedMercId(merc.id)} className={`w-full p-4 rounded-lg flex items-center gap-6 text-left transition-colors ${isSelected ? 'bg-amber-800/70' : 'bg-black/40 hover:bg-black/60'}`}>
                                            <img src={merc.avatar} alt={merc.name} className={`w-32 h-32 rounded-full object-cover border-4 ${isSelected ? 'border-yellow-400' : 'border-amber-700'}`}/>
                                            <div className="flex-grow">
                                                <p className="text-5xl font-bold">{merc.name}</p>
                                                <p className="text-3xl text-gray-400">{merc.jobClass}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};