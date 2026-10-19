import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Zap,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Volume2,
  Sliders,
  Eye,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNotificationStore, QaTestSuiteReport } from '../store/useNotificationStore';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { runCreativeQaTestSuite } from '../utils/creativeQaTester';
import { soundEngine } from '../utils/audioEngine';

export const CreativeQaTestModal: React.FC = () => {
  const {
    isQaTestModalOpen,
    setQaTestModalOpen,
    latestQaReport,
    setLatestQaReport
  } = useNotificationStore();

  const {
    aspectRatio,
    showSafeZones,
    toggleSafeZones,
    audioConfig,
    setAudioConfig,
    hookCopy,
    setHookCopy,
    assets,
    activeAssetId,
    deviceConfig,
    timeline
  } = useAdCraftStore();

  const [isScanning, setIsScanning] = useState(false);

  if (!isQaTestModalOpen) return null;

  const handleRunTests = () => {
    soundEngine.playClick();
    setIsScanning(true);

    setTimeout(() => {
      const report = runCreativeQaTestSuite({
        aspectRatio,
        showSafeZones,
        audioConfig,
        hookCopy,
        assets,
        activeAssetId,
        deviceConfig,
        duration: timeline.totalDuration
      });

      setLatestQaReport(report);
      setIsScanning(false);
      soundEngine.playSuccess();
    }, 600);
  };

  const report = latestQaReport || runCreativeQaTestSuite({
    aspectRatio,
    showSafeZones,
    audioConfig,
    hookCopy,
    assets,
    activeAssetId,
    deviceConfig,
    duration: timeline.totalDuration
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0D111D] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] overflow-hidden font-['Geist'] text-white">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#090C16]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Kreatif Güvenlik ve QA Test Laboratuvarı
              </h3>
              <p className="text-[11px] text-slate-400 font-['JetBrains_Mono']">
                Pre-Flight Ad Compliance & Safe Zones Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Test Ediliyor...' : 'Testi Yeniden Çalıştır'}</span>
            </button>

            <button
              onClick={() => setQaTestModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Top Score Banner & Platform Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Score */}
            <div className="p-4 rounded-2xl bg-[#121625] border border-white/[0.08] flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-bold font-['JetBrains_Mono'] shrink-0 ${getScoreColor(
                  report.overallScore
                )}`}
              >
                <span className="text-xl leading-none">{report.overallScore}</span>
                <span className="text-[10px] font-medium opacity-80">/100</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Kalite Skoru ({report.grade})</span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {report.failedCount === 0
                    ? 'Yayın standartlarına uygun'
                    : `${report.failedCount} kritik hata mevcut`}
                </span>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-['JetBrains_Mono']">
                  <span className="text-emerald-400">{report.passedCount} Geçti</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400">{report.warningCount} Uyarı</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-rose-400">{report.failedCount} Hata</span>
                </div>
              </div>
            </div>

            {/* Platform Badges */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-[#121625] border border-white/[0.08] flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-300">Platform Uyumluluk Durumu</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5">
                  {report.platformCompliance.tikTok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-slate-200">TikTok</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5">
                  {report.platformCompliance.reels ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-slate-200">IG Reels</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5">
                  {report.platformCompliance.shorts ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-slate-200">YT Shorts</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5">
                  {report.platformCompliance.appStore ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-slate-200">App Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Auto-Fix Actions Bar */}
          {(!showSafeZones || audioConfig.isMuted) && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-200 font-medium">
                  Hızlı Düzeltme Önerisi: Güvenli alanları açarak veya sesi açarak test skorunu %100 yapabilirsiniz.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!showSafeZones && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      toggleSafeZones();
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
                  >
                    Kılavuzu Aç
                  </button>
                )}
                {audioConfig.isMuted && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      soundEngine.setMuted(false);
                      setAudioConfig({ isMuted: false, volume: 0.6 });
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
                  >
                    Sesi Aç (%60)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Detailed Test Items List */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Detaylı Denetim Maddeleri ({report.items.length})
            </h4>

            {report.items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#121625] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.status === 'pass' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {item.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    {item.status === 'fail' && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-['JetBrains_Mono'] ${
                      item.status === 'pass'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.status.toUpperCase()} ({item.score}/100)
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {item.message}
                </p>

                {item.recommendation && (
                  <div className="ml-6 mt-1 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[11px] text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Öneri: {item.recommendation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-[#090C16] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-['JetBrains_Mono']">
            Otomatik Test Hatırlatıcı: Aktif (Android Bildirim Paneli ile Bağlı)
          </span>
          <button
            onClick={() => setQaTestModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
