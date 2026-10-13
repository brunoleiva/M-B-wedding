import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maysa & Bruno — 24.10.2027",
    template: "%s · Maysa & Bruno",
  },
  description: "Nosso casamento, nossa história e tudo o que você precisa para celebrar conosco.",
  openGraph: {
    title: "Maysa & Bruno — 24.10.2027",
    description: "Estamos contando os dias para celebrar esse momento com vocês.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
