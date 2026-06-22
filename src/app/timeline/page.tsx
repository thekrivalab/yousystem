"use client";

import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';

function EmptyState() {
  const { locale } = useThemeStore();
  return (
    <div className="ui-card p-8 text-center">
      <p className="text-4xl mb-3">🕊️</p>
      <p className="font-semibold text-[var(--fg-base)]">{locale === 'pt' ? 'Ainda não há eventos na linha do tempo' : locale === 'es' ? 'Todavía no hay eventos en la línea del tiempo' : 'No timeline entries yet'}</p>
      <p className="text-sm mt-1 text-[var(--fg-muted)]">{locale === 'pt' ? 'Adicione memórias ou conquistas para montar sua linha do tempo.' : locale === 'es' ? 'Agrega recuerdos o logros para construir tu línea del tiempo.' : 'Add memories or milestones to build your timeline.'}</p>
    </div>
  );
}

export default function Timeline() {
  const { locale } = useThemeStore();
  const memories = useLifeOSStore((state) => state.memories);
  const goals = useLifeOSStore((state) => state.goals);

  const events = [
    ...memories.map((memory) => ({
      id: memory.id,
      date: memory.date,
      sortDate: memory.date,
      year: new Date(memory.date).getFullYear(),
      type: 'past' as const,
      title: memory.title,
      description: memory.description,
      icon: memory.emotion,
      tone: 'bg-zinc-700',
    })),
    ...goals.filter((goal) => goal.deadline).map((goal) => ({
      id: goal.id,
      date: goal.deadline,
      sortDate: goal.deadline,
      year: new Date(goal.deadline).getFullYear(),
      type: goal.status === 'completed' ? ('past' as const) : ('future' as const),
      title: goal.title,
      description: goal.description,
      icon: '🏆',
      tone: goal.status === 'completed' ? 'bg-emerald-600' : 'bg-purple-500',
    })),
  ].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{locale === 'pt' ? 'Linha do Tempo da Vida' : locale === 'es' ? 'Línea de Tiempo de Vida' : 'Life Timeline'}</h1>
          <p className="text-[var(--fg-subtle)]">{locale === 'pt' ? 'Sua linha do tempo é formada apenas por memórias e prazos de conquistas.' : locale === 'es' ? 'Tu línea de tiempo se construye solo con recuerdos y fechas límite de logros.' : 'Your timeline is built from memories and milestone deadlines only.'}</p>
        </header>

        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative border-l border-[var(--border)] ml-4 space-y-12 pb-12">
            {events.map((event) => (
              <div key={event.id} className="relative pl-8">
                <div className={`absolute -left-3.5 top-1.5 w-7 h-7 rounded-full border-4 border-[#050505] flex items-center justify-center text-xs ${event.tone} text-[var(--fg-base)]`} />
                <div className="bg-[#0a0a0a] border border-[var(--border)] p-6 rounded-2xl hover:border-zinc-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{event.icon}</span>
                      <h2 className="text-xl font-bold text-[var(--fg-base)]">{event.title}</h2>
                    </div>
                    <span className={`text-xl font-bold ${event.type === 'future' ? 'text-[var(--fg-base)]' : 'text-zinc-600'}`}>
                      {event.year}
                    </span>
                  </div>
                  <p className="text-[var(--fg-subtle)]">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
