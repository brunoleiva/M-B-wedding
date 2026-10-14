import { addGuestsInBulk } from "@/app/admin/(protected)/convidados/familias/bulk-actions";

export function BulkGuestEntry({ groupId }: { groupId: string }) {
  return (
    <section className="card-soft space-y-4 p-5 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold">Adicionar vários convidados</h2>
        <p className="mt-2 text-sm text-muted">Digite um nome por linha. Todos serão adicionados a esta família e ficarão aguardando confirmação. Até 50 nomes por envio.</p>
      </div>
      <form action={addGuestsInBulk} className="space-y-4">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block font-semibold">Nomes dos convidados
          <textarea name="names" required rows={8} maxLength={10000} className="guest-input min-h-48" placeholder={"João Silva\nMaria Silva\nPedro Silva"} />
        </label>
        <label className="block font-semibold">Tipo de convidado
          <select name="kind" defaultValue="adult" className="guest-input">
            <option value="adult">Adultos</option>
            <option value="child">Crianças</option>
          </select>
        </label>
        <button type="submit" className="admin-btn admin-btn--primary">Cadastrar todos nesta família</button>
      </form>
    </section>
  );
}
