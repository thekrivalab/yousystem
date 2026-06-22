"use client";

import { useEffect, useRef, useState } from 'react';
import {
  User, Database, Palette,
  LogOut, Trash2, Download, ChevronRight,
  Check, Moon, Sun, Monitor, Camera
} from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { getDeviceTimezone } from '@/components/AuthForm';
import { useThemeStore } from '@/lib/theme-store';
import { translations, type Locale } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { readStorageSnapshot, saveSnapshotToSupabase } from '@/lib/storage-snapshot';

type Tab = 'profile' | 'appearance' | 'data';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'profile',    label: 'profile',    icon: User },
  { id: 'appearance', label: 'appearance', icon: Palette },
  { id: 'data',       label: 'data',       icon: Database },
];

export default function SettingsPage() {
  const user = useLifeOSStore((s) => s.user);
  const updateUser = useLifeOSStore((s) => s.updateUser);
  const updateAuthProfile = useAuthStore((s) => s.updateCurrentProfile);
  const logoutAuth = useAuthStore((s) => s.logout);
  const clearSessionUser = useAuthStore((s) => s.clearSessionUser);
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);


  // Appearance — connected to real theme store
  const { theme, animations, locale, setTheme, setAnimations, setLocale } = useThemeStore();
  const s = translations[locale].settings;
  const c = translations[locale].common;

  // Profile state
  const [displayName, setDisplayName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [timezone, setTimezone] = useState(() => user.timezone || getDeviceTimezone());
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      alert('Imagem muito grande. Use uma foto menor que 800KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarUrl(dataUrl);
      updateUser({ avatarUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setDisplayName(user.name || '');
    setBio(user.bio || '');
    setTimezone(user.timezone || getDeviceTimezone());
    setAvatarUrl(user.avatarUrl || '');
  }, [user.id, user.name, user.bio, user.timezone, user.avatarUrl]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (
      tab === 'profile' ||
      tab === 'appearance' ||
      tab === 'data'
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSave = async () => {
    const nextName = displayName.trim() || user.name;
    updateUser({
      name: nextName,
      bio,
      timezone,
    });
    updateAuthProfile({
      name: nextName,
      bio,
      timezone,
    });

    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (userId) {
      const snapshot = readStorageSnapshot();
      const { error: snapshotError } = await saveSnapshotToSupabase(supabase, userId, snapshot);
      if (snapshotError) {
        console.error('Failed to persist settings snapshot:', snapshotError.message);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const state = localStorage.getItem('life-os-storage');
    if (!state) return;
    const blob = new Blob([state], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yousystem-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logoutAuth();
    clearSessionUser();
    router.replace('/login');
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm('This will permanently delete ALL your data. Are you sure?');
    if (!confirmed) return;

    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;

    if (userId) {
      await supabase.from('user_storage_snapshots').delete().eq('user_id', userId);
    }

    await supabase.auth.signOut();
    logoutAuth();
    clearSessionUser();

    const keysToRemove = [
      'life-os-storage',
      'life-os-auth',
      'life-os-theme',
      'life-os-routine',
      'atlas-countries',
    ];

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage access issues and continue clearing the rest.
      }
    });

    try {
      sessionStorage.clear();
    } catch {
      // Ignore session storage access issues.
    }

    window.location.replace('/login');
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button type="button"
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors"
      style={{ backgroundColor: value ? 'var(--accent)' : 'var(--bg-elevated)' }}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--bg-base)] shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg-base)' }}>{s.title}</h1>
          <p style={{ color: 'var(--fg-muted)' }}>{s.subtitle}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar tabs */}
          <nav className="w-full lg:w-48 shrink-0 space-y-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left whitespace-nowrap`}
                  style={{
                    backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--fg-base)' : 'var(--fg-muted)'
                  }}
                >
                  <Icon size={16} />
                  {s[tab.label as keyof typeof s] as string ?? tab.label}
                </button>
              );
            })}

            <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'var(--fg-muted)' }}
              >
                <LogOut size={16} />
                {s.signOut}
              </button>
            </div>
          </nav>

          {/* Content panel */}
          <div className="flex-1 ui-card p-4 sm:p-6 space-y-6 min-w-0">

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <>
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--fg-base)' }}>{s.profile}</h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="relative group">
                    <div
                      className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-bold text-[var(--fg-base)] shadow-lg cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)' }}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        : <span>{(displayName || user.name || 'U').charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-opacity"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      <Camera size={12} className="text-white" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-lg" style={{ color: 'var(--fg-base)' }}>{displayName}</p>
                    <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Level {user.level} • {user.totalXp} XP</p>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-xs mt-1 transition-opacity hover:opacity-80"
                      style={{ color: 'var(--accent)' }}
                    >
                      {s.changeAvatar}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="ui-label">{s.displayName}</label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="ui-input" />
                  </div>
                  <div>
                    <label className="ui-label">{s.bio}</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                      className="ui-input resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="ui-label">{s.timezone}</label>
                      <select value={timezone} onChange={e => setTimezone(e.target.value)}
                        className="ui-input">
                        <option value={getDeviceTimezone()}>{`${getDeviceTimezone()} (device)`}</option>
                        <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                        <option value="America/New_York">New York (EST)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Australia/Sydney">Sydney (AEDT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="ui-label">{s.language}</label>
                      <select value={locale} onChange={e => setLocale(e.target.value as Locale)}
                        className="ui-input">
                        <option value="en">🇺🇸 English</option>
                        <option value="pt">🇧🇷 Português</option>
                        <option value="es">🇪🇸 Español</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* APPEARANCE */}
            {activeTab === 'appearance' && (
              <>
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--fg-base)' }}>{s.appearance}</h2>

                <div className="space-y-6">
                  <div>
                    <label className="ui-label mb-3">{s.theme}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {([
                        { id: 'dark', label: s.dark, icon: Moon },
                        { id: 'light', label: s.light, icon: Sun },
                        { id: 'system', label: s.system, icon: Monitor },
                      ] as const).map(t => {
                        const Icon = t.icon;
                        const active = theme === t.id;
                        return (
                          <button key={t.id} onClick={() => setTheme(t.id)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl ring-1 ring-inset transition-colors"
                            style={{
                              borderColor: active ? 'var(--fg-base)' : 'var(--border)',
                              backgroundColor: active ? 'color-mix(in srgb, var(--fg-base) 8%, transparent)' : 'transparent',
                              color: active ? 'var(--fg-base)' : 'var(--fg-muted)'
                            }}>
                            <Icon size={20} />
                            <span className="text-xs font-semibold">{t.label}</span>
                            {active && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--fg-base)' }}>{s.animations}</p>
                        <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>{s.animationsDesc}</p>
                      </div>
                      <Toggle value={animations} onChange={setAnimations} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* DATA */}
            {activeTab === 'data' && (
              <>
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--fg-base)' }}>{s.data}</h2>
                <div className="space-y-4">
                  <div className="p-4 ui-card">
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fg-base)' }}>{s.storage}</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>{s.storageDesc}</p>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      <div className="h-full rounded-full" style={{ width: '12%', backgroundColor: 'var(--fg-base)' }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--fg-subtle)' }}>~120KB of 5MB local storage used</p>
                  </div>

                  <button onClick={handleExport}
                    className="w-full flex items-center justify-between p-4 ui-card hover:brightness-110 transition-all group">
                    <div className="flex items-center gap-3">
                      <Download size={18} className="text-[var(--fg-base)]" />
                      <div className="text-left">
                        <p className="text-sm font-medium" style={{ color: 'var(--fg-base)' }}>{s.exportData}</p>
                        <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>{s.exportDataDesc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--fg-subtle)' }} />
                  </button>

                  <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={handleClearAllData}
                      className="w-full flex items-center justify-between p-4 rounded-xl transition-all group"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--fg-base) 4%, transparent)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 size={18} style={{ color: 'var(--fg-base)' }} />
                        <div className="text-left">
                          <p className="text-sm font-medium" style={{ color: 'var(--fg-base)' }}>{s.clearData}</p>
                          <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>{s.clearDataDesc}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--fg-subtle)' }} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Save button */}
            {activeTab !== 'data' && (
              <div className="pt-4 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleSave}
                  className={saved ? 'px-5 py-2.5 rounded-lg font-medium text-sm transition-colors text-[var(--fg-base)]' : 'ui-button-primary'}
                  style={saved ? { backgroundColor: 'var(--fg-base)', color: 'var(--bg-base)' } : {}}
                >
                  {saved ? <span className="flex items-center gap-2"><Check size={16} /> {c.saved}</span> : c.save}
                </button>
              </div>
            )}

            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 rounded-xl transition-colors"
                style={{ color: 'var(--fg-base)' }}
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
