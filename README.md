# M-B Wedding

Plataforma de casamento com site público e painel administrativo privado. A fundação prioriza mobile, visual premium, segurança e evolução incremental.

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4 com tokens em CSS
- Supabase: PostgreSQL, Auth, RLS e Storage (previsto por módulo)
- Zod para validação server-side
- Deploy alvo: Vercel

## Requisitos

- Node.js 22+
- npm 10+
- projeto Supabase

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` é **server-only** e não é usada no frontend. A aplicação pública e a autenticação usam anon key + RLS.

## Supabase

1. Crie um projeto.
2. Configure as variáveis acima.
3. Rode a migration em `supabase/migrations/202610130001_initial_schema.sql`.
4. Rode `supabase/seed.sql`.
5. Crie um usuário em Supabase Auth.
6. Vincule o usuário ao casamento seed:

```sql
insert into public.admin_memberships (wedding_id, user_id, role)
values ('11111111-1111-4111-8111-111111111111', '<AUTH_USER_UUID>', 'owner');
```

Depois acesse `/admin/login`.

## Comandos

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run check
```

## Estrutura principal

```text
src/
  app/
    (public)/        site dos convidados
    admin/           login e painel privado
  components/
    public/
    admin/
    ui/
  config/            conteúdo/mock centralizado
  lib/supabase/      clientes SSR/browser/proxy
  services/          queries e acesso a dados
  validation/        schemas Zod
supabase/
  migrations/
  seed.sql
docs/
  architecture.md
```

## Segurança

- `/admin` exige sessão válida e vínculo em `admin_memberships`.
- `proxy.ts` apenas mantém a sessão; autorização real também acontece no servidor/layout e no banco.
- Dados de convidados e pagamentos não possuem policy de leitura pública.
- `service_role` não deve ser enviado ao navegador.
- URLs privadas de convite serão tokenizadas e `noindex` na fase RSVP.

## Deploy

A aplicação está preparada para Vercel. Configure as mesmas variáveis no ambiente de deploy, aplique migrations no Supabase e execute o seed apenas no ambiente desejado.


## Fase 2 — Configurações dinâmicas

Após aplicar a migration inicial e associar o primeiro usuário em `admin_memberships`, execute também `supabase/migrations/202610130002_wedding_media.sql` no Supabase SQL Editor. Ela cria o bucket público `wedding-media` e restringe uploads/exclusões aos administradores do casamento. Não use a service role no navegador.

Acesse `/admin/configuracoes` para alterar os nomes, data, horário, fuso, cidade, mensagem da capa, foto e dados do local. As informações são salvas nas tabelas `weddings` e `venues`; a foto vai para Supabase Storage. A Home, o cabeçalho, o rodapé e a página `/casamento` leem os dados do primeiro casamento publicado (`is_published=true`).

**Atenção:** a história e o cronograma continuam usando conteúdo fictício centralizado; suas edições estarão disponíveis em uma etapa posterior. Se não houver casamento publicado, o site ainda usa o exemplo local como fallback.

Depois de subir as alterações ao GitHub e aplicar a migration, confirme `npm run check` no ambiente com dependências instaladas e redeploy na Vercel.


### Fase 6 — Aparência e visibilidade

Execute a migration `202610130005_appearance.sql` no Supabase antes de publicar a Fase 6.
Em `/admin/aparencia`, administradores podem alterar cinco cores e ligar/desligar
seções. As alterações afetam o site público e não excluem dados das seções ocultas.
Para conferir: desative uma seção, salve, abra a Home e tente acessar sua rota
diretamente (deverá retornar 404). Reative-a para recuperar o conteúdo.
