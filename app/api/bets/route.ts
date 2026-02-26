import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET : Récupérer les infos de l'agent connecté (Solde, Grade)
export async function GET() {
  try {
    const session = await getServerSession();

    // Vérification de la session
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération de l'utilisateur précis via son email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 });
  }
}

// 2. POST : Enregistrer un nouveau pari pour l'agent connecté
export async function POST(req: Request) {
  const session = await getServerSession();

  // Sécurité : Seuls les agents connectés peuvent parier
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Accès refusé. Identifiez-vous." }, { status: 401 });
  }

  try {
    const { courseId, time, amount } = await req.json();

    // Identification de l'agent dans la base de données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }

    // Vérification : L'agent a-t-il assez de Shekels ?
    if (user.walletBalance < amount) {
      return NextResponse.json({ error: "Solde insuffisant pour cette mise !" }, { status: 400 });
    }

    const [hours, minutes] = time.split(":").map(Number);
    const guessedDate = new Date();
    guessedDate.setHours(hours, minutes, 0, 0);

    // Transaction atomique : Création du pari et déduction du solde
    const result = await prisma.$transaction([
      prisma.bet.create({
        data: {
          userId: user.id,
          courseId: courseId,
          guessedTime: guessedDate,
          amount: amount, 
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: amount } }, 
      }),
    ]);

    return NextResponse.json({ success: true, newBalance: result[1].walletBalance });
  } catch (error: any) {
    // Gestion des erreurs Prisma (ex: pari unique par cours)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Rapport déjà transmis pour ce cours." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur lors de l'enregistrement du pari" }, { status: 500 });
  }
}