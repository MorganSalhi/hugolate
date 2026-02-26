// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;

// DIAGNOSTIC : On affiche si l'URL est bien chargée
if (!url) {
  console.error("❌ ERREUR : La variable DATABASE_URL est vide !");
} else {
  console.log("✅ DATABASE_URL détectée (début) :", url.substring(0, 20) + "...");
}

const pool = new Pool({ 
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;