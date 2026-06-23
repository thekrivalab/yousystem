"use client";

import { useState, useRef } from 'react';
import { Camera, Plus, Link as LinkIcon, Star, Trash2, Pencil, Image as ImageIcon, X } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { DreamItem } from '@/lib/types';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';
import { validateImageUpload } from '@/lib/upload-validation';

export default function DreamsPage() {
  const dreamItems = useLifeOSStore((s) => s.dreamItems);
  const addDreamItem = useLifeOSStore((s) => s.addDreamItem);
  const updateDreamItem = useLifeOSStore((s) => s.updateDreamItem);
  const removeDreamItem = useLifeOSStore((s) => s.removeDreamItem);
  
  const { locale } = useThemeStore();

  const typeConfig: Record<DreamItem['type'], { label: string; color: string; bg: string }> = {
    destination: { label: t(locale, 'dreams', 'destination'), color: 'text-[var(--accent)]', bg: 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]' },
    goal:        { label: t(locale, 'dreams', 'goal'),        color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
    experience:  { label: t(locale, 'dreams', 'experience'),  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
    quote:       { label: t(locale, 'dreams', 'quote'),       color: 'text-amber-400',  bg: 'bg-amber-500/10 border border-amber-500/20' },
    object:      { label: t(locale, 'dreams', 'object'),      color: 'text-rose-400',   bg: 'bg-rose-500/10 border border-rose-500/20' },
    image:       { label: t(locale, 'dreams', 'image'),       color: 'text-sky-400',    bg: 'bg-sky-500/10 border border-sky-500/20' },
  };

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DreamItem['type']>('destination');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('#1e1b4b');
  const [filter, setFilter] = useState<DreamItem['type'] | 'all'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateImageUpload(file);
    if (!validation.ok) {
      alert(validation.error);
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (item: DreamItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setType(item.type);
    setImageUrl(item.imageUrl || '');
    setColor(item.color || '#1e1b4b');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setType('destination');
    setImageUrl('');
    setColor('#1e1b4b');
    setShowModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateDreamItem(editingId, {
        title,
        type,
        imageUrl: imageUrl || undefined,
        color: imageUrl ? undefined : color,
      });
    } else {
      addDreamItem({
        title,
        type,
        imageUrl: imageUrl || undefined,
        color: imageUrl ? undefined : color,
        x: 0, y: 0, width: 280, height: 200,
      });
    }
    resetForm();
  };

  const filtered = filter === 'all' ? dreamItems : dreamItems.filter(d => d.type === filter);
  const types = Object.keys(typeConfig) as DreamItem['type'][];

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{t(locale, 'dreams', 'title')}</h1>
            <p className="text-[var(--fg-subtle)]">{t(locale, 'dreams', 'subtitle')}</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="ui-button-primary shrink-0"
          >
            <Plus size={16} /> {t(locale, 'dreams', 'addDream')}
          </button>
        </header>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-[var(--fg-base)] text-[var(--bg-base)]' : 'bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] text-[var(--fg-subtle)] hover:text-[var(--fg-base)]'}`}
          >
            {t(locale, 'dreams', 'all')} ({dreamItems.length})
          </button>
          {types.map(t => {
            const cfg = typeConfig[t];
            const count = dreamItems.filter(d => d.type === t).length;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === t ? `${cfg.bg} ${cfg.color}` : 'bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] text-[var(--fg-subtle)] hover:text-[var(--fg-base)]'}`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Camera size={48} className="text-zinc-700 mb-4" />
            <h3 className="text-lg font-semibold text-[var(--fg-subtle)] mb-2">{t(locale, 'common', 'empty')}</h3>
            <p className="text-zinc-600 text-sm max-w-sm">{t(locale, 'dreams', 'emptyDesc')}</p>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-6 ui-button-primary">
              <Plus size={16} /> {t(locale, 'dreams', 'addDream')}
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map(item => {
              const cfg = typeConfig[item.type];
              return (
                <div
                  key={item.id}
                  className="break-inside-avoid group relative rounded-2xl overflow-hidden ring-1 ring-inset ring-[var(--border)] hover:ring-[var(--accent)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/50"
                  style={{ backgroundColor: item.imageUrl ? '#000' : (item.color || '#121212') }}
                >
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                      className="p-2 rounded-full bg-black/50 hover:bg-blue-500/80 text-white backdrop-blur-sm transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDreamItem(item.id); }}
                      className="p-2 rounded-full bg-black/50 hover:bg-rose-500/80 text-white backdrop-blur-sm transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {item.imageUrl && (
                    <div className="w-full aspect-[4/3] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                  )}

                  {item.type === 'quote' && !item.imageUrl && (
                    <div className="p-8 flex items-center justify-center min-h-[160px]">
                      <p className="text-2xl font-bold text-white text-center leading-snug font-serif italic">
                        {item.title}
                      </p>
                    </div>
                  )}

                  {item.type !== 'quote' && (
                    <div className={`p-4 ${item.imageUrl ? 'bg-gradient-to-t from-black/90 via-black/50 to-transparent absolute bottom-0 left-0 right-0 z-10' : ''}`}>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <h3 className={`text-base font-bold leading-tight ${item.imageUrl ? 'text-white' : 'text-[var(--fg-base)]'}`}>{item.title}</h3>
                      {item.linkedGoalId && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-purple-300">
                          <LinkIcon size={10} /> Linked to Goal
                        </span>
                      )}
                    </div>
                  )}

                  {item.type === 'quote' && (
                    <div className="px-4 pb-4 absolute bottom-0 left-0">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">{editingId ? t(locale, 'common', 'edit') : t(locale, 'dreams', 'addDream')}</h2>
              <button type="button" onClick={resetForm}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{t(locale, 'common', 'title')}</label>
                <input
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Climb Machu Picchu"
                  className="ui-input focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="ui-label">{t(locale, 'common', 'type')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {types.map(tKey => {
                    const cfg = typeConfig[tKey];
                    return (
                      <button
                        key={tKey} type="button"
                        onClick={() => setType(tKey)}
                        className={`py-2 rounded-lg text-xs font-semibold transition-colors ${type === tKey ? `${cfg.bg} ${cfg.color}` : 'bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] text-[var(--fg-subtle)] hover:text-[var(--fg-base)]'}`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="ui-label">Image (optional)</label>
                
                <div className="flex flex-col gap-3">
                  {imageUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-[var(--border)] group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-500/80 rounded-full text-white backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {!imageUrl && (
                    <div className="flex gap-2">
                      <input
                        type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="ui-input focus:ring-[var(--accent)] flex-1"
                      />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="ui-button-soft shrink-0 hover:bg-[var(--bg-elevated)]"
                      >
                        <ImageIcon size={16} /> Upload
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {!imageUrl && type !== 'quote' && (
                <div>
                  <label className="ui-label">Background Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--border)] bg-transparent cursor-pointer" />
                    <span className="text-[var(--fg-subtle)] text-sm">{color}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={resetForm} className="ui-button-ghost">{t(locale, 'common', 'cancel')}</button>
                <button type="submit" className="ui-button-primary">{t(locale, 'common', 'save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
