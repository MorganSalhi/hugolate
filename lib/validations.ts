// lib/validations.ts
import { z } from "zod";

export const TimeInputSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Le format doit être HH:mm (ex: 08:45)",
  }),
});

export const CreateCourseSchema = z.object({
  subject: z.string().min(2, "Le nom de la matière est requis"),
  professor: z.string().min(2, "Le nom du professeur est requis"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Heure invalide"),
});