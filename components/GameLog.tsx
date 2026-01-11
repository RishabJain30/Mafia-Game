
import React, { useEffect, useRef } from 'react';
import { GameMessage } from '../types';
import Typewriter from './Typewriter';

interface GameLogProps {
  messages: GameMessage[];
}

const GameLog: React.FC<GameLogProps> = ({ messages }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageStyle = (msg: GameMessage) => {
    switch (msg.type) {
      case 'system': return "text-yellow-400 italic";
      case 'info': return "text-blue-400 font-bold";
      case 'night-report': return "text-red-400 font-bold";
      case 'save': return "text-emerald-400 font-bold";
      case 'scan': return "text-purple-400 font-bold";
      case 'chat': default: return "text-slate-200";
    }
  };

  const getPrefix = (msg: GameMessage) => {
    switch (msg.type) {
      case 'system': return ">> ";
      case 'info': return "[SYS] ";
      case 'night-report': return "[!] CRITICAL: ";
      case 'save': return "[+] VITAL: ";
      case 'scan': return "[?] INTEL: ";
      default: return "";
    }
  };

  return (
    <div className="flex-1 bg-black/60 border border-slate-800 rounded-lg p-4 overflow-y-auto font-mono text-xs sm:text-sm space-y-4 min-h-[350px] max-h-[550px] backdrop-blur-md">
      {messages.map((msg, idx) => (
        <div key={msg.id} className={`${getMessageStyle(msg)} leading-relaxed border-l-2 border-transparent hover:border-slate-700 pl-2 transition-colors`}>
          {msg.sender && (
            <span className="text-blue-500 font-bold mr-2 uppercase tracking-tighter opacity-80">
              {msg.sender}:
            </span>
          )}
          <span>{getPrefix(msg)}</span>
          <Typewriter 
            text={msg.text} 
            speed={10} 
            onComplete={() => {
               // Optional: trigger sound here
            }} 
          />
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default GameLog;
