export type StorageRecord = Record<string, unknown>;

export interface DatabaseClient {
  get<T>(table: string): T[];
  set<T>(table: string, value: T[]): void;
  clear(table: string): void;
}

const memory = new Map<string, string>();

function read(table: string): string | null {
  if (typeof window === 'undefined') return memory.get(table) ?? null;
  return window.localStorage.getItem(table);
}

function write(table: string, value: string): void {
  if (typeof window === 'undefined') {
    memory.set(table, value);
    return;
  }
  window.localStorage.setItem(table, value);
}

function remove(table: string): void {
  if (typeof window === 'undefined') {
    memory.delete(table);
    return;
  }
  window.localStorage.removeItem(table);
}

export function createLocalDatabase(namespace = 'life-os'): DatabaseClient {
  const key = (table: string) => `${namespace}:${table}`;

  return {
    get<T>(table: string): T[] {
      try {
        const raw = read(key(table));
        return raw ? (JSON.parse(raw) as T[]) : [];
      } catch {
        return [];
      }
    },
    set<T>(table: string, value: T[]): void {
      write(key(table), JSON.stringify(value));
    },
    clear(table: string): void {
      remove(key(table));
    },
  };
}

