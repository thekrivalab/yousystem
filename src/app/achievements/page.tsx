"use client";

import { Trophy, Lock, Star, Plus, X, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useLifeOSStore } from '@/lib/store';
import { Achievement } from '@/lib/types';
import { useThemeStore } from '@/lib/theme-store';
import { IconPicker } from '@/components/IconPicker';

const ACHIEVEMENT_ICON_OPTIONS = ['🏆', '🥇', '🎖️', '⭐', '🌟', '🎉', '🚀', '💎', '🧠', '🔥', '👑', '🏅', '🌈', '💪'];

export default function AchievementsPage() {
  const { locale } = useThemeStore();
  const achievements = useLifeOSStore(state => state.achievements);
  const toggleAchievement = useLifeOSStore(state => state.toggleAchievement);
  const addAchievement = useLifeOSStore(state => state.addAchievement);
  const updateAchievement = useLifeOSStore(state => state.updateAchievement);
  const removeAchievement = useLifeOSStore(state => state.removeAchievement);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  const [showModal, setShowModal] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);

  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    icon: '🏆',
    category: 'general',
    xpReward: 100
  });

  const resetForm = () => {
    setNewAchievement({
      title: '',
      description: '',
      icon: '🏆',
      category: 'general',
      xpReward: 100
    });
    setEditingAchievementId(null);
  };

  const handleEditClick = (e: React.MouseEvent, achievement: Achievement) => {
    e.stopPropagation();
    setNewAchievement({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      xpReward: achievement.xpReward
    });
    setEditingAchievementId(achievement.id);
    setShowModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.title.trim()) return;
    
    if (editingAchievementId) {
      updateAchievement(editingAchievementId, newAchievement);
    } else {
      addAchievement(newAchievement);
    }
    
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg-base)' }}>{locale === 'pt' ? 'Medalhas' : locale === 'es' ? 'Medallas' : 'Achievements'}</h1>
            <p style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Crie medalhas, desbloqueie e ganhe XP.' : locale === 'es' ? 'Crea medallas, desbloquéalas y gana XP.' : 'Create badges, unlock them, earn XP, and level up your life.'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
            >
              <Plus size={18} />
              {locale === 'pt' ? 'Nova medalha' : locale === 'es' ? 'Nueva medalla' : 'New Achievement'}
            </button>
            <div className="flex items-center gap-4 ui-card p-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Desbloqueadas' : locale === 'es' ? 'Desbloqueadas' : 'Unlocked'}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--fg-base)' }}>{unlockedCount} <span className="text-sm font-normal" style={{ color: 'var(--fg-subtle)' }}>/ {totalCount}</span></p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              onClick={() => toggleAchievement(achievement.id)}
              className={`relative p-6 transition-all cursor-pointer ${
                achievement.isUnlocked 
                  ? 'ui-card' 
                  : 'bg-transparent ring-1 ring-inset rounded-2xl opacity-60'
              }`}
              style={{
                borderColor: achievement.isUnlocked ? 'var(--accent)' : 'var(--border)'
              }}
            >
              <div className="absolute top-4 right-4 flex gap-2">
                {!achievement.isUnlocked && (
                  <div style={{ color: 'var(--fg-muted)' }}>
                    <Lock size={16} />
                  </div>
                )}
                <button 
                  onClick={(e) => handleEditClick(e, achievement)}
                  className="text-[var(--fg-subtle)] hover:text-blue-500 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeAchievement(achievement.id); }}
                  className="text-[var(--fg-subtle)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${
                achievement.isUnlocked ? '' : 'grayscale'
              }`} style={{ backgroundColor: 'var(--bg-elevated)' }}>
                {achievement.icon}
              </div>
              
              <h3 className={`text-lg font-bold mb-1`} style={{ color: achievement.isUnlocked ? 'var(--fg-base)' : 'var(--fg-subtle)' }}>
                {achievement.title}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--fg-subtle)' }}>{achievement.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ring-1 ring-inset" 
                  style={{ color: 'var(--fg-subtle)', backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                  {achievement.category}
                </span>
                <span className={`text-xs font-bold flex items-center gap-1`} style={{ color: achievement.isUnlocked ? 'var(--accent)' : 'var(--fg-muted)' }}>
                  <Star size={12} /> {achievement.xpReward} XP
                </span>
              </div>
            </div>
          ))}

          {achievements.length === 0 && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed rounded-2xl" style={{ borderColor: 'var(--border)' }}>
               <Trophy size={48} className="mb-4 opacity-20" style={{ color: 'var(--fg-subtle)' }} />
               <p className="text-lg font-medium" style={{ color: 'var(--fg-muted)' }}>No achievements created yet</p>
               <button 
                 onClick={() => setShowModal(true)}
                 className="mt-4 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                 style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--fg-base)' }}
               >
                 Create your first achievement
               </button>
             </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="ui-card w-full max-w-md p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--fg-base)' }}>
                {editingAchievementId ? 'Edit Achievement' : 'Add Custom Achievement'}
              </h2>
              <button onClick={() => setShowModal(false)}><X size={20} style={{ color: 'var(--fg-subtle)' }} /></button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="ui-label">Title</label>
                <input 
                  type="text" 
                  value={newAchievement.title}
                  onChange={e => setNewAchievement({...newAchievement, title: e.target.value})}
                  className="ui-input"
                  placeholder="e.g. Master Chef"
                  required
                />
              </div>

              <div>
                <label className="ui-label">Description</label>
                <textarea 
                  value={newAchievement.description}
                  onChange={e => setNewAchievement({...newAchievement, description: e.target.value})}
                  className="ui-input h-24 resize-none"
                  placeholder="What did you do to earn this?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <IconPicker
                  label={locale === 'pt' ? 'Ícone' : locale === 'es' ? 'Ícono' : 'Icon'}
                  value={newAchievement.icon}
                  onChange={(icon) => setNewAchievement({ ...newAchievement, icon })}
                  options={ACHIEVEMENT_ICON_OPTIONS}
                  helperText={locale === 'pt' ? 'Selecione um emoji' : locale === 'es' ? 'Selecciona un emoji' : 'Select an emoji'}
                />
                <div>
                  <label className="ui-label">Category</label>
                  <select 
                    value={newAchievement.category}
                    onChange={e => setNewAchievement({...newAchievement, category: e.target.value})}
                    className="ui-input"
                  >
                    <option value="general">General</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="travel">Travel</option>
                    <option value="finance">Finance</option>
                    <option value="habits">Habits</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="ui-label">XP Reward</label>
                <input 
                  type="number" 
                  value={newAchievement.xpReward}
                  onChange={e => setNewAchievement({...newAchievement, xpReward: parseInt(e.target.value) || 0})}
                  className="ui-input"
                  min="10"
                  step="10"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 rounded-xl font-bold mt-2"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
              >
                {editingAchievementId ? (locale === 'pt' ? 'Salvar conquista' : locale === 'es' ? 'Guardar logro' : 'Save Achievement') : (locale === 'pt' ? 'Criar conquista' : locale === 'es' ? 'Crear logro' : 'Create Achievement')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
