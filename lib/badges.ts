import { prisma } from "./prisma";

export const BADGE_DEFINITIONS: Record<string, { label: string, icon: string, description: string, color: string }> = {
FIRST_BET: { 
    label: "Première Bavure", 
    description: "Premier rapport d'enquête déposé sur le bureau du commissaire.", 
    icon: "Flag", 
    color: "text-blue-400" 
  },
  SNIPER: { 
    label: "Tireur de LBD", 
    description: "Précision chirurgicale : 1000 points. Hugo ne vous échappe pas.", 
    icon: "Target", 
    color: "text-red-500" 
  },
  BIG_WINNER: { 
    label: "Corruption au Sommet", 
    description: "Pari de 5000₪ réussi. Vous avez détourné le fonds de saisie.", 
    icon: "Banknote", 
    color: "text-emerald-400" 
  },
  HOT_STREAK: { 
    label: "Matraque d'Or", 
    description: "10 victoires consécutives. Vous êtes l'idole du commissariat.", 
    icon: "Flame", 
    color: "text-orange-500" 
  },
  VETERAN: { 
    label: "Placardisé", 
    description: "50 missions effectuées. Vous connaissez tous les kebabs du secteur.", 
    icon: "ShieldCheck", 
    color: "text-indigo-400" 
  },
  MILLIONAIRE: { 
    label: "Préfet de Police", 
    description: "Solde de 1 000 000 ₪. Vous possédez la ville.", 
    icon: "Gem", 
    color: "text-amber-400" 
  }
};

export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      badges: true,
      bets: { include: { course: true } },
      _count: { select: { bets: true } }
    }
  });

  if (!user) return;

  const currentBadgeTypes = user.badges.map(b => b.type);
  const newBadges: string[] = [];

  // 1. Recrue (Premier pari fini)
  if (!currentBadgeTypes.includes("FIRST_BET") && user.bets.some(b => b.course.status === "FINISHED")) {
    newBadges.push("FIRST_BET");
  }

  // 2. Gros Bonnet (Pari >= 5000 réussi avec profit)
  if (!currentBadgeTypes.includes("BIG_WINNER") && user.bets.some(b => b.amount >= 5000 && (b.pointsEarned ?? 0) > b.amount)) {
    newBadges.push("BIG_WINNER");
  }

  // 3. Vétéran (50 missions)
  if (!currentBadgeTypes.includes("VETERAN") && user._count.bets >= 50) {
    newBadges.push("VETERAN");
  }

  // 4. Millionnaire
  if (!currentBadgeTypes.includes("MILLIONAIRE") && user.walletBalance >= 1000000) {
    newBadges.push("MILLIONAIRE");
  }

  // 5. Hot Streak
  if (!currentBadgeTypes.includes("HOT_STREAK") && user.currentStreak >= 10) {
    newBadges.push("HOT_STREAK");
  }

  if (newBadges.length > 0) {
    await prisma.badge.createMany({
      data: newBadges.map(type => ({ userId, type }))
    });
  }
}