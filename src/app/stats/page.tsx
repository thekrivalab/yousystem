"use client";

import { useThemeStore } from '@/lib/theme-store';

export default function Stats() {
  const { locale } = useThemeStore();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--fg-base)] mb-2">{locale === 'pt' ? 'Estatísticas detalhadas' : locale === 'es' ? 'Estadísticas detalladas' : 'Detailed Statistics'}</h1>
        <p className="text-[var(--fg-subtle)]">{locale === 'pt' ? 'Aprofunde-se nos dados de viagem e nas taxas de conclusão.' : locale === 'es' ? 'Analiza a fondo tus datos y tasas de finalización.' : 'Dive deep into your travel data and completion rates.'}</p>
        <div className="mt-8 px-6 py-12 border border-dashed border-white/10 rounded-2xl max-w-md mx-auto">
          <p className="text-[var(--fg-subtle)] text-sm">{locale === 'pt' ? 'Recurso em breve.' : locale === 'es' ? 'Función próximamente.' : 'Feature coming soon.'}</p>
        </div>
      </div>
    </div>
  );
}
