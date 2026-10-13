type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionTitleProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-editorial mt-3 text-4xl leading-tight sm:text-5xl">{title}</h2>
      {description ? <p className="mt-5 text-base leading-7 text-muted sm:text-lg">{description}</p> : null}
    </div>
  );
}
