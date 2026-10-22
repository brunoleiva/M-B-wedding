"use client";

import { useState } from "react";

type Faq = { id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: Faq[] }) {
  const [opened, setOpened] = useState<string | null>(null);
  return <div className="space-y-3">{items.map(item => {
    const active = opened === item.id;
    const answerId = `faq-answer-${item.id}`;
    return <article key={item.id} className={`overflow-hidden rounded-2xl border transition-colors ${active ? "border-brand/40 bg-surface shadow-sm" : "border-line bg-surface"}`}>
      <h3>
        <button type="button" aria-expanded={active} aria-controls={answerId}
          onClick={() => setOpened(active ? null : item.id)}
          className="focus-ring flex w-full min-h-16 items-center justify-between gap-5 px-5 py-5 text-left text-base font-semibold text-foreground sm:px-7">
          <span>{item.question}</span>
          <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-2xl transition-transform ${active ? "rotate-45 bg-brand text-white" : "bg-background"}`}>+</span>
        </button>
      </h3>
      {active && <div id={answerId} className="border-t border-line px-5 pb-6 pt-4 leading-7 text-muted sm:px-7"><p className="whitespace-pre-line break-words">{item.answer}</p></div>}
    </article>;
  })}</div>;
}
