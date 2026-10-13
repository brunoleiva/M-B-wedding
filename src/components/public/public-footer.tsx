import Link from "next/link";
import type { PublicWedding } from "@/services/wedding/public";

export function PublicFooter({ wedding }: { wedding: PublicWedding }) {
  return (
    <footer className="border-t border-line bg-[#efe7dc] py-14">
      <div className="page-shell flex flex-col items-center justify-between gap-7 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-editorial text-3xl">
            {wedding.firstName} & {wedding.secondName}
          </p>
          <p className="mt-2 text-sm text-muted">{wedding.displayDate} · Feito com amor ♥</p>
        </div>
        <div className="flex gap-5 text-sm text-muted">
          <Link href="/rsvp" className="focus-ring rounded hover:text-foreground">RSVP</Link>
          <Link href="/presentes" className="focus-ring rounded hover:text-foreground">Presentes</Link>
          <Link href="/informacoes" className="focus-ring rounded hover:text-foreground">Informações</Link>
        </div>
      </div>
    </footer>
  );
}
