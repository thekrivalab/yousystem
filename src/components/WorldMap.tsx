"use client";

import dynamic from 'next/dynamic';
import { useThemeStore } from '@/lib/theme-store';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => {
    const { locale } = useThemeStore.getState();
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-zinc-500 animate-pulse">
          {locale === 'pt' ? 'Carregando mapa...' : locale === 'es' ? 'Cargando mapa...' : 'Loading map...'}
        </div>
      </div>
    );
  },
});

export function WorldMap() {
  return <LeafletMap />;
}
