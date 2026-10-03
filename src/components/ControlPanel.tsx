import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Sliders,
  Star,
  Check,
  Download,
  Flame,
  CheckCircle2,
  Camera,
  Layers,
  Wand2,
  AlertCircle,
  Zap,
  Clock,
  Target,
  Volume2,
  Video
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  ToneArchetype,
  BackgroundPreset,
  MotionPreset,
  AspectRatio,
  HookStyle,
  CtaTheme,
  DeviceColor
} from '../types';
import { soundEngine } from '../utils/audioEngine';
import { exportCanvasSnapshot, exportCanvasVideo } from '../utils/exportPipeline';
import { useTranslation } from '../i18n/translations';

interface ControlPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onOpenAdPackModal: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ canvasRef, onOpenAdPackModal }) => {
  const { t, language } = useTranslation();
  const {
    projectName,
    hookCopy,
    setHookCopy,
    setToneArchetype,
    backgroundConfig,
    setBackgroundPreset,
    deviceConfig,
    setDeviceColor,
    setMotionPreset,
    channelRules,
    toggleChannelRule,
    aspectRatio,
    credits,
    setCredits,
    exportQueue,
    addExportItem,
    updateExportProgress,
    setIsGeneratingAdPack,
    setAdPackProgress,
    setActiveStoryboard,
    geminiApiKey
  } = useAdCraftStore();

  const { deductCredits, setRewardedAdModalOpen } = useAuthStore();

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [storyboardData, setStoryboardData] = useState<{
    totalDuration: number;
    soundtrackRecommendation: string;
    scenes: Array<{
      timeRange: string;
      phase: string;
      visualAction: string;
      onScreenOverlay: string;
      audioEffect: string;
    }>;
  } | null>(null);
  const [showStoryboardModal, setShowStoryboardModal] = useState(false);
  const [aiVariations, setAiVariations] = useState<
    Array<{ headline: string; subHook: string; ctaText: string; predictedCtrBoost: string }>
  >([]);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoExportProgress, setVideoExportProgress] = useState(0);
  const [showBadgeCustomizer, setShowBadgeCustomizer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tone archetypes with professional Lucide SVG icons
  const toneArchetypes = [
    { type: 'Hype / Viral' as const, label: language === 'tr' ? 'Viral / Hype' : 'Hype / Viral', icon: Zap },
    { type: 'Problem-Solver' as const, label: language === 'tr' ? 'Sorun Çözüm' : 'Problem-Solver', icon: Brain },
    { type: 'Minimalist' as const, label: language === 'tr' ? 'Minimalist' : 'Minimalist', icon: Target },
    { type: 'FOMO Urgency' as const, label: language === 'tr' ? 'FOMO Aciliyet' : 'FOMO Urgency', icon: Clock }
  ];

  // Request AI Variations from Gemini / Server
  const handleGenerateAiVariations = async () => {
    setIsGeneratingAi(true);
    soundEngine.playWhoosh();

    try {
      const res = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          appName: projectName || 'NeonRider',
          appCategory: 'Hyper-Casual Racing Game',
          toneArchetype: hookCopy.toneArchetype,
          currentHook: hookCopy.headline,
          customPrompt: customPrompt.trim() || undefined,
          language
        })
      });

      const json = await res.json();
      if (json.success && json.hooks) {
        setAiVariations(json.hooks);
        setShowVariationsModal(true);
        soundEngine.playClick();
      }
    } catch (e) {
      console.warn('AI variation generation fallback', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Request AI Video Storyboard & Script
  const handleGenerateStoryboard = async () => {
    setIsGeneratingStoryboard(true);
    soundEngine.playWhoosh();

    try {
      const res = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          appName: projectName || 'NeonRider',
          hookHeadline: hookCopy.headline,
          toneArchetype: hookCopy.toneArchetype,
          totalDuration: 15,
          language
        })
      });

      const json = await res.json();
      if (json.success && json.storyboard) {
        setStoryboardData(json.storyboard);
        setShowStoryboardModal(true);
        soundEngine.playClick();
      }
    } catch (e) {
      console.warn('Storyboard generation fallback', e);
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  // Instant PNG Snapshot
  const handleSnapshot = async () => {
    const canvas =
      canvasRef.current ||
      (document.getElementById('adcraft-export-canvas') as HTMLCanvasElement | null) ||
      (document.querySelector('canvas') as HTMLCanvasElement | null);
    if (!canvas) return;
    setIsExportingSnapshot(true);
    soundEngine.playClick();

    try {
      const url = await exportCanvasSnapshot({
        canvasElement: canvas,
        aspectRatio,
        format: 'PNG',
        title: `AdCraft_4K_${aspectRatio.replace(':', 'x')}`
      });

      addExportItem({
        id: `snap-${Date.now()}`,
        title: `AdCraft_Creative_${aspectRatio.replace(':', 'x')}.png`,
        format: '4K Ultra PNG',
        aspectRatio,
        status: 'ready',
        progress: 100,
        url,
        size: '4.2 MB',
        timestamp: 'Just now'
      });
    } catch (err) {
      console.error('Snapshot failed', err);
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  // 60fps ProRes MP4 Video Render
  const handleExportVideo = async () => {
    const canvas =
      canvasRef.current ||
      (document.getElementById('adcraft-export-canvas') as HTMLCanvasElement | null) ||
      (document.querySelector('canvas') as HTMLCanvasElement | null);
    if (!canvas) {
      showToast(language === 'tr' ? 'Tuval bulunamadı' : 'Canvas not found');
      return;
    }

    const deducted = deductCredits(5);
    if (!deducted) {
      showToast(
        language === 'tr'
          ? 'Video render için 5 kredi gerekli! Sponsor izleyerek kazanın.'
          : '5 credits required for video render! Watch sponsor ad to earn.'
      );
      setRewardedAdModalOpen(true);
      return;
    }

    setIsExportingVideo(true);
    setVideoExportProgress(0);
    soundEngine.playWhoosh();

    const videoId = `vid-${Date.now()}`;
    const filename = `${projectName || 'AdCraft'}_${aspectRatio.replace(':', 'x')}_60fps.mp4`;

    addExportItem({
      id: videoId,
      title: filename,
      format: '60fps ProRes MP4',
      aspectRatio,
      status: 'rendering',
      progress: 5,
      size: '14.8 MB',
      timestamp: 'Just now'
    });

    try {
      const url = await exportCanvasVideo({
        canvasElement: canvas,
        aspectRatio,
        format: 'MP4',
        title: filename.replace('.mp4', ''),
        fps: 60,
        durationSec: 5,
        onProgress: (pct) => {
          setVideoExportProgress(pct);
          updateExportProgress(videoId, pct, pct >= 100 ? 'ready' : 'rendering');
        }
      });

      updateExportProgress(videoId, 100, 'ready', url);
      showToast(language === 'tr' ? '60 FPS Video Başarıyla Kaydedildi!' : '60 FPS Video Rendered Successfully!');
    } catch (err) {
      console.error('Video export error:', err);
      updateExportProgress(videoId, 0, 'error');
      showToast(language === 'tr' ? 'Video dışa aktarma başarısız oldu' : 'Video export failed');
    } finally {
      setIsExportingVideo(false);
      setVideoExportProgress(0);
    }
  };

  // Primary Synthesize Ad Pack trigger
  const handleSynthesizeAdPack = () => {
    soundEngine.playWhoosh();
    const deducted = deductCredits(15);
    if (!deducted) {
      showToast(
        language === 'tr'
          ? 'Yetersiz Kredi (15 gerekli)! Sponsor videosu izleyerek +50 kredi kazanın.'
          : 'Insufficient Credits (15 required)! Watch sponsor video to earn +50 credits.'
      );
      setRewardedAdModalOpen(true);
      return;
    }
    onOpenAdPackModal();
  };

  const lastExport = exportQueue[0];

  return (
    <aside
      id="adcraft-control-panel"
      className="col-span-12 xl:col-span-3 bg-[#090C13]/95 border-l border-white/[0.06] flex flex-col p-4 gap-4 shadow-xl select-none overflow-y-auto max-h-[calc(100vh-6.5rem)] font-['Geist'] pb-20"
    >
      {/* Section 1: Hook & Copy Engine */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">{t.controlPanel.hookCopyEngine}</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-['JetBrains_Mono'] text-[10px] font-semibold">
            Gemini 2.5 Flash
          </span>
        </div>

        {/* Tone Archetype Buttons */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {t.controlPanel.creativeToneArchetype}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {toneArchetypes.map((tone) => {
              const isActive = hookCopy.toneArchetype === tone.type;
              return (
                <button
                  key={tone.type}
                  onClick={() => {
                    soundEngine.playClick();
                    setToneArchetype(tone.type);
                  }}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                      : 'bg-[#0F131D] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <tone.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{tone.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Headline Hook */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {t.controlPanel.dynamicHeadlineHook}
            </label>
            <span className="text-[10px] font-['JetBrains_Mono'] text-slate-500">
              {hookCopy.headline.length} / 120
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 pb-0.5">
            <button
              onClick={handleGenerateStoryboard}
              disabled={isGeneratingStoryboard}
              className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-['JetBrains_Mono'] text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Generate 15s timed shot breakdown & storyboard"
            >
              <Layers className={`w-3 h-3 ${isGeneratingStoryboard ? 'animate-spin' : ''}`} />
              <span>{isGeneratingStoryboard ? t.controlPanel.scripting : t.controlPanel.storyboard}</span>
            </button>
            <button
              onClick={handleGenerateAiVariations}
              disabled={isGeneratingAi}
              className="px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-['JetBrains_Mono'] text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? t.controlPanel.synthesizing : t.controlPanel.aiHooks}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={hookCopy.headline}
              onChange={(e) => setHookCopy({ headline: e.target.value })}
              className="w-full rounded-xl bg-[#0F131D] border border-white/[0.08] p-2.5 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 resize-none shadow-inner"
            />
          </div>

          {/* Custom Angle / Prompt Seed */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              placeholder={t.controlPanel.customAngleSeed}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 rounded-lg bg-slate-900/60 border border-slate-800/80 px-2 py-1 text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-['JetBrains_Mono']"
            />
            {customPrompt && (
              <button
                onClick={() => setCustomPrompt('')}
                className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
              >
                {language === 'tr' ? 'Temizle' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Sub-Hook / Proof Point */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {t.controlPanel.subHookProofPoint}
          </label>
          <input
            type="text"
            value={hookCopy.subHook}
            onChange={(e) => setHookCopy({ subHook: e.target.value })}
            className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-['JetBrains_Mono']"
          />
        </div>

        {/* Hook / Caption Style Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {t.controlPanel.hookStyle}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-['JetBrains_Mono'] text-xs">
            {(['TikTok Banner', 'Cyber Glow', 'Studio Sleek', 'Glassmorphic', 'Minimalist'] as HookStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => {
                  soundEngine.playClick();
                  setHookCopy({ hookStyle: style });
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                  (hookCopy.hookStyle || 'TikTok Banner') === style
                    ? 'bg-slate-900 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      style === 'TikTok Banner'
                        ? 'bg-amber-400'
                        : style === 'Cyber Glow'
                        ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                        : style === 'Studio Sleek'
                        ? 'bg-indigo-400'
                        : style === 'Glassmorphic'
                        ? 'bg-slate-300 border border-white/40'
                        : 'bg-white'
                    }`}
                  />
                  <span className="truncate">
                    {style === 'Cyber Glow'
                      ? (language === 'tr' ? 'Siber Işıma' : 'Cyber Glow')
                      : style === 'Studio Sleek'
                      ? (language === 'tr' ? 'Titanyum Sleek' : 'Studio Sleek')
                      : style === 'Glassmorphic'
                      ? (language === 'tr' ? 'Buzlu Cam' : 'Glassmorphic')
                      : style === 'Minimalist'
                      ? (language === 'tr' ? 'Minimalist' : 'Minimalist')
                      : style}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Text, Theme & App Badges */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {t.controlPanel.ctaText}
            </label>
            <input
              type="text"
              value={hookCopy.ctaText}
              onChange={(e) => setHookCopy({ ctaText: e.target.value })}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-['JetBrains_Mono']"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold">{t.controlPanel.ctaTheme}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-['JetBrains_Mono'] text-[11px]">
              {(
                [
                  { name: 'Electric Indigo', grad: 'from-indigo-600 via-indigo-500 to-sky-500' },
                  { name: 'Cyber Cyan', grad: 'from-sky-600 via-teal-600 to-cyan-600' },
                  { name: 'Emerald Spark', grad: 'from-emerald-600 via-teal-600 to-emerald-500' },
                  { name: 'Hot Rose', grad: 'from-rose-600 via-pink-600 to-rose-500' },
                  { name: 'Amber Sunset', grad: 'from-amber-600 via-orange-600 to-rose-600' }
                ] as { name: CtaTheme; grad: string }[]
              ).map((ct) => (
                <button
                  key={ct.name}
                  onClick={() => {
                    soundEngine.playClick();
                    setHookCopy({ ctaTheme: ct.name });
                  }}
                  className={`px-2 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    (hookCopy.ctaTheme || 'Electric Indigo') === ct.name
                      ? 'bg-slate-900 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-500/40 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${ct.grad} shrink-0 shadow-sm`} />
                  <span className="truncate">{ct.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-300">{t.controlPanel.storeBadges}</span>
            <button
              onClick={() => {
                soundEngine.playClick();
                setHookCopy({ showStoreBadges: hookCopy.showStoreBadges === false ? true : false });
              }}
              className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
                hookCopy.showStoreBadges !== false ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
            </button>
          </div>
        </div>

        {/* Karaoke Word Highlights Toggle Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-indigo-400" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">{t.controlPanel.karaokeWordHighlights}</span>
              <span className="text-[10px] text-slate-400">
                {t.controlPanel.karaokeDesc}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              setHookCopy({ karaokeEffect: !hookCopy.karaokeEffect });
            }}
            className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
              hookCopy.karaokeEffect ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-800/80" />

      {/* Section 2: Visual Style & 3D Environment */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{t.controlPanel.environment3d}</h3>
          <span className="font-['JetBrains_Mono'] text-[11px] text-slate-400">8 {t.controlPanel.presets}</span>
        </div>

        {/* Preset Cards - 8 dynamic visual environments */}
        <div className="grid grid-cols-2 gap-2">
          {/* Preset 1: Perspective Grid */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Cyber Grid 3D');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Cyber Grid 3D'
                ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/40 via-transparent to-indigo-900/20" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:10px_10px] opacity-25" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-white truncate">
              {language === 'tr' ? 'Perspektif Izgara' : 'Perspective Grid'}
            </span>
          </div>

          {/* Preset 2: Blurred Gameplay */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Blurred Gameplay');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Blurred Gameplay'
                ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/60 to-slate-900/80" />
              <div className="absolute inset-0 backdrop-blur-sm" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-300 truncate">
              {language === 'tr' ? 'Bulanık Oynanış' : 'Blurred Gameplay'}
            </span>
          </div>

          {/* Preset 3: Obsidian Studio */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Obsidian Studio');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Neon Mesh' || backgroundConfig.preset === 'Obsidian Studio'
                ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#182030] via-[#0D111A] to-[#06080E]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_70%)]" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-300 truncate">
              {language === 'tr' ? 'Obsidyen Stüdyo' : 'Obsidian Studio'}
            </span>
          </div>

          {/* Preset 4: Studio Floor */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Studio Floor');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Studio Floor'
                ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 via-slate-950 to-slate-900" />
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-indigo-500/20 to-transparent" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-300 truncate">
              {language === 'tr' ? 'Stüdyo Zemini' : 'Studio Floor'}
            </span>
          </div>

          {/* Preset 5: Aurora Borealis */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Aurora Borealis');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Aurora Borealis'
                ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/30 via-teal-900/40 to-purple-600/30" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-300 truncate">
              Aurora Borealis
            </span>
          </div>

          {/* Preset 6: Midnight Luxury */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Midnight Luxury');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Midnight Luxury'
                ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#141A24] to-[#040609]" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-300 truncate">
              Midnight Luxury
            </span>
          </div>

          {/* Preset 7: Sunset Radiant */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Sunset Radiant');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Sunset Radiant'
                ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 via-rose-700/40 to-slate-950" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-300 truncate">
              Sunset Radiant
            </span>
          </div>

          {/* Preset 8: Clean Studio */}
          <div
            onClick={() => {
              soundEngine.playClick();
              setBackgroundPreset('Clean Studio');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              backgroundConfig.preset === 'Clean Studio'
                ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="h-10 rounded-lg bg-slate-950 overflow-hidden relative">
              <div className="absolute inset-0 bg-radial from-slate-800/50 to-slate-950" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-300 truncate">
              Clean Studio
            </span>
          </div>
        </div>

        {/* Device Finish / Color */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {t.controlPanel.deviceColor}
          </span>
          <div className="grid grid-cols-5 gap-1 font-['JetBrains_Mono'] text-[10px]">
            {(
              [
                { name: 'Titanium Black', label: 'Black', swatch: 'from-[#17191E] via-[#23272F] to-[#3B4252] border-[#4C566A]' },
                { name: 'Desert Titanium', label: 'Desert', swatch: 'from-[#8C7A6B] via-[#C8B29B] to-[#E5D4C0] border-[#D8C7B5]' },
                { name: 'Natural Titanium', label: 'Natural', swatch: 'from-[#6C6A65] via-[#9F9B93] to-[#C9C5BE] border-[#B5B2AB]' },
                { name: 'White Titanium', label: 'White', swatch: 'from-[#CFD8DC] via-[#ECEFF1] to-[#FFFFFF] border-[#CFD8DC]' },
                { name: 'Obsidian', label: 'Obsidian', swatch: 'from-[#050608] via-[#111318] to-[#1E232E] border-[#2A303C]' }
              ] as { name: DeviceColor; label: string; swatch: string }[]
            ).map((col) => {
              const isActive = deviceConfig.color === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => {
                    soundEngine.playClick();
                    setDeviceColor(col.name);
                  }}
                  title={col.name}
                  className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${col.swatch} border shadow-inner`} />
                  <span className="truncate w-full text-center leading-none">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Device Motion Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {t.controlPanel.deviceMotionPreset}
          </span>
          <div className="grid grid-cols-4 gap-1 font-['JetBrains_Mono'] text-[11px]">
            {(['Floating Drift', 'Zoom In Punch', 'Isometric 45°', 'Static'] as MotionPreset[]).map((preset) => {
              const isActive = deviceConfig.motionPreset === preset;
              const displayLabel =
                language === 'tr'
                  ? preset === 'Floating Drift'
                    ? 'Süzülen'
                    : preset === 'Zoom In Punch'
                    ? 'Vuruş'
                    : preset === 'Isometric 45°'
                    ? 'İzometrik'
                    : 'Sabit'
                  : preset === 'Floating Drift'
                  ? 'Drift'
                  : preset === 'Zoom In Punch'
                  ? 'Punch'
                  : preset === 'Isometric 45°'
                  ? 'Isometric'
                  : 'Static';

              return (
                <button
                  key={preset}
                  onClick={() => {
                    soundEngine.playClick();
                    setMotionPreset(preset);
                  }}
                  className={`py-1.5 px-1 rounded-lg font-semibold transition-all cursor-pointer text-center truncate ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Store Proof Badge Customizer */}
        <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 transition-all">
          <div
            onClick={() => {
              soundEngine.playClick();
              setShowBadgeCustomizer(!showBadgeCustomizer);
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">{t.controlPanel.storeProofBadge}</span>
              <span className="text-[11px] text-emerald-400 font-['JetBrains_Mono'] flex items-center gap-1">
                <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>
                  {hookCopy.starRating || 4.9} ★★★★★ ({hookCopy.reviewCount || (language === 'tr' ? '48 bin inceleme' : '48k reviews')})
                </span>
              </span>
            </div>
            <button
              className={`p-1 rounded-lg transition-colors ${
                showBadgeCustomizer ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Customize rating & reviews"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {showBadgeCustomizer && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2 font-['Geist'] animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">{t.controlPanel.starRating}</span>
                  <select
                    value={hookCopy.starRating || 4.9}
                    onChange={(e) => setHookCopy({ starRating: parseFloat(e.target.value) })}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="5.0">5.0 ★★★★★</option>
                    <option value="4.9">4.9 ★★★★★</option>
                    <option value="4.8">4.8 ★★★★☆</option>
                    <option value="4.7">4.7 ★★★★☆</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">{t.controlPanel.reviewCount}</span>
                  <input
                    type="text"
                    value={hookCopy.reviewCount || '48k reviews'}
                    onChange={(e) => setHookCopy({ reviewCount: e.target.value })}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                    placeholder="e.g. 50k+ reviews"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-800/80" />

      {/* Section 3: Channel Automation Rules */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {t.controlPanel.channelAutomationRules}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span
            onClick={() => toggleChannelRule('tiktokSoundBoost')}
            className={`px-2.5 py-1 rounded-lg font-['JetBrains_Mono'] text-xs flex items-center gap-1.5 cursor-pointer border transition-colors ${
              channelRules.tiktokSoundBoost
                ? 'bg-slate-900 border-cyan-500/60 text-white'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {t.controlPanel.tiktokSoundBoost}
          </span>

          <span
            onClick={() => toggleChannelRule('instagramSafeMargins')}
            className={`px-2.5 py-1 rounded-lg font-['JetBrains_Mono'] text-xs flex items-center gap-1.5 cursor-pointer border transition-colors ${
              channelRules.instagramSafeMargins
                ? 'bg-slate-900 border-indigo-500/60 text-white'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> {t.controlPanel.instagramSafeMargins}
          </span>
        </div>
      </div>

      {/* Section 4: Primary Export Action Area */}
      <div className="mt-auto pt-2 flex flex-col gap-3">
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={channelRules.renderVariations}
              onChange={() => toggleChannelRule('renderVariations')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>{t.controlPanel.renderVariations}</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={channelRules.burnProResOutputs}
              onChange={() => toggleChannelRule('burnProResOutputs')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>{t.controlPanel.burnProRes}</span>
          </label>
        </div>

        {/* Export Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {/* 60fps Video Export */}
          <button
            id="quick-video-btn"
            onClick={handleExportVideo}
            disabled={isExportingVideo || isExportingSnapshot}
            className="py-2.5 px-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600/25 hover:border-indigo-500/50 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm relative overflow-hidden disabled:opacity-50"
            title="Render 60fps ProRes MP4 Video (5 credits)"
          >
            {isExportingVideo && (
              <div
                className="absolute inset-0 bg-indigo-600/40 transition-all duration-200"
                style={{ width: `${videoExportProgress}%` }}
              />
            )}
            <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0 relative z-10" />
            <span className="truncate relative z-10 font-medium">
              {isExportingVideo ? `${videoExportProgress}%` : t.controlPanel.export60fpsVideo}
            </span>
          </button>

          {/* Snapshot Quick Action */}
          <button
            id="quick-snapshot-btn"
            onClick={handleSnapshot}
            disabled={isExportingSnapshot || isExportingVideo}
            className="py-2.5 px-2.5 rounded-xl bg-[#0F131D] border border-white/[0.08] hover:border-white/20 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
            title="Export 4K Ultra PNG Snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate font-medium">
              {isExportingSnapshot ? t.controlPanel.capturingSnapshot : t.controlPanel.exportHighResPng}
            </span>
          </button>
        </div>

        {/* Primary Big Action Button: Synthesize Ad Pack */}
        <button
          onClick={handleSynthesizeAdPack}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 text-white font-['Geist'] text-sm font-bold flex flex-col items-center justify-center border border-indigo-400/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_24px_rgba(99,102,241,0.45)] hover:brightness-110 active:scale-[0.99] transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
            <span className="text-base tracking-tight font-extrabold">{t.controlPanel.synthesizeAdPack}</span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[11px] text-indigo-100/80 font-normal mt-0.5">
            {t.controlPanel.consumesCredits}
          </span>
        </button>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Notification Status Card: Last Rendered */}
        {lastExport && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1 font-['JetBrains_Mono'] text-[11px]">
              {t.controlPanel.lastRendered}: {lastExport.title}
            </span>
            {lastExport.url ? (
              <a
                href={lastExport.url}
                download={lastExport.title}
                className="p-1 hover:text-white"
                title="Download file"
              >
                <Download className="w-4 h-4 cursor-pointer" />
              </a>
            ) : (
              <button
                type="button"
                className="p-1 text-emerald-400 hover:text-white transition-colors"
                onClick={() => showToast(`Ready in queue: ${lastExport.title}`)}
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI Storyboard Modal Popup */}
      {showStoryboardModal && storyboardData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-['Geist'] select-none">
          <div className="w-full max-w-2xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {language === 'tr' ? 'AI Reklam Video Taslağı & Sahne Dağılımı' : 'AI Commercial Video Storyboard & Script Breakdown'}
                  </h3>
                  <span className="text-xs text-slate-400 font-['JetBrains_Mono']">
                    {language === 'tr' ? 'Toplam Süre' : 'Total Duration'}: {storyboardData.totalDuration}s · {storyboardData.soundtrackRecommendation}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowStoryboardModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                {language === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>

            <div className="flex flex-col gap-3 my-4">
              {storyboardData.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex flex-col gap-2 hover:border-white/[0.12] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-['JetBrains_Mono'] text-xs font-bold border border-indigo-500/30">
                      {language === 'tr' ? `Sahne ${idx + 1}` : `Scene ${idx + 1}`} · {scene.timeRange}
                    </span>
                    <span className="text-xs font-semibold text-amber-400 font-['Geist']">
                      {language === 'tr' ? 'Aşama' : 'Phase'}: {scene.phase}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 mt-1">
                    <strong className="text-slate-400">{language === 'tr' ? 'Görsel Aksiyon:' : 'Visual Action:'}</strong> {scene.visualAction}
                  </div>
                  <div className="text-xs text-cyan-300 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40 font-['JetBrains_Mono']">
                    <strong>{language === 'tr' ? 'Ekran Metni:' : 'Overlay Text:'}</strong> &quot;{scene.onScreenOverlay}&quot;
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-['JetBrains_Mono']">
                    <span className="text-indigo-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{language === 'tr' ? 'Ses Efekti:' : 'Audio FX:'}</span>
                    </span>
                    <span>{scene.audioEffect}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (storyboardData) {
                    setActiveStoryboard(storyboardData);
                  }
                  setShowStoryboardModal(false);
                  showToast(language === 'tr' ? 'Taslak proje sekansına uygulandı!' : 'Storyboard applied to project sequence!');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {language === 'tr' ? 'Taslağı Zaman Çizelgesine Uygula' : 'Apply Storyboard to Timeline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Variations Modal Popup */}
      {showVariationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-['Geist'] select-none">
          <div className="w-full max-w-lg bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === 'tr' ? 'AI Dinamik Kanca Çeşitleri' : 'AI Dynamic Hook Variations'}
                </h3>
              </div>
              <button
                onClick={() => setShowVariationsModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
              >
                {language === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {language === 'tr'
                ? 'Kampanyanıza anında uygulamak için yüksek dönüşüm sağlayan bir kanca çeşidi seçin:'
                : 'Select any generated high-CTR hook variation to instantly apply to your creative campaign:'}
            </p>

            <div className="flex flex-col gap-2.5 my-4">
              {aiVariations.map((v, i) => (
                <div
                  key={i}
                  onClick={() => {
                    soundEngine.playClick();
                    setHookCopy({
                      headline: v.headline,
                      subHook: v.subHook,
                      ctaText: v.ctaText,
                      predictedCtrBoost: v.predictedCtrBoost
                    });
                    setShowVariationsModal(false);
                    showToast(language === 'tr' ? `Kanca uygulandı: "${v.headline}"` : `Applied hook: "${v.headline}"`);
                  }}
                  className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] hover:border-indigo-500/80 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {v.headline}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {v.subHook} · CTA: &quot;{v.ctaText}&quot;
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-['JetBrains_Mono'] text-[10px] font-bold">
                    {v.predictedCtrBoost}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
