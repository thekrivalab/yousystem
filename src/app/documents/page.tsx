"use client";

import { useLifeOSStore } from '@/lib/store';
import { useState } from 'react';
import { BookOpen, Calendar, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { useThemeStore } from '@/lib/theme-store';

export default function DocumentsPage() {
  const { locale } = useThemeStore();
  const documents = useLifeOSStore((state) => state.documents);
  const addDocument = useLifeOSStore((state) => state.addDocument);
  const removeDocument = useLifeOSStore((state) => state.removeDocument);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'passport' | 'cnh' | 'rg' | 'certificate' | 'contract' | 'warranty' | 'other'>('passport');
  const [number, setNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addDocument({ 
      title, 
      type, 
      number: number || undefined, 
      expiryDate: expiryDate || undefined, 
      notes: notes || undefined 
    });
    setTitle('');
    setNumber('');
    setExpiryDate('');
    setNotes('');
    setShowAddModal(false);
  };

  const getDocBadgeColor = (docType: string) => {
    switch (docType) {
      case 'passport': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'cnh': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'rg': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'certificate': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'contract': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'warranty': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-[var(--bg-elevated)] text-[var(--fg-subtle)] border border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">
              {locale === 'pt' ? 'Documentos' : locale === 'es' ? 'Documentos' : 'Documents Vault'}
            </h1>
            <p className="text-[var(--fg-subtle)]">
              {locale === 'pt' ? 'Acompanhe vencimentos, números e documentos importantes.' : locale === 'es' ? 'Controla vencimientos, números y documentos importantes.' : 'Keep track of expirations, registration numbers, and critical personal paperwork.'}
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="ui-button-primary"
          >
            <Plus size={16} /> {locale === 'pt' ? 'Cadastrar documento' : locale === 'es' ? 'Registrar documento' : 'Register Document'}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map(doc => (
            <div key={doc.id} className="ui-card p-6 relative group hover:ring-zinc-500 transition-colors">
              <button 
                onClick={() => removeDocument(doc.id)}
                className="absolute top-4 right-4 text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getDocBadgeColor(doc.type)}`}>
                  {doc.type}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-[var(--fg-base)] mb-2">{doc.title}</h3>
              
              <div className="space-y-2 text-sm text-[var(--fg-subtle)] mb-6">
                {doc.number && (
                  <p className="flex justify-between">
                    <span className="text-zinc-600">Doc Number:</span>
                    <span className="font-mono text-[var(--fg-base)]">{doc.number}</span>
                  </p>
                )}
                {doc.expiryDate && (
                  <p className="flex justify-between">
                    <span className="text-zinc-600">Expiration:</span>
                    <span className={`font-semibold ${new Date(doc.expiryDate) < new Date() ? 'text-rose-400' : 'text-[var(--fg-base)]'}`}>
                      {doc.expiryDate}
                    </span>
                  </p>
                )}
              </div>

              {doc.notes && (
                <div className="p-3 bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-xl text-xs text-[var(--fg-subtle)]">
                  <p className="font-semibold text-[var(--fg-subtle)] mb-1">Notes</p>
                  <p className="leading-relaxed">{doc.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <h2 className="text-xl font-bold text-[var(--fg-base)]">{locale === 'pt' ? 'Cadastrar documento pessoal' : locale === 'es' ? 'Registrar documento personal' : 'Register Personal Document'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Título do documento' : locale === 'es' ? 'Título del documento' : 'Document Title'}</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="ui-input"
                  placeholder={locale === 'pt' ? 'Digite o título do documento' : locale === 'es' ? 'Escribe el título del documento' : 'Enter document title'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Tipo' : locale === 'es' ? 'Tipo' : 'Type'}</label>
                  <select 
                    value={type} 
                    onChange={(e: any) => setType(e.target.value)}
                    className="ui-input"
                  >
                    <option value="passport">{locale === 'pt' ? 'Passaporte' : locale === 'es' ? 'Pasaporte' : 'Passport'}</option>
                    <option value="cnh">{locale === 'pt' ? 'CNH (Carteira de motorista)' : locale === 'es' ? 'CNH (licencia de conducir)' : "CNH (Driver's License)"}</option>
                    <option value="rg">{locale === 'pt' ? 'RG (identidade)' : locale === 'es' ? 'RG (documento de identidad)' : 'RG (ID Card)'}</option>
                    <option value="certificate">{locale === 'pt' ? 'Certificado' : locale === 'es' ? 'Certificado' : 'Certificate'}</option>
                    <option value="contract">{locale === 'pt' ? 'Contrato' : locale === 'es' ? 'Contrato' : 'Contract'}</option>
                    <option value="warranty">{locale === 'pt' ? 'Garantia' : locale === 'es' ? 'Garantía' : 'Warranty'}</option>
                    <option value="other">{locale === 'pt' ? 'Outro' : locale === 'es' ? 'Otro' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Número do documento' : locale === 'es' ? 'Número del documento' : 'Document Number'}</label>
                  <input 
                    type="text" 
                    value={number} 
                    onChange={(e) => setNumber(e.target.value)}
                    className="ui-input"
                  placeholder={locale === 'pt' ? 'Registro / chave de identificação' : locale === 'es' ? 'Registro / clave de identificación' : 'Registry / Id key'}
                  />
                </div>
              </div>

              <div>
                <label className="ui-label">{locale === 'pt' ? 'Data de validade' : locale === 'es' ? 'Fecha de vencimiento' : 'Expiry Date'}</label>
                <input 
                  type="date" 
                  value={expiryDate} 
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="ui-input"
                />
              </div>

              <div>
                <label className="ui-label">{locale === 'pt' ? 'Notas e local de armazenamento' : locale === 'es' ? 'Notas y lugar de almacenamiento' : 'Notes & Storage Location'}</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="ui-input h-20 resize-none"
                  placeholder={locale === 'pt' ? 'Ex.: passaporte vencido na gaveta, backup em PDF no Drive...' : locale === 'es' ? 'Ej.: pasaporte vencido en un cajón, copia PDF en Drive...' : 'e.g. Expired passaporte kept in drawer, pdf backup on Drive...'}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="ui-button-ghost"
                >
                  {locale === 'pt' ? 'Cancelar' : locale === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="ui-button-primary"
                >
                  {locale === 'pt' ? 'Cadastrar' : locale === 'es' ? 'Registrar' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
