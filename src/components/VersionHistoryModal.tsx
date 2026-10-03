import React, { useState } from 'react';
import {
  History,
  Clock,
  RotateCcw,
  Trash2,
  Camera,
  CheckCircle2,
  X,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
  Music,
  MousePointerClick,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';
import { CreativeVersion } from '../types';

export const VersionHistoryModal: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    isVersionHistoryModalOpen,
    setVersionHistoryModalOpen,
    versions,
    saveSnapshot,
    restoreVersion,
    deleteVersion,
    hookCopy,
    aspectRatio,
    audioConfig,
    deviceConfig
  } = useAdCraftStore();

  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotNote, setSnapshotNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isVersionHistoryModalOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCreateSnapshot = () => {
    soundEngine.playWhoosh();
    setIsSaving(true);

    const name = snapshotName.trim() || undefined;
    const note = snapshotNote.trim() || undefined;

    setTimeout(() => {
      saveSnapshot(name, note, false);
      setIsSaving(false);
      setSnapshotName('');
      setSnapshotNote('');
      soundEngine.playSuccess();
      showToast(t.versionHistory.snapshotSavedSuccess);
    }, 200);
  };

  const handleRestore = (ver: CreativeVersion) => {
    const confirmMessage = t.versionHistory.confirmRestorePrompt;
    if (window.confirm(confirmMessage)) {
      soundEngine.playSuccess();
      restoreVersion(ver.id);
      showToast(t.versionHistory.restoredSuccess);
      setTimeout(() => {
        setVersionHistoryModalOpen(false);
      }, 700);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playClick();
    if (window.confirm(t.versionHistory.deletePrompt)) {
      deleteVersion(id);
      showToast(t.versionHistory.versionDeleted);
    }
  };

  const toggleDiff = (id: string) => {
    soundEngine.playClick();
    setExpandedDiffId(expandedDiffId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-['Geist'] select-none">
      <div className="relative w-full max-w-4xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#07080D]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {t.versionHistory.title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                  {versions.length} {language === 'tr' ? 'Sürüm' : 'Snapshots'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{t.versionHistory.subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => setVersionHistoryModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Snapshot Action Form */}
          <div className="p-4 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder={t.versionHistory.snapshotNamePlaceholder}
                className="flex-1 bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-['Geist']"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSnapshot();
                }}
              />
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder={language === 'tr' ? 'Açıklama veya not (isteğe bağlı)...' : 'Note or tags (optional)...'}
                className="w-full sm:w-56 bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-['Geist']"
              />
            </div>

            <button
              onClick={handleCreateSnapshot}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all shrink-0"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.versionHistory.savingSnapshot}</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.versionHistory.saveButton}</span>
                </>
              )}
            </button>
          </div>

          {/* Versions List */}
          <div className="space-y-3">
            {versions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800/80">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">{t.versionHistory.noVersionsFound}</p>
              </div>
            ) : (
              versions.map((ver, idx) => {
                const isExpanded = expandedDiffId === ver.id;
                const isCurrent =
                  ver.state.hookCopy.headline === hookCopy.headline &&
                  ver.state.aspectRatio === aspectRatio &&
                  ver.state.hookCopy.ctaText === hookCopy.ctaText;

                return (
                  <div
                    key={ver.id}
                    className={`rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-[#0D111C]/90 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                        : 'bg-[#0D111C]/60 hover:bg-[#111726]/80 border-white/[0.06]'
                    }`}
                  >
                    {/* Version Card Main Header */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-800/80 text-slate-400 shrink-0 mt-0.5">
                          <Clock className="w-4 h-4 text-indigo-400" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white tracking-tight">
                              {ver.name}
                            </span>
                            {ver.isAutoSave ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                                {t.versionHistory.autoSaveBadge}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {t.versionHistory.manualBadge}
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                                ✓ {t.versionHistory.currentState}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 font-['JetBrains_Mono']">
                            <span>{ver.createdAtFormatted}</span>
                            <span>•</span>
                            <span className="text-slate-300">{ver.state.aspectRatio}</span>
                            <span>•</span>
                            <span className="text-slate-300">{ver.state.deviceConfig.model}</span>
                            <span>•</span>
                            <span className="text-amber-400">{ver.state.hookCopy.toneArchetype}</span>
                          </div>

                          {ver.note && (
                            <p className="text-xs text-slate-400 italic mt-0.5">"{ver.note}"</p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => toggleDiff(ver.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
                          title={t.versionHistory.compareDifferences}
                        >
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t.versionHistory.compareDifferences}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleRestore(ver)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
                          title={t.versionHistory.restoreVersion}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.versionHistory.restoreVersion}</span>
                        </button>

                        <button
                          onClick={(e) => handleDelete(ver.id, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title={language === 'tr' ? 'Sürümü Sil' : 'Delete Snapshot'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Comparison Differences View */}
                    {isExpanded && (
                      <div className="border-t border-white/[0.06] bg-[#07080D]/60 p-4 space-y-3 font-['Geist'] animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Headline Comparison */}
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {t.versionHistory.headlineLabel}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 font-medium">"{ver.state.hookCopy.headline}"</span>
                              {ver.state.hookCopy.headline !== hookCopy.headline && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="text-emerald-400 font-medium">"{hookCopy.headline}"</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* CTA Button Comparison */}
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {t.versionHistory.ctaLabel}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 font-medium">{ver.state.hookCopy.ctaText}</span>
                              {ver.state.hookCopy.ctaText !== hookCopy.ctaText && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="text-emerald-400 font-medium">{hookCopy.ctaText}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Aspect Ratio Comparison */}
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {t.versionHistory.aspectLabel}
                            </span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-slate-300">{ver.state.aspectRatio}</span>
                              {ver.state.aspectRatio !== aspectRatio && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="text-emerald-400">{aspectRatio}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Audio Track Comparison */}
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {t.versionHistory.audioLabel}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 truncate">{ver.state.audioConfig.name}</span>
                              {ver.state.audioConfig.name !== audioConfig.name && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="text-emerald-400 truncate">{audioConfig.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-[#07080D]/90">
          <p className="text-xs text-slate-500">
            {language === 'tr'
              ? 'Tüm zaman çizelgesi anlık durumları yerel olarak saklanır ve anında geri yüklenebilir.'
              : 'All timeline snapshots are preserved with zero-latency rollback capability.'}
          </p>

          <button
            onClick={() => setVersionHistoryModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
