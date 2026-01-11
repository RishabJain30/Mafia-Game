
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Player, Role, Side, GamePhase, GameState, GameMessage, DialogueItem 
} from './types';
import { 
  INITIAL_ROLES, PLAYER_NAMES, getSideByRole, ROLE_COLORS 
} from './constants';
import { generatePlayerDialogue } from './services/geminiService';
import PlayerGrid from './components/PlayerGrid';
import GameLog from './components/GameLog';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPhase: GamePhase.MainMenu,
    dayCount: 1,
    messages: [],
    nightActions: {},
    isMultiplayer: false,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<number | undefined>(undefined);

  const triggerFlash = () => {
    const flash = document.getElementById('flash-overlay');
    if (flash) {
      flash.classList.remove('animate-flash');
      void flash.offsetWidth;
      flash.classList.add('animate-flash');
    }
  };

  const addMessage = (text: string, type: GameMessage['type'] = 'info', sender?: string) => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, { id: Date.now().toString() + Math.random(), text, type, sender }]
    }));
  };

  const startSinglePlayer = () => {
    triggerFlash();
    const shuffledRoles = [...INITIAL_ROLES].sort(() => Math.random() - 0.5);
    const initialPlayers: Player[] = PLAYER_NAMES.map((name, i) => ({
      id: i,
      name,
      role: shuffledRoles[i],
      side: getSideByRole(shuffledRoles[i]),
      isAlive: true,
      isUser: i === 0,
      color: 'blue',
      suspicion: Math.random() * 15,
      isReady: true,
      isBot: i !== 0
    }));

    setGameState(prev => ({
      ...prev,
      players: initialPlayers,
      currentPhase: GamePhase.Lobby,
      isMultiplayer: false,
      messages: [{ id: 'start-0', text: "SINGLE_PLAYER_MODE: AI_ADVERSARIES_LOADED.", type: 'info' }]
    }));
  };

  const startMultiplayer = () => {
    triggerFlash();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const initialPlayer: Player = {
      id: 0,
      name: "Shadow",
      role: Role.Villager, // assigned later
      side: Side.Town,
      isAlive: true,
      isUser: true,
      color: 'blue',
      suspicion: 0,
      isReady: false,
      isBot: false
    };

    setGameState(prev => ({
      ...prev,
      players: [initialPlayer],
      currentPhase: GamePhase.Lobby,
      isMultiplayer: true,
      lobbyCode: code,
      messages: [{ id: 'mp-0', text: `SECTOR_${code} ESTABLISHED. AWAITING PEERS.`, type: 'info' }]
    }));
  };

  const finalizeLobby = () => {
    triggerFlash();
    // Assign roles if multiplayer, already assigned if single player
    let finalPlayers = [...gameState.players];
    if (gameState.isMultiplayer) {
      const shuffledRoles = [...INITIAL_ROLES].sort(() => Math.random() - 0.5);
      finalPlayers = finalPlayers.map((p, i) => ({
        ...p,
        role: shuffledRoles[i],
        side: getSideByRole(shuffledRoles[i])
      }));
    }

    setGameState(prev => ({
      ...prev,
      players: finalPlayers,
      currentPhase: GamePhase.RoleReveal
    }));
  };

  const toggleReady = () => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.isUser ? { ...p, isReady: !p.isReady } : p)
    }));
  };

  const userPlayer = useMemo(() => gameState.players.find(p => p.isUser), [gameState.players]);

  const updateSuspicion = (playerId: number, amount: number) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, suspicion: Math.min(100, Math.max(0, p.suspicion + amount)) } : p
      )
    }));
  };

  const nextPhase = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const { currentPhase, players, nightActions } = gameState;

    if (currentPhase === GamePhase.RoleReveal) {
      triggerFlash();
      setGameState(prev => ({ ...prev, currentPhase: GamePhase.NightAction }));
      addMessage("City power grid cycling... NIGHT PHASE ACTIVE.", "system");
    } 
    else if (currentPhase === GamePhase.NightAction) {
      triggerFlash();
      const alivePlayers = players.filter(p => p.isAlive);
      const mafiaPlayers = players.filter(p => p.role === Role.Mafia && p.isAlive);
      const detective = players.find(p => p.role === Role.Detective && p.isAlive);
      const doctor = players.find(p => p.role === Role.Doctor && p.isAlive);

      let finalActions = { ...nightActions };
      if (mafiaPlayers.length > 0 && !finalActions.mafiaTarget) {
        const targets = alivePlayers.filter(p => p.side === Side.Town);
        finalActions.mafiaTarget = targets[Math.floor(Math.random() * targets.length)]?.id;
      }
      if (doctor && (doctor.isBot || !doctor.isUser) && !finalActions.doctorTarget) {
        finalActions.doctorTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
      }
      if (detective && (detective.isBot || !detective.isUser) && !finalActions.detectiveTarget) {
        finalActions.detectiveTarget = alivePlayers.filter(p => p.id !== detective.id)[Math.floor(Math.random() * (alivePlayers.length - 1))]?.id;
      }

      let killedId: number | undefined = undefined;
      const saved = finalActions.mafiaTarget !== undefined && finalActions.mafiaTarget === finalActions.doctorTarget;
      if (finalActions.mafiaTarget !== undefined && !saved) killedId = finalActions.mafiaTarget;

      const updatedPlayers = players.map(p => {
        if (p.id === killedId) return { ...p, isAlive: false, suspicion: 0 };
        return p;
      });

      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        currentPhase: GamePhase.DaySummary,
        nightActions: {},
        lastEliminatedId: killedId
      }));

      addMessage("MORNING_SCAN COMPLETE. LIGHTS ON.", "system");
      if (killedId !== undefined) {
        addMessage(`${players.find(p => p.id === killedId)?.name} SIGNAL LOST. DECEASED.`, "night-report");
      } else {
        if (saved) addMessage("A targeted hit was intercepted by medical drones.", "save");
        addMessage("No causalities detected.", "info");
      }
    } 
    else if (currentPhase === GamePhase.DaySummary) {
      setGameState(prev => ({ ...prev, currentPhase: GamePhase.Discussion }));
      addMessage("NEURAL DEBATE MODE ENGAGED.", "system");
      const alivePlayers = gameState.players.filter(p => p.isAlive);
      const dialogue = await generatePlayerDialogue(alivePlayers, [], gameState.dayCount);
      for (const d of dialogue) {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
        const p = gameState.players.find(player => player.id === d.playerId);
        if (p) addMessage(d.text, 'chat', p.name);
      }
    }
    else if (currentPhase === GamePhase.Discussion) {
      setGameState(prev => ({ ...prev, currentPhase: GamePhase.Voting }));
      addMessage("CITIZEN VOTE PROTOCOL INITIATED.", "system");
    }
    else if (currentPhase === GamePhase.Voting) {
      const alivePlayers = players.filter(p => p.isAlive);
      const votes: Record<number, number> = {};
      if (selectedTarget !== undefined) votes[selectedTarget] = 1;
      alivePlayers.filter(p => p.isBot).forEach(p => {
        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        votes[target.id] = (votes[target.id] || 0) + 1;
      });
      let highestVotes = -1, eliminatedId = -1;
      Object.entries(votes).forEach(([id, count]) => { if (count > highestVotes) { highestVotes = count; eliminatedId = Number(id); } });
      const updatedPlayers = players.map(p => p.id === eliminatedId ? { ...p, isAlive: false, suspicion: 0 } : p);
      addMessage(`${players.find(p => p.id === eliminatedId)?.name} ejected.`, "info");
      setGameState(prev => ({ ...prev, players: updatedPlayers, currentPhase: GamePhase.Elimination }));
      setSelectedTarget(undefined);
    }
    else if (currentPhase === GamePhase.Elimination) {
      const alivePlayers = players.filter(p => p.isAlive);
      const mafiaCount = alivePlayers.filter(p => p.side === Side.Mafia).length;
      const townCount = alivePlayers.length - mafiaCount;
      if (mafiaCount === 0) setGameState(prev => ({ ...prev, currentPhase: GamePhase.GameOver, winner: Side.Town }));
      else if (mafiaCount >= townCount) setGameState(prev => ({ ...prev, currentPhase: GamePhase.GameOver, winner: Side.Mafia }));
      else setGameState(prev => ({ ...prev, currentPhase: GamePhase.NightAction, dayCount: prev.dayCount + 1 }));
    }
    setIsProcessing(false);
  }, [gameState, isProcessing, selectedTarget]);

  if (gameState.currentPhase === GamePhase.MainMenu) {
    return <MainMenu onStartSinglePlayer={startSinglePlayer} onStartMultiplayer={startMultiplayer} />;
  }

  if (gameState.currentPhase === GamePhase.Lobby) {
    return (
      <Lobby 
        players={gameState.players} 
        lobbyCode={gameState.lobbyCode} 
        isHost={true} 
        onReady={toggleReady} 
        onStartGame={finalizeLobby} 
        onBack={() => setGameState(p => ({ ...p, currentPhase: GamePhase.MainMenu }))} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 space-y-6 max-w-6xl mx-auto relative z-10">
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-900/40 border border-red-500/50 rounded flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <i className="fa-solid fa-skull-crossbones text-2xl text-red-500"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter neon-text-red uppercase italic">MAFIA: NEON NOIR</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">ENCRYPTED_LINK // D.{gameState.dayCount} // {gameState.currentPhase}</p>
          </div>
        </div>
        {userPlayer && (
          <div className="bg-slate-900 border border-slate-700 px-6 py-2 rounded-full flex items-center gap-6">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Subject ID:</span>
            <span className={`text-sm font-bold uppercase tracking-[0.2em] ${ROLE_COLORS[userPlayer.role]}`}>{userPlayer.role}</span>
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        <div className="lg:w-2/3 space-y-6">
          <PlayerGrid 
            players={gameState.players} 
            userRole={userPlayer?.role || Role.Villager} 
            phase={gameState.currentPhase} 
            selectableIds={gameState.currentPhase === GamePhase.NightAction || gameState.currentPhase === GamePhase.Voting ? gameState.players.filter(p => p.isAlive && !p.isUser).map(p => p.id) : []}
            onSelect={setSelectedTarget} 
            selectedId={selectedTarget}
            showAllRoles={gameState.currentPhase === GamePhase.GameOver}
          />

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px]">
            {gameState.currentPhase === GamePhase.RoleReveal && (
              <button onClick={nextPhase} className="px-10 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-black uppercase tracking-widest text-xs transition-all">Engage Uplink</button>
            )}
            {gameState.currentPhase === GamePhase.NightAction && (
              <button disabled={selectedTarget === undefined && userPlayer?.role !== Role.Villager} onClick={nextPhase} className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-lg font-black uppercase tracking-widest text-xs transition-all">Confirm Action</button>
            )}
            {gameState.currentPhase === GamePhase.Discussion && (
              <button onClick={nextPhase} className="px-10 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-black uppercase tracking-widest text-xs transition-all">Initiate Voting</button>
            )}
            {gameState.currentPhase === GamePhase.Voting && (
              <button disabled={selectedTarget === undefined} onClick={nextPhase} className="px-10 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-30 rounded-lg font-black uppercase tracking-widest text-xs transition-all">Confirm Ejection</button>
            )}
            {(gameState.currentPhase === GamePhase.DaySummary || gameState.currentPhase === GamePhase.Elimination) && (
              <button disabled={isProcessing} onClick={nextPhase} className="px-10 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-black uppercase tracking-widest text-xs transition-all">Next Frame</button>
            )}
            {gameState.currentPhase === GamePhase.GameOver && (
               <button onClick={() => window.location.reload()} className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-black uppercase tracking-widest text-xs transition-all">Reboot System</button>
            )}
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col gap-4">
          <GameLog messages={gameState.messages} />
        </div>
      </div>

      <footer className="pt-4 border-t border-slate-900 text-[9px] text-slate-700 font-mono flex justify-between items-center">
        <span className="animate-heartbeat uppercase tracking-widest">Neural Engine: Active // Latency: 42ms</span>
        <div className="flex gap-6 uppercase tracking-[0.2em] font-bold">
           <span className="text-blue-600/60">Town [5]</span>
           <span className="text-red-600/60">Mafia [2]</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
