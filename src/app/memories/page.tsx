"use client";

import { useState, useRef } from 'react';
import { MapPin, Plus, X, Trash2, Pencil, Image as ImageIcon } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { Memory } from '@/lib/types';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';

export default function MemoriesPage() {
  const memories = useLifeOSStore((s) => s.memories);
  const addMemory = useLifeOSStore((s) => s.addMemory);
  const updateMemory = useLifeOSStore((s) => s.updateMemory);
  const removeMemory = useLifeOSStore((s) => s.removeMemory);
  const { locale } = useThemeStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Memory['type']>('travel');
  const [location, setLocation] = useState('');
  const [emotion, setEmotion] = useState('🌟');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Limit to 800KB to prevent localStorage overflow
    if (file.size > 800 * 1024) {
      alert(t(locale, 'settings', 'storageDesc') + '\n\nFile is too large! Please upload an image smaller than 800KB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (item: Memory) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setType(item.type);
    setLocation(item.location || '');
    setEmotion(item.emotion as any);
    setTags(item.tags.join(', '));
    setImageUrl(item.imageUrl || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setLocation('');
    setTags('');
    setImageUrl('');
    setEmotion('🌟');
    setType('travel');
    setShowModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title, description, type,
      location: location || undefined,
      emotion: emotion as any,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      imageUrl: imageUrl || undefined,
    };
    if (editingId) {
      updateMemory(editingId, payload);
    } else {
      addMemory(payload);
    }
    resetForm();
  };

  const emotionOptions = ['🌟', '🎉', '😢', '🔥', '❤️', '🏆', '🌍', '😂', '💡', '🙏'];

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{t(locale, 'nav', 'memories')}</h1>
            <p className="text-[var(--fg-subtle)]">{locale === 'pt' ? 'Sua história pessoal de momentos inesquecíveis.' : locale === 'es' ? 'Tu historia personal de momentos inolvidables.' : 'Your personal history of unforgettable moments.'}</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="ui-button-primary">
            <Plus size={16} /> {t(locale, 'common', 'add')}
          </button>
        </header>

        {memories.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">📖</p>
            <h3 className="text-[var(--fg-subtle)] font-semibold mb-2">{locale === 'pt' ? 'Ainda não há memórias' : locale === 'es' ? 'Todavía no hay recuerdos' : 'No memories yet'}</h3>
            <p className="text-zinc-600 text-sm">{locale === 'pt' ? 'Comece a registrar seus marcos, viagens e momentos importantes.' : locale === 'es' ? 'Empieza a capturar tus hitos, viajes y momentos importantes.' : 'Start capturing your milestones, trips, and life-changing moments.'}</p>
          </div>
        ) : (
          <div className="relative border-l border-[var(--border)] ml-4 space-y-12 pb-12">
            {memories.map(memory => (
              <div key={memory.id} className="relative pl-8 group">
                <div className="absolute -left-[18px] top-1.5 w-9 h-9 rounded-full border-4 border-[#050505] flex items-center justify-center text-lg bg-[var(--bg-elevated)] z-10 group-hover:scale-110 transition-transform">
                  {memory.emotion}
                </div>
                <div className="ui-card p-6 group-hover:ring-[var(--accent)] transition-colors relative">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => openEditModal(memory)}
                      className="p-2 rounded bg-[var(--bg-elevated)] hover:bg-blue-500/10 hover:text-blue-400 text-[var(--fg-muted)] transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => removeMemory(memory.id)}
                      className="p-2 rounded bg-[var(--bg-elevated)] hover:bg-rose-500/10 hover:text-rose-400 text-[var(--fg-muted)] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-3 pr-20">
                    <h2 className="text-xl font-bold text-[var(--fg-base)]">{memory.title}</h2>
                    <span className="text-sm font-semibold text-[var(--fg-subtle)] shrink-0 ml-4">
                      {new Date(memory.date).toLocaleDateString(locale, { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  
                  {memory.imageUrl && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-[var(--border)]">
                      <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-[var(--fg-muted)] mb-4 leading-relaxed">{memory.description}</p>
                  
                  {memory.location && (
                    <div className="flex items-center gap-2 text-sm text-[var(--fg-subtle)] mb-4">
                      <MapPin size={16} /> <span>{memory.location}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {memory.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-md text-xs font-medium text-[var(--fg-subtle)] capitalize">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">{editingId ? t(locale, 'common', 'edit') : t(locale, 'common', 'add')}</h2>
              <button onClick={resetForm}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{t(locale, 'common', 'title')}</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter memory title" className="ui-input focus:ring-[var(--accent)]" />
              </div>
              
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Imagem (opcional)' : locale === 'es' ? 'Imagen (opcional)' : 'Image (optional)'}</label>
                <div className="flex flex-col gap-3">
                  {imageUrl && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[var(--border)] group">
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
                        <ImageIcon size={16} /> {locale === 'pt' ? 'Enviar' : locale === 'es' ? 'Subir' : 'Upload'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="ui-label">{locale === 'pt' ? 'O que aconteceu?' : locale === 'es' ? '¿Qué pasó?' : 'What happened?'}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="ui-input focus:ring-[var(--accent)] h-24 resize-none" placeholder={locale === 'pt' ? 'Descreva a memória...' : locale === 'es' ? 'Describe el recuerdo...' : 'Describe the memory...'} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'common', 'type')}</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="ui-input focus:ring-[var(--accent)]">
                    <option value="travel">{locale === 'pt' ? 'Viagem' : locale === 'es' ? 'Viaje' : 'Travel'}</option>
                    <option value="milestone">{locale === 'pt' ? 'Marco' : locale === 'es' ? 'Hito' : 'Milestone'}</option>
                    <option value="achievement">{locale === 'pt' ? 'Conquista' : locale === 'es' ? 'Logro' : 'Achievement'}</option>
                    <option value="personal">{locale === 'pt' ? 'Pessoal' : locale === 'es' ? 'Personal' : 'Personal'}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Localização' : locale === 'es' ? 'Ubicación' : 'Location'}</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={locale === 'pt' ? 'Informe o local' : locale === 'es' ? 'Ingresa la ubicación' : 'Enter location'} className="ui-input focus:ring-[var(--accent)]" />
                </div>
              </div>
              <div>
                <label className="ui-label">{t(locale, 'memories', 'emotion')}</label>
                <div className="flex flex-wrap gap-2">
                  {emotionOptions.map(e => (
                    <button key={e} type="button" onClick={() => setEmotion(e)}
                      className={`text-xl w-9 h-9 rounded-lg transition-all ${emotion === e ? 'bg-[var(--bg-elevated)] scale-110 ring-2 ring-[var(--accent)]' : 'hover:scale-105'}`}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Tags (separadas por vírgula)' : locale === 'es' ? 'Etiquetas (separadas por coma)' : 'Tags (comma-sep)'}</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder={locale === 'pt' ? 'tag1, tag2, tag3' : locale === 'es' ? 'tag1, tag2, tag3' : 'tag1, tag2, tag3'} className="ui-input focus:ring-[var(--accent)]" />
              </div>
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
