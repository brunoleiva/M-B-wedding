type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export function SectionPlaceholder({ eyebrow, title, description, bullets }: SectionPlaceholderProps) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <p className="text-sm font-bold">Estrutura prevista neste módulo</p>
        <ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
          {bullets.map((bullet) => <li key={bullet} className="rounded-xl bg-background p-4">{bullet}</li>)}
        </ul>
      </div>
    </div>
  );
}
