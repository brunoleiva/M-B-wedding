import { z } from "zod";

const requiredText = (label: string, max: number) => z.string().trim().min(1, `${label} é obrigatório.`).max(max, `${label} excede ${max} caracteres.`);
const optionalText = (max: number) => z.string().trim().max(max, `Limite de ${max} caracteres.`);

export const weddingSettingsSchema = z.object({
  firstName: requiredText("Primeiro nome", 80),
  secondName: requiredText("Segundo nome", 80),
  city: requiredText("Cidade", 120),
  date: z.iso.date({ error: "Informe uma data válida." }),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido."),
  timezone: requiredText("Fuso horário", 80).refine(value => {
    try { new Intl.DateTimeFormat("pt-BR", { timeZone: value }); return true; }
    catch { return false; }
  }, "Informe um fuso horário IANA válido."),
  heroMessage: optionalText(400),
  venueName: optionalText(160),
  venueAddress: optionalText(400),
  venueDescription: optionalText(1000),
});

export type WeddingSettingsValues = z.infer<typeof weddingSettingsSchema>;
export const weddingSettingsKeys = ["firstName", "secondName", "city", "date", "time", "timezone", "heroMessage", "venueName", "venueAddress", "venueDescription"] as const;

export const weddingSettingsLabels: Record<(typeof weddingSettingsKeys)[number], string> = {
  firstName: "Primeiro nome", secondName: "Segundo nome", city: "Cidade",
  date: "Data", time: "Horário", timezone: "Fuso horário",
  heroMessage: "Mensagem principal", venueName: "Nome do local",
  venueAddress: "Endereço do local", venueDescription: "Descrição do local",
};
