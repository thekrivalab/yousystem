import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { statusColors, statusOptions } from '@/lib/map-constants';
import { t } from '@/lib/i18n';

interface CountrySidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode: string | null;
  countryName: string;
  status: string;
  locale: 'en' | 'pt' | 'es';
  onStatusChange: (code: string, name: string, status: string) => void;
}

interface CountryInfo {
  capital: string;
  region: string;
  language: string;
  currency: string;
  population: string;
  flag: string;
}

export function CountrySidePanel({
  isOpen, onClose, countryCode, countryName, status, locale, onStatusChange
}: CountrySidePanelProps) {
  const [info, setInfo] = useState<CountryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState(status);

  useEffect(() => { setActiveStatus(status); }, [status, countryCode]);

  useEffect(() => {
    if (!isOpen || !countryCode) return;
    let mounted = true;
    setIsLoading(true);
    setInfo(null);

    fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(json => {
        if (!mounted) return;
        const c = json[0];
        const lang = c.languages ? (Object.values(c.languages)[0] as string) : 'N/A';
        const currKey = c.currencies ? Object.keys(c.currencies)[0] : null;
        const curr = currKey ? `${c.currencies[currKey].name} (${currKey})` : 'N/A';
        setInfo({
          capital: c.capital?.[0] || 'N/A',
          region: c.region || 'N/A',
          language: lang,
          currency: curr,
          population: c.population ? c.population.toLocaleString('pt-BR') : 'N/A',
          flag: c.flag || '🏳️',
        });
      })
      .catch(() => { if (mounted) setInfo(null); })
      .finally(() => { if (mounted) setIsLoading(false); });

    return () => { mounted = false; };
  }, [countryCode, isOpen]);

  function handleStatusChange(newStatus: string) {
    if (!countryCode) return;
    setActiveStatus(newStatus);
    onStatusChange(countryCode, countryName, newStatus);
  }

  const statusColor = statusColors[activeStatus] || statusColors.none;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop to close on outside click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-transparent"
            style={{ zIndex: 1999 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-0 right-0 h-full w-[85vw] sm:w-80 bg-[#0a0a0a] border-l border-[#1f1f1f] shadow-2xl flex flex-col overflow-hidden"
            style={{ zIndex: 2000 }}
          >
            {/* Accent bar */}
            <div className="h-0.5 w-full shrink-0" style={{ backgroundColor: statusColor }} />

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#1f1f1f] shrink-0">
              <div>
                <p className="text-2xl mb-1">{info?.flag || '🌍'}</p>
                <h2 className="text-lg font-bold text-white leading-tight">{countryName || '...'}</h2>
                {info && <p className="text-xs text-zinc-600 mt-0.5">{info.region}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-[#1a1a1a] transition-colors mt-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* Status selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(opt => {
                    const isActive = activeStatus === opt.key;
                    const color = statusColors[opt.key];
                    const label = t(locale, 'bucketList', opt.key) || opt.label;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleStatusChange(opt.key)}
                        className="py-2.5 px-2 rounded-lg text-xs font-semibold transition-all text-center border shadow-sm hover:brightness-125"
                        style={{
                          backgroundColor: isActive ? `${color}22` : '#18181b',
                          borderColor: isActive ? color : '#3f3f46',
                          color: isActive ? color : '#e4e4e7',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country Info */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Info</p>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs py-3">
                    <Loader2 className="animate-spin" size={14} />
                    Carregando...
                  </div>
                ) : info ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Capital', value: info.capital },
                      { label: 'Região', value: info.region },
                      { label: 'Língua', value: info.language },
                      { label: 'Moeda', value: info.currency },
                      { label: 'População', value: info.population },
                    ].map(item => (
                      <div key={item.label} className="bg-[#111] border border-[#1f1f1f] rounded-lg p-3 col-span-1">
                        <p className="text-[10px] text-zinc-600 mb-1">{item.label}</p>
                        <p className="text-xs font-medium text-zinc-300 leading-snug">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-2">
                    {locale === 'pt' ? 'Informações indisponíveis no momento.' : 
                     locale === 'es' ? 'Información no disponible.' : 
                     'No data available.'}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  {locale === 'pt' ? 'Anotações' : locale === 'es' ? 'Notas' : 'Notes'}
                </p>
                <textarea
                  placeholder={
                    locale === 'pt' ? 'Suas anotações sobre este país...' :
                    locale === 'es' ? 'Tus notas sobre este país...' :
                    'Notes about this country...'
                  }
                  className="w-full h-24 bg-[#111] border border-[#2a2a2a] rounded-lg p-3 text-xs text-zinc-300 placeholder-zinc-500 resize-none focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
