import { getAdminContext, getDashboardStats } from "@/services/admin/dashboard";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function AdminDashboardPage() {
  const context = await getAdminContext();
  if (!context) return null;
  const stats = await getDashboardStats(context.weddingId);

  const cards = [
    ["Convidados", stats.guests.toLocaleString("pt-BR")],
    ["Confirmados", stats.attending.toLocaleString("pt-BR")],
    ["Pendentes", stats.pending.toLocaleString("pt-BR")],
    ["Presentes recebidos", formatMoney(stats.giftsReceived)],
    ["Recados pendentes", stats.pendingMessages.toLocaleString("pt-BR")],
    ["Sugestões de música", stats.songSuggestions.toLocaleString("pt-BR")],
  ];

  return (
    <div>
      <p className="eyebrow">Visão geral</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Indicadores lidos diretamente do Supabase.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-line bg-surface p-6">
            <p className="text-xs font-bold tracking-[0.12em] text-muted uppercase">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-bold">Fundação pronta</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">As próximas telas administrativas entram por módulo. Consultas ficam em services, validação em validation e regras de acesso continuam protegidas no servidor e no RLS.</p>
      </section>
    </div>
  );
}
