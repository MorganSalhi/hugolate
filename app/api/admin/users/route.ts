import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET : Liste tous les agents
export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(users);
}

// POST : Créer un nouvel agent
export async function POST(req: Request) {
  try {
    const { name, email, initialBalance, password, role } = await req.json();

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password || "hugo123", 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        walletBalance: Number(initialBalance) || 1000,
        password: hashedPassword,
        // On ajoute le rôle ici, sinon il sera "USER" par défaut
        role: role || "USER", 
      },
    });
    
    // Prisma génère automatiquement l'ID (cuid) car nous ne le passons pas dans 'data'
    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error("Erreur création utilisateur:", error);
    // Gestion spécifique si l'email existe déjà
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur de création" }, { status: 400 });
  }
}

// PATCH : Injecter de l'argent
export async function PATCH(req: Request) {
  try {
    const { userId, amount } = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: Number(amount) } },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de créditer l'agent" }, { status: 500 });
  }
}