"use client";

import { useState } from 'react';
import { Trophy, Plus, Flame, ChevronUp, Trash2, Pencil } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { Goal } from '@/lib/types';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';
import { getLocalDateString } from '@/lib/date';

const typeColors: Record<string, string> = {
  annual: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  quarterly: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  longterm: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

export default function ConquistasPage() {
  const { locale } = useThemeStore();
  const goals = useLifeOSStore((s) => s.goals);
  const addGoal = useLifeOSStore((s) => s.addGoal);
  const updateGoalProgress = useLifeOSStore((s) => s.updateGoalProgress);
  const updateGoalStatus = useLifeOSStore((s) => s.updateGoalStatus);
  const updateGoal = useLifeOSStore((s) => s.updateGoal);
  const removeGoal = useLifeOSStore((s) => s.removeGoal);

  const [showModal, setShowModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Goal['type']>('annual');
  const [category, setCategory] = useState('Personal');
  const [deadline, setDeadline] = useState('');
  const [xpReward, setXpReward] = useState(200);

  const resetForm = () => {
    setTitle(''); setDescription(''); setType('annual'); setCategory('Personal'); setDeadline(''); setXpReward(200); setEditingGoalId(null);
  };

  const handleEditClick = (e: React.MouseEvent, goal: Goal) => {
    e.stopPropagation();
    setTitle(goal.title);
    setDescription(goal.description);
    setType(goal.type);
    setCategory(goal.category);
    setDeadline(goal.deadline);
    setXpReward(goal.xpReward);
    setEditingGoalId(goal.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoalId) {
      updateGoal(editingGoalId, { title, description, type, category, deadline, xpReward });
    } else {
      addGoal({
        title,
        description,
        type,
        category,
        status: 'not_started',
        progress: 0,
        deadline: deadline || getLocalDateString(new Date(new Date().getFullYear(), 11, 31)),
        xpReward,
      });
    }
    resetForm();
    setShowModal(false);
  };

  const grouped = {
    in_progress: goals.filter(g => g.status === 'in_progress'),
    not_started: goals.filter(g => g.status === 'not_started'),
    completed: goals.filter(g => g.status === 'completed'),
  };

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2 flex items-center gap-2"><Trophy size={28} className="text-amber-500" />{locale === 'pt' ? 'Conquistas' : locale === 'es' ? 'Logros' : 'Achievements'}</h1>
            <p className="text-[var(--fg-subtle)]">{locale === 'pt' ? 'Resultados, marcos e vitórias que já saíram do papel.' : locale === 'es' ? 'Resultados, hitos y victorias que ya se hicieron realidad.' : 'Results, milestones, and wins you have already made real.'}</p>
          </div>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="ui-button-primary">
            <Plus size={16} /> {locale === 'pt' ? 'Nova conquista' : locale === 'es' ? 'Nuevo logro' : 'New Achievement'}
            </button>
        </header>

        {(['in_progress', 'not_started', 'completed'] as const).map(status => {
          const items = grouped[status];
          if (!items.length) return null;
          return (
            <section key={status}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-4">
                {status === 'in_progress'
                  ? `🔥 ${locale === 'pt' ? 'Em progresso' : locale === 'es' ? 'En progreso' : 'In Progress'}`
                  : status === 'not_started'
                    ? `⏳ ${locale === 'pt' ? 'Ainda não iniciada' : locale === 'es' ? 'Aún no iniciada' : 'Not Started'}`
                    : `🏆 ${locale === 'pt' ? 'Concluída' : locale === 'es' ? 'Completada' : 'Completed'}`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(goal => (
                  <div key={goal.id} className="ui-card ui-card-hover p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColors[goal.type] || typeColors.annual}`}>
                        {goal.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--fg-subtle)] font-medium">+{goal.xpReward} XP</span>
                        <button 
                          onClick={(e) => handleEditClick(e, goal)}
                          className="text-[var(--fg-subtle)] hover:text-blue-500 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeGoal(goal.id); }}
                          className="text-[var(--fg-subtle)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--fg-base)] mb-1 group-hover:text-purple-400 transition-colors">{goal.title}</h3>
                      <p className="text-xs text-[var(--fg-subtle)] line-clamp-2">{goal.description}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
                <span className="text-[var(--fg-subtle)]">{t(locale, 'common', 'progress')}</span>
                        <span className="text-[var(--fg-base)]">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-primary-500 transition-all" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <div className="flex gap-2">
                        {goal.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                              className="flex-1 text-xs py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                            >
                              +10%
                            </button>
                            <button
                              onClick={() => updateGoalStatus(goal.id, 'completed')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                            {locale === 'pt' ? 'Concluída ✓' : locale === 'es' ? 'Completada ✓' : 'Done ✓'}
                            </button>
                          </>
                        )}
                        {goal.status === 'not_started' && (
                          <button
                            onClick={() => updateGoalStatus(goal.id, 'in_progress')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            {locale === 'pt' ? 'Iniciar' : locale === 'es' ? 'Comenzar' : 'Start'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">
                {editingGoalId ? (locale === 'pt' ? 'Editar conquista' : locale === 'es' ? 'Editar logro' : 'Edit Achievement') : (locale === 'pt' ? 'Nova conquista' : locale === 'es' ? 'Nuevo logro' : 'New Achievement')}
              </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Título da conquista' : locale === 'es' ? 'Título del logro' : 'Achievement Title'}</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder={locale === 'pt' ? 'Ex.: Correr uma maratona' : locale === 'es' ? 'Ej.: Correr un maratón' : 'e.g. Run a marathon'} className="ui-input" />
              </div>
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Descrição da conquista' : locale === 'es' ? 'Descripción del logro' : 'Achievement Description'}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="ui-input h-20 resize-none" placeholder={locale === 'pt' ? 'Como essa conquista será reconhecida?' : locale === 'es' ? '¿Cómo se verá este logro?' : 'What does success look like?'} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'common', 'type')}</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="ui-input">
                    <option value="annual">{locale === 'pt' ? 'Anual' : locale === 'es' ? 'Anual' : 'Annual'}</option>
                    <option value="quarterly">{locale === 'pt' ? 'Trimestral' : locale === 'es' ? 'Trimestral' : 'Quarterly'}</option>
                    <option value="longterm">{locale === 'pt' ? 'Longo prazo' : locale === 'es' ? 'Largo plazo' : 'Long term'}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Prazo' : locale === 'es' ? 'Fecha límite' : 'Deadline'}</label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="ui-input" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { resetForm(); setShowModal(false); }} className="ui-button-ghost">{t(locale, 'common', 'cancel')}</button>
                <button type="submit" className="ui-button-primary">{editingGoalId ? (locale === 'pt' ? 'Salvar conquista' : locale === 'es' ? 'Guardar logro' : 'Save Achievement') : (locale === 'pt' ? 'Criar conquista' : locale === 'es' ? 'Crear logro' : 'Create Achievement')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
