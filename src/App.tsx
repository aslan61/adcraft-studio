/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SubHeader } from './components/SubHeader';
import { AssetLibrary } from './components/AssetLibrary';
import { CanvasViewport } from './components/CanvasViewport';
import { TimelineSequencer } from './components/TimelineSequencer';
import { ControlPanel } from './components/ControlPanel';
import { AdPackExportModal } from './components/AdPackExportModal';
import { ExportQueueModal } from './components/ExportQueueModal';
import { TemplatesModal } from './components/TemplatesModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpDocsModal } from './components/HelpDocsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { PerformanceHubView } from './components/PerformanceHubView';
import { VariationsView } from './components/VariationsView';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { UserAccountModal } from './components/UserAccountModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { AutoCropModal } from './components/AutoCropModal';
import { VoiceoverStudioModal } from './components/VoiceoverStudioModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { useAdCraftStore } from './store/useAdCraftStore';
import { useAuthStore } from './store/useAuthStore';
import { soundEngine } from './utils/audioEngine';

export default function App() {
  const {
    theme,
    activeView,
    setActiveView,
    togglePlay,
    audioConfig,
    setAudioConfig,
    setCredits,
    setAutoCropModalOpen,
    setVoiceoverModalOpen,
    setVersionHistoryModalOpen
  } = useAdCraftStore();
  const {
    initializeAuth,
    profile,
    setAuthModalOpen,
    setPricingModalOpen,
    setAccountModalOpen,
    setRewardedAdModalOpen
  } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync document root class with selected theme
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Initialize Firebase Auth listener on startup
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  // Sync profile credits if user has an active cloud profile
  useEffect(() => {
    if (profile?.credits !== undefined) {
      setCredits(profile.credits);
    }
  }, [profile?.credits, setCredits]);

  // Modal states
  const [isAdPackModalOpen, setIsAdPackModalOpen] = useState(false);
  const [isExportQueueModalOpen, setIsExportQueueModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Global NLE/DAW keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Close all modals with Escape
      if (e.key === 'Escape') {
        setIsAdPackModalOpen(false);
        setIsExportQueueModalOpen(false);
        setIsTemplatesModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsHelpModalOpen(false);
        setIsShortcutsModalOpen(false);
        setAutoCropModalOpen(false);
        setVoiceoverModalOpen(false);
        setVersionHistoryModalOpen(false);
        setAuthModalOpen(false);
        setPricingModalOpen(false);
        setAccountModalOpen(false);
        setRewardedAdModalOpen(false);
        return;
      }

      // Cmd+K or Ctrl+K: Focus search bar
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Cmd+E or Ctrl+E: Quick Export Ad Pack
      if ((e.metaKey || e.ctrlKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        soundEngine.playClick();
        setIsAdPackModalOpen(true);
        return;
      }

      // ? or Shift + /: Toggle Keyboard Shortcuts Modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        soundEngine.playClick();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Alt+H or Cmd+Shift+H: Version History Snapshots
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'h' || e.key === 'H')) ||
        (e.altKey && (e.key === 'h' || e.key === 'H'))
      ) {
        e.preventDefault();
        soundEngine.playClick();
        setVersionHistoryModalOpen(true);
        return;
      }

      if (isInput) return;

      // Spacebar: Play/Pause timeline
      if (e.code === 'Space') {
        e.preventDefault();
        soundEngine.playClick();
        togglePlay();
      }

      // M key: Mute/Unmute
      if (e.key === 'm' || e.key === 'M') {
        const nextMuted = !audioConfig.isMuted;
        soundEngine.setMuted(nextMuted);
        setAudioConfig({ isMuted: nextMuted, volume: nextMuted ? 0 : (audioConfig.volume || 0.5) });
      }

      // S key: Quick Snapshot current canvas
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const snapshotBtn = document.getElementById('quick-snapshot-btn') as HTMLButtonElement | null;
        if (snapshotBtn) {
          snapshotBtn.click();
        }
      }

      // V key: Quick 60fps Video Export
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        const videoBtn = document.getElementById('quick-video-btn') as HTMLButtonElement | null;
        if (videoBtn) {
          videoBtn.click();
        }
      }

      // View Switcher (1: Editor, 2: Performance, 3: Variations)
      if (e.key === '1') {
        soundEngine.playClick();
        setActiveView('editor');
      } else if (e.key === '2') {
        soundEngine.playClick();
        setActiveView('performance');
      } else if (e.key === '3') {
        soundEngine.playClick();
        setActiveView('variations');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    audioConfig,
    setAudioConfig,
    setActiveView,
    setAutoCropModalOpen,
    setVoiceoverModalOpen,
    setVersionHistoryModalOpen,
    setAuthModalOpen,
    setPricingModalOpen,
    setAccountModalOpen,
    setRewardedAdModalOpen
  ]);

  return (
    <div
      className={`min-h-screen flex antialiased transition-colors duration-200 ${
        theme === 'light' ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#07080D] text-[#E1E2EC]'
      }`}
    >
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        onOpenExportQueue={() => setIsExportQueueModalOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* 2. Main Content Area (Offset by 72px / w-72 sidebar) */}
      <div className="pl-72 flex-1 flex flex-col min-h-screen">
        {/* Fixed Top Bar */}
        <Header onOpenShortcuts={() => setIsShortcutsModalOpen(true)} />

        {/* Studio Sub-Header */}
        <div className="pt-16">
          <SubHeader />
        </div>

        {/* View Switcher: Editor | Performance Hub | Variations */}
        {activeView === 'editor' && (
          <div
            className={`grid grid-cols-12 w-full gap-0 min-h-[calc(100vh-6.5rem)] transition-colors duration-200 ${
              theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-[#07080D]'
            }`}
          >
            {/* Left Rail: Asset Importer & Raw Media Library (25%) */}
            <AssetLibrary />

            {/* Center Column: Interactive Ad Canvas & Sequencer (50%) */}
            <div className="col-span-12 xl:col-span-6 flex flex-col min-h-[calc(100vh-6.5rem)]">
              <CanvasViewport canvasRef={canvasRef} />
              <TimelineSequencer />
            </div>

            {/* Right Rail: AI Generation & Creative Style Controls (25%) */}
            <ControlPanel
              canvasRef={canvasRef}
              onOpenAdPackModal={() => setIsAdPackModalOpen(true)}
            />
          </div>
        )}

        {activeView === 'performance' && <PerformanceHubView />}

        {activeView === 'variations' && (
          <VariationsView onOpenExportQueue={() => setIsExportQueueModalOpen(true)} />
        )}
      </div>

      {/* Interactive Modals */}
      <AdPackExportModal
        isOpen={isAdPackModalOpen}
        onClose={() => setIsAdPackModalOpen(false)}
        canvasRef={canvasRef}
      />

      <ExportQueueModal
        isOpen={isExportQueueModalOpen}
        onClose={() => setIsExportQueueModalOpen(false)}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <HelpDocsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onOpenHelpDocs={() => setIsHelpModalOpen(true)}
      />

      {/* Cloud Authentication & Billing Modals */}
      <AuthModal />
      <PricingModal />
      <UserAccountModal />
      <RewardedAdModal />
      <AutoCropModal />
      <VoiceoverStudioModal />
      <VersionHistoryModal />
    </div>
  );
}
