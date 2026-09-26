import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { repository } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Calendar, Upload, X } from 'lucide-react';

interface TimelineManagerProps {
  events: TimelineEvent[];
  onRefresh: () => void;
}

export const TimelineManager: React.FC<TimelineManagerProps> = ({ events, onRefresh }) => {
  const [editingEv, setEditingEv] = useState<Partial<TimelineEvent> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const emptyEvent: Partial<TimelineEvent> = {
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    image_url: '',
    order_index: events.length,
    published: true,
  };

  const handleOpenCreate = () => {
    setEditingEv(emptyEvent);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: TimelineEvent) => {
    setEditingEv(ev);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este evento da linha do tempo?')) {
      await repository.deleteTimelineEvent(id);
      onRefresh();
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const currentItem = events[index];
    const targetItem = events[targetIndex];

    await repository.saveTimelineEvent({ ...currentItem, order_index: targetIndex });
    await repository.saveTimelineEvent({ ...targetItem, order_index: index });
    onRefresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEv || !editingEv.title) return;
    await repository.saveTimelineEvent(editingEv);
    setIsModalOpen(false);
    setEditingEv(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Gerenciamento da Linha do Tempo
          </h2>
          <p className="text-xs text-stone-500">
            Adicione e ordene marcos cronológicos da carreira literária de Radjanio Silva Souza.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Adicionar Marco
        </button>
      </div>

      {events.length > 0 ? (
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-100/75 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-20">Ordem</th>
                  <th className="py-3 px-4">Data do Marco</th>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {events.map((ev, idx) => (
                  <tr key={ev.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveOrder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 cursor-pointer"
                          title="Subir na ordem"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveOrder(idx, 'down')}
                          disabled={idx === events.length - 1}
                          className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 cursor-pointer"
                          title="Descer na ordem"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-amber-900 dark:text-amber-400">
                      {ev.event_date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                      {ev.title}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-stone-500">
                      {ev.description}
                    </td>
                    <td className="py-3 px-4">
                      {ev.published ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Visível</span>
                      ) : (
                        <span className="text-stone-400">Oculto</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(ev)} className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-stone-400 hover:text-rose-600">
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
          <Calendar className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="font-serif text-lg text-stone-800 dark:text-stone-200">Nenhum evento registrado</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingEv && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingEv.id ? 'Editar Marco' : 'Novo Marco na Linha do Tempo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Título do Marco *
                </label>
                <input
                  type="text"
                  required
                  value={editingEv.title || ''}
                  onChange={(e) => setEditingEv((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Conclusão do primeiro romance"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Data do Evento *
                </label>
                <input
                  type="date"
                  required
                  value={editingEv.event_date || ''}
                  onChange={(e) => setEditingEv((prev) => ({ ...prev, event_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Descrição do Marco *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingEv.description || ''}
                  onChange={(e) => setEditingEv((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes históricos sobre este momento literário..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ev-pub"
                  checked={Boolean(editingEv.published)}
                  onChange={(e) => setEditingEv((prev) => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 accent-amber-800"
                />
                <label htmlFor="ev-pub" className="font-semibold text-stone-800 dark:text-stone-200">
                  Exibir na Linha do Tempo pública
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
                  Salvar Marco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
