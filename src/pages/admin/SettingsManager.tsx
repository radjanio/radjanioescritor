import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { repository } from '../../lib/repository';
import { uploadAsset } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Upload, CheckCircle, Save, Feather, Lock, Key, AlertCircle } from 'lucide-react';

interface SettingsManagerProps {
  settings: SiteSettings;
  onRefresh: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onRefresh }) => {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

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
    await repository.updateSettings(formData);
    setSaved(true);
    onRefresh();
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'A senha deve possuir pelo menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    setPassLoading(true);
    const res = await changePassword(newPassword);
    setPassLoading(false);

    if (res.success) {
      setPassMsg({ type: 'success', text: 'Senha alterada com sucesso! Utilize-a em seu próximo login.' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassMsg(null), 4000);
    } else {
      setPassMsg({ type: 'error', text: res.error || 'Erro ao alterar senha.' });
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Perfil do Autor &amp; Configurações
        </h2>
        <p className="text-xs text-stone-500">
          Gerencie a foto do perfil (que aparece em suas anotações), biografia detalhada e segurança.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Configurações e biografia salvas com sucesso! As informações já estão visíveis na página inicial e sobre.</span>
        </div>
      )}

      {/* Main Settings & Bio Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-6 sm:p-8 space-y-6 text-xs">
        <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
          1. Identidade &amp; Foto do Autor
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Ocupação / Título Profissional
            </label>
            <input
              type="text"
              value={formData.occupation || ''}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Ex: Escritor &amp; Autor Contemporâneo"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {/* Photo Upload & Preview */}
        <div className="space-y-2 p-3 bg-stone-100/50 dark:bg-stone-950/60 rounded-sm border border-stone-200 dark:border-stone-800">
          <label className="block uppercase tracking-wider font-semibold text-stone-800 dark:text-stone-200">
            Foto do Perfil (Exibida no Diário de Escrita, Biografia e Página Inicial)
          </label>
          <div className="flex gap-4 items-center">
            <div className="w-16 h-20 rounded-xs overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-stone-300 dark:border-stone-700 flex items-center justify-center">
              {formData.author_photo_url ? (
                <img
                  src={formData.author_photo_url}
                  alt="Foto do autor"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Feather className="w-6 h-6 text-stone-400" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <label className="px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-sm text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Enviando...' : 'Fazer Upload da Foto'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                </label>
                {formData.author_photo_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, author_photo_url: '' })}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Remover
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.author_photo_url || ''}
                onChange={(e) => setFormData({ ...formData, author_photo_url: e.target.value })}
                placeholder="Ou informe link direto: https://..."
                className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
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

        {/* Biographical Details */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
            2. Informações Biográficas Detalhadas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Cidade e Estado de Origem / Naturalidade
              </label>
              <input
                type="text"
                value={formData.birth_place || ''}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                placeholder="Ex: Salvador, Bahia — Brasil"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Influências Literárias &amp; Referências
            </label>
            <input
              type="text"
              value={formData.literary_influences || ''}
              onChange={(e) => setFormData({ ...formData, literary_influences: e.target.value })}
              placeholder="Ex: Machado de Assis, Guimarães Rosa, Clarice Lispector, Gabriel García Márquez"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Resumo da Trajetória Criativa
            </label>
            <input
              type="text"
              value={formData.career_summary || ''}
              onChange={(e) => setFormData({ ...formData, career_summary: e.target.value })}
              placeholder="Ex: Autor de romances e ensaios, com pesquisas voltadas à literatura contemporânea."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Biografia Completa
            </label>
            <textarea
              rows={6}
              value={formData.biography || ''}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
              placeholder="Digite aqui sua biografia para salvar no banco de dados..."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm font-editorial text-sm text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {/* Contact & Socials */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
            3. Contato &amp; Redes Sociais
          </h3>

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
              <label className="block text-stone-600 dark:text-stone-400 mb-1">Twitter / X URL (radjaniocat)</label>
              <input
                type="url"
                value={formData.twitter_url || ''}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://x.com/radjaniocat"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1">TikTok URL (@iamradjanio)</label>
              <input
                type="url"
                value={formData.tiktok_url || ''}
                onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/@iamradjanio"
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
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Informações do Perfil</span>
          </button>
        </div>
      </form>

      {/* Dedicated Change Password Card */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3">
          <Key className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Segurança &amp; Trocar Senha de Acesso
            </h3>
            <p className="text-xs text-stone-500">
              Altere a senha de acesso ao painel editorial de Radjanio Silva Souza.
            </p>
          </div>
        </div>

        {passMsg && (
          <div className={`p-3 rounded-sm text-xs border flex items-center gap-2 ${
            passMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            {passMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nova Senha (mínimo 6 caracteres) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="px-5 py-2.5 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{passLoading ? 'Atualizando...' : 'Atualizar Senha'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
