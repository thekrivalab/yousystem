"use client";

import { useState } from 'react';
import { Book as BookIcon, CheckCircle2, Plus, Trash2, Pencil, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { Book, LearningStatus } from '@/lib/types';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function LibraryPage() {
  const { locale } = useThemeStore();
  const books = useLifeOSStore((s) => s.books);
  const addBook = useLifeOSStore((s) => s.addBook);
  const updateBook = useLifeOSStore((s) => s.updateBook);
  const removeBook = useLifeOSStore((s) => s.removeBook);

  const [showModal, setShowModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<LearningStatus>('not_started');
  const [progress, setProgress] = useState(0);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setStatus('not_started');
    setProgress(0);
    setEditingBookId(null);
  };

  const handleEditClick = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setProgress(book.progress);
    setEditingBookId(book.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookId) {
      updateBook(editingBookId, { title, author, status, progress });
    } else {
      addBook({ title, author, status });
      // since addBook might not take progress directly in Omit<Book, 'id' | 'progress'>,
      // wait, let's check types: `addBook: (book: Omit<Book, 'id' | 'progress'>) => void;`
      // It sets progress to 0 by default. So if creating new, we just let it be 0.
    }
    resetForm();
    setShowModal(false);
  };

  const BookCard = ({ book }: { book: Book }) => (
    <div className="ui-card ui-card-hover p-5 flex flex-col group transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <BookIcon size={24} className="text-[var(--fg-muted)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--fg-base)] group-hover:text-emerald-400 transition-colors line-clamp-1">{book.title}</h3>
            <p className="text-xs text-[var(--fg-subtle)] truncate">{book.author}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={(e) => handleEditClick(e, book)} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center transition-all hover:border-blue-500 text-[var(--fg-subtle)] hover:text-blue-500">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(book.id); }} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center transition-all hover:border-red-500 text-[var(--fg-subtle)] hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="mt-auto pt-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--fg-subtle)] uppercase tracking-wider font-semibold">{locale === 'pt' ? 'Status' : 'Status'}</span>
          <span className="text-[var(--fg-base)] capitalize bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full border border-[var(--border)]">
            {book.status.replace('_', ' ')}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--fg-subtle)]">{locale === 'pt' ? 'Progresso' : 'Progress'}</span>
            <span className="text-emerald-400 font-medium">{book.progress}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${book.progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">
              {locale === 'pt' ? 'Biblioteca' : locale === 'es' ? 'Biblioteca' : 'Library'}
            </h1>
            <p className="text-[var(--fg-subtle)]">
              {locale === 'pt' ? 'Seus livros e materiais de estudo.' : locale === 'es' ? 'Tus libros y materiales de estudio.' : 'Your books and study materials.'}
            </p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="ui-button-primary">
            <Plus size={16} /> {locale === 'pt' ? 'Novo livro' : locale === 'es' ? 'Nuevo libro' : 'New Book'}
          </button>
        </header>

        {books.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl">
            <BookIcon size={48} className="mx-auto text-[var(--border)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--fg-base)]">{locale === 'pt' ? 'Nenhum livro ainda' : 'No books yet'}</h3>
            <p className="text-[var(--fg-subtle)] mt-1">{locale === 'pt' ? 'Adicione seu primeiro livro para começar.' : 'Add your first book to get started.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <h2 className="text-xl font-bold text-[var(--fg-base)]">
              {editingBookId ? (locale === 'pt' ? 'Editar livro' : 'Edit book') : (locale === 'pt' ? 'Novo livro' : 'New book')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Título' : 'Title'}</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="ui-input" />
              </div>
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Autor' : 'Author'}</label>
                <input type="text" required value={author} onChange={e => setAuthor(e.target.value)} className="ui-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Status</label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="ui-input">
                    <option value="not_started">{locale === 'pt' ? 'Não Iniciado' : 'Not Started'}</option>
                    <option value="in_progress">{locale === 'pt' ? 'Lendo' : 'Reading'}</option>
                    <option value="completed">{locale === 'pt' ? 'Concluído' : 'Completed'}</option>
                    <option value="wishlist">{locale === 'pt' ? 'Lista de Desejos' : 'Wishlist'}</option>
                  </select>
                </div>
                {editingBookId && (
                  <div>
                    <label className="ui-label">{locale === 'pt' ? 'Progresso (%)' : 'Progress (%)'}</label>
                    <input type="number" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} className="ui-input" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="ui-button-ghost">
                  {locale === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" className="ui-button-primary">
                  {locale === 'pt' ? 'Salvar' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onCancel={() => setDeleteId(null)} 
        onConfirm={() => { if (deleteId) removeBook(deleteId); }} 
        title={locale === 'pt' ? 'Deletar livro?' : 'Delete book?'}
      />
    </div>
  );
}
