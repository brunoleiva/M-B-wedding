import { getAdminContext } from "@/services/admin/dashboard";
import { loadGuests } from "@/services/rsvp/admin";
import { kindLabel, statusLabel } from "@/services/rsvp/types";

export const dynamic = "force-dynamic";

function cell(value: unknown) {
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+\-@]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) return new Response("Nao autorizado", {status:401});
  let rows: string[][];
  try {
    const {groups,guests} = await loadGuests(admin.weddingId);
    const names = new Map(groups.map(g=>[g.id,g.display_name]));
    rows = guests.filter(g=>names.has(g.guest_group_id)).map(g=>[
      g.full_name, names.get(g.guest_group_id) ?? "", kindLabel(g.kind),
      statusLabel(g.rsvp_status), g.responded_at ?? "", g.guest_note ?? ""
    ]);
  } catch {
    return new Response("Nao foi possivel gerar o relatorio", {status:500});
  }
  const header = ["Convidado","Familia","Tipo","Presenca","Data da resposta","Observacoes"];
  const content = "\uFEFF" + [header,...rows].map(row=>row.map(cell).join(";")).join("\r\n") + "\r\n";
  return new Response(content, {
    headers: {
      "Content-Type":"text/csv; charset=utf-8",
      "Content-Disposition":"attachment; filename=relatorio-rsvp.csv",
      "Cache-Control":"private, no-store"
    }
  });
}
