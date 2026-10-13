import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="font-editorial mt-3 text-5xl">Essa página não faz parte da nossa história.</h1>
        <Link href="/" className="focus-ring mt-7 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white">Voltar para o início</Link>
      </div>
    </main>
  );
}
