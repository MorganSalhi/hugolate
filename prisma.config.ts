// prisma.config.ts
import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";

// On force le chargement du fichier .env à la racine
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // On utilise process.env car dotenv l'a maintenant rempli
    url: process.env.DATABASE_URL,
  },
});