"use client";

import dynamic from "next/dynamic";
import { useThemeStore } from '@/lib/theme-store';

const WorldMap = dynamic(() => import("@/components/WorldMap").then(mod => mod.WorldMap), {
  ssr: false,
  loading: () => {
    const { locale } = useThemeStore.getState();
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-[var(--fg-subtle)]">
        {locale === 'pt' ? 'Carregando mapa...' : locale === 'es' ? 'Cargando mapa...' : 'Loading map...'}
      </div>
    );
  },
});

export default function MapPage() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0a0a0a]">
      <div className="absolute top-4 left-4 z-[420] rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-sm px-4 py-3 shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Centro de Comando</p>
        <p className="text-sm text-zinc-400">Mapa Mundi</p>
      </div>
      <div className="relative z-[300] h-screen w-full">
        <WorldMap />
      </div>
    </div>
  );
}
