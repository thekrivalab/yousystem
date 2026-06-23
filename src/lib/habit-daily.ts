import { getLocalDateString } from '@/lib/date';
import { safePercentage } from '@/lib/calculations';
import type { Habit } from '@/lib/types';

function shiftDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

export function isHabitCompletedOnDate(habit: Habit, dateStr: string): boolean {
  return (habit.completionHistory ?? []).includes(dateStr);
}

export function calculateHabitStreak(history: string[], todayStr: string): number {
  const dates = new Set(history);
  let streak = 0;
  let cursor = dates.has(todayStr) ? todayStr : shiftDateStr(todayStr, -1);

  while (dates.has(cursor)) {
    streak++;
    cursor = shiftDateStr(cursor, -1);
  }

  return streak;
}

export function syncHabitDailyState(habit: Habit, todayStr = getLocalDateString()): Habit {
  const history = habit.completionHistory ?? [];
  const completedToday = history.includes(todayStr);
  const streak = calculateHabitStreak(history, todayStr);
  const longestStreak = Math.max(habit.longestStreak, streak);

  const createdDate = new Date(habit.createdAt || todayStr);
  const todayStart = new Date(`${todayStr}T12:00:00`);
  const createdStart = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
  const daysSinceCreation = Math.max(
    1,
    Math.floor((todayStart.getTime() - createdStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return {
    ...habit,
    completedToday,
    streak,
    longestStreak,
    successRate: safePercentage(history.length, daysSinceCreation),
  };
}

export function syncAllHabitsDailyState(habits: Habit[], todayStr = getLocalDateString()): Habit[] {
  return habits.map((habit) => syncHabitDailyState(habit, todayStr));
}
