// lib/scoring.ts
export const BASE_POINTS = 1000;
const K_DECAY = 0.32188; // Décroissance : 1000 * e^(-k*5) ≈ 200 points à 5 min d'erreur

/**
 * Calcule les points selon l'écart en minutes.
 * Formule : P = 1000 * e^(-0.32188 * |diff|)
 */
export function calculateHugoScore(targetMinutes: number, actualMinutes: number): number {
  const diff = Math.abs(targetMinutes - actualMinutes);
  
  if (diff === 0) return BASE_POINTS; // Score parfait
  
  const score = BASE_POINTS * Math.exp(-K_DECAY * diff);
  
  // Si le score est ridicule (trop loin), on renvoie 0
  return score < 5 ? 0 : Math.round(score);
}

export function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}