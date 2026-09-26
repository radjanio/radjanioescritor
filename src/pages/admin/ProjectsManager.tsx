import React, { useState } from 'react';
import { Project, ProjectStage, BookStageStatus } from '../../types';
import { repository, slugify } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, Compass, X } from 'lucide-react';

interface ProjectsManagerProps {
  projects: Project[];
  onRefresh: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onRefresh }) => {
  const [editingProj, setEditingProj] = useState<Partial<Project> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const emptyProject: Partial<Project> = {
    title: '',
    slug: '',
    description: '',
    genre: 'Literatura & Ficção',
    status: 'Em escrita ativa',
    progress: 10,
    image_url: '',
    start_date: new Date().toISOString().split('T')[0],
    expected_release_date: '',
    is_public: true,
    stages: [
      { id: '1', title: 'Estruturação & Pesquisa', status: 'Em andamento', order_index: 0 },
      { id: '2', title: 'Primeiro Rascunho', status: 'Pendente', order_index: 1 },
      { id: '3', title: 'Revisão Textual', status: 'Pendente', order_index: 2 },
    ]
  };

  const handleOpenCreate = () => {
    setEditingProj(emptyProject);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProj(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      await repository.deleteProject(id);
      onRefresh();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAsset(file, 'projects');
      setEditingProj((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj || !editingProj.title) return;
    await repository.saveProject(editingProj);
    setIsModalOpen(false);
    setEditingProj(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Gerenciamento de Projetos
          </h2>
          <p className="text-xs text-stone-500">
            Gerencie obras em desenvolvimento, visibilidade pública e previsão de término.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Criar Projeto
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-100/75 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Projeto</th>
                  <th className="py-3 px-4">Gênero</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progresso</th>
                  <th className="py-3 px-4">Previsão</th>
                  <th className="py-3 px-4">Visibilidade</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                      <div>{p.title}</div>
                      <div className="text-[10px] font-mono text-stone-400 font-normal">/{p.slug}</div>
                    </td>
                    <td className="py-3 px-4">{p.genre}</td>
                    <td className="py-3 px-4">{p.status}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-800 dark:bg-amber-500" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span>{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{p.expected_release_date || 'A definir'}</td>
                    <td className="py-3 px-4">
                      {p.is_public ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Eye className="w-3 h-3" /> Público
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-stone-400">
                          <EyeOff className="w-3 h-3" /> Privado
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-stone-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-sm">
          <Compass className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="font-serif text-lg text-stone-800 dark:text-stone-200">Nenhum projeto cadastrado</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingProj && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingProj.id ? 'Editar Projeto' : 'Novo Projeto Literário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Título do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProj.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingProj((prev) => ({ ...prev, title, slug: prev?.slug ? prev.slug : slugify(title) }));
                    }}
                    placeholder="Título do romance ou projeto"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Gênero
                  </label>
                  <input
                    type="text"
                    value={editingProj.genre || ''}
                    onChange={(e) => setEditingProj((prev) => ({ ...prev, genre: e.target.value }))}
                    placeholder="Romance, Ficção Histórica..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Descrição / Argumento *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingProj.description || ''}
                  onChange={(e) => setEditingProj((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Sinopse do projeto e premissa literária..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Status
                  </label>
                  <input
                    type="text"
                    value={editingProj.status || ''}
                    onChange={(e) => setEditingProj((prev) => ({ ...prev, status: e.target.value }))}
                    placeholder="Em escrita ativa"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Progresso ({editingProj.progress || 0}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingProj.progress || 0}
                    onChange={(e) => setEditingProj((prev) => ({ ...prev, progress: parseInt(e.target.value, 10) }))}
                    className="w-full accent-amber-800 py-2"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Previsão de Término
                  </label>
                  <input
                    type="date"
                    value={editingProj.expected_release_date || ''}
                    onChange={(e) => setEditingProj((prev) => ({ ...prev, expected_release_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Public toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="proj-public"
                  checked={Boolean(editingProj.is_public)}
                  onChange={(e) => setEditingProj((prev) => ({ ...prev, is_public: e.target.checked }))}
                  className="w-4 h-4 accent-amber-800"
                />
                <label htmlFor="proj-public" className="font-semibold text-stone-800 dark:text-stone-200">
                  Visível ao público no site (se desmarcado, apenas o autor verá este projeto)
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm font-semibold uppercase tracking-wider"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
