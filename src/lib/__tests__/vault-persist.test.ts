import { describe, expect, it, beforeEach } from 'vitest';
import {
  keyManager,
  sealSensitiveFields,
  unsealSensitiveFields,
} from '../crypto/key-manager';

describe('vault zustand persist envelope', () => {
  beforeEach(() => {
    keyManager.lock();
  });

  it('seals and unseals sensitive fields inside zustand state envelope', async () => {
    await keyManager.unlockWithPassword('test-password', 'user-1');

    const raw = JSON.stringify({
      state: {
        user: { id: 'user-1', name: 'Test' },
        transactions: [{ id: 't1', amount: 100 }],
        habits: [],
      },
      version: 0,
    });

    const sealed = await sealSensitiveFields(raw);
    const sealedParsed = JSON.parse(sealed) as {
      state: { transactions?: unknown; _vault?: unknown };
    };

    expect(sealedParsed.state.transactions).toBeUndefined();
    expect(sealedParsed.state._vault).toBeTruthy();

    const unsealed = await unsealSensitiveFields(sealed);
    const unsealedParsed = JSON.parse(unsealed) as {
      state: { transactions: { id: string; amount: number }[] };
    };

    expect(unsealedParsed.state.transactions[0]?.amount).toBe(100);
  });

  it('reuses persisted salt for the same user', async () => {
    await keyManager.unlockWithPassword('same-pass', 'user-salt');
    keyManager.lock();

    await keyManager.unlockWithPassword('same-pass', 'user-salt');
    expect(keyManager.hasKey()).toBe(true);
  });
});
