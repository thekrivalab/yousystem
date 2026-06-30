"use client";

import { useState } from 'react';
import { HeartPulse, Activity, Droplets, Moon, Plus, X, Zap, Trash2, Pencil } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';
import { HealthEntry } from '@/lib/types';
import { safeAverage } from '@/lib/calculations';

export default function HealthPage() {
  const healthEntries = useLifeOSStore((s) => s.healthEntries);
  const addHealthEntry = useLifeOSStore((s) => s.addHealthEntry);
  const updateHealthEntry = useLifeOSStore((s) => s.updateHealthEntry);
  const removeHealthEntry = useLifeOSStore((s) => s.removeHealthEntry);
  const { locale } = useThemeStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [water, setWater] = useState('2');
  const [sleep, setSleep] = useState('8');
  const [mood, setMood] = useState(3);
  const [exercised, setExercised] = useState(false);

  const openModal = (entry?: HealthEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setWeight(entry.weight?.toString() || '');
      setBodyFat(entry.bodyFat?.toString() || '');
      setWater(entry.waterLiters?.toString() || '2');
      setSleep(entry.sleepHours?.toString() || '8');
      setMood(entry.mood);
      setExercised(entry.exercisedToday);
    } else {
      setEditingId(null);
      setWeight('');
      setBodyFat('');
      setWater('2');
      setSleep('8');
      setMood(3);
      setExercised(false);
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      weight: Number(weight) || 0,
      bodyFat: Number(bodyFat) || 0,
      waterLiters: Number(water),
      sleepHours: Number(sleep),
      mood: mood as 1 | 2 | 3 | 4 | 5,
      exercisedToday: exercised,
    };

    if (editingId) {
      updateHealthEntry(editingId, payload);
    } else {
      addHealthEntry(payload);
    }
    setShowModal(false);
  };

  const latest = healthEntries[0];
  const avgWater = healthEntries.length ? safeAverage(healthEntries.map((entry) => entry.waterLiters ?? 0)).toFixed(1) : '—';
  const avgSleep = healthEntries.length ? safeAverage(healthEntries.map((entry) => entry.sleepHours ?? 0)).toFixed(1) : '—';
  const moodEmojis = ['😖', '😞', '😐', '🙂', '😁'];
  const heading = locale === 'pt' ? 'Saúde e bem-estar' : locale === 'es' ? 'Salud y bienestar' : 'Health & Fitness';
  const subtitle = locale === 'pt' ? 'Acompanhe suas métricas físicas e bem-estar diário.' : locale === 'es' ? 'Sigue tus métricas físicas y bienestar diario.' : 'Track your physical metrics and daily wellbeing.';

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{heading}</h1>
            <p className="text-[var(--fg-subtle)]">{subtitle}</p>
          </div>
          <button onClick={() => openModal()} className="ui-button-primary">
            <Plus size={16} /> {locale === 'pt' ? 'Registrar hoje' : locale === 'es' ? 'Registrar hoy' : 'Log Today'}
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="ui-card p-5">
            <div className="flex items-center gap-2 mb-2 text-rose-500"><Activity size={18} /><span className="text-sm font-medium">{locale === 'pt' ? 'Peso' : locale === 'es' ? 'Peso' : 'Weight'}</span></div>
            <p className="text-3xl font-bold text-[var(--fg-base)] mb-1">{latest?.weight ?? '—'} <span className="text-lg text-[var(--fg-subtle)]">kg</span></p>
          </div>
          <div className="ui-card p-5">
            <div className="flex items-center gap-2 mb-2 text-orange-500"><HeartPulse size={18} /><span className="text-sm font-medium">{locale === 'pt' ? 'Gordura corporal' : locale === 'es' ? 'Grasa corporal' : 'Body Fat'}</span></div>
            <p className="text-3xl font-bold text-[var(--fg-base)] mb-1">{latest?.bodyFat ?? '—'} <span className="text-lg text-[var(--fg-subtle)]">%</span></p>
          </div>
          <div className="ui-card p-5">
            <div className="flex items-center gap-2 mb-2 text-cyan-500"><Droplets size={18} /><span className="text-sm font-medium">{locale === 'pt' ? 'Média de água' : locale === 'es' ? 'Promedio de agua' : 'Water Avg'}</span></div>
            <p className="text-3xl font-bold text-[var(--fg-base)] mb-1">{avgWater} <span className="text-lg text-[var(--fg-subtle)]">L</span></p>
          </div>
          <div className="ui-card p-5">
            <div className="flex items-center gap-2 mb-2 text-indigo-500"><Moon size={18} /><span className="text-sm font-medium">{locale === 'pt' ? 'Média de sono' : locale === 'es' ? 'Promedio de sueño' : 'Sleep Avg'}</span></div>
            <p className="text-3xl font-bold text-[var(--fg-base)] mb-1">{avgSleep} <span className="text-lg text-[var(--fg-subtle)]">h</span></p>
          </div>
        </div>

        <div className="ui-card p-6">
          <h3 className="text-lg font-semibold text-[var(--fg-base)] mb-4">{locale === 'pt' ? 'Registros recentes' : locale === 'es' ? 'Registros recientes' : 'Recent Logs'}</h3>
          {healthEntries.length === 0 ? (
            <p className="text-[var(--fg-subtle)] text-sm italic text-center py-8">{locale === 'pt' ? 'Nenhum registro ainda. Registre seu primeiro dia acima!' : locale === 'es' ? 'Aún no hay registros. Registra tu primer día arriba.' : 'No entries yet. Log your first day above!'}</p>
          ) : (
            <div className="space-y-3">
              {healthEntries.map(entry => (
                <div key={entry.id} className="group flex items-center justify-between p-4 bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-xl hover:ring-[var(--accent)] transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16">
                      <p className="text-sm font-semibold text-[var(--fg-base)]">{new Date(entry.date).toLocaleDateString(locale, { weekday: 'short' })}</p>
                      <p className="text-xs text-[var(--fg-subtle)]">{new Date(entry.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex flex-col"><span className="text-[var(--fg-subtle)] text-xs">{locale === 'pt' ? 'Peso' : locale === 'es' ? 'Peso' : 'Weight'}</span><span className="text-[var(--fg-base)]">{entry.weight} kg</span></div>
                      <div className="flex flex-col"><span className="text-[var(--fg-subtle)] text-xs">{locale === 'pt' ? 'Água' : locale === 'es' ? 'Agua' : 'Water'}</span><span className="text-[var(--fg-base)]">{entry.waterLiters} L</span></div>
                      <div className="flex flex-col"><span className="text-[var(--fg-subtle)] text-xs">{locale === 'pt' ? 'Sono' : locale === 'es' ? 'Sueño' : 'Sleep'}</span><span className="text-[var(--fg-base)]">{entry.sleepHours} h</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{moodEmojis[entry.mood - 1]}</span>
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${entry.exercisedToday ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[var(--bg-elevated)] text-[var(--fg-subtle)] border border-[var(--border)]'}`}>
                      {entry.exercisedToday ? (locale === 'pt' ? '💪 Treinei' : locale === 'es' ? '💪 Entrené' : '💪 Worked Out') : (locale === 'pt' ? 'Descanso' : locale === 'es' ? 'Descanso' : 'Rest')}
                    </div>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(entry)}
                        className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">{editingId ? t(locale, 'common', 'edit') : locale === 'pt' ? 'Registrar saúde de hoje' : locale === 'es' ? 'Registrar salud de hoy' : 'Log Today\'s Health'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Peso (kg)' : locale === 'es' ? 'Peso (kg)' : 'Weight (kg)'}</label>
                  <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="ui-input focus:ring-[var(--accent)]" placeholder="78.5" />
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Gordura corporal (%)' : locale === 'es' ? 'Grasa corporal (%)' : 'Body Fat (%)'}</label>
                  <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} className="ui-input focus:ring-[var(--accent)]" placeholder="17" />
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Água (L)' : locale === 'es' ? 'Agua (L)' : 'Water (L)'}</label>
                  <input type="number" step="0.1" value={water} onChange={e => setWater(e.target.value)} className="ui-input focus:ring-[var(--accent)]" />
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Sono (h)' : locale === 'es' ? 'Sueño (h)' : 'Sleep (h)'}</label>
                  <input type="number" step="0.5" value={sleep} onChange={e => setSleep(e.target.value)} className="ui-input focus:ring-[var(--accent)]" />
                </div>
              </div>

              <div>
                <label className="ui-label">{locale === 'pt' ? 'Humor' : locale === 'es' ? 'Humor' : 'Mood'}</label>
                <div className="flex gap-3 justify-between">
                  {moodEmojis.map((emoji, i) => (
                    <button key={i} type="button" onClick={() => setMood(i + 1)}
                      className={`text-2xl w-10 h-10 rounded-xl transition-all ${mood === i + 1 ? 'bg-[var(--bg-elevated)] scale-110 ring-2 ring-[var(--accent)]' : 'hover:scale-105'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="ui-label">{locale === 'pt' ? 'Treinou hoje?' : locale === 'es' ? '¿Entrenaste hoy?' : 'Exercised Today?'}</label>
                <button type="button" onClick={() => setExercised(!exercised)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${exercised ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]' : 'bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] text-[var(--fg-subtle)]'}`}>
                  <Zap size={16} /> {exercised ? (locale === 'pt' ? 'Sim, treinei! 💪' : locale === 'es' ? 'Sí, entrené! 💪' : 'Yes, I worked out! 💪') : (locale === 'pt' ? 'Não, dia de descanso' : locale === 'es' ? 'No, día de descanso' : 'No, rest day')}
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="ui-button-ghost">{t(locale, 'common', 'cancel')}</button>
                <button type="submit" className="ui-button-primary">{t(locale, 'common', 'save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onCancel={() => setDeleteId(null)} 
        onConfirm={() => { if (deleteId) removeHealthEntry(deleteId); }} 
        title={locale === 'pt' ? 'Deletar registro?' : locale === 'es' ? '¿Eliminar registro?' : 'Delete log?'}
      />
    </div>
  );
}
