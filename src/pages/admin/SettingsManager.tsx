import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { repository } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import { Upload, CheckCircle, Save, Feather, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsManagerProps {
  settings: SiteSettings;
  onRefresh: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAsset(file, 'author');
      setFormData((prev) => ({ ...prev, author_photo_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await repository.updateSettings(formData);
      setSaved(true);
      onRefresh();
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error('Erro ao atualizar configurações:', err);
      setSaveError(err?.message || 'Falha ao salvar configurações no Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Configurações do Site &amp; Perfil do Autor
        </h2>
        <p className="text-xs text-stone-500">
          Edite informações biográficas, frase de destaque, redes sociais e foto oficial de Radjanio Silva Souza.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Configurações atualizadas com sucesso! As alterações já estão visíveis no site público.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-6 sm:p-8 space-y-5 text-xs">
        <div>
          <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Nome do Autor *
          </label>
          <input
            type="text"
            required
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 font-serif text-sm"
          />
        </div>

        <div>
          <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Frase / Citação de Apresentação
          </label>
          <input
            type="text"
            value={formData.author_quote}
            onChange={(e) => setFormData({ ...formData, author_quote: e.target.value })}
            placeholder="Ex: A escrita é a ponte silenciosa..."
            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 font-editorial text-sm italic"
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-1">
          <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300">
            Foto do Autor (Upload Supabase ou URL)
          </label>
          <div className="flex gap-3 items-center">
            {formData.author_photo_url && (
              <img
                src={formData.author_photo_url}
                alt="Foto"
                className="w-12 h-14 object-cover rounded-xs border border-stone-200 dark:border-stone-700 shrink-0"
              />
            )}
            <input
              type="text"
              value={formData.author_photo_url || ''}
              onChange={(e) => setFormData({ ...formData, author_photo_url: e.target.value })}
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
            Biografia do Autor *
          </label>
          <textarea
            rows={6}
            required
            value={formData.biography}
            onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
            placeholder="Apresentação biográfica de Radjanio Silva Souza..."
            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm font-editorial text-sm text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-800 dark:text-stone-200 mb-3">
            Contato &amp; Redes Sociais
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">E-mail de Contato</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">Instagram URL</label>
              <input
                type="url"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">Twitter / X URL</label>
              <input
                type="url"
                value={formData.twitter_url || ''}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://x.com/..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">Facebook URL</label>
              <input
                type="url"
                value={formData.facebook_url || ''}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">YouTube URL</label>
              <input
                type="url"
                value={formData.youtube_url || ''}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">Currículo Lattes (CNPq)</label>
              <input
                type="url"
                value={formData.lattes_url || ''}
                onChange={(e) => setFormData({ ...formData, lattes_url: e.target.value })}
                placeholder="http://lattes.cnpq.br/..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">ORCID iD (Identificador Acadêmico)</label>
              <input
                type="url"
                value={formData.orcid_url || ''}
                onChange={(e) => setFormData({ ...formData, orcid_url: e.target.value })}
                placeholder="https://orcid.org/0000-..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
