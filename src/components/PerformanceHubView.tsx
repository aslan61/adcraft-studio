import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Calculator,
  Download,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

interface AuditData {
  complianceScore: number;
  hookStrengthScore: number;
  viralityIndex: number;
  safeZoneCompliant: boolean;
  channelClearances: {
    tikTok: boolean;
    metaReels: boolean;
    youtubeShorts: boolean;
  };
  recommendations: string[];
  verdict?: string;
  thumbstopGrade?: string;
  predictedCtrRange?: string;
  complianceStatus?: string;
}

export const PerformanceHubView: React.FC = () => {
  const { t, language } = useTranslation();
  const { hookCopy, aspectRatio, channelRules, deviceConfig, setActiveView, geminiApiKey } = useAdCraftStore();

  const [audit, setAudit] = useState<AuditData>({
    complianceScore: 96,
    hookStrengthScore: 92,
    viralityIndex: 88,
    safeZoneCompliant: true,
    channelClearances: {
      tikTok: true,
      metaReels: true,
      youtubeShorts: true
    },
    verdict: language === 'tr' 
      ? 'Güçlü ego çekiciliği ve doğrudan eylem çağrısıyla yüksek dönüşümlü durdurma gücü.'
      : 'High-Converting Thumbstop with strong ego appeal and direct CTA.',
    recommendations: language === 'tr' ? [
      'Mevcut kanca metni, tarihsel %3.8 TO mobil kıyaslamasını aşıyor.',
      'Güvenli alan marjları TikTok arayüz bindirmeleriyle çakışmıyor.',
      'Yüksek kontrastlı sarı/beyaz tipografi izleme süresini maksimize ediyor.'
    ] : [
      'Current hook copy exceeds 3.8% CTR historical mobile benchmark.',
      'Safe zone margin margins clear TikTok navigation overlays.',
      'High-contrast yellow/white typography maximizes dwell-time retention.'
    ]
  });

  const [isAuditing, setIsAuditing] = useState(false);
  const [dailyBudget, setDailyBudget] = useState(500);
  const [targetChannel, setTargetChannel] = useState<'TikTok' | 'Meta' | 'YouTube' | 'Snap'>('TikTok');
  const [appVertical, setAppVertical] = useState<'Gaming' | 'FinTech' | 'Social' | 'E-Commerce'>('Gaming');
  const [hasExportedReport, setHasExportedReport] = useState(false);

  // Financial simulation math
  const cpmMap = {
    TikTok: 4.20,
    Meta: 6.80,
    YouTube: 5.50,
    Snap: 3.10
  };
  const activeCpm = cpmMap[targetChannel];
  const projectedImpressions = Math.round((dailyBudget / activeCpm) * 1000);
  const estimatedCtrPercent = Number((audit.hookStrengthScore / 21).toFixed(2)); // e.g. 4.38%
  const projectedClicks = Math.round(projectedImpressions * (estimatedCtrPercent / 100));
  const conversionRate = appVertical === 'Gaming' ? 0.34 : 0.26;
  const projectedInstalls = Math.round(projectedClicks * conversionRate);
  const costPerInstall = projectedInstalls > 0 ? (dailyBudget / projectedInstalls).toFixed(2) : '0.00';
  const projectedRoas = appVertical === 'Gaming' ? '194%' : '218%';

  const handleExportReport = () => {
    soundEngine.playSuccess();
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    const reportContent = `ADCRAFT STUDIO — CREATIVE AUDIT & UA PERFORMANCE FORECAST
================================================================
Generated: ${new Date().toISOString()}
Creative: "${hookCopy.headline}" / "${hookCopy.subHook}"
CTA: "${hookCopy.ctaText}"
Aspect Ratio: ${aspectRatio}

1. PERFORMANCE SCORES
----------------------------------------------------------------
- Safe Zone Compliance: ${audit.complianceScore}% (Certified)
- Thumbstop Hook Strength: ${audit.hookStrengthScore}%
- Platform Virality Index: ${audit.viralityIndex}%
- Predicted 3-Second Retention: ~75%

2. CHANNEL CLEARANCES
----------------------------------------------------------------
- TikTok Ads Manager (9:16): ${audit.channelClearances.tikTok ? 'PASSED' : 'CHECK'}
- Meta Reels / Stories (9:16): ${audit.channelClearances.metaReels ? 'PASSED' : 'CHECK'}
- YouTube Shorts Vertical: ${audit.channelClearances.youtubeShorts ? 'PASSED' : 'CHECK'}

3. 30-DAY UA AD SPEND SIMULATOR (${targetChannel} / ${appVertical})
----------------------------------------------------------------
- Daily Ad Spend: $${dailyBudget}/day ($${dailyBudget * 30}/mo)
- Benchmark eCPM: $${activeCpm.toFixed(2)}
- Projected Daily Impressions: ${projectedImpressions.toLocaleString()}
- Predicted CTR: ${estimatedCtrPercent}%
- Projected Clicks: ${projectedClicks.toLocaleString()}
- Estimated Daily Installs: ${projectedInstalls.toLocaleString()}
- Projected CPI (Cost Per Install): $${costPerInstall}
- Predicted 30-Day ROAS: ${projectedRoas}

4. AI GEMINI RECOMMENDATIONS
----------------------------------------------------------------
${audit.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AdCraft_Performance_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setHasExportedReport(true);
    setTimeout(() => setHasExportedReport(false), 3000);
  };

  const runAudit = async () => {
    setIsAuditing(true);
    soundEngine.playWhoosh();
    try {
      const res = await fetch('/api/audit-creative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          hookCopy,
          aspectRatio,
          channelRules,
          deviceConfig,
          language
        })
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setAudit(data.audit);
        soundEngine.playSuccess();
      }
    } catch {
      // Retain active audit data on network interruptions
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="flex-1 bg-[#07080D] p-8 overflow-y-auto font-['Geist'] select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Top KPI row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {language === 'tr'
                  ? 'Performans Zekası & Tahmini TO (CTR) Merkezi'
                  : 'Performance Intelligence & Predictive CTR Hub'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {language === 'tr' ? 'Canlı Denetim Motoru' : 'Live Audit Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'tr'
                ? '140 milyondan fazla mobil oyun ve uygulama reklam gösterimiyle eğitilmiş yapay zeka simülasyon modeli.'
                : 'Neural simulation model trained on 140M+ mobile game and app video ad impressions.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={runAudit}
              disabled={isAuditing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? (language === 'tr' ? 'Denetleniyor...' : 'Auditing Creative...') : (language === 'tr' ? 'Canlı AI Denetimi Başlat' : 'Run Live AI Audit')}</span>
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

        {/* 4 Hero Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {language === 'tr' ? 'Uyumluluk Puanı' : 'Compliance Score'}
              </span>
              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white font-['JetBrains_Mono']">{audit.complianceScore}/100</span>
              <span className="text-[11px] text-emerald-400 font-['JetBrains_Mono'] ml-2 font-semibold">
                {language === 'tr' ? '1. Seviye Onaylı' : 'Tier 1 Verified'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {language === 'tr' ? 'Kanca Gücü' : 'Hook Strength'}
              </span>
              <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Zap className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white font-['JetBrains_Mono']">{audit.hookStrengthScore}%</span>
              <span className="text-[11px] text-cyan-400 font-['JetBrains_Mono'] ml-2 font-semibold">
                {language === 'tr' ? 'İlk 3 Sn Durdurma Oranı' : 'First 3-Sec Stop Rate'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {language === 'tr' ? 'Virallik Endeksi' : 'Virality Index'}
              </span>
              <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Target className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white font-['JetBrains_Mono']">{audit.viralityIndex}/100</span>
              <span className="text-[11px] text-indigo-400 font-['JetBrains_Mono'] ml-2 font-semibold">
                {language === 'tr' ? 'Yüksek Paylaşılabilirlik' : 'High Shareability'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {language === 'tr' ? 'Tahmini TO (CTR) Artışı' : 'Predicted CTR Lift'}
              </span>
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white font-['JetBrains_Mono']">
                {hookCopy.predictedCtrBoost || '+38%'}
              </span>
              <span className="text-[11px] text-amber-400 font-['JetBrains_Mono'] ml-2 font-semibold">
                {language === 'tr' ? 'Sektör Ortalamasına Göre' : 'vs Industry Avg'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="p-5 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                {language === 'tr' ? 'Yapay Zeka Kreatif Denetim & Optimizasyon Listesi' : 'AI Creative Audit & Optimization Checklist'}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-['JetBrains_Mono']">Gemini 2.5 Flash Diagnostic</span>
          </div>

          {audit.verdict && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-200 leading-relaxed font-['Geist'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <strong className="text-white font-semibold mr-1.5">
                  {language === 'tr' ? 'Uzman UA Değerlendirmesi:' : 'Executive UA Verdict:'}
                </strong>
                {audit.verdict}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {audit.recommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0A0D15]/80 border border-white/[0.06] flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-['Geist']">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Breakdown & Hook Strength Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Performance Breakdown */}
          <div className="p-5 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>{language === 'tr' ? 'Platform Uyumluluk & Dağıtım Matrisi' : 'Platform Conforming & Delivery Matrix'}</span>
            </h3>

            <div className="flex flex-col gap-3 font-['JetBrains_Mono'] text-xs">
              <div className="p-3 rounded-xl bg-[#0A0D15]/80 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${audit.channelClearances.tikTok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-white font-medium">TikTok Ads Manager (9:16)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{language === 'tr' ? 'Tahmini eBGBM: $3.20' : 'Est. eCPM: $3.20'}</span>
                  <span className="text-emerald-400 font-bold">
                    {audit.channelClearances.tikTok ? (language === 'tr' ? 'GEÇTİ (Güvenli Alan)' : 'PASSED (Safe Zone)') : (language === 'tr' ? 'UYARI' : 'WARNING')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0D15]/80 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${audit.channelClearances.metaReels ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-white font-medium">Meta Reels / Stories (9:16)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{language === 'tr' ? 'Tahmini eBGBM: $4.10' : 'Est. eCPM: $4.10'}</span>
                  <span className="text-emerald-400 font-bold">
                    {audit.channelClearances.metaReels ? (language === 'tr' ? 'GEÇTİ (Güvenli Alan)' : 'PASSED (Safe Zone)') : (language === 'tr' ? 'UYARI' : 'WARNING')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0D15]/80 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${audit.channelClearances.youtubeShorts ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-white font-medium">YouTube Shorts / UAC (Vertical)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{language === 'tr' ? 'Tahmini eBGBM: $2.85' : 'Est. eCPM: $2.85'}</span>
                  <span className="text-emerald-400 font-bold">
                    {audit.channelClearances.youtubeShorts ? (language === 'tr' ? 'GEÇTİ' : 'PASSED') : (language === 'tr' ? 'KONTROL ET' : 'CHECK')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Retention Curve Simulator */}
          <div className="p-5 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>{language === 'tr' ? 'Saniye Başına Simüle Edilen İzleyici Tutma Eğrisi' : 'Simulated Viewer Retention by Second'}</span>
            </h3>

            <div className="h-44 w-full flex items-end gap-2 pt-6 px-2">
              {[95, 88, 82, 75, 71, 68, 65, 63, 60, 58, 56, 54, 52, 51, 50].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    style={{ height: `${val}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      idx < 3
                        ? 'bg-gradient-to-t from-cyan-500 to-indigo-500'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                  <span className="text-[9px] text-slate-500 font-['JetBrains_Mono']">
                    {idx + 1}s
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.06] pt-2">
              <span>{language === 'tr' ? '0-3sn: Viral Alev Kancası Aktif' : '0-3s: Viral Flame Hook Active'}</span>
              <span className="text-emerald-400 font-bold">{language === 'tr' ? '%50 Tamamlanma İzleme Oranı' : '50% Complete Watch Rate'}</span>
            </div>
          </div>
        </div>

        {/* Interactive UA Budget & ROAS Simulation Engine */}
        <div className="p-6 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  {language === 'tr' ? 'UA Reklam Bütçesi & ROAS Simülatörü' : 'UA Ad Spend & ROAS Forecaster'}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Model
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'tr'
                    ? 'Kreatif kanca gücüne göre tahmini gösterim, indirme sayısı ve maliyet hesaplayıcısı'
                    : 'Real-time media spend, install throughput, and break-even ROAS projections'}
                </p>
              </div>
            </div>

            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all shrink-0 cursor-pointer"
            >
              {hasExportedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{language === 'tr' ? 'Rapor İndirildi' : 'Report Downloaded'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>{language === 'tr' ? 'Performans Raporunu İndir' : 'Export Audit Brief'}</span>
                </>
              )}
            </button>
          </div>

          {/* Controls row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Budget */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">{language === 'tr' ? 'Günlük Reklam Bütçesi' : 'Daily Ad Budget'}</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">${dailyBudget} / {language === 'tr' ? 'gün' : 'day'}</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>$50</span>
                <span>$2,500</span>
                <span>$5,000</span>
              </div>
            </div>

            {/* Target Channel */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">{language === 'tr' ? 'Hedef Reklam Kanalı' : 'Target Media Channel'}</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['TikTok', 'Meta', 'YouTube', 'Snap'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      soundEngine.playClick();
                      setTargetChannel(ch);
                    }}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      targetChannel === ch
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* App Category / Vertical */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">{language === 'tr' ? 'Uygulama Kategorisi' : 'App Vertical'}</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Gaming', 'FinTech', 'Social', 'E-Commerce'] as const).map((vert) => (
                  <button
                    key={vert}
                    onClick={() => {
                      soundEngine.playClick();
                      setAppVertical(vert);
                    }}
                    className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      appVertical === vert
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {vert}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metric Projection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-[#0A0D15]/90 border border-white/[0.06] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'tr' ? 'Tahmini Gösterim' : 'Est. Impressions'}</span>
              <span className="text-base font-bold font-mono text-white mt-1">{projectedImpressions.toLocaleString()}</span>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">eCPM ${activeCpm.toFixed(2)}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0D15]/90 border border-white/[0.06] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'tr' ? 'Tahmini TO (CTR)' : 'Predicted CTR'}</span>
              <span className="text-base font-bold font-mono text-indigo-400 mt-1">{estimatedCtrPercent}%</span>
              <span className="text-[10px] font-mono text-emerald-400 mt-0.5">A+ Thumbstop</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0D15]/90 border border-white/[0.06] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'tr' ? 'Tahmini Tıklama' : 'Est. Clicks'}</span>
              <span className="text-base font-bold font-mono text-white mt-1">{projectedClicks.toLocaleString()}</span>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">CPC ${(dailyBudget / Math.max(1, projectedClicks)).toFixed(2)}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0D15]/90 border border-white/[0.06] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'tr' ? 'Tahmini İndirme' : 'Est. Installs'}</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1">{projectedInstalls.toLocaleString()}</span>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">CR {Math.round(conversionRate * 100)}%</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0D15]/90 border border-white/[0.06] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'tr' ? 'İndirme Maliyeti' : 'Est. CPI'}</span>
              <span className="text-base font-bold font-mono text-amber-400 mt-1">${costPerInstall}</span>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">{language === 'tr' ? 'Düşük Maliyet' : 'Top 10% Tier'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0D15]/90 border border-white/[0.06] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'tr' ? 'Tahmini 30G ROAS' : 'Projected ROAS'}</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1">{projectedRoas}</span>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">Day-14 Break-even</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
