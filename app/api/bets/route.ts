import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET : Récupérer les infos de l'utilisateur (Solde, Grade)
export async function GET() {
  try {
    // On récupère ou crée l'utilisateur de test
    let user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Inspecteur Test",
          email: "test@hugolate.com",
          walletBalance: 1000,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 });
  }
}

// 2. POST : Enregistrer un nouveau pari
export async function POST(req: Request) {
  try {
    const { courseId, time, amount } = await req.json();

    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    // Vérification : L'agent a-t-il assez de Shekels ?
    if (user.walletBalance < amount) {
      return NextResponse.json({ error: "Solde insuffisant pour cette mise !" }, { status: 400 });
    }

    const [hours, minutes] = time.split(":").map(Number);
    const guessedDate = new Date();
    guessedDate.setHours(hours, minutes, 0, 0);

    const result = await prisma.$transaction([
      prisma.bet.create({
        data: {
          userId: user.id,
          courseId: courseId,
          guessedTime: guessedDate,
          amount: amount, // On enregistre la mise réelle
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: amount } }, // On déduit la mise réelle
      }),
    ]);

    return NextResponse.json({ success: true, newBalance: result[1].walletBalance });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Rapport déjà transmis pour ce cours." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}