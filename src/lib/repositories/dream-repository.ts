import type { DreamItem } from '@/lib/types';
import { createLocalDatabase } from '@/lib/database/client';
import { LocalRepository } from './base-repository';

export class DreamRepository extends LocalRepository<DreamItem, Omit<DreamItem, 'id'>> {
  constructor() {
    super(createLocalDatabase(), 'dream-items');
  }

  async create(input: Omit<DreamItem, 'id'>): Promise<DreamItem> {
    const item: DreamItem = {
      ...input,
      id: `d_${Date.now()}`,
    };

    this.write([...this.read(), item]);
    return item;
  }
}

