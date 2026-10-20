import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const source = (path) => readFileSync(join(process.cwd(), path), 'utf8');
const checks = {
  invite: 'src/app/(public)/convite/[token]/actions.ts',
  invitePage: 'src/app/(public)/convite/[token]/page.tsx',
  rsvpCsv: 'src/app/admin/(protected)/rsvp/exportar/route.ts',
  guestCsv: 'src/app/admin/(protected)/convidados/exportar/route.ts',
  payments: 'src/app/admin/(protected)/presentes/pagamentos/actions.ts',
  pixCheckout: 'src/app/(public)/presentes/checkout-action.ts',
  paymentReport: 'src/app/admin/(protected)/presentes/pagamentos/exportar/route.ts',
  pagination: 'src/services/rsvp/admin.ts',
  finance: 'src/services/gifts/financial-admin.ts',
  image: 'src/app/admin/(protected)/galeria/actions.ts',
  csv: 'src/services/rsvp/csv.ts',
};

for (const [name, path] of Object.entries(checks)) {
  test(`critical route exists: ${name}`, () => assert.ok(existsSync(path), path));
}

test('RSVP submission validates invitation token format before database access', () => {
  const s = source(checks.invite);
  assert.match(s, /validToken\s*=\s*\/\^\[a-f0-9\]\{48\}\$\//);
  assert.match(s, /validToken\.test\(token\)/);
  assert.match(s, /\.rpc\("respond_to_invitation"/);
  assert.match(s, /respond_to_invitation[\s\S]*?result\.data\s*!==\s*true/);
});

test('RSVP limits per-invitation batch size and validates submitted status', () => {
  const s = source(checks.invite);
  assert.match(s, /guests\.length\s*>\s*30/);
  assert.match(s, /alreadyAnswered\s*&&\s*form\.get\("intent"\)\s*!==\s*"edit"/);
  assert.match(s, /"attending","not_attending"/);
  assert.match(s, /r\.note\.length\s*>\s*1000/);
});

test('RSVP and guest CSV endpoints require admin authentication', () => {
  for (const path of [checks.rsvpCsv, checks.guestCsv]) {
    const s = source(path);
    assert.match(s, /getAdminContext\(/, path);
    assert.match(s, /if\s*\(!(?:admin|ctx|context)\)/, path);
  }
});

test('RSVP CSV blocks formula injection and private report caching', () => {
  const route = source(checks.rsvpCsv);
  const csv = source(checks.csv);
  assert.match(route, /row\.map\(csvCell\)/);
  assert.match(route, /private, no-store/);
  assert.match(csv, /[=+@]/);
  assert.match(csv, /replaceAll\(/);
});

test('guest and payment list readers paginate instead of silently truncating at 1000 records', () => {
  for (const path of [checks.pagination, checks.finance]) {
    const s = source(path);
    assert.match(s, /for\s*\(let offset\s*=\s*0/, path);
    assert.match(s, /\.range\(offset,offset\+499\)/, path);
  }
});

test('payment exports are authenticated and opt out of caching', () => {
  const s = source(checks.paymentReport);
  assert.match(s, /getAdminContext\(/);
  assert.match(s, /no-store/);
});

test('gallery image edits use the atomic database function', () => {
  assert.match(source(checks.image), /\.rpc\("update_gallery_photo_atomic"/);
});

test('checkout does not trust a client provided Pix amount', () => {
  const s = source(checks.pixCheckout);
  assert.ok(!/Number\(form(?:Data)?\.get\(["']amount/.test(s), 'checkout reads amount directly from form');
  assert.match(s, /checkout|reserve|gift/i);
});
