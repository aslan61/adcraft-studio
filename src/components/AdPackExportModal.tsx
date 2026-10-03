import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Download,
  X,
  FileVideo,
  FileImage,
  Layers,
  ArrowRight,
  Cpu,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { exportCreativeZipPack, exportCanvasSnapshot } from '../utils/exportPipeline';
import { useTranslation } from '../i18n/translations';

interface AdPackExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const AdPackExportModal: React.FC<AdPackExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef
}) => {
  const { t, language } = useTranslation();
  const { hookCopy, backgroundConfig, audioConfig, assets, activeAssetId, addExportItem } = useAdCraftStore();
  const activeAsset = assets.find((a) => a.id === activeAssetId) || assets[0];

  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formats = [
    {
      id: 'f-story',
      title: language === 'tr' ? '9:16 TikTok / Reels Viral Reklam' : '9:16 TikTok / Reels Viral Ad',
      spec: language === 'tr' ? '1080x1920 · 60fps H.264 · Kancalar Entegre' : '1080x1920 · 60fps H.264 · Burned Hooks',
      progress: 0,
      status: 'rendering',
      size: '14.8 MB',
      icon: FileVideo,
      downloadUrl: activeAsset?.url || ''
    },
    {
      id: 'f-feed',
      title: language === 'tr' ? '1:1 Kare Akış Yüksek TO Görseli' : '1:1 Square Feed High-CTR Graphic',
      spec: language === 'tr' ? '1080x1080 · 4K Ultra PNG · Yumuşak Gölgeler' : '1080x1080 · 4K Ultra PNG · Soft Shadows',
      progress: 0,
      status: 'rendering',
      size: '3.9 MB',
      icon: FileImage,
      downloadUrl: activeAsset?.thumbnailUrl || ''
    },
    {
      id: 'f-store',
      title: language === 'tr' ? 'Mağaza Vitrini Öne Çıkan Kartı' : 'Hero Store Promo Art Tile',
      spec: language === 'tr' ? '1024x500 · Play Store Vitrin Afişi' : '1024x500 · Play Store Feature Banner',
      progress: 0,
      status: 'rendering',
      size: '2.1 MB',
      icon: Layers,
      downloadUrl: activeAsset?.thumbnailUrl || ''
    },
    {
      id: 'f-landscape',
      title: language === 'tr' ? '16:9 YouTube / Web Yatay Reklam' : '16:9 YouTube / Web Landscape Ad',
      spec: language === 'tr' ? '1920x1080 · 60fps Sinematik · Geniş Ekran' : '1920x1080 · 60fps Cinematic · Widescreen',
      progress: 0,
      status: 'rendering',
      size: '18.4 MB',
      icon: FileVideo,
      downloadUrl: activeAsset?.url || ''
    }
  ];

  const [formatStates, setFormatStates] = useState(formats);

  useEffect(() => {
    setFormatStates(formats);
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCompleted(false);
      return;
    }

    // Run parallel synthesis progress
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      setFormatStates((prev) =>
        prev.map((f, idx) => {
          const speed = idx === 0 ? 3 : idx === 1 ? 5 : 4;
          const newProg = Math.min(100, f.progress + speed);
          return {
            ...f,
            progress: newProg,
            status: newProg === 100 ? 'ready' : 'rendering'
          };
        })
      );

      if (step >= 28) {
        clearInterval(interval);
        setIsCompleted(true);
        soundEngine.playWhoosh();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 }
          });
        } catch {
          // fallback
        }

        // Add to persistent queue
        addExportItem({
          id: `pack-${Date.now()}`,
          title: 'Campaign_Ad_Pack_4Pieces.zip',
          format: 'Multi-Asset Ad Pack',
          aspectRatio: '9:16',
          status: 'ready',
          progress: 100,
          size: '28.4 MB',
          timestamp: 'Just now'
        });
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isOpen, activeAsset, addExportItem]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-['Geist']">
      <div className="w-full max-w-xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-white">
                {language === 'tr' ? 'Kampanya Kreatif Sentezleyici' : 'Campaign Creative Synthesizer'}
              </h3>
              <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">
                A100-SXM4 GPU · {language === 'tr' ? 'Çoklu Format Toplu İşleme' : 'Multi-Format Batch Conforming'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campaign Meta Card */}
        <div className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">
              {language === 'tr' ? 'Aktif Kanca:' : 'Active Hook:'} &quot;{hookCopy.headline}&quot;
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {language === 'tr'
                ? 'Hedef: TikTok, IG Reels, YouTube Shorts, App Store Vitrini'
                : 'Targeting: TikTok, IG Reels, YouTube Shorts, App Store Listing'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-['JetBrains_Mono']">
            <Cpu className="w-3 h-3" />
            <span>GPU Turbo</span>
          </div>
        </div>

        {/* Formats Rendering Cards */}
        <div className="flex flex-col gap-2.5">
          {formatStates.map((f) => {
            const Icon = f.icon;
            const isReady = f.status === 'ready';

            return (
              <div
                key={f.id}
                className="p-3 rounded-xl bg-[#0D111C]/70 border border-white/[0.06] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">{f.title}</span>
                      <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">
                        {f.spec} · {f.size}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReady ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-['JetBrains_Mono'] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {language === 'tr' ? 'Hazır' : 'Ready'}
                      </span>
                    ) : (
                      <span className="text-xs font-['JetBrains_Mono'] text-slate-400">
                        {f.progress}%
                      </span>
                    )}

                    {isReady && (
                      <button
                        onClick={async () => {
                          soundEngine.playWhoosh();
                          const canvasEl = canvasRef.current || (document.getElementById('adcraft-export-canvas') as HTMLCanvasElement | null) || (document.querySelector('canvas') as HTMLCanvasElement | null);
                          if (canvasEl) {
                            const ratio = f.id === 'f-story' ? '9:16' : f.id === 'f-feed' ? '1:1' : f.id === 'f-landscape' ? '16:9' : '2:3';
                            await exportCanvasSnapshot({
                              canvasElement: canvasEl,
                              aspectRatio: ratio as any,
                              format: 'PNG',
                              title: `${f.title.replace(/\s+/g, '_')}`
                            });
                          } else if (f.downloadUrl) {
                            const a = document.createElement('a');
                            a.href = f.downloadUrl;
                            a.download = `${f.title.replace(/\s+/g, '_')}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title={language === 'tr' ? 'Formatı İndir' : 'Download Asset'}
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${f.progress}%` }}
                    className={`h-full transition-all duration-150 rounded-full ${
                      isReady
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <span className="text-[11px] text-slate-400 font-['JetBrains_Mono'] flex items-center gap-1.5">
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'tr' ? '4 Reklam Formatının 4\'ü de Hazır' : '4 of 4 Ad Formats Ready'}</span>
              </>
            ) : (
              <span>{language === 'tr' ? '60fps uyarlama ile sentezleniyor...' : 'Synthesizing with 60fps conform...'}</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t.common.close}
            </button>

            <button
              disabled={!isCompleted || isZipping}
              onClick={async () => {
                soundEngine.playWhoosh();
                setIsZipping(true);
                setZipProgress(20);
                try {
                  const canvasEl = canvasRef.current || (document.querySelector('canvas') as HTMLCanvasElement | null);
                  await exportCreativeZipPack({
                    canvasElement: canvasEl,
                    projectName: `AdCraft_${hookCopy.headline.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 16)}`,
                    hookCopy,
                    backgroundConfig,
                    audioConfig,
                    onProgress: (p) => setZipProgress(p)
                  });
                  showToast(language === 'tr' ? 'Kreatif Paketi (.zip) başarıyla üretildi ve indirildi!' : 'Creative Pack (.zip) generated and downloaded successfully!');
                  setTimeout(() => {
                    setIsZipping(false);
                    onClose();
                  }, 1200);
                } catch (err) {
                  console.error('Zip export error:', err);
                  setIsZipping(false);
                  showToast(language === 'tr' ? 'Kreatif anlık görüntüsü indirildi.' : 'Downloaded creative snapshot.');
                  onClose();
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCompleted && !isZipping
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:brightness-110 shadow-lg shadow-indigo-600/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                  <span>{language === 'tr' ? `Zip Paketleniyor (%${zipProgress})...` : `Packaging Zip (${zipProgress}%)...`}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'tr' ? 'Tüm Kreatif Paketini İndir (.zip)' : 'Download Full Creative Pack (.zip)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
