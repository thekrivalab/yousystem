# Plano de normalização parcial do schema

## Situação atual

Todos os dados de domínio (goals, habits, achievements, transactions, etc.) são serializados em um único blob JSON em:

1. `localStorage` → chave `life-os-storage`
2. Supabase → `user_storage_snapshots.payload` (JSONB)

Campos sensíveis podem ser selados no vault (`_vault` envelope AES-256-GCM).

## Avaliação: migrar agora?

| Critério | Blob atual | Tabelas normalizadas |
|----------|------------|----------------------|
| Uso pessoal single-user | ✅ Suficiente | Overhead |
| Sync multi-device | ✅ Com `sync_version` + merge | ✅ Nativo por row |
| Queries/analytics | ❌ | ✅ |
| Backup granular | Export JSON | SQL + export |
| Complexidade | Baixa | Alta |
| Compatibilidade | — | Requer migration path |

**Decisão:** **Não implementar migração agora.** O blob + versioned sync atende uso pessoal gratuito. Benefício real de tabelas aparece com >10k registros, relatórios SQL ou colaboração.

**Gatilhos para reavaliar:** localStorage `life-os-storage` > **4 MB** (limite prático do browser), necessidade de queries SQL (relatórios financeiros, filtros por data), ou sync lento por payload grande. Até lá, manter blob JSONB.

## Entidades candidatas (futuro)

| Tabela | Origem no blob | Prioridade |
|--------|----------------|------------|
| `goals` | `state.goals[]` | Alta |
| `habits` | `state.habits[]` | Alta |
| `achievements` | `state.achievements[]` | Média |
| `transactions` | `state.transactions[]` | Alta (sensível) |

## Estratégia de migração gradual (quando necessário)

### Fase A — Dual write (sem breaking change)

```sql
create table public.goals (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  data jsonb not null default '{}',
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
-- RLS: auth.uid() = user_id
```

1. App escreve blob **e** linhas normalizadas
2. Leitura continua do blob (fallback)

### Fase B — Dual read com feature flag

1. Ler tabelas se `payload._normalized === true`
2. Fallback blob para usuários legados

### Fase C — Background migration

1. Job: para cada `user_storage_snapshots`, parse blob → upsert tabelas
2. Marcar `payload._normalized = true`

### Fase D — Blob como cache opcional

1. Sync por entidade com `updated_at` + `version`
2. Blob reduzido ou removido

## Campos versionados no blob (já implementado)

`sync-engine.ts` faz merge por `id` + `version` + `updated_at` em arrays dentro do blob — preparação para dual-write sem conflito.

## Estimativa de esforço

| Fase | Esforço |
|------|---------|
| A — dual write goals/habits | 2–3 semanas |
| B — dual read | 1 semana |
| C — migration job | 1 semana |
| D — deprecar blob | 2+ semanas |

## Conclusão

Manter blob versionado. Reavaliar quando:

- Performance de parse JSON > 100ms
- localStorage quota excedida (>4MB)
- Necessidade de queries SQL/reporting
- Colaboração multi-usuário no mesmo workspace
