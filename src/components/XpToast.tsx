"use client";

import { useEffect, useState } from 'react';
import { Star, Zap } from 'lucide-react';

interface XpEvent {
  id: number;
  amount: number;
}

interface LevelUpEvent {
  level: number;
}

export function XpToastContainer() {
  const [toasts, setToasts] = useState<XpEvent[]>([]);
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null);

  useEffect(() => {
    const handleXp = (e: Event) => {
      const amount = (e as CustomEvent<number>).detail;
      if (!amount || amount <= 0) return;
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, amount }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 1800);
    };

    const handleLevelUp = (e: Event) => {
      const level = (e as CustomEvent<number>).detail;
      setLevelUp({ level });
      setTimeout(() => setLevelUp(null), 3500);
    };

    window.addEventListener('xp-gained', handleXp);
    window.addEventListener('level-up', handleLevelUp);
    return () => {
      window.removeEventListener('xp-gained', handleXp);
      window.removeEventListener('level-up', handleLevelUp);
    };
  }, []);

  return (
    <>
      {/* XP Toasts */}
      <div className="fixed bottom-8 right-6 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#000',
              animation: 'xp-float 1.8s ease-out forwards',
            }}
          >
            <Zap size={13} />
            +{toast.amount} XP
          </div>
        ))}
      </div>

      {/* Level Up Modal */}
      {levelUp && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
          style={{ animation: 'fade-in 0.3s ease-out' }}
        >
          <div
            className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #111113, #1a1a1f)',
              border: '1px solid rgba(251,191,36,0.3)',
              animation: 'modal-pop 0.25s ease-out',
            }}
          >
            <div className="text-5xl" style={{ animation: 'spin-once 0.6s ease-out' }}>⭐</div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fbbf24' }}>
              Nível alcançado!
            </p>
            <p className="text-4xl font-black text-white">
              Nível {levelUp.level}
            </p>
            <p className="text-sm text-zinc-400">Continue assim e suba ainda mais!</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes xp-float {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          60%  { opacity: 1; transform: translateY(-28px) scale(1.05); }
          100% { opacity: 0; transform: translateY(-50px) scale(0.9); }
        }
        @keyframes modal-pop {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fade-in {
          from { background-color: transparent; }
          to   { background-color: rgba(0,0,0,0.5); }
        }
        @keyframes spin-once {
          from { transform: rotate(-20deg) scale(0.6); }
          to   { transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </>
  );
}
