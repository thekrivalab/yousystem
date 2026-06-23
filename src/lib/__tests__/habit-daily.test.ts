import { describe, expect, it } from 'vitest';
import {
  calculateHabitStreak,
  isHabitCompletedOnDate,
  syncAllHabitsDailyState,
  syncHabitDailyState,
} from '@/lib/habit-daily';
import type { Habit } from '@/lib/types';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Test',
    icon: '✅',
    category: 'health',
    frequency: 'daily',
    streak: 0,
    longestStreak: 0,
    completedToday: false,
    successRate: 0,
    color: '#000',
    xpPerCompletion: 10,
    completionHistory: [],
    createdAt: '2026-06-20',
    ...overrides,
  };
}

describe('habit-daily', () => {
  it('resets completedToday when today is not in history', () => {
    const habit = makeHabit({
      completedToday: true,
      completionHistory: ['2026-06-22'],
    });

    const synced = syncHabitDailyState(habit, '2026-06-23');
    expect(synced.completedToday).toBe(false);
  });

  it('keeps completedToday when today is in history', () => {
    const habit = makeHabit({
      completedToday: false,
      completionHistory: ['2026-06-23'],
    });

    const synced = syncHabitDailyState(habit, '2026-06-23');
    expect(synced.completedToday).toBe(true);
  });

  it('calculates streak from consecutive days ending today or yesterday', () => {
    expect(
      calculateHabitStreak(['2026-06-21', '2026-06-22', '2026-06-23'], '2026-06-23')
    ).toBe(3);

    expect(
      calculateHabitStreak(['2026-06-21', '2026-06-22'], '2026-06-23')
    ).toBe(2);

    expect(calculateHabitStreak(['2026-06-20'], '2026-06-23')).toBe(0);
  });

  it('checks completion for a specific date', () => {
    const habit = makeHabit({ completionHistory: ['2026-06-22'] });
    expect(isHabitCompletedOnDate(habit, '2026-06-22')).toBe(true);
    expect(isHabitCompletedOnDate(habit, '2026-06-23')).toBe(false);
  });

  it('syncs all habits in batch', () => {
    const habits = [
      makeHabit({ id: 'a', completedToday: true, completionHistory: ['2026-06-22'] }),
      makeHabit({ id: 'b', completedToday: false, completionHistory: ['2026-06-23'] }),
    ];

    const synced = syncAllHabitsDailyState(habits, '2026-06-23');
    expect(synced[0].completedToday).toBe(false);
    expect(synced[1].completedToday).toBe(true);
  });
});
