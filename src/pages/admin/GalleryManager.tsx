import React, { useState } from 'react';
import { GalleryItem, GalleryCategory, Book, Project } from '../../types';
import { repository } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon, X, AlertCircle, Loader2 } from 'lucide-react';

interface GalleryManagerProps {
  gallery: GalleryItem[];
  books: Book[];
  projects: Project[];
  onRefresh: () => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ gallery, books, projects, onRefresh }) => {
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categories: GalleryCategory[] = ['Capas', 'Conceitos', 'Ilustrações', 'Fotografias', 'Outros'];

  const emptyItem: Partial<GalleryItem> = {
    title: '',
    description: '',
    image_url: '',
    category: 'Conceitos',
    book_id: null,
    project_id: null,
    published: true,
  };

  const handleOpenCreate = () => {
    setSaveError(null);
    setEditingItem(emptyItem);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setSaveError(null);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta imagem da galeria?')) {
      try {
        await repository.deleteGalleryItem(id);
        onRefresh();
      } catch (err: any) {
        alert(err?.message || 'Falha ao remover o item da galeria.');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAsset(file, 'gallery');
      setEditingItem((prev) => ({
        ...prev,
        image_url: url,
        title: prev?.title || file.name.replace(/\.[^/.]+$/, '')
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title || !editingItem.image_url) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await repository.saveGalleryItem({
        ...editingItem,
        book_id: editingItem.book_id || null,
        project_id: editingItem.project_id || null
      });

      setIsModalOpen(false);
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      console.error('Erro ao salvar na galeria:', err);
      setSaveError(err?.message || 'Não foi possível salvar o item da galeria.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Gerenciamento da Galeria
          </h2>
          <p className="text-xs text-stone-500">
            Envie imagens, artes de capa e fotografias conceituais usando o Supabase Storage.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Adicionar Imagem
        </button>
      </div>

      {gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-square bg-stone-100 dark:bg-stone-950 relative overflow-hidden">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-stone-900/80 text-stone-200 rounded-xs">
                  {item.category}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="font-serif font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-[11px] text-stone-500 truncate">{item.description}</p>
                )}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {item.published ? 'Público' : 'Oculto'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-sm">
          <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="font-serif text-lg text-stone-800 dark:text-stone-200">Nenhuma imagem na galeria</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingItem.id ? 'Editar Imagem' : 'Adicionar Imagem à Galeria'}
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

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Título da Imagem *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Ilustração de capa - Edição 2026"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Categoria
                </label>
                <select
                  value={editingItem.category || 'Conceitos'}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, category: e.target.value as GalleryCategory }))}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Upload image */}
              <div className="space-y-1">
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300">
                  Arquivo de Imagem (Upload Supabase ou URL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingItem.image_url || ''}
                    onChange={(e) => setEditingItem((prev) => ({ ...prev, image_url: e.target.value }))}
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
                  Descrição / Notas
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Informações adicionais sobre o conceito ou fotografia..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="gal-pub"
                  checked={Boolean(editingItem.published)}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 accent-amber-800"
                />
                <label htmlFor="gal-pub" className="font-semibold text-stone-800 dark:text-stone-200">
                  Visível na Galeria pública
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
                  <span>{isSaving ? 'Salvando...' : 'Salvar Imagem'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
