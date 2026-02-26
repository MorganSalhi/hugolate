// app/api/shop/buy/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SHOP_ITEMS, ItemType } from "@/lib/items";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { itemType } = await req.json();
    const item = SHOP_ITEMS[itemType as ItemType];

    if (!item) return NextResponse.json({ error: "Objet inconnu" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.walletBalance < item.price) {
      return NextResponse.json({ error: "Fonds insuffisants" }, { status: 400 });
    }

    // Transaction : On retire l'argent et on ajoute l'objet
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: item.price } },
      }),
      prisma.userItem.upsert({
        where: { userId_itemType: { userId: user.id, itemType } },
        update: { quantity: { increment: 1 } },
        create: { userId: user.id, itemType, quantity: 1 },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'achat" }, { status: 500 });
  }
}