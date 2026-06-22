import type { FinancialGoal, Transaction } from '@/lib/types';
import { createLocalDatabase } from '@/lib/database/client';
import { LocalRepository } from './base-repository';
import { getLocalDateString } from '@/lib/date';

export class FinanceRepository extends LocalRepository<FinancialGoal, Omit<FinancialGoal, 'id'>> {
  constructor() {
    super(createLocalDatabase(), 'financial-goals');
  }

  async create(input: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> {
    const goal: FinancialGoal = {
      ...input,
      id: `fg_${Date.now()}`,
    };

    this.write([...this.read(), goal]);
    return goal;
  }
}

export class TransactionRepository extends LocalRepository<Transaction, Omit<Transaction, 'id' | 'date'>> {
  constructor() {
    super(createLocalDatabase(), 'transactions');
  }

  async create(input: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const transaction: Transaction = {
      ...input,
      id: `t_${Date.now()}`,
      date: getLocalDateString(),
    };

    this.write([transaction, ...this.read()]);
    return transaction;
  }
}

