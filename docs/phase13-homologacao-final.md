# Fase 13 — homologação funcional e segurança

## Limites da verificação

O teste `tests/phase13-hardening.test.mjs` inspeciona invariantes do código. Ele **não** comprova o comportamento da RLS no Supabase, a entrega de e-mails, pagamentos reais, acessibilidade no navegador ou a publicação na Vercel. Execute os testes funcionais abaixo em ambiente de testes com dados descartáveis.

## Antes do teste

1. Confirme `npm run check` e `node --test tests/*.test.mjs`.
2. Faça backup dos dados relevantes no Supabase e confira as migrations 017 e 018.
3. Use um convite, um presente e uma foto de teste. Não utilize dados pessoais reais nos testes.
4. Confira na Vercel qual commit foi publicado e se o ambiente tem as variáveis necessárias.

## Convites e RSVP

- Abra um convite válido, confirme a presença de mais de um convidado e confira o resultado no painel.
- Edite a resposta anterior e confirme a atualização; clique em Cancelar antes de salvar e verifique a restauração.
- Acesse um token inválido e um token inexistente: nenhum detalhe privado deve ser exibido.
- Em sessão anônima, tente acessar `/admin/rsvp/exportar` e `/admin/convidados/exportar`: devem retornar acesso negado, sem dados pessoais.
- Com acesso autorizado, exporte o relatório; teste conteúdo que comece com `=`, `+`, `-` ou `@` para verificar neutralização em planilhas.

## Exclusão lógica

- Crie conteúdo descartável em história, galeria, local, programação, pessoas especiais, FAQ e hotéis.
- Exclua cada registro pelo painel e confira que deixou de aparecer nas páginas públicas e administrativas normais.
- Confirme no Supabase que o registro permanece com `deleted_at` preenchido.
- Para fotos excluídas, confirme que o arquivo continua recuperável no Storage.
- Confira que uma capa de galeria excluída não permanece como capa ativa.

## Presentes e Pix

- Crie um presente de teste e gere um pedido sem transferir dinheiro.
- Verifique se valor e recebedor vêm da configuração do servidor, não de campos alterados no navegador.
- Confirme que gerar QR Code **não** marca pagamento como recebido.
- Teste expiração de reserva e tentativa de novo pedido, sem pagar duas vezes.
- Faça uma revisão administrativa em pedido de teste e confira os relatórios. Nunca confirme recebimento sem conferir extrato bancário.
- Verifique que URLs de pedido e relatórios não são compartilhadas em locais públicos.

## Verificação de produção

- Teste em celular e desktop: navegação, foco do teclado, contraste, formulários e estados de carregamento.
- Confira erros de execução no console e nos logs da Vercel após navegação completa.
- Refaça um teste com acesso anônimo e um com sessão administrativa.
- Registre data, commit, ambiente, responsável, resultado e qualquer falha antes de declarar a fase concluída.

**Critério de conclusão:** não há bugs bloqueantes, migrations aplicadas, controle de acesso testado com sessões reais e nenhum pagamento fictício registrado como efetivamente recebido.
