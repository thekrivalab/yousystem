"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Plus,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useRoutineStore } from '@/lib/routine-store';
import { useLifeOSStore } from '@/lib/store';
import { isHabitCompletedOnDate } from '@/lib/habit-daily';
import { getLocalDateString } from '@/lib/date';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';
import type { RoutineBlock } from '@/lib/types';

const PRESET_CATEGORIES = ['spiritual', 'work', 'learning', 'rest', 'social', 'personal', 'health'] as const;

const CATEGORY_STYLE: Record<string, { text: string; dot: string }> = {
  health: { text: 'text-emerald-500', dot: 'bg-emerald-500' },
  spiritual: { text: 'text-amber-500', dot: 'bg-amber-500' },
  work: { text: 'text-indigo-500', dot: 'bg-indigo-500' },
  learning: { text: 'text-blue-500', dot: 'bg-blue-500' },
  rest: { text: 'text-purple-500', dot: 'bg-purple-500' },
  social: { text: 'text-pink-500', dot: 'bg-pink-500' },
  personal: { text: 'text-zinc-500', dot: 'bg-zinc-500' },
};

const MOOD_EMOJI = ['😫', '😕', '😐', '😊', '🔥'];

function localIsoDate(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

function displayCategory(locale: 'en' | 'pt' | 'es', category: string) {
  const key = normalizeCategory(category);
  const translated = t(locale, 'routine', key);
  if (translated && translated !== key) return translated;
  const cleaned = category.trim();
  if (!cleaned) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function categoryStyle(category: string) {
  return CATEGORY_STYLE[normalizeCategory(category)] || CATEGORY_STYLE.personal;
}

export default function RoutinePage() {
  const { locale } = useThemeStore();
  const {
    blocks,
    logs,
    getBlocksForDate,
    getLog,
    getDayType,
    toggleComplete,
    setMood,
    setNotes,
    addBlock,
    removeBlock,
    resetToDefaults,
  } = useRoutineStore();
  const habits = useLifeOSStore((state) => state.habits);

  const [selectedDate, setSelectedDate] = useState(localIsoDate());
  const [showNotes, setShowNotes] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const [newTime, setNewTime] = useState('08:00');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('⭐');
  const [newCategory, setNewCategory] = useState('personal');
  const [newDuration, setNewDuration] = useState(30);
  const [newDayTypes, setNewDayTypes] = useState<RoutineBlock['dayTypes']>(['weekday']);

  const dayType = getDayType(selectedDate);
  const dayBlocks = useMemo(() => getBlocksForDate(selectedDate), [selectedDate, blocks, getBlocksForDate]);
  const log = useMemo(() => getLog(selectedDate), [selectedDate, logs, getLog]);
  const doneCount = dayBlocks.filter((block) => log.completedIds.includes(block.id)).length;
  const totalCount = dayBlocks.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  useEffect(() => {
    setNotesDraft(log.notes ?? '');
  }, [log.notes, selectedDate]);

  function shiftDate(days: number) {
    const next = new Date(`${selectedDate}T12:00:00`);
    next.setDate(next.getDate() + days);
    setSelectedDate(localIsoDate(next));
  }

  function resetForm() {
    setNewTime('08:00');
    setNewTitle('');
    setNewDesc('');
    setNewIcon('⭐');
    setNewCategory('personal');
    setNewDuration(30);
    setNewDayTypes(['weekday']);
    setEditingBlockId(null);
    setShowAddModal(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      time: newTime,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      icon: newIcon,
      category: normalizeCategory(newCategory) || 'personal',
      dayTypes: newDayTypes,
      durationMin: newDuration,
    };

    if (editingBlockId) {
      useRoutineStore.getState().updateBlock(editingBlockId, payload);
    } else {
      addBlock(payload);
    }

    resetForm();
  }

  function handleEdit(block: RoutineBlock, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingBlockId(block.id);
    setNewTime(block.time);
    setNewTitle(block.title);
    setNewDesc(block.description || '');
    setNewIcon(block.icon || '⭐');
    setNewCategory(block.category);
    setNewDuration(block.durationMin);
    setNewDayTypes(block.dayTypes);
    setShowAddModal(true);
  }

  function toggleDayType(type: RoutineBlock['dayTypes'][number]) {
    setNewDayTypes((prev) => (prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]));
  }

  const dateLocale = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US';
  const displayDate = new Date(`${selectedDate}T12:00:00`);
  const habitsToday = habits.filter((habit) => habit.frequency === 'daily');
  const isViewingToday = selectedDate === getLocalDateString();
  const habitsDone = habitsToday.filter((habit) => isHabitCompletedOnDate(habit, selectedDate)).length;
  const dayTypeLabel = t(locale, 'routine', dayType);

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--fg-base)' }}>
              {t(locale, 'routine', 'title')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              {t(locale, 'routine', 'subtitle')} - {dayTypeLabel}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="ui-button-soft"
            >
              <Plus size={16} />
              {t(locale, 'routine', 'addRoutine')}
            </button>
            <button
              onClick={resetToDefaults}
              className="ui-button-ghost"
              title={t(locale, 'common', 'back')}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </header>

        <div className="flex items-center gap-4">
          <button onClick={() => shiftDate(-1)} className="ui-button-ghost p-2">
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 ui-card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
                {displayDate.toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              {selectedDate === localIsoDate() && (
                <span className="text-xs font-semibold text-emerald-500">{t(locale, 'routine', 'today')}</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: 'var(--fg-base)' }}>{pct}%</p>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {doneCount}/{totalCount} {t(locale, 'routine', 'blocks').toLowerCase()}
                </p>
              </div>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: `conic-gradient(var(--fg-base) ${pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--fg-base)' }}>{pct}%</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => shiftDate(1)} className="ui-button-ghost p-2">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="ui-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-muted)' }}>
            {t(locale, 'routine', 'habits')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {habitsToday.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--fg-subtle)] sm:col-span-2">
                {t(locale, 'common', 'empty')}
              </div>
            ) : (
              habitsToday.map((habit) => {
                const isDone = isHabitCompletedOnDate(habit, selectedDate);
                return (
                <button
                  key={habit.id}
                  onClick={() => {
                    if (isViewingToday) {
                      useLifeOSStore.getState().toggleHabit(habit.id);
                    }
                  }}
                  disabled={!isViewingToday}
                  className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:brightness-110 group disabled:cursor-default disabled:hover:brightness-100"
                  style={{
                    backgroundColor: isDone ? 'color-mix(in srgb, var(--fg-base) 8%, var(--bg-elevated))' : 'var(--bg-elevated)',
                    borderColor: isDone ? 'color-mix(in srgb, var(--fg-base) 30%, transparent)' : 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center border transition-colors"
                      style={{
                        backgroundColor: isDone ? 'var(--fg-base)' : 'transparent',
                        borderColor: isDone ? 'var(--fg-base)' : 'var(--border)',
                        color: isDone ? 'var(--bg-base)' : 'transparent',
                      }}
                    >
                      {isDone && <Check size={12} />}
                    </div>
                    <span className={`text-sm font-medium ${isDone ? 'line-through' : ''}`} style={{ color: isDone ? 'var(--fg-muted)' : 'var(--fg-base)' }}>
                      {habit.icon} {habit.name}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    🔥 {habit.streak}
                  </div>
                </button>
              );
              })
            )}
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--fg-muted)' }}>
            {habitsDone}/{habitsToday.length} {t(locale, 'common', 'done')}
          </p>
        </div>

        <div className="ui-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-muted)' }}>
            {t(locale, 'routine', 'mood')}
          </p>
          <div className="flex gap-3">
            {MOOD_EMOJI.map((emoji, index) => {
              const mood = (index + 1) as 1 | 2 | 3 | 4 | 5;
              const active = log.mood === mood;
              return (
                <button
                  key={emoji}
                  onClick={() => setMood(selectedDate, mood)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${active ? 'bg-indigo-500/15 ring-1 ring-indigo-500/40' : 'hover:bg-[var(--bg-surface)]'}`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-[10px]" style={{ color: active ? '#818cf8' : 'var(--fg-subtle)' }}>
                    {['Péssimo', 'Ruim', 'Neutro', 'Bom', 'Excelente'][index]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {dayBlocks.length === 0 && (
            <div className="ui-card p-8 text-center">
              <p className="text-4xl mb-3">🕊️</p>
              <p className="font-semibold" style={{ color: 'var(--fg-base)' }}>
                {t(locale, 'common', 'empty')}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
                {dayType === 'sunday' ? t(locale, 'routine', 'sunday') : t(locale, 'routine', 'emptyDesc')}
              </p>
            </div>
          )}

          {dayBlocks.map((block) => {
            const done = log.completedIds.includes(block.id);
            const style = categoryStyle(block.category);

            return (
              <button
                key={block.id}
                onClick={() => toggleComplete(selectedDate, block.id)}
                className="w-full text-left ui-card p-4 flex items-center gap-4 transition-all hover:brightness-110 group"
                style={{
                  opacity: done ? 0.75 : 1,
                  borderColor: done ? 'rgba(16,185,129,0.3)' : undefined,
                }}
              >
                <div className="shrink-0">
                  {done ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} style={{ color: 'var(--fg-subtle)' }} />}
                </div>

                <div className="flex flex-col items-center w-12 shrink-0">
                  <span className="text-xs font-mono font-semibold" style={{ color: 'var(--fg-muted)' }}>
                    {block.time}
                  </span>
                  <span className={`w-2 h-2 rounded-full mt-1 ${style.dot}`} />
                </div>

                <div className="text-xl shrink-0">{block.icon ?? '⭐'}</div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'line-through' : ''}`} style={{ color: done ? 'var(--fg-muted)' : 'var(--fg-base)' }}>
                    {block.title}
                  </p>
                  {block.description && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--fg-subtle)' }}>
                      {block.description}
                    </p>
                  )}
                </div>

                {block.durationMin > 0 && (
                  <span className="text-xs shrink-0" style={{ color: 'var(--fg-subtle)' }}>
                    {block.durationMin}min
                  </span>
                )}

                <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${style.text}`}>
                  {displayCategory(locale, block.category)}
                </span>

                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div onClick={(e) => handleEdit(block, e)} className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--fg-subtle)] hover:text-blue-400 transition-colors">
                    <Pencil size={16} />
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(block.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--fg-subtle)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="ui-card p-4">
          <button className="flex w-full items-center justify-between" onClick={() => setShowNotes((value) => !value)}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              {t(locale, 'routine', 'notes')}
            </p>
            <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
              {showNotes ? '▲' : '▼'}
            </span>
          </button>
          {showNotes && (
            <div className="mt-3">
              <textarea
                className="ui-input h-24 resize-none"
                placeholder={t(locale, 'routine', 'notes')}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={() => setNotes(selectedDate, notesDraft)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {PRESET_CATEGORIES.map((category) => (
            <span key={category} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--fg-muted)' }}>
              <span className={`w-2 h-2 rounded-full ${categoryStyle(category).dot}`} />
              {t(locale, 'routine', category)}
            </span>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold" style={{ color: 'var(--fg-base)' }}>
                {editingBlockId ? t(locale, 'common', 'edit') : t(locale, 'common', 'create')} {t(locale, 'routine', 'addRoutine')}
              </h2>
              <button onClick={resetForm} className="ui-button-ghost p-1.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'routine', 'time')}</label>
                  <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="ui-input" />
                </div>
                <div>
                  <label className="ui-label">{t(locale, 'routine', 'duration')}</label>
                  <input type="number" min={0} value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} className="ui-input" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="ui-label">{t(locale, 'routine', 'icon')}</label>
                  <input type="text" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className="ui-input text-center text-xl" maxLength={4} />
                </div>
                <div className="col-span-3">
                  <label className="ui-label">{t(locale, 'common', 'title')}</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="ui-input" placeholder="Ex: Meditação" required />
                </div>
              </div>

              <div>
                <label className="ui-label">{t(locale, 'common', 'description')}</label>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="ui-input" placeholder="Detalhes..." />
              </div>

              <div>
                <label className="ui-label">{t(locale, 'routine', 'category')}</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="ui-input"
                  placeholder={t(locale, 'routine', 'categoryInput')}
                  list="routine-category-options"
                />
                <datalist id="routine-category-options">
                  {PRESET_CATEGORIES.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                <p className="text-xs mt-2" style={{ color: 'var(--fg-subtle)' }}>
                  {t(locale, 'routine', 'categoryHint')}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {PRESET_CATEGORIES.map((category) => {
                    const active = normalizeCategory(newCategory) === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setNewCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${active ? 'border-[var(--fg-base)] text-[var(--fg-base)] bg-[var(--bg-elevated)]' : 'border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg-base)] hover:bg-[var(--bg-elevated)]'}`}
                      >
                        {t(locale, 'routine', category)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="ui-label">{t(locale, 'routine', 'dayType')}</label>
                <div className="flex gap-2">
                  {(['weekday', 'saturday', 'sunday'] as const).map((type) => {
                    const active = newDayTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleDayType(type)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${active ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40' : 'ring-1 ring-inset'}`}
                        style={!active ? { borderColor: 'var(--border)', color: 'var(--fg-muted)' } : undefined}
                      >
                        {t(locale, 'routine', type)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={resetForm} className="ui-button-ghost">
                  {t(locale, 'common', 'cancel')}
                </button>
                <button type="submit" className="ui-button-primary">
                  <Check size={15} />
                  {editingBlockId ? t(locale, 'common', 'save') : t(locale, 'common', 'create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
