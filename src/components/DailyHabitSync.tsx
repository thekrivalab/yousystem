"use client";

import { useEffect, useRef } from 'react';
import { getLocalDateString } from '@/lib/date';
import { useLifeOSStore } from '@/lib/store';

export function DailyHabitSync() {
  const refreshDailyHabits = useLifeOSStore((state) => state.refreshDailyHabits);
  const lastDateRef = useRef(getLocalDateString());

  useEffect(() => {
    refreshDailyHabits();

    const interval = window.setInterval(() => {
      const today = getLocalDateString();
      if (today !== lastDateRef.current) {
        lastDateRef.current = today;
        refreshDailyHabits();
      }
    }, 60_000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshDailyHabits();
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshDailyHabits]);

  return null;
}
