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
    const betUpdates = course.bets.flatMap((bet) => {
      const guessedDate = new Date(bet.guessedTime);
      const guessedMinutes = guessedDate.getHours() * 60 + guessedDate.getMinutes();

      // Récupération du score de précision (entre 0 et 1000)
      const baseScore = calculateHugoScore(actualMinutes, guessedMinutes);

      // Calcul des gains de base
      const gainsReels = Math.round((baseScore / 100) * bet.amount);
      let gainsFinaux = gainsReels;

      // APPLICATION DES EFFETS DE L'ARSENAL
      if (bet.appliedItem === "WARRANT") {
        // Le Mandat d'Arrêt double les gains (ou les pertes)
        gainsFinaux = gainsReels * 2;
      } else if (bet.appliedItem === "VEST") {
        // Le Gilet Pare-Balles réduit la perte de 50% si le score est mauvais (< 1x la mise)
        if (gainsReels < bet.amount) {
          const perte = bet.amount - gainsReels;
          gainsFinaux = Math.round(gainsReels + (perte / 2));
        }
      }

      return [
        prisma.bet.update({
          where: { id: bet.id },
          // ON UTILISE BIEN gainsFinaux ICI
          data: { pointsEarned: gainsFinaux },
        }),
        prisma.user.update({
          where: { id: bet.userId },
          // ET ICI AUSSI POUR LE PORTEFEUILLE
          data: { walletBalance: { increment: gainsFinaux } },
        }),
      ];
    });

    // 5. Exécution de la transaction finale
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