import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Crop,
  Sparkles,
  Sliders,
  CheckCircle,
  X,
  Play,
  RotateCcw,
  Zap,
  Crosshair,
  Shield,
  Layers,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  Info,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { useTranslation } from '../i18n/translations';
import { soundEngine } from '../utils/audioEngine';
import { AutoCropPreset, CropConfig, DetectedInterfaceElement } from '../types';

export const AutoCropModal: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    isAutoCropModalOpen,
    autoCropTargetAssetId,
    setAutoCropModalOpen,
    assets,
    applyAutoCropToAsset,
    resetAssetCrop,
    setActiveAssetId,
    geminiApiKey
  } = useAdCraftStore();

  const targetAsset = assets.find((a) => a.id === autoCropTargetAssetId) || assets[0];

  const [preset, setPreset] = useState<AutoCropPreset>('ai_smart_reels');
  const [focalX, setFocalX] = useState<number>(50);
  const [focalY, setFocalY] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [detectedElements, setDetectedElements] = useState<DetectedInterfaceElement[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [trackingConfidence, setTrackingConfidence] = useState<number>(96);
  const [showTikTokOverlay, setShowTikTokOverlay] = useState<boolean>(true);
  const [showSafeZoneGrid, setShowSafeZoneGrid] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);

  const sourceContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingCropRef = useRef<boolean>(false);

  // Calculate 9:16 normalized width & height
  let srcWidth = 1920;
  let srcHeight = 1080;
  if (targetAsset?.resolution) {
    const match = targetAsset.resolution.match(/(\d+)\s*[xX×]\s*(\d+)/);
    if (match) {
      srcWidth = Math.max(1, parseInt(match[1], 10));
      srcHeight = Math.max(1, parseInt(match[2], 10));
    }
  }
  const sourceRatio = srcWidth / srcHeight;
  const targetRatio = 9 / 16; // 0.5625

  let baseCropW = 100;
  let baseCropH = 100;
  if (sourceRatio > targetRatio) {
    baseCropW = Number(((targetRatio / sourceRatio) * 100).toFixed(2));
    baseCropH = 100;
  } else {
    baseCropW = 100;
    baseCropH = Number(((sourceRatio / targetRatio) * 100).toFixed(2));
  }

  // Clamped crop rectangle
  const currentCropX = Math.max(0, Math.min(100 - baseCropW, Number((focalX - baseCropW / 2).toFixed(2))));
  const currentCropY = Math.max(0, Math.min(100 - baseCropH, Number((focalY - baseCropH / 2).toFixed(2))));

  // Run AI Detection through our server endpoint
  const handleRunAiDetection = useCallback(async (selectedPreset: AutoCropPreset = preset) => {
    if (!targetAsset) return;
    setIsScanning(true);
    soundEngine.playWhoosh();

    try {
      const response = await fetch('/api/ai/auto-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          assetId: targetAsset.id,
          assetUrl: targetAsset.url,
          assetName: targetAsset.name,
          assetResolution: targetAsset.resolution,
          preset: selectedPreset,
          frameDataUrl: targetAsset.extractedFrames?.[0] || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Server AI detection call returned non-200');
      }

      const data = await response.json();
      if (data && data.cropConfig) {
        const cfg: CropConfig = data.cropConfig;
        setFocalX(cfg.focalX);
        setFocalY(cfg.focalY);
        setZoom(cfg.zoom);
        setDetectedElements(cfg.detectedElements || []);
        setAiSummary(cfg.aiSummary || '');
        setTrackingConfidence(cfg.trackingConfidence || 95);
        soundEngine.playSuccess();
      }
    } catch (err) {
      console.warn('AI detection fallback used:', err);
      // Fallback local detection
      setFocalX(50);
      setFocalY(50);
      setZoom(selectedPreset === 'action_priority' ? 1.2 : 1.0);
    } finally {
      setIsScanning(false);
    }
  }, [targetAsset, preset, geminiApiKey]);

  const handlePresetSelect = (p: AutoCropPreset) => {
    soundEngine.playClick();
    setPreset(p);
    if (p === 'action_priority') {
      setZoom(1.2);
      setFocalX(50);
      setFocalY(52);
    } else if (p === 'hud_safe_stack') {
      setZoom(1.05);
      setFocalX(50);
      setFocalY(46);
    } else if (p === 'ai_smart_reels') {
      setZoom(1.0);
      setFocalX(50);
      setFocalY(50);
    }
  };

  const updateFocalFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sourceContainerRef.current) return;
    const rect = sourceContainerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const clickY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const pctX = Number(((clickX / rect.width) * 100).toFixed(1));
    const pctY = Number(((clickY / rect.height) * 100).toFixed(1));
    setFocalX(pctX);
    setFocalY(pctY);
    if (preset !== 'custom') {
      setPreset('custom');
    }
  };

  // Dragging crop window directly on the source visualizer
  const handleSourceMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sourceContainerRef.current) return;
    isDraggingCropRef.current = true;
    updateFocalFromEvent(e);
  };

  const handleSourceMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCropRef.current) return;
    updateFocalFromEvent(e);
  };

  const handleSourceMouseUp = () => {
    if (isDraggingCropRef.current) {
      isDraggingCropRef.current = false;
      soundEngine.playClick();
    }
  };

  const handleApply = () => {
    if (!targetAsset) return;
    const finalCropConfig: CropConfig = {
      isAutoCropped: true,
      preset,
      targetRatio: '9:16',
      cropRect: {
        x: currentCropX,
        y: currentCropY,
        width: baseCropW,
        height: baseCropH
      },
      focalX,
      focalY,
      zoom,
      detectedElements,
      aiSummary:
        aiSummary ||
        `9:16 AI crop centered at X:${focalX}%, Y:${focalY}% with ${zoom}x zoom for TikTok/Reels feed.`,
      trackingConfidence,
      safeZoneCompliant: true
    };

    applyAutoCropToAsset(targetAsset.id, finalCropConfig);
    setActiveAssetId(targetAsset.id);
    soundEngine.playSuccess();
    setAutoCropModalOpen(false);
  };

  const handleReset = () => {
    if (!targetAsset) return;
    soundEngine.playClick();
    resetAssetCrop(targetAsset.id);
    setAutoCropModalOpen(false);
  };

  // Sync state when target asset or existing cropConfig changes
  useEffect(() => {
    if (!isAutoCropModalOpen || !targetAsset) return;

    if (targetAsset.cropConfig) {
      setPreset(targetAsset.cropConfig.preset || 'ai_smart_reels');
      setFocalX(targetAsset.cropConfig.focalX ?? 50);
      setFocalY(targetAsset.cropConfig.focalY ?? 50);
      setZoom(targetAsset.cropConfig.zoom ?? 1.0);
      setDetectedElements(targetAsset.cropConfig.detectedElements || []);
      setAiSummary(targetAsset.cropConfig.aiSummary || '');
      setTrackingConfidence(targetAsset.cropConfig.trackingConfidence ?? 96);
    } else {
      // Default to smart detection for raw landscape screen recordings
      setPreset('ai_smart_reels');
      setFocalX(50);
      setFocalY(50);
      setZoom(1.0);
      // Auto-trigger analysis if no crop has been made yet
      handleRunAiDetection('ai_smart_reels');
    }
  }, [targetAsset?.id, isAutoCropModalOpen, handleRunAiDetection]);

  if (!isAutoCropModalOpen || !targetAsset) return null;

  return (
    <div
      id="auto-crop-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#07080D]/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-sm">
              <Crop className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-['Geist'] tracking-tight">
                  {t.autoCropModal.title}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-['JetBrains_Mono'] text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {t.autoCropModal.badge}
                </span>
                <span className="text-[11px] text-slate-400 font-['JetBrains_Mono'] hidden sm:inline">
                  {targetAsset.resolution} ({sourceRatio > 1.2 ? '16:9 Widescreen' : 'Recording'})
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {t.autoCropModal.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reanalyze-btn"
              onClick={() => handleRunAiDetection(preset)}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 hover:border-indigo-500 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? t.autoCropModal.analyzing : t.autoCropModal.reanalyzeBtn}</span>
            </button>

            <button
              id="close-autocrop-modal-btn"
              onClick={() => {
                soundEngine.playClick();
                setAutoCropModalOpen(false);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2-Column Visualizer & Controls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Source Screen Recording Visualizer & Draggable Crop Guide (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                {t.autoCropModal.sourceRecording}
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>{language === 'tr' ? 'Arayüz Kutuları' : 'UI Boxes'}</span>
                </label>
                <span className="text-slate-600">|</span>
                <span className="font-['JetBrains_Mono'] text-cyan-400 text-[10px]">
                  Focal: X:{focalX}% Y:{focalY}% · Zoom: {zoom}x
                </span>
              </div>
            </div>

            {/* Interactive Source Recording Canvas Container */}
            <div
              ref={sourceContainerRef}
              onMouseDown={handleSourceMouseDown}
              onMouseMove={handleSourceMouseMove}
              onMouseUp={handleSourceMouseUp}
              className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner cursor-crosshair select-none group"
            >
              {targetAsset.type === 'video' ? (
                <video
                  src={targetAsset.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                <img
                  src={targetAsset.url}
                  alt={targetAsset.name}
                  className="w-full h-full object-contain pointer-events-none"
                />
              )}

              {/* Detected UI Elements Bounding Box Overlays */}
              {showBoundingBoxes &&
                detectedElements.map((el) => {
                  const isAction = el.type === 'action';
                  const isHud = el.type === 'hud';
                  const colorClass = isAction
                    ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-300'
                    : isHud
                    ? 'border-amber-400/80 bg-amber-500/10 text-amber-300'
                    : 'border-purple-400/80 bg-purple-500/10 text-purple-300';

                  return (
                    <div
                      key={el.id}
                      style={{
                        left: `${el.bounds.x}%`,
                        top: `${el.bounds.y}%`,
                        width: `${el.bounds.width}%`,
                        height: `${el.bounds.height}%`
                      }}
                      className={`absolute border-2 rounded pointer-events-none transition-all duration-300 ${colorClass}`}
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-black/90 backdrop-blur font-['JetBrains_Mono'] text-[9px] font-semibold flex items-center gap-1 border border-current shadow">
                        <Crosshair className="w-2.5 h-2.5" />
                        {el.label} ({el.confidence}%)
                      </span>
                    </div>
                  );
                })}

              {/* 9:16 Crop Window Overlay (Draggable & Highlighted) */}
              <div
                style={{
                  left: `${currentCropX}%`,
                  top: `${currentCropY}%`,
                  width: `${baseCropW}%`,
                  height: `${baseCropH}%`
                }}
                className="absolute border border-white/80 rounded-sm pointer-events-none shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-[left,top,width,height] duration-75"
              >
                {/* Rule of thirds grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
                  <div className="border-r border-b border-white/40"></div>
                  <div className="border-r border-b border-white/40"></div>
                  <div className="border-b border-white/40"></div>
                  <div className="border-r border-b border-white/40"></div>
                  <div className="border-r border-b border-white/40"></div>
                  <div className="border-b border-white/40"></div>
                  <div className="border-r border-white/40"></div>
                  <div className="border-r border-white/40"></div>
                  <div></div>
                </div>

                {/* Crop Center Indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center bg-white/10">
                  <div className="w-1 h-1 rounded-full bg-white"></div>
                </div>

                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-slate-900"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-slate-900"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-slate-900"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-slate-900"></div>

                {/* Badge Indicator */}
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/90 text-slate-200 border border-white/20 font-['JetBrains_Mono'] text-[9px] font-medium shadow">
                  9:16 CROP BOX
                </span>
              </div>

              {/* Scanning Ray effect when scanning */}
              {isScanning && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-pulse pointer-events-none flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-xl bg-black/90 border border-cyan-400 text-cyan-300 text-xs font-bold font-['JetBrains_Mono'] shadow-xl">
                    SCANNING INTERFACE...
                  </span>
                </div>
              )}
            </div>

            {/* Click & Drag hint */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {language === 'tr'
                  ? 'Kayıt üzerinde istediğiniz noktaya tıklayarak 9:16 odağını kaydırabilirsiniz.'
                  : 'Click or drag anywhere on the recording to shift the 9:16 focal window.'}
              </span>
              <span className="font-['JetBrains_Mono'] text-emerald-400 text-[10px] font-medium">
                {t.autoCropModal.confidence}: {trackingConfidence}%
              </span>
            </div>

            {/* AI Strategic Analysis Card */}
            {aiSummary && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-200">
                    {language === 'tr' ? 'Gemini AI Vision Analizi' : 'Gemini AI Vision Analysis'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{aiSummary}</p>
              </div>
            )}
          </div>

          {/* Right Column: Live TikTok / Reels 9:16 Phone Simulator & Presets (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Header & Simulator Toggles */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                {t.autoCropModal.tiktokReelsPreview}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTikTokOverlay(!showTikTokOverlay)}
                  className={`px-2 py-1 rounded text-[10px] font-['JetBrains_Mono'] border transition-colors ${
                    showTikTokOverlay
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  TikTok UI
                </button>
                <button
                  type="button"
                  onClick={() => setShowSafeZoneGrid(!showSafeZoneGrid)}
                  className={`px-2 py-1 rounded text-[10px] font-['JetBrains_Mono'] border transition-colors ${
                    showSafeZoneGrid
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Safe Zones
                </button>
              </div>
            </div>

            {/* 9:16 Mobile Phone Simulator Frame */}
            <div className="relative mx-auto w-[220px] sm:w-[240px] aspect-[9/16] rounded-[2rem] p-2 bg-slate-900 border-2 border-slate-700 shadow-2xl shadow-indigo-950/50 flex flex-col overflow-hidden">
              {/* Dynamic Screen Viewport */}
              <div className="relative w-full h-full rounded-[1.6rem] overflow-hidden bg-black flex items-center justify-center">
                {/* Dynamically Cropped Media */}
                <div
                  className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
                  style={{
                    transform: `scale(${zoom}) translate(${(50 - focalX) * 0.7}%, ${(50 - focalY) * 0.7}%)`
                  }}
                >
                  {targetAsset.type === 'video' ? (
                    <video
                      src={targetAsset.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={targetAsset.url}
                      alt={targetAsset.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* TikTok Safe Zone Boundary Guides */}
                {showSafeZoneGrid && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2">
                    {/* Top safe zone: header/search avoidance */}
                    <div className="h-10 border-b border-dashed border-red-500/60 bg-red-500/10 flex items-start justify-center">
                      <span className="font-['JetBrains_Mono'] text-[8px] text-red-300 px-1 bg-black/60 rounded">
                        TOP HEADER DEAD ZONE (14%)
                      </span>
                    </div>

                    {/* Bottom safe zone: caption & sound ticker avoidance */}
                    <div className="h-18 border-t border-dashed border-amber-500/60 bg-amber-500/10 flex items-end justify-center">
                      <span className="font-['JetBrains_Mono'] text-[8px] text-amber-300 px-1 bg-black/60 rounded mb-0.5">
                        CAPTION / AUDIO SAFE ZONE (24%)
                      </span>
                    </div>
                  </div>
                )}

                {/* Realistic TikTok Engagement Overlay Simulator */}
                {showTikTokOverlay && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 text-white">
                    {/* Top Tab Bar */}
                    <div className="flex items-center justify-between text-[10px] font-semibold text-white/90 drop-shadow pt-1">
                      <span className="text-white/60">Following</span>
                      <span className="border-b-2 border-white pb-0.5">For You</span>
                      <span>LIVE</span>
                    </div>

                    {/* Right Side Engagement Rail */}
                    <div className="self-end flex flex-col items-center gap-2.5 mb-14 drop-shadow">
                      {/* Avatar */}
                      <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-[9px]">
                          AG
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 text-[8px] flex items-center justify-center text-white">
                          +
                        </div>
                      </div>

                      {/* Heart */}
                      <div className="flex flex-col items-center">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        <span className="text-[8px] font-bold">142K</span>
                      </div>

                      {/* Comment */}
                      <div className="flex flex-col items-center">
                        <MessageCircle className="w-5 h-5 fill-white/80 text-white" />
                        <span className="text-[8px] font-bold">3.9K</span>
                      </div>

                      {/* Bookmark */}
                      <div className="flex flex-col items-center">
                        <Bookmark className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[8px] font-bold">18K</span>
                      </div>

                      {/* Share */}
                      <div className="flex flex-col items-center">
                        <Share2 className="w-5 h-5 text-white" />
                        <span className="text-[8px] font-bold">9.2K</span>
                      </div>

                      {/* Spinning Vinyl */}
                      <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center animate-spin">
                        <Music2 className="w-3 h-3 text-cyan-400" />
                      </div>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="flex flex-col gap-0.5 drop-shadow pr-10">
                      <span className="text-[10px] font-bold">@ApexGaming · Follow</span>
                      <p className="text-[9px] text-white/90 line-clamp-1">
                        Can you beat level 12? 🔥 #mobilegame #cyberdrift #fyp
                      </p>
                      <div className="flex items-center gap-1 text-[8px] text-white/80">
                        <Music2 className="w-2.5 h-2.5" />
                        <span className="truncate">Original Sound - CyberPulse 808 Phonk</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Presets Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-300">
                {t.autoCropModal.presets}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('ai_smart_reels')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    preset === 'ai_smart_reels'
                      ? 'bg-cyan-500/10 border-cyan-500/80 text-white ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {language === 'tr' ? 'Akıllı Odak' : 'Smart Focus'}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {t.autoCropModal.presetSmartDesc}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('action_priority')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    preset === 'action_priority'
                      ? 'bg-indigo-500/10 border-indigo-500/80 text-white ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5" />
                    {language === 'tr' ? 'Aksiyon Önceliği' : 'Action Zoom'}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {t.autoCropModal.presetActionDesc}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('hud_safe_stack')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    preset === 'hud_safe_stack'
                      ? 'bg-amber-500/10 border-amber-500/80 text-white ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {language === 'tr' ? 'HUD Güvenli' : 'HUD Safe'}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {t.autoCropModal.presetHudDesc}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('custom')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    preset === 'custom'
                      ? 'bg-purple-500/10 border-purple-500/80 text-white ring-1 ring-purple-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" />
                    {language === 'tr' ? 'Özel Ayar' : 'Custom'}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {t.autoCropModal.presetCustomDesc}
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Sliders for Fine Tuning */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2.5">
              {/* Horizontal Pan */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>{t.autoCropModal.focalHorizontal}</span>
                  <span className="font-['JetBrains_Mono'] text-cyan-400">{focalX}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="85"
                  step="1"
                  value={focalX}
                  onChange={(e) => {
                    setFocalX(Number(e.target.value));
                    if (preset !== 'custom') setPreset('custom');
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Vertical Pan */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>{t.autoCropModal.focalVertical}</span>
                  <span className="font-['JetBrains_Mono'] text-cyan-400">{focalY}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="1"
                  value={focalY}
                  onChange={(e) => {
                    setFocalY(Number(e.target.value));
                    if (preset !== 'custom') setPreset('custom');
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Zoom Scale */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>{t.autoCropModal.zoomLevel}</span>
                  <span className="font-['JetBrains_Mono'] text-indigo-400">{zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => {
                    setZoom(Number(e.target.value));
                    if (preset !== 'custom') setPreset('custom');
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06] bg-[#07080D]/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              id="reset-crop-btn"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.autoCropModal.resetCropBtn}</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline font-['JetBrains_Mono']">
              Ratio: 9:16 Vertical
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                setAutoCropModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {language === 'tr' ? 'Vazgeç' : 'Cancel'}
            </button>

            <button
              id="apply-auto-crop-btn"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-white" />
              <span>{t.autoCropModal.applyCropBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
