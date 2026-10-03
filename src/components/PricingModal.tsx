import React from 'react';
import {
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  Award,
  Video,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { useTranslation } from '../i18n/translations';
import { soundEngine } from '../utils/audioEngine';

export const PricingModal: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    user,
    profile,
    purchases,
    isPricingModalOpen,
    setPricingModalOpen,
    setRewardedAdModalOpen,
    getRemainingDailyAds
  } = useAuthStore();
  const { credits } = useAdCraftStore();

  if (!isPricingModalOpen) return null;

  const remainingAds = getRemainingDailyAds();
  const activeCredits = profile?.credits ?? credits;
  const pm = t.pricingModal;

  const handleClose = () => {
    soundEngine.playClick();
    setPricingModalOpen(false);
  };

  const handleStartRewardedAd = () => {
    soundEngine.playClick();
    setPricingModalOpen(false);
    setRewardedAdModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 font-['Geist'] text-white">
      <div className="w-full max-w-2xl bg-[#0A0D15]/95 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-6">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            {pm.systemBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2.5">
            {pm.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            {pm.desc}
          </p>
        </div>

        {/* Balance & Daily Quota Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* Current Balance */}
          <div className="p-4 rounded-2xl bg-[#0F131D] border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {pm.currentBalance}
              </span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-2xl font-black text-cyan-400 font-['JetBrains_Mono']">
                  {activeCredits.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">{pm.creditsUnit}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* Daily Ad Limit */}
          <div className="p-4 rounded-2xl bg-[#0F131D] border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {pm.dailyLimit}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-2xl font-black text-emerald-400 font-['JetBrains_Mono']">
                  {remainingAds} / 5
                </span>
                <span className="text-xs text-slate-400 font-medium">{pm.adsUnit}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Featured Big Rewarded Action Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0F131D] border border-white/[0.08] shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
            <div className="text-left w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {pm.featuredTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  {pm.instantCredit}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                {pm.featuredDesc}
              </p>
            </div>

            <button
              id="pricing-watch-ad-direct-btn"
              onClick={handleStartRewardedAd}
              disabled={remainingAds === 0}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-black/40 transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3 h-3 fill-current" />
              </div>
              <span>
                {remainingAds > 0
                  ? pm.startAdBtn
                  : pm.dailyQuotaFull}
              </span>
            </button>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {pm.howItWorksTitle}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0E121C]/80 border border-white/[0.07]">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono mb-2">
                1
              </div>
              <h5 className="text-xs font-bold text-white mb-1">{pm.step1Title}</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {pm.step1Desc}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E121C]/80 border border-white/[0.07]">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono mb-2">
                2
              </div>
              <h5 className="text-xs font-bold text-white mb-1">{pm.step2Title}</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {pm.step2Desc}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E121C]/80 border border-white/[0.07]">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono mb-2">
                3
              </div>
              <h5 className="text-xs font-bold text-white mb-1">{pm.step3Title}</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {pm.step3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Reward History from Firestore */}
        <div className="border-t border-white/[0.08] pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pm.historyTitle}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-['JetBrains_Mono']">
              {pm.historyLive}
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {purchases.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-[#0E121C]/60 border border-white/[0.06] text-center text-xs text-slate-500">
                {pm.noHistory}
              </div>
            ) : (
              purchases.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#0E121C]/80 border border-white/[0.06] flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{item.planName}</span>
                    <span className="text-[10px] text-slate-500 font-['JetBrains_Mono']">
                      {item.invoiceNumber || item.id} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 font-['JetBrains_Mono']">
                      +{item.creditsGranted} {pm.creditsUnit}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      {pm.claimedBadge}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{pm.antiAbuseNotice}</span>
          </div>

          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl bg-[#0F131D] hover:bg-slate-800 text-slate-300 font-semibold transition-colors border border-white/[0.08] cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
