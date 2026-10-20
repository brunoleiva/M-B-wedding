import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("convites e pedidos Pix sao impedidos de indexacao", () => {
  const config = read("next.config.ts");
  for (const path of ["/convite/:path*", "/presentes/pedido/:path*"]) {
    assert.ok(config.includes(path), path);
  }
  assert.match(config, /noindex, nofollow, noarchive/);
  assert.match(read("src/app/(public)/presentes/pedido/[token]/page.tsx"), /robots:\s*\{\s*index:\s*false/);
});

test("links privados nao enviam referer e usam no-store", () => {
  const config = read("next.config.ts");
  assert.match(config, /Referrer-Policy[^\n]*value: "no-referrer"/);
  assert.match(config, /Cache-Control[^\n]*value: "private, no-store"/);
});

test("sitemap nao divulga convites e pedidos", () => {
  const map = read("src/app/sitemap.ts");
  assert.doesNotMatch(map, /\/convite\/|\/presentes\/pedido\//);
  assert.match(map, /\/fotos/);
  assert.match(map, /\/padrinhos/);
});

test("ambientes preview nao sao rastreados", () => {
  const robots = read("src/app/robots.ts");
  assert.match(robots, /VERCEL_ENV === "preview"/);
  assert.match(robots, /disallow: "\/"/);
});
