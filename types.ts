
export enum Role {
  Villager = 'Villager',
  Mafia = 'Mafia',
  Detective = 'Detective',
  Doctor = 'Doctor'
}

export enum Side {
  Town = 'Town',
  Mafia = 'Mafia'
}

export enum GamePhase {
  MainMenu = 'MainMenu',
  Lobby = 'Lobby',
  RoleReveal = 'RoleReveal',
  NightAction = 'NightAction',
  DaySummary = 'DaySummary',
  Discussion = 'Discussion',
  Voting = 'Voting',
  Elimination = 'Elimination',
  GameOver = 'GameOver'
}

export interface Player {
  id: number;
  name: string;
  role: Role;
  side: Side;
  isAlive: boolean;
  isUser: boolean;
  color: string;
  suspicion: number;
  isReady: boolean;
  isBot: boolean;
}

export interface GameMessage {
  id: string;
  sender?: string;
  text: string;
  type: 'info' | 'chat' | 'system' | 'night-report' | 'save' | 'scan';
}

export interface GameState {
  players: Player[];
  currentPhase: GamePhase;
  dayCount: number;
  messages: GameMessage[];
  nightActions: {
    mafiaTarget?: number;
    doctorTarget?: number;
    detectiveTarget?: number;
  };
  lastEliminatedId?: number;
  winner?: Side;
  isMultiplayer: boolean;
  lobbyCode?: string;
}

export interface DialogueItem {
  playerId: number;
  text: string;
}
