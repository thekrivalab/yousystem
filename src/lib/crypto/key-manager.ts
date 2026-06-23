import {
  deriveAndCacheKey,
  generateSalt,
  encryptWithKey,
  decryptWithKey,
  type EncryptedPayload,
} from './vault';

const SESSION_SALT_KEY = 'life-os-vault-salt';
const SALT_STORAGE_PREFIX = 'life-os-vault-salt:';
const SESSION_KEY_PREFIX = 'life-os-vault-session:';

function saltStorageKey(userId: string): string {
  return `${SALT_STORAGE_PREFIX}${userId}`;
}

function sessionKeyStorageKey(userId: string): string {
  return `${SESSION_KEY_PREFIX}${userId}`;
}

function loadPersistedSalt(userId: string): Uint8Array | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(saltStorageKey(userId));
  if (!raw) return null;
  try {
    return new Uint8Array(JSON.parse(raw) as number[]);
  } catch {
    return null;
  }
}

function persistSalt(userId: string, salt: Uint8Array): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(saltStorageKey(userId), JSON.stringify(Array.from(salt)));
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SESSION_SALT_KEY, JSON.stringify(Array.from(salt)));
  }
}

async function cacheSessionKey(userId: string, key: CryptoKey): Promise<void> {
  if (typeof sessionStorage === 'undefined') return;
  const jwk = await crypto.subtle.exportKey('jwk', key);
  sessionStorage.setItem(sessionKeyStorageKey(userId), JSON.stringify(jwk));
}

async function loadSessionKey(userId: string): Promise<CryptoKey | null> {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(sessionKeyStorageKey(userId));
  if (!raw) return null;

  try {
    const jwk = JSON.parse(raw) as JsonWebKey;
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch {
    return null;
  }
}

function clearSessionKey(userId: string | null): void {
  if (!userId || typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(sessionKeyStorageKey(userId));
  sessionStorage.removeItem(SESSION_SALT_KEY);
}

type PersistEnvelope = {
  state?: Record<string, unknown>;
  version?: number;
  _vault?: VaultEnvelope;
  [key: string]: unknown;
};

function resolvePersistTarget(parsed: PersistEnvelope): {
  envelope: PersistEnvelope | null;
  target: Record<string, unknown>;
} {
  if (parsed.state && typeof parsed.state === 'object') {
    return { envelope: parsed, target: parsed.state };
  }
  return { envelope: null, target: parsed };
}

class KeyManager {
  private key: CryptoKey | null = null;
  private salt: Uint8Array | null = null;
  private userId: string | null = null;

  hasKey(): boolean {
    return this.key !== null;
  }

  getKey(): CryptoKey | null {
    return this.key;
  }

  getUserId(): string | null {
    return this.userId;
  }

  private async activateKey(userId: string, password: string, salt: Uint8Array): Promise<void> {
    this.key = await deriveAndCacheKey(password, salt, true);
    this.salt = salt;
    this.userId = userId;
    persistSalt(userId, salt);
    await cacheSessionKey(userId, this.key);
  }

  async unlockWithPassword(password: string, userId: string): Promise<void> {
    const salt = loadPersistedSalt(userId) ?? generateSalt();
    await this.activateKey(userId, password, salt);
  }

  /** Unlock using a dedicated vault passphrase (OAuth / no login password). */
  async unlockWithPassphrase(passphrase: string, userId: string): Promise<void> {
    const salt = loadPersistedSalt(userId) ?? generateSalt();
    await this.activateKey(userId, passphrase, salt);
  }

  async reunlockWithPassword(password: string, userId: string): Promise<void> {
    const salt = loadPersistedSalt(userId);
    if (!salt) {
      throw new Error('Vault salt unavailable');
    }
    await this.activateKey(userId, password, salt);
  }

  async reunlockFromSession(userId: string): Promise<boolean> {
    const key = await loadSessionKey(userId);
    const salt = loadPersistedSalt(userId);
    if (!key || !salt) return false;

    this.key = key;
    this.salt = salt;
    this.userId = userId;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_SALT_KEY, JSON.stringify(Array.from(salt)));
    }
    return true;
  }

  lock(): void {
    clearSessionKey(this.userId);
    this.key = null;
    this.salt = null;
    this.userId = null;
  }
}

export const keyManager = new KeyManager();

export type VaultEnvelope = {
  v: 1;
  iv: string;
  ciphertext: string;
};

/** Fields encrypted inside life-os-storage when vault is unlocked. */
export const SENSITIVE_LIFE_OS_FIELDS = [
  'transactions',
  'financialGoals',
  'healthEntries',
  'documents',
  'memories',
  'relationships',
] as const;

export type SensitiveLifeOSField = (typeof SENSITIVE_LIFE_OS_FIELDS)[number];

export interface LifeOSPersistedState {
  _vault?: VaultEnvelope;
  [key: string]: unknown;
}

export async function sealSensitiveFields(stateJson: string): Promise<string> {
  if (!keyManager.hasKey()) return stateJson;

  const key = keyManager.getKey();
  if (!key) return stateJson;

  const parsed = JSON.parse(stateJson) as PersistEnvelope;
  const { envelope, target } = resolvePersistTarget(parsed);
  const sensitive: Record<string, unknown> = {};

  for (const field of SENSITIVE_LIFE_OS_FIELDS) {
    if (field in target) {
      sensitive[field] = target[field];
      delete target[field];
    }
  }

  if (Object.keys(sensitive).length === 0) {
    return stateJson;
  }

  const vaultEnvelope = await encryptWithKey(JSON.stringify(sensitive), key);
  target._vault = { v: 1, iv: vaultEnvelope.iv, ciphertext: vaultEnvelope.ciphertext };

  return JSON.stringify(envelope ?? target);
}

export async function unsealSensitiveFields(stateJson: string): Promise<string> {
  const parsed = JSON.parse(stateJson) as PersistEnvelope;
  const { envelope, target } = resolvePersistTarget(parsed);
  if (!target._vault) return stateJson;

  if (!keyManager.hasKey()) {
    return stateJson;
  }

  const key = keyManager.getKey();
  if (!key) return stateJson;

  const vault = target._vault as VaultEnvelope;
  const sensitiveJson = await decryptWithKey(vault.iv, vault.ciphertext, key);
  const sensitive = JSON.parse(sensitiveJson) as Record<string, unknown>;

  delete target._vault;
  for (const field of SENSITIVE_LIFE_OS_FIELDS) {
    if (field in sensitive) {
      target[field] = sensitive[field];
    }
  }

  return JSON.stringify(envelope ?? target);
}

export function isEncryptedBackupPayload(data: unknown): data is EncryptedPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'v' in data &&
    (data as EncryptedPayload).v === 1 &&
    'ciphertext' in data &&
    'salt' in data &&
    'iv' in data
  );
}
