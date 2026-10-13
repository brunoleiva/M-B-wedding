# Arquitetura — decisões iniciais

- **Next.js App Router** separa o site público de `/admin` sem duplicar o root layout.
- **Single wedding com `weddings` como aggregate root**: o produto não é multi-tenant agora, mas dados de domínio carregam `wedding_id` para evitar um bloqueio estrutural futuro.
- **RLS primeiro**: o navegador nunca recebe `service_role`; conteúdos públicos possuem policies explícitas e dados sensíveis de convidados/pagamentos não têm leitura anônima.
- **RSVP por convite**: grupos e convidados já existem no schema, mas a leitura/alteração pública ficará atrás de operações server-side/RPC específicas na Fase 3. Não há policy que liste convidados anonimamente.
- **UI pública e admin têm linguagens visuais distintas**: público editorial/romântico, admin funcional.
- **Mocks centralizados** em `src/config/wedding.ts`; o seed usa os mesmos conceitos. Nada crítico fica espalhado nas páginas.
