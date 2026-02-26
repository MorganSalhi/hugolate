// app/api/courses/live/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const course = await prisma.course.findFirst({
      where: { status: "OPEN" },
      orderBy: { scheduledStartTime: "asc" },
      include: {
        bets: {
          select: { guessedTime: true } // On ne récupère que les heures
        }
      }
    });

    if (!course) return NextResponse.json(null);

    // CALCUL DE LA MOYENNE
    let averageTime = null;
    if (course.bets.length > 0) {
      const totalMinutes = course.bets.reduce((acc, bet) => {
        const d = new Date(bet.guessedTime);
        return acc + (d.getHours() * 60 + d.getMinutes());
      }, 0);
      
      const avgMinutes = Math.round(totalMinutes / course.bets.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      averageTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return NextResponse.json({
      ...course,
      averageEstimate: averageTime // On envoie la moyenne à l'interface
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}