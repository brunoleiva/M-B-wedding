# Fase 14 — checklist de lançamento e recuperação

## Antes do deploy

1. Confirmar `npm run check` e `node --test tests/*.test.mjs` (no PowerShell, se glob não expandir, usar `node --test tests`).
2. Garantir que todas as migrations até 018 foram aplicadas. Não executar migrations de novo sem verificar histórico.
3. Conferir no projeto correto da Vercel as variáveis `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em Production. A URL pública deve ser HTTPS, sem barra final. Não colocar `SUPABASE_SERVICE_ROLE_KEY` no browser.
4. Revisar autenticação do painel e se o redirect de login está correto. Ambiente Preview não deve ser indexado; por padrão ele não é autenticação nem substitui proteção de acesso.
5. Testar resposta de `/robots.txt`, `/sitemap.xml`, `/convite/<token>` e `/presentes/pedido/<token>` no ambiente de homologação. Links privados devem devolver `X-Robots-Tag: noindex, nofollow, noarchive` e `Referrer-Policy: no-referrer`.
6. Nunca compartilhar tokens verdadeiros em capturas de tela, logs ou ferramentas públicas.

## Backup e recuperação do Supabase

1. Antes de mudanças de esquema, fazer backup consistente do banco no painel/CLI do Supabase conforme o plano contratado. Uma exportação CSV **não** é backup completo: ela não conserva políticas RLS, triggers, funções, roles e índices.
2. Salvar cópia criptografada do backup e documentar data, ambiente, projeto e responsável. Testar a restauração em um **projeto Supabase de teste**, não diretamente na produção.
3. Copiar separadamente os objetos do bucket `wedding-media` com ferramenta autorizada. Backup do PostgreSQL não inclui arquivos do Storage. Conferir contagem e integridade dos objetos.
4. Nunca versionar `*.env.local`, tokens privados, `service_role` ou dumps contendo dados de convidados. Guardar backups com acesso mínimo.
5. Registrar o commit e as migrations aplicadas no momento de cada backup. Para rollback, fazer restauração ensaiada do conjunto banco + Storage e só então apontar deploy compatível.

## Testes manuais no celular

- Android e iPhone: cabeçalho, menu, rolagem e contraste.
- Convite descartável: abrir token privado, confirmar RSVP por família, editar e cancelar; confirmar que token inválido não mostra dados.
- Presentes: gerar pedido Pix de teste, validar recebedor e valor no banco sem realizar pagamento real. Não confirmar Pix sem conferir extrato.
- Painel: verificar acesso negado sem login; criar e excluir logicamente um registro de teste e confirmar que não aparece no público.
- Conferir páginas Home, História, Galeria, Informações, Presentes, RSVP e erro 404.

## Após deploy

- Conferir produção e acompanhar logs por erros 5xx, falhas de RPC e lentidão. Testar URLs com parâmetros sem expor tokens privados.
- Não considerar esta lista uma homologação concluída: registrar evidências e resultados dos testes reais antes de liberar convites.
