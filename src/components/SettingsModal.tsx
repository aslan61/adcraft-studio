import React, { useState } from 'react';
import { X, Sliders, Check, HardDrive, Cpu, Globe, Sun, Moon, Key, Eye, EyeOff, Sparkles, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage } = useTranslation();
  const {
    theme,
    setTheme,
    workspaceName,
    projectName,
    setProjectName,
    setWorkspaceName,
    geminiApiKey,
    setGeminiApiKey,
    resetToDefaults,
    saveProjectToServer
  } = useAdCraftStore();
  const [localProjectName, setLocalProjectName] = useState(projectName);
  const [localWorkspace, setLocalWorkspace] = useState(workspaceName);
  const [localApiKey, setLocalApiKey] = useState(geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [keyTestLatency, setKeyTestLatency] = useState<number | null>(null);
  const [keyTestMessage, setKeyTestMessage] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    soundEngine.playClick();
    setKeyTestStatus('testing');
    setKeyTestMessage(null);
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: localApiKey.trim() || undefined })
      });
      const data = await res.json();
      if (data.success) {
        soundEngine.playSuccess();
        setKeyTestStatus('success');
        setKeyTestLatency(data.latencyMs);
        setKeyTestMessage(
          data.source === 'client_custom'
            ? (language === 'tr' ? 'Kişisel API anahtarı doğrulandı' : 'Personal API key verified')
            : (language === 'tr' ? 'Dahili sunucu motoru aktif' : 'Built-in studio engine active')
        );
      } else {
        soundEngine.playError();
        setKeyTestStatus('failed');
        setKeyTestMessage(data.error || (language === 'tr' ? 'Geçersiz API Anahtarı' : 'Invalid API Key'));
      }
    } catch (err: any) {
      soundEngine.playError();
      setKeyTestStatus('failed');
      setKeyTestMessage(err?.message || (language === 'tr' ? 'Bağlantı hatası' : 'Connection error'));
    }
  };

  const handleResetStudio = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      soundEngine.playWhoosh();
      resetToDefaults();
      setLocalProjectName('NeonRider App');
      setLocalWorkspace('Apex Gaming Inc.');
      setLocalApiKey('');
      setIsResetting(true);
      setTimeout(() => {
        setIsResetting(false);
        onClose();
      }, 600);
    }
  };

  const handleSave = async () => {
    soundEngine.playClick();
    setIsSaving(true);
    setProjectName(localProjectName.trim() || 'NeonRider App');
    setWorkspaceName(localWorkspace.trim() || 'Apex Gaming Inc.');
    setGeminiApiKey(localApiKey.trim());
    await saveProjectToServer();
    soundEngine.playSuccess();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-['Geist'] select-none">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">{t.settings.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 my-2">
          {/* Language Setting / Dil Ayarı */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <label className="text-xs text-white font-semibold">
                  {t.settings.languageLabel}
                </label>
              </div>
              <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {language === 'tr' ? 'Türkçe Seçili' : 'English Selected'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t.settings.languageDesc}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                id="settings-lang-tr"
                onClick={() => {
                  soundEngine.playClick();
                  setLanguage('tr');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  language === 'tr'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold font-['JetBrains_Mono'] flex items-center justify-center">TR</span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white">Türkçe</span>
                    <span className="text-[10px] text-slate-400">Varsayılan dil</span>
                  </div>
                </div>
                {language === 'tr' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                type="button"
                id="settings-lang-en"
                onClick={() => {
                  soundEngine.playClick();
                  setLanguage('en');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-['JetBrains_Mono'] flex items-center justify-center">EN</span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white">English</span>
                    <span className="text-[10px] text-slate-400">Global standard</span>
                  </div>
                </div>
                {language === 'en' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Theme Setting / Arayüz Teması */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <label className="text-xs text-white font-semibold">
                  {t.settings.themeLabel}
                </label>
              </div>
              <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {theme === 'dark'
                  ? (language === 'tr' ? 'Koyu Mod Aktif' : 'Dark Mode Active')
                  : (language === 'tr' ? 'Açık Mod Aktif' : 'Light Mode Active')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t.settings.themeDesc}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                id="settings-theme-dark"
                onClick={() => {
                  soundEngine.playClick();
                  setTheme('dark');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-900 text-indigo-300 border border-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    <Moon className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white">{t.settings.themeDark}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{t.settings.themeDarkDesc}</span>
                  </div>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
              </button>

              <button
                type="button"
                id="settings-theme-light"
                onClick={() => {
                  soundEngine.playClick();
                  setTheme('light');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center shrink-0">
                    <Sun className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white">{t.settings.themeLight}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{t.settings.themeLightDesc}</span>
                  </div>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Google Gemini AI API Key Configuration */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <label className="text-xs text-white font-semibold">
                  {t.settings.apiKeyLabel}
                </label>
              </div>
              <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.settings.apiKeyDesc}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localApiKey}
                  onChange={(e) => {
                    setLocalApiKey(e.target.value);
                    setKeyTestStatus('idle');
                    setKeyTestMessage(null);
                  }}
                  placeholder={t.settings.apiKeyPlaceholder}
                  className="w-full rounded-xl bg-[#07080D] border border-white/[0.08] pl-3 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-['JetBrains_Mono']"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title={showApiKey ? 'Gizle' : 'Göster'}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleTestKey}
                disabled={keyTestStatus === 'testing'}
                className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {keyTestStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.settings.testingKey}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.settings.testConnection}</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Status Indicator */}
            {keyTestStatus === 'success' && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-['JetBrains_Mono'] flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t.settings.keyConnected} {keyTestMessage && `(${keyTestMessage})`}</span>
                </div>
                {keyTestLatency && (
                  <span className="text-[10px] text-emerald-300 font-semibold">{keyTestLatency}ms</span>
                )}
              </div>
            )}

            {keyTestStatus === 'failed' && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-['JetBrains_Mono'] flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{t.settings.keyFailed}: {keyTestMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">{t.settings.workspace}</label>
              <input
                type="text"
                value={localWorkspace}
                onChange={(e) => setLocalWorkspace(e.target.value)}
                className="w-full rounded-xl bg-[#07080D] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-['JetBrains_Mono']"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">{t.settings.campaignName}</label>
              <input
                type="text"
                value={localProjectName}
                onChange={(e) => setLocalProjectName(e.target.value)}
                className="w-full rounded-xl bg-[#07080D] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-['JetBrains_Mono']"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">{t.settings.hardwareAccel}</label>
            <div className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">{t.settings.hardwareAccelActive}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-['JetBrains_Mono'] text-[11px] font-bold">
                {t.common.active}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">{t.settings.localCache}</label>
            <div className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-300">{t.settings.cachedAssets}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setCacheCleared(true);
                  setTimeout(() => setCacheCleared(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs transition-colors cursor-pointer border border-white/[0.06]"
              >
                {cacheCleared ? t.settings.cachePurged : t.settings.purgeCache}
              </button>
            </div>
          </div>

          {/* Reset Studio / Fabrika Ayarlarına Sıfırla */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <label className="text-xs text-rose-300 font-semibold">
                  {t.settings.resetStudio}
                </label>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.settings.resetStudioDesc}
            </p>
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleResetStudio}
                disabled={isResetting}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isResetting ? t.settings.resetDone : t.settings.resetStudio}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] text-slate-500 font-['JetBrains_Mono'] flex items-center gap-1.5">
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'tr' ? 'Sunucuya ve depolamaya kaydedildi' : 'Saved to server and local storage'}</span>
              </>
            ) : (
              <span>{language === 'tr' ? 'GPU düğümüyle otomatik eşitlenir' : 'Auto-synced with GPU worker node'}</span>
            )}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-semibold hover:from-indigo-500 hover:to-indigo-400 flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? t.settings.saving : (saveSuccess ? t.settings.saved : t.settings.saveChanges)}
          </button>
        </div>
      </div>
    </div>
  );
};
