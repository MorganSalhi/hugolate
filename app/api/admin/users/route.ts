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
    const { name, email, initialBalance, password } = await req.json();

    // Hachage du mot de passe (sécurité standard)
    const hashedPassword = await bcrypt.hash(password || "hugo123", 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        walletBalance: initialBalance,
        password: hashedPassword
      },
    });
    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de création" }, { status: 400 });
  }
}

// PATCH : Injecter de l'argent (Injection de Shekels)
export async function PATCH(req: Request) {
  try {
    const { userId, amount } = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de créditer l'agent" }, { status: 500 });
  }
}