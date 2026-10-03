import React from 'react';
import {
  Film,
  FolderSync,
  Sparkles,
  LayoutGrid,
  ListOrdered,
  Sliders,
  HelpCircle,
  Keyboard,
  ChevronDown,
  HardDrive,
  Crown,
  Zap,
  User as UserIcon,
  LogIn,
  Mic,
  History,
  Sun,
  Moon
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { useAuthStore } from '../store/useAuthStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';
import { AdCraftLogo } from './AdCraftLogo';

interface SidebarProps {
  onOpenExportQueue?: () => void;
  onOpenTemplates?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onOpenShortcuts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenExportQueue,
  onOpenTemplates,
  onOpenSettings,
  onOpenHelp,
  onOpenShortcuts
}) => {
  const { t, language } = useTranslation();
  const { theme, toggleTheme, activeNavTab, setActiveNavTab, workspaceName, setActiveView, exportQueue, setVoiceoverModalOpen, versions, setVersionHistoryModalOpen } = useAdCraftStore();
  const { user, profile, setAuthModalOpen, setPricingModalOpen, setAccountModalOpen, setRewardedAdModalOpen } = useAuthStore();

  const navItems = [
    {
      id: 'studio',
      label: t.sidebar.projectsStudio,
      icon: Film,
      badge: null,
      action: () => setActiveView('editor')
    },
    {
      id: 'media-assets',
      label: t.sidebar.mediaAssets,
      icon: FolderSync,
      badge: null,
      action: () => {
        setActiveView('editor');
        const assetEl = document.getElementById('adcraft-asset-library');
        if (assetEl) assetEl.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'ai-generator',
      label: t.sidebar.aiAdGenerator,
      icon: Sparkles,
      badge: 'ping',
      isAi: true,
      action: () => {
        setActiveView('editor');
        const ctrlEl = document.getElementById('adcraft-control-panel');
        if (ctrlEl) ctrlEl.scrollIntoView({ behavior: 'smooth' });
      }
    },
    { id: 'templates', label: t.sidebar.adTemplates, icon: LayoutGrid, badge: null, action: onOpenTemplates },
    {
      id: 'voiceover',
      label: language === 'tr' ? 'Yapay Zekâ Seslendirme' : 'AI Voiceover Studio',
      icon: Mic,
      badge: 'AI',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      action: () => setVoiceoverModalOpen(true)
    },
    {
      id: 'version-history',
      label: language === 'tr' ? 'Sürüm Geçmişi' : 'Version History',
      icon: History,
      badge: `${versions.length}`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      action: () => setVersionHistoryModalOpen(true)
    },
    {
      id: 'export-queue',
      label: t.sidebar.exportQueue,
      icon: ListOrdered,
      badge: exportQueue.length > 0 ? `${exportQueue.length} ${t.sidebar.ready}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      action: onOpenExportQueue
    },
    {
      id: 'reward-center',
      label: language === 'tr' ? 'Ödül Merkezi & Reklamlar' : 'Reward Center & Ads',
      icon: Zap,
      badge: language === 'tr' ? '+50 Kredi' : '+50 Credits',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      action: () => setRewardedAdModalOpen(true)
    },
    { id: 'settings', label: t.sidebar.settings, icon: Sliders, badge: null, action: onOpenSettings }
  ];

  return (
    <aside
      id="adcraft-sidebar"
      className="fixed left-0 top-0 h-full w-72 bg-[#090C13]/95 backdrop-blur-2xl z-50 flex flex-col justify-between border-r border-white/[0.07] shadow-[4px_0_24px_rgba(0,0,0,0.5)] select-none"
    >
      <div className="flex flex-col">
        {/* Bespoke Studio Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06] bg-[#090C13]/80">
          <AdCraftLogo size="md" badgeText="STUDIO" />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-3 pt-5 font-['Geist']">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveNavTab(item.id);
                  if (item.action) item.action();
                }}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent text-white border border-indigo-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)]'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
              >
                {/* Active indicator glowing pill */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.7)]" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${
                      isActive ? 'text-indigo-400' : item.isAi ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge === 'ping' && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                  </span>
                )}

                {item.badge && item.badge !== 'ping' && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Cloud Quota */}
      <div className="flex flex-col gap-3 p-4 border-t border-white/[0.06] bg-[#07080D]/90">
        {/* User Account / Workspace pill */}
        {user ? (
          <div
            onClick={() => {
              soundEngine.playClick();
              setAccountModalOpen(true);
            }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:border-indigo-500/40 shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 truncate">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700 group-hover:border-indigo-500 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                  {(user.displayName || user.email || 'A').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white leading-tight truncate">
                  {user.displayName || user.email?.split('@')[0] || (language === 'tr' ? 'Kullanıcı' : 'User')}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold leading-none mt-0.5 uppercase tracking-wide">
                  {language === 'tr' ? 'Ücretsiz / Tam Erişim' : 'Free / Full Access'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-1" />
          </div>
        ) : (
          <div
            onClick={() => {
              soundEngine.playClick();
              setAuthModalOpen(true);
            }}
            className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/60 transition-all cursor-pointer group shadow-lg shadow-indigo-600/10"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'tr' ? 'Giriş Yap / Kaydol' : 'Sign In / Register'}</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                {language === 'tr' ? '+250 Kredi' : '+250 Credits'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
              {language === 'tr'
                ? 'Buluta kaydet ve renderlarını yönet'
                : 'Save projects and manage renders'}
            </p>
          </div>
        )}

        {/* Cloud Render Cache bar */}
        <div className="flex flex-col gap-1.5 px-1 font-['JetBrains_Mono']">
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span className="uppercase tracking-wider flex items-center gap-1 text-[10px]">
              <HardDrive className="w-3 h-3 text-cyan-400" /> {t.sidebar.cloudCache}
            </span>
            <span className="text-slate-200 font-medium">4.8 / 20 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-[24%]" />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 pt-1 border-t border-white/[0.06]">
          <button
            id="sidebar-theme-toggle-btn"
            onClick={(e) => {
              e.preventDefault();
              soundEngine.playClick();
              toggleTheme();
            }}
            className="flex items-center justify-between px-2 py-1 text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors text-xs font-['Geist'] text-left group cursor-pointer"
            title={
              theme === 'dark'
                ? (language === 'tr' ? 'Açık Temaya Geç' : 'Switch to Light Theme')
                : (language === 'tr' ? 'Koyu Temaya Geç' : 'Switch to Dark Theme')
            }
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400 group-hover:-rotate-12 transition-transform" />
              )}
              <span>
                {language === 'tr'
                  ? (theme === 'dark' ? 'Açık Tema' : 'Koyu Tema')
                  : (theme === 'dark' ? 'Light Theme' : 'Dark Theme')}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {theme === 'dark' ? (language === 'tr' ? 'Koyu' : 'Dark') : (language === 'tr' ? 'Açık' : 'Light')}
            </span>
          </button>

          <button
            id="sidebar-shortcuts-btn"
            onClick={(e) => {
              e.preventDefault();
              soundEngine.playClick();
              if (onOpenShortcuts) onOpenShortcuts();
            }}
            className="flex items-center justify-between px-2 py-1 text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors text-xs font-['Geist'] text-left group"
            title={language === 'tr' ? 'Klavye Kısayolları Kılavuzu (?)' : 'Keyboard Shortcuts Guide (?)'}
          >
            <div className="flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
              <span>{language === 'tr' ? 'Klavye Kısayolları' : 'Keyboard Shortcuts'}</span>
            </div>
            <kbd className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">?</kbd>
          </button>

          <button
            id="sidebar-help-btn"
            onClick={(e) => {
              e.preventDefault();
              soundEngine.playClick();
              if (onOpenHelp) onOpenHelp();
            }}
            className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors text-xs font-['Geist'] text-left"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.sidebar.helpDocs}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
