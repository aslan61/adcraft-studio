import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  FileVideo,
  FileImage,
  CheckCircle2,
  Clock,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Check,
  Cpu,
  Archive,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { exportCanvasSnapshot } from '../utils/exportPipeline';
import { useTranslation } from '../i18n/translations';
import { INITIAL_VARIATIONS, AdVariationItem } from '../data/variationsCatalog';
import { RenderItem, AspectRatio } from '../types';

interface ExportQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportQueueModal: React.FC<ExportQueueModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useTranslation();
  const {
    exportQueue,
    addExportItems,
    removeExportItem,
    clearExportQueue,
    updateExportItem,
    updateExportProgress,
    projectName
  } = useAdCraftStore();

  // Dashboard & Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'rendering' | 'queued' | 'ready'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Integrated Variation Batch Selector State
  const [showVariationPicker, setShowVariationPicker] = useState(false);
  const [selectedVarIds, setSelectedVarIds] = useState<string[]>(
    INITIAL_VARIATIONS.slice(0, 5).map((v) => v.id)
  );
  const [batchFormat, setBatchFormat] = useState<'MP4 (H.264)' | '4K Ultra PNG' | 'ProRes 422 HQ' | 'Creative Ad Pack'>(
    'MP4 (H.264)'
  );
  const [batchAspectOverride, setBatchAspectOverride] = useState<'original' | '9:16' | '1:1' | '16:9'>('original');

  // Stats
  const totalCount = exportQueue.length;
  const queuedCount = exportQueue.filter((i) => i.status === 'queued').length;
  const renderingCount = exportQueue.filter((i) => i.status === 'rendering').length;
  const readyCount = exportQueue.filter((i) => i.status === 'ready').length;
  const errorCount = exportQueue.filter((i) => i.status === 'error').length;

  const totalProgress =
    totalCount === 0
      ? 0
      : Math.round(exportQueue.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalCount);

  // Batch Processing Engine
  useEffect(() => {
    if (!isBatchRunning) return;

    // Check if there are any queued or rendering tasks
    const activeItem = exportQueue.find((i) => i.status === 'rendering');
    const nextQueued = exportQueue.find((i) => i.status === 'queued');

    if (!activeItem && !nextQueued) {
      // All done!
      setIsBatchRunning(false);
      try {
        soundEngine.playSuccess();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // audio fallback
      }
      return;
    }

    const currentItem = activeItem || nextQueued;
    if (!currentItem) return;

    // Mark as rendering if it was queued
    if (currentItem.status === 'queued') {
      updateExportItem(currentItem.id, { status: 'rendering', progress: 5 });
      return;
    }

    // Step-by-step progress simulation with real canvas snapshot integration
    const interval = setInterval(() => {
      const current = exportQueue.find((i) => i.id === currentItem.id);
      if (!current || current.status !== 'rendering') {
        clearInterval(interval);
        return;
      }

      const nextProg = Math.min(100, current.progress + Math.floor(Math.random() * 15) + 12);

      if (nextProg >= 100) {
        clearInterval(interval);

        // Generate fallback canvas snapshot URL or blob
        let finalUrl = current.url;
        if (!finalUrl) {
          const canvas = (document.getElementById('adcraft-export-canvas') || document.querySelector('canvas')) as HTMLCanvasElement | null;
          if (canvas) {
            try {
              finalUrl = canvas.toDataURL('image/png');
            } catch {
              finalUrl = undefined;
            }
          }
        }

        const calculatedSize = current.format.includes('PNG')
          ? `${(Math.random() * 2 + 3.2).toFixed(1)} MB`
          : current.format.includes('ProRes')
          ? `${(Math.random() * 20 + 45).toFixed(1)} MB`
          : `${(Math.random() * 6 + 11.4).toFixed(1)} MB`;

        updateExportItem(currentItem.id, {
          status: 'ready',
          progress: 100,
          url: finalUrl,
          size: calculatedSize,
          timestamp: language === 'tr' ? 'Az önce tamamlandı' : 'Just finished'
        });

        soundEngine.playClick();
      } else {
        updateExportItem(currentItem.id, { progress: nextProg });
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isBatchRunning, exportQueue, updateExportItem, language]);

  // Handle Start / Pause All
  const handleToggleBatch = () => {
    soundEngine.playClick();
    if (isBatchRunning) {
      setIsBatchRunning(false);
      // Pause any active rendering item
      const active = exportQueue.find((i) => i.status === 'rendering');
      if (active) {
        updateExportItem(active.id, { status: 'paused' });
      }
    } else {
      // Resume paused or start queued items
      const hasWork = exportQueue.some((i) => i.status === 'queued' || i.status === 'paused');
      if (hasWork) {
        exportQueue.forEach((item) => {
          if (item.status === 'paused') {
            updateExportItem(item.id, { status: 'queued' });
          }
        });
        setIsBatchRunning(true);
      } else if (totalCount === 0) {
        setShowVariationPicker(true);
      }
    }
  };

  // Add Selected Variations into Queue
  const handleQueueSelectedVariations = () => {
    soundEngine.playSuccess();
    const batchId = `batch-${Date.now()}`;
    const newItems: RenderItem[] = selectedVarIds
      .map((id) => INITIAL_VARIATIONS.find((v) => v.id === id))
      .filter((v): v is AdVariationItem => Boolean(v))
      .map((v, i) => {
        const aspect: AspectRatio =
          batchAspectOverride === 'original' ? v.aspectRatio : batchAspectOverride;
        const ext = batchFormat.includes('PNG')
          ? 'png'
          : batchFormat.includes('ProRes')
          ? 'mov'
          : batchFormat.includes('Pack')
          ? 'zip'
          : 'mp4';

        const cleanHeadline = v.headline
          .slice(0, 16)
          .replace(/[^a-zA-Z0-9]/g, '_')
          .replace(/_+/g, '_');

        return {
          id: `batch-${Date.now()}-${i}`,
          title: `${(projectName || 'AdCraft').replace(/\s+/g, '_')}_${v.id}_${cleanHeadline}.${ext}`,
          format: batchFormat,
          aspectRatio: aspect,
          status: 'queued',
          progress: 0,
          timestamp: language === 'tr' ? 'Beklemede' : 'Queued',
          variationId: v.id,
          headline: v.headline,
          predictedCtr: v.predictedCtr,
          batchId,
          fps: 60
        };
      });

    addExportItems(newItems);
    setShowVariationPicker(false);
    setIsBatchRunning(true);
  };

  // Download All Completed as a single ZIP bundle
  const handleDownloadAllZip = async () => {
    const readyItems = exportQueue.filter((i) => i.status === 'ready');
    if (readyItems.length === 0) return;

    setIsZipping(true);
    soundEngine.playClick();

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${(projectName || 'AdCraft').replace(/\s+/g, '_')}_Variations`);

      // Add Manifest JSON
      const manifest = {
        project: projectName,
        exportedAt: new Date().toISOString(),
        totalFiles: readyItems.length,
        items: readyItems.map((item) => ({
          title: item.title,
          format: item.format,
          aspectRatio: item.aspectRatio,
          variationId: item.variationId,
          headline: item.headline,
          predictedCtr: item.predictedCtr,
          size: item.size
        }))
      };

      folder?.file('batch_manifest.json', JSON.stringify(manifest, null, 2));

      // Add files or generated placeholder payload
      for (const item of readyItems) {
        if (item.url && item.url.startsWith('data:image/png;base64,')) {
          const base64Data = item.url.replace(/^data:image\/png;base64,/, '');
          folder?.file(item.title, base64Data, { base64: true });
        } else if (item.url && item.url.startsWith('blob:')) {
          try {
            const resp = await fetch(item.url);
            const blob = await resp.blob();
            folder?.file(item.title, blob);
          } catch {
            folder?.file(item.title, `Render output for ${item.title}`);
          }
        } else {
          // Provide metadata fallback card
          const info = `AdCraft Neural Creative Export\nTitle: ${item.title}\nFormat: ${item.format}\nRatio: ${item.aspectRatio}\nHeadline: ${item.headline || 'N/A'}\nPredicted CTR: ${item.predictedCtr || 'N/A'}`;
          folder?.file(`${item.title}.txt`, info);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${(projectName || 'AdCraft').replace(/\s+/g, '_')}_Batch_Creative_Pack_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      soundEngine.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      console.error('ZIP generation error:', e);
    } finally {
      setIsZipping(false);
    }
  };

  // Filter & Search
  const filteredQueue = exportQueue.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchHeadline = item.headline?.toLowerCase().includes(q);
      const matchFormat = item.format.toLowerCase().includes(q);
      return matchTitle || matchHeadline || matchFormat;
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-['Geist'] select-none">
      <div className="w-full max-w-4xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95 flex flex-col gap-5 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {t.batchExport.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-['JetBrains_Mono'] text-xs font-semibold">
                  Batch Processor v3.4
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {t.batchExport.subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowVariationPicker(!showVariationPicker);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showVariationPicker
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {showVariationPicker
                  ? t.batchExport.hideVariations
                  : t.batchExport.addVariations}
              </span>
              {showVariationPicker ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top KPI Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">{t.batchExport.totalJobs}</span>
              <span className="text-lg font-bold text-white font-['JetBrains_Mono']">{totalCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.04] text-slate-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">{t.batchExport.queuedJobs}</span>
              <span className="text-lg font-bold text-amber-400 font-['JetBrains_Mono']">{queuedCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">{t.batchExport.renderingJobs}</span>
              <span className="text-lg font-bold text-indigo-400 font-['JetBrains_Mono']">{renderingCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <RefreshCw className={`w-4 h-4 ${renderingCount > 0 ? 'animate-spin' : ''}`} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">{t.batchExport.readyJobs}</span>
              <span className="text-lg font-bold text-emerald-400 font-['JetBrains_Mono']">{readyCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Global Batch Progress & Action Deck */}
        <div className="p-4 rounded-xl bg-[#0D111C]/90 border border-white/[0.06] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {t.batchExport.batchProgress}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-['JetBrains_Mono'] text-[11px] font-bold">
                {totalProgress}%
              </span>
              {isBatchRunning && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-['JetBrains_Mono'] text-[10px]">
                  <Cpu className="w-3 h-3 text-indigo-400 animate-pulse" />
                  {t.batchExport.fps60}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBatch}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isBatchRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isBatchRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>{t.batchExport.pauseAll}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{t.batchExport.startAll}</span>
                  </>
                )}
              </button>

              {readyCount > 0 && (
                <button
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Download all ready files as a unified ZIP archive"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>
                    {isZipping ? t.batchExport.downloadingZip : `${t.batchExport.downloadZip} (${readyCount})`}
                  </span>
                </button>
              )}

              {totalCount > 0 && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    clearExportQueue();
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title={t.batchExport.clearAll}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Collapsible Integrated Batch Variation Picker */}
        {showVariationPicker && (
          <div className="p-4 rounded-xl bg-slate-900/95 border border-indigo-500/40 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-['JetBrains_Mono']">
                  {language === 'tr' ? 'A/B Varyasyon Matrisi Toplu Seçici' : 'A/B Variation Matrix Batch Picker'}
                </span>
                <span className="text-xs text-indigo-400 font-['JetBrains_Mono']">
                  ({selectedVarIds.length}/{INITIAL_VARIATIONS.length} {language === 'tr' ? 'seçildi' : 'selected'})
                </span>
              </div>

              {/* Quick Select Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedVarIds(INITIAL_VARIATIONS.map((v) => v.id))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                >
                  {t.batchExport.selectAll}
                </button>
                <button
                  onClick={() =>
                    setSelectedVarIds(
                      [...INITIAL_VARIATIONS]
                        .sort((a, b) => parseInt(b.predictedCtr) - parseInt(a.predictedCtr))
                        .slice(0, 5)
                        .map((v) => v.id)
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                >
                  {t.batchExport.selectTopCtr}
                </button>
                <button
                  onClick={() =>
                    setSelectedVarIds(
                      INITIAL_VARIATIONS.filter((v) => v.aspectRatio === '9:16').map((v) => v.id)
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                >
                  {t.batchExport.select916}
                </button>
                <button
                  onClick={() => setSelectedVarIds([])}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-semibold"
                >
                  {t.batchExport.deselectAll}
                </button>
              </div>
            </div>

            {/* Batch Configuration Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 shrink-0">{t.batchExport.exportFormat}:</span>
                <select
                  value={batchFormat}
                  onChange={(e) => setBatchFormat(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-['JetBrains_Mono'] text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="MP4 (H.264)">MP4 (H.264 / 60 FPS)</option>
                  <option value="4K Ultra PNG">4K Ultra PNG Snapshot</option>
                  <option value="ProRes 422 HQ">Apple ProRes 422 HQ</option>
                  <option value="Creative Ad Pack">Multi-Format Creative Ad Pack</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 shrink-0">{t.batchExport.targetRatio}:</span>
                <select
                  value={batchAspectOverride}
                  onChange={(e) => setBatchAspectOverride(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-['JetBrains_Mono'] text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="original">
                    {language === 'tr' ? 'Varyantın Kendi Oranı' : "Variant's Native Ratio"}
                  </option>
                  <option value="9:16">9:16 (TikTok, Reels, Shorts)</option>
                  <option value="1:1">1:1 (Instagram Feed)</option>
                  <option value="16:9">16:9 (YouTube, Landscape)</option>
                </select>
              </div>
            </div>

            {/* Variations Mini-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {INITIAL_VARIATIONS.map((v) => {
                const isSelected = selectedVarIds.includes(v.id);
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedVarIds((prev) =>
                        prev.includes(v.id) ? prev.filter((id) => id !== v.id) : [...prev, v.id]
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-['JetBrains_Mono']">
                          {v.id} · {v.aspectRatio}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-['JetBrains_Mono'] font-bold">
                          {v.predictedCtr}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white truncate">{v.headline}</span>
                      <span className="text-[10px] text-slate-400 truncate">{v.archetype}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action to enqueue */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={handleQueueSelectedVariations}
                disabled={selectedVarIds.length === 0}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {t.batchExport.queueSelected.replace('{count}', selectedVarIds.length.toString())}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Task List Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {(['all', 'rendering', 'queued', 'ready'] as const).map((status) => {
              const label =
                status === 'all'
                  ? `${t.batchExport.filterAll} (${totalCount})`
                  : status === 'rendering'
                  ? `${t.batchExport.filterRendering} (${renderingCount})`
                  : status === 'queued'
                  ? `${t.batchExport.filterQueued} (${queuedCount})`
                  : `${t.batchExport.filterReady} (${readyCount})`;

              return (
                <button
                  key={status}
                  onClick={() => {
                    soundEngine.playClick();
                    setFilterStatus(status);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    filterStatus === status
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.batchExport.searchJobs}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Queue Task Cards List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[380px] pr-1.5">
          {filteredQueue.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
              <Clock className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-semibold text-slate-300">
                {t.batchExport.noJobsFound}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                {t.batchExport.emptyQueueHint}
              </p>
            </div>
          ) : (
            filteredQueue.map((item, index) => {
              const isRendering = item.status === 'rendering';
              const isReady = item.status === 'ready';
              const isQueued = item.status === 'queued';
              const isPaused = item.status === 'paused';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                    isRendering
                      ? 'bg-indigo-950/20 border-indigo-500/50 shadow-sm'
                      : isReady
                      ? 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-900/50 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isReady
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isRendering
                            ? 'bg-indigo-500/15 text-indigo-400 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.format.includes('PNG') ? (
                          <FileImage className="w-4 h-4" />
                        ) : item.format.includes('Pack') ? (
                          <Archive className="w-4 h-4" />
                        ) : (
                          <FileVideo className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate max-w-md">
                            {item.title}
                          </span>
                          {item.predictedCtr && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-['JetBrains_Mono'] text-[10px] font-bold">
                              {item.predictedCtr}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-['JetBrains_Mono'] mt-0.5">
                          <span>{item.format}</span>
                          <span>·</span>
                          <span>{item.aspectRatio}</span>
                          {item.size && (
                            <>
                              <span>·</span>
                              <span>{item.size}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Individual Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isReady && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-['JetBrains_Mono'] text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.batchExport.statusReady}</span>
                        </span>
                      )}

                      {isRendering && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-['JetBrains_Mono'] text-[11px] font-semibold flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                          <span>
                            {t.batchExport.statusRendering} ({item.progress}%)
                          </span>
                        </span>
                      )}

                      {isQueued && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-['JetBrains_Mono'] text-[11px] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{t.batchExport.statusQueued}</span>
                        </span>
                      )}

                      {isPaused && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-['JetBrains_Mono'] text-[11px] font-semibold flex items-center gap-1">
                          <Pause className="w-3 h-3" />
                          <span>{t.batchExport.statusPaused}</span>
                        </span>
                      )}

                      {/* Single Action: Play / Pause */}
                      {isQueued && (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            updateExportItem(item.id, { status: 'rendering', progress: 10 });
                            setIsBatchRunning(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Start this item immediately"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isRendering && (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            updateExportItem(item.id, { status: 'paused' });
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Pause this item"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Download File */}
                      {isReady && (
                        <button
                          onClick={async () => {
                            soundEngine.playClick();
                            if (item.url) {
                              const a = document.createElement('a');
                              a.href = item.url;
                              a.download = item.title;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            } else {
                              const canvas = (document.getElementById('adcraft-export-canvas') || document.querySelector('canvas')) as HTMLCanvasElement | null;
                              if (canvas) {
                                await exportCanvasSnapshot({
                                  canvasElement: canvas,
                                  aspectRatio: item.aspectRatio,
                                  format: 'PNG',
                                  title: item.title.replace(/\.[^/.]+$/, '')
                                });
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                          title="Download item"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                      )}

                      {/* Retry / Re-render */}
                      {(isReady || isPaused) && (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            updateExportItem(item.id, { status: 'queued', progress: 0 });
                            setIsBatchRunning(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Re-render item"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete / Remove */}
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          removeExportItem(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Progress Bar (Visible when in progress or queued) */}
                  {(isRendering || isQueued || isPaused) && (
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isRendering
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                            : isPaused
                            ? 'bg-amber-500/60'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-['JetBrains_Mono']">
            <span>{totalCount} {language === 'tr' ? 'görev kuyrukta' : 'jobs in queue'}</span>
            <span>·</span>
            <span>{readyCount} {language === 'tr' ? 'tamamlandı' : 'completed'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              {language === 'tr' ? 'Kapat' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
