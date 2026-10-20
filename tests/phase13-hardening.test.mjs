import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = (path) => readFileSync(join(process.cwd(), path), 'utf8');

const invitation = source('src/app/(public)/convite/[token]/actions.ts');
const invitationPage = source('src/app/(public)/convite/[token]/page.tsx');
const checkout = source('src/app/(public)/presentes/checkout-action.ts');
const order = source('src/app/(public)/presentes/pedido/[token]/page.tsx');
const payments = source('src/app/admin/(protected)/presentes/pagamentos/actions.ts');
const report = source('src/app/admin/(protected)/rsvp/exportar/route.ts');
const csv = source('src/services/rsvp/csv.ts');
const gallery = source('src/app/admin/(protected)/galeria/actions.ts');

test('convite usa token de formato restrito e resposta processada pelo banco', () => {
  assert.match(invitation, /validToken\.test\(token\)/);
  assert.match(invitation, /db\.rpc\("invitation_details"/);
  assert.match(invitation, /db\.rpc\("respond_to_invitation"/);
  assert.match(invitation, /guests\.length>30/);
  assert.match(invitation, /r\.note\.length>1000/);
});

test('pagina do convite impede indexacao', () => {
  assert.match(invitationPage, /robots:\s*\{\s*index:\s*false/);
  assert.match(invitationPage, /invitation_details/);
});

test('checkout valida identificadores, dados e nunca aceita valor financeiro do formulario', () => {
  assert.match(checkout, /uuid\.test\(giftId\)/);
  assert.match(checkout, /uuid\.test\(key\)/);
  assert.match(checkout, /create_gift_pix_order/);
  assert.doesNotMatch(checkout, /form\.get\(["'](?:amount|amount_cents|price|value)["']\)/);
});

test('pagamento Pix nao aparece confirmado antes do status do banco', () => {
  assert.match(order, /payment\.payment_status===\"confirmed\"/);
  assert.match(order, /payment\.payment_status===\"pending_confirmation\"/);
  assert.match(order, /read_gift_pix_order/);
  assert.match(order, /read_confirmed_gift_thank_you/);
});

test('revisao e exclusao de pagamento exigem contexto de administrador', () => {
  assert.match(payments, /export async function reviewPayment[\s\S]*?getAdminContext\(\)/);
  assert.match(payments, /export async function archivePayment[\s\S]*?getAdminContext\(\)/);
  assert.match(payments, /review_gift_pix_payment/);
  assert.match(payments, /archive_gift_pix_payment/);
});

test('exportacao RSVP nao e publica nem cacheavel', () => {
  assert.match(report, /getAdminContext\(\)/);
  assert.match(report, /status:401/);
  assert.match(report, /private, no-store/);
  assert.match(report, /row\.map\(csvCell\)/);
  assert.match(csv, /\[=\+\\-@\]/);
});

test('galeria atualiza capa pela RPC e preserva exclusao logica', () => {
  assert.match(gallery, /update_gallery_photo_atomic/);
  assert.match(gallery, /deleted_at/);
  assert.doesNotMatch(gallery, /\.delete\(\)/);
});
