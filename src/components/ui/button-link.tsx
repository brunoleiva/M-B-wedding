import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const base =
    "focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold cursor-pointer transition duration-200 ease-out active:scale-[0.97]";
  const style =
    variant === "primary"
      ? "bg-brand text-[var(--button-text)] shadow-lg shadow-black/10 hover:bg-[var(--button-hover)] hover:-translate-y-0.5 hover:shadow-xl"
      : "border border-white/50 bg-white/10 text-white backdrop-blur-md hover:bg-white/20";

  return (
    <Link href={href} className={`${base} ${style} ${className}`}>
      {children}
    </Link>
  );
}
