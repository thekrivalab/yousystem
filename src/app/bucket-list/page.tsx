"use client";

import { useState } from "react";
import { Filter, Search, Globe, MapPin, Target, Plus, Pencil, Trash2, X } from "lucide-react";
import { useLifeOSStore } from "@/lib/store";
import { useThemeStore } from "@/lib/theme-store";
import { t } from "@/lib/i18n";
import { BucketListItem, BucketListItemType, BucketListStatus, BucketListCost } from "@/lib/types";

export default function BucketList() {
  const bucketListItems = useLifeOSStore((s) => s.bucketListItems);
  const addBucketListItem = useLifeOSStore((s) => s.addBucketListItem);
  const updateBucketListItem = useLifeOSStore((s) => s.updateBucketListItem);
  const removeBucketListItem = useLifeOSStore((s) => s.removeBucketListItem);

  const { locale } = useThemeStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<BucketListItemType>('country');
  const [priority, setPriority] = useState(5);
  const [status, setStatus] = useState<BucketListStatus>('want_to_visit');
  const [cost, setCost] = useState<BucketListCost>('comfortable');
  const [continent, setContinent] = useState('');

  const openModal = (item?: BucketListItem) => {
    if (item) {
      setEditingId(item.id);
      setTitle(item.title);
      setType(item.type);
      setPriority(item.priority);
      setStatus(item.status);
      setCost(item.cost);
      setContinent(item.continent || '');
    } else {
      setEditingId(null);
      setTitle('');
      setType('country');
      setPriority(5);
      setStatus('want_to_visit');
      setCost('comfortable');
      setContinent('');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const payload = {
      title,
      type,
      priority,
      status,
      cost,
      continent: continent || undefined,
    };

    if (editingId) {
      updateBucketListItem(editingId, payload);
    } else {
      addBucketListItem(payload);
    }
    setShowModal(false);
  };

  const filteredItems = bucketListItems.filter(i => {
    if (activeTab !== 'all' && i.type !== activeTab.slice(0, -1) && i.type !== activeTab) return false;
    if (searchTerm && !i.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.priority - a.priority);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-[var(--border)] bg-[var(--bg-base)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{t(locale, 'bucketList', 'title')}</h1>
            <p className="text-[var(--fg-subtle)] text-sm">{t(locale, 'bucketList', 'subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="ui-button-primary">
            <Plus size={16} /> {t(locale, 'common', 'add')}
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-center">
          <div className="flex gap-2 p-1 ui-card">
            {['all', 'countries', 'cities', 'experiences'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'bg-[var(--bg-elevated)] text-[var(--fg-base)] shadow-sm' 
                    : 'text-[var(--fg-subtle)] hover:text-[var(--fg-base)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]" size={16} />
              <input 
                type="text" 
                placeholder={t(locale, 'common', 'search') + "..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="ui-input pl-9 w-64"
              />
            </div>
            <button className="p-2 ui-button-soft">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="grid gap-3 max-w-6xl mx-auto overflow-x-auto">
          {/* Table Header */}
          <div className="min-w-[760px] grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
            <div className="col-span-4">{t(locale, 'common', 'title')}</div>
            <div className="col-span-2">{t(locale, 'bucketList', 'priority')}</div>
            <div className="col-span-2">{t(locale, 'bucketList', 'continent')}</div>
            <div className="col-span-2">{t(locale, 'common', 'status')}</div>
            <div className="col-span-2 text-right">{locale === 'pt' ? 'Custo / Ação' : locale === 'es' ? 'Costo / Acción' : 'Cost / Action'}</div>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-[var(--fg-subtle)] italic text-sm">
              {t(locale, 'common', 'empty')}
            </div>
          )}

          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="grid grid-cols-12 gap-4 items-center p-4 ui-card hover:ring-zinc-500 transition-colors group"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border)] shrink-0">
                  {item.type === 'country' && <Globe size={16} className="text-blue-400" />}
                  {item.type === 'city' && <MapPin size={16} className="text-amber-400" />}
                  {item.type === 'experience' && <Target size={16} className="text-purple-400" />}
                  {item.type === 'other' && <div className="w-2 h-2 rounded-full bg-zinc-400" />}
                </div>
                <span className="font-medium text-[var(--fg-base)] truncate">{item.title}</span>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--fg-muted)]">{item.priority}/10</span>
                  <div className="w-16 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-[var(--accent)]" 
                      style={{ width: `${item.priority * 10}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-[var(--fg-subtle)] truncate block">{item.continent || '—'}</span>
              </div>

              <div className="col-span-2">
                <span className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-md text-xs text-[var(--fg-muted)] capitalize whitespace-nowrap">
                  {t(locale, 'bucketList', item.status)}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3">
                <span className={`text-sm capitalize ${
                  item.cost === 'economic' ? 'text-emerald-400' :
                  item.cost === 'comfortable' ? 'text-blue-400' :
                  'text-purple-400'
                }`}>
                  {t(locale, 'bucketList', item.cost)}
                </span>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  <button onClick={() => openModal(item)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => removeBucketListItem(item.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4 max-w-md w-full">
            <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">{editingId ? t(locale, 'common', 'edit') : t(locale, 'common', 'add')} {t(locale, 'bucketList', 'title')}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{t(locale, 'common', 'title')}</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="ui-input" placeholder="Enter item title" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'common', 'type')}</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="ui-input">
                    <option value="country">{t(locale, 'bucketList', 'country')}</option>
                    <option value="city">{t(locale, 'bucketList', 'city')}</option>
                    <option value="experience">{t(locale, 'bucketList', 'experience')}</option>
                    <option value="other">{t(locale, 'bucketList', 'other')}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{t(locale, 'bucketList', 'priority')} (1-10)</label>
                  <input type="number" min="1" max="10" required value={priority} onChange={e => setPriority(Number(e.target.value))} className="ui-input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'common', 'status')}</label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="ui-input">
                    <option value="living">{t(locale, 'bucketList', 'living')}</option>
                    <option value="visited">{t(locale, 'bucketList', 'visited')}</option>
                    <option value="dream">{t(locale, 'bucketList', 'dream')}</option>
                    <option value="want_to_visit">{t(locale, 'bucketList', 'want_to_visit')}</option>
                    <option value="curious">{t(locale, 'bucketList', 'curious')}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{t(locale, 'bucketList', 'cost')}</label>
                  <select value={cost} onChange={(e: any) => setCost(e.target.value)} className="ui-input">
                    <option value="economic">{t(locale, 'bucketList', 'economic')}</option>
                    <option value="comfortable">{t(locale, 'bucketList', 'comfortable')}</option>
                    <option value="premium">{t(locale, 'bucketList', 'premium')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="ui-label">{t(locale, 'bucketList', 'continent')} ({locale === 'pt' ? 'Opcional' : locale === 'es' ? 'Opcional' : 'Optional'})</label>
                <input type="text" value={continent} onChange={e => setContinent(e.target.value)} className="ui-input" placeholder={locale === 'pt' ? 'Ex.: Ásia' : locale === 'es' ? 'Ej.: Asia' : 'e.g. Asia'} />
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
