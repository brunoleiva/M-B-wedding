import Image from "next/image";
import type { PublicWedding } from "@/services/wedding/public";
import { ButtonLink } from "@/components/ui/button-link";

export function HeroSection({ wedding }: { wedding: PublicWedding }) {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-[#322a24] text-white sm:min-h-screen">
      <Image
        src="/images/home-banner-proposal-right.png"
        alt="Pedido de casamento em um jardim, com os noivos sob estruturas brancas"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[82%_62%] opacity-85 sm:object-[75%_68%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,17,13,.76)_0%,rgba(22,17,13,.42)_33%,rgba(22,17,13,.08)_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(25,20,16,.15)_0%,rgba(25,20,16,.12)_45%,rgba(25,20,16,.7)_100%)]" />
      <div className="page-shell relative z-10 flex min-h-[760px] items-end pb-16 pt-32 sm:min-h-screen sm:pb-20">
        <div className="max-w-4xl lg:max-w-[670px]">
          <p className="mb-5 text-xs font-semibold tracking-[0.28em] text-white/75 uppercase">{"O nosso grande dia"}</p>
          <h1 className="font-editorial text-[clamp(4.2rem,12vw,9.5rem)] leading-[0.78] tracking-[-0.055em]">
            {wedding.firstName}
            <span className="block pl-[16%] italic">& {wedding.secondName}</span>
          </h1>
          <div className="mt-10 flex flex-col gap-6 border-t border-white/30 pt-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-base tracking-[0.16em] uppercase">{wedding.displayDate}</p>
              <p className="mt-2 text-sm text-white/75">{wedding.city}</p>
            </div>
            <div className="max-w-md sm:text-right">
              <p className="text-base leading-7 text-white/85">{wedding.heroMessage}</p>
              <div className="mt-5 flex flex-wrap gap-3 sm:justify-end">
                <ButtonLink href="/rsvp">Confirmar presença</ButtonLink>
                <ButtonLink href="/presentes" variant="secondary">Lista de presentes</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
