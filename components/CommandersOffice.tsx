import React, { useState } from 'react';
import { Commander, GuildPerk, GoogleUser } from '../types';
import { TRAINING_GROUND_UPGRADES, ARMORY_UPGRADES, GUILD_LEVEL_THRESHOLDS, GUILD_PERKS, BACKGROUND_IMAGES } from '../constants';
import { IconTraining, IconArmory } from './Icons';

interface CommandersOfficeProps {
    commander: Commander | null;
    onBack: () => void;
    onUpgradeFacility: (facility: 'training' | 'armory') => void;
}

const CommandersOffice: React.FC<CommandersOfficeProps> = ({
    commander,
    onBack,
    onUpgradeFacility,
}) => {
    const [view, setView] = useState<'menu' | 'upgrades' | 'guild'>('menu');

    const backgroundUrl = BACKGROUND_IMAGES.hubDayGarrison;

    if (!commander) return null;

    const renderUpgrades = () => {
        const nextTrainingUpgrade = TRAINING_GROUND_UPGRADES.find(u => u.level === commander.trainingGroundLevel + 1);
        const nextArmoryUpgrade = ARMORY_UPGRADES.find(u => u.level === commander.armoryLevel + 1);

        return (
            <div className="grid grid-cols-2 gap-12 h-full p-8">
                {/* Training Ground Upgrade */}
                <div className="ui-panel p-8 flex flex-col items-center">
                    <h2 className="ui-section-title !text-5xl text-center">훈련소</h2>
                    <p className="text-4xl font-bold my-4">현재 레벨: {commander.trainingGroundLevel}</p>
                    <div className="flex-grow w-full bg-black/30 rounded-lg p-6 text-center flex flex-col justify-center">
                        {nextTrainingUpgrade ? (
                            <>
                                <p className="text-3xl mb-4">다음 레벨: {nextTrainingUpgrade.level}</p>
                                <p className="text-4xl font-bold text-green-400 mb-6">{nextTrainingUpgrade.description}</p>
                                <p className="text-3xl text-yellow-400">비용: {nextTrainingUpgrade.cost} G</p>
                            </>
                        ) : (
                             <p className="text-4xl font-bold text-green-400">최고 레벨 달성</p>
                        )}
                    </div>
                     <button 
                        onClick={() => onUpgradeFacility('training')} 
                        disabled={!nextTrainingUpgrade || commander.gold < nextTrainingUpgrade.cost}
                        className="ui-button ui-button-success mt-8 w-full !text-4xl"
                    >
                        {nextTrainingUpgrade ? '업그레이드' : '최고 레벨'}
                    </button>
                </div>
                {/* Armory Upgrade */}
                <div className="ui-panel p-8 flex flex-col items-center">
                    <h2 className="ui-section-title !text-5xl text-center">대장간</h2>
                     <p className="text-4xl font-bold my-4">현재 레벨: {commander.armoryLevel}</p>
                     <div className="flex-grow w-full bg-black/30 rounded-lg p-6 text-center flex flex-col justify-center">
                        {nextArmoryUpgrade ? (
                            <>
                                <p className="text-3xl mb-4">다음 레벨: {nextArmoryUpgrade.level}</p>
                                <p className="text-4xl font-bold text-green-400 mb-6">{nextArmoryUpgrade.description}</p>
                                <p className="text-3xl text-yellow-400">비용: {nextArmoryUpgrade.cost} G</p>
                            </>
                        ) : (
                             <p className="text-4xl font-bold text-green-400">최고 레벨 달성</p>
                        )}
                    </div>
                     <button 
                        onClick={() => onUpgradeFacility('armory')} 
                        disabled={!nextArmoryUpgrade || commander.gold < nextArmoryUpgrade.cost}
                        className="ui-button ui-button-success mt-8 w-full !text-4xl"
                    >
                        {nextArmoryUpgrade ? '업그레이드' : '최고 레벨'}
                    </button>
                </div>
            </div>
        );
    };

    const renderGuildManagement = () => {
        const currentLevel = commander.guildLevel;
        const currentPrestige = commander.guildPrestige;
        const currentLevelInfo = GUILD_LEVEL_THRESHOLDS.find(t => t.level === currentLevel);
        const nextLevelInfo = GUILD_LEVEL_THRESHOLDS.find(t => t.level === currentLevel + 1);
        
        const prestigeForNextLevel = nextLevelInfo ? nextLevelInfo.prestige - (currentLevelInfo?.prestige || 0) : 0;
        const progressInCurrentLevel = currentPrestige - (currentLevelInfo?.prestige || 0);
        const progressPercentage = prestigeForNextLevel > 0 ? (progressInCurrentLevel / prestigeForNextLevel) * 100 : 100;

        return (
            <div className="grid grid-cols-2 gap-8 h-full p-8">
                <div className="ui-panel p-6">
                    <h2 className="ui-section-title !text-5xl text-center">용병단 현황</h2>
                    <p className="text-6xl font-bold text-center text-yellow-300 my-6">등급 {currentLevel}</p>
                    <div>
                        <div className="flex justify-between items-baseline text-3xl text-gray-300">
                            <span>명성</span>
                            <span>{currentPrestige.toLocaleString()} / {nextLevelInfo ? nextLevelInfo.prestige.toLocaleString() : 'MAX'}</span>
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-8 border-2 border-amber-800 overflow-hidden relative shadow-inner mt-2">
                            <div
                                className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="ui-panel p-6">
                     <h2 className="ui-section-title !text-5xl text-center">용병단 특전</h2>
                     <div className="space-y-4 overflow-y-auto h-[calc(100%-8rem)] pr-2">
                        {commander.guildPerks.length > 0 ? commander.guildPerks.map(perk => (
                            <div key={perk.id} className="bg-black/30 p-4 rounded-lg">
                                <p className="text-4xl font-bold text-yellow-400">{perk.name}</p>
                                <p className="text-3xl text-gray-300">{perk.description}</p>
                            </div>
                        )) : (
                            <p className="text-3xl text-gray-400 text-center pt-16">해금된 특전이 없습니다.</p>
                        )}
                     </div>
                </div>
            </div>
        )
    };

    const renderMenu = () => (
        <div className="h-full flex items-center justify-center gap-12 animate-fade-in-scale-up">
            <button onClick={() => setView('upgrades')} className="office-menu-card">
                <IconTraining className="w-48 h-48"/>
                <span className="text-5xl font-bold">시설 관리</span>
            </button>
            <button onClick={() => setView('guild')} className="office-menu-card">
                <IconArmory className="w-48 h-48"/>
                <span className="text-5xl font-bold">용병단 관리</span>
            </button>
        </div>
    );

    const renderMainContent = () => {
        switch (view) {
            case 'menu': return renderMenu();
            case 'upgrades': return renderUpgrades();
            case 'guild': return renderGuildManagement();
            default: return null;
        }
    };

    return (
        <div className="h-full w-full bg-cover bg-center flex flex-col p-6 text-white overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundUrl}')` }}></div>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-stretch animate-fade-in-scale-up h-full">
                <header className="w-full text-center flex-shrink-0 my-6 flex justify-between items-center">
                    <h1 className="ui-screen-title">단장실</h1>
                    <button onClick={view === 'menu' ? onBack : () => setView('menu')} className="ui-button ui-button-secondary">
                        &larr; {view === 'menu' ? '용병 캠프로' : '메뉴로'}
                    </button>
                </header>
                
                <main className="w-full flex-grow overflow-hidden">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
};

export default CommandersOffice;