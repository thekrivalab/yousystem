"use client";

import { useState } from 'react';
import { Users, Heart, MessageCircle, Gift, Plus, X, Trash2, Pencil } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { Relationship } from '@/lib/types';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';

const typeColors: Record<string, string> = {
  family: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  friend: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  partner: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
  mentor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  colleague: 'bg-[var(--bg-elevated)] text-[var(--fg-subtle)] border border-zinc-700',
};

export default function RelationshipsPage() {
  const relationships = useLifeOSStore((s) => s.relationships);
  const addRelationship = useLifeOSStore((s) => s.addRelationship);
  const updateRelationship = useLifeOSStore((s) => s.updateRelationship);
  const removeRelationship = useLifeOSStore((s) => s.removeRelationship);
  const logInteraction = useLifeOSStore((s) => s.logInteraction);
  const { locale } = useThemeStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<Relationship['type']>('friend');
  const [birthday, setBirthday] = useState('');
  const [notes, setNotes] = useState('');
  const [importance, setImportance] = useState(7);
  const [frequency, setFrequency] = useState<Relationship['contactFrequency']>('monthly');

  const openModal = (person?: Relationship) => {
    if (person) {
      setEditingId(person.id);
      setName(person.name);
      setType(person.type);
      setBirthday(person.birthday || '');
      setNotes(person.notes || '');
      setImportance(person.importanceLevel);
      setFrequency(person.contactFrequency);
    } else {
      setEditingId(null);
      setName('');
      setType('friend');
      setBirthday('');
      setNotes('');
      setImportance(7);
      setFrequency('monthly');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      type,
      birthday: birthday || undefined,
      notes,
      importanceLevel: importance,
      contactFrequency: frequency
    };
    
    if (editingId) {
      updateRelationship(editingId, payload);
    } else {
      addRelationship(payload);
    }
    setShowModal(false);
  };

  const daysSince = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const sorted = [...relationships].sort((a, b) => b.importanceLevel - a.importanceLevel);

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{t(locale, 'relationships', 'title')}</h1>
            <p className="text-[var(--fg-subtle)]">{t(locale, 'relationships', 'subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="ui-button-primary">
            <Plus size={16} /> {t(locale, 'relationships', 'addPerson')}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map(person => {
            const days = person.lastInteraction ? daysSince(person.lastInteraction) : 999;
            const overdue = (person.contactFrequency === 'weekly' && days > 7) ||
                            (person.contactFrequency === 'monthly' && days > 30) ||
                            (person.contactFrequency === 'quarterly' && days > 90);
            return (
              <div key={person.id} className={`ui-card flex flex-col p-6 relative group transition-colors ${overdue ? 'ring-rose-500/30 hover:ring-rose-500/60' : 'hover:ring-[var(--accent)]/30'}`}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full ${overdue ? 'bg-gradient-to-r from-transparent via-rose-500 to-transparent' : 'bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent'}`} />

                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--fg-base)]">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColors[person.type] || typeColors.colleague}`}>
                      {t(locale, 'relationships', person.type)}
                    </span>
                    <button
                      onClick={() => openModal(person)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-blue-500/10 text-blue-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => removeRelationship(person.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-rose-500/10 text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-[var(--fg-base)] mb-1">{person.name}</h2>
                <div className="flex items-center gap-2 text-xs text-[var(--fg-subtle)] mb-4">
                  <Heart size={12} className="text-rose-500" />
                  {t(locale, 'relationships', 'importance')}: {person.importanceLevel}/10
                </div>

                <div className="space-y-2 mb-4">
                  {person.birthday && (
                    <div className="flex items-center gap-2 text-sm text-[var(--fg-subtle)]">
                      <Gift size={14} className="text-zinc-600 shrink-0" />
                      {new Date(person.birthday).toLocaleDateString(locale, { month: 'long', day: 'numeric' })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[var(--fg-subtle)]">
                    <MessageCircle size={14} className={`shrink-0 ${overdue ? 'text-rose-500' : 'text-zinc-600'}`} />
                    <span className={overdue ? 'text-rose-400' : ''}>
                      {days === 0 ? t(locale, 'relationships', 'today') : `${days} ${t(locale, 'relationships', 'daysAgo')}`} {overdue ? `— ${t(locale, 'relationships', 'dueToReconnect')}` : ''}
                    </span>
                  </div>
                </div>

                {person.notes && (
                  <div className="p-3 bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-xl mb-4">
                    <p className="text-xs text-[var(--fg-subtle)] line-clamp-2">{person.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => logInteraction(person.id)}
                  className="w-full text-xs py-2 rounded-lg ui-button-soft font-medium mt-auto hover:bg-[var(--bg-elevated)]"
                >
                  ✅ {t(locale, 'relationships', 'logInteraction')}
                </button>
              </div>
            );
          })}
        </div>

        {relationships.length === 0 && (
          <div className="ui-card p-12 text-center">
            <Users size={32} className="mx-auto mb-3 text-[var(--fg-subtle)]" />
            <p className="text-[var(--fg-muted)] mb-1">{t(locale, 'common', 'empty')}</p>
            <p className="text-sm text-[var(--fg-subtle)]">{t(locale, 'relationships', 'emptyDesc')}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">{editingId ? t(locale, 'common', 'edit') : t(locale, 'relationships', 'addPerson')}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{t(locale, 'relationships', 'name')}</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="ui-input focus:ring-[var(--accent)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'common', 'type')}</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="ui-input focus:ring-[var(--accent)]">
                    <option value="family">{t(locale, 'relationships', 'family')}</option>
                    <option value="friend">{t(locale, 'relationships', 'friend')}</option>
                    <option value="partner">{t(locale, 'relationships', 'partner')}</option>
                    <option value="mentor">{t(locale, 'relationships', 'mentor')}</option>
                    <option value="colleague">{t(locale, 'relationships', 'colleague')}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{t(locale, 'relationships', 'birthday')}</label>
                  <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="ui-input focus:ring-[var(--accent)]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'relationships', 'importance')}</label>
                  <input type="number" min={1} max={10} value={importance} onChange={e => setImportance(Number(e.target.value))} className="ui-input focus:ring-[var(--accent)]" />
                </div>
                <div>
                  <label className="ui-label">{t(locale, 'relationships', 'frequency')}</label>
                  <select value={frequency} onChange={(e: any) => setFrequency(e.target.value)} className="ui-input focus:ring-[var(--accent)]">
                    <option value="weekly">{t(locale, 'relationships', 'weekly')}</option>
                    <option value="monthly">{t(locale, 'relationships', 'monthly')}</option>
                    <option value="quarterly">{t(locale, 'relationships', 'quarterly')}</option>
                    <option value="yearly">{t(locale, 'relationships', 'yearly')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="ui-label">{t(locale, 'common', 'notes')}</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="ui-input focus:ring-[var(--accent)] h-16 resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="ui-button-ghost">{t(locale, 'common', 'cancel')}</button>
                <button type="submit" className="ui-button-primary">{t(locale, 'common', 'save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
