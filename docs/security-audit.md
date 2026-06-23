# Auditoria de Segurança — YouSystem

**Data:** 2026-06-23 (revisão 3)  
**Escopo:** App web Next.js, Supabase Auth, sync, vault crypto.

## Resumo executivo

| Severidade | Abertos | Corrigidos nesta entrega |
|------------|---------|--------------------------|
| Crítica    | 0       | —                        |
| Alta       | 0       | 4                        |
| Média      | 1       | 4                        |
| Baixa      | 2       | 2                        |

Principais correções: salt vault persistente por usuário, sessão crypto em `sessionStorage`, selagem Zustand envelope, isolamento localStorage por `user.id`, sync retry, E2E bloqueado em produção, vault UI para OAuth.

**Residual:** CSP ainda usa `'unsafe-inline'` em styles; `npm audit` PostCSS aguarda upgrade Next.

---

## Alta — corrigidas

### 1. Vault salt novo a cada login
- Salt persistido em `localStorage` por `userId` (`life-os-vault-salt:{id}`)
- Chave de sessão exportada para `sessionStorage` — reload na mesma aba não exige senha de novo
- `reunlockVaultFromSession()` no bootstrap do sync

### 2. Selagem ignorava envelope Zustand
- `sealSensitiveFields` / `unsealSensitiveFields` operam em `state.*` dentro do persist blob
- `sealLocalLifeOSStorage()` antes de sync e após mudanças

### 3. Login enviava dados de outro usuário
- `ensureLocalStorageForUser()` limpa stores se `user.id` local ≠ sessão
- Removido upload cego em login/register — sync via `SupabaseStorageSync`

### 4. OAuth sem vault
- `VaultUnlockPrompt` modal quando `_vault` existe e chave ausente
- Settings → Data → desbloquear vault com senha ou passphrase (Google)

---

## Média — corrigidas

| Item | Fix |
|------|-----|
| Sync retry | `enqueueSync` preserva `attempts`; flush incrementa antes de re-enfileirar |
| E2E bypass prod | `NODE_ENV !== 'production'` em middleware + `isE2ETestMode()` |
| Upload MIME vazio | Inferência por extensão; extensão obrigatória |
| `lockVault` no logout | `SupabaseStorageSync` SIGNED_OUT + settings |

### CSP — parcial (aberto)
- `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'` — necessário para Next/Leaflet
- Reavaliar nonces quando Next suportar nativamente

---

## Baixa — residual

- **npm audit (PostCSS):** aguardar Next bundling atualizado
- **Recovery snapshots:** plaintext local (mesmo trust model)
- **Normalização SQL:** adiada até localStorage > 4 MB

---

## Checklist produção

```env
ALLOWED_FORWARDED_HOSTS=seu-dominio.com
# NUNCA:
# E2E_TEST_MODE=1
# NEXT_PUBLIC_E2E_TEST=1
```

---

## Testes adicionados

- `vault-persist.test.ts` — selagem envelope Zustand + salt reutilizado
- `auth-storage.test.ts` — isolamento por usuário
- `sync-queue.test.ts` — contador de tentativas preservado
