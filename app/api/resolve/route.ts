import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateHugoScore } from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const { courseId, actualTime } = await req.json();

    // 1. Validation de l'entrée (Format HH:mm)
    if (!courseId || !actualTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(actualTime)) {
      return NextResponse.json({ error: "Données de temps invalides" }, { status: 400 });
    }

    // 2. Récupération du dossier et des rapports (paris)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { bets: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Dossier d'enquête introuvable" }, { status: 404 });
    }

    if (course.status === "FINISHED") {
      return NextResponse.json({ error: "Cette enquête est déjà classée et archivée" }, { status: 400 });
    }

    // 3. Calcul du temps réel en minutes pour le verdict
    const [actualH, actualM] = actualTime.split(":").map(Number);
    const actualMinutes = actualH * 60 + actualM;

    // 4. Préparation de la transaction globale
    // On crée une liste d'opérations : mises à jour des paris + mises à jour des portefeuilles
    const betUpdates = course.bets.flatMap((bet) => {
      const guessedDate = new Date(bet.guessedTime);
      const guessedMinutes = guessedDate.getHours() * 60 + guessedDate.getMinutes();

      // Récupération du score de précision (entre 0 et 1000)
      const baseScore = calculateHugoScore(actualMinutes, guessedMinutes);

      // Calcul des gains proportionnels à la mise (bet.amount)
      // 1000 points = 10x la mise | 100 points = 1x la mise
      const gainsReels = Math.round((baseScore / 100) * bet.amount);

      return [
        prisma.bet.update({
          where: { id: bet.id },
          data: { pointsEarned: gainsReels },
        }),
        prisma.user.update({
          where: { id: bet.userId },
          data: { walletBalance: { increment: gainsReels } },
        }),
      ];
    });

    // 5. Exécution de la transaction finale : Tout ou rien
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
    return NextResponse.json({ error: "Échec de la distribution des Shekels ₪" }, { status: 500 });
  }
}