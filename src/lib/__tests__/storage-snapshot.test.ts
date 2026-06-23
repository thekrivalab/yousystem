import { describe, expect, it } from 'vitest';
import {
  ATLAS_MAPPING_KEY,
  mergeAtlasMapping,
  readStorageSnapshot,
  serializeStorageSnapshot,
  writeStorageSnapshot,
} from '../storage-snapshot';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

describe('storage-snapshot atlas migration', () => {
  it('migrates legacy atlas-countries into atlas-countries-mapping', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      'atlas-countries',
      JSON.stringify({ BR: { status: 'visited', name: 'Brazil' }, US: { status: 'want_to_visit', name: 'United States' } })
    );

    const snapshot = readStorageSnapshot(storage);

    expect(snapshot[ATLAS_MAPPING_KEY]).toBe(JSON.stringify({ BR: 'Brazil', US: 'United States' }));
    expect(storage.getItem('atlas-countries')).toBeNull();
  });

  it('includes atlas mapping in serialized snapshot', () => {
    const storage = new MemoryStorage();
    storage.setItem(ATLAS_MAPPING_KEY, JSON.stringify({ FR: 'France' }));

    const snapshot = readStorageSnapshot(storage);
    const serialized = serializeStorageSnapshot(snapshot);

    expect(serialized).toContain('atlas-countries-mapping');
    expect(serialized).toContain('France');
  });

  it('merges local and remote atlas mappings', () => {
    const local = { [ATLAS_MAPPING_KEY]: JSON.stringify({ BR: 'Brazil' }) };
    const remote = { [ATLAS_MAPPING_KEY]: JSON.stringify({ US: 'United States' }) };

    const merged = mergeAtlasMapping(local, remote);

    expect(JSON.parse(merged[ATLAS_MAPPING_KEY]!)).toEqual({
      US: 'United States',
      BR: 'Brazil',
    });
  });

  it('round-trips snapshot through write/read', () => {
    const storage = new MemoryStorage();
    const payload = {
      'life-os-storage': '{"user":{"name":"Test"}}',
      [ATLAS_MAPPING_KEY]: JSON.stringify({ JP: 'Japan' }),
    };

    writeStorageSnapshot(payload, storage);
    const readBack = readStorageSnapshot(storage);

    expect(readBack['life-os-storage']).toBe(payload['life-os-storage']);
    expect(readBack[ATLAS_MAPPING_KEY]).toBe(payload[ATLAS_MAPPING_KEY]);
  });
});
