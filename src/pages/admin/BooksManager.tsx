import React, { useState } from 'react';
import { Book, BookStatus, BookStage, BookStageStatus } from '../../types';
import { repository, slugify } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Upload,
  BookOpen,
  Check,
  X,
  Layers,
  ExternalLink,
  Percent
} from 'lucide-react';

interface BooksManagerProps {
  books: Book[];
  onRefresh: () => void;
}

export const BooksManager: React.FC<BooksManagerProps> = ({ books, onRefresh }) => {
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const emptyBook: Partial<Book> = {
    title: '',
    slug: '',
    edition: '1ª Edição',
    genre: 'Ficção Literária',
    short_description: '',
    description: '',
    price: null,
    page_count: null,
    cover_url: '',
    store_url: '',
    status: 'Em desenvolvimento',
    progress: 0,
    publication_date: '',
    featured: false,
    stages: [
      { id: 'stg-1', book_id: '', title: 'Planejamento e Pesquisa', status: 'Em andamento', order_index: 0 },
      { id: 'stg-2', book_id: '', title: 'Escrita do Manuscrito', status: 'Pendente', order_index: 1 },
      { id: 'stg-3', book_id: '', title: 'Revisão Editorial', status: 'Pendente', order_index: 2 },
      { id: 'stg-4', book_id: '', title: 'Diagramação & Capa', status: 'Pendente', order_index: 3 },
      { id: 'stg-5', book_id: '', title: 'Publicação Oficial', status: 'Pendente', order_index: 4 },
    ]
  };

  const handleOpenCreate = () => {
    setEditingBook(emptyBook);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Book) => {
    setEditingBook({
      ...b,
      stages: b.stages && b.stages.length > 0 ? b.stages : emptyBook.stages
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este livro?')) {
      await repository.deleteBook(id);
      onRefresh();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAsset(file, 'books');
      setEditingBook((prev) => ({ ...prev, cover_url: url }));
    } catch (err) {
      console.error('Falha no upload da capa:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title) return;

    await repository.saveBook(editingBook);
    setIsModalOpen(false);
    setEditingBook(null);
    onRefresh();
  };

  const addStage = () => {
    if (!editingBook) return;
    const current = editingBook.stages || [];
    const newStage: BookStage = {
      id: crypto.randomUUID(),
      book_id: editingBook.id || '',
      title: 'Nova Etapa',
      status: 'Pendente',
      order_index: current.length
    };
    setEditingBook({ ...editingBook, stages: [...current, newStage] });
  };

  const updateStage = (idx: number, field: keyof BookStage, val: any) => {
    if (!editingBook || !editingBook.stages) return;
    const updated = [...editingBook.stages];
    updated[idx] = { ...updated[idx], [field]: val };
    setEditingBook({ ...editingBook, stages: updated });
  };

  const removeStage = (idx: number) => {
    if (!editingBook || !editingBook.stages) return;
    setEditingBook({
      ...editingBook,
      stages: editingBook.stages.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Gerenciamento de Livros
          </h2>
          <p className="text-xs text-stone-500">
            Cadastre novas obras, altere etapas, controle progresso e links para compra.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Cadastrar Livro
        </button>
      </div>

      {/* Books Table / Grid */}
      {books.length > 0 ? (
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-100/75 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Capa / Título</th>
                  <th className="py-3 px-4">Gênero</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progresso</th>
                  <th className="py-3 px-4">Páginas</th>
                  <th className="py-3 px-4">Preço</th>
                  <th className="py-3 px-4">Destaque</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-stone-200 dark:bg-stone-800 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                          {b.cover_url ? (
                            <img src={b.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-serif font-semibold text-stone-900 dark:text-stone-100 block text-sm">
                            {b.title}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            /{b.slug} {b.is_demo && '· (Exemplo)'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{b.genre}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-xs bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[10px] font-medium">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-800 dark:bg-amber-500"
                            style={{ width: `${b.progress}%` }}
                          />
                        </div>
                        <span>{b.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {b.page_count ? `${b.page_count} págs.` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {b.price ? `R$ ${Number(b.price).toFixed(2).replace('.', ',')}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {b.featured ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-400 font-semibold text-[11px]">
                          <Sparkles className="w-3 h-3" /> Sim
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Não</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Excluir"
                        >
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
        <div className="p-12 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-sm bg-white dark:bg-stone-900/30">
          <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="font-serif text-lg text-stone-800 dark:text-stone-200">
            Nenhum livro cadastrado
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Clique no botão acima para adicionar o primeiro livro ao acervo de Radjanio Silva Souza.
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && editingBook && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingBook.id ? 'Editar Livro' : 'Cadastrar Novo Livro'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Título do Livro *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingBook((prev) => ({
                        ...prev,
                        title,
                        slug: prev?.slug ? prev.slug : slugify(title)
                      }));
                    }}
                    placeholder="Ex: O Silêncio das Palavras Ausentes"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Slug da URL
                  </label>
                  <input
                    type="text"
                    value={editingBook.slug || ''}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    placeholder="o-silencio-das-palavras"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Gênero Literário
                  </label>
                  <input
                    type="text"
                    value={editingBook.genre || ''}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, genre: e.target.value }))}
                    placeholder="Ex: Ficção, Romance, Crônicas"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Edição
                  </label>
                  <input
                    type="text"
                    value={editingBook.edition || ''}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, edition: e.target.value }))}
                    placeholder="Ex: 1ª Edição, Edição Especial"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingBook.status || 'Em desenvolvimento'}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, status: e.target.value as BookStatus }))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Em desenvolvimento">Em desenvolvimento</option>
                    <option value="Em breve">Em breve</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBook.price !== null && editingBook.price !== undefined ? editingBook.price : ''}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="49.90"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Quantidade de Páginas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingBook.page_count !== null && editingBook.page_count !== undefined ? editingBook.page_count : ''}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, page_count: e.target.value ? parseInt(e.target.value, 10) : null }))}
                    placeholder="Ex: 320"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Progresso ({editingBook.progress || 0}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingBook.progress || 0}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, progress: parseInt(e.target.value, 10) }))}
                    className="w-full accent-amber-800 py-2"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Data de Publicação
                  </label>
                  <input
                    type="date"
                    value={editingBook.publication_date || ''}
                    onChange={(e) => setEditingBook((prev) => ({ ...prev, publication_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Link para Compra (Amazon, Livraria, etc.)
                </label>
                <input
                  type="url"
                  value={editingBook.store_url || ''}
                  onChange={(e) => setEditingBook((prev) => ({ ...prev, store_url: e.target.value }))}
                  placeholder="https://www.amazon.com.br/dp/..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                />
              </div>

              {/* Cover Upload and Preview */}
              <div className="space-y-2 p-3 bg-stone-100/50 dark:bg-stone-950/60 rounded-sm border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="block uppercase tracking-wider font-semibold text-stone-800 dark:text-stone-200">
                    Capa do Livro (Upload via Supabase Storage — Visível para Todos os Visitantes)
                  </label>
                  {editingBook.cover_url && (
                    <button
                      type="button"
                      onClick={() => setEditingBook((prev) => ({ ...prev, cover_url: '' }))}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Remover Capa
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Thumbnail Preview */}
                  <div className="w-24 h-32 rounded-xs overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-stone-300 dark:border-stone-700 flex items-center justify-center">
                    {editingBook.cover_url ? (
                      <img
                        src={editingBook.cover_url}
                        alt="Pré-visualização da capa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-stone-400">
                        <BookOpen className="w-6 h-6 mx-auto mb-1 opacity-60" />
                        <span className="text-[9px] block">Sem capa</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-sm text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Fazendo upload...' : 'Escolher arquivo de capa'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <span className="text-[11px] text-stone-500">JPG, PNG ou WebP</span>
                    </div>

                    <div className="text-[11px] text-stone-500">
                      Ou informe o link direto da imagem:
                    </div>

                    <input
                      type="text"
                      value={editingBook.cover_url || ''}
                      onChange={(e) => setEditingBook((prev) => ({ ...prev, cover_url: e.target.value }))}
                      placeholder="https://exemplo.com/capa.jpg"
                      className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Descrição Curta (Resumo para Cards)
                </label>
                <input
                  type="text"
                  value={editingBook.short_description || ''}
                  onChange={(e) => setEditingBook((prev) => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Breve linha descritiva para o leitor..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Sinopse Completa *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingBook.description || ''}
                  onChange={(e) => setEditingBook((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Texto integral da sinopse e apresentação do livro..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={Boolean(editingBook.featured)}
                  onChange={(e) => setEditingBook((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 accent-amber-800 rounded-xs"
                />
                <label htmlFor="featured-toggle" className="font-medium text-stone-800 dark:text-stone-200 cursor-pointer">
                  Destacar este livro na Página Inicial (Livro em Destaque)
                </label>
              </div>

              {/* Stages Management */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300">
                    Etapas do Livro (Linha de Produção)
                  </span>
                  <button
                    type="button"
                    onClick={addStage}
                    className="text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Etapa
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingBook.stages || []).map((stg, idx) => (
                    <div key={stg.id || idx} className="flex items-center gap-2 bg-stone-50 dark:bg-stone-950 p-2.5 rounded-sm border border-stone-200 dark:border-stone-800">
                      <input
                        type="text"
                        value={stg.title}
                        onChange={(e) => updateStage(idx, 'title', e.target.value)}
                        placeholder="Nome da etapa"
                        className="flex-1 px-2 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xs text-xs"
                      />
                      <select
                        value={stg.status}
                        onChange={(e) => updateStage(idx, 'status', e.target.value as BookStageStatus)}
                        className="px-2 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xs text-xs"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeStage(idx)}
                        className="p-1 text-stone-400 hover:text-rose-600"
                        title="Remover etapa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white"
                >
                  Salvar Livro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
