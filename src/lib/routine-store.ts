import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoutineBlock, DailyLog, DayType } from './types';

interface RoutineState {
  blocks: RoutineBlock[];
  logs: DailyLog[];

  // Block management
  addBlock: (block: Omit<RoutineBlock, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<RoutineBlock>) => void;
  removeBlock: (id: string) => void;
  resetToDefaults: () => void;

  // Daily log
  toggleComplete: (date: string, blockId: string) => void;
  setMood: (date: string, mood: DailyLog['mood']) => void;
  setNotes: (date: string, notes: string) => void;
  getLog: (date: string) => DailyLog;
  getBlocksForDate: (date: string) => RoutineBlock[];
  getDayType: (date: string) => DayType;
}

function getDayType(dateStr: string): DayType {
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone issues
  const day = d.getDay(); // 0=Sun,1=Mon,...,6=Sat
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      blocks: [],
      logs: [],

      addBlock: (block) => {
        const newBlock: RoutineBlock = { ...block, id: `rb_${Date.now()}` };
        set((s) => ({ blocks: [...s.blocks, newBlock] }));
      },

      updateBlock: (id, updates) => {
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      removeBlock: (id) => {
        set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) }));
      },

      resetToDefaults: () => {
        set({ blocks: [] });
      },

      toggleComplete: (date, blockId) => {
        set((s) => {
          const existing = s.logs.find((l) => l.date === date);
          if (existing) {
            const has = existing.completedIds.includes(blockId);
            return {
              logs: s.logs.map((l) =>
                l.date === date
                  ? {
                      ...l,
                      completedIds: has
                        ? l.completedIds.filter((id) => id !== blockId)
                        : [...l.completedIds, blockId],
                    }
                  : l
              ),
            };
          }
          return {
            logs: [...s.logs, { date, completedIds: [blockId] }],
          };
        });
      },

      setMood: (date, mood) => {
        set((s) => {
          const exists = s.logs.find((l) => l.date === date);
          if (exists) return { logs: s.logs.map((l) => (l.date === date ? { ...l, mood } : l)) };
          return { logs: [...s.logs, { date, completedIds: [], mood }] };
        });
      },

      setNotes: (date, notes) => {
        set((s) => {
          const exists = s.logs.find((l) => l.date === date);
          if (exists) return { logs: s.logs.map((l) => (l.date === date ? { ...l, notes } : l)) };
          return { logs: [...s.logs, { date, completedIds: [], notes }] };
        });
      },

      getLog: (date) => {
        return get().logs.find((l) => l.date === date) ?? { date, completedIds: [] };
      },

      getBlocksForDate: (date) => {
        const dayType = getDayType(date);
        return get()
          .blocks.filter((b) => b.dayTypes.includes(dayType))
          .sort((a, b) => a.time.localeCompare(b.time));
      },

      getDayType: (date) => getDayType(date),
    }),
    { name: 'life-os-routine' }
  )
);
