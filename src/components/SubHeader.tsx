import React from 'react';
import {
  CheckCircle2,
  Cpu,
  Edit3,
  BarChart2,
  GitFork
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

export const SubHeader: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeView,
    setActiveView,
    autoSyncEnabled,
    toggleAutoSync,
    activeAssetId
  } = useAdCraftStore();

  return (
    <div
      id="adcraft-subheader"
      className="flex items-center justify-between px-6 py-2 bg-[#0B0E15] border-b border-white/[0.06] shadow-sm select-none"
    >
      {/* Left: Engine & Asset Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white tracking-tight font-['Geist']">
            {t.subheader.campaignSynthesizer}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0F131D] border border-white/[0.08] text-slate-300 font-['JetBrains_Mono'] text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.subheader.liveEngine}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-white/[0.08]" />

        <div className="flex items-center gap-2 text-slate-400 text-xs font-['Geist']">
          <button
            onClick={toggleAutoSync}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="Click to toggle auto-sync"
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                autoSyncEnabled ? 'text-emerald-400' : 'text-slate-500'
              }`}
            />
            <span>{autoSyncEnabled ? t.subheader.autoSyncEnabled : t.subheader.autoSyncPaused}</span>
          </button>
          <span className="text-slate-600">·</span>
          <span className="font-['JetBrains_Mono'] text-slate-400 text-[11px]">
            {t.subheader.activeAsset}: <span className="text-indigo-300 font-semibold">{activeAssetId || 'asset-01'}</span>
          </span>
        </div>
      </div>

      {/* Right: Cloud GPU Spec & Mode Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0F131D] border border-white/[0.08] text-slate-400 font-['JetBrains_Mono'] text-xs shrink-0 whitespace-nowrap">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{t.subheader.cloudGpuSpec}</span>
        </div>

        {/* Mode Switcher: Editor | Performance Hub | Variations */}
        <div className="flex items-center gap-1 bg-[#0F131D] border border-white/[0.08] p-1 rounded-xl shadow-inner shrink-0">
          <button
            id="mode-editor"
            onClick={() => {
              soundEngine.playClick();
              setActiveView('editor');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeView === 'editor'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Edit3 className="w-3 h-3 shrink-0" />
            <span>{t.subheader.editor}</span>
          </button>

          <button
            id="mode-performance"
            onClick={() => {
              soundEngine.playClick();
              setActiveView('performance');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeView === 'performance'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BarChart2 className="w-3 h-3 shrink-0" />
            <span>{t.subheader.performanceHub}</span>
          </button>

          <button
            id="mode-variations"
            onClick={() => {
              soundEngine.playClick();
              setActiveView('variations');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeView === 'variations'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <GitFork className="w-3 h-3 shrink-0" />
            <span>{t.subheader.variations}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
