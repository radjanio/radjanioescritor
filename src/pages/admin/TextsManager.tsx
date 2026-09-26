import React, { useState } from 'react';
import { TextItem, TextCategory } from '../../types';
import { repository, slugify } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Upload, Feather, X } from 'lucide-react';

interface TextsManagerProps {
  texts: TextItem[];
  onRefresh: () => void;
}

export const TextsManager: React.FC<TextsManagerProps> = ({ texts, onRefresh }) => {
  const [editingText, setEditingText] = useState<Partial<TextItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const categories: TextCategory[] = ['Poemas', 'Contos', 'Crônicas', 'Reflexões', 'Fragmentos'];

  const emptyText: Partial<TextItem> = {
    title: '',
    slug: '',
    content: '',
    category: 'Crônicas',
    published: true,
    image_url: ''
  };

  const handleOpenCreate = () => {
    setEditingText(emptyText);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TextItem) => {
    setEditingText(t);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este texto?')) {
      await repository.deleteText(id);
      onRefresh();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAsset(file, 'texts');
      setEditingText((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingText || !editingText.title) return;
    await repository.saveText(editingText);
    setIsModalOpen(false);
    setEditingText(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Gerenciamento de Textos Autorais
          </h2>
          <p className="text-xs text-stone-500">
            Poemas, contos, crônicas e ensaios independentes de Radjanio Silva Souza.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Texto
        </button>
      </div>

      {texts.length > 0 ? (
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-100/75 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {texts.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                      <div>{t.title}</div>
                      <div className="text-[10px] font-mono text-stone-400 font-normal">/{t.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-amber-800 dark:text-amber-400 font-medium">{t.category}</span>
                    </td>
                    <td className="py-3 px-4">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4">
                      {t.published ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Publicado</span>
                      ) : (
                        <span className="text-stone-400">Rascunho</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(t)} className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 text-stone-400 hover:text-rose-600">
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
          <p className="font-serif text-lg text-stone-800 dark:text-stone-200">Nenhum texto cadastrado</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingText && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingText.id ? 'Editar Texto' : 'Novo Texto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingText.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingText((prev) => ({ ...prev, title, slug: prev?.slug ? prev.slug : slugify(title) }));
                    }}
                    placeholder="Título da obra ou ensaio"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editingText.category || 'Crônicas'}
                    onChange={(e) => setEditingText((prev) => ({ ...prev, category: e.target.value as TextCategory }))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Conteúdo do Texto *
                </label>
                <textarea
                  rows={12}
                  required
                  value={editingText.content || ''}
                  onChange={(e) => setEditingText((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva os versos, o conto ou a crônica..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm font-editorial text-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="text-pub"
                  checked={Boolean(editingText.published)}
                  onChange={(e) => setEditingText((prev) => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 accent-amber-800"
                />
                <label htmlFor="text-pub" className="font-semibold text-stone-800 dark:text-stone-200">
                  Publicar texto no site (desmarcado = rascunho)
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
                  Salvar Texto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
