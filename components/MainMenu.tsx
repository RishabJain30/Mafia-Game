
import React from 'react';
import { motion } from 'framer-motion';

interface MainMenuProps {
  onStartSinglePlayer: () => void;
  onStartMultiplayer: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartSinglePlayer, onStartMultiplayer }) => {
  const menuItems = [
    { label: '[ INITIALIZE BOT_MODE ]', action: onStartSinglePlayer, sub: 'Single Player Simulation' },
    { label: '[ ESTABLISH NEURAL_LINK ]', action: onStartMultiplayer, sub: 'P2P Multiplayer Sector' },
    { label: '[ ENCRYPTION_SETTINGS ]', action: () => {}, sub: 'System Parameters' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-6xl font-black italic tracking-tighter neon-text-red uppercase animate-pulse">
          MAFIA: NEON NOIR
        </h1>
        <p className="text-slate-500 font-mono text-xs tracking-[0.5em] mt-2">DEDUCTION_ENGINE_v4.2</p>
      </motion.div>

      <div className="flex flex-col space-y-6 w-full max-w-sm">
        {menuItems.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.05, x: 10 }}
            onClick={item.action}
            className="group relative flex flex-col items-start p-4 border border-slate-800 bg-slate-900/40 hover:bg-red-900/10 hover:border-red-500/50 transition-all rounded-lg overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-red-500 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
            <span className="text-sm font-black text-slate-300 group-hover:text-red-400 uppercase tracking-widest">{item.label}</span>
            <span className="text-[10px] text-slate-600 font-mono uppercase mt-1 group-hover:text-red-900/80">{item.sub}</span>
          </motion.button>
        ))}
      </div>

      <motion.div 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="fixed bottom-8 text-[10px] text-slate-700 font-mono uppercase tracking-[0.3em]"
      >
        Neural Uplink: STANDBY...
      </motion.div>
    </div>
  );
};

export default MainMenu;
