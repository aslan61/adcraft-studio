import React, { useEffect, useState } from 'react';
import {
  X,
  User as UserIcon,
  Crown,
  Sparkles,
  Play,
  Zap,
  LogOut,
  Receipt,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Cloud,
  Folder,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { useTranslation } from '../i18n/translations';
import { soundEngine } from '../utils/audioEngine';

export const UserAccountModal: React.FC = () => {
  const { language } = useTranslation();
  const {
    user,
    profile,
    purchases,
    isAccountModalOpen,
    setAccountModalOpen,
    setRewardedAdModalOpen,
    signOut,
    loadPurchases
  } = useAuthStore();

  const {
    loadCampaignsFromCloud,
    deleteCampaignFromCloud,
    loadProject
  } = useAdCraftStore();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'rewards'>('campaigns');
  const [cloudCampaigns, setCloudCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  useEffect(() => {
    if (isAccountModalOpen && user) {
      loadPurchases();
      setIsLoadingCampaigns(true);
      loadCampaignsFromCloud()
        .then((c) => setCloudCampaigns(c || []))
        .catch(() => setCloudCampaigns([]))
        .finally(() => setIsLoadingCampaigns(false));
    }
  }, [isAccountModalOpen, user, loadPurchases, loadCampaignsFromCloud]);

  if (!isAccountModalOpen || !user) return null;

  const handleClose = () => {
    soundEngine.playClick();
    setAccountModalOpen(false);
  };

  const handleOpenRewardedAd = () => {
    soundEngine.playClick();
    setAccountModalOpen(false);
    setRewardedAdModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleOpenCampaign = (campaign: any) => {
    soundEngine.playClick();
    loadProject(campaign);
    setAccountModalOpen(false);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    soundEngine.playClick();
    if (window.confirm(language === 'tr' ? 'Bu kampanyayı silmek istediğinizden emin misiniz?' : 'Delete this campaign?')) {
      const ok = await deleteCampaignFromCloud(campaignId);
      if (ok) {
        setCloudCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      }
    }
  };

  const planName = language === 'tr' ? 'AdCraft Stüdyo (Sınırsız Erişim)' : 'AdCraft Studio (Unlimited Access)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 font-['Geist'] text-white">
      <div className="w-full max-w-xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl relative overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/[0.06]">
          <div className="relative">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Avatar'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {(user.displayName || user.email || 'A').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0A0D15]" />
          </div>

          <div className="flex-1 truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white truncate">
                {user.displayName || (language === 'tr' ? 'AdCraft Stüdyo Kullanıcısı' : 'AdCraft Studio User')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                {language === 'tr' ? 'ÜCRETSİZ / TAM ERİŞİM' : 'FREE / FULL ACCESS'}
              </span>
            </div>
            <span className="text-xs text-slate-400 block truncate font-['JetBrains_Mono']">
              {user.email}
            </span>
          </div>
        </div>

        {/* Plan & Credits Summary Bar */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {language === 'tr' ? 'Erişim Durumu' : 'Access Level'}
              </span>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">{planName}</span>
              </div>
            </div>
            <span className="mt-2 text-[10px] text-slate-400">
              {language === 'tr' ? 'Tüm 4K render özellikleri ve AI şablonları açık' : 'All 4K render features & AI templates unlocked'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {language === 'tr' ? 'Kalan AI Kredisi' : 'Remaining AI Credits'}
              </span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-lg font-black text-cyan-400 font-['JetBrains_Mono']">
                  {(profile?.credits || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenRewardedAd}
              className="mt-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-[11px] font-bold flex items-center justify-center gap-1.5 self-start shadow transition-all active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{language === 'tr' ? '+50 Kredi (Reklam İzle)' : '+50 Credits (Watch Ad)'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-3 border-b border-white/[0.06] pb-2">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'campaigns'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'tr' ? 'Kayıtlı Bulut Projeleri' : 'Cloud Projects'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {cloudCampaigns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'rewards'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'tr' ? 'Ödül & İşlem Geçmişi' : 'Rewards History'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {purchases.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Cloud Campaigns (Firestore) */}
        {activeTab === 'campaigns' && (
          <div className="mb-4">
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {isLoadingCampaigns ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-white/[0.06] text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>{language === 'tr' ? 'Kampanyalar yükleniyor...' : 'Loading campaigns...'}</span>
                </div>
              ) : cloudCampaigns.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0D111C]/60 border border-white/[0.06] text-center text-xs text-slate-500">
                  {language === 'tr'
                    ? 'Henüz kayıtlı bulut kampanyanız yok. Üst bardaki "Buluta Kaydet" butonu ile mevcut tasarımınızı kaydedebilirsiniz.'
                    : 'No saved cloud campaigns yet. Use "Save to Cloud" in the header to save your work.'}
                </div>
              ) : (
                cloudCampaigns.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] hover:border-indigo-500/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex flex-col pr-3 truncate">
                      <div className="flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-white truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-['JetBrains_Mono'] truncate pl-5">
                        {item.aspectRatio || '9:16'} • {item.headline || 'Hook'} • {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenCampaign(item)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{language === 'tr' ? 'Aç' : 'Open'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title={language === 'tr' ? 'Sil' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Rewarded Ads & Purchases History */}
        {activeTab === 'rewards' && (
          <div className="mb-4">
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {purchases.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0D111C]/60 border border-white/[0.06] text-center text-xs text-slate-500">
                  {language === 'tr'
                    ? 'Henüz kayıtlı bir ödül geçmişiniz bulunmuyor. Reklam izleyerek kredi kazanabilirsiniz.'
                    : 'No reward history yet. Watch sponsored ads to claim free credits.'}
                </div>
              ) : (
                purchases.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{item.planName}</span>
                      <span className="text-[10px] text-slate-500 font-['JetBrains_Mono']">
                        {item.invoiceNumber || item.id} • {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-cyan-400 font-['JetBrains_Mono']">
                        +{item.creditsGranted} {language === 'tr' ? 'Kredi' : 'Credits'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {language === 'tr' ? 'Ödül Alındı' : 'Reward Claimed'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'tr' ? 'Firebase Auth & Firestore ile Korunuyor' : 'Protected by Firebase Auth & Firestore'}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/60 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'Çıkış Yap' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
