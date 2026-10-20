# Fase 11 — Homologação de segurança

Os testes `node --test tests/phase11-security.test.mjs` verificam invariantes do código-fonte; **não** substituem testes de integração ou testes no Supabase real.

## Antes de publicar

1. `npm run check`
2. `node --test tests/qa93.test.mjs tests/phase11-security.test.mjs`
3. Confirmar que as migrations 017 e 018 já foram aplicadas e que `supabase/tests/qa93_verify.sql` retornou o esperado.
4. Em ambiente de testes, confirmar que convites inválidos não alteram RSVP e que um convite válido só altera convidados da própria família.
5. Testar exportação de convidados e RSVP sem login (deve ser negada) e com login de administrador (CSV deve abrir corretamente).
6. Criar uma transação Pix de teste e confirmar que apenas revisão autorizada atualiza o status; gerar QR Code não significa pagamento recebido.
7. Excluir um registro editorial descartável e conferir `deleted_at` preenchido e sua ausência nas páginas públicas.
8. Testar campos de CSV começando por `=`, `+`, `-`, `@` ou caracteres de controle, verificando que uma planilha não os interpreta como fórmulas.

Nunca use convidados reais ou pagamentos reais em testes destrutivos. Registrar evidência do teste e restaurar dados de teste quando apropriado.
