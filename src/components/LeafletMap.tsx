"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CountrySidePanel } from './CountrySidePanel';
import { statusColors } from '@/lib/map-constants';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';

import { useLifeOSStore } from '@/lib/store';

function useCountryStore() {
  const bucketListItems = useLifeOSStore((state) => state.bucketListItems);
  const addBucketListItem = useLifeOSStore((state) => state.addBucketListItem);
  const updateBucketListItem = useLifeOSStore((state) => state.updateBucketListItem);
  const removeBucketListItem = useLifeOSStore((state) => state.removeBucketListItem);

  const [localMapping, setLocalMapping] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('atlas-countries-mapping');
      if (saved) return JSON.parse(saved);
      // Migrate old data
      const old = JSON.parse(localStorage.getItem('atlas-countries') || '{}');
      const mapping: Record<string, string> = {};
      for (const key in old) {
        mapping[key] = old[key].name;
      }
      return mapping;
    } catch {
      return {};
    }
  });

  const store = useMemo(() => {
    const s: Record<string, { status: string; name: string }> = {};
    bucketListItems.forEach(item => {
      if (item.type === 'country') {
        const code = Object.keys(localMapping).find(k => localMapping[k] === item.title);
        if (code) {
          s[code] = { status: item.status, name: item.title };
        } else {
          s[item.title] = { status: item.status, name: item.title };
        }
      }
    });
    return s;
  }, [bucketListItems, localMapping]);

  const setCountryStatus = useCallback((code: string, name: string, status: string) => {
    setLocalMapping(prev => {
      const next = { ...prev, [code]: name };
      try {
        localStorage.setItem('atlas-countries-mapping', JSON.stringify(next));
      } catch {}
      return next;
    });

    const existingItem = bucketListItems.find(i => i.type === 'country' && i.title === name);
    
    if (status === 'none') {
      if (existingItem) {
        removeBucketListItem(existingItem.id);
      }
    } else {
      if (existingItem) {
        updateBucketListItem(existingItem.id, { status: status as any });
      } else {
        addBucketListItem({
          title: name,
          type: 'country',
          status: status as any,
          priority: 5,
          cost: 'comfortable',
        });
      }
    }
  }, [bucketListItems, addBucketListItem, updateBucketListItem, removeBucketListItem]);

  return { store, setCountryStatus };
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function getCountryKey(feature: any): string {
  const key =
    feature?.id ||
    feature?.properties?.ISO_A3 ||
    feature?.properties?.ISO_A2 ||
    feature?.properties?.ADM0_A3 ||
    feature?.properties?.iso_a3 ||
    feature?.properties?.name ||
    '';

  return String(key).trim();
}

function getCountryName(feature: any): string {
  const name = feature?.properties?.name || feature?.properties?.NAME || feature?.id || '';
  return String(name).trim();
}

export default function LeafletMap() {
  const { locale } = useThemeStore();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, name: '', x: 0, y: 0 });
  const { store, setCountryStatus } = useCountryStore();
  const storeRef = useRef(store);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    let mounted = true;

    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GeoJSON fetch failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        setGeoData(data);
        setGeoError(false);
      })
      .catch((error) => {
        console.error('Failed to load country shapes', error);
        if (mounted) setGeoError(true);
      })
      .finally(() => {
        if (mounted) setGeoLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getStyle = useCallback((feature: any) => {
    const code = getCountryKey(feature);
    const name = getCountryName(feature);
    const status = (code && storeRef.current[code]?.status) || (name && storeRef.current[name]?.status) || 'none';
    const color = statusColors[status] ?? statusColors.none;

    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: status === 'none' ? '#334155' : '#e2e8f0',
      fillOpacity: status === 'none' ? 0.4 : 0.85,
    };
  }, []);

  const onEachFeature = useCallback((feature: any, layer: any) => {
    const name = getCountryName(feature);
    const code = getCountryKey(feature);

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 2, color: '#ffffff', fillOpacity: 0.9 });
        e.target.bringToFront();
        setTooltip({ visible: true, name, x: e.originalEvent.clientX, y: e.originalEvent.clientY });
      },
      mousemove: (e: any) => {
        setTooltip((t) => ({ ...t, x: e.originalEvent.clientX, y: e.originalEvent.clientY }));
      },
      mouseout: (e: any) => {
        e.target.setStyle(getStyle(feature));
        setTooltip((t) => ({ ...t, visible: false }));
      },
      click: () => {
        const key = code || name;
        if (!key) return;
        setSelectedCode(key);
        setSelectedName(name || key);
        setIsPanelOpen(true);
      },
    });
  }, [getStyle]);

  const currentStatus = selectedCode ? (store[selectedCode]?.status || 'none') : 'none';

  return (
    <div className="w-full h-full relative bg-[#0a0a0a] overflow-hidden">
      {tooltip.visible && tooltip.name && (
        <div
          className="pointer-events-none fixed z-[9999] px-2.5 py-1.5 bg-[#111] border border-[#333] rounded-md text-xs font-medium text-white shadow-lg"
          style={{ top: tooltip.y + 16, left: tooltip.x + 16 }}
        >
          {tooltip.name}
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        zoomControl={false}
      >
        <MapResizer />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {geoData && (
          <GeoJSON
            key={JSON.stringify(store)}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {geoLoading && !geoError && (
        <div className="absolute inset-0 z-[380] flex items-center justify-center pointer-events-none">
          <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]/90 px-4 py-3 text-sm text-zinc-500 shadow-lg">
            Carregando países...
          </div>
        </div>
      )}

      {geoError && (
        <div className="absolute inset-0 z-[380] flex items-center justify-center pointer-events-none">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#0a0a0a]/90 px-4 py-3 text-sm text-zinc-300 shadow-lg">
            Failed to load countries.
          </div>
        </div>
      )}

      <div className="absolute bottom-20 left-4 md:bottom-6 md:left-6 z-[430] bg-[#0a0a0a]/95 backdrop-blur-sm border border-[#1f1f1f] rounded-xl p-4 w-44 shadow-lg">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Legenda</h4>
        <div className="space-y-2">
          {[
            ['living',        'Morei / Moro'],
            ['visited',       'Visitei'],
            ['dream',         'Sonho'],
            ['want_to_visit', 'Quero ir'],
            ['curious',       'Curioso'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: statusColors[key] }} />
              <span className="text-xs text-zinc-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-16 right-4 md:top-4 md:right-4 z-[430] bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#1f1f1f] rounded-lg px-3 py-2 max-w-[200px] md:max-w-[260px]">
        <p className="text-xs text-zinc-500">Click a country to set a status</p>
        {selectedName && (
          <p className="text-[11px] mt-1 text-zinc-400 truncate">
            Selected: {selectedName} • {currentStatus.replace('_', ' ')}
          </p>
        )}
      </div>

      <CountrySidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        countryCode={selectedCode}
        countryName={selectedName}
        status={currentStatus}
        locale={locale}
        onStatusChange={setCountryStatus}
      />
    </div>
  );
}
