"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLifeOSStore } from '@/lib/store';
import { useRoutineStore } from '@/lib/routine-store';
import { useThemeStore } from '@/lib/theme-store';
import {
  clearStorageSnapshot,
  loadSnapshotFromSupabase,
  readStorageSnapshot,
  rehydratePersistedStores,
  saveSnapshotToSupabase,
  serializeStorageSnapshot,
  writeStorageSnapshot,
  type StorageSnapshot,
} from '@/lib/storage-snapshot';

const SAVE_DEBOUNCE_MS = 100;

export function SupabaseStorageSync() {
  const [supabase] = useState(() => createClient());
  const activeUserIdRef = useRef<string | null>(null);
  const lastSerializedRef = useRef<string>('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    const stopTimer = () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };

    const saveSnapshot = async (userId: string, options?: { force?: boolean }) => {
      if (!mounted) return;

      const snapshot = readStorageSnapshot();
      const serialized = serializeStorageSnapshot(snapshot);
      if (!options?.force && serialized === lastSerializedRef.current) return;

      const { error } = await saveSnapshotToSupabase(supabase, userId, snapshot);
      if (!error) {
        lastSerializedRef.current = serialized;
      }
    };

    const scheduleSave = () => {
      const userId = activeUserIdRef.current;
      if (!userId) return;

      stopTimer();
      saveTimerRef.current = window.setTimeout(() => {
        void saveSnapshot(userId);
      }, SAVE_DEBOUNCE_MS);
    };

    const startForUser = async (userId: string | null) => {
      stopTimer();

      if (!userId) {
        activeUserIdRef.current = null;
        await rehydratePersistedStores();
        lastSerializedRef.current = serializeStorageSnapshot(readStorageSnapshot());
        return;
      }

      activeUserIdRef.current = userId;

      const localSnapshotBeforeHydration = readStorageSnapshot();
      const { data, error } = await loadSnapshotFromSupabase(supabase, userId);

      if (!mounted) return;

      if (!error && data?.payload && typeof data.payload === 'object' && Object.keys(data.payload).length > 0) {
        clearStorageSnapshot();
        writeStorageSnapshot(data.payload as StorageSnapshot);
      } else if (Object.keys(localSnapshotBeforeHydration).length > 0) {
        writeStorageSnapshot(localSnapshotBeforeHydration);
      }

      await rehydratePersistedStores();

      if (!mounted) return;

      lastSerializedRef.current = serializeStorageSnapshot(readStorageSnapshot());
      await saveSnapshot(userId, { force: true });
    };

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      await startForUser(data.session?.user?.id ?? null);
    };

    void bootstrap();

    const unsubscribeLife = useLifeOSStore.subscribe(() => scheduleSave());
    const unsubscribeRoutine = useRoutineStore.subscribe(() => scheduleSave());
    const unsubscribeTheme = useThemeStore.subscribe(() => scheduleSave());

    const handlePageHide = () => {
      const userId = activeUserIdRef.current;
      if (!userId) return;
      void saveSnapshot(userId);
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        void startForUser(session.user.id);
        return;
      }

      if (event === 'SIGNED_OUT') {
        stopTimer();
        clearStorageSnapshot();
        activeUserIdRef.current = null;
        lastSerializedRef.current = '';
        void rehydratePersistedStores();
      }
    });

    return () => {
      mounted = false;
      stopTimer();
      unsubscribeLife();
      unsubscribeRoutine();
      unsubscribeTheme();
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}
