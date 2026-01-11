
import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types';
import DynamicAvatar from './DynamicAvatar';

interface LobbyProps {
  players: Player[];
  lobbyCode?: string;
  isHost: boolean;
  onReady: () => void;
  onStartGame: () => void;
  onBack: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ players, lobbyCode, isHost, onReady, onStartGame, onBack }) => {
  const slots = Array.from({ length: 7 });

  return (
    <div className="flex flex-col min-h-screen p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-1">NEURAL_SECTOR_LINK</h2>
          <h3 className="text-3xl font-black italic tracking-tighter uppercase">Lobby Status</h3>
        </div>
        <div className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl text-center">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Sector Code</p>
          <p className="text-xl font-mono text-blue-400 font-bold tracking-tighter">{lobbyCode || 'LOCAL_SYS'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {slots.map((_, i) => {
          const player = players.find(p => p.id === i);
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center p-2 relative transition-all
                ${player ? (player.isReady ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-blue-500/50 bg-blue-900/10') : 'border-slate-800 border-dashed bg-transparent'}
              `}
            >
              {player ? (
                <>
                  <DynamicAvatar isUser={player.isUser} isAlive={true} color={player.color} />
                  <span className="text-[10px] font-bold mt-2 truncate w-full text-center uppercase">{player.name}</span>
                  <span className={`text-[8px] font-mono mt-1 ${player.isReady ? 'text-emerald-400' : 'text-blue-600'}`}>
                    {player.isReady ? 'READY' : 'CONNECTING...'}
                  </span>
                </>
              ) : (
                <div className="text-slate-800 text-xs font-mono uppercase tracking-widest rotate-90">EMPTY</div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex-1 bg-black/40 border border-slate-800 rounded-xl p-4 font-mono text-[10px] overflow-y-auto max-h-[150px]">
        <div className="text-blue-500">[SYS] Sector established. Awaiting subjects.</div>
        {players.map(p => (
          <div key={p.id} className="text-slate-500 mt-1">
            &gt; {p.name} joined the uplink...
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
          Abort
        </button>
        <button 
          onClick={onReady} 
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          Toggle Ready Status
        </button>
        {isHost && (
          <button 
            disabled={players.length < 4 || !players.every(p => p.isReady)}
            onClick={onStartGame} 
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-20 disabled:grayscale rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Begin Mission
          </button>
        )}
      </div>
    </div>
  );
};

export default Lobby;
