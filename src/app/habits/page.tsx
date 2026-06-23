"use client";

import { useState } from 'react';
import { CheckCircle2, Flame, Calendar as CalendarIcon, Plus, Trash2, Pencil } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { Habit } from '@/lib/types';
import { IconPicker } from '@/components/IconPicker';

const HABIT_ICON_OPTIONS = ['⭐', '🔥', '💪', '🧘', '📚', '🏃', '💧', '🧼', '🎯', '🛏️', '🍎', '✍️', '⚡', '☀️'];

export default function HabitsPage() {
  const { locale } = useThemeStore();
  const habits = useLifeOSStore((s) => s.habits);
  const toggleHabit = useLifeOSStore((s) => s.toggleHabit);
  const addHabit = useLifeOSStore((s) => s.addHabit);
  const updateHabit = useLifeOSStore((s) => s.updateHabit);
  const removeHabit = useLifeOSStore((s) => s.removeHabit);

  const [showModal, setShowModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [xp, setXp] = useState(20);

  const resetForm = () => {
    setName(''); setIcon('⭐'); setFrequency('daily'); setXp(20); setEditingHabitId(null);
  };

  const handleEditClick = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    setName(habit.name);
    setIcon(habit.icon);
    setFrequency(habit.frequency);
    setXp(habit.xpPerCompletion);
    setEditingHabitId(habit.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHabitId) {
      updateHabit(editingHabitId, { name, icon, frequency, xpPerCompletion: xp });
    } else {
      addHabit({ name, icon, frequency, category: 'Personal', xpPerCompletion: xp, color: '#6366f1' });
    }
    resetForm();
    setShowModal(false);
  };

  const daily = habits.filter(h => h.frequency === 'daily');
  const weekly = habits.filter(h => h.frequency === 'weekly');
  const doneCount = daily.filter(h => h.completedToday).length;

  const HabitCard = ({ habit }: { habit: Habit }) => (
    <div className={`ui-card ui-card-hover p-5 flex flex-col group transition-colors ${habit.completedToday ? 'ring-primary-500/50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h3 className={`font-semibold transition-colors ${habit.completedToday ? 'text-[var(--fg-subtle)] line-through' : 'text-[var(--fg-base)] group-hover:text-emerald-400'}`}>{habit.name}</h3>
            <p className="text-xs text-[var(--fg-subtle)] capitalize">{habit.frequency} • +{habit.xpPerCompletion} XP</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <button onClick={(e) => handleEditClick(e, habit)} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center transition-all hover:border-blue-500 text-[var(--fg-subtle)] hover:text-blue-500">
              <Pencil size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); removeHabit(habit.id); }} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center transition-all hover:border-red-500 text-[var(--fg-subtle)] hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
          <button onClick={() => toggleHabit(habit.id)} className={`w-full h-8 rounded-lg border flex items-center justify-center transition-all ${habit.completedToday ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--border)] hover:border-emerald-500'}`}>
            <CheckCircle2 size={18} className={habit.completedToday ? 'text-black' : 'text-zinc-600'} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-[var(--border)]">
        <div className="bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-xl p-2 flex flex-col items-center">
          <div className="flex items-center gap-1 text-orange-400 mb-1"><Flame size={14} /><span className="font-bold">{habit.streak}</span></div>
          <span className="text-[10px] text-[var(--fg-subtle)] uppercase font-semibold">Streak</span>
        </div>
        <div className="bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-xl p-2 flex flex-col items-center">
          <div className="flex items-center gap-1 text-blue-400 mb-1"><CalendarIcon size={14} /><span className="font-bold">{habit.successRate}%</span></div>
          <span className="text-[10px] text-[var(--fg-subtle)] uppercase font-semibold">Success</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">
              {locale === 'pt' ? 'Hábitos' : locale === 'es' ? 'Hábitos' : 'Habit Tracker'}
            </h1>
            <p className="text-[var(--fg-subtle)]">
              {locale === 'pt' ? 'Construa consistência, ganhe XP.' : locale === 'es' ? 'Construye consistencia, gana XP.' : 'Build consistency, earn XP.'}{' '}
              <span className="text-emerald-400 font-semibold">{doneCount}/{daily.length} {locale === 'pt' ? 'diários feitos hoje' : locale === 'es' ? 'diarios hechos hoy' : 'daily done today.'}</span>
            </p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="ui-button-primary">
            <Plus size={16} /> {locale === 'pt' ? 'Novo hábito' : locale === 'es' ? 'Nuevo hábito' : 'New Habit'}
          </button>
        </header>

        {daily.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-4">📅 {locale === 'pt' ? 'Diários' : locale === 'es' ? 'Diarios' : 'Daily'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daily.map(h => <HabitCard key={h.id} habit={h} />)}
            </div>
          </section>
        )}

        {weekly.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-4">📆 {locale === 'pt' ? 'Semanais' : locale === 'es' ? 'Semanales' : 'Weekly'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekly.map(h => <HabitCard key={h.id} habit={h} />)}
            </div>
          </section>
        )}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <h2 className="text-xl font-bold text-[var(--fg-base)]">
              {editingHabitId ? (locale === 'pt' ? 'Editar hábito' : locale === 'es' ? 'Editar hábito' : 'Edit Habit') : (locale === 'pt' ? 'Novo hábito' : locale === 'es' ? 'Nuevo hábito' : 'New Habit')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <IconPicker
                  label={locale === 'pt' ? 'Ícone' : locale === 'es' ? 'Ícono' : 'Icon'}
                  value={icon}
                  onChange={setIcon}
                  options={HABIT_ICON_OPTIONS}
                  helperText={locale === 'pt' ? 'Escolha um emoji' : locale === 'es' ? 'Elige un emoji' : 'Pick an emoji'}
                />
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Nome do hábito' : locale === 'es' ? 'Nombre del hábito' : 'Habit Name'}</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning run" className="ui-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Frequência' : locale === 'es' ? 'Frecuencia' : 'Frequency'}</label>
                  <select value={frequency} onChange={(e: any) => setFrequency(e.target.value)} className="ui-input">
                    <option value="daily">{locale === 'pt' ? 'Diário' : locale === 'es' ? 'Diario' : 'Daily'}</option>
                    <option value="weekly">{locale === 'pt' ? 'Semanal' : locale === 'es' ? 'Semanal' : 'Weekly'}</option>
                    <option value="monthly">{locale === 'pt' ? 'Mensal' : locale === 'es' ? 'Mensual' : 'Monthly'}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'XP por conclusão' : locale === 'es' ? 'XP por completado' : 'XP per completion'}</label>
                  <input type="number" min={5} max={500} value={xp} onChange={e => setXp(Number(e.target.value))} className="ui-input" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { resetForm(); setShowModal(false); }} className="ui-button-ghost">{locale === 'pt' ? 'Cancelar' : locale === 'es' ? 'Cancelar' : 'Cancel'}</button>
                <button type="submit" className="ui-button-primary">{editingHabitId ? (locale === 'pt' ? 'Salvar' : locale === 'es' ? 'Guardar' : 'Save') : (locale === 'pt' ? 'Adicionar hábito' : locale === 'es' ? 'Agregar hábito' : 'Add Habit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
