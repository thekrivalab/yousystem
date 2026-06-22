"use client";

import { useThemeStore } from '@/lib/theme-store';

export default function Diary() {
  const { locale } = useThemeStore();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--fg-base)] mb-2">{locale === 'pt' ? 'Diário de viagem' : locale === 'es' ? 'Diario de viaje' : 'Travel Diary'}</h1>
        <p className="text-[var(--fg-subtle)]">{locale === 'pt' ? 'Registre suas memórias, fotos e anotações pessoais.' : locale === 'es' ? 'Registra tus recuerdos, fotos y notas personales.' : 'Record your memories, photos, and personal notes.'}</p>
        <div className="mt-8 px-6 py-12 border border-dashed border-white/10 rounded-2xl max-w-md mx-auto">
          <p className="text-[var(--fg-subtle)] text-sm">{locale === 'pt' ? 'Funcionalidade em breve.' : locale === 'es' ? 'Función próximamente.' : 'Feature coming soon.'}</p>
        </div>
      </div>
    </div>
  );
}
