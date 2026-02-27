// app/api/activity/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.bet.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        course: { select: { subject: true } }
      }
    });

    // On formate les données pour le flux en typant 'bet'
    const formattedActivity = activities.map((bet: any) => ({
      id: bet.id,
      user: bet.user?.name || "Anonyme",
      subject: bet.course?.subject || "Sujet inconnu",
      amount: bet.amount,
      type: bet.pointsEarned && bet.pointsEarned > 0 ? "WIN" : "BET",
      time: bet.createdAt
    }));

    return NextResponse.json(formattedActivity);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de flux" }, { status: 500 });
  }
}