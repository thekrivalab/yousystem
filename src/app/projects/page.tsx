"use client";

import { useState } from 'react';
import { Briefcase, CheckCircle2, Circle, Plus, X, Trash2, Pencil } from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { Project } from '@/lib/types';
import { useThemeStore } from '@/lib/theme-store';
import { t } from '@/lib/i18n';
import { getLocalDateString } from '@/lib/date';

export default function ProjectsPage() {
  const projects = useLifeOSStore((s) => s.projects);
  const addProject = useLifeOSStore((s) => s.addProject);
  const updateProject = useLifeOSStore((s) => s.updateProject);
  const removeProject = useLifeOSStore((s) => s.removeProject);
  const toggleProjectTask = useLifeOSStore((s) => s.toggleProjectTask);
  const addProjectTask = useLifeOSStore((s) => s.addProjectTask);
  
  const { locale } = useThemeStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Project['type']>('side_project');
  const [status, setStatus] = useState<Project['status']>('active');
  const [tags, setTags] = useState('');

  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const openModal = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setTitle(project.title);
      setDescription(project.description);
      setType(project.type);
      setStatus(project.status);
      setTags(project.tags.join(', '));
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setType('side_project');
      setStatus('active');
      setTags('');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      type,
      status,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (editingId) {
      updateProject(editingId, payload);
    } else {
      addProject({
        ...payload,
        tasks: [],
        startedAt: getLocalDateString(),
      });
    }
    setShowModal(false);
  };

  const handleAddTask = (projectId: string) => {
    if (!newTaskTitle.trim()) return;
    addProjectTask(projectId, newTaskTitle.trim());
    setNewTaskTitle('');
    setAddingTaskFor(null);
  };

  const active = projects.filter(p => p.status === 'active');
  const completed = projects.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)] mb-2">{t(locale, 'projects', 'title')}</h1>
            <p className="text-[var(--fg-subtle)]">{t(locale, 'projects', 'subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="ui-button-primary">
            <Plus size={16} /> {t(locale, 'projects', 'addProject')}
          </button>
        </header>

        {active.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-4">🚀 {t(locale, 'projects', 'active')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {active.map(project => (
                <div key={project.id} className="ui-card p-6 group hover:ring-[var(--accent)]/30 transition-colors flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] flex items-center justify-center shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[var(--fg-base)] group-hover:text-[var(--accent)] transition-colors">{project.title}</h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-subtle)]">{project.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t(locale, 'projects', 'active')}</span>
                      <button
                        onClick={() => openModal(project)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-blue-500/10 text-blue-400"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => removeProject(project.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-rose-500/10 text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--fg-subtle)]">{project.description}</p>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
                      <span className="text-[var(--fg-subtle)]">{t(locale, 'common', 'progress')}</span>
                      <span className="text-[var(--fg-base)]">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider mb-2">{t(locale, 'projects', 'tasks')}</h3>
                    <div className="space-y-2">
                      {project.tasks.map(task => (
                        <button key={task.id} onClick={() => toggleProjectTask(project.id, task.id)} className="flex items-center gap-3 w-full text-left group/task">
                          {task.done
                            ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            : <Circle size={16} className="text-zinc-600 group-hover/task:text-[var(--fg-subtle)] shrink-0" />}
                          <span className={`text-sm transition-colors ${task.done ? 'text-[var(--fg-subtle)] line-through' : 'text-[var(--fg-muted)] group-hover/task:text-[var(--fg-base)]'}`}>{task.title}</span>
                        </button>
                      ))}
                    </div>

                    {addingTaskFor === project.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          autoFocus
                          type="text"
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTask(project.id); if (e.key === 'Escape') setAddingTaskFor(null); }}
                          className="flex-1 ui-input text-xs focus:ring-[var(--accent)]"
                        />
                        <button onClick={() => handleAddTask(project.id)} className="px-3 py-1.5 bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] rounded-lg text-xs font-semibold">{t(locale, 'common', 'add')}</button>
                        <button onClick={() => setAddingTaskFor(null)} className="px-2 py-1.5 text-[var(--fg-subtle)] hover:text-[var(--fg-base)]"><X size={14} /></button>
                      </div>
                    ) : (
                        <button onClick={() => setAddingTaskFor(project.id)} className="flex items-center gap-1.5 mt-2 text-xs text-[var(--fg-subtle)] hover:text-[var(--fg-base)] transition-colors">
                        <Plus size={12} /> {t(locale, 'common', 'add')}
                      </button>
                    )}
                  </div>

                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
                      {project.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-md text-xs text-[var(--fg-subtle)]">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-4">✅ {t(locale, 'projects', 'completed')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completed.map(project => (
                <div key={project.id} className="ui-card p-6 opacity-60 group flex justify-between items-start hover:ring-[var(--accent)]/30 transition-colors">
                  <div>
                    <h2 className="text-base font-bold text-[var(--fg-subtle)] group-hover:text-[var(--fg-base)] transition-colors">{project.title}</h2>
                    <p className="text-sm text-[var(--fg-subtle)] mt-1">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(project)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-blue-500/10 text-blue-400 shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => removeProject(project.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-rose-500/10 text-rose-400 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length === 0 && (
          <div className="ui-card p-12 text-center">
            <Briefcase size={32} className="mx-auto mb-3 text-[var(--fg-subtle)]" />
            <p className="text-[var(--fg-muted)] mb-1">{t(locale, 'common', 'empty')}</p>
            <p className="text-sm text-[var(--fg-subtle)]">{t(locale, 'projects', 'emptyDesc')}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">{editingId ? t(locale, 'common', 'edit') : t(locale, 'projects', 'addProject')}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Nome do projeto' : locale === 'es' ? 'Nombre del proyecto' : 'Project Name'}</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder={locale === 'pt' ? 'Ex.: Meu startup' : locale === 'es' ? 'Ej.: Mi startup' : 'e.g. My Startup'} className="ui-input focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="ui-label">{t(locale, 'common', 'description')}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="ui-input focus:ring-[var(--accent)] h-20 resize-none" placeholder={locale === 'pt' ? 'Sobre o que é este projeto?' : locale === 'es' ? '¿De qué trata este proyecto?' : "What's this project about?"} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{t(locale, 'common', 'type')}</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="ui-input focus:ring-[var(--accent)]">
                    <option value="side_project">{locale === 'pt' ? 'Projeto paralelo' : locale === 'es' ? 'Proyecto paralelo' : 'Side Project'}</option>
                    <option value="app">{locale === 'pt' ? 'Aplicativo' : locale === 'es' ? 'App' : 'App'}</option>
                    <option value="business">{locale === 'pt' ? 'Negócio' : locale === 'es' ? 'Negocio' : 'Business'}</option>
                    <option value="creative">{locale === 'pt' ? 'Criativo' : locale === 'es' ? 'Creativo' : 'Creative'}</option>
                    <option value="research">{locale === 'pt' ? 'Pesquisa' : locale === 'es' ? 'Investigación' : 'Research'}</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Tags (separadas por vírgula)' : locale === 'es' ? 'Etiquetas (separadas por coma)' : 'Tags (comma-sep)'}</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder={locale === 'pt' ? 'Ex.: React, Design' : locale === 'es' ? 'Ej.: React, Diseño' : 'e.g. React, Design'} className="ui-input focus:ring-[var(--accent)]" />
                </div>
              </div>
              {editingId && (
                <div>
                  <label className="ui-label">{t(locale, 'common', 'status')}</label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="ui-input focus:ring-[var(--accent)]">
                    <option value="active">{locale === 'pt' ? 'Ativo' : locale === 'es' ? 'Activo' : 'Active'}</option>
                    <option value="completed">{locale === 'pt' ? 'Concluído' : locale === 'es' ? 'Completado' : 'Completed'}</option>
                    <option value="paused">{locale === 'pt' ? 'Pausado' : locale === 'es' ? 'Pausado' : 'Paused'}</option>
                    <option value="archived">{locale === 'pt' ? 'Arquivado' : locale === 'es' ? 'Archivado' : 'Archived'}</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="ui-button-ghost">{t(locale, 'common', 'cancel')}</button>
                <button type="submit" className="ui-button-primary">{editingId ? t(locale, 'common', 'save') : t(locale, 'common', 'create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
