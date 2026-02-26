import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateHugoScore } from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const { courseId, actualTime } = await req.json();

    if (!courseId || !actualTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(actualTime)) {
      return NextResponse.json({ error: "Données de temps invalides" }, { status: 400 });
    }

    // 2. Récupération du dossier AVEC les infos utilisateurs pour les séries
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { 
        bets: {
          include: { user: true } // Indispensable pour connaître la série de l'agent
        } 
      },
    });

    if (!course) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    if (course.status === "FINISHED") return NextResponse.json({ error: "Enquête déjà classée" }, { status: 400 });

    const [actualH, actualM] = actualTime.split(":").map(Number);
    const actualMinutes = actualH * 60 + actualM;

    const betUpdates = course.bets.flatMap((bet) => {
      const guessedDate = new Date(bet.guessedTime);
      const guessedMinutes = guessedDate.getHours() * 60 + guessedDate.getMinutes();

      // A. Score de base
      const baseScore = calculateHugoScore(actualMinutes, guessedMinutes);
      
      // B. Calcul du Bonus de Série (Streak)
      let streakBonus = 1;
      const currentStreak = bet.user.currentStreak;
      
      if (currentStreak >= 10) streakBonus = 2.0;      // Élite : x2
      else if (currentStreak >= 5) streakBonus = 1.5;  // Confirmé : x1.5
      else if (currentStreak >= 3) streakBonus = 1.2;  // Régulier : x1.2

      // C. Calcul des gains avec série
      let gainsReels = Math.round((baseScore / 100) * bet.amount * streakBonus);
      let gainsFinaux = gainsReels;

      // D. Application de l'Arsenal (Items)
      if (bet.appliedItem === "WARRANT") {
        gainsFinaux = gainsReels * 2;
      } else if (bet.appliedItem === "VEST") {
        if (gainsReels < bet.amount) {
          const perte = bet.amount - gainsReels;
          gainsFinaux = Math.round(gainsReels + (perte / 2));
        }
      }

      // E. Mise à jour de la série pour la prochaine fois
      let nextStreak = currentStreak;
      if (baseScore >= 700) {
        nextStreak += 1;
      } else if (baseScore < 300) {
        nextStreak = 0; // La série est brisée !
      }

      // Vérification du record personnel
      const newBestStreak = nextStreak > bet.user.bestStreak ? nextStreak : bet.user.bestStreak;

      return [
        prisma.bet.update({
          where: { id: bet.id },
          data: { pointsEarned: gainsFinaux },
        }),
        prisma.user.update({
          where: { id: bet.userId },
          data: { 
            walletBalance: { increment: gainsFinaux },
            currentStreak: nextStreak,
            bestStreak: newBestStreak
          },
        }),
      ];
    });

    await prisma.$transaction([
      ...betUpdates,
      prisma.course.update({
        where: { id: courseId },
        data: {
          status: "FINISHED",
          actualArrivalTime: new Date(new Date().setHours(actualH, actualM, 0, 0))
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur de résolution:", error);
    return NextResponse.json({ error: "Échec du verdict" }, { status: 500 });
  }
}