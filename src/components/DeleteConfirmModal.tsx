"use client";

import { AlertTriangle, Trash2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function DeleteConfirmModal({ isOpen, onConfirm, onCancel, title, description, confirmLabel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div
        className="ui-card w-full max-w-sm p-6 shadow-2xl"
        style={{ animation: 'modal-pop 0.18s ease-out' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'color-mix(in srgb, #f43f5e 12%, transparent)' }}>
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <button onClick={onCancel} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <h3 className="text-base font-bold text-[var(--fg-base)] mb-1">
          {title ?? 'Tem certeza?'}
        </h3>
        <p className="text-sm text-[var(--fg-subtle)] mb-6 leading-relaxed">
          {description ?? 'Esta ação é permanente e não pode ser desfeita. Os dados serão perdidos.'}
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 ui-button-ghost">
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'color-mix(in srgb, #f43f5e 15%, transparent)', color: '#f43f5e', border: '1px solid color-mix(in srgb, #f43f5e 30%, transparent)' }}
          >
            <Trash2 size={14} />
            {confirmLabel ?? 'Deletar'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-pop {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
