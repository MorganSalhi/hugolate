import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    // CAS 1 : L'Admin demande tous les dossiers ouverts pour clôture (?all=true)
    if (all) {
      const openCourses = await prisma.course.findMany({
        where: { status: "OPEN" },
        orderBy: { scheduledStartTime: "desc" },
      });
      return NextResponse.json(openCourses);
    }

    // CAS 2 : Le Lobby demande le cours actif le plus récent pour parier
    const liveCourse = await prisma.course.findFirst({
      where: { status: "OPEN" },
      orderBy: { scheduledStartTime: "desc" },
    });

    if (!liveCourse) {
      return NextResponse.json({ message: "Aucun cours actif" }, { status: 404 });
    }

    return NextResponse.json(liveCourse);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur lors de la récupération" }, { status: 500 });
  }
}