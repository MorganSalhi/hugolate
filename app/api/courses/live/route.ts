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
          select: { guessedTime: true }
        }
      }
    });

    if (!course) return NextResponse.json(null);

    // Correction : On indique explicitement que la variable peut être string ou null
    let averageTime: string | null = null;

    if (course.bets.length > 0) {
      // Ajout du type :any pour éviter l'erreur de type implicite rencontrée précédemment sur Vercel
      const totalMinutes = course.bets.reduce((acc: number, bet: any) => {
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
      averageEstimate: averageTime
    });
  } catch (error) {
    console.error("Erreur API Live Course:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}