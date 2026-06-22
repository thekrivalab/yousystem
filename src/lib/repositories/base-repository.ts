import type { DatabaseClient } from '@/lib/database/client';

export interface Entity {
  id: string;
}

export interface Repository<T extends Entity, CreateInput = Omit<T, 'id'>> {
  list(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(input: CreateInput): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}

export abstract class LocalRepository<T extends Entity, CreateInput = Omit<T, 'id'>> implements Repository<T, CreateInput> {
  protected constructor(
    protected readonly client: DatabaseClient,
    protected readonly table: string
  ) {}

  protected read(): T[] {
    return this.client.get<T>(this.table);
  }

  protected write(items: T[]): void {
    this.client.set(this.table, items);
  }

  async list(): Promise<T[]> {
    return this.read();
  }

  async findById(id: string): Promise<T | null> {
    return this.read().find((item) => item.id === id) ?? null;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    let updated: T | null = null;
    const items = this.read().map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...updates };
      return updated;
    });

    if (!updated) return null;

    this.write(items);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const before = this.read();
    const after = before.filter((item) => item.id !== id);
    if (after.length === before.length) return false;
    this.write(after);
    return true;
  }

  abstract create(input: CreateInput): Promise<T>;
}

