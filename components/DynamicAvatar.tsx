
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DynamicAvatarProps {
  isUser: boolean;
  isAlive: boolean;
  color: string;
}

const DynamicAvatar: React.FC<DynamicAvatarProps> = ({ isUser, isAlive, color }) => {
  const eyeColor = isUser ? '#60a5fa' : '#94a3b8';
  const glowColor = isAlive ? (isUser ? '#3b82f6' : '#64748b') : '#334155';

  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      className={`w-16 h-16 ${!isAlive ? 'grayscale' : ''}`}
      animate={isAlive ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
      {/* Outer Glow */}
      <motion.circle 
        cx="50" cy="50" r="45" 
        fill="none" 
        stroke={glowColor} 
        strokeWidth="1"
        animate={isAlive ? { opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] } : { opacity: 0 }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      
      {/* Helmet/Head */}
      <path 
        d="M20,50 Q20,20 50,20 Q80,20 80,50 L80,75 Q80,85 70,85 L30,85 Q20,85 20,75 Z" 
        fill="#0f172a" 
        stroke={isAlive ? glowColor : '#1e293b'} 
        strokeWidth="2" 
      />
      
      {/* Visor */}
      <rect x="25" y="40" width="50" height="15" rx="5" fill="#1e293b" />
      
      {/* Eyes */}
      <motion.g animate={isAlive ? { opacity: [1, 1, 0, 1, 1] } : { opacity: 0.2 }} transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.92, 0.94, 1] }}>
        <circle cx="40" cy="47.5" r="3" fill={eyeColor} />
        <circle cx="60" cy="47.5" r="3" fill={eyeColor} />
      </motion.g>

      {/* User Icon Decoration */}
      {isUser && (
        <path d="M45,15 L55,15 L50,5 Z" fill="#3b82f6" />
      )}
    </motion.svg>
  );
};

export default DynamicAvatar;
