import Link from "next/link";
import { loginAction } from "@/app/admin/actions";

const messages: Record<string, string> = {
  invalid_fields: "Confira o e-mail e a senha.",
  invalid_credentials: "Não foi possível entrar com essas credenciais.",
  supabase_not_configured: "Configure as variáveis do Supabase antes de entrar.",
  unauthorized: "Seu usuário não possui acesso administrativo a este casamento.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#eee8df] p-5">
      <section className="w-full max-w-md rounded-[2rem] border border-line bg-surface p-7 shadow-[var(--shadow-soft)] sm:p-9">
        <Link href="/" className="font-editorial inline-grid size-14 place-items-center rounded-full border border-line text-lg">M & B</Link>
        <p className="eyebrow mt-8">Área privada</p>
        <h1 className="font-editorial mt-2 text-4xl">Painel dos noivos</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Entre com uma conta cadastrada no Supabase Auth e vinculada como administradora do casamento.</p>

        {error ? <div className="mt-6 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{messages[error] ?? "Não foi possível entrar."}</div> : null}

        <form action={loginAction} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold">
            E-mail
            <input name="email" type="email" autoComplete="email" required className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-line bg-background px-4 font-normal" />
          </label>
          <label className="block text-sm font-semibold">
            Senha
            <input name="password" type="password" autoComplete="current-password" minLength={8} required className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-line bg-background px-4 font-normal" />
          </label>
          <button className="focus-ring min-h-12 w-full rounded-full bg-foreground px-6 text-sm font-bold text-white transition hover:bg-brand-strong">Entrar no painel</button>
        </form>
      </section>
    </main>
  );
}
