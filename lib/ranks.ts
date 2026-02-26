import { 
  Search, User, Shield, ShieldCheck, BadgeCheck, 
  ShieldAlert, Star, ChevronUp, Siren 
} from "lucide-react";

export const POLICE_RANKS = [
  { min: 0, label: "Adjoint de Sécurité", icon: Search, color: "text-slate-400", border: "border-slate-800" },
  { min: 1000, label: "Gardien de la Paix", icon: User, color: "text-blue-400", border: "border-blue-900/30" },
  { min: 2500, label: "Brigadier", icon: Shield, color: "text-blue-500", border: "border-blue-700/30" },
  { min: 5000, label: "Lieutenant", icon: ShieldCheck, color: "text-indigo-400", border: "border-indigo-800/30" },
  { min: 7500, label: "Capitaine", icon: BadgeCheck, color: "text-indigo-500", border: "border-indigo-600/30" },
  { min: 10000, label: "Commandant", icon: ShieldAlert, color: "text-purple-400", border: "border-purple-800/30" },
  { min: 15000, label: "Commissaire", icon: Star, color: "text-amber-400", border: "border-amber-800/30" },
  { min: 25000, label: "Commissaire Divisionnaire", icon: ChevronUp, color: "text-amber-500", border: "border-amber-600/30" },
  { min: 50000, label: "Directeur des Services Actifs", icon: Siren, color: "text-red-500", border: "border-red-900/50" },
];

export function getPoliceRank(balance: number) {
  return [...POLICE_RANKS].reverse().find(rank => balance >= rank.min) || POLICE_RANKS[0];
}

export function getRankProgress(balance: number) {
  const currentRank = getPoliceRank(balance);
  const currentRankIndex = POLICE_RANKS.findIndex(r => r.label === currentRank.label);
  const nextRank = POLICE_RANKS[currentRankIndex + 1];

  if (!nextRank) return { isMax: true, needed: 0, percentage: 100 };

  const currentRankMin = currentRank.min;
  const needed = nextRank.min - balance;
  const range = nextRank.min - currentRankMin;
  const progress = ((balance - currentRankMin) / range) * 100;

  return {
    isMax: false,
    needed,
    percentage: Math.min(Math.max(progress, 0), 100),
    nextLabel: nextRank.label,
    nextMin: nextRank.min
  };
}