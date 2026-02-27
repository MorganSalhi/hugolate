// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, initialBalance, password, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password || "hugo123", 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        walletBalance: Number(initialBalance) || 1000, // Conversion forcée en nombre
        password: hashedPassword,
        role: role || "USER", // Utilise le nouveau champ
      },
    });
    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error("Erreur Prisma:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}