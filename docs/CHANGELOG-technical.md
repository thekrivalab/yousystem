# Changelog — Finalização técnica YouSystem

## Arquivos alterados (resumo)

### Supabase & scripts
- `supabase/migrations/*` (validados)
- `scripts/verify-supabase-schema.mjs`
- `docs/supabase-deploy.md`

### Testes
- `vitest.setup.ts`, `vitest.config.ts`
- `src/lib/__tests__/backup.test.ts`
- `src/lib/__tests__/sync-queue.test.ts`
- `playwright.config.ts`
- `e2e/*.spec.ts`, `e2e/fixtures.ts`

### Segurança
- `src/app/auth/callback/route.ts`
- `src/utils/supabase/middleware.ts`
- `src/lib/upload-validation.ts`
- `src/components/AuthGate.tsx`
- `src/lib/e2e.ts`
- `docs/security-audit.md`

### Documentação
- `docs/schema-normalization-plan.md`
- `scripts/analyze-bundle.mjs`

### Performance
- `src/app/layout.tsx` (mapbox CSS removido se aplicado)
- `eslint.config.mjs`

### Package
- `package.json` (scripts)

## Comandos de validação

```bash
npm run db:verify
npm run lint
npm run typecheck
npm run test
npm run build
npm run analyze:bundle   # após build
npm run test:e2e         # requer playwright install
```
