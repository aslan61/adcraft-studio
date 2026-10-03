import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Award,
  Clock,
  Cloud,
  Loader2,
  LogIn,
  RotateCw
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

// Curated interactive sponsors for rewarded ad simulation
const SPONSORS = [
  {
    id: 'cyberpunk_game',
    title: {
      tr: 'CyberRush 2099: Neo Tokyo',
      en: 'CyberRush 2099: Neo Tokyo'
    },
    tagline: {
      tr: 'Geleceğin Cyberpunk FPS Deneyimi — Şimdi Ücretsiz Oyna!',
      en: 'Next-Gen Cyberpunk FPS Experience — Play Free Now!'
    },
    badge: {
      tr: 'Trend Oyun #1',
      en: 'Trending Game #1'
    },
    rating: '4.9 ★ (120K)',
    cta: {
      tr: 'Şimdi Ücretsiz İndir',
      en: 'Download Free Now'
    },
    url: 'https://google.com',
    accent: 'from-fuchsia-600 via-purple-600 to-indigo-600',
    mesh: 'radial-gradient(circle at 50% 35%, rgba(192, 38, 211, 0.35) 0%, rgba(15, 23, 42, 0.96) 80%)',
    category: 'Mobile Action / FPS'
  },
  {
    id: 'cloud_ai',
    title: {
      tr: 'NeuralRender Cloud Studio',
      en: 'NeuralRender Cloud Studio'
    },
    tagline: {
      tr: 'Bulut tabanlı 8K video render ve yapay zeka GPU kümesi.',
      en: 'Cloud-based 8K video rendering & AI GPU cluster.'
    },
    badge: {
      tr: 'Geliştirici Ödülü',
      en: "Editor's Choice"
    },
    rating: '5.0 ★ (Top Enterprise)',
    cta: {
      tr: 'Bulut GPU Test Et',
      en: 'Test Cloud GPU'
    },
    url: 'https://google.com',
    accent: 'from-cyan-500 via-blue-600 to-indigo-700',
    mesh: 'radial-gradient(circle at 50% 35%, rgba(6, 182, 212, 0.32) 0%, rgba(15, 23, 42, 0.96) 80%)',
    category: 'AI & Cloud Infrastructure'
  },
  {
    id: 'crypto_fintech',
    title: {
      tr: 'AuraPay Global Card',
      en: 'AuraPay Global Card'
    },
    tagline: {
      tr: 'Komisyonsuz uluslararası ödemeler ve %5 nakit iade.',
      en: 'Zero-fee international transactions with 5% instant cashback.'
    },
    badge: {
      tr: 'Fintech 2026',
      en: 'Fintech 2026'
    },
    rating: '4.8 ★ (85K)',
    cta: {
      tr: 'Kartını Hemen Al',
      en: 'Claim Free Card'
    },
    url: 'https://google.com',
    accent: 'from-emerald-500 via-teal-600 to-cyan-700',
    mesh: 'radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.32) 0%, rgba(15, 23, 42, 0.96) 80%)',
    category: 'Digital Banking'
  }
];

const AD_DURATION = 15; // 15 seconds rewarded video

export const RewardedAdModal: React.FC = () => {
  const { t, language } = useTranslation();
  const rm = t.rewardedAdModal;

  const {
    isRewardedAdModalOpen,
    setRewardedAdModalOpen,
    rewardCreditsFromAd,
    getRemainingDailyAds,
    profile,
    user,
    setAuthModalOpen
  } = useAuthStore();
  const { credits } = useAdCraftStore();

  const [timeLeft, setTimeLeft] = useState(AD_DURATION);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [sponsorIndex, setSponsorIndex] = useState(0);

  const sponsor = SPONSORS[sponsorIndex % SPONSORS.length];
  const remainingAds = getRemainingDailyAds();

  const langKey = language === 'en' ? 'en' : 'tr';
  const sponsorTitle = sponsor.title[langKey];
  const sponsorTagline = sponsor.tagline[langKey];
  const sponsorBadge = sponsor.badge[langKey];
  const sponsorCta = sponsor.cta[langKey];

  // Active credits displayed: prioritize live user profile balance from Firestore
  const activeCredits = profile?.credits ?? credits;

  // Reset ad playback state on open
  useEffect(() => {
    if (isRewardedAdModalOpen) {
      setTimeLeft(AD_DURATION);
      setIsPlaying(true);
      setIsCompleted(false);
      setLimitReached(false);
      setIsSyncingFirebase(false);
      setCanSkip(false);
      setSponsorIndex(Math.floor(Math.random() * SPONSORS.length));
    }
  }, [isRewardedAdModalOpen]);

  // Main countdown timer (pauses when user pauses video)
  useEffect(() => {
    if (!isRewardedAdModalOpen || isCompleted || !isPlaying || isSyncingFirebase) return;

    if (timeLeft <= 0) {
      handleCompleteReward();
      return;
    }

    // Allow voluntary skip with warning after 5 seconds
    if (timeLeft <= AD_DURATION - 5 && !canSkip) {
      setCanSkip(true);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRewardedAdModalOpen, timeLeft, isPlaying, isCompleted, canSkip, isSyncingFirebase]);

  // Handle successful completion: triggers Firebase update
  const handleCompleteReward = async () => {
    setIsPlaying(false);
    setIsSyncingFirebase(true);

    try {
      const success = await rewardCreditsFromAd(50, {
        id: sponsor.id,
        title: sponsorTitle
      });

      if (success) {
        setLimitReached(false);
        setIsCompleted(true);
        try {
          confetti({
            particleCount: 130,
            spread: 85,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore canvas-confetti in headless/iframe
        }
      } else {
        setLimitReached(true);
        setIsCompleted(true);
      }
    } catch (err) {
      console.warn('Reward processing notice:', err);
      setIsCompleted(true);
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const handleClose = () => {
    soundEngine.playClick();
    setRewardedAdModalOpen(false);
  };

  const handleTogglePlay = () => {
    soundEngine.playClick();
    setIsPlaying((prev) => !prev);
  };

  const handleToggleMute = () => {
    soundEngine.playClick();
    setIsMuted((prev) => !prev);
  };

  const handleWatchAgain = () => {
    soundEngine.playClick();
    setTimeLeft(AD_DURATION);
    setIsCompleted(false);
    setLimitReached(false);
    setIsPlaying(true);
    setIsSyncingFirebase(false);
    setCanSkip(false);
    setSponsorIndex((prev) => prev + 1);
  };

  if (!isRewardedAdModalOpen) return null;

  const progressPercent = Math.min(100, Math.round(((AD_DURATION - timeLeft) / AD_DURATION) * 100));

  return (
    <div
      id="rewarded-ad-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 font-['Geist'] text-white animate-in fade-in-50"
    >
      <div
        id="rewarded-ad-modal-dialog"
        className="w-full max-w-2xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl relative flex flex-col transition-all"
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#07080D]/90 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-cyan-500/30 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              {rm.badge}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {rm.dailyRemaining} <strong className="text-white">{remainingAds}/5</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              id="ad-audio-toggle-btn"
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? rm.unmute : rm.mute}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Close / Skip button */}
            {isCompleted ? (
              <button
                id="ad-close-btn"
                onClick={handleClose}
                className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            ) : canSkip ? (
              <button
                id="ad-skip-btn"
                onClick={() => {
                  if (window.confirm(rm.skipConfirm)) {
                    handleClose();
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                {rm.skipWithoutReward}
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 font-['JetBrains_Mono']">
                {rm.nonSkippable} ({timeLeft}s)
              </span>
            )}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 transition-all duration-300 ease-linear"
            style={{ width: `${isCompleted ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Stage 1: Active Video Ad Screen */}
        {!isCompleted ? (
          <div
            className="relative p-6 sm:p-8 flex flex-col items-center justify-between min-h-[420px] overflow-hidden text-center select-none"
            style={{ background: sponsor.mesh }}
          >
            {/* Ambient Background Grid Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Top Bar with Badge & Timer */}
            <div className="relative z-10 w-full flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/60 text-xs font-semibold text-slate-300 shadow">
                {sponsorBadge}
              </span>

              {/* Countdown Pill with Live Status */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-semibold font-['JetBrains_Mono'] shadow-md">
                {isSyncingFirebase ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>{rm.syncingFirebase}</span>
                  </>
                ) : (
                  <>
                    <Clock className={`w-3.5 h-3.5 text-indigo-400 ${isPlaying ? 'animate-spin' : ''}`} />
                    <span>
                      {rm.rewardInSeconds} {timeLeft}s
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Video Player Display Card with Interactive Play/Pause */}
            <div className="relative z-10 my-auto py-4 max-w-lg w-full flex flex-col items-center">
              <div
                onClick={handleTogglePlay}
                className="relative group cursor-pointer w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-xl shadow-black/50 mb-4 border border-white/20 transition-transform active:scale-95"
                title={isPlaying ? rm.pauseVideo : rm.playVideo}
              >
                {isPlaying ? (
                  <Award className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
                ) : (
                  <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-current ml-1" />
                )}

                {/* Subtle Play/Pause Overlay Indicator on Hover */}
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white fill-current" />
                  ) : (
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  )}
                </div>
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-[10px] font-['JetBrains_Mono'] text-slate-400 mb-1.5 uppercase">
                {sponsor.category}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {sponsorTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-md">
                {sponsorTagline}
              </p>
              <div className="text-[11px] text-amber-400 font-bold mt-2">
                {sponsor.rating}
              </div>
            </div>

            {/* Bottom Actions & Verification Note */}
            <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/60 bg-slate-950/70 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-5 backdrop-blur-md">
              <div className="text-left text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{rm.sponsorVerification}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {rm.rewardNotice}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Play/Pause Button */}
                <button
                  id="ad-play-pause-btn"
                  onClick={handleTogglePlay}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{rm.pauseVideo}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{rm.playVideo}</span>
                    </>
                  )}
                </button>

                {/* Visit Sponsor CTA */}
                <a
                  id="ad-visit-sponsor-btn"
                  href={sponsor.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <span>{sponsorCta}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Stage 2: Reward Claimed Celebration Screen */
          <div
            id="reward-claimed-celebration-view"
            className="p-8 sm:p-10 text-center flex flex-col items-center justify-center my-auto min-h-[420px] bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950"
          >
            <div
              className={`w-20 h-20 rounded-full ${
                limitReached
                  ? 'bg-amber-500/20 border-2 border-amber-500/60 text-amber-400'
                  : 'bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400'
              } flex items-center justify-center mb-4 shadow-2xl animate-bounce`}
            >
              {limitReached ? <AlertCircle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
            </div>

            <span
              className={`px-3 py-1 rounded-full ${
                limitReached
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              } text-xs font-bold uppercase tracking-wider mb-2`}
            >
              {limitReached ? rm.dailyLimitReached : rm.congrats}
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {limitReached ? rm.dailyLimitReached : rm.creditsLoaded}
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2">
              {limitReached ? rm.dailyLimitReached : rm.successDesc}
            </p>

            {/* Cloud Sync Status Pill */}
            <div className="my-4 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
              {user ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-medium">
                    {rm.firebaseSynced}: <strong className="text-white font-['JetBrains_Mono']">{user.email || user.uid.slice(0, 10)}</strong>
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300 font-medium">
                    {rm.localSession}
                  </span>
                </>
              )}
            </div>

            {/* Credit Balance Card */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 w-full max-w-sm flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{rm.newBalance}</span>
              <span className="text-cyan-400 font-bold font-['JetBrains_Mono'] text-base flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                {activeCredits} {t.header.credits}
              </span>
            </div>

            {/* Guest Sign-In Notice if user is not authenticated */}
            {!user && (
              <div className="mb-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 w-full max-w-sm text-left flex items-start gap-2.5">
                <LogIn className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[11px] text-slate-300">
                    {rm.signInPrompt}
                  </p>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setRewardedAdModalOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                  >
                    {rm.signInBtn} →
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                id="return-to-studio-btn"
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                {rm.returnToStudio}
              </button>

              {remainingAds > 0 && (
                <button
                  id="watch-again-ad-btn"
                  onClick={handleWatchAgain}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{rm.watchAgain}</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-500 mt-4">
              {rm.remainingDailyLimit} <strong className="text-slate-300">{remainingAds}/5</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
