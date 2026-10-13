"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownProps = {
  target: string;
};

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  state: "before" | "today" | "after";
};

const DAY = 86_400_000;

function getRemaining(target: string): Remaining {
  const targetDate = new Date(target);
  const now = new Date();
  const distance = targetDate.getTime() - now.getTime();
  const absolute = Math.abs(distance);
  const sameCalendarDay = targetDate.toDateString() === now.toDateString();

  return {
    days: Math.floor(absolute / DAY),
    hours: Math.floor((absolute % DAY) / 3_600_000),
    minutes: Math.floor((absolute % 3_600_000) / 60_000),
    seconds: Math.floor((absolute % 60_000) / 1_000),
    state: sameCalendarDay ? "today" : distance > 0 ? "before" : "after",
  };
}

export function Countdown({ target }: CountdownProps) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(target));
    tick();
    const interval = window.setInterval(tick, 1_000);
    return () => window.clearInterval(interval);
  }, [target]);

  const label = useMemo(() => {
    if (!remaining) return "Faltam";
    if (remaining.state === "today") return "É hoje! ♥";
    if (remaining.state === "after") return `Casados há ${remaining.days} dias ♥`;
    return "Faltam";
  }, [remaining]);

  if (remaining?.state === "today" || remaining?.state === "after") {
    return <p className="font-editorial text-4xl sm:text-5xl">{label}</p>;
  }

  const units = [
    [remaining?.days ?? "—", "dias"],
    [remaining?.hours ?? "—", "horas"],
    [remaining?.minutes ?? "—", "min"],
    [remaining?.seconds ?? "—", "seg"],
  ] as const;

  return (
    <div aria-live="polite">
      <p className="eyebrow text-center">{label}</p>
      <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-4">
        {units.map(([value, unit]) => (
          <div key={unit} className="text-center">
            <strong className="font-editorial block text-3xl font-normal sm:text-5xl">{value}</strong>
            <span className="mt-1 block text-[0.65rem] tracking-[0.15em] text-muted uppercase sm:text-xs">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
