
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Commander, HexCoord, HexTile, HexTileEvent, Character, HexTerrain, ExplorationState, ExplorationSymbol } from '../types';
import { CHAPTERS, BACKGROUND_IMAGES, MAP_CONFIGS, MONSTERS, HEX_TILE_IMAGES, HEX_EVENT_ICONS, COMMANDER_AVATARS, HEX_ICON_UNKNOWN, EXPLORATION_PLAYER_TOKEN, ALL_EXPLORATION_SYMBOLS, EXPLORATION_SYMBOLS } from '../constants';
import DiceSlotMachine from './DiceSlotMachine';
import { IconCheckCircle } from './Icons';

const HEX_RADIUS = 120;
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
const HEX_HEIGHT = 2 * HEX_RADIUS;

const hexToPixel = (hex: HexCoord): { x: number; y: number } => ({
    x: HEX_RADIUS * Math.sqrt(3) * (hex.q + hex.r / 2),
    y: HEX_RADIUS * 3 / 2 * hex.r,
});

const axialToCube = (hex: HexCoord) => ({ x: hex.q, y: -hex.q - hex.r, z: hex.r });
const cubeDistance = (a: {x:number, y:number, z:number}, b: {x:number, y:number, z:number}) => (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
const axialDistance = (a: HexCoord, b: HexCoord) => cubeDistance(axialToCube(a), axialToCube(b));

const DIRECTIONS = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
const getNeighbors = (hex: HexCoord) => DIRECTIONS.map(dir => ({ q: hex.q + dir.q, r: hex.r + dir.r }));

const aStar = (start: HexCoord, goal: HexCoord, grid: HexTile[]): HexCoord[] | null => {
    const gridMap = new Map(grid.map(tile => [`${tile.coords.q},${tile.coords.r}`, tile]));
    const openSet = new Map<string, HexCoord>([[`${start.q},${start.r}`, start]]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>([[`${start.q},${start.r}`, 0]]);
    const fScore = new Map<string, number>([[`${start.q},${start.r}`, axialDistance(start, goal)]]);

    while (openSet.size > 0) {
        let currentKey = '';
        let lowestFScore = Infinity;
        for (const [key, _] of openSet) {
            if ((fScore.get(key) || Infinity) < lowestFScore) {
                lowestFScore = fScore.get(key)!;
                currentKey = key;
            }
        }
        
        const current = openSet.get(currentKey)!;

        if (current.q === goal.q && current.r === goal.r) {
            const path = [goal];
            let tempKey = `${goal.q},${goal.r}`;
            while (cameFrom.has(tempKey)) {
                tempKey = cameFrom.get(tempKey)!;
                const [q, r] = tempKey.split(',').map(Number);
                path.unshift({ q, r });
            }
            return path;
        }

        openSet.delete(currentKey);

        for (const neighbor of getNeighbors(current)) {
            const neighborKey = `${neighbor.q},${neighbor.r}`;
            if (!gridMap.has(neighborKey)) continue;
            
            const tentativeGScore = (gScore.get(currentKey) || 0) + 1;
            if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
                cameFrom.set(neighborKey, currentKey);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + axialDistance(neighbor, goal));
                if (!openSet.has(neighborKey)) {
                    openSet.set(neighborKey, neighbor);
                }
            }
        }
    }
    return null;
};

const generateHexMap = (radius: number, config: typeof MAP_CONFIGS[string], terrainTypes: HexTerrain[]): HexTile[] => {
    const tiles: HexTile[] = [];
    for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
            const terrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
            tiles.push({ coords: { q, r }, terrain, event: { type: 'empty' } });
        }
    }

    const startTile = tiles.find(t => t.coords.q === 0 && t.coords.r === 0)!;
    startTile.event = { type: 'start' };

    const portalCoordsOptions = [
      {q: radius, r: 0}, {q: -radius, r: 0}, {q: 0, r: radius}, {q: 0, r: -radius},
      {q: radius, r: -radius}, {q: -radius, r: radius}
    ];
    const portalCoords = portalCoordsOptions[Math.floor(Math.random() * portalCoordsOptions.length)];
    const portalTile = tiles.find(t => t.coords.q === portalCoords.q && t.coords.r === portalCoords.r)!;
    portalTile.event = { type: 'portal' };

    const availableTiles = tiles.filter(t => t.event.type === 'empty');
    Object.entries(config.eventCounts).forEach(([eventType, count]) => {
        for (let i = 0; i < count!; i++) {
            if (availableTiles.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableTiles.length);
            const tile = availableTiles.splice(randomIndex, 1)[0];
            const event: HexTileEvent = { type: eventType as HexTileEvent['type'] };

            if (eventType === 'monster') {
                const monsterIds = Object.keys(MONSTERS);
                event.payload = { monsterId: monsterIds[Math.floor(Math.random() * monsterIds.length)] };
            } else if (eventType === 'treasure' || eventType === 'ruins') {
                event.payload = { treasure: { gold: Math.floor(Math.random() * 200) + 50 } };
            } else if (eventType === 'story') {
                event.payload = { storyId: `${config.radius}_s${i}` };
            } else if (eventType === 'trap' || eventType === 'misfortune') {
                event.payload = { goldLost: Math.floor(Math.random() * 100) + 20 };
            }
            tile.event = event;
        }
    });

    return tiles;
};

const getTerrainStyle = (terrain: HexTerrain): React.CSSProperties => {
    const style: React.CSSProperties = { backgroundImage: `url(${HEX_TILE_IMAGES[terrain]})` };
    let filter = '';
    switch (terrain) {
        case 'ice': filter = 'brightness(1.2) saturate(0.5) hue-rotate(180deg)'; break;
        case 'snow': filter = 'brightness(1.4) saturate(0.2)'; break;
        case 'water': filter = 'brightness(0.8) saturate(1.5) hue-rotate(190deg)'; break;
    }
    if (filter) style.filter = filter;
    return style;
};

interface ExplorationMapProps {
  commander: Commander;
  party: Character[];
  onBack: () => void;
  onPlayerMove: (path: HexCoord[]) => void;
  onTileEvent: (event: HexTileEvent, coords: HexCoord) => void;
  onCompleteChapter: (chapterId: string) => void;
  onChapterChange: (chapterId: string) => void;
  onSetExplorationState: (state: ExplorationState) => void;
  onSetCurrentMoves: (moves: number) => void;
}

const ExplorationMap: React.FC<ExplorationMapProps> = ({ commander, onBack, onPlayerMove, onTileEvent, onSetExplorationState, onSetCurrentMoves }) => {
    const [mapCache, setMapCache] = useState<Record<string, HexTile[]>>({});
    const [visualPlayerPosition, setVisualPlayerPosition] = useState<HexCoord>(commander.explorationProgress[commander.currentChapterId] || { q: 0, r: 0 });
    const [zoom, setZoom] = useState(0.6);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [diceResult, setDiceResult] = useState<ExplorationSymbol[] | null>([ExplorationSymbol.Move0, ExplorationSymbol.Move0, ExplorationSymbol.Move0]);
    const [isSpinningDice, setIsSpinningDice] = useState(false);
    const [animationPath, setAnimationPath] = useState<HexCoord[] | null>(null);
    const [hoveredPath, setHoveredPath] = useState<HexCoord[] | null>(null);
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const pinchStartDistance = useRef(0);
    const hasDragged = useRef(false);
    
    const currentChapter = useMemo(() => CHAPTERS.find(c => c.id === commander.currentChapterId), [commander.currentChapterId]);
    const playerPosition = useMemo(() => commander.explorationProgress[commander.currentChapterId] || { q: 0, r: 0 }, [commander.explorationProgress, commander.currentChapterId]);
    const movesLeft = commander.currentMoves;
    const explorationState = commander.explorationState;

    useEffect(() => {
        if (currentChapter && !mapCache[currentChapter.id]) {
            const config = MAP_CONFIGS[currentChapter.id];
            const newMap = generateHexMap(config.radius, config, currentChapter.terrainTypes);
            setMapCache(prev => ({ ...prev, [currentChapter.id]: newMap }));
        }
        setVisualPlayerPosition(playerPosition);
    }, [commander.currentChapterId, playerPosition, currentChapter, mapCache]);

    const mapTiles = useMemo(() => mapCache[commander.currentChapterId] || [], [mapCache, commander.currentChapterId]);
    const hoveredPathSet = useMemo(() => new Set((hoveredPath || []).map(c => `${c.q},${c.r}`)), [hoveredPath]);

    const centerOnPlayer = useCallback((smooth = false) => {
        if (gridRef.current) {
            const pixel = hexToPixel(visualPlayerPosition);
            gridRef.current.style.transition = smooth ? 'transform 0.5s ease-out' : 'none';
            setPan({ x: -pixel.x, y: -pixel.y });
        }
    }, [visualPlayerPosition]);

    useEffect(() => {
        centerOnPlayer(true);
    }, [visualPlayerPosition, centerOnPlayer]);


    const handleRollDice = useCallback(() => {
        if (explorationState !== 'IDLE') return;
        centerOnPlayer(true);
        setIsSpinningDice(true);
        const newResult: ExplorationSymbol[] = [
            ALL_EXPLORATION_SYMBOLS[Math.floor(Math.random() * ALL_EXPLORATION_SYMBOLS.length)],
            ALL_EXPLORATION_SYMBOLS[Math.floor(Math.random() * ALL_EXPLORATION_SYMBOLS.length)],
            ALL_EXPLORATION_SYMBOLS[Math.floor(Math.random() * ALL_EXPLORATION_SYMBOLS.length)]
        ];
        setDiceResult(newResult);
        setTimeout(() => {
            setIsSpinningDice(false);
            const totalMoves = newResult.reduce((sum, symbol) => sum + EXPLORATION_SYMBOLS[symbol].value, 0);
            if (totalMoves > 0) {
                onSetCurrentMoves(totalMoves);
                onSetExplorationState('AWAITING_MOVE');
            }
        }, 3500);
    }, [explorationState, centerOnPlayer, onSetCurrentMoves, onSetExplorationState]);
    
    const handleHexClick = useCallback((tile: HexTile) => {
        if (hasDragged.current || explorationState !== 'AWAITING_MOVE') return;
        const distance = axialDistance(playerPosition, tile.coords);
        if (distance > 0 && distance <= movesLeft) {
            const foundPath = aStar(playerPosition, tile.coords, mapTiles);
            if (foundPath && foundPath.length > 1) {
                setHoveredPath(null);
                onSetExplorationState('ANIMATING_MOVE');
                onPlayerMove(foundPath);
                setAnimationPath(foundPath.slice(1));
            }
        }
    }, [explorationState, movesLeft, playerPosition, mapTiles, onPlayerMove, onSetExplorationState]);

    useEffect(() => {
        if (!animationPath || explorationState !== 'ANIMATING_MOVE') return;
        
        if (animationPath.length === 0) {
            setAnimationPath(null);
            return;
        }

        const [nextPos, ...remainingPath] = animationPath;
        const moveTimeout = setTimeout(() => {
            setVisualPlayerPosition(nextPos);
            onSetCurrentMoves(movesLeft - 1);
            setAnimationPath(remainingPath);
        }, 300);

        return () => clearTimeout(moveTimeout);
    }, [animationPath, explorationState, onSetCurrentMoves, movesLeft]);
    
    useEffect(() => {
        if (explorationState === 'ANIMATING_MOVE' && animationPath === null) {
            const currentTile = mapTiles.find(t => t.coords.q === playerPosition.q && t.coords.r === playerPosition.r);
            const eventKey = `${playerPosition.q},${playerPosition.r}`;
            const isCompleted = (commander.completedHexEvents[commander.currentChapterId] || []).includes(eventKey);

            if (currentTile && currentTile.event.type !== 'empty' && currentTile.event.type !== 'start' && !isCompleted) {
                onSetExplorationState('EVENT');
                onTileEvent(currentTile.event, currentTile.coords);
                if (currentTile.event.type !== 'monster' && movesLeft > 0) {
                    setTimeout(() => onSetExplorationState('AWAITING_MOVE'), 1500);
                } else if (currentTile.event.type !== 'monster') {
                    setTimeout(() => {
                        onSetExplorationState('IDLE');
                        onSetCurrentMoves(0);
                    }, 1500);
                }
            } else if (movesLeft > 0) {
                onSetExplorationState('AWAITING_MOVE');
            } else {
                onSetExplorationState('IDLE');
            }
        }
    }, [animationPath, explorationState, mapTiles, playerPosition, onTileEvent, commander, onSetExplorationState, onSetCurrentMoves, movesLeft]);

    const handleHexHover = (tile: HexTile | null) => {
        if (explorationState !== 'AWAITING_MOVE' || !tile) {
            setHoveredPath(null);
            return;
        }
        const distance = axialDistance(playerPosition, tile.coords);
        if (distance > 0 && distance <= movesLeft) {
            const foundPath = aStar(playerPosition, tile.coords, mapTiles);
            setHoveredPath(foundPath);
        } else {
            setHoveredPath(null);
        }
    };
    
    const handleWheel = (e: React.WheelEvent) => { e.preventDefault(); setZoom(prev => Math.max(0.3, Math.min(2.5, prev - e.deltaY * 0.001))); };
    const getTouchDistance = (touches: React.TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    const handlePanStart = (clientX: number, clientY: number) => { isDragging.current = true; hasDragged.current = false; panStart.current = pan; dragStart.current = { x: clientX, y: clientY }; };
    const handlePanMove = (clientX: number, clientY: number) => { if (!isDragging.current) return; const dx = (clientX - dragStart.current.x) / zoom; const dy = (clientY - dragStart.current.y) / zoom; if (!hasDragged.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) { hasDragged.current = true; } setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy }); };
    const handlePanEnd = () => { isDragging.current = false; setTimeout(() => hasDragged.current = false, 50); };
    const onMouseDown = (e: React.MouseEvent) => handlePanStart(e.clientX, e.clientY);
    const onMouseMove = (e: React.MouseEvent) => handlePanMove(e.clientX, e.clientY);
    const onTouchStart = (e: React.TouchEvent) => { if (e.touches.length === 1) { handlePanStart(e.touches[0].clientX, e.touches[0].clientY); } else if (e.touches.length === 2) { isDragging.current = false; pinchStartDistance.current = getTouchDistance(e.touches); } };
    const onTouchMove = (e: React.TouchEvent) => { if (e.touches.length === 1) { handlePanMove(e.touches[0].clientX, e.touches[0].clientY); } else if (e.touches.length === 2) { const newDist = getTouchDistance(e.touches); setZoom(prev => Math.max(0.3, Math.min(2.5, prev * (newDist / pinchStartDistance.current)))); pinchStartDistance.current = newDist; } };
    const onTouchEnd = () => { handlePanEnd(); pinchStartDistance.current = 0; };
    
    const visitedTilesSet = useMemo(() => new Set((commander.visitedTiles[commander.currentChapterId] || []).map(c => `${c.q},${c.r}`)), [commander.visitedTiles, commander.currentChapterId]);
    const completedEventsSet = useMemo(() => new Set((commander.completedHexEvents[commander.currentChapterId] || [])), [commander.completedHexEvents, commander.currentChapterId]);

    return (
        <div 
            ref={mapContainerRef}
            className="exploration-map-container" 
            style={{ backgroundImage: `url(${BACKGROUND_IMAGES.explorationMap})` }} 
            onWheel={handleWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <header className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent">
                <h1 className="ui-screen-title !text-6xl">{currentChapter?.name}</h1>
                <button onClick={onBack} className="ui-button ui-button-secondary">&larr; 월드 맵으로</button>
            </header>

            <div ref={gridRef} className="hex-grid" style={{ transform: `translate(calc(50vw), calc(50vh)) scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`}}>
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                    {mapTiles.map(tile => {
                        const pixel = hexToPixel(tile.coords);
                        const distance = axialDistance(playerPosition, tile.coords);
                        const isReachable = explorationState === 'AWAITING_MOVE' && distance > 0 && distance <= movesLeft;
                        const isVisited = visitedTilesSet.has(`${tile.coords.q},${tile.coords.r}`);
                        const isCompleted = completedEventsSet.has(`${tile.coords.q},${tile.coords.r}`);
                        const isVisible = isVisited || distance <= 3;
                        const isPathPreview = hoveredPathSet.has(`${tile.coords.q},${tile.coords.r}`);

                        return (
                            <div key={`${tile.coords.q},${tile.coords.r}`} className="hex-tile-wrapper" style={{ left: `${pixel.x}px`, top: `${pixel.y}px`, width: `${HEX_WIDTH}px`, height: `${HEX_HEIGHT}px` }}>
                                <button 
                                    className={`hex-tile ${isReachable ? 'reachable' : ''} ${isVisible ? 'visible' : 'fog'} ${isPathPreview ? 'path-preview' : ''}`} 
                                    style={getTerrainStyle(tile.terrain)} 
                                    onClick={() => handleHexClick(tile)} 
                                    onMouseEnter={() => handleHexHover(tile)}
                                    onMouseLeave={() => handleHexHover(null)}
                                    disabled={!isReachable}
                                >
                                    <div className="hex-content">
                                        {isVisible && tile.event.type !== 'empty' && !isVisited && (
                                            <img src={HEX_ICON_UNKNOWN} alt='unknown' className="event-icon opacity-50" style={{filter: 'grayscale(100%) brightness(1.5)'}}/>
                                        )}
                                        {isVisited && tile.event.type !== 'empty' && (
                                            <img src={HEX_EVENT_ICONS[tile.event.type]} alt={tile.event.type} className={`event-icon ${isCompleted ? 'opacity-30' : ''}`} />
                                        )}
                                        {isCompleted && tile.event.type !== 'start' && (
                                          <div className="completed-event-overlay">
                                              <IconCheckCircle className="w-1/2 h-1/2 text-green-500 opacity-80" />
                                          </div>
                                        )}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                    <div className="player-token" style={{ ...hexToPixel(visualPlayerPosition), width: `${HEX_RADIUS}px` }}>
                        <img src={EXPLORATION_PLAYER_TOKEN} alt="Player" />
                    </div>
                </div>
            </div>

            <DiceSlotMachine onRoll={handleRollDice} result={diceResult} isSpinning={isSpinningDice} movesLeft={movesLeft} commanderLevel={commander.level} explorationState={explorationState}/>
        </div>
    );
};

export default ExplorationMap;
