import React, { useState } from 'react';
import { Update, UpdateCategory, Book, Project } from '../../types';
import { repository, slugify } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, Feather, X, AlertCircle, Loader2 } from 'lucide-react';

interface UpdatesManagerProps {
  updates: Update[];
  books: Book[];
  projects: Project[];
  onRefresh: () => void;
}

export const UpdatesManager: React.FC<UpdatesManagerProps> = ({ updates, books, projects, onRefresh }) => {
  const [editingUp, setEditingUp] = useState<Partial<Update> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categories: UpdateCategory[] = [
    'Escrita',
    'Capítulos',
    'Ideias',
    'Revisão',
    'Capa',
    'Publicação',
    'Desenvolvimento',
    'Reflexões',
  ];

  const emptyUpdate: Partial<Update> = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'Escrita',
    book_id: null,
    project_id: null,
    published: true,
    image_url: ''
  };

  const handleOpenCreate = () => {
    setSaveError(null);
    setEditingUp(emptyUpdate);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (up: Update) => {
    setSaveError(null);
    setEditingUp(up);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta anotação do diário?')) {
      try {
        await repository.deleteUpdate(id);
        onRefresh();
      } catch (err: any) {
        alert(err?.message || 'Falha ao remover a anotação.');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAsset(file, 'updates');
      setEditingUp((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUp || !editingUp.title) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Resolve book / project titles for denormalized display
      const relatedBook = books.find((b) => b.id === editingUp.book_id);
      const relatedProj = projects.find((p) => p.id === editingUp.project_id);

      await repository.saveUpdate({
        ...editingUp,
        book_id: editingUp.book_id || null,
        project_id: editingUp.project_id || null,
        book_title: relatedBook?.title || '',
        project_title: relatedProj?.title || ''
      });

      setIsModalOpen(false);
      setEditingUp(null);
      onRefresh();
    } catch (err: any) {
      console.error('Erro ao salvar atualização:', err);
      setSaveError(err?.message || 'Não foi possível salvar a anotação do diário.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Gerenciamento do Diário de Escrita
          </h2>
          <p className="text-xs text-stone-500">
            Publique registros do ofício, fragmentos de capítulos e notas de criação.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova Publicação
        </button>
      </div>

      {updates.length > 0 ? (
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-100/75 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Obra / Projeto</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {updates.map((up) => (
                  <tr key={up.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                      <div>{up.title}</div>
                      <div className="text-[10px] font-mono text-stone-400 font-normal">/{up.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-amber-800 dark:text-amber-400 font-medium">
                        {up.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {up.book_title || up.project_title || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(up.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      {up.published ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Publicado</span>
                      ) : (
                        <span className="text-stone-400">Rascunho</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(up)} className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(up.id)} className="p-1.5 text-stone-400 hover:text-rose-600">
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
          <Feather className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="font-serif text-lg text-stone-800 dark:text-stone-200">Nenhuma anotação de escrita cadastrada</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingUp && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingUp.id ? 'Editar Anotação' : 'Nova Anotação no Diário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {saveError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-sm text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUp.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingUp((prev) => ({ ...prev, title, slug: prev?.slug ? prev.slug : slugify(title) }));
                    }}
                    placeholder="Título da publicação"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editingUp.category || 'Escrita'}
                    onChange={(e) => setEditingUp((prev) => ({ ...prev, category: e.target.value as UpdateCategory }))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Associations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Associar a Livro (Opcional)
                  </label>
                  <select
                    value={editingUp.book_id || ''}
                    onChange={(e) => setEditingUp((prev) => ({ ...prev, book_id: e.target.value || null }))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  >
                    <option value="">Nenhum</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Associar a Projeto (Opcional)
                  </label>
                  <select
                    value={editingUp.project_id || ''}
                    onChange={(e) => setEditingUp((prev) => ({ ...prev, project_id: e.target.value || null }))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  >
                    <option value="">Nenhum</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-1">
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300">
                  Imagem Opcional (URL ou Upload)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingUp.image_url || ''}
                    onChange={(e) => setEditingUp((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                  <label className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-sm cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Enviando...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Resumo / Excerpt
                </label>
                <input
                  type="text"
                  value={editingUp.excerpt || ''}
                  onChange={(e) => setEditingUp((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Linha introdutória que resume esta anotação..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Conteúdo do Registro *
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingUp.content || ''}
                  onChange={(e) => setEditingUp((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva livremente sobre as nuances do capítulo, ideias, reflexões ou avanços..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm font-editorial text-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="up-pub"
                  checked={Boolean(editingUp.published)}
                  onChange={(e) => setEditingUp((prev) => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 accent-amber-800"
                />
                <label htmlFor="up-pub" className="font-semibold text-stone-800 dark:text-stone-200">
                  Publicar imediatamente no Diário de Escrita (desmarcado = rascunho)
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
                  disabled={isSaving}
                  className="px-6 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Salvando...' : 'Salvar Registro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
