import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { courseId, time } = await req.json();

    // 1. On récupère le premier utilisateur (Toi) pour le test
    let user = await prisma.user.findFirst();
    
    // Si aucun utilisateur n'existe, on en crée un pour le test
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Inspecteur Test",
          email: "test@hugolate.com",
          walletBalance: 1000,
        },
      });
    }

    // 2. Vérification du solde (100 ₪ la mise)
    if (user.walletBalance < 100) {
      return NextResponse.json({ error: "Fonds insuffisants en Shekels !" }, { status: 400 });
    }

    // 3. Conversion de l'heure string "08:45" en Date
    const [hours, minutes] = time.split(":").map(Number);
    const guessedDate = new Date();
    guessedDate.setHours(hours, minutes, 0, 0);

    // 4. Transaction : Enregistrer le pari ET déduire l'argent
    const result = await prisma.$transaction([
      prisma.bet.create({
        data: {
          userId: user.id,
          courseId: courseId,
          guessedTime: guessedDate,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: 100 } },
      }),
    ]);

    return NextResponse.json({ success: true, newBalance: result[1].walletBalance });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Tu as déjà parié sur ce cours, officier." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors du pari" }, { status: 500 });
  }
}