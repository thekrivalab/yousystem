"use client";

import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Globe2,
  HeartPulse,
  Trophy,
} from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';

function EmptyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--fg-subtle)]">
      <p className="font-semibold text-[var(--fg-base)] mb-1">{title}</p>
      <p>{description}</p>
    </div>
  );
}

export default function HomeDashboard() {
  const { locale } = useThemeStore();
  const user = useLifeOSStore((state) => state.user);
  const goals = useLifeOSStore((state) => state.goals);
  const habits = useLifeOSStore((state) => state.habits);
  const financialGoals = useLifeOSStore((state) => state.financialGoals);
  const healthEntries = useLifeOSStore((state) => state.healthEntries);
  const projects = useLifeOSStore((state) => state.projects);
  const bucketListItems = useLifeOSStore((state) => state.bucketListItems);
  const dreamItems = useLifeOSStore((state) => state.dreamItems);

  const activeGoals = goals.filter((g) => g.status === 'in_progress').slice(0, 3);
  const dailyHabits = habits.filter((h) => h.frequency === 'daily');
  const activeFinanceGoals = financialGoals.slice(0, 3);
  const activeProjects = projects.filter((p) => p.status === 'active').slice(0, 3);
  const latestHealth = healthEntries[0];
  const visitedDestinations = bucketListItems.filter((item) => item.status === 'visited').length;
  const continents = new Set(bucketListItems.map((item) => item.continent).filter(Boolean));

  const scoreCards = [
    { label: locale === 'pt' ? 'Conquistas' : locale === 'es' ? 'Logros' : 'Achievements', value: user.scores.goals, icon: Trophy, color: 'text-amber-500' },
    { label: locale === 'pt' ? 'Hábitos' : locale === 'es' ? 'Hábitos' : 'Habits', value: user.scores.habits, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: locale === 'pt' ? 'Saúde' : locale === 'es' ? 'Salud' : 'Health', value: user.scores.health, icon: HeartPulse, color: 'text-rose-500' },
    { label: locale === 'pt' ? 'Finanças' : locale === 'es' ? 'Finanzas' : 'Finance', value: user.scores.finance, icon: DollarSign, color: 'text-amber-500' },
    { label: locale === 'pt' ? 'Projetos' : locale === 'es' ? 'Proyectos' : 'Projects', value: user.scores.projects, icon: Briefcase, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg-base)' }}>
              {user.name ? `${locale === 'pt' ? 'Bem-vindo de volta' : locale === 'es' ? 'Bienvenido de nuevo' : 'Welcome back'}, ${user.name}` : (locale === 'pt' ? 'Painel do YouSystem' : locale === 'es' ? 'Panel de YouSystem' : 'YouSystem Dashboard')}
            </h1>
            <p style={{ color: 'var(--fg-muted)' }}>{locale === 'pt' ? 'Um resumo limpo do seu progresso real.' : locale === 'es' ? 'Un resumen limpio de tu progreso real.' : 'A clean snapshot of your real progress.'}</p>
          </div>
          <div className="ui-card p-4 rounded-2xl flex items-center gap-6">
            <div>
              <span className="ui-label mb-0" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Pontuação do YouSystem' : locale === 'es' ? 'Puntuación de YouSystem' : 'YouSystem Score'}</span>
              <p className="text-3xl font-bold" style={{ color: 'var(--fg-base)' }}>{user.lifeScore}</p>
            </div>
            <div className="w-px h-10" style={{ backgroundColor: 'var(--border)' }} />
            <div>
              <span className="ui-label mb-0" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Nível' : locale === 'es' ? 'Nivel' : 'Level'}</span>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{user.level}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {scoreCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="ui-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Icon size={18} className={card.color} />
                  <span className="text-xs font-semibold text-[var(--fg-subtle)]">{card.value}%</span>
                </div>
                <p className="text-sm font-semibold text-[var(--fg-base)]">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="ui-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fg-base)' }}>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  {locale === 'pt' ? 'Hábitos de hoje' : locale === 'es' ? 'Hábitos de hoy' : "Today's Habits"}
                </h2>
                <span className="text-xs text-[var(--fg-subtle)]">{dailyHabits.length}</span>
              </div>
              <div className="space-y-3">
                {dailyHabits.length === 0 ? (
                  <EmptyCard title={locale === 'pt' ? 'Sem hábitos ainda' : locale === 'es' ? 'Aún no hay hábitos' : 'No habits yet'} description={locale === 'pt' ? 'Adicione um hábito para começar a acompanhar sua consistência diária.' : locale === 'es' ? 'Agrega un hábito para empezar a seguir tu constancia diaria.' : 'Add a habit to start tracking your daily consistency.'} />
                ) : (
                  dailyHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--fg-base)]">{habit.icon} {habit.name}</span>
                      <span className="text-[var(--fg-subtle)]">{habit.completedToday ? (locale === 'pt' ? 'Feito' : locale === 'es' ? 'Hecho' : 'Done') : (locale === 'pt' ? 'Pendente' : locale === 'es' ? 'Pendiente' : 'Pending')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ui-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fg-base)' }}>
                  <Trophy size={20} className="text-amber-500" />
                  {locale === 'pt' ? 'Conquistas ativas' : locale === 'es' ? 'Logros activos' : 'Active Achievements'}
                </h2>
                <Link href="/conquistas" className="text-xs flex items-center gap-1" style={{ color: 'var(--fg-subtle)' }}>
                  {locale === 'pt' ? 'Ver todas' : locale === 'es' ? 'Ver todas' : 'View all'} <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-4">
                {activeGoals.length === 0 ? (
                  <EmptyCard title={locale === 'pt' ? 'Sem conquistas ainda' : locale === 'es' ? 'Aún no hay logros' : 'No achievements yet'} description={locale === 'pt' ? 'Crie sua primeira conquista para começar.' : locale === 'es' ? 'Crea tu primer logro para empezar.' : 'Create your first achievement to start building momentum.'} />
                ) : activeGoals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--fg-base)' }}>{goal.title}</span>
                      <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      <div className="h-full bg-purple-500" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ui-card p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--fg-base)' }}>
                <HeartPulse size={20} className="text-rose-500" />
                {locale === 'pt' ? 'Resumo de saúde' : locale === 'es' ? 'Resumen de salud' : 'Health Snapshot'}
              </h2>
              {!latestHealth ? (
                <EmptyCard title={locale === 'pt' ? 'Sem registros de saúde' : locale === 'es' ? 'Sin registros de salud' : 'No health logs yet'} description={locale === 'pt' ? 'Registre seu primeiro dado para começar.' : locale === 'es' ? 'Registra tu primer dato para empezar.' : 'Log your first entry to start tracking metrics.'} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Peso' : locale === 'es' ? 'Peso' : 'Weight'}</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--fg-base)' }}>{latestHealth.weight ?? '—'} kg</p>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Gordura corporal' : locale === 'es' ? 'Grasa corporal' : 'Body Fat'}</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--fg-base)' }}>{latestHealth.bodyFat ?? '—'}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className="ui-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fg-base)' }}>
                  <DollarSign className="text-amber-500" size={20} />
                {locale === 'pt' ? 'Conquistas financeiras' : locale === 'es' ? 'Logros financieros' : 'Financial Achievements'}
                </h2>
                <span className="text-xs text-[var(--fg-subtle)]">{financialGoals.length}</span>
              </div>
              <div className="space-y-5">
                {activeFinanceGoals.length === 0 ? (
                  <EmptyCard title={locale === 'pt' ? 'Sem conquistas financeiras' : locale === 'es' ? 'Sin logros financieros' : 'No financial achievements yet'} description={locale === 'pt' ? 'Defina uma conquista e acompanhe o progresso.' : locale === 'es' ? 'Define un logro y sigue el progreso.' : 'Set an achievement and track your progress.'} />
                ) : activeFinanceGoals.map((goal) => {
                  const progress = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--fg-base)' }}>{goal.title}</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--fg-base)' }}>${goal.current.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <div className="h-full" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ui-card p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--fg-base)' }}>
                <Briefcase size={20} className="text-blue-500" />
                {locale === 'pt' ? 'Projetos ativos' : locale === 'es' ? 'Proyectos activos' : 'Active Projects'}
              </h2>
              <div className="space-y-3">
                {activeProjects.length === 0 ? (
                  <EmptyCard title={locale === 'pt' ? 'Sem projetos' : locale === 'es' ? 'Sin proyectos' : 'No projects yet'} description={locale === 'pt' ? 'Crie um projeto para organizar tarefas.' : locale === 'es' ? 'Crea un proyecto para organizar tareas.' : 'Create a project to organize work and tasks.'} />
                ) : activeProjects.map((project) => (
                  <div key={project.id} className="p-3 border rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium" style={{ color: 'var(--fg-base)' }}>{project.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full text-blue-500" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>{project.type}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
                      <div className="h-full bg-blue-500" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className="border rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent) 0%, var(--bg-surface) 100%)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--fg-base)' }}>
                <Globe2 size={20} style={{ color: 'var(--accent)' }} />
                {locale === 'pt' ? 'Visão de viagem' : locale === 'es' ? 'Resumen de viaje' : 'Travel Overview'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="backdrop-blur-sm border p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Itens da lista' : locale === 'es' ? 'Elementos' : 'Bucket items'}</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--fg-base)' }}>{bucketListItems.length}</p>
                  </div>
                  <div className="backdrop-blur-sm border p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Visitados' : locale === 'es' ? 'Visitados' : 'Visited'}</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--fg-base)' }}>{visitedDestinations}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--fg-subtle)' }}>{locale === 'pt' ? 'Continentes acompanhados' : locale === 'es' ? 'Continentes rastreados' : 'Continents tracked'}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--fg-base)' }}>{continents.size}</p>
                </div>
              </div>
            </div>

            <div className="ui-card p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--fg-base)' }}>
                <Trophy size={20} className="text-amber-500" />
                Dream Board
              </h2>
              {dreamItems.length === 0 ? (
                <EmptyCard title="No dream items yet" description="Add a destination, milestone, or quote that inspires you." />
              ) : (
                <p className="text-sm text-[var(--fg-subtle)]">{dreamItems.length} items on your board.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
