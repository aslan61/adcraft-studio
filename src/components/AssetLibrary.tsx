import React, { useRef, useState } from 'react';
import {
  FolderArchive,
  UploadCloud,
  Store,
  RefreshCw,
  PlayCircle,
  CheckCircle2,
  MoreVertical,
  Wand2,
  FileVideo,
  Image as ImageIcon,
  Flame,
  Crop,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { MediaAsset } from '../types';
import { extractVideoFrames } from '../utils/frameExtractor';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

export const AssetLibrary: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    assets,
    activeAssetId,
    setActiveAssetId,
    selectedFilter,
    setSelectedFilter,
    addAsset,
    removeAsset,
    geminiApiKey,
    autoVisionClassifier,
    toggleAutoVisionClassifier,
    setHookCopy,
    searchQuery,
    setAutoCropModalOpen
  } = useAdCraftStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storeUrl, setStoreUrl] = useState('apps.apple.com/app/neonrider-drift');
  const [isSyncingStore, setIsSyncingStore] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);

  // Filtered Assets by Category Tag and Global Search Query
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedFilter === 'All' || asset.tag === selectedFilter;
    const matchesSearch =
      !searchQuery ||
      !searchQuery.trim() ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Local File Upload
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    soundEngine.playWhoosh();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm)$/i);
      const fileUrl = URL.createObjectURL(file);

      let extracted: string[] = [];
      let durationStr = 'PNG';
      let fpsStr = '60fps';
      let resolvedResolution = '1080x1920';
      let resolvedAspect = '9:16';

      if (isVideo) {
        setIsExtractingFrames(true);
        try {
          const videoMeta = await new Promise<{ w: number; h: number; dur: number }>((res) => {
            const v = document.createElement('video');
            v.src = fileUrl;
            v.onloadedmetadata = () => {
              res({
                w: v.videoWidth || 1080,
                h: v.videoHeight || 1920,
                dur: Math.round(v.duration || 15)
              });
            };
            v.onerror = () => res({ w: 1080, h: 1920, dur: 15 });
          });

          resolvedResolution = `${videoMeta.w}x${videoMeta.h}`;
          const ratio = videoMeta.w / videoMeta.h;
          resolvedAspect = ratio > 1.3 ? '16:9' : ratio > 0.8 ? '1:1' : ratio > 0.6 ? '2:3' : '9:16';
          durationStr = `00:${videoMeta.dur < 10 ? '0' : ''}${videoMeta.dur}`;
          fpsStr = '60fps Conformed';

          extracted = await extractVideoFrames(fileUrl, 3);
        } catch {
          // fallback
        } finally {
          setIsExtractingFrames(false);
        }
      } else {
        try {
          const imgMeta = await new Promise<{ w: number; h: number }>((res) => {
            const img = new Image();
            img.src = fileUrl;
            img.onload = () => {
              res({ w: img.naturalWidth || 1080, h: img.naturalHeight || 1920 });
            };
            img.onerror = () => res({ w: 1080, h: 1920 });
          });
          resolvedResolution = `${imgMeta.w}x${imgMeta.h}`;
          const ratio = imgMeta.w / imgMeta.h;
          resolvedAspect = ratio > 1.3 ? '16:9' : ratio > 0.8 ? '1:1' : ratio > 0.6 ? '2:3' : '9:16';
        } catch {
          // fallback
        }
      }

      // Intelligent Auto-Vision Tag Classification
      let detectedTag: 'Gameplay' | 'UI Walkthrough' | 'Store Art' = 'Gameplay';
      let hookTag = 'Active in Canvas';

      if (autoVisionClassifier) {
        const lowerName = file.name.toLowerCase();
        if (/ui|hud|menu|setting|shop|inventory|popup|dialog|interface|nav/i.test(lowerName)) {
          detectedTag = 'UI Walkthrough';
          hookTag = 'AI Classified (UI)';
        } else if (/store|icon|art|feature|banner|promo|logo|badge|poster|screen|shot/i.test(lowerName)) {
          detectedTag = 'Store Art';
          hookTag = 'AI Classified (Store Art)';
        } else if (/cut|clip|keyframe|hook|trailer|action|teaser|gameplay/i.test(lowerName)) {
          detectedTag = 'Gameplay';
          hookTag = 'AI Classified (Ad Cut)';
        } else {
          detectedTag = isVideo ? 'Gameplay' : 'Store Art';
          hookTag = 'AI Vision Tagged';
        }
      }

      const newAsset: MediaAsset = {
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        url: fileUrl,
        thumbnailUrl: extracted[0] || fileUrl,
        duration: isVideo ? durationStr : 'PNG',
        resolution: resolvedResolution,
        fps: fpsStr,
        tag: detectedTag,
        aspectRatio: resolvedAspect,
        inUseHook: hookTag,
        sizeBytes: file.size,
        extractedFrames: extracted
      };

      addAsset(newAsset);
      setActiveAssetId(newAsset.id);
    }
  };

  // Sync with App Store / Google Play
  const handleStoreSync = async () => {
    if (!storeUrl.trim()) return;
    setIsSyncingStore(true);
    soundEngine.playClick();

    try {
      const res = await fetch('/api/scrape-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({ url: storeUrl })
      });

      const json = await res.json();
      if (json.success && json.data) {
        soundEngine.playWhoosh();
        setHookCopy({
          storeBadge: `${json.data.storeType} · ${json.data.downloads}`,
          starRating: json.data.rating,
          reviewCount: json.data.reviewsCount
        });

        // Add scraped app screenshot
        if (json.data.featuredScreenshot) {
          const scrapedAsset: MediaAsset = {
            id: `store-asset-${Date.now()}`,
            name: `${json.data.title.replace(/\s+/g, '_')}_Hero.png`,
            type: 'image',
            url: json.data.featuredScreenshot,
            thumbnailUrl: json.data.featuredScreenshot,
            duration: 'PNG',
            resolution: '1080x1920',
            fps: '4K Conformed',
            tag: 'Store Art',
            aspectRatio: '9:16',
            inUseHook: 'Scraped Store Art'
          };
          addAsset(scrapedAsset);
          setActiveAssetId(scrapedAsset.id);
        }
      }
    } catch (e) {
      console.warn('Store sync simulated fallback', e);
    } finally {
      setIsSyncingStore(false);
    }
  };

  const getFilterLabel = (filter: 'All' | 'Gameplay' | 'UI Walkthrough' | 'Store Art') => {
    if (language !== 'tr') return filter;
    switch (filter) {
      case 'All': return 'Tümü';
      case 'Gameplay': return 'Oynanış';
      case 'UI Walkthrough': return 'Arayüz Tanıtımı';
      case 'Store Art': return 'Mağaza Görselleri';
    }
  };

  return (
    <aside
      id="adcraft-asset-library"
      className="col-span-12 xl:col-span-3 bg-[#090C13]/95 border-r border-white/[0.06] flex flex-col p-4 gap-4 shadow-xl z-20 select-none overflow-y-auto max-h-[calc(100vh-6.5rem)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderArchive className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white font-['Geist']">
            {language === 'tr' ? 'Varlık Kütüphanesi' : 'Asset Library'}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-[#0F131D] border border-white/[0.08] text-slate-400 font-['JetBrains_Mono'] text-[11px]">
            {assets.length} {language === 'tr' ? 'öge' : 'items'}
          </span>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl studio-btn-primary text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{language === 'tr' ? 'Yükle' : 'Upload'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/mov,video/webm,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Store Sync Pipeline */}
      <div className="flex flex-col gap-1.5 font-['Geist']">
        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {language === 'tr' ? 'Mağaza Eşitleme Hattı' : 'Store Sync Pipeline'}
        </label>
        <div className="flex items-center bg-[#0F131D] border border-white/[0.08] rounded-xl p-1 focus-within:border-indigo-500/80 transition-colors shadow-inner">
          <Store className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder={language === 'tr' ? 'App Store / Google Play URLsi' : 'App Store / Google Play URL'}
            className="bg-transparent border-none text-white text-xs px-2 w-full focus:outline-none placeholder:text-slate-500"
          />
          <button
            onClick={handleStoreSync}
            disabled={isSyncingStore}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20 font-['JetBrains_Mono'] text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingStore ? 'animate-spin' : ''}`} />
            <span>
              {isSyncingStore
                ? (language === 'tr' ? 'Eşitleniyor...' : 'Syncing...')
                : (language === 'tr' ? 'Eşitle' : 'Sync')}
            </span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-2xl p-4 border border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging
            ? 'bg-indigo-950/40 border-indigo-400 scale-[1.02]'
            : 'bg-[#0E121C]/60 border-white/[0.08] hover:border-indigo-500/50 hover:bg-[#0E121C]'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs text-white font-medium">
          {language === 'tr'
            ? 'Ham ekran kayıtlarını veya 4K PNG dosyalarını sürükleyin'
            : 'Drop raw screen recordings or 4K PNGs'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {isExtractingFrames
            ? (language === 'tr' ? 'En iyi kanca kareleri çıkarılıyor...' : 'Extracting top hook frames...')
            : (language === 'tr' ? 'Otomatik 60fps kare hızı uyumlama' : 'Automated 60fps frame rate conforming')}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 font-['JetBrains_Mono'] text-[10px] text-slate-300">
            MP4
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 font-['JetBrains_Mono'] text-[10px] text-slate-300">
            MOV
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 font-['JetBrains_Mono'] text-[10px] text-slate-300">
            PNG
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 font-['JetBrains_Mono'] text-[10px] text-slate-300">
            WEBP
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        {(['All', 'Gameplay', 'UI Walkthrough', 'Store Art'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => {
                soundEngine.playClick();
                setSelectedFilter(filter);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {getFilterLabel(filter)} {filter === 'All' ? `(${assets.length})` : ''}
            </button>
          );
        })}
      </div>

      {/* Assets List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1 min-h-[300px]">
        {filteredAssets.map((asset) => {
          const isActive = activeAssetId === asset.id;

          return (
            <div
              key={asset.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveAssetId(asset.id);
              }}
              className={`relative rounded-xl p-2.5 border transition-all cursor-pointer group ${
                isActive
                  ? 'bg-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-900/20 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-black border border-slate-800">
                  <img
                    alt={asset.name}
                    src={asset.thumbnailUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 backdrop-blur font-['JetBrains_Mono'] text-[9px] text-white">
                    {asset.duration}
                  </span>
                  {asset.type === 'video' && (
                    <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-white truncate font-['Geist']">
                        {asset.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            removeAsset(asset.id);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                          title={language === 'tr' ? 'Varlığı Sil' : 'Delete Asset'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 font-['JetBrains_Mono']">
                      {asset.resolution} · {asset.fps}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-['JetBrains_Mono'] text-[10px] font-medium">
                      {asset.tag}
                    </span>

                    {isActive ? (
                      <span className="font-['JetBrains_Mono'] text-[10px] text-emerald-400 font-medium">
                        {language === 'tr' ? 'Tuvalde Aktif' : 'Active in Canvas'}
                      </span>
                    ) : (
                      <MoreVertical className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
                    )}
                  </div>

                  {/* AI 9:16 Auto-Crop Action Button */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playClick();
                        setActiveAssetId(asset.id);
                        setAutoCropModalOpen(true, asset.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-semibold flex items-center gap-1 transition-all ${
                        asset.cropConfig?.isAutoCropped
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 shadow-sm'
                          : 'bg-slate-800/90 text-slate-300 border border-slate-700/80 hover:bg-indigo-600/30 hover:text-white hover:border-indigo-500/60'
                      }`}
                      title={
                        language === 'tr'
                          ? 'AI ile arayüzü tara ve 9:16 oranında dikey kırp'
                          : 'AI auto-detect UI elements & crop to 9:16'
                      }
                    >
                      <Crop className="w-3 h-3 text-cyan-400" />
                      <span>{asset.cropConfig?.isAutoCropped ? '9:16 Cropped' : 'Auto-Crop (9:16)'}</span>
                    </button>

                    {asset.cropConfig?.isAutoCropped ? (
                      <span className="text-[9px] font-['JetBrains_Mono'] text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                        Reels Safe
                      </span>
                    ) : (
                      (asset.aspectRatio === '16:9' || asset.resolution?.includes('1920x1080') || asset.resolution?.includes('1024x500')) && (
                        <span className="text-[9px] font-['JetBrains_Mono'] text-amber-400/90">
                          16:9 Raw
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Extracted Hook Frames Selection (if available) */}
              {asset.extractedFrames && asset.extractedFrames.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />{' '}
                    {language === 'tr' ? 'Çıkarılan Kanca Kareleri' : 'Extracted Hook Frames'}
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {asset.extractedFrames.map((frame, fIdx) => (
                      <img
                        key={fIdx}
                        src={frame}
                        alt={`Hook Frame ${fIdx + 1}`}
                        title={language === 'tr' ? `Kanca Karesini Seç #${fIdx + 1}` : `Select Hook Frame #${fIdx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playSuccess();
                          const frameAssetId = `frame-${Date.now()}`;
                          addAsset({
                            id: frameAssetId,
                            name: `${asset.name.replace(/\.[^/.]+$/, '')}_keyframe_${fIdx + 1}.png`,
                            type: 'image',
                            url: frame,
                            thumbnailUrl: frame,
                            duration: 'Still',
                            resolution: '1080x1920',
                            fps: '60fps Keyframe',
                            tag: 'Ad Cut',
                            aspectRatio: '9:16',
                            inUseHook: `Active Keyframe #${fIdx + 1}`,
                            sizeBytes: 1800000
                          });
                          setActiveAssetId(frameAssetId);
                        }}
                        className="w-10 h-10 rounded border border-slate-700 hover:border-amber-400 object-cover cursor-pointer hover:scale-105 transition-all"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Feature: Auto-Vision Classifier */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">
                {language === 'tr' ? 'Otomatik Görüntü Sınıflandırıcı' : 'Auto-Vision Classifier'}
              </span>
              <span className="text-[10px] text-slate-400">
                {language === 'tr'
                  ? 'Aksiyon klipleri zafer/yenilgi anlarına göre ayrılır'
                  : 'Action clips split by kill/win moments'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleAutoVisionClassifier}
            className={`px-2 py-0.5 rounded font-['JetBrains_Mono'] text-[10px] font-semibold transition-colors ${
              autoVisionClassifier
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {autoVisionClassifier
              ? (language === 'tr' ? 'Etkin' : 'Enabled')
              : (language === 'tr' ? 'Devre Dışı' : 'Disabled')}
          </button>
        </div>
      </div>
    </aside>
  );
};
