export interface DatabaseEntity {
  id: string;
}

export interface Repository<T extends DatabaseEntity, CreateInput = Omit<T, 'id'>> {
  list(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(input: CreateInput): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
}

export type SortDirection = 'asc' | 'desc';

