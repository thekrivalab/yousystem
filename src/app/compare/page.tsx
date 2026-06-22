"use client";

import { useThemeStore } from '@/lib/theme-store';

export default function Compare() {
  const { locale } = useThemeStore();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--fg-base)] mb-2">{locale === 'pt' ? 'Comparar destinos' : locale === 'es' ? 'Comparar destinos' : 'Compare Destinations'}</h1>
        <p className="text-[var(--fg-subtle)]">{locale === 'pt' ? 'Analise custos, clima e prioridade pessoal entre dois locais.' : locale === 'es' ? 'Analiza costos, clima y prioridad personal entre dos lugares.' : 'Analyze costs, climate, and personal priority between two locations.'}</p>
        <div className="mt-8 px-6 py-12 border border-dashed border-white/10 rounded-2xl max-w-md mx-auto">
          <p className="text-[var(--fg-subtle)] text-sm">{locale === 'pt' ? 'Recurso em breve.' : locale === 'es' ? 'Función próximamente.' : 'Feature coming soon.'}</p>
        </div>
      </div>
    </div>
  );
}
