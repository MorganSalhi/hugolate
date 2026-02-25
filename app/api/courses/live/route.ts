import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { subject, professor, startTime } = await req.json();

    // On transforme "08:30" en un objet Date complet
    const [hours, minutes] = startTime.split(":").map(Number);
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);

    const newCourse = await prisma.course.create({
      data: {
        subject,
        professor,
        scheduledStartTime: scheduledDate,
        status: "OPEN",
      },
    });

    return NextResponse.json(newCourse);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création du cours" }, { status: 500 });
  }
}