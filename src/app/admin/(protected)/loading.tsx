export default function AdminLoading() {
  return <div role="status" aria-live="polite" className="mx-auto max-w-5xl space-y-5 animate-pulse">
    <div className="h-4 w-28 rounded bg-black/10" />
    <div className="h-10 w-72 max-w-full rounded bg-black/10" />
    <div className="h-48 rounded-2xl border border-line bg-surface" />
    <span className="sr-only">Carregando o painel...</span>
  </div>;
}
