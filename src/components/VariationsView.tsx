import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Copy,
  RefreshCw,
  Wand2,
  Layers,
  Check,
  Zap,
  Clock,
  Brain,
  Target
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';
import { INITIAL_VARIATIONS, AdVariationItem, getInitialVariations } from '../data/variationsCatalog';
import { RenderItem } from '../types';

interface VariationsViewProps {
  onOpenExportQueue?: () => void;
}

export const VariationsView: React.FC<VariationsViewProps> = ({ onOpenExportQueue }) => {
  const { t, language } = useTranslation();
  const {
    hookCopy,
    setHookCopy,
    setMotionPreset,
    setBackgroundPreset,
    setActiveView,
    projectName,
    setAspectRatio,
    addExportItems,
    geminiApiKey
  } = useAdCraftStore();

  const [variations, setVariations] = useState<AdVariationItem[]>(() => getInitialVariations(language));
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Hype / Viral' | 'FOMO Urgency' | 'Problem-Solver' | 'Minimalist'>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customAngle, setCustomAngle] = useState('');
  const [justQueued, setJustQueued] = useState(false);

  // Sync variations if language changes and user hasn't generated a fresh custom matrix
  useEffect(() => {
    setVariations(getInitialVariations(language));
  }, [language]);

  const generateFreshMatrix = async () => {
    setIsGenerating(true);
    soundEngine.playWhoosh();
    try {
      const res = await fetch('/api/variations/matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          appName: projectName,
          seedHook: hookCopy.headline,
          toneArchetype: hookCopy.toneArchetype,
          customPrompt: customAngle,
          language
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.variations)) {
        setVariations(data.variations);
        soundEngine.playSuccess();
      }
    } catch (e) {
      console.warn('Matrix generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyVariation = (v: (typeof variations)[0]) => {
    soundEngine.playWhoosh();
    setHookCopy({
      headline: v.headline,
      subHook: v.subHook,
      ctaText: v.cta,
      toneArchetype: v.archetype as any,
      predictedCtrBoost: v.predictedCtr,
      ...(v.hookStyle ? { hookStyle: v.hookStyle } : {}),
      ...(v.ctaTheme ? { ctaTheme: v.ctaTheme } : {})
    });
    setMotionPreset(v.motion as any);
    setBackgroundPreset(v.bg as any);
    if (v.aspectRatio) {
      setAspectRatio(v.aspectRatio as any);
    }
    setActiveView('editor');
  };

  const filteredVariations = variations.filter((v) => {
    if (selectedFilter === 'All') return true;
    return v.archetype === selectedFilter;
  });

  const handleQueueBatch = () => {
    soundEngine.playSuccess();
    const batchId = `batch-${Date.now()}`;
    const newItems: RenderItem[] = filteredVariations.map((v, i) => ({
      id: `exp-${Date.now()}-${i}`,
      title: `${(projectName || 'AdCraft').replace(/\s+/g, '_')}_${v.id}_${v.headline.slice(0, 16).replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
      format: 'MP4 (H.264)',
      aspectRatio: v.aspectRatio,
      status: 'queued',
      progress: 0,
      timestamp: language === 'tr' ? 'Az önce eklendi' : 'Just queued',
      variationId: v.id,
      headline: v.headline,
      predictedCtr: v.predictedCtr,
      batchId,
      fps: 60
    }));

    addExportItems(newItems);
    setJustQueued(true);
    setTimeout(() => setJustQueued(false), 2500);

    if (onOpenExportQueue) {
      onOpenExportQueue();
    }
  };

  return (
    <div className="flex-1 bg-[#07080D] p-8 overflow-y-auto font-['Geist'] select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {language === 'tr' ? 'A/B Kreatif Varyasyonlar Matrisi' : 'A/B Creative Variations Matrix'} ({variations.length})
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Gemini 2.5 Flash Powered
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'tr'
                ? 'Viral kancaları, duygusal açıları ve kamera perspektif dönüşümlerini test eden otomatik çoklu varyant matrisi.'
                : 'Automated multi-variant matrix testing viral hooks, emotional angles, and camera perspective transformations.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleQueueBatch}
              id="batch-queue-variations-btn"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 border border-indigo-400/30 cursor-pointer"
              title={language === 'tr' ? 'Tüm varyasyonları render kuyruğuna toplu ekle' : 'Queue all variations to export queue'}
            >
              {justQueued ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Layers className="w-3.5 h-3.5" />}
              <span>
                {justQueued
                  ? (language === 'tr' ? 'Kuyruğa Eklendi!' : 'Queued!')
                  : (language === 'tr' ? `${filteredVariations.length} Varyantı Toplu Kuyruğa Ekle` : `Batch Queue ${filteredVariations.length} Variants`)}
              </span>
            </button>

            <button
              onClick={generateFreshMatrix}
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? (language === 'tr' ? 'Sentezleniyor...' : 'Synthesizing...') : (language === 'tr' ? '12 AI Varyantı Üret' : 'Regenerate 12 AI Variants')}</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveView('editor');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              {language === 'tr' ? '← Düzenleyiciye Dön' : '← Back to Canvas Editor'}
            </button>
          </div>
        </div>

        {/* Custom Angle Input & Filter Pills */}
        <div className="p-3.5 rounded-2xl bg-[#0B0E17]/80 border border-white/[0.07] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Wand2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              placeholder={
                language === 'tr'
                  ? 'Özel Açı / Tohum İstemi (örn. Hızlı oynama meydan okuması, tatil hediyesi)...'
                  : 'Custom Angle / Seed Prompt (e.g. Speedrun challenge, holiday gift pack)...'
              }
              value={customAngle}
              onChange={(e) => setCustomAngle(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder:text-slate-500 w-full focus:outline-none font-['Geist']"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto shrink-0 no-scrollbar">
            {[
              { id: 'All' as const, label: language === 'tr' ? 'Tümü' : 'All', icon: Layers },
              { id: 'Hype / Viral' as const, label: language === 'tr' ? 'Viral / Hype' : 'Hype / Viral', icon: Zap },
              { id: 'FOMO Urgency' as const, label: language === 'tr' ? 'Aciliyet' : 'FOMO Urgency', icon: Clock },
              { id: 'Problem-Solver' as const, label: language === 'tr' ? 'Sorun Çözücü' : 'Problem-Solver', icon: Brain },
              { id: 'Minimalist' as const, label: language === 'tr' ? 'Minimalist' : 'Minimalist', icon: Target }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] border border-indigo-400/30'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.04]'
                }`}
              >
                <f.icon className="w-3 h-3 shrink-0" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVariations.map((v, i) => (
            <div
              key={v.id || i}
              onClick={() => applyVariation(v)}
              className="p-4 rounded-2xl bg-[#0A0D15]/80 border border-white/[0.06] hover:border-indigo-500/50 hover:bg-[#0D111C]/90 hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-['JetBrains_Mono'] text-[10px]">
                    {language === 'tr' ? `Varyant #${i + 1}` : `Var #${i + 1}`} · {v.aspectRatio}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-['JetBrains_Mono'] text-[10px] font-bold">
                    {v.predictedCtr} CTR
                  </span>
                </div>

                <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors mt-1">
                  {v.headline}
                </h4>

                <p className="text-[11px] text-slate-400 font-['JetBrains_Mono']">
                  {v.subHook}
                </p>

                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-['JetBrains_Mono'] text-[10px]">
                    CTA: {v.cta}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-['JetBrains_Mono'] text-[10px]">
                    {v.archetype}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-indigo-400 font-semibold group-hover:text-white">
                <span>{language === 'tr' ? 'Canlı Tuvale Yükle' : 'Load into Live Canvas'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
