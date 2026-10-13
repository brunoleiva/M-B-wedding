import { z } from "zod";
export const weddingSettingsSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  secondName: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(120),
  date: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  timezone: z.string().trim().min(3).max(80),
  heroMessage: z.string().trim().min(10).max(400),
  venueName: z.string().trim().max(160),
  venueAddress: z.string().trim().max(400),
  venueDescription: z.string().trim().max(1000),
}).refine(v => (!v.venueName && !v.venueAddress && !v.venueDescription) || (v.venueName.length >= 2 && v.venueAddress.length >= 5), { message: "Preencha nome e endereço do local, ou deixe todos os campos do local vazios.", path: ["venueName"] });
