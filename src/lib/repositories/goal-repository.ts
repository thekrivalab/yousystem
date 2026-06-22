import type { Goal } from '@/lib/types';
import { createLocalDatabase } from '@/lib/database/client';
import { LocalRepository } from './base-repository';
import { getLocalDateString } from '@/lib/date';

export class GoalRepository extends LocalRepository<Goal, Omit<Goal, 'id' | 'createdAt'>> {
  constructor() {
    super(createLocalDatabase(), 'goals');
  }

  async create(input: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const goal: Goal = {
      ...input,
      id: `g_${Date.now()}`,
      createdAt: getLocalDateString(),
    };

    this.write([...this.read(), goal]);
    return goal;
  }
}

