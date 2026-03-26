import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import type { GameSettings } from './types';
import type { GatoCard } from './sdk/gatoCard';
import type { CustomHackData } from './lib/hackCard';
import { DEFAULT_MODIFIERS } from './engine/gatoRegistry';
import { generateBlockedCells, generateMineIndex, generateNumericValues } from './engine/gatoModifiers';

import { useGameEngine } from './hooks/useGameEngine';
import { useGauntlet } from './hooks/useGauntlet';
import { useCPU } from './hooks/useCPU';
import { useGameJuice } from './hooks/useGameJuice';

import { Header } from './components/Header';
import { MainMenu } from './components/MainMenu';
import { Board } from './components/Board';
import { GameHUD } from './components/GameHUD';
import { RulesModal } from './components/RulesModal';
import { CardEditor } from './components/CardEditor';
import { CardImport } from './components/CardImport';
import { BlackMarketShop } from './components/BlackMarketShop';
import { SDKat } from './components/SDKat';
import { HackCardEditor } from './components/HackCardEditor';

type AppScreen = 'menu' | 'gauntlet' | 'custom' | 'editor' | 'import' | 'shop' | 'sdkat' | 'hack-editor';

export default function App() {
  const [showRules, setShowRules] = useState(false);
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [customHacks, setCustomHacks] = useState<CustomHackData[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    mode: 'classic',
    opponent: 'cpu',
    startingPlayer: 'X',
    isMainMode: true,
    gridSize: 3,
    activeGato: null,
    modifiers: DEFAULT_MODIFIERS,
    blockedIndices: [],
    mineIndex: -1,
    numericValues: [],
    playerHacks: [],
  });

  const engine = useGameEngine(settings);
  const {
    gauntlet,
    startGauntlet,
    handleMatchResult,
    getCPUMistakeRate,
    getActiveGatoName,
    getActiveGatoDesc,
    wallet,
    winStreak,
    buyHack,
    continueFromShop,
  } = useGauntlet(setSettings);

  useCPU({
    board: engine.board,
    currentPlayer: engine.currentPlayer,
    winner: engine.winner,
    gameState: engine.gameState,
    pieces: engine.pieces,
    settings,
    mistakeRate: screen === 'custom' ? 0.4 : getCPUMistakeRate(),
    processMove: engine.processMove,
  });

  const juice = useGameJuice({
    moveCount: engine.moveCount,
    winner: engine.winner,
    mineTriggered: engine.mineTriggered,
    lagDrifted: engine.lagDrifted,
    pieces: engine.pieces,
    modifiers: settings.modifiers,
  });

  // Track wins for Gauntlet
  useEffect(() => {
    if (engine.winner && screen === 'gauntlet') {
      handleMatchResult(engine.winner);
    }
  }, [engine.winner, handleMatchResult, screen]);

  // Show shop when gauntlet enters shop phase
  useEffect(() => {
    if (gauntlet.isShopPhase && screen === 'gauntlet') {
      setScreen('shop');
    }
  }, [gauntlet.isShopPhase, screen]);

  const startGauntletMode = () => {
    setScreen('gauntlet');
    startGauntlet();
    setTimeout(() => engine.resetGame(), 100);
  };

  // Play a custom GatoCard (from editor or import)
  const playCustomCard = useCallback((card: GatoCard) => {
    const mods = card.modifiers;
    const gridSize = card.gridSize;
    const blocked = mods.blockedCells > 0
      ? generateBlockedCells(mods.blockedCells, gridSize * gridSize)
      : [];
    const mine = mods.mine ? generateMineIndex(gridSize * gridSize) : -1;
    const numeric = mods.numeric ? generateNumericValues() : [];

    setSettings(prev => ({
      ...prev,
      mode: 'classic',
      gridSize,
      activeGato: null,
      modifiers: mods,
      blockedIndices: blocked,
      mineIndex: mine,
      numericValues: numeric,
    }));
    setScreen('custom');
    setTimeout(() => engine.resetGame(), 100);
  }, [engine]);

  const goToMenu = () => {
    engine.goToMenu();
    setScreen('menu');
  };

  // Determine what to render
  const isPlaying = screen === 'gauntlet' || screen === 'custom';
  const showGame = isPlaying && engine.gameState !== 'menu';
  const showShop = screen === 'shop';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center px-6 py-10 select-none font-['Inter',system-ui,sans-serif]">
      <div className="w-full max-w-sm">
        <Header onShowRules={() => setShowRules(true)} />

        <AnimatePresence mode="wait">
          {screen === 'menu' && (
            <MainMenu
              onStartMainMode={startGauntletMode}
              onOpenEditor={() => setScreen('editor')}
              onOpenImport={() => setScreen('import')}
              onOpenSDKat={() => setScreen('sdkat')}
              onOpenHackEditor={() => setScreen('hack-editor')}
            />
          )}

          {screen === 'editor' && (
            <CardEditor
              onBack={() => setScreen('menu')}
              onPlayCard={playCustomCard}
            />
          )}

          {screen === 'import' && (
            <CardImport
              onBack={() => setScreen('menu')}
              onPlayCard={playCustomCard}
            />
          )}

          {showGame && (
            <div className="space-y-8">
              <GameHUD
                currentPlayer={engine.currentPlayer}
                gauntlet={gauntlet}
                gatoName={screen === 'custom' ? '🐱 CUSTOM GATO' : getActiveGatoName()}
                gatoDesc={screen === 'custom' ? 'Gato personalizado' : getActiveGatoDesc()}
                lagMessage={engine.lagMessage}
                onExit={goToMenu}
              />
              <Board
                board={engine.board}
                pieces={engine.pieces}
                settings={settings}
                currentPlayer={engine.currentPlayer}
                selectedPieceIndex={engine.selectedPieceIndex}
                winner={engine.winner}
                mineTriggered={engine.mineTriggered}
                juice={juice}
                onCellClick={engine.handleCellClick}
                onResetGame={engine.resetGame}
                onGoToMenu={goToMenu}
              />
            </div>
          )}

          {showShop && (
            <BlackMarketShop
              wallet={wallet}
              purchasedHacks={gauntlet.purchasedHacks}
              onBuyHack={buyHack}
              onContinue={() => {
                continueFromShop();
                setScreen('gauntlet');
                setTimeout(() => engine.resetGame(), 100);
              }}
            />
          )}

          {screen === 'sdkat' && (
            <SDKat
              onBack={() => setScreen('menu')}
              onImport={(hack) => {
                setCustomHacks(prev => [...prev, hack]);
                setScreen('menu');
              }}
            />
          )}

          {screen === 'hack-editor' && (
            <HackCardEditor
              onBack={() => setScreen('menu')}
              onPlayCard={playCustomCard}
            />
          )}
        </AnimatePresence>

        <RulesModal show={showRules} onClose={() => setShowRules(false)} />

        <footer className="mt-8 text-center">
          <p className="text-[10px] text-slate-800 font-mono uppercase tracking-[0.4em]">
            SYSTEM_ACTIVE // SDKat_v1
          </p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}
