// lib/ranks.ts
import { Search, Coffee, Shield, ShieldCheck, BadgeCheck, ShieldAlert, Star, ChevronUp, Siren } from "lucide-react";

export const POLICE_RANKS = [
  { min: 0, label: "Stagiaire Kébab", icon: Search, color: "text-slate-400", border: "border-slate-800" },
  { min: 1000, label: "Patrouilleur de Boulangerie", icon: Coffee, color: "text-blue-400", border: "border-blue-900/30" },
  { min: 2500, label: "Expert en GAV", icon: Shield, color: "text-blue-500", border: "border-blue-700/30" },
  { min: 5000, label: "Spécialiste de la Bavure", icon: ShieldCheck, color: "text-indigo-400", border: "border-indigo-800/30" },
  { min: 7500, label: "Commandant de l'IGPN", icon: BadgeCheck, color: "text-indigo-500", border: "border-indigo-600/30" },
  { min: 10000, label: "Vétéran de la Matraque", icon: ShieldAlert, color: "text-purple-400", border: "border-purple-800/30" },
  { min: 15000, label: "Commissaire de la Détente", icon: Star, color: "text-amber-400", border: "border-amber-800/30" },
  { min: 25000, label: "Divisionnaire des Heures Supp'", icon: ChevronUp, color: "text-amber-500", border: "border-amber-600/30" },
  { min: 50000, label: "Préfet de l'Indiscipline", icon: Siren, color: "text-red-500", border: "border-red-900/50" },
];

export function getPoliceRank(balance: number) {
  return [...POLICE_RANKS].reverse().find(rank => balance >= rank.min) || POLICE_RANKS[0];
}

export function getRankProgress(balance: number) {
    const currentRank = getPoliceRank(balance);
    const currentIndex = POLICE_RANKS.findIndex(r => r.label === currentRank.label);
    const nextRank = POLICE_RANKS[currentIndex + 1];
    if (!nextRank) return { isMax: true, needed: 0, percentage: 100 };
    const needed = nextRank.min - balance;
    const range = nextRank.min - currentRank.min;
    const progress = ((balance - currentRank.min) / range) * 100;
    return { isMax: false, needed, percentage: Math.min(progress, 100), nextLabel: nextRank.label, nextMin: nextRank.min };
}