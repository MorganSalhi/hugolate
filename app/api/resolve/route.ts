import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateHugoScore, timeToMinutes } from "@/lib/scoring";

export async function POST(req: Request) {
  const { courseId, actualTime } = await req.json();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { bets: true },
  });

  if (!course) return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });

  const [actualH, actualM] = actualTime.split(":").map(Number);
  const actualMinutes = actualH * 60 + actualM;

  // Distribution des gains
  const updates = course.bets.map(async (bet) => {
    const guessedDate = new Date(bet.guessedTime);
    const guessedMinutes = guessedDate.getHours() * 60 + guessedDate.getMinutes();
    
    // Utilisation de notre algo exponentiel
    const pointsGagnes = calculateHugoScore(actualMinutes, guessedMinutes);

    return prisma.$transaction([
      prisma.bet.update({
        where: { id: bet.id },
        data: { pointsEarned: pointsGagnes },
      }),
      prisma.user.update({
        where: { id: bet.userId },
        data: { walletBalance: { increment: pointsGagnes } },
      }),
    ]);
  });

  await Promise.all(updates);
  
  await prisma.course.update({
    where: { id: courseId },
    data: { status: "FINISHED" },
  });

  return NextResponse.json({ success: true });
}