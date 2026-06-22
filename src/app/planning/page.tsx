"use client";

import { useLifeOSStore } from '@/lib/store';
import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Award, Plus, CheckSquare, Square, Trash2, Pencil, X } from 'lucide-react';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';
import { PlanningEvent } from '@/lib/types';
import { getLocalDateString } from '@/lib/date';

export default function PlanningPage() {
  const planningEvents = useLifeOSStore((state) => state.planningEvents);
  const addPlanningEvent = useLifeOSStore((state) => state.addPlanningEvent);
  const updatePlanningEvent = useLifeOSStore((state) => state.updatePlanningEvent);
  const togglePlanningEvent = useLifeOSStore((state) => state.togglePlanningEvent);
  const removePlanningEvent = useLifeOSStore((state) => state.removePlanningEvent);
  
  const { locale } = useThemeStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [time, setTime] = useState('');
  const [type, setType] = useState<PlanningEvent['type']>('weekly_review');
  const [notes, setNotes] = useState('');

  const openModal = (event?: PlanningEvent) => {
    if (event) {
      setEditingId(event.id);
      setTitle(event.title);
      setDate(event.date);
      setTime(event.time || '');
      setType(event.type);
      setNotes(event.notes || '');
    } else {
      setEditingId(null);
      setTitle('');
      setDate(getLocalDateString());
      setTime('');
      setType('weekly_review');
      setNotes('');
    }
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const payload = {
      title, date, time: time || undefined, type, notes: notes || undefined
    };

    if (editingId) {
      updatePlanningEvent(editingId, payload);
    } else {
      addPlanningEvent(payload);
    }
    setShowAddModal(false);
  };

  const categories = [
    { name: t(locale, 'planning', 'weeklyReview'), type: 'weekly_review' },
    { name: t(locale, 'planning', 'monthlyReview'), type: 'monthly_review' },
    { name: t(locale, 'planning', 'annualReview'), type: 'annual_review' },
    { name: t(locale, 'planning', 'calendarEvent'), type: 'calendar' },
    { name: t(locale, 'planning', 'roadmapTask'), type: 'roadmap' }
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{t(locale, 'planning', 'title')}</h1>
            <p className="text-[var(--fg-subtle)]">{t(locale, 'planning', 'subtitle')}</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="ui-button-primary"
          >
            <Plus size={16} /> {t(locale, 'planning', 'addEvent')}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {categories.map(cat => {
              const items = planningEvents.filter(e => e.type === cat.type);
              return (
                <div key={cat.type} className="ui-card p-6">
                  <h2 className="text-lg font-semibold text-[var(--fg-base)] mb-4 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-[var(--accent)]" />
                    {cat.name}
                  </h2>
                  
                  {items.length === 0 ? (
                    <p className="text-xs text-[var(--fg-subtle)] italic">{t(locale, 'planning', 'emptyDesc')}</p>
                  ) : (
                    <div className="space-y-3">
                      {items.map(item => (
                        <div 
                          key={item.id} 
                          className="group flex items-start justify-between p-3 bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-xl hover:ring-[var(--accent)] transition-colors cursor-pointer"
                        >
                          <div className="flex gap-3" onClick={() => togglePlanningEvent(item.id)}>
                            <button className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)] pt-0.5">
                              {item.completed ? (
                                <CheckSquare className="text-emerald-500" size={18} />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                            <div>
                              <h3 className={`text-sm font-medium ${item.completed ? 'text-[var(--fg-subtle)] line-through' : 'text-[var(--fg-base)]'}`}>
                                {item.title}
                              </h3>
                              {item.notes && <p className="text-xs text-[var(--fg-subtle)] mt-1">{item.notes}</p>}
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-4">
                            <div className="text-right text-xs text-[var(--fg-subtle)] shrink-0">
                              <p>{item.date}</p>
                              {item.time && <p>{item.time}</p>}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); openModal(item); }}
                                className="p-1 rounded hover:bg-blue-500/10 text-blue-400"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); removePlanningEvent(item.id); }}
                                className="p-1 rounded hover:bg-rose-500/10 text-rose-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="ui-card p-6">
              <h3 className="text-md font-bold text-[var(--fg-base)] mb-4 flex items-center gap-2">
                <Award className="text-[var(--accent)]" size={18} />
                {t(locale, 'planning', 'weeklyReview')} Checklist
              </h3>
              <ul className="text-xs text-[var(--fg-subtle)] space-y-3 list-disc pl-4">
                <li>Check off all completed habits for the past week.</li>
                <li>Verify conquest progress metrics and update them.</li>
                <li>Clean up active side project lists.</li>
                <li>Write a memory of your week to look back on.</li>
                <li>Schedule critical tasks for the upcoming week.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">{editingId ? t(locale, 'common', 'edit') : t(locale, 'planning', 'addEvent')}</h2>
              <button onClick={() => setShowAddModal(false)}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{t(locale, 'common', 'title')}</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="ui-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'common', 'date')}</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="ui-input"
                    required
                  />
                </div>
                <div>
                  <label className="ui-label">{t(locale, 'planning', 'time')}</label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)}
                    className="ui-input"
                  />
                </div>
              </div>

              <div>
                <label className="ui-label">{t(locale, 'common', 'type')}</label>
                <select 
                  value={type} 
                  onChange={(e: any) => setType(e.target.value)}
                  className="ui-input"
                >
                  <option value="weekly_review">{t(locale, 'planning', 'weeklyReview')}</option>
                  <option value="monthly_review">{t(locale, 'planning', 'monthlyReview')}</option>
                  <option value="annual_review">{t(locale, 'planning', 'annualReview')}</option>
                  <option value="calendar">{t(locale, 'planning', 'calendarEvent')}</option>
                  <option value="roadmap">{t(locale, 'planning', 'roadmapTask')}</option>
                </select>
              </div>

              <div>
                <label className="ui-label">{t(locale, 'common', 'notes')}</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="ui-input h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="ui-button-ghost"
                >
                  {t(locale, 'common', 'cancel')}
                </button>
                <button 
                  type="submit" 
                  className="ui-button-primary"
                >
                  {t(locale, 'common', 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
