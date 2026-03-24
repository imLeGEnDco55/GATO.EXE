import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  User, 
  Cpu, 
  ChevronRight, 
  HelpCircle,
  X,
  Circle,
  Hash,
  Move,
  Zap,
  Repeat,
  ArrowLeft
} from 'lucide-react';
import { Player, GameMode, GameState, Opponent, GameSettings, Piece, CPUPhase } from './types';

const getWinningCombinations = (size: number) => {
  const combos: number[][] = [];
  const winLength = size > 3 ? 3 : size;

  // Rows
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const combo = [];
      for (let k = 0; k < winLength; k++) combo.push(r * size + (c + k));
      combos.push(combo);
    }
  }

  // Cols
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const combo = [];
      for (let k = 0; k < winLength; k++) combo.push((r + k) * size + c);
      combos.push(combo);
    }
  }

  // Diagonals (top-left to bottom-right)
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const combo = [];
      for (let k = 0; k < winLength; k++) combo.push((r + k) * size + (c + k));
      combos.push(combo);
    }
  }

  // Diagonals (top-right to bottom-left)
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const combo = [];
      for (let k = 0; k < winLength; k++) combo.push((r + k) * size + (c - k));
      combos.push(combo);
    }
  }

  return combos;
};

const getAdjacentMap = (size: number) => {
  const map: Record<number, number[]> = {};
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const neighbors: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          neighbors.push(nr * size + nc);
        }
      }
    }
    map[i] = neighbors;
  }
  return map;
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [showRules, setShowRules] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    mode: 'classic',
    opponent: 'cpu',
    startingPlayer: 'X',
    isMainMode: false,
    gridSize: 3,
  });
  
  const [board, setBoard] = useState<(Player | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  
  // Main Mode State
  const [mainModeWins, setMainModeWins] = useState(0);
  const [cpuPhase, setCpuPhase] = useState<CPUPhase>('beginner');
  const [phaseMessage, setPhaseMessage] = useState<string | null>(null);
  const [winStreak, setWinStreak] = useState(0);

  const handleMainModeWin = useCallback((winnerPlayer: Player | 'draw') => {
    if (!settings.isMainMode) return;

    if (winnerPlayer === 'X') {
      const isConsecutive = winStreak > 0;
      const winValue = isConsecutive ? 2 : 1;
      const newWins = mainModeWins + winValue;
      
      setMainModeWins(newWins);
      setWinStreak(prev => prev + 1);

      if (isConsecutive) {
        setPhaseMessage("¡COMBO! VICTORIA X2");
        setTimeout(() => setPhaseMessage(null), 2000);
      }

      if (cpuPhase === 'beginner' && newWins >= 5) {
        setCpuPhase('intermediate');
        setMainModeWins(0);
        setWinStreak(0);
        const modes: GameMode[] = ['romano', 'free', 'terni'];
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        setSettings(prev => ({ ...prev, mode: randomMode }));
        setPhaseMessage(`FASE 2: MODO ${getModeTitle(randomMode).toUpperCase()} ACTIVADO`);
      } else if (cpuPhase === 'intermediate' && newWins >= 5) {
        setCpuPhase('advanced');
        setMainModeWins(0);
        setWinStreak(0);
        setSettings(prev => ({ ...prev, gridSize: 4, mode: 'classic' }));
        setPhaseMessage("FASE 3: TABLERO 4x4 ACTIVADO");
      } else if (cpuPhase === 'advanced' && newWins >= 5) {
        setCpuPhase('expert');
        setMainModeWins(0);
        setWinStreak(0);
        setSettings(prev => ({ ...prev, gridSize: 5, mode: 'classic' }));
        setPhaseMessage("FASE 4: TABLERO 5x5 ACTIVADO");
      } else if (cpuPhase === 'expert' && newWins >= 5) {
        setCpuPhase('master');
        setMainModeWins(0);
        setWinStreak(0);
        setPhaseMessage("FASE FINAL: CPU.EXE AL MÁXIMO");
      }
    } else {
      // Loss or Draw resets the streak
      setWinStreak(0);
      if (winnerPlayer === 'O') {
        setPhaseMessage("ERROR: CPU.EXE HA GANADO. RACHA REINICIADA.");
      } else {
        setPhaseMessage("EMPATE: RACHA REINICIADA.");
      }
    }
  }, [settings.isMainMode, mainModeWins, cpuPhase, settings.gridSize, winStreak]);

  const checkWinner = (currentBoard: (Player | null)[]) => {
    const size = Math.sqrt(currentBoard.length);
    const combinations = getWinningCombinations(size);
    for (const combo of combinations) {
      if (currentBoard[combo[0]] && combo.every(idx => currentBoard[idx] === currentBoard[combo[0]])) {
        return currentBoard[combo[0]];
      }
    }
    if (currentBoard.every(cell => cell !== null)) return 'draw';
    return null;
  };

  const resetGame = () => {
    setBoard(Array(settings.gridSize * settings.gridSize).fill(null));
    setCurrentPlayer(settings.startingPlayer);
    setWinner(null);
    setPieces([]);
    setSelectedPieceIndex(null);
    setMoveCount(0);
    setGameState('playing');
  };

  const handleCellClick = (index: number) => {
    if (winner || gameState !== 'playing') return;
    if (settings.opponent === 'cpu' && currentPlayer === 'O') return;
    processMove(index);
  };

  const processMove = useCallback((toIndex: number, fromIndexOverride?: number) => {
    const playerPieces = pieces.filter(p => p.player === currentPlayer);
    const isPlacementPhase = settings.mode === 'classic' ? true : playerPieces.length < settings.gridSize;
    const fromIndex = fromIndexOverride !== undefined ? fromIndexOverride : selectedPieceIndex;
    const adjacentMap = getAdjacentMap(settings.gridSize);

    if (isPlacementPhase) {
      if (board[toIndex]) return;

      const newBoard = [...board];
      newBoard[toIndex] = currentPlayer;
      
      const newPiece: Piece = {
        id: Date.now() + Math.random(),
        player: currentPlayer,
        position: toIndex,
        order: moveCount
      };

      setBoard(newBoard);
      setPieces([...pieces, newPiece]);
      setMoveCount(prev => prev + 1);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result);
        setGameState('winner');
        handleMainModeWin(result);
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    } else {
      // Movement Phase
      const pieceAtPos = pieces.find(p => p.position === toIndex && p.player === currentPlayer);
      
      // If we are not forcing a move from a specific index (CPU)
      if (fromIndexOverride === undefined && pieceAtPos) {
        if (settings.mode === 'terni') {
          const oldestPiece = playerPieces.sort((a, b) => a.order - b.order)[0];
          if (pieceAtPos.id === oldestPiece.id) {
            setSelectedPieceIndex(toIndex);
          }
        } else {
          setSelectedPieceIndex(toIndex);
        }
        return;
      }

      if (fromIndex !== null) {
        if (board[toIndex] && fromIndexOverride === undefined) {
          const otherPiece = pieces.find(p => p.position === toIndex && p.player === currentPlayer);
          if (otherPiece) {
            if (settings.mode === 'terni') {
               const oldestPiece = playerPieces.sort((a, b) => a.order - b.order)[0];
               if (otherPiece.id === oldestPiece.id) setSelectedPieceIndex(toIndex);
            } else {
              setSelectedPieceIndex(toIndex);
            }
          }
          return;
        }

        let isValid = false;
        if (settings.mode === 'free' || settings.mode === 'terni') {
          isValid = true;
        } else if (settings.mode === 'romano') {
          isValid = adjacentMap[fromIndex].includes(toIndex);
        }

        if (isValid) {
          const newBoard = [...board];
          newBoard[fromIndex] = null;
          newBoard[toIndex] = currentPlayer;

          const newPieces = pieces.map(p => 
            p.position === fromIndex ? { ...p, position: toIndex, order: moveCount } : p
          );

          setBoard(newBoard);
          setPieces(newPieces);
          setSelectedPieceIndex(null);
          setMoveCount(prev => prev + 1);

          const result = checkWinner(newBoard);
          if (result) {
            setWinner(result);
            setGameState('winner');
            handleMainModeWin(result);
          } else {
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
          }
        }
      }
    }
  }, [board, currentPlayer, pieces, selectedPieceIndex, moveCount, settings, checkWinner, handleMainModeWin]);

  useEffect(() => {
    if (settings.opponent === 'cpu' && currentPlayer === 'O' && !winner && gameState === 'playing') {
      const timer = setTimeout(() => {
        makeCPUMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, settings.opponent, winner, gameState, pieces, board]); // Added dependencies

  const makeCPUMove = () => {
    const playerPieces = pieces.filter(p => p.player === 'O');
    const isPlacementPhase = settings.mode === 'classic' ? true : playerPieces.length < settings.gridSize;
    const adjacentMap = getAdjacentMap(settings.gridSize);

    // Difficulty Logic
    let shouldMakeMistake = false;
    if (settings.isMainMode) {
      if (cpuPhase === 'beginner') {
        shouldMakeMistake = Math.random() > 0.3; // 70% chance to make a mistake
      } else if (cpuPhase === 'intermediate') {
        shouldMakeMistake = Math.random() > 0.6; // 40% chance to make a mistake
      } else if (cpuPhase === 'advanced') {
        shouldMakeMistake = Math.random() > 0.8; // 20% chance to make a mistake
      }
      // expert and master phases make no mistakes
    }

    if (isPlacementPhase) {
      const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
      if (emptyIndices.length === 0) return;

      if (!shouldMakeMistake) {
        // 1. Win move
        for (const idx of emptyIndices) {
          const testBoard = [...board];
          testBoard[idx] = 'O';
          if (checkWinner(testBoard) === 'O') {
            processMove(idx);
            return;
          }
        }

        // 2. Block immediate win
        for (const idx of emptyIndices) {
          const testBoard = [...board];
          testBoard[idx] = 'X';
          if (checkWinner(testBoard) === 'X') {
            processMove(idx);
            return;
          }
        }

        // 3. Strategic Block (Block potential lines of 2)
        // This makes the AI "prioritize Draw" by preventing setups
        if (settings.gridSize > 3) {
          const combinations = getWinningCombinations(settings.gridSize);
          for (const combo of combinations) {
            const xCount = combo.filter(idx => board[idx] === 'X').length;
            const emptyCount = combo.filter(idx => board[idx] === null).length;
            if (xCount === 2 && emptyCount === 1) {
              const targetIdx = combo.find(idx => board[idx] === null);
              if (targetIdx !== undefined) {
                processMove(targetIdx);
                return;
              }
            }
          }
        }
      }

      const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      processMove(randomIdx);
    } else {
      const availablePieces = settings.mode === 'terni' 
        ? [playerPieces.sort((a, b) => a.order - b.order)[0]]
        : playerPieces;

      const possibleMoves: { piecePos: number, targetPos: number }[] = [];
      
      for (const piece of availablePieces) {
        const targets = settings.mode === 'romano' 
          ? adjacentMap[piece.position].filter(idx => board[idx] === null)
          : board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
        
        for (const target of targets) {
          possibleMoves.push({ piecePos: piece.position, targetPos: target });
        }
      }

      if (possibleMoves.length === 0) return;

      if (!shouldMakeMistake) {
        // 1. Win move
        for (const move of possibleMoves) {
          const testBoard = [...board];
          testBoard[move.piecePos] = null;
          testBoard[move.targetPos] = 'O';
          if (checkWinner(testBoard) === 'O') {
            processMove(move.targetPos, move.piecePos);
            return;
          }
        }

        // 2. Block immediate win
        for (const move of possibleMoves) {
          const testBoard = [...board];
          testBoard[move.piecePos] = null;
          testBoard[move.targetPos] = 'X';
          if (checkWinner(testBoard) === 'X') {
            processMove(move.targetPos, move.piecePos);
            return;
          }
        }

        // 3. Strategic Block (Movement Phase)
        if (settings.gridSize > 3) {
          const combinations = getWinningCombinations(settings.gridSize);
          for (const move of possibleMoves) {
            const testBoard = [...board];
            testBoard[move.piecePos] = null;
            testBoard[move.targetPos] = 'X';
            
            // If this move blocks a potential line of 2
            let blocksThreat = false;
            for (const combo of combinations) {
              const xCount = combo.filter(idx => testBoard[idx] === 'X').length;
              const emptyCount = combo.filter(idx => testBoard[idx] === null).length;
              if (xCount === 2 && emptyCount === 1) {
                // This move doesn't block it directly, but we want to see if the move itself is a block
                // Actually, let's just check if the targetPos is in a combo that has 2 X's
                if (combo.includes(move.targetPos)) {
                   const xCountInComboBefore = combo.filter(idx => board[idx] === 'X').length;
                   if (xCountInComboBefore === 2) {
                     blocksThreat = true;
                     break;
                   }
                }
              }
            }
            if (blocksThreat) {
              processMove(move.targetPos, move.piecePos);
              return;
            }
          }
        }
      }

      // 3. Random move
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      processMove(randomMove.targetPos, randomMove.piecePos);
    }
  };

  const getModeTitle = (mode: GameMode) => {
    switch (mode) {
      case 'classic': return 'Clásico';
      case 'romano': return 'Romano';
      case 'free': return 'Libre';
      case 'terni': return 'Terni';
    }
  };

  const getModeIcon = (mode: GameMode) => {
    switch (mode) {
      case 'classic': return <Hash size={32} />;
      case 'romano': return <Move size={32} />;
      case 'free': return <Zap size={32} />;
      case 'terni': return <Repeat size={32} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <div className="max-w-md mx-auto px-6 py-8 min-h-screen flex flex-col relative">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
              GATO.EXE
            </h1>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowRules(true)}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <HelpCircle size={20} />
          </motion.button>
        </header>

        <main className="flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {gameState === 'menu' && (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12"
              >
                {/* Main Mode Button */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] opacity-40">Tamaño del Tablero</span>
                    <div className="flex gap-2">
                      {[3, 4, 5].map((size) => (
                        <button
                          key={size}
                          onClick={() => setSettings({ ...settings, gridSize: size })}
                          className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                            settings.gridSize === size 
                              ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                              : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSettings({
                        mode: 'classic',
                        opponent: 'cpu',
                        startingPlayer: 'X',
                        isMainMode: true,
                        gridSize: 3,
                      });
                      setMainModeWins(0);
                      setWinStreak(0);
                      setCpuPhase('beginner');
                      setPhaseMessage(null);
                      resetGame();
                    }}
                    className="w-full p-8 bg-white text-black rounded-3xl flex items-center justify-between group relative overflow-hidden"
                  >
                    <div className="relative z-10 text-left">
                      <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] opacity-40">Modo Especial</span>
                      <h2 className="text-4xl font-black italic tracking-tighter leading-none">MODO MAIN</h2>
                    </div>
                    <div className="relative z-10">
                      <Trophy className="w-10 h-10" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-400 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </motion.button>
                </div>

                {/* Mode Selection Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {(['classic', 'romano', 'free', 'terni'] as GameMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSettings({ ...settings, mode: m, isMainMode: false })}
                      className={`aspect-square flex flex-col items-center justify-center gap-4 rounded-3xl border-2 transition-all duration-500 ${
                        settings.mode === m && !settings.isMainMode
                          ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.15)] text-indigo-400' 
                          : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <motion.div
                        animate={settings.mode === m && !settings.isMainMode ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {getModeIcon(m)}
                      </motion.div>
                      <span className="font-black text-sm uppercase tracking-widest">{getModeTitle(m)}</span>
                    </button>
                  ))}
                </div>

                {/* Opponent Selection - Minimalist */}
                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setSettings({ ...settings, opponent: 'cpu', isMainMode: false })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
                      settings.opponent === 'cpu' && !settings.isMainMode
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Cpu size={14} /> CPU
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, opponent: 'human', isMainMode: false })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
                      settings.opponent === 'human' && !settings.isMainMode
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <User size={14} /> Humano
                  </button>
                </div>

                <button
                  onClick={resetGame}
                  className="w-full py-6 bg-white text-black rounded-3xl font-black text-xl tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-3 hover:bg-indigo-400 hover:text-white"
                >
                  EJECUTAR <ChevronRight size={24} />
                </button>
              </motion.div>
            )}

            {(gameState === 'playing' || gameState === 'winner') && (
              <motion.div 
                key="game"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                {/* Main Mode Progress */}
                {settings.isMainMode && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      <span>Fase: {cpuPhase.toUpperCase()}</span>
                      <span>{mainModeWins} / 5 Victorias</span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(mainModeWins / 5) * 100}%` }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                    <AnimatePresence mode="wait">
                      {phaseMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-[10px] font-mono text-indigo-400 text-center uppercase"
                        >
                          {phaseMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Minimal Status */}
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${currentPlayer === 'X' ? 'bg-cyan-500' : 'bg-rose-500'} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                    <span className="font-black tracking-widest text-sm uppercase text-slate-400">
                      Turno {currentPlayer}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
                    {settings.isMainMode ? 'MODO MAIN' : `Mode: ${getModeTitle(settings.mode)}`}
                  </span>
                </div>

                {/* The Board - Brutalist Grid */}
                <div className="relative aspect-square">
                  <div 
                    className="grid gap-3 h-full"
                    style={{ 
                      gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                      gridTemplateRows: `repeat(${settings.gridSize}, 1fr)` 
                    }}
                  >
                    {board.map((cell, i) => {
                      const isSelected = selectedPieceIndex === i;
                      let isOldest = false;
                      if (settings.mode === 'terni' && cell === currentPlayer) {
                        const playerPieces = pieces.filter(p => p.player === currentPlayer);
                        if (playerPieces.length === settings.gridSize) {
                          const oldest = playerPieces.sort((a, b) => a.order - b.order)[0];
                          if (pieces.find(p => p.position === i)?.id === oldest.id) {
                            isOldest = true;
                          }
                        }
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleCellClick(i)}
                          disabled={!!winner}
                          className={`relative rounded-2xl transition-all duration-300 flex items-center justify-center
                            ${isSelected ? 'bg-indigo-600/20 border-2 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700'}
                            ${isOldest ? 'border-yellow-500/40' : ''}
                          `}
                        >
                          <AnimatePresence>
                            {cell === 'X' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-cyan-500"
                              >
                                <X size={settings.gridSize > 3 ? 32 : 44} strokeWidth={4} />
                              </motion.div>
                            )}
                            {cell === 'O' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-rose-500"
                              >
                                <Circle size={settings.gridSize > 3 ? 28 : 36} strokeWidth={4} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      );
                    })}
                  </div>

                  {/* Winner Overlay */}
                  <AnimatePresence>
                    {winner && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl border border-slate-800"
                      >
                        <motion.div
                          initial={{ y: 20 }}
                          animate={{ y: 0 }}
                          className="text-center p-8"
                        >
                          <h2 className="text-5xl font-black mb-2 italic tracking-tighter text-white">
                            {winner === 'draw' ? 'EMPATE' : `${winner} WINS`}
                          </h2>
                          <div className="h-1 w-24 bg-indigo-500 mx-auto mb-10" />
                          
                          <div className="space-y-3">
                            <button
                              onClick={resetGame}
                              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all active:scale-95"
                            >
                              REINTENTAR
                            </button>
                            <button
                              onClick={() => setGameState('menu')}
                              className="w-full py-4 bg-slate-900 text-slate-400 rounded-2xl font-bold transition-all"
                            >
                              SALIR
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Game Controls */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setGameState('menu')}
                    className="flex-1 py-4 bg-slate-900/50 border border-slate-800 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-slate-300"
                  >
                    Menú
                  </button>
                  <button
                    onClick={resetGame}
                    className="aspect-square p-4 bg-slate-900/50 border border-slate-800 text-slate-500 rounded-2xl hover:text-indigo-400 transition-all"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Rules Modal */}
        <AnimatePresence>
          {showRules && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-8"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black italic tracking-tighter text-indigo-400">REGLAS.DOC</h2>
                <button 
                  onClick={() => setShowRules(false)}
                  className="p-2 text-slate-500 hover:text-white"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>

              <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                    <Hash size={14} /> Clásico
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    El juego original. Consigue 3 en raya antes que tu oponente.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                    <Move size={14} /> Romano
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Cada jugador tiene solo 3 fichas. Una vez colocadas, debes moverlas a casillas <span className="text-indigo-300">adyacentes</span> vacías.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                    <Zap size={14} /> Libre
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Igual que el Romano, pero puedes mover tus fichas a <span className="text-indigo-300">cualquier</span> casilla vacía del tablero.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                    <Repeat size={14} /> Terni
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Solo puedes mover la ficha que colocaste <span className="text-indigo-300">primero</span>. El orden de movimiento sigue la secuencia de colocación (FIFO).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="mt-auto w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                ENTENDIDO
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[10px] text-slate-800 font-mono uppercase tracking-[0.4em]">
            SYSTEM_ACTIVE // BUILD_2026
          </p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
