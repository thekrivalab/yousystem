# Supabase — Deploy do banco

Guia para aplicar e validar o schema do YouSystem em ambientes novos ou existentes.

## Pré-requisitos

- Conta [Supabase](https://supabase.com) (plano gratuito)
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado (opcional, recomendado)

## Variáveis de ambiente

Crie `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-or-publishable-key>

# Produção — hostnames permitidos no redirect OAuth (atrás de proxy/LB)
ALLOWED_FORWARDED_HOSTS=app.seudominio.com,www.seudominio.com
```

Nunca commite `.env.local`. Use apenas a chave **publishable/anon** no frontend.

### `ALLOWED_FORWARDED_HOSTS` (produção)

O callback OAuth (`/auth/callback`) usa `x-forwarded-host` **somente** se o hostname estiver nesta lista. Sem configurar em produção atrás de um reverse proxy, redirects podem cair no host errado.

| Ambiente | Valor |
|----------|-------|
| Desenvolvimento | Não necessário (`origin` da request) |
| Vercel / Netlify | Domínio customizado ex.: `app.seudominio.com` |
| Múltiplos domínios | Separados por vírgula, sem `https://` |

Configure também no painel do host (Vercel → Environment Variables) e no Supabase **URL Configuration** com o mesmo domínio.

## Schema atual

### Tabela `public.user_storage_snapshots`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `user_id` | `uuid` PK | Referência `auth.users(id)` ON DELETE CASCADE |
| `payload` | `jsonb` | Snapshot localStorage (life-os-storage, theme, routine, atlas, sync meta) |
| `created_at` | `timestamptz` | Criação |
| `updated_at` | `timestamptz` | Última atualização |
| `sync_version` | `integer` | Versão monotônica para merge multi-dispositivo |

### RLS

- SELECT / INSERT / UPDATE / DELETE apenas quando `auth.uid() = user_id`
- Políticas idempotentes (`DROP POLICY IF EXISTS` antes de `CREATE`)

## Migrations (ordem)

1. `20260622000000_create_user_storage_snapshots.sql` — tabela base + RLS
2. `20260623100000_add_sync_version.sql` — coluna `sync_version` (idempotente)

## Ambiente novo

### Opção A — Supabase CLI

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
npm run db:verify
```

### Opção B — SQL Editor (Dashboard)

1. Abra **SQL Editor** no projeto Supabase
2. Execute cada arquivo de `supabase/migrations/` em ordem cronológica
3. Rode localmente: `npm run db:verify`

## Ambiente existente (já com dados)

As migrations usam:

- `CREATE TABLE IF NOT EXISTS`
- `ADD COLUMN IF NOT EXISTS sync_version`
- `CREATE INDEX IF NOT EXISTS`
- `DROP POLICY IF EXISTS` + `CREATE POLICY`

Seguro para reexecutar sem duplicar estrutura.

Se a tabela existia **sem** `sync_version`, a migration `20260623100000` adiciona a coluna com default `1`.

## Verificação automática

```bash
npm run db:verify
```

Valida:

- Existência da tabela e colunas obrigatórias
- RLS habilitado
- Migration `sync_version` idempotente

## Verificação manual (SQL)

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_storage_snapshots'
ORDER BY ordinal_position;
```

Esperado: `user_id`, `payload`, `created_at`, `updated_at`, `sync_version`.

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'user_storage_snapshots';
```

Esperado: 4 políticas (select, insert, update, delete) para `authenticated`.

## Auth (Dashboard)

1. **Authentication → Providers**: habilitar Email e/ou Google
2. **URL Configuration**: adicionar redirect URLs
   - `http://localhost:3000/auth/callback`
   - `https://<seu-dominio>/auth/callback`
3. Email confirmation: conforme preferência (desabilitar para dev local)

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `sync_version` column missing | Executar `20260623100000_add_sync_version.sql` |
| RLS bloqueia writes | Confirmar usuário autenticado; políticas aplicadas |
| Snapshot vazio após login | Normal em conta nova; dados locais são enviados no primeiro sync |
| Conflito multi-device | Versão maior em `sync_version` / meta no payload vence |

## Backup do banco

No plano gratuito, use export manual via Dashboard ou:

```bash
supabase db dump -f backup.sql
```

Para dados de usuário, o app também oferece backup criptografado em **Settings → Data**.
