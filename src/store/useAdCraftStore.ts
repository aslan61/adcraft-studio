import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AspectRatio,
  DeviceConfig,
  HookCopy,
  BackgroundConfig,
  AudioTrackConfig,
  ChannelRules,
  MediaAsset,
  RenderItem,
  ToneArchetype,
  MotionPreset,
  DeviceModel,
  StoryboardData,
  Language,
  ThemeMode,
  CreativeVersion
} from '../types';
import {
  saveUserCampaign,
  getUserCampaigns,
  deleteUserCampaign,
  UserCampaignData
} from '../services/firebase';
import { useAuthStore } from './useAuthStore';

interface AdCraftState {
  // Navigation & View Mode & Localization & Theme
  theme: ThemeMode;
  language: Language;
  activeNavTab: string;
  activeView: 'editor' | 'performance' | 'variations';
  searchQuery: string;
  
  // Workspace Info
  workspaceName: string;
  projectName: string;
  currentProjectId: string | null;
  geminiApiKey: string;
  credits: number;
  autoSyncEnabled: boolean;
  assetId: string;
  
  // Asset Management
  assets: MediaAsset[];
  activeAssetId: string;
  selectedFilter: 'All' | 'Gameplay' | 'UI Walkthrough' | 'Store Art';
  autoVisionClassifier: boolean;

  // Storyboard & Script Direction
  activeStoryboard: StoryboardData | null;

  // Canvas Viewport & Layout
  aspectRatio: AspectRatio;
  deviceConfig: DeviceConfig;
  showSafeZones: boolean;
  canvasZoom: number;

  // Creative Overlays & Copy
  hookCopy: HookCopy;
  backgroundConfig: BackgroundConfig;
  audioConfig: AudioTrackConfig;
  channelRules: ChannelRules;

  // Timeline & Playback
  timeline: {
    currentTime: number;
    totalDuration: number;
    isPlaying: boolean;
    fps: number;
    loop: boolean;
  };

  // Export Pipeline
  exportQueue: RenderItem[];
  isGeneratingAdPack: boolean;
  adPackProgress: number;

  // Auto-Crop Modal & Target
  isAutoCropModalOpen: boolean;
  autoCropTargetAssetId: string | null;

  // AI Voiceover Studio Modal
  isVoiceoverModalOpen: boolean;

  // Version History & Timeline Snapshots
  versions: CreativeVersion[];
  isVersionHistoryModalOpen: boolean;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setActiveNavTab: (tab: string) => void;
  setActiveView: (view: 'editor' | 'performance' | 'variations') => void;
  setWorkspaceName: (name: string) => void;
  setProjectName: (name: string) => void;
  setCurrentProjectId: (id: string | null) => void;
  setCredits: (credits: number) => void;
  toggleAutoSync: () => void;
  
  addAsset: (asset: MediaAsset) => void;
  removeAsset: (id: string) => void;
  setActiveAssetId: (id: string) => void;
  setSelectedFilter: (filter: 'All' | 'Gameplay' | 'UI Walkthrough' | 'Store Art') => void;
  toggleAutoVisionClassifier: () => void;

  // Auto-Crop Actions
  setAutoCropModalOpen: (open: boolean, assetId?: string) => void;
  applyAutoCropToAsset: (assetId: string, crop: any) => void;
  resetAssetCrop: (assetId: string) => void;
  updateAssetCropFocal: (assetId: string, focalX: number, focalY: number, zoom: number) => void;

  // AI Voiceover Studio Actions
  setVoiceoverModalOpen: (open: boolean) => void;

  // Version History Actions
  setVersionHistoryModalOpen: (open: boolean) => void;
  saveSnapshot: (name?: string, note?: string, isAutoSave?: boolean) => string;
  restoreVersion: (versionId: string) => boolean;
  deleteVersion: (versionId: string) => void;

  setAspectRatio: (ratio: AspectRatio) => void;
  setDeviceModel: (model: DeviceModel) => void;
  setDeviceColor: (color: DeviceConfig['color']) => void;
  setDeviceAngles: (angles: Partial<Pick<DeviceConfig, 'yaw' | 'pitch' | 'roll' | 'shadowIntensity'>>) => void;
  setMotionPreset: (preset: MotionPreset) => void;
  toggleSafeZones: () => void;
  setCanvasZoom: (zoom: number | ((prev: number) => number)) => void;

  setHookCopy: (copy: Partial<HookCopy>) => void;
  setToneArchetype: (archetype: ToneArchetype) => void;
  setBackgroundPreset: (preset: BackgroundConfig['preset']) => void;
  setBackgroundConfig: (config: Partial<BackgroundConfig>) => void;
  setAudioConfig: (config: Partial<AudioTrackConfig>) => void;
  toggleChannelRule: (key: keyof ChannelRules) => void;

  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  toggleLoop: () => void;

  addExportItem: (item: RenderItem) => void;
  addExportItems: (items: RenderItem[]) => void;
  removeExportItem: (id: string) => void;
  clearExportQueue: () => void;
  updateExportItem: (id: string, updates: Partial<RenderItem>) => void;
  updateExportProgress: (id: string, progress: number, status?: RenderItem['status'], url?: string) => void;
  setIsGeneratingAdPack: (val: boolean) => void;
  setAdPackProgress: (progress: number) => void;
  setSearchQuery: (query: string) => void;
  setActiveStoryboard: (storyboard: StoryboardData | null) => void;
  loadProject: (project: any) => void;
  saveProjectToServer: () => Promise<boolean>;
  loadProjectsFromServer: () => Promise<any[]>;
  deleteProjectFromServer: (id: string) => Promise<boolean>;
  loadCampaignsFromCloud: () => Promise<UserCampaignData[]>;
  deleteCampaignFromCloud: (campaignId: string) => Promise<boolean>;
  setGeminiApiKey: (key: string) => void;
  resetToDefaults: () => void;
}

const initialAssets: MediaAsset[] = [
  {
    id: 'nr-01',
    name: 'neon_race_gameplay_01.mp4',
    type: 'video',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8z1HbNlSOf8Kbnwi-dHYfY4GcQvB2YkX601vZDLYLWqO_4-DazixFgj8PQtT6X2b7pO1SGo7tBHCI7c7yhZBEKueg8fGlAWFwNjzJkuEDpMzk8FOSh7MGafZj0T2yBhccTu6CM-52DjBMbzw2YDhjngc4Oq6h78-0_OZBwT3RaO_hB2MjVnNVTuB151uuAl6D3zkq4vdbEz3asgqZI4TpoufkG3JGM4R1wHK9igjr_4bNeidT9rk8jw',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxfSbQiRq7-t_aUZjR3gTrCkvOV6i5MbYMCsHZComZw4DyXBgD8Eb__VUT2_4nJaqsDROESc4Waf3IdMP5Vw7GCLtSQorIwm-IBAsCYuDaekK8T2q_nHtb2b0U_jbl4ICtwsB5Dn-cWOhdkP40zjhjl-wPuysVV3yLs_xYM5pgTg-JaeXBAdNWUbL8puzq904YtIu1_A3hOb7_kM3qcptPGsgdo1kKq78eElDl3uHk43-u4Bgl-PVPJQ',
    duration: '00:32',
    resolution: '1080x1920',
    fps: '60fps ProRes',
    tag: 'Gameplay',
    aspectRatio: '9:16',
    inUseHook: 'Active in Canvas',
    sizeBytes: 48200000
  },
  {
    id: 'nr-02',
    name: 'level_clear_victory_screen.png',
    type: 'image',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8QmeT7ROj64U2QmyPxvCEk3LH93ewKFmMsfrr_X9jxRdrCliLKxgg5qbQEzotQX4cA5d-Gs6WUQORMnSCV4vyxTCPrdKII-b5vGH6pYF1tBm8w3pMLhdaAF-zhe7tcpvuSVCHpIrBFB5BDPYx-nC0ajQ5cbmlGTAiX5R6vboDzvsScP2NZNht5n6mqTmR2vnkOFC7f3cX6qHKqi3f5DfiJO3asedQ_WPRaWmzbjwaxbz6bO4rzwwaeQ',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8QmeT7ROj64U2QmyPxvCEk3LH93ewKFmMsfrr_X9jxRdrCliLKxgg5qbQEzotQX4cA5d-Gs6WUQORMnSCV4vyxTCPrdKII-b5vGH6pYF1tBm8w3pMLhdaAF-zhe7tcpvuSVCHpIrBFB5BDPYx-nC0ajQ5cbmlGTAiX5R6vboDzvsScP2NZNht5n6mqTmR2vnkOFC7f3cX6qHKqi3f5DfiJO3asedQ_WPRaWmzbjwaxbz6bO4rzwwaeQ',
    duration: 'PNG',
    resolution: '1179x2556',
    fps: 'iPhone 16 Pro',
    tag: 'UI Walkthrough',
    aspectRatio: '9:16',
    inUseHook: 'In Use (Hook #2)',
    sizeBytes: 4200000
  },
  {
    id: 'nr-03',
    name: 'character_customizer_clip.mp4',
    type: 'video',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkcCHb8ombOEc1qv3N363Md0jfG3UEBJzz-_uTQIdM4e0rOkh3ToZUPrXj2msRLjAEGUTB8IDjta5ETs9inT_MPQBuCDN93Tvf7bzb-kWAqUh2hRdOmfF1cFamK8aT2zlUb0WjkhfKE1Z-dxvwcOZRT9LBgSiHLZ8nWjkKuFfVl_dak8J5qVQTaDX0pZkTh_ITUdlMt2hwmG_UJp6FlyFdjtjLqBGg1kxabq19C6kTdfE5YYSWV_v5Q',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkcCHb8ombOEc1qv3N363Md0jfG3UEBJzz-_uTQIdM4e0rOkh3ToZUPrXj2msRLjAEGUTB8IDjta5ETs9inT_MPQBuCDN93Tvf7bzb-kWAqUh2hRdOmfF1cFamK8aT2zlUb0WjkhfKE1Z-dxvwcOZRT9LBgSiHLZ8nWjkKuFfVl_dak8J5qVQTaDX0pZkTh_ITUdlMt2hwmG_UJp6FlyFdjtjLqBGg1kxabq19C6kTdfE5YYSWV_v5Q',
    duration: '00:15',
    resolution: '1080x1920',
    fps: '30fps',
    tag: 'Gameplay',
    aspectRatio: '9:16',
    sizeBytes: 21500000
  },
  {
    id: 'nr-04',
    name: 'store_feature_hero_01.png',
    type: 'image',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoyRqYAGs7v2Wn1jVaKmSvwbK3fZc9EzocSanYaCasrE-dH34KE1ONSyu1gBKDwXbO6rXXfMyiXb_buGzCcOgNj0PN3Ish3QFwXu6O-Az1d7tHuIMvd8rwYJWIMbf36ShRuLZctjVoneGll8zv-Mltmc09cxebcW-2f-xAQ2-JQMH-WOeoP_KOfGelsSaA3MOWHgYXyXYztJhgbD3R2QmzwXuBTHM1YOgoXF0-CuvsrFj4c5Dhdt-zYQ',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoyRqYAGs7v2Wn1jVaKmSvwbK3fZc9EzocSanYaCasrE-dH34KE1ONSyu1gBKDwXbO6rXXfMyiXb_buGzCcOgNj0PN3Ish3QFwXu6O-Az1d7tHuIMvd8rwYJWIMbf36ShRuLZctjVoneGll8zv-Mltmc09cxebcW-2f-xAQ2-JQMH-WOeoP_KOfGelsSaA3MOWHgYXyXYztJhgbD3R2QmzwXuBTHM1YOgoXF0-CuvsrFj4c5Dhdt-zYQ',
    duration: 'JPG',
    resolution: '1024x500',
    fps: 'Play Store Art',
    tag: 'Store Art',
    aspectRatio: '16:9',
    sizeBytes: 1800000
  },
  {
    id: 'nr-05',
    name: 'cyberdrift_screen_recording_16x9.mp4',
    type: 'video',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8z1HbNlSOf8Kbnwi-dHYfY4GcQvB2YkX601vZDLYLWqO_4-DazixFgj8PQtT6X2b7pO1SGo7tBHCI7c7yhZBEKueg8fGlAWFwNjzJkuEDpMzk8FOSh7MGafZj0T2yBhccTu6CM-52DjBMbzw2YDhjngc4Oq6h78-0_OZBwT3RaO_hB2MjVnNVTuB151uuAl6D3zkq4vdbEz3asgqZI4TpoufkG3JGM4R1wHK9igjr_4bNeidT9rk8jw',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxfSbQiRq7-t_aUZjR3gTrCkvOV6i5MbYMCsHZComZw4DyXBgD8Eb__VUT2_4nJaqsDROESc4Waf3IdMP5Vw7GCLtSQorIwm-IBAsCYuDaekK8T2q_nHtb2b0U_jbl4ICtwsB5Dn-cWOhdkP40zjhjl-wPuysVV3yLs_xYM5pgTg-JaeXBAdNWUbL8puzq904YtIu1_A3hOb7_kM3qcptPGsgdo1kKq78eElDl3uHk43-u4Bgl-PVPJQ',
    duration: '00:30',
    resolution: '1920x1080',
    fps: '60fps Widescreen',
    tag: 'Gameplay',
    aspectRatio: '16:9',
    inUseHook: 'Raw Screen Capture (16:9)',
    sizeBytes: 42100000,
    cropConfig: {
      isAutoCropped: true,
      preset: 'ai_smart_reels',
      targetRatio: '9:16',
      cropRect: {
        x: 34.18,
        y: 0,
        width: 31.64,
        height: 100
      },
      focalX: 50,
      focalY: 50,
      zoom: 1.0,
      detectedElements: [
        {
          id: 'action_core',
          label: 'Drift Vehicle & Action Center',
          type: 'action',
          confidence: 98,
          bounds: { x: 38, y: 32, width: 24, height: 40 },
          importance: 'critical'
        },
        {
          id: 'hud_score',
          label: 'Speedometer & Score HUD',
          type: 'hud',
          confidence: 96,
          bounds: { x: 42, y: 5, width: 16, height: 10 },
          importance: 'high'
        },
        {
          id: 'virtual_controls',
          label: 'Touch Steer & Nitro Trigger',
          type: 'controls',
          confidence: 91,
          bounds: { x: 36, y: 76, width: 28, height: 18 },
          importance: 'medium'
        }
      ],
      aiSummary: 'Auto-detected 16:9 landscape drift screen recording. Centered 9:16 vertical crop window on vehicle and speed HUD while maintaining safe margins for TikTok engagement buttons.',
      trackingConfidence: 97,
      safeZoneCompliant: true
    }
  }
];

const initialVersions: CreativeVersion[] = [
  {
    id: 'ver-initial-01',
    name: 'v1.0 - Initial Production Baseline',
    timestamp: Date.now() - 7200000,
    createdAtFormatted: '2 hours ago',
    note: 'Baseline setup with iPhone 16 Pro, Floating Drift motion, and Phonk audio.',
    isAutoSave: false,
    state: {
      projectName: 'NeonRider App',
      aspectRatio: '9:16',
      deviceConfig: {
        model: 'iPhone 16 Pro',
        color: 'Titanium Black',
        yaw: 12,
        pitch: -3,
        roll: 0,
        shadowIntensity: 0.85,
        zoom: 100,
        motionPreset: 'Floating Drift'
      },
      hookCopy: {
        headline: '🔥 ONLY 1% PASS LEVEL 12',
        subHook: 'CAN YOU BEAT HIGH SCORE?',
        ctaText: 'PLAY FREE',
        toneArchetype: 'Hype / Viral',
        karaokeEffect: true,
        storeBadge: 'Google Play & App Store',
        starRating: 4.9,
        reviewCount: '48k reviews',
        predictedCtrBoost: '+38% Predicted CTR',
        hookStyle: 'TikTok Banner',
        ctaTheme: 'Electric Indigo',
        showStoreBadges: true
      },
      backgroundConfig: {
        preset: 'Cyber Grid 3D',
        blurAmount: 16,
        glowIntensity: 0.65,
        meshSpeed: 1
      },
      audioConfig: {
        name: 'Phonk Drift - Ultra Club',
        genre: 'Phonk',
        volume: 0.65,
        isPlaying: false,
        soundBoost: true
      },
      channelRules: {
        tiktokSoundBoost: true,
        instagramSafeMargins: true,
        renderVariations: true,
        burnProResOutputs: true
      },
      activeAssetId: 'nr-01',
      timeline: {
        currentTime: 0,
        totalDuration: 15
      }
    }
  },
  {
    id: 'ver-initial-02',
    name: 'v1.1 - Viral Hook & Safe Zones',
    timestamp: Date.now() - 1800000,
    createdAtFormatted: '30 mins ago',
    note: 'Added +38% CTR hook copy and synchronized safe zone clearance for TikTok.',
    isAutoSave: false,
    state: {
      projectName: 'NeonRider App',
      aspectRatio: '9:16',
      deviceConfig: {
        model: 'iPhone 16 Pro',
        color: 'Titanium Black',
        yaw: 12,
        pitch: -3,
        roll: 0,
        shadowIntensity: 0.85,
        zoom: 100,
        motionPreset: 'Floating Drift'
      },
      hookCopy: {
        headline: '🚨 DONT SCROLL! LEVEL 12 IS IMPOSSIBLE',
        subHook: 'CHALLENGE YOUR FRIENDS TODAY',
        ctaText: 'RACE NOW',
        toneArchetype: 'FOMO Urgency',
        karaokeEffect: true,
        storeBadge: 'Google Play & App Store',
        starRating: 4.9,
        reviewCount: '52k reviews',
        predictedCtrBoost: '+44% Predicted CTR',
        hookStyle: 'TikTok Banner',
        ctaTheme: 'Electric Indigo',
        showStoreBadges: true
      },
      backgroundConfig: {
        preset: 'Neon Mesh',
        blurAmount: 16,
        glowIntensity: 0.75,
        meshSpeed: 1.2
      },
      audioConfig: {
        name: 'Phonk Drift - Ultra Club',
        genre: 'Phonk',
        volume: 0.65,
        isPlaying: false,
        soundBoost: true
      },
      channelRules: {
        tiktokSoundBoost: true,
        instagramSafeMargins: true,
        renderVariations: true,
        burnProResOutputs: true
      },
      activeAssetId: 'nr-01',
      timeline: {
        currentTime: 4.2,
        totalDuration: 15
      }
    }
  }
];

export const useAdCraftStore = create<AdCraftState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'tr',
      activeNavTab: 'studio',
      activeView: 'editor',
      workspaceName: 'Apex Gaming Inc.',
      projectName: 'NeonRider App',
      currentProjectId: null,
      geminiApiKey: '',
      credits: 340,
      autoSyncEnabled: true,
      assetId: '#NR-8941',

      assets: initialAssets,
      activeAssetId: 'nr-01',
      selectedFilter: 'All',
      autoVisionClassifier: true,

      aspectRatio: '9:16',
      deviceConfig: {
        model: 'iPhone 16 Pro',
        color: 'Titanium Black',
        yaw: 12,
        pitch: -3,
        roll: 0,
        shadowIntensity: 0.85,
        zoom: 100,
        motionPreset: 'Floating Drift'
      },
      showSafeZones: true,
      canvasZoom: 100,

      hookCopy: {
        headline: '🔥 ONLY 1% PASS LEVEL 12',
        subHook: 'CAN YOU BEAT HIGH SCORE?',
        ctaText: 'PLAY FREE',
        toneArchetype: 'Hype / Viral',
        karaokeEffect: true,
        storeBadge: 'Google Play & App Store',
        starRating: 4.9,
        reviewCount: '48k reviews',
        predictedCtrBoost: '+38% Predicted CTR',
        hookStyle: 'TikTok Banner',
        ctaTheme: 'Electric Indigo',
        showStoreBadges: true
      },

      backgroundConfig: {
        preset: 'Cyber Grid 3D',
        blurAmount: 16,
        glowIntensity: 0.65,
        meshSpeed: 1
      },

      audioConfig: {
        name: 'Phonk Drift - Ultra Club',
        genre: 'Phonk',
        volume: 0.65,
        isPlaying: false,
        soundBoost: true
      },

      channelRules: {
        tiktokSoundBoost: true,
        instagramSafeMargins: true,
        renderVariations: true,
        burnProResOutputs: true
      },

      timeline: {
        currentTime: 4.2,
        totalDuration: 15.0,
        isPlaying: false,
        fps: 60,
        loop: true
      },

      exportQueue: [
        {
          id: 'exp-01',
          title: 'TikTok_Hook_Ad_04.mp4',
          format: 'MP4 (H.264)',
          aspectRatio: '9:16',
          status: 'ready',
          progress: 100,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8z1HbNlSOf8Kbnwi-dHYfY4GcQvB2YkX601vZDLYLWqO_4-DazixFgj8PQtT6X2b7pO1SGo7tBHCI7c7yhZBEKueg8fGlAWFwNjzJkuEDpMzk8FOSh7MGafZj0T2yBhccTu6CM-52DjBMbzw2YDhjngc4Oq6h78-0_OZBwT3RaO_hB2MjVnNVTuB151uuAl6D3zkq4vdbEz3asgqZI4TpoufkG3JGM4R1wHK9igjr_4bNeidT9rk8jw',
          size: '14.2 MB',
          timestamp: '2 mins ago'
        },
        {
          id: 'exp-02',
          title: 'Instagram_Square_Post_01.png',
          format: '4K Ultra PNG',
          aspectRatio: '1:1',
          status: 'ready',
          progress: 100,
          size: '3.8 MB',
          timestamp: '8 mins ago'
        }
      ],
      isGeneratingAdPack: false,
      adPackProgress: 0,
      searchQuery: '',
      activeStoryboard: null,

      isAutoCropModalOpen: false,
      autoCropTargetAssetId: null,

      isVoiceoverModalOpen: false,

      versions: initialVersions,
      isVersionHistoryModalOpen: false,

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }
      },
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      setLanguage: (language) => set({ language }),
      setActiveNavTab: (tab) => set({ activeNavTab: tab }),
      setActiveView: (view) => set({ activeView: view }),
      setWorkspaceName: (workspaceName) => set({ workspaceName }),
      setProjectName: (projectName) => set({ projectName }),
      setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
      setCredits: (credits) => set({ credits }),
      toggleAutoSync: () => set((s) => ({ autoSyncEnabled: !s.autoSyncEnabled })),

      setAutoCropModalOpen: (open, assetId) =>
        set((s) => ({
          isAutoCropModalOpen: open,
          autoCropTargetAssetId: assetId || (open ? s.activeAssetId : null)
        })),

      applyAutoCropToAsset: (assetId, crop) =>
        set((s) => ({
          assets: s.assets.map((a) => (a.id === assetId ? { ...a, cropConfig: crop } : a))
        })),

      resetAssetCrop: (assetId) =>
        set((s) => ({
          assets: s.assets.map((a) => (a.id === assetId ? { ...a, cropConfig: undefined } : a))
        })),

      updateAssetCropFocal: (assetId, focalX, focalY, zoom) =>
        set((s) => ({
          assets: s.assets.map((a) => {
            if (a.id !== assetId || !a.cropConfig) return a;
            const cropW = a.cropConfig.cropRect.width;
            const cropH = a.cropConfig.cropRect.height;
            const newX = Math.max(0, Math.min(100 - cropW, Number((focalX - cropW / 2).toFixed(2))));
            const newY = Math.max(0, Math.min(100 - cropH, Number((focalY - cropH / 2).toFixed(2))));
            return {
              ...a,
              cropConfig: {
                ...a.cropConfig,
                focalX,
                focalY,
                zoom,
                cropRect: {
                  ...a.cropConfig.cropRect,
                  x: newX,
                  y: newY
                }
              }
            };
          })
        })),

      setVoiceoverModalOpen: (open) => set({ isVoiceoverModalOpen: open }),

      setVersionHistoryModalOpen: (open) => set({ isVersionHistoryModalOpen: open }),

      saveSnapshot: (name, note, isAutoSave = false) => {
        const s = get();
        const id = `snap-${Date.now()}`;
        const now = new Date();
        const timeFormatted =
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ' (' +
          now.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
          ')';

        const newVersion: CreativeVersion = {
          id,
          name:
            name ||
            (isAutoSave
              ? `Auto-save #${s.versions.length + 1}`
              : `Snapshot v1.${s.versions.length + 1}`),
          timestamp: Date.now(),
          createdAtFormatted: timeFormatted,
          note: note || (isAutoSave ? 'Automatic checkpoint' : 'User created checkpoint'),
          isAutoSave,
          state: {
            projectName: s.projectName,
            aspectRatio: s.aspectRatio,
            deviceConfig: { ...s.deviceConfig },
            hookCopy: { ...s.hookCopy },
            backgroundConfig: { ...s.backgroundConfig },
            audioConfig: { ...s.audioConfig },
            channelRules: { ...s.channelRules },
            activeAssetId: s.activeAssetId,
            timeline: {
              currentTime: s.timeline.currentTime,
              totalDuration: s.timeline.totalDuration
            }
          }
        };

        set((prev) => ({
          versions: [newVersion, ...prev.versions].slice(0, 30)
        }));

        return id;
      },

      restoreVersion: (versionId) => {
        const s = get();
        const target = s.versions.find((v) => v.id === versionId);
        if (!target) return false;

        set({
          projectName: target.state.projectName,
          aspectRatio: target.state.aspectRatio,
          deviceConfig: { ...target.state.deviceConfig },
          hookCopy: { ...target.state.hookCopy },
          backgroundConfig: { ...target.state.backgroundConfig },
          audioConfig: { ...target.state.audioConfig },
          channelRules: { ...target.state.channelRules },
          activeAssetId: target.state.activeAssetId,
          timeline: {
            ...s.timeline,
            currentTime: target.state.timeline.currentTime,
            totalDuration: target.state.timeline.totalDuration
          }
        });

        return true;
      },

      deleteVersion: (versionId) => {
        set((prev) => ({
          versions: prev.versions.filter((v) => v.id !== versionId)
        }));
      },

      addAsset: (asset) => set((s) => ({ assets: [asset, ...s.assets], activeAssetId: asset.id })),
      removeAsset: (id) =>
        set((s) => {
          const remainingAssets = s.assets.filter((a) => a.id !== id);
          return {
            assets: remainingAssets,
            activeAssetId: s.activeAssetId === id ? (remainingAssets[0]?.id || '') : s.activeAssetId
          };
        }),
      setActiveAssetId: (id) => set({ activeAssetId: id }),
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      toggleAutoVisionClassifier: () => set((s) => ({ autoVisionClassifier: !s.autoVisionClassifier })),

      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setDeviceModel: (model) => set((s) => ({ deviceConfig: { ...s.deviceConfig, model } })),
      setDeviceColor: (color) => set((s) => ({ deviceConfig: { ...s.deviceConfig, color } })),
      setDeviceAngles: (angles) => set((s) => ({ deviceConfig: { ...s.deviceConfig, ...angles } })),
      setMotionPreset: (preset) => {
        let yaw = 0;
        let pitch = 0;
        if (preset === 'Floating Drift') {
          yaw = 12;
          pitch = -3;
        } else if (preset === 'Isometric 45°') {
          yaw = 28;
          pitch = 18;
        } else if (preset === 'Zoom In Punch') {
          yaw = 4;
          pitch = -1;
        }
        set((s) => ({ deviceConfig: { ...s.deviceConfig, motionPreset: preset, yaw, pitch } }));
      },
      toggleSafeZones: () => set((s) => ({ showSafeZones: !s.showSafeZones })),
      setCanvasZoom: (zoom) =>
        set((s) => ({
          canvasZoom: typeof zoom === 'function' ? Math.max(50, Math.min(200, zoom(s.canvasZoom))) : zoom
        })),

      setHookCopy: (copy) => set((s) => ({ hookCopy: { ...s.hookCopy, ...copy } })),
      setToneArchetype: (toneArchetype) => set((s) => ({ hookCopy: { ...s.hookCopy, toneArchetype } })),
      setBackgroundPreset: (preset) => set((s) => ({ backgroundConfig: { ...s.backgroundConfig, preset } })),
      setBackgroundConfig: (config) => set((s) => ({ backgroundConfig: { ...s.backgroundConfig, ...config } })),
      setAudioConfig: (config) => set((s) => ({ audioConfig: { ...s.audioConfig, ...config } })),
      toggleChannelRule: (key) =>
        set((s) => ({ channelRules: { ...s.channelRules, [key]: !s.channelRules[key] } })),

      setCurrentTime: (time) => set({ timeline: { ...get().timeline, currentTime: time } }),
      setIsPlaying: (isPlaying) => set({ timeline: { ...get().timeline, isPlaying } }),
      togglePlay: () => set((s) => ({ timeline: { ...s.timeline, isPlaying: !s.timeline.isPlaying } })),
      toggleLoop: () => set((s) => ({ timeline: { ...s.timeline, loop: !s.timeline.loop } })),

      addExportItem: (item) => set((s) => ({ exportQueue: [item, ...s.exportQueue] })),
      addExportItems: (items) => set((s) => ({ exportQueue: [...items, ...s.exportQueue] })),
      removeExportItem: (id) =>
        set((s) => ({ exportQueue: s.exportQueue.filter((item) => item.id !== id) })),
      clearExportQueue: () => set({ exportQueue: [] }),
      updateExportItem: (id, updates) =>
        set((s) => ({
          exportQueue: s.exportQueue.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        })),
      updateExportProgress: (id, progress, status, url) =>
        set((s) => ({
          exportQueue: s.exportQueue.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress,
                  ...(status ? { status } : {}),
                  ...(url ? { url } : {})
                }
              : item
          )
        })),
      setIsGeneratingAdPack: (val) => set({ isGeneratingAdPack: val }),
      setAdPackProgress: (adPackProgress) => set({ adPackProgress }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveStoryboard: (storyboard) => set({ activeStoryboard: storyboard }),

      loadProject: (project: any) => {
        if (!project) return;
        const s = project.state || {};
        set((prev) => ({
          currentProjectId: project.id || null,
          projectName: project.name || prev.projectName,
          workspaceName: project.workspace || prev.workspaceName,
          aspectRatio: (project.aspectRatio as AspectRatio) || s.aspectRatio || prev.aspectRatio,
          hookCopy: {
            ...prev.hookCopy,
            ...(s.hookCopy || {}),
            headline: project.headline || s.hookHeadline || s.hookCopy?.headline || prev.hookCopy.headline,
            subHook: project.subHook || s.subHook || s.hookCopy?.subHook || prev.hookCopy.subHook,
            ctaText: project.ctaText || s.ctaText || s.hookCopy?.ctaText || prev.hookCopy.ctaText
          },
          deviceConfig: s.deviceConfig
            ? { ...prev.deviceConfig, ...s.deviceConfig }
            : (s.deviceModel ? { ...prev.deviceConfig, model: s.deviceModel } : prev.deviceConfig),
          backgroundConfig: s.backgroundConfig ? { ...prev.backgroundConfig, ...s.backgroundConfig } : prev.backgroundConfig,
          audioConfig: s.audioConfig ? { ...prev.audioConfig, ...s.audioConfig } : prev.audioConfig,
          channelRules: s.channelRules ? { ...prev.channelRules, ...s.channelRules } : prev.channelRules
        }));
      },

      saveProjectToServer: async () => {
        const state = get();
        let serverSuccess = false;
        const projectId = state.currentProjectId || `proj_${Date.now()}`;
        if (!state.currentProjectId) {
          set({ currentProjectId: projectId });
        }
        try {
          const res = await fetch('/api/projects/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: projectId,
              name: state.projectName,
              workspace: state.workspaceName,
              state: {
                aspectRatio: state.aspectRatio,
                hookCopy: state.hookCopy,
                deviceConfig: state.deviceConfig,
                backgroundConfig: state.backgroundConfig,
                audioConfig: state.audioConfig,
                channelRules: state.channelRules
              }
            })
          });
          const data = await res.json();
          serverSuccess = !!data.success;
        } catch {
          serverSuccess = false;
        }

        // Also persist to Firebase Firestore if user is authenticated
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          try {
            const campaignId = projectId;
            await saveUserCampaign({
              id: campaignId,
              userId: currentUser.uid,
              name: (state.projectName || 'Ad Campaign').slice(0, 120),
              workspace: (state.workspaceName || 'Creative Studio').slice(0, 100),
              headline: (state.hookCopy.headline || 'App Store Hook').slice(0, 190),
              subHook: (state.hookCopy.subHook || '').slice(0, 240),
              ctaText: (state.hookCopy.ctaText || 'Download Free').slice(0, 55),
              aspectRatio: (state.aspectRatio || '9:16').slice(0, 25),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            return true;
          } catch (e) {
            console.warn('Notice syncing campaign to Firestore:', e);
          }
        }

        return serverSuccess;
      },

      loadProjectsFromServer: async () => {
        try {
          const res = await fetch('/api/projects');
          const data = await res.json();
          return data.projects || [];
        } catch {
          return [];
        }
      },

      deleteProjectFromServer: async (id: string) => {
        try {
          const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
          const data = await res.json();
          return !!data.success;
        } catch {
          return false;
        }
      },

      loadCampaignsFromCloud: async () => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return [];
        try {
          return await getUserCampaigns(currentUser.uid);
        } catch {
          return [];
        }
      },

      deleteCampaignFromCloud: async (campaignId: string) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return false;
        try {
          await deleteUserCampaign(currentUser.uid, campaignId);
          return true;
        } catch {
          return false;
        }
      },

      setGeminiApiKey: (key: string) => set({ geminiApiKey: key.trim() }),

      resetToDefaults: () => {
        set({
          workspaceName: 'Apex Gaming Inc.',
          projectName: 'NeonRider App',
          currentProjectId: null,
          aspectRatio: '9:16',
          deviceConfig: {
            model: 'iPhone 16 Pro',
            color: 'Titanium Black',
            yaw: 12,
            pitch: -3,
            roll: 0,
            shadowIntensity: 0.85,
            zoom: 100,
            motionPreset: 'Floating Drift'
          },
          hookCopy: {
            headline: '🔥 SADECE %1 SEVİYE 12\'Yİ GEÇTİ',
            subHook: 'CAN YOU BEAT HIGH SCORE?',
            ctaText: 'PLAY FREE',
            toneArchetype: 'Hype / Viral',
            karaokeEffect: true,
            storeBadge: 'Google Play & App Store',
            starRating: 4.9,
            reviewCount: '48k reviews',
            predictedCtrBoost: '+38% Predicted CTR',
            hookStyle: 'TikTok Banner',
            ctaTheme: 'Electric Indigo',
            showStoreBadges: true
          },
          backgroundConfig: {
            preset: 'Cyber Grid 3D',
            blurAmount: 12,
            glowIntensity: 0.6,
            meshSpeed: 1.0
          },
          audioConfig: {
            name: 'Phonk Drift - Ultra Club',
            genre: 'Phonk',
            volume: 0.6,
            isPlaying: false,
            soundBoost: true
          },
          activeAssetId: initialAssets[0]?.id || 'nr-01',
          assets: initialAssets
        });
      }
    }),
    {
      name: 'adcraft-studio-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        workspaceName: state.workspaceName,
        projectName: state.projectName,
        currentProjectId: state.currentProjectId,
        geminiApiKey: state.geminiApiKey,
        credits: state.credits,
        aspectRatio: state.aspectRatio,
        deviceConfig: state.deviceConfig,
        hookCopy: state.hookCopy,
        backgroundConfig: state.backgroundConfig,
        audioConfig: state.audioConfig,
        channelRules: state.channelRules,
        showSafeZones: state.showSafeZones,
        exportQueue: state.exportQueue,
        versions: state.versions
      }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          if (state.theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }
      }
    }
  )
);
