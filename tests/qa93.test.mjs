import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";

const read = (path) => readFileSync(join(process.cwd(), path), "utf8");
const migration = read("supabase/migrations/202610190018_soft_delete_and_rsvp.sql");
const tables = ["story_events", "gallery_images", "venues", "schedule_events", "special_people", "faqs", "recommended_hotels"];

test("migration 018 adds logical deletion to every editorial table", () => {
  for (const table of tables) {
    assert.match(migration, new RegExp(`ALTER TABLE public\.${table} ADD COLUMN IF NOT EXISTS deleted_at`, "i"), table);
  }
});

test("public policies exclude deleted editorial rows", () => {
  const names = ["public reads story", "public reads venues", "public reads schedule", "public reads gallery images", "public reads special people", "public reads faqs", "published hotels"];
  for (const name of names) {
    const start = migration.indexOf(`CREATE POLICY "${name}"`);
    assert.notEqual(start, -1, `missing ${name}`);
    const segment = migration.slice(start, migration.indexOf(";", start) + 1);
    assert.match(segment, /deleted_at IS NULL/i, name);
  }
});

test("public and admin readers filter deleted records", () => {
  const paths = [
    "src/services/wedding/content.ts", "src/services/wedding/event-details.ts",
    "src/services/wedding/guest-information.ts", "src/services/wedding/public.ts",
    "src/app/admin/(protected)/galeria/page.tsx", "src/app/admin/(protected)/conteudo/page.tsx"
  ];
  for (const path of paths) assert.match(read(path), /\.is\("deleted_at",\s*null\)/, path);
});

test("deletion handlers preserve database records", () => {
  const paths = [
    "src/app/admin/(protected)/galeria/actions.ts", "src/app/admin/(protected)/conteudo/actions.ts",
    "src/app/admin/(protected)/casamento/actions.ts", "src/app/admin/(protected)/informacoes/actions.ts"
  ];
  for (const path of paths) {
    const src = read(path);
    assert.doesNotMatch(src, /\.delete\(\)/, `physical delete in ${path}`);
    assert.match(src, /deleted_at:new Date\(\)\.toISOString\(\)/, path);
  }
});

test("RSVP CSV requires admin and forbids caching", () => {
  const src = read("src/app/admin/(protected)/rsvp/exportar/route.ts");
  assert.match(src, /if \(!admin\) return new Response/);
  assert.match(src, /private, no-store/);
  assert.match(src, /csvCell/);
});
