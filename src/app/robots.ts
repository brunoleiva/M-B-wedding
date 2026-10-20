import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const preview = process.env.VERCEL_ENV === "preview";
  return {
    rules: [
      { userAgent: "*", ...(preview ? { disallow: "/" } : { allow: "/", disallow: ["/admin/", "/convite/", "/presentes/pedido/"] }) },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
