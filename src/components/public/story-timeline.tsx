import type { StoryEvent } from "@/config/wedding";

export function StoryTimeline({ events }: { events: StoryEvent[] }) {
  return (
    <div className="relative mt-14 border-l border-line pl-8 sm:ml-8 sm:pl-12">
      {events.map((event, index) => (
        <article key={`${event.year}-${event.title}`} className="relative pb-12 last:pb-0">
          <span className="absolute -left-[2.45rem] top-1 size-3 rounded-full bg-brand ring-8 ring-background sm:-left-[3.45rem]" />
          <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{event.year}</p>
          <h3 className="font-editorial mt-2 text-3xl">{event.title}</h3>
          <p className="mt-3 max-w-2xl leading-7 text-muted">{event.description}</p>
          {index === 0 ? <span className="mt-5 inline-block text-2xl text-brand/45">↘</span> : null}
        </article>
      ))}
    </div>
  );
}
