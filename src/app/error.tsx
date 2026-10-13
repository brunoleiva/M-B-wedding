"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div className="max-w-lg">
        <p className="eyebrow">Algo saiu do roteiro</p>
        <h1 className="font-editorial mt-3 text-5xl">Não conseguimos carregar esta parte do site.</h1>
        <p className="mt-4 text-muted">Tente novamente. Nenhum detalhe técnico sensível é exibido aqui.</p>
        <button onClick={reset} className="focus-ring mt-7 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white">Tentar novamente</button>
      </div>
    </main>
  );
}
