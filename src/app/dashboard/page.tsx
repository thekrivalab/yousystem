"use client";

import { ArrowRight, Compass, Globe2, MapPin, Target } from 'lucide-react';
import Link from 'next/link';
import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--fg-subtle)]">
      <p className="font-semibold text-[var(--fg-base)] mb-1">{title}</p>
      <p>{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const { locale } = useThemeStore();
  const bucketListItems = useLifeOSStore((s) => s.bucketListItems);
  const dreamItems = useLifeOSStore((s) => s.dreamItems);

  const visited = bucketListItems.filter((item) => item.status === 'visited').length;
  const pending = bucketListItems.filter((item) => item.status !== 'visited');
  const continents = new Set(bucketListItems.map((item) => item.continent).filter(Boolean));
  const countryItems = bucketListItems.filter((item) => item.type === 'country');

  const stats = [
    { label: t(locale, 'bucketList', 'title'), value: bucketListItems.length, icon: Target, color: 'text-purple-500' },
    { label: t(locale, 'bucketList', 'visited'), value: visited, icon: Globe2, color: 'text-green-500' },
    { label: t(locale, 'dreams', 'title'), value: dreamItems.length, icon: Compass, color: 'text-amber-500' },
    { label: t(locale, 'dashboard', 'upcoming'), value: continents.size, icon: MapPin, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{t(locale, 'dashboard', 'title')}</h1>
          <p className="text-[var(--fg-subtle)]">{t(locale, 'dashboard', 'subtitle')}</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="ui-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={stat.color} size={22} />
                  <span className="text-xs font-semibold text-[var(--fg-subtle)]">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-[var(--fg-base)]">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--fg-base)]">{t(locale, 'dashboard', 'upcoming')}</h2>
              <Link href="/bucket-list" className="text-xs flex items-center gap-1 text-[var(--fg-subtle)]">
                {locale === 'pt' ? 'Abrir lista' : locale === 'es' ? 'Abrir lista' : 'Open list'} <ArrowRight size={12} />
              </Link>
            </div>

            <div className="ui-card overflow-hidden">
              {pending.length === 0 ? (
                <div className="p-6">
                  <EmptyState title={t(locale, 'common', 'empty')} description={t(locale, 'bucketList', 'subtitle')} />
                </div>
              ) : pending.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="font-semibold text-[var(--fg-base)]">{item.title}</p>
                    <p className="text-xs text-[var(--fg-subtle)] capitalize">{item.type} • {item.status.replaceAll('_', ' ')}</p>
                  </div>
                  <span className="text-xs text-[var(--fg-subtle)]">Priority {item.priority}/10</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--fg-base)]">{t(locale, 'dashboard', 'weeklyProgress')}</h2>
            <div className="ui-card p-5 space-y-4">
              {countryItems.length === 0 ? (
                <EmptyState title={t(locale, 'common', 'empty')} description={t(locale, 'bucketList', 'subtitle')} />
              ) : (
                [...new Set(countryItems.map((item) => item.continent).filter(Boolean))].map((continent) => {
                  const items = countryItems.filter((item) => item.continent === continent);
                  const progress = Math.round((items.filter((item) => item.status === 'visited').length / items.length) * 100);
                  return (
                    <div key={continent}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[var(--fg-muted)]">{continent}</span>
                        <span className="text-[var(--fg-subtle)]">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-[var(--fg-base)] mb-4">{t(locale, 'dashboard', 'today')}</h2>
            <div className="ui-card p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[var(--fg-subtle)] mb-1">{t(locale, 'bucketList', 'visited')}</p>
                  <p className="text-2xl font-bold text-[var(--fg-base)]">{visited}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--fg-subtle)] mb-1">{locale === 'pt' ? 'Pendentes' : locale === 'es' ? 'Pendientes' : 'Pending'}</p>
                  <p className="text-2xl font-bold text-[var(--fg-base)]">{pending.length}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--fg-subtle)] mb-1">{locale === 'pt' ? 'Continentes' : locale === 'es' ? 'Continentes' : 'Continents'}</p>
                  <p className="text-2xl font-bold text-[var(--fg-base)]">{continents.size}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--fg-subtle)] mb-1">{t(locale, 'dreams', 'title')}</p>
                  <p className="text-2xl font-bold text-[var(--fg-base)]">{dreamItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--fg-base)] mb-4">{locale === 'pt' ? 'Países recentes' : locale === 'es' ? 'Países recientes' : 'Recent countries'}</h2>
            <div className="ui-card p-5 space-y-3">
              {countryItems.length === 0 ? (
                <EmptyState title={t(locale, 'common', 'empty')} description={t(locale, 'bucketList', 'subtitle')} />
              ) : countryItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--fg-base)]">{item.title}</span>
                  <span className="text-xs text-[var(--fg-subtle)]">{item.status.replaceAll('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
