"use client";

import { useState } from 'react';
import { Film, CheckCircle2, Plus, Trash2, Pencil, Image as ImageIcon, Star } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { Movie, MovieStatus } from '@/lib/types';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function MoviesPage() {
  const { locale } = useThemeStore();
  const movies = useLifeOSStore((s) => s.movies);
  const addMovie = useLifeOSStore((s) => s.addMovie);
  const updateMovie = useLifeOSStore((s) => s.updateMovie);
  const removeMovie = useLifeOSStore((s) => s.removeMovie);

  const [showModal, setShowModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [status, setStatus] = useState<MovieStatus>('watchlist');
  const [posterUrl, setPosterUrl] = useState('');
  const [rating, setRating] = useState<number>(0);

  const resetForm = () => {
    setTitle('');
    setDirector('');
    setYear('');
    setStatus('watchlist');
    setPosterUrl('');
    setRating(0);
    setEditingMovieId(null);
  };

  const handleEditClick = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation();
    setTitle(movie.title);
    setDirector(movie.director || '');
    setYear(movie.year || '');
    setStatus(movie.status);
    setPosterUrl(movie.posterUrl || '');
    setRating(movie.rating || 0);
    setEditingMovieId(movie.id);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert(locale === 'pt' ? 'Imagem muito grande (máx 800KB)' : 'Image too large (max 800KB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const movieData = {
      title,
      director,
      year: year === '' ? undefined : Number(year),
      status,
      posterUrl,
      rating,
      genres: []
    };

    if (editingMovieId) {
      updateMovie(editingMovieId, movieData);
    } else {
      addMovie(movieData);
    }
    resetForm();
    setShowModal(false);
  };

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div className="ui-card ui-card-hover flex flex-col group overflow-hidden transition-all h-full">
      <div className="relative aspect-[2/3] w-full bg-[var(--bg-elevated)] border-b border-[var(--border)] overflow-hidden">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--fg-muted)]">
            <Film size={48} className="mb-2 opacity-50" />
            <span className="text-xs uppercase tracking-widest opacity-50">No Poster</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          <div className="flex justify-end gap-2">
            <button onClick={(e) => handleEditClick(e, movie)} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:bg-blue-500/80 text-white">
              <Pencil size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setDeleteId(movie.id); }} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:bg-red-500/80 text-white">
              <Trash2 size={14} />
            </button>
          </div>
          {movie.status === 'watched' && movie.rating && (
            <div className="flex items-center gap-1 text-yellow-400 font-bold bg-black/50 backdrop-blur-sm w-fit px-2 py-1 rounded-md border border-white/10 text-sm">
              <Star size={14} className="fill-current" /> {movie.rating}/5
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-[var(--fg-base)] line-clamp-1 mb-1">{movie.title}</h3>
        <p className="text-xs text-[var(--fg-subtle)] truncate mb-3">{movie.director} {movie.year ? `• ${movie.year}` : ''}</p>
        
        <div className="mt-auto pt-3 border-t border-[var(--border)]">
          <span className="text-[10px] text-[var(--fg-base)] uppercase tracking-widest font-bold bg-[var(--bg-elevated)] px-2 py-1 rounded border border-[var(--border)]">
            {movie.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">
              {locale === 'pt' ? 'Filmes' : locale === 'es' ? 'Películas' : 'Movies'}
            </h1>
            <p className="text-[var(--fg-subtle)]">
              {locale === 'pt' ? 'Sua coleção e watchlist.' : locale === 'es' ? 'Tu colección y lista de deseos.' : 'Your collection and watchlist.'}
            </p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="ui-button-primary">
            <Plus size={16} /> {locale === 'pt' ? 'Novo filme' : locale === 'es' ? 'Nueva película' : 'New Movie'}
          </button>
        </header>

        {movies.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl">
            <Film size={48} className="mx-auto text-[var(--border)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--fg-base)]">{locale === 'pt' ? 'Nenhum filme ainda' : 'No movies yet'}</h3>
            <p className="text-[var(--fg-subtle)] mt-1">{locale === 'pt' ? 'Adicione seu primeiro filme à lista.' : 'Add your first movie to the list.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4 max-w-lg w-full">
            <h2 className="text-xl font-bold text-[var(--fg-base)]">
              {editingMovieId ? (locale === 'pt' ? 'Editar filme' : 'Edit movie') : (locale === 'pt' ? 'Novo filme' : 'New movie')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-36 shrink-0 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg overflow-hidden flex items-center justify-center relative">
                  {posterUrl ? (
                    <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-[var(--fg-muted)]" />
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="ui-label">{locale === 'pt' ? 'URL do Poster (ou clique na imagem para upload)' : 'Poster URL (or click image to upload)'}</label>
                    <input type="url" value={posterUrl} onChange={e => setPosterUrl(e.target.value)} className="ui-input text-xs" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="ui-label">{locale === 'pt' ? 'Título' : 'Title'}</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="ui-input" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Diretor' : 'Director'}</label>
                  <input type="text" value={director} onChange={e => setDirector(e.target.value)} className="ui-input" />
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Ano' : 'Year'}</label>
                  <input type="number" value={year} onChange={e => setYear(e.target.value ? Number(e.target.value) : '')} className="ui-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Status</label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="ui-input">
                    <option value="watchlist">{locale === 'pt' ? 'Watchlist' : 'Watchlist'}</option>
                    <option value="watching">{locale === 'pt' ? 'Assistindo' : 'Watching'}</option>
                    <option value="watched">{locale === 'pt' ? 'Assistido' : 'Watched'}</option>
                  </select>
                </div>
                {status === 'watched' && (
                  <div>
                    <label className="ui-label">{locale === 'pt' ? 'Nota (0-5)' : 'Rating (0-5)'}</label>
                    <input type="number" step="0.5" min={0} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} className="ui-input" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
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
        onConfirm={() => { if (deleteId) removeMovie(deleteId); }} 
        title={locale === 'pt' ? 'Deletar filme?' : 'Delete movie?'}
      />
    </div>
  );
}
