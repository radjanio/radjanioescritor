import React, { useState } from 'react';
import { AcademicItem, AcademicType, AcademicStatus } from '../../types';
import { repository } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  ExternalLink,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  Loader2,
  BookOpen,
  Award,
  Users,
  Sparkles
} from 'lucide-react';

interface AcademicManagerProps {
  items: AcademicItem[];
  onRefresh: () => void;
}

export const AcademicManager: React.FC<AcademicManagerProps> = ({ items, onRefresh }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Partial<AcademicItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const academicTypes: AcademicType[] = [
    'Formação',
    'Curso & Oficina',
    'Artigo & Pesquisa',
    'Palestra & Docência',
    'Certificação'
  ];

  const emptyItem: Partial<AcademicItem> = {
    title: '',
    type: 'Formação',
    institution: '',
    degree_level: '',
    field_of_study: '',
    start_year: '',
    end_year: '',
    status: 'Concluído',
    workload_hours: null,
    description: '',
    thesis_title: '',
    advisor: '',
    certificate_url: '',
    external_link: '',
    featured: false,
    published: true,
  };

  const handleOpenCreate = () => {
    setSaveError(null);
    setEditingItem({ ...emptyItem, order_index: items.length });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AcademicItem) => {
    setSaveError(null);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este registro acadêmico?')) {
      try {
        await repository.deleteAcademicItem(id);
        onRefresh();
      } catch (err: any) {
        alert(err?.message || 'Falha ao remover o item.');
      }
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const targetItem = items[targetIndex];

    try {
      await repository.saveAcademicItem({ ...currentItem, order_index: targetIndex });
      await repository.saveAcademicItem({ ...targetItem, order_index: index });
      onRefresh();
    } catch (err) {
      console.error('Erro ao reordenar:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setIsUploading(true);
    try {
      const url = await uploadAsset(file, 'certificates');
      setEditingItem({ ...editingItem, certificate_url: url });
    } catch (err) {
      console.error('Falha no upload do certificado/documento:', err);
      alert('Não foi possível enviar o documento.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title || !editingItem.institution) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await repository.saveAcademicItem(editingItem);
      setIsModalOpen(false);
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      console.error('Erro ao salvar item acadêmico:', err);
      setSaveError(err?.message || 'Não foi possível salvar o registro.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered list
  const filteredItems = items.filter((it) => {
    const matchType = selectedType === 'all' || it.type === selectedType;
    const matchSearch =
      !searchTerm ||
      it.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (it.field_of_study && it.field_of_study.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  // Quick stats
  const totalDegrees = items.filter((i) => i.type === 'Formação').length;
  const totalCourses = items.filter((i) => i.type === 'Curso & Oficina').length;
  const totalPapers = items.filter((i) => i.type === 'Artigo & Pesquisa').length;
  const totalWorkload = items.reduce((acc, curr) => acc + (curr.workload_hours || 0), 0);

  const getTypeIcon = (type: AcademicType) => {
    switch (type) {
      case 'Formação':
        return <GraduationCap className="w-4 h-4 text-amber-800 dark:text-amber-400" />;
      case 'Curso & Oficina':
        return <BookOpen className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />;
      case 'Artigo & Pesquisa':
        return <FileText className="w-4 h-4 text-sky-800 dark:text-sky-400" />;
      case 'Palestra & Docência':
        return <Users className="w-4 h-4 text-purple-800 dark:text-purple-400" />;
      case 'Certificação':
        return <Award className="w-4 h-4 text-rose-800 dark:text-rose-400" />;
      default:
        return <GraduationCap className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-amber-800 dark:text-amber-400" />
            <span>Área Acadêmica &amp; Formação</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gerencie diplomas, cursos de extensão, oficinas literárias, artigos acadêmicos e palestras.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">Formações</span>
          <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 block">
            {totalDegrees}
          </span>
          <span className="text-[10px] text-stone-400">Graduações &amp; Pós</span>
        </div>
        <div className="p-4 bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">Cursos &amp; Oficinas</span>
          <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 block">
            {totalCourses}
          </span>
          <span className="text-[10px] text-stone-400">Extensão &amp; Workshops</span>
        </div>
        <div className="p-4 bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">Pesquisa &amp; Artigos</span>
          <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 block">
            {totalPapers}
          </span>
          <span className="text-[10px] text-stone-400">Publicações e Ensaios</span>
        </div>
        <div className="p-4 bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">Carga Horária Total</span>
          <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 block">
            {totalWorkload > 0 ? `${totalWorkload}h` : '—'}
          </span>
          <span className="text-[10px] text-stone-400">Horas registradas</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === 'all'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Todos ({items.length})
          </button>
          {academicTypes.map((type) => {
            const count = items.filter((i) => i.type === type).length;
            const active = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, instituição..."
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm space-y-3">
            <GraduationCap className="w-8 h-8 text-stone-400 mx-auto stroke-[1.5]" />
            <p className="text-xs text-stone-500">Nenhum registro acadêmico encontrado.</p>
            <button
              onClick={handleOpenCreate}
              className="text-xs text-amber-800 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar o primeiro registro</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 bg-white dark:bg-stone-900/60 border rounded-sm transition-colors ${
                !item.published
                  ? 'border-dashed border-stone-300 dark:border-stone-800 opacity-60'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1 font-medium text-stone-800 dark:text-stone-200">
                      {getTypeIcon(item.type)}
                      <span>{item.type}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{item.institution}</span>
                    {item.degree_level && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.degree_level}</span>
                      </>
                    )}
                    {(item.start_year || item.end_year) && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {item.start_year === item.end_year || !item.start_year
                            ? item.end_year || item.start_year
                            : `${item.start_year} – ${item.end_year}`}
                        </span>
                      </>
                    )}
                    {item.workload_hours && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.workload_hours}h</span>
                      </>
                    )}
                    {item.featured && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-800 dark:text-amber-400 font-semibold inline-flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" />
                          <span>Destaque</span>
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                    {item.title}
                  </h3>

                  {item.field_of_study && (
                    <p className="text-xs text-amber-900 dark:text-amber-400 font-medium">
                      Área: {item.field_of_study}
                    </p>
                  )}

                  {item.thesis_title && (
                    <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                      Monografia / Tese: "{item.thesis_title}"
                      {item.advisor && <span className="not-italic text-stone-400"> (Orientação: {item.advisor})</span>}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Attachment links */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    {item.certificate_url && (
                      <a
                        href={item.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Ver Certificado / Comprovante</span>
                      </a>
                    )}
                    {item.external_link && (
                      <a
                        href={item.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Acessar Publicação / Link Externo</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleReorder(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-20 cursor-pointer"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-20 cursor-pointer"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white cursor-pointer ml-1"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-5">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                <span>{editingItem.id ? 'Editar Registro Acadêmico' : 'Novo Registro Acadêmico'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
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

              {/* Title */}
              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Título do Curso / Formação / Artigo *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Ex: Graduação em Letras, Oficina de Roteiro, Artigo..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tipo de Registro *
                  </label>
                  <select
                    value={editingItem.type || 'Formação'}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as AcademicType })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  >
                    {academicTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={editingItem.status || 'Concluído'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as AcademicStatus })}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  >
                    <option value="Concluído">Concluído</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Interrompido">Interrompido</option>
                  </select>
                </div>
              </div>

              {/* Institution and Degree Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Instituição / Universidade / Evento *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.institution || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                    placeholder="Ex: USP, UFRJ, Instituto Literário..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Grau / Nível
                  </label>
                  <input
                    type="text"
                    value={editingItem.degree_level || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, degree_level: e.target.value })}
                    placeholder="Ex: Bacharelado, Pós-Graduação, Extensão, Ensaio..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Field of study, Start Year, End Year, Workload */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Área de Estudo / Tema
                  </label>
                  <input
                    type="text"
                    value={editingItem.field_of_study || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, field_of_study: e.target.value })}
                    placeholder="Ex: Estudos Literários, Teoria da Narrativa..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Ano Início
                  </label>
                  <input
                    type="text"
                    value={editingItem.start_year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, start_year: e.target.value })}
                    placeholder="2020"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Ano Conclusão
                  </label>
                  <input
                    type="text"
                    value={editingItem.end_year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, end_year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 tabular-nums"
                  />
                </div>
              </div>

              {/* Workload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Carga Horária (Horas)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.workload_hours ?? ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        workload_hours: e.target.value ? parseInt(e.target.value) : null
                      })
                    }
                    placeholder="Ex: 60"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Orientador(a) / Docente
                  </label>
                  <input
                    type="text"
                    value={editingItem.advisor || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, advisor: e.target.value })}
                    placeholder="Ex: Prof. Dr. Fulano de Tal"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Thesis title */}
              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Título da Monografia / TCC / Artigo / Tese (Opcional)
                </label>
                <input
                  type="text"
                  value={editingItem.thesis_title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, thesis_title: e.target.value })}
                  placeholder="Título completo do trabalho de conclusão ou artigo científico..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Ementa / Resumo / Descrição
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Detalhes dos módulos estudados, abordagem metodológica ou relevância..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 font-editorial"
                />
              </div>

              {/* Links: External & Certificate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Link Externo (DOI, Repositório, Periódico)
                  </label>
                  <input
                    type="url"
                    value={editingItem.external_link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, external_link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Certificado / Comprovante (PDF ou Imagem)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingItem.certificate_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, certificate_url: e.target.value })}
                      placeholder="URL ou faça upload ao lado..."
                      className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
                    />
                    <label className="px-3 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-sm cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Enviando...' : 'Upload'}</span>
                      <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Toggles: Featured & Published */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.featured ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="rounded-xs text-amber-900 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Destacar este registro na página acadêmica
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.published ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="rounded-xs text-amber-900 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Visível publicamente
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-sm font-semibold uppercase tracking-wider hover:bg-stone-100 dark:hover:bg-stone-800"
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
