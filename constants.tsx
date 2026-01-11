
import { Role, Side } from './types';

export const PLAYER_NAMES = [
  "Shadow", "Viper", "Neon", "Cipher", "Ghost", "Rogue", "Echo"
];

export const ROLE_COLORS = {
  [Role.Villager]: 'text-blue-400',
  [Role.Mafia]: 'text-red-500',
  [Role.Detective]: 'text-blue-600',
  [Role.Doctor]: 'text-emerald-500',
};

export const INITIAL_ROLES: Role[] = [
  Role.Mafia, Role.Mafia,
  Role.Detective,
  Role.Doctor,
  Role.Villager, Role.Villager, Role.Villager
];

export const getSideByRole = (role: Role): Side => {
  return role === Role.Mafia ? Side.Mafia : Side.Town;
};
