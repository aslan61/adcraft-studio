import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  FolderPlus,
  Cloud,
  Check,
  RotateCw,
  Folder,
  Crown,
  LogIn,
  Play,
  User as UserIcon,
  Trash2,
  Keyboard,
  History,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { useAuthStore } from '../store/useAuthStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

interface HeaderProps {
  onSearchOpen?: () => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  const { t, language, setLanguage } = useTranslation();
  const {
    theme,
    toggleTheme,
    workspaceName,
    projectName,
    setProjectName,
    setCurrentProjectId,
    credits,
    setCredits,
    aspectRatio,
    setAspectRatio,
    searchQuery,
    setSearchQuery,
    saveProjectToServer,
    loadProjectsFromServer,
    deleteProjectFromServer,
    loadCampaignsFromCloud,
    deleteCampaignFromCloud,
    loadProject,
    versions,
    setVersionHistoryModalOpen
  } = useAdCraftStore();

  const {
    user,
    profile,
    setAuthModalOpen,
    setPricingModalOpen,
    setAccountModalOpen,
    setRewardedAdModalOpen,
    getRemainingDailyAds
  } = useAuthStore();

  const activeCredits = profile?.credits ?? credits;

  const [showNotification, setShowNotification] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [serverProjects, setServerProjects] = useState<any[]>([]);
  const [cloudCampaigns, setCloudCampaigns] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(projectName);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  // Close project dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setShowProjectMenu(false);
        setIsEditingName(false);
      }
    };
    if (showProjectMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectMenu]);

  // Load server projects and Firestore cloud campaigns when menu opens
  const handleOpenProjectMenu = async () => {
    soundEngine.playClick();
    setShowProjectMenu((prev) => !prev);
    if (!showProjectMenu) {
      setIsLoadingProjects(true);
      try {
        const [list, cloudList] = await Promise.all([
          loadProjectsFromServer(),
          user ? loadCampaignsFromCloud() : Promise.resolve([])
        ]);
        setServerProjects(list || []);
        setCloudCampaigns(cloudList || []);
      } catch {
        // graceful offline fallback
      } finally {
        setIsLoadingProjects(false);
      }
    }
  };

  const handleSaveProject = async () => {
    soundEngine.playWhoosh();
    setIsSaving(true);
    try {
      const ok = await saveProjectToServer();
      if (ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        const [list, cloudList] = await Promise.all([
          loadProjectsFromServer(),
          user ? loadCampaignsFromCloud() : Promise.resolve([])
        ]);
        setServerProjects(list || []);
        setCloudCampaigns(cloudList || []);
      }
    } catch {
      // fallback
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewProject = () => {
    soundEngine.playSuccess();
    const newName = `Ad Campaign ${Date.now().toString().slice(-4)}`;
    setProjectName(newName);
    setCurrentProjectId(null);
    setShowProjectMenu(false);
  };

  const handleSelectProject = (proj: any) => {
    soundEngine.playClick();
    loadProject(proj);
    setShowProjectMenu(false);
  };

  const handleSaveName = () => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <>
      <header
        id="adcraft-header"
        className="fixed top-0 left-72 right-0 h-16 bg-[#090C13]/85 backdrop-blur-2xl z-40 px-6 flex items-center justify-between border-b border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.4)] select-none"
      >
        {/* Left: Project Selector & Search */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative shrink-0" ref={projectMenuRef}>
            <div
              onClick={handleOpenProjectMenu}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/[0.08] text-white text-xs font-semibold cursor-pointer hover:bg-slate-800/80 hover:border-indigo-500/40 shadow-sm transition-all"
              title={`${workspaceName} / ${projectName}`}
            >
              <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[160px] lg:max-w-[190px]">
                {projectName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${showProjectMenu ? 'rotate-180' : ''}`} />
            </div>

            {/* Project Switcher Dropdown */}
            {showProjectMenu && (
              <div className="absolute left-0 mt-2 w-80 rounded-xl bg-[#0F131D] border border-white/[0.1] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 font-['Geist'] backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-xs font-semibold text-white">{t.header.campaignProjects}</span>
                  <button
                    onClick={handleCreateNewProject}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] font-medium transition-all"
                  >
                    <FolderPlus className="w-3 h-3" />
                    <span>{t.header.newCampaign}</span>
                  </button>
                </div>

                {/* Current Project Name & Edit */}
                <div className="py-2.5 border-b border-slate-800 flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {language === 'tr' ? 'Aktif Proje' : 'Active Project'}
                  </span>
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tempProjectName}
                        onChange={(e) => setTempProjectName(e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-slate-950 border border-indigo-500 text-xs text-white focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      />
                      <button
                        onClick={handleSaveName}
                        className="px-2 py-1 rounded bg-indigo-600 text-white text-xs font-medium"
                      >
                        {t.common.save}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-xs font-semibold text-white truncate">{projectName}</span>
                      <button
                        onClick={() => {
                          setTempProjectName(projectName);
                          setIsEditingName(true);
                        }}
                        className="text-[11px] text-indigo-400 hover:underline"
                      >
                        {language === 'tr' ? 'Yeniden Adlandır' : 'Rename'}
                      </button>
                    </div>
                  )}

                  {/* Save to Cloud Button */}
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="mt-1 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">{t.header.savedToCloud}</span>
                      </>
                    ) : (
                      <>
                        <Cloud className={`w-3.5 h-3.5 text-cyan-400 ${isSaving ? 'animate-pulse' : ''}`} />
                        <span>{isSaving ? t.header.syncing : t.header.saveToCloud}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Saved Campaigns List */}
                <div className="pt-2 flex flex-col gap-1 max-h-56 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {t.header.cloudCampaigns}
                    </span>
                    {user && (
                      <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" />
                        Firestore
                      </span>
                    )}
                  </div>

                  {isLoadingProjects ? (
                    <div className="flex items-center justify-center py-4 text-xs text-slate-500 gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>{t.header.loadingCampaigns}</span>
                    </div>
                  ) : cloudCampaigns.length === 0 && serverProjects.length === 0 ? (
                    <span className="text-xs text-slate-500 italic py-2 text-center">
                      {t.header.noCloudCampaigns}
                    </span>
                  ) : (
                    <>
                      {/* Cloud Campaigns (Firestore) */}
                      {cloudCampaigns.map((c) => (
                        <div
                          key={`cloud-${c.id}`}
                          onClick={() => handleSelectProject(c)}
                          className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                            c.name === projectName
                              ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <Cloud className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="text-xs font-medium truncate">{c.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-['JetBrains_Mono'] truncate pl-4">
                              {c.aspectRatio || '9:16'} • {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {c.name === projectName && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                soundEngine.playClick();
                                if (window.confirm(language === 'tr' ? 'Bu kampanyayı buluttan silmek istiyor musunuz?' : 'Delete this campaign from cloud?')) {
                                  await deleteCampaignFromCloud(c.id);
                                  setCloudCampaigns((prev) => prev.filter((item) => item.id !== c.id));
                                }
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                              title={t.common.delete}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Server In-Memory Projects (if not in cloud) */}
                      {serverProjects
                        .filter((sp) => !cloudCampaigns.some((cc) => cc.name === sp.name))
                        .map((p) => (
                          <div
                            key={`srv-${p.id}`}
                            onClick={() => handleSelectProject(p)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                              p.name === projectName
                                ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="text-xs font-medium truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-500 font-['JetBrains_Mono']">
                                {new Date(p.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {p.name === projectName && (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  soundEngine.playClick();
                                  if (window.confirm(language === 'tr' ? 'Bu projeyi silmek istiyor musunuz?' : 'Delete this project?')) {
                                    await deleteProjectFromServer(p.id);
                                    setServerProjects((prev) => prev.filter((item) => item.id !== p.id));
                                  }
                                }}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={t.common.delete}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F131D]/90 border border-white/[0.08] text-slate-400 w-28 sm:w-36 md:w-40 lg:w-48 xl:w-56 focus-within:w-64 hover:border-white/20 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-inner">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                id="global-search-input"
                type="text"
                placeholder={t.header.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none w-full font-['Geist'] truncate"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white shrink-0">
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/[0.08] text-slate-400 font-['JetBrains_Mono'] text-[10px] shrink-0">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live GPU Worker Node */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E121C] border border-white/[0.08] text-xs font-['JetBrains_Mono'] shadow-sm shrink-0 whitespace-nowrap">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-slate-300 font-medium text-[11px] whitespace-nowrap">{t.header.gpuNodeOnline}</span>
          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25 tracking-wide shrink-0">
            A100 CLUSTER
          </span>
        </div>

        {/* Right: Language, Credits, Aspect ratio shortcuts, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Switcher Badge */}
          <div
            id="header-language-toggle"
            className="flex items-center bg-[#0F131D] border border-white/[0.08] rounded-xl p-0.5 shadow-inner gap-0.5 shrink-0"
            title={t.common.switchLanguage}
          >
            <div className="pl-1.5 pr-1 text-slate-500">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <button
              id="lang-btn-tr"
              onClick={() => {
                soundEngine.playClick();
                setLanguage('tr');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-['JetBrains_Mono'] transition-all cursor-pointer ${
                language === 'tr'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TR
            </button>
            <button
              id="lang-btn-en"
              onClick={() => {
                soundEngine.playClick();
                setLanguage('en');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-['JetBrains_Mono'] transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle Button (Dark / Light) */}
          <button
            id="header-theme-toggle"
            onClick={() => {
              soundEngine.playClick();
              toggleTheme();
            }}
            className="flex items-center justify-center p-2 rounded-xl bg-[#0F131D] hover:bg-slate-800/80 border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-inner group"
            title={
              theme === 'dark'
                ? (language === 'tr' ? 'Açık Temaya Geç' : 'Switch to Light Theme')
                : (language === 'tr' ? 'Koyu Temaya Geç' : 'Switch to Dark Theme')
            }
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400 group-hover:-rotate-12 transition-transform shrink-0" />
            )}
          </button>

          {/* Credits Counter & Free Ad Reward */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div
              onClick={() => {
                soundEngine.playClick();
                setRewardedAdModalOpen(true);
              }}
              className="flex items-center bg-[#0F131D] border border-white/[0.08] hover:border-emerald-500/40 rounded-full p-1 pl-2.5 gap-1.5 shadow-inner cursor-pointer transition-colors shrink-0"
              title={language === 'tr' ? 'Kredi Kazanmak İçin Tıklayın' : 'Click to Earn Credits'}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-white whitespace-nowrap">
                {activeCredits} <span className="hidden xl:inline">{t.header.credits}</span>
              </span>
              <button
                id="get-more-credits-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playClick();
                  setRewardedAdModalOpen(true);
                }}
                className="px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                + {language === 'tr' ? 'Kazan' : 'Earn'}
              </button>
            </div>

            {/* Watch Rewarded Ad & Earn Credits Button */}
            <button
              id="header-watch-ad-btn"
              onClick={() => {
                soundEngine.playClick();
                setRewardedAdModalOpen(true);
              }}
              className="hidden 2xl:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#0F131D] hover:bg-slate-800/90 border border-white/[0.08] hover:border-white/20 text-slate-200 text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer group shrink-0"
              title={language === 'tr' ? '15 Saniye Sponsor Reklamı İzle ve +50 AI Kredisi Kazan' : 'Watch 15s Sponsor Ad and Earn +50 AI Credits'}
            >
              <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Play className="w-2.5 h-2.5 fill-current" />
              </div>
              <span className="font-semibold text-xs tracking-tight whitespace-nowrap">
                +50 <span className="hidden xl:inline">{language === 'tr' ? 'Kredi' : 'Credits'}</span>
              </span>
              <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/[0.06] shrink-0">
                {getRemainingDailyAds()}/5
              </span>
            </button>
          </div>

          {/* Quick Platform Ratios */}
          <div className="hidden 2xl:flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 font-['JetBrains_Mono'] text-[11px] shrink-0">
            <button
              onClick={() => {
                soundEngine.playClick();
                setAspectRatio('9:16');
              }}
              className={`px-2 py-0.5 rounded transition-colors ${
                aspectRatio === '9:16'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16 TikTok
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setAspectRatio('1:1');
              }}
              className={`px-2 py-0.5 rounded transition-colors ${
                aspectRatio === '1:1'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1 Feed
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setAspectRatio('16:9');
              }}
              className={`px-2 py-0.5 rounded transition-colors ${
                aspectRatio === '16:9'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9 YT
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setAspectRatio('2:3');
              }}
              className={`px-2 py-0.5 rounded transition-colors ${
                aspectRatio === '2:3'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2:3 Store
            </button>
          </div>

          {/* Version History Button */}
          <button
            id="header-version-history-btn"
            onClick={() => {
              soundEngine.playClick();
              setVersionHistoryModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-medium transition-all shadow-sm group cursor-pointer shrink-0"
            title={t.versionHistory.title}
          >
            <History className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-[-30deg] transition-transform shrink-0" />
            <span className="hidden 2xl:inline font-semibold whitespace-nowrap">{language === 'tr' ? 'Sürümler' : 'Versions'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              {versions.length}
            </span>
          </button>

          {/* Keyboard Shortcuts Quick Guide */}
          <button
            id="header-shortcuts-btn"
            onClick={() => {
              soundEngine.playClick();
              if (onOpenShortcuts) {
                onOpenShortcuts();
              } else {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
            title={language === 'tr' ? 'Klavye Kısayolları Kılavuzu (?)' : 'Keyboard Shortcuts Guide (?)'}
          >
            <Keyboard className="w-4 h-4 shrink-0" />
          </button>

          {/* Notifications */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B0E15]" />
            </button>

            {showNotification && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0A0D15]/95 border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-xs font-semibold text-white">{t.header.notifications}</span>
                  <button onClick={() => setShowNotification(false)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2 flex flex-col gap-2">
                  <div className="p-2.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">{t.header.adPackFinished}</span>
                      <span className="text-[11px] text-slate-400">
                        {t.header.adPackFinishedDesc}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">{t.header.gpuNodeBoost}</span>
                      <span className="text-[11px] text-slate-400">
                        {t.header.gpuNodeBoostDesc}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div
              onClick={() => {
                soundEngine.playClick();
                setAccountModalOpen(true);
              }}
              className="relative flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 cursor-pointer transition-all group shrink-0"
            >
              <div className="relative shrink-0">
                {user.photoURL ? (
                  <img
                    alt={user.displayName || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 group-hover:border-indigo-500 transition-colors"
                    src={user.photoURL}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold border border-slate-700">
                    {(user.displayName || user.email || 'A').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B0E15]" />
              </div>

              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                  {user.displayName || user.email?.split('@')[0] || (language === 'tr' ? 'Kullanıcı' : 'User')}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase leading-none mt-0.5 tracking-wide whitespace-nowrap">
                  {language === 'tr' ? 'Tam Erişim' : 'Full Access'}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'tr' ? 'Giriş Yap' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
};
