// Shared map constants — avoids circular deps between LeafletMap ↔ CountrySidePanel

export const statusColors: Record<string, string> = {
  none:         '#1e293b', // default — not explored
  curious:      '#3b82f6', // blue — interessado
  want_to_visit:'#f59e0b', // amber — quero ir
  dream:        '#a855f7', // purple — sonho
  visited:      '#22c55e', // green — visitei
  living:       '#ec4899', // pink — morando/morei
};

export const statusOptions: { key: string; label: string }[] = [
  { key: 'living',        label: 'Morei / Moro' },
  { key: 'visited',       label: 'Visitei' },
  { key: 'dream',         label: 'Sonho' },
  { key: 'want_to_visit', label: 'Quero ir' },
  { key: 'curious',       label: 'Curioso' },
];
