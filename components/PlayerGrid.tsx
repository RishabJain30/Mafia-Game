
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, Role, GamePhase } from '../types';
import { ROLE_COLORS } from '../constants';
import DynamicAvatar from './DynamicAvatar';

interface PlayerGridProps {
  players: Player[];
  userRole: Role;
  phase: GamePhase;
  selectableIds?: number[];
  onSelect?: (id: number) => void;
  selectedId?: number;
  showAllRoles?: boolean;
}

const PlayerGrid: React.FC<PlayerGridProps> = ({ 
  players, 
  userRole, 
  phase, 
  selectableIds = [], 
  onSelect, 
  selectedId,
  showAllRoles = false
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {players.map((player) => {
        const isSelectable = selectableIds.includes(player.id) && player.isAlive;
        const isSelected = selectedId === player.id;
        
        return (
          <motion.button
            key={player.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={isSelectable ? { scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" } : {}}
            whileTap={isSelectable ? { scale: 0.95 } : {}}
            disabled={!isSelectable}
            onClick={() => onSelect?.(player.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 overflow-hidden
              ${player.isAlive ? 'bg-slate-900/80 backdrop-blur-sm' : 'bg-slate-950/40 grayscale border-red-900/30'}
              ${isSelected ? 'neon-border-emerald border-emerald-500 scale-105 z-10' : 'border-slate-800'}
              ${isSelectable ? 'cursor-pointer hover:border-blue-500' : 'cursor-default'}
            `}
          >
            {/* Elimination Glitch Overlay */}
            {!player.isAlive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 pointer-events-none">
                <div className="text-red-600 font-black text-xs uppercase animate-glitch tracking-tighter transform rotate-12 border-2 border-red-600 px-2 py-1 bg-black">
                  SIGNAL LOST
                </div>
              </div>
            )}

            {/* Pulsing glow if being targeted during voting */}
            {phase === GamePhase.Voting && isSelectable && (
              <motion.div 
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{ boxShadow: ["inset 0 0 0px rgba(239, 68, 68, 0)", "inset 0 0 15px rgba(239, 68, 68, 0.4)", "inset 0 0 0px rgba(239, 68, 68, 0)"] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}

            {/* Dynamic Avatar */}
            <DynamicAvatar isUser={player.isUser} isAlive={player.isAlive} color={player.color} />

            {/* Name */}
            <div className={`text-sm font-bold tracking-wider ${player.isUser ? 'text-blue-400' : 'text-slate-300'}`}>
              {player.name} {player.isUser && " (YOU)"}
            </div>

            {/* Role Reveal */}
            {(player.isUser || showAllRoles || !player.isAlive) && (
              <div className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 ${ROLE_COLORS[player.role]}`}>
                {player.role}
              </div>
            )}

            {/* Sus Meter */}
            {player.isAlive && (
               <div className="w-full mt-2 space-y-1">
                  <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                    <span>SUS_LVL</span>
                    <span>{Math.round(player.suspicion)}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${player.suspicion > 60 ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 'bg-blue-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${player.suspicion}%` }}
                      transition={{ type: "spring", stiffness: 50 }}
                    />
                  </div>
               </div>
            )}

            {isSelected && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-2 bg-emerald-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              >
                TARGETED
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default PlayerGrid;
