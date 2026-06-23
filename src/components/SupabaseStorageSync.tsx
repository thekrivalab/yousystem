"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLifeOSStore } from '@/lib/store';
import { useRoutineStore } from '@/lib/routine-store';
import { useThemeStore } from '@/lib/theme-store';
import { ensureLocalStorageForUser } from '@/lib/auth-storage';
import {
  clearStorageSnapshot,
  loadSnapshotFromSupabase,
  mergeAtlasMapping,
  readStorageSnapshot,
  rehydratePersistedStores,
  saveSnapshotToSupabase,
  serializeStorageSnapshot,
  writeStorageSnapshot,
  buildSnapshotMeta,
  unsealSnapshot,
  reunlockVaultFromSession,
  sealLocalLifeOSStorage,
  lockVault,
  type StorageSnapshot,
} from '@/lib/storage-snapshot';
import {
  enqueueSync,
  readSyncQueue,
  dequeueSync,
  shouldRetrySync,
  syncRetryDelayMs,
  parseSyncMeta,
  SYNC_META_KEY,
  MAX_SYNC_RETRIES,
} from '@/lib/sync-engine';

const SAVE_DEBOUNCE_MS = 300;
const FLUSH_INTERVAL_MS = 15_000;

export function SupabaseStorageSync() {
  const [supabase] = useState(() => createClient());
  const activeUserIdRef = useRef<string | null>(null);
  const lastSerializedRef = useRef<string>('');
  const saveTimerRef = useRef<number | null>(null);
  const flushTimerRef = useRef<number | null>(null);
  const onlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);

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

      await sealLocalLifeOSStorage();

      const snapshot = readStorageSnapshot();
      const meta = buildSnapshotMeta(snapshot);
      snapshot[SYNC_META_KEY] = JSON.stringify(meta);

      const serialized = serializeStorageSnapshot(snapshot);
      if (!options?.force && serialized === lastSerializedRef.current) return;

      if (!onlineRef.current) {
        enqueueSync({ userId, snapshot, meta });
        return;
      }

      const { error } = await saveSnapshotToSupabase(supabase, userId, snapshot, meta);
      if (error) {
        enqueueSync({ userId, snapshot, meta });
        return;
      }

      lastSerializedRef.current = serialized;
      writeStorageSnapshot({ ...snapshot, [SYNC_META_KEY]: JSON.stringify(meta) });
    };

    const flushQueue = async () => {
      const userId = activeUserIdRef.current;
      if (!userId || !onlineRef.current) return;

      let item = dequeueSync(userId);
      while (item && mounted) {
        if (!shouldRetrySync(item)) break;

        const { error } = await saveSnapshotToSupabase(supabase, userId, item.snapshot, item.meta);
        if (error) {
          const failedAttempts = item.attempts;
          const nextAttempts = failedAttempts + 1;
          if (nextAttempts < MAX_SYNC_RETRIES) {
            enqueueSync({
              userId,
              snapshot: item.snapshot,
              meta: item.meta,
              attempts: nextAttempts,
            });
            await new Promise((r) => setTimeout(r, syncRetryDelayMs(failedAttempts)));
          }
          break;
        }

        lastSerializedRef.current = serializeStorageSnapshot(item.snapshot);
        item = dequeueSync(userId);
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

      await ensureLocalStorageForUser(userId);
      await reunlockVaultFromSession(userId);

      const localSnapshotBeforeHydration = readStorageSnapshot();
      const { data, error } = await loadSnapshotFromSupabase(supabase, userId);

      if (!mounted) return;

      if (!error && data?.payload && typeof data.payload === 'object' && Object.keys(data.payload).length > 0) {
        const remotePayload = data.payload as StorageSnapshot;
        const merged = mergeAtlasMapping(localSnapshotBeforeHydration, remotePayload);
        const unsealed = await unsealSnapshot(merged);
        clearStorageSnapshot();
        writeStorageSnapshot(unsealed);

        const remoteMeta = parseSyncMeta(remotePayload[SYNC_META_KEY]);
        if (remoteMeta) {
          merged[SYNC_META_KEY] = JSON.stringify(remoteMeta);
        }
      } else if (Object.keys(localSnapshotBeforeHydration).length > 0) {
        writeStorageSnapshot(localSnapshotBeforeHydration);
      }

      await rehydratePersistedStores();

      if (!mounted) return;

      const pending = readSyncQueue().filter((q) => q.userId === userId);
      if (pending.length > 0) {
        await flushQueue();
      } else {
        lastSerializedRef.current = serializeStorageSnapshot(readStorageSnapshot());
        await saveSnapshot(userId, { force: true });
      }
    };

    const bootstrap = async () => {
      const { data, error } = await supabase.auth.getUser();
      await startForUser(!error && data.user ? data.user.id : null);
    };

    void bootstrap();

    flushTimerRef.current = window.setInterval(() => {
      void flushQueue();
    }, FLUSH_INTERVAL_MS);

    const handleOnline = () => {
      onlineRef.current = true;
      void flushQueue();
    };

    const handleOffline = () => {
      onlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribeLife = useLifeOSStore.subscribe(() => scheduleSave());
    const unsubscribeRoutine = useRoutineStore.subscribe(() => scheduleSave());
    const unsubscribeTheme = useThemeStore.subscribe(() => scheduleSave());

    const handlePageHide = () => {
      const userId = activeUserIdRef.current;
      if (!userId) return;
      void saveSnapshot(userId, { force: true });
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
        lockVault();
        clearStorageSnapshot();
        activeUserIdRef.current = null;
        lastSerializedRef.current = '';
        void rehydratePersistedStores();
      }
    });

    return () => {
      mounted = false;
      stopTimer();
      if (flushTimerRef.current) {
        window.clearInterval(flushTimerRef.current);
      }
      unsubscribeLife();
      unsubscribeRoutine();
      unsubscribeTheme();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}
