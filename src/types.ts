export type AspectRatio = '9:16' | '1:1' | '16:9' | '2:3';

export type Language = 'en' | 'tr';

export type ThemeMode = 'dark' | 'light';

export type DeviceModel =
  | 'iPhone 16 Pro'
  | 'Pixel 9 Pro'
  | 'iPad Pro M4'
  | 'MacBook Pro M3'
  | 'Minimalist Frame';

export type DeviceColor =
  | 'Titanium Black'
  | 'Natural Titanium'
  | 'Desert Titanium'
  | 'White Titanium'
  | 'Obsidian'
  | 'Porcelain'
  | 'Space Black';

export type MotionPreset = 'Floating Drift' | 'Zoom In Punch' | 'Isometric 45°' | 'Static';

export type BackgroundPreset =
  | 'Cyber Grid 3D'
  | 'Blurred Gameplay'
  | 'Neon Mesh'
  | 'Obsidian Studio'
  | 'Studio Floor'
  | 'Aurora Borealis'
  | 'Midnight Luxury'
  | 'Sunset Radiant'
  | 'Clean Studio';

export type HookStyle = 'TikTok Banner' | 'Cyber Glow' | 'Studio Sleek' | 'Glassmorphic' | 'Minimalist';

export type CtaTheme = 'Electric Indigo' | 'Cyber Cyan' | 'Emerald Spark' | 'Hot Rose' | 'Amber Sunset';

export type ToneArchetype = 'Hype / Viral' | 'Problem-Solver' | 'Minimalist' | 'FOMO Urgency';

export interface StoryboardScene {
  timeRange: string;
  phase: string;
  visualAction: string;
  onScreenOverlay: string;
  audioEffect: string;
}

export interface StoryboardData {
  totalDuration: number;
  soundtrackRecommendation: string;
  scenes: StoryboardScene[];
}

export type AutoCropPreset = 'ai_smart_reels' | 'action_priority' | 'hud_safe_stack' | 'custom';

export interface DetectedInterfaceElement {
  id: string;
  label: string;
  type: 'action' | 'hud' | 'controls' | 'character' | 'dialogue';
  confidence: number; // 0 - 100
  bounds: {
    x: number; // 0 - 100 percentage
    y: number; // 0 - 100 percentage
    width: number; // 0 - 100 percentage
    height: number; // 0 - 100 percentage
  };
  importance: 'critical' | 'high' | 'medium';
}

export interface CropConfig {
  isAutoCropped: boolean;
  preset: AutoCropPreset;
  targetRatio: '9:16';
  // Normalized 0-100% crop rectangle within the source media
  cropRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  focalX: number; // 0 - 100% center point
  focalY: number; // 0 - 100% center point
  zoom: number; // 1.0 to 2.5
  detectedElements: DetectedInterfaceElement[];
  aiSummary?: string;
  trackingConfidence: number; // e.g. 96
  safeZoneCompliant: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image';
  url: string;
  duration?: string;
  resolution: string;
  fps?: string;
  tag: 'Gameplay' | 'UI Walkthrough' | 'Store Art' | 'Ad Cut';
  thumbnailUrl: string;
  aspectRatio: string;
  inUseHook?: string;
  sizeBytes?: number;
  extractedFrames?: string[];
  cropConfig?: CropConfig;
}

export interface DeviceConfig {
  model: DeviceModel;
  color: DeviceColor;
  yaw: number;
  pitch: number;
  roll: number;
  shadowIntensity: number;
  zoom: number;
  motionPreset: MotionPreset;
}

export interface HookCopy {
  headline: string;
  subHook: string;
  ctaText: string;
  toneArchetype: ToneArchetype;
  karaokeEffect: boolean;
  storeBadge: string;
  starRating: number;
  reviewCount: string;
  predictedCtrBoost: string;
  hookStyle?: HookStyle;
  ctaTheme?: CtaTheme;
  showStoreBadges?: boolean;
}

export interface BackgroundConfig {
  preset: BackgroundPreset;
  blurAmount: number;
  glowIntensity: number;
  meshSpeed: number;
}

export interface VoiceoverCue {
  timeRange: string;
  phase: string;
  spokenText: string;
  directorNote?: string;
}

export interface VoiceoverConfig {
  enabled: boolean;
  script: string;
  voiceName: string;
  pitch: number;
  rate: number;
  volume: number;
  language: string;
  recommendedVoiceStyle?: string;
  timedCues?: VoiceoverCue[];
}

export interface AudioTrackConfig {
  name: string;
  genre: string;
  volume: number;
  isPlaying: boolean;
  soundBoost: boolean;
  isMuted?: boolean;
  voiceover?: VoiceoverConfig;
}

export interface ChannelRules {
  tiktokSoundBoost: boolean;
  instagramSafeMargins: boolean;
  renderVariations: boolean;
  burnProResOutputs: boolean;
}

export interface RenderItem {
  id: string;
  title: string;
  format: string;
  aspectRatio: AspectRatio;
  status: 'queued' | 'rendering' | 'ready' | 'error' | 'paused';
  progress: number;
  url?: string;
  size?: string;
  timestamp: string;
  variationId?: string;
  headline?: string;
  predictedCtr?: string;
  batchId?: string;
  fps?: number;
  error?: string;
}

export interface CreativeSnapshotState {
  projectName: string;
  aspectRatio: AspectRatio;
  deviceConfig: DeviceConfig;
  hookCopy: HookCopy;
  backgroundConfig: BackgroundConfig;
  audioConfig: AudioTrackConfig;
  channelRules: ChannelRules;
  activeAssetId: string;
  timeline: {
    currentTime: number;
    totalDuration: number;
  };
}

export interface CreativeVersion {
  id: string;
  name: string;
  timestamp: number;
  createdAtFormatted: string;
  note?: string;
  thumbnailUrl?: string;
  isAutoSave?: boolean;
  state: CreativeSnapshotState;
}

