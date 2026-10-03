import React, { useRef, useState, useEffect } from 'react';
import {
  Smartphone,
  Crop,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Grid,
  Zap,
  Move,
  Heart,
  MessageCircle,
  Share2,
  Gamepad2,
  Volume2,
  Sparkles,
  Award,
  Layers,
  Palette,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Send,
  MoreVertical,
  Disc,
  Plus
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { AspectRatio, DeviceModel, DeviceColor, HookStyle, CtaTheme, BackgroundPreset } from '../types';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({ canvasRef }) => {
  const { t, language } = useTranslation();
  const {
    aspectRatio,
    setAspectRatio,
    deviceConfig,
    setDeviceModel,
    setDeviceColor,
    setDeviceAngles,
    showSafeZones,
    toggleSafeZones,
    canvasZoom,
    setCanvasZoom,
    hookCopy,
    setHookCopy,
    backgroundConfig,
    audioConfig,
    assets,
    activeAssetId,
    timeline,
    activeStoryboard,
    setAutoCropModalOpen
  } = useAdCraftStore();

  const [safeZonePlatform, setSafeZonePlatform] = useState<'TikTok' | 'Reels' | 'Shorts'>('TikTok');
  const [isDeviceDragging, setIsDeviceDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startYaw: number; startPitch: number }>({
    x: 0,
    y: 0,
    startYaw: 0,
    startPitch: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const activeAsset = assets.find((a) => a.id === activeAssetId) || assets[0];

  // Storyboard Scene Timing Phases (15-second total duration)
  const currentSec = timeline.currentTime;
  const isHookPhase = currentSec < 3.0; // 0 - 3s: Hook & Thumbstop
  const isActionPhase = currentSec >= 3.0 && currentSec < 8.0; // 3 - 8s: Core Gameplay
  const isSocialProofPhase = currentSec >= 8.0 && currentSec < 12.0; // 8 - 12s: Ratings & Proof
  const isCtaPhase = currentSec >= 12.0; // 12 - 15s: Final Conversion CTA

  // Synchronize internal phone <video> with timeline playback and scrubber
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (timeline.isPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [timeline.isPlaying]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !vid.duration || Number.isNaN(vid.duration)) return;

    const targetTime = timeline.currentTime % vid.duration;
    if (Math.abs(vid.currentTime - targetTime) > 0.4) {
      vid.currentTime = targetTime;
    }
  }, [timeline.currentTime]);

  // Aspect ratio dimensional styles
  const getContainerDimensions = (ratio: AspectRatio) => {
    switch (ratio) {
      case '9:16':
        return 'w-[310px] h-[550px]';
      case '1:1':
        return 'w-[440px] h-[440px]';
      case '16:9':
        return 'w-[560px] h-[315px]';
      case '2:3':
        return 'w-[360px] h-[540px]';
      default:
        return 'w-[310px] h-[550px]';
    }
  };

  // Device mockup inner screen dimensions based on active aspect ratio & device model
  const getDeviceFrameStyle = (ratio: AspectRatio, model: DeviceModel) => {
    if (model === 'MacBook Pro M3') {
      return {
        width: '480px',
        height: '310px',
        borderRadius: '16px'
      };
    }
    if (model === 'iPad Pro M4') {
      return {
        width: '360px',
        height: '490px',
        borderRadius: '26px'
      };
    }
    if (model === 'Minimalist Frame') {
      return {
        width: '270px',
        height: '515px',
        borderRadius: '34px'
      };
    }
    if (ratio === '1:1') {
      return {
        width: '320px',
        height: '380px',
        borderRadius: '36px'
      };
    }
    if (ratio === '16:9') {
      return {
        width: '420px',
        height: '240px',
        borderRadius: '28px'
      };
    }
    if (ratio === '2:3') {
      return {
        width: '300px',
        height: '450px',
        borderRadius: '40px'
      };
    }
    return {
      width: '275px',
      height: '520px',
      borderRadius: '48px'
    };
  };

  // Realistic metallic finishes with physical specular luster
  const getChassisDetails = (color: string, model: DeviceModel) => {
    if (model === 'Minimalist Frame') {
      return {
        gradient: 'from-cyan-500/40 via-slate-800 to-indigo-500/40',
        ring: 'ring-cyan-500/50',
        shadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px rgba(6,182,212,0.25)',
        specular: '#38BDF8'
      };
    }
    if (color === 'Desert Titanium') {
      return {
        gradient: 'from-[#E4C59E] via-[#A87B4C] to-[#4A341E]',
        ring: 'ring-[#E4C59E]/60',
        shadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px rgba(228,197,158,0.28)',
        specular: '#E4C59E'
      };
    }
    if (color === 'Natural Titanium') {
      return {
        gradient: 'from-[#CBC6BD] via-[#8E887E] to-[#393733]',
        ring: 'ring-[#CBC6BD]/50',
        shadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px rgba(203,198,189,0.22)',
        specular: '#CBC6BD'
      };
    }
    if (color === 'White Titanium' || color === 'Porcelain') {
      return {
        gradient: 'from-[#F8FAFC] via-[#CBD5E1] to-[#64748B]',
        ring: 'ring-slate-300/70',
        shadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px rgba(255,255,255,0.22)',
        specular: '#FFFFFF'
      };
    }
    // Titanium Black, Obsidian, Space Black
    return {
      gradient: 'from-[#475569] via-[#1E293B] to-[#0A0E17]',
      ring: 'ring-slate-700/60',
      shadow: '0 25px 60px -15px rgba(0,0,0,0.95), 0 0 35px rgba(78,222,163,0.12)',
      specular: '#94A3B8'
    };
  };

  // High-conversion direct response caption banner styling
  const getHookStyleClasses = (style?: HookStyle, isHookPhase?: boolean) => {
    switch (style) {
      case 'Studio Sleek':
      case 'Cyber Glow':
        return `px-3.5 py-1.5 rounded-xl bg-[#0B0E15]/95 border border-white/20 text-white backdrop-blur-md transition-all ${
          isHookPhase
            ? 'shadow-[0_8px_30px_rgba(0,0,0,0.8)] border-indigo-400/70 scale-[1.03]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }`;
      case 'Glassmorphic':
        return `px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white transition-all ${
          isHookPhase
            ? 'shadow-[0_8px_30px_rgba(0,0,0,0.6)] scale-[1.03]'
            : 'shadow-lg'
        }`;
      case 'Minimalist':
        return `px-2 py-1 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] transition-all ${
          isHookPhase ? 'scale-[1.03]' : ''
        }`;
      case 'TikTok Banner':
      default:
        return `bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 px-3.5 py-1.5 rounded-xl transition-all ${
          isHookPhase
            ? 'shadow-[0_6px_24px_rgba(245,158,11,0.35)] scale-[1.03] -rotate-1'
            : 'shadow-md -rotate-1'
        } text-slate-950 font-black`;
    }
  };

  // High-conversion CTA Button themes
  const getCtaThemeClasses = (theme?: CtaTheme, isCtaPhase?: boolean) => {
    const base = 'w-full py-2.5 px-3.5 rounded-2xl text-white font-["Geist"] text-xs font-bold flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all border-t border-white/20';
    switch (theme) {
      case 'Cyber Cyan':
        return `${base} bg-gradient-to-r from-sky-600 via-teal-600 to-cyan-600 ${
          isCtaPhase
            ? 'shadow-[0_8px_25px_rgba(14,165,233,0.4)] scale-[1.02]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }`;
      case 'Emerald Spark':
        return `${base} bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 ${
          isCtaPhase
            ? 'shadow-[0_8px_25px_rgba(16,185,129,0.4)] scale-[1.02]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }`;
      case 'Hot Rose':
        return `${base} bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 ${
          isCtaPhase
            ? 'shadow-[0_8px_25px_rgba(244,63,94,0.4)] scale-[1.02]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }`;
      case 'Amber Sunset':
        return `${base} bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 ${
          isCtaPhase
            ? 'shadow-[0_8px_25px_rgba(245,158,11,0.4)] scale-[1.02]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }`;
      case 'Electric Indigo':
      default:
        return `${base} bg-gradient-to-r from-indigo-600 via-indigo-500 to-slate-800 ${
          isCtaPhase
            ? 'shadow-[0_8px_25px_rgba(99,102,241,0.45)] scale-[1.02]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }`;
    }
  };

  // Mouse drag for interactive 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDeviceDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startYaw: deviceConfig.yaw,
      startPitch: deviceConfig.pitch
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDeviceDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const newYaw = Math.max(-45, Math.min(45, dragStartRef.current.startYaw + dx * 0.3));
      const newPitch = Math.max(-30, Math.min(30, dragStartRef.current.startPitch - dy * 0.3));

      setDeviceAngles({ yaw: Math.round(newYaw), pitch: Math.round(newPitch) });
    };

    const handleMouseUp = () => {
      if (isDeviceDragging) {
        setIsDeviceDragging(false);
      }
    };

    if (isDeviceDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDeviceDragging, setDeviceAngles]);

  // Synchronize dynamic offscreen HTML5 canvas for high-res export and 60fps video recording
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1080;
    let height = 1920;
    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    } else if (aspectRatio === '2:3') {
      width = 1080;
      height = 1620;
    }

    canvas.width = width;
    canvas.height = height;

    // Preload image if asset is an image
    const assetUrl = activeAsset?.thumbnailUrl || activeAsset?.url || '';
    if (assetUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImageRef.current = img;
        renderScene(timeline.currentTime);
      };
      img.src = assetUrl;
    }

    // Comprehensive drawing function that renders animated frames
    const renderScene = (sec: number = timeline.currentTime) => {
      // 1. Draw background preset
      if (backgroundConfig.preset === 'Cyber Grid 3D') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0D1117');
        grad.addColorStop(0.5, '#131824');
        grad.addColorStop(1, '#07080D');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Architectural studio grid lines offset
        const gridOffset = (sec * 15) % 60;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = gridOffset; y < height; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else if (backgroundConfig.preset === 'Neon Mesh' || backgroundConfig.preset === 'Obsidian Studio') {
        const grad = ctx.createRadialGradient(width / 2, height * 0.4, 60, width / 2, height * 0.5, width * 0.85);
        grad.addColorStop(0, '#161B26');
        grad.addColorStop(0.5, '#0E121B');
        grad.addColorStop(1, '#06080D');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Soft architectural top rim ambient glow
        const topGlow = ctx.createLinearGradient(0, 0, 0, height * 0.4);
        topGlow.addColorStop(0, 'rgba(99, 102, 241, 0.07)');
        topGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, width, height * 0.4);
      } else if (backgroundConfig.preset === 'Studio Floor') {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0F131D');
        grad.addColorStop(0.6, '#181C28');
        grad.addColorStop(1, '#07080D');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Studio floor spotlight reflection
        const floorGrad = ctx.createRadialGradient(width / 2, height * 0.85, 20, width / 2, height * 0.85, width * 0.6);
        floorGrad.addColorStop(0, 'rgba(99, 102, 241, 0.28)');
        floorGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.ellipse(width / 2, height * 0.85, width * 0.5, height * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (backgroundConfig.preset === 'Aurora Borealis') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#051b14');
        grad.addColorStop(0.4, '#092d24');
        grad.addColorStop(0.7, '#1b1233');
        grad.addColorStop(1, '#080c18');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Northern lights cosmic glow
        const glow = ctx.createRadialGradient(width * 0.35, height * 0.25, 40, width * 0.35, height * 0.25, width * 0.8);
        glow.addColorStop(0, 'rgba(52, 211, 153, 0.22)');
        glow.addColorStop(0.6, 'rgba(168, 85, 247, 0.12)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundConfig.preset === 'Midnight Luxury') {
        const grad = ctx.createRadialGradient(width / 2, height * 0.35, 60, width / 2, height * 0.5, width * 0.85);
        grad.addColorStop(0, '#1E2530');
        grad.addColorStop(0.5, '#0E131A');
        grad.addColorStop(1, '#05070A');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundConfig.preset === 'Sunset Radiant') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#431407');
        grad.addColorStop(0.35, '#881337');
        grad.addColorStop(0.7, '#31104B');
        grad.addColorStop(1, '#090D16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundConfig.preset === 'Clean Studio') {
        ctx.fillStyle = '#0F131A';
        ctx.fillRect(0, 0, width, height);
        const centerGlow = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.6);
        centerGlow.addColorStop(0, '#1C2330');
        centerGlow.addColorStop(1, '#0A0D12');
        ctx.fillStyle = centerGlow;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Blurred Gameplay fallback
        ctx.fillStyle = '#0B0E15';
        ctx.fillRect(0, 0, width, height);
      }

      // Calculate dynamic phone offset from motion preset
      const isPunch = deviceConfig.motionPreset === 'Zoom In Punch' && (sec % 3.0) < 1.0;
      const motionYOffset = Math.sin(sec * 2.2) * 12;

      // Device dimensions & geometry based on model and aspect ratio
      let targetRatio = 9 / 19.5; // default smartphone ratio
      let cornerRad = 68;
      let innerCornerRad = 54;
      let borderWidth = 16;

      if (deviceConfig.model === 'MacBook Pro M3') {
        targetRatio = 16 / 10;
        cornerRad = 24;
        innerCornerRad = 16;
        borderWidth = 14;
      } else if (deviceConfig.model === 'iPad Pro M4') {
        targetRatio = 3 / 4;
        cornerRad = 36;
        innerCornerRad = 28;
        borderWidth = 14;
      } else if (deviceConfig.model === 'Minimalist Frame') {
        targetRatio = 9 / 19.5;
        cornerRad = 38;
        innerCornerRad = 34;
        borderWidth = 8;
      }

      let phoneW: number;
      let phoneH: number;

      if (aspectRatio === '16:9') {
        if (deviceConfig.model === 'MacBook Pro M3') {
          phoneH = height * (isPunch ? 0.82 : 0.76);
          phoneW = phoneH * targetRatio;
        } else {
          phoneH = height * (isPunch ? 0.84 : 0.78);
          phoneW = phoneH * targetRatio;
        }
      } else if (aspectRatio === '1:1') {
        if (deviceConfig.model === 'MacBook Pro M3') {
          phoneW = width * (isPunch ? 0.85 : 0.80);
          phoneH = phoneW / targetRatio;
        } else {
          phoneH = height * (isPunch ? 0.82 : 0.76);
          phoneW = phoneH * targetRatio;
        }
      } else {
        // 9:16 or 2:3
        if (deviceConfig.model === 'MacBook Pro M3') {
          phoneW = width * (isPunch ? 0.88 : 0.84);
          phoneH = phoneW / targetRatio;
        } else {
          phoneW = width * (isPunch ? 0.76 : 0.72);
          phoneH = phoneW / targetRatio;
          if (phoneH > height * 0.82) {
            phoneH = height * 0.82;
            phoneW = phoneH * targetRatio;
          }
        }
      }

      const phoneX = (width - phoneW) / 2;
      const phoneY = (height - phoneH) / 2 + (timeline.isPlaying ? motionYOffset : 0);

      // Phone shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 30;
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.roundRect(phoneX, phoneY, phoneW, phoneH, cornerRad);
      ctx.fill();
      ctx.restore();

      // Chassis metallic bevel
      ctx.save();
      const chassisGrad = ctx.createLinearGradient(phoneX, phoneY, phoneX + phoneW, phoneY + phoneH);
      if (deviceConfig.color === 'Desert Titanium') {
        chassisGrad.addColorStop(0, '#E4C59E');
        chassisGrad.addColorStop(0.5, '#A87B4C');
        chassisGrad.addColorStop(1, '#4A341E');
      } else if (deviceConfig.color === 'Natural Titanium') {
        chassisGrad.addColorStop(0, '#CBC6BD');
        chassisGrad.addColorStop(0.5, '#8E887E');
        chassisGrad.addColorStop(1, '#393733');
      } else if (deviceConfig.color === 'White Titanium' || deviceConfig.color === 'Porcelain') {
        chassisGrad.addColorStop(0, '#F8FAFC');
        chassisGrad.addColorStop(0.5, '#CBD5E1');
        chassisGrad.addColorStop(1, '#64748B');
      } else {
        chassisGrad.addColorStop(0, '#475569');
        chassisGrad.addColorStop(0.5, '#1E293B');
        chassisGrad.addColorStop(1, '#0A0E17');
      }
      ctx.fillStyle = chassisGrad;
      ctx.beginPath();
      ctx.roundRect(phoneX, phoneY, phoneW, phoneH, cornerRad);
      ctx.fill();
      ctx.restore();

      // Inner screen display clip & background
      const screenX = phoneX + borderWidth;
      const screenY = phoneY + borderWidth;
      const screenW = phoneW - borderWidth * 2;
      const screenH = phoneH - borderWidth * 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(screenX, screenY, screenW, screenH, innerCornerRad);
      ctx.clip();
      ctx.fillStyle = '#06080F';
      ctx.fillRect(screenX, screenY, screenW, screenH);

      // Draw active media: prefer live video frame if playing, or preloaded image
      let mediaDrawn = false;
      const crop = activeAsset?.cropConfig;

      if (crop?.isAutoCropped && crop.cropRect) {
        const naturalW =
          activeAsset?.type === 'video' && videoRef.current && videoRef.current.videoWidth > 0
            ? videoRef.current.videoWidth
            : loadedImageRef.current?.naturalWidth || 1920;
        const naturalH =
          activeAsset?.type === 'video' && videoRef.current && videoRef.current.videoHeight > 0
            ? videoRef.current.videoHeight
            : loadedImageRef.current?.naturalHeight || 1080;

        const zoomLevel = Math.max(1.0, crop.zoom || 1.0);
        const baseSW = (crop.cropRect.width / 100) * naturalW;
        const baseSH = (crop.cropRect.height / 100) * naturalH;
        const sW = baseSW / zoomLevel;
        const sH = baseSH / zoomLevel;

        const focalPixelX = ((crop.focalX ?? 50) / 100) * naturalW;
        const focalPixelY = ((crop.focalY ?? 50) / 100) * naturalH;

        const sx = Math.max(0, Math.min(naturalW - sW, focalPixelX - sW / 2));
        const sy = Math.max(0, Math.min(naturalH - sH, focalPixelY - sH / 2));

        if (activeAsset?.type === 'video' && videoRef.current && videoRef.current.readyState >= 2) {
          try {
            ctx.drawImage(videoRef.current, sx, sy, sW, sH, screenX, screenY, screenW, screenH);
            mediaDrawn = true;
          } catch {}
        }
        if (!mediaDrawn && loadedImageRef.current) {
          try {
            ctx.drawImage(loadedImageRef.current, sx, sy, sW, sH, screenX, screenY, screenW, screenH);
            mediaDrawn = true;
          } catch {}
        }
      }

      if (!mediaDrawn && activeAsset?.type === 'video' && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          ctx.drawImage(videoRef.current, screenX, screenY, screenW, screenH);
          mediaDrawn = true;
        } catch {
          // video frame draw fallback
        }
      }
      if (!mediaDrawn && loadedImageRef.current) {
        ctx.drawImage(loadedImageRef.current, screenX, screenY, screenW, screenH);
        mediaDrawn = true;
      }
      if (!mediaDrawn) {
        const screenGrad = ctx.createLinearGradient(phoneX, phoneY, phoneX + phoneW, phoneY + phoneH);
        screenGrad.addColorStop(0, '#111827');
        screenGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = screenGrad;
        ctx.fillRect(screenX, screenY, screenW, screenH);
      }

      // Specular Glass Glare across the screen
      const glareGrad = ctx.createLinearGradient(phoneX, phoneY, phoneX + phoneW, phoneY + phoneH);
      glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      glareGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.04)');
      glareGrad.addColorStop(0.5, 'transparent');
      glareGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');
      glareGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glareGrad;
      ctx.fillRect(screenX, screenY, screenW, screenH);

      // Studio Hardware Accents: Dynamic Island, Punch Hole, Notch & Tablet Camera
      if (deviceConfig.model === 'iPhone 16 Pro') {
        const diWidth = phoneW * 0.28;
        const diHeight = phoneH * 0.045;
        const diX = phoneX + (phoneW - diWidth) / 2;
        const diY = phoneY + 22;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(diX, diY, diWidth, diHeight, diHeight / 2);
        ctx.fill();

        // Dual Camera Lens / Sensor Reflection
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(diX + diWidth * 0.78, diY + diHeight / 2, diHeight * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(diX + diWidth * 0.24, diY + diHeight / 2, diHeight * 0.22, 0, Math.PI * 2);
        ctx.fill();
      } else if (deviceConfig.model === 'Pixel 9 Pro') {
        const punchRadius = phoneW * 0.022;
        const punchX = phoneX + phoneW / 2;
        const punchY = phoneY + 24;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(punchX, punchY, punchRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(punchX, punchY, punchRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (deviceConfig.model === 'MacBook Pro M3') {
        const notchW = phoneW * 0.16;
        const notchH = 14;
        const notchX = phoneX + (phoneW - notchW) / 2;
        const notchY = screenY;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(notchX, notchY, notchW, notchH, [0, 0, 8, 8]);
        ctx.fill();

        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(notchX + notchW / 2, notchY + notchH * 0.45, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (deviceConfig.model === 'iPad Pro M4') {
        const camX = phoneX + phoneW / 2;
        const camY = phoneY + 8;

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(camX, camY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Phase 1: Hook Headline overlay banner
      ctx.save();
      const isSecHook = sec < 3.0;
      const bannerW = width * 0.84;
      const bannerH = 110;
      const bannerX = (width - bannerW) / 2;
      const bannerY = Math.min(phoneY + 115, height - 250);

      const style = hookCopy.hookStyle || 'TikTok Banner';

      if (style === 'Cyber Glow') {
        ctx.fillStyle = 'rgba(8, 12, 22, 0.94)';
        ctx.shadowColor = isSecHook ? 'rgba(6, 182, 212, 0.95)' : 'rgba(6, 182, 212, 0.5)';
        ctx.shadowBlur = isSecHook ? 45 : 25;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 24);
        ctx.fill();

        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 42px Geist, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hookCopy.headline, width / 2, bannerY + bannerH / 2);
      } else if (style === 'Glassmorphic') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.shadowColor = isSecHook ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = isSecHook ? 35 : 20;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 24);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 42px Geist, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hookCopy.headline, width / 2, bannerY + bannerH / 2);
      } else if (style === 'Minimalist') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 46px Geist, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hookCopy.headline, width / 2, bannerY + bannerH / 2);
      } else {
        // TikTok Banner (Default)
        ctx.translate(width / 2, bannerY + bannerH / 2);
        ctx.rotate(-0.025);
        ctx.translate(-width / 2, -(bannerY + bannerH / 2));

        ctx.fillStyle = '#FBBF24';
        ctx.shadowColor = isSecHook ? 'rgba(251, 191, 36, 0.9)' : 'rgba(251, 191, 36, 0.45)';
        ctx.shadowBlur = isSecHook ? 45 : 25;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 24);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = '900 42px Geist, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hookCopy.headline, width / 2, bannerY + bannerH / 2);
      }
      ctx.restore();

      // Phase 3: Social Proof Store Rating Pill (Seconds 8-12)
      if (sec >= 8.0 && sec < 12.0) {
        ctx.save();
        const ratingW = width * 0.58;
        const ratingH = 70;
        const ratingX = (width - ratingW) / 2;
        const ratingY = bannerY + bannerH + 24;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.roundRect(ratingX, ratingY, ratingW, ratingH, 20);
        ctx.fill();

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 28px Geist, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `${hookCopy.starRating || '4.9 ★★★★★'} · ${hookCopy.reviewCount || '48K Reviews'}`,
          width / 2,
          ratingY + ratingH / 2
        );
        ctx.restore();
      }

      // Phase 4: High Conversion CTA Button
      ctx.save();
      const isSecCta = sec >= 12.0;
      const ctaW = width * (isSecCta ? 0.70 : 0.66);
      const ctaH = isSecCta ? 104 : 96;
      const ctaX = (width - ctaW) / 2;
      const minCtaY = bannerY + bannerH + (sec >= 8.0 && sec < 12.0 ? 110 : 30);
      const targetCtaY = phoneY + phoneH - (hookCopy.showStoreBadges !== false ? 220 : 160);
      const ctaY = Math.max(minCtaY, Math.min(targetCtaY, height - (hookCopy.showStoreBadges !== false ? 180 : 120)));

      const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
      const theme = hookCopy.ctaTheme || 'Electric Indigo';
      if (theme === 'Cyber Cyan') {
        ctaGrad.addColorStop(0, '#06B6D4');
        ctaGrad.addColorStop(1, '#3B82F6');
        ctx.shadowColor = isSecCta ? 'rgba(6, 182, 212, 0.95)' : 'rgba(6, 182, 212, 0.5)';
      } else if (theme === 'Emerald Spark') {
        ctaGrad.addColorStop(0, '#10B981');
        ctaGrad.addColorStop(1, '#06B6D4');
        ctx.shadowColor = isSecCta ? 'rgba(16, 185, 129, 0.95)' : 'rgba(16, 185, 129, 0.5)';
      } else if (theme === 'Hot Rose') {
        ctaGrad.addColorStop(0, '#F43F5E');
        ctaGrad.addColorStop(1, '#F59E0B');
        ctx.shadowColor = isSecCta ? 'rgba(244, 63, 94, 0.95)' : 'rgba(244, 63, 94, 0.5)';
      } else if (theme === 'Amber Sunset') {
        ctaGrad.addColorStop(0, '#F59E0B');
        ctaGrad.addColorStop(1, '#E11D48');
        ctx.shadowColor = isSecCta ? 'rgba(245, 158, 11, 0.95)' : 'rgba(245, 158, 11, 0.5)';
      } else {
        // Electric Indigo
        ctaGrad.addColorStop(0, '#6366F1');
        ctaGrad.addColorStop(1, '#06B6D4');
        ctx.shadowColor = isSecCta ? 'rgba(99, 102, 241, 0.95)' : 'rgba(99, 102, 241, 0.5)';
      }

      ctx.fillStyle = ctaGrad;
      ctx.shadowBlur = isSecCta ? 45 : 30;
      ctx.beginPath();
      ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 28);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Geist, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${hookCopy.ctaText} →`, width / 2, ctaY + ctaH / 2);
      ctx.restore();

      // App Store & Google Play vector badges on canvas
      if (hookCopy.showStoreBadges !== false) {
        ctx.save();
        const badgeY = ctaY + ctaH + 16;
        const bW = 210;
        const bH = 50;
        const totalW = bW * 2 + 16;
        const startX = (width - totalW) / 2;

        // Apple Badge Box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(startX, badgeY, bW, bH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Geist, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(' App Store', startX + bW / 2, badgeY + bH / 2);

        // Google Play Badge Box
        ctx.beginPath();
        ctx.roundRect(startX + bW + 16, badgeY, bW, bH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillText('▶ Google Play', startX + bW + 16 + bW / 2, badgeY + bH / 2);
        ctx.restore();
      }
    };

    // Expose render function directly on canvas DOM element for exportPipeline video recording
    (canvas as any).__renderScene = (sec: number) => {
      renderScene(sec);
    };

    renderScene(timeline.currentTime);
  }, [aspectRatio, activeAsset, hookCopy, backgroundConfig, canvasRef, timeline.currentTime, timeline.isPlaying, deviceConfig]);

  const frameStyle = getDeviceFrameStyle(aspectRatio, deviceConfig.model);
  const chassis = getChassisDetails(deviceConfig.color, deviceConfig.model);

  // Dynamic 3D motion angles based on active motionPreset and playback
  let animYaw = 0;
  let animPitch = 0;
  let animRoll = 0;
  let animY = 0;
  let punchScale = 1.0;

  if (timeline.isPlaying && !isDeviceDragging) {
    const t = timeline.currentTime;
    if (deviceConfig.motionPreset === 'Floating Drift') {
      animYaw = Math.sin(t * 1.8) * 4;
      animPitch = Math.cos(t * 1.4) * 2.5;
      animRoll = Math.sin(t * 1.0) * 1.2;
      animY = Math.sin(t * 2.2) * 7;
    } else if (deviceConfig.motionPreset === 'Zoom In Punch') {
      const isPunch = (t % 3.0) < 1.0;
      punchScale = isPunch ? 1.07 : 1.0;
      animYaw = Math.sin(t * 2.5) * 2;
      animPitch = Math.cos(t * 2.0) * 1.5;
      animY = isPunch ? -5 : 0;
    } else if (deviceConfig.motionPreset === 'Isometric 45°') {
      animYaw = Math.sin(t * 1.2) * 3;
      animPitch = Math.cos(t * 1.0) * 2;
      animY = Math.sin(t * 1.8) * 5;
    }
  }

  return (
    <main
      id="adcraft-center-stage"
      className="flex-1 flex flex-col studio-canvas-bg relative z-10 overflow-hidden select-none border-r border-white/[0.06]"
    >
      {/* Top Control Bar: Format & Hardware */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#090C13]/95 backdrop-blur-md border-b border-white/[0.06] gap-2 flex-wrap">
        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1 bg-[#0F131D] border border-white/[0.08] p-1 rounded-xl shadow-inner shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setAspectRatio('9:16');
            }}
            className={`px-2.5 py-1 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap ${
              aspectRatio === '9:16'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>9:16 TikTok</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setAspectRatio('1:1');
            }}
            className={`px-2.5 py-1 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap ${
              aspectRatio === '1:1'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Crop className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'tr' ? '1:1 Akış' : '1:1 Feed'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setAspectRatio('16:9');
            }}
            className={`px-2.5 py-1 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap ${
              aspectRatio === '16:9'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 shrink-0" />
            <span>16:9 YT</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setAspectRatio('2:3');
            }}
            className={`px-2.5 py-1 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap ${
              aspectRatio === '2:3'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'tr' ? '2:3 Mağaza' : '2:3 Store'}</span>
          </button>
        </div>

        {/* Device Model & Color Dropdowns */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0F131D] border border-white/[0.08] text-white font-['JetBrains_Mono'] text-xs cursor-pointer hover:border-white/20 transition-colors shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={deviceConfig.model}
              onChange={(e) => setDeviceModel(e.target.value as DeviceModel)}
              className="bg-transparent text-white border-none focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[125px] truncate"
            >
              <option value="iPhone 16 Pro" className="bg-slate-900 text-white">
                iPhone 16 Pro
              </option>
              <option value="Pixel 9 Pro" className="bg-slate-900 text-white">
                Pixel 9 Pro
              </option>
              <option value="iPad Pro M4" className="bg-slate-900 text-white">
                iPad Pro M4
              </option>
              <option value="MacBook Pro M3" className="bg-slate-900 text-white">
                MacBook Pro M3
              </option>
              <option value="Minimalist Frame" className="bg-slate-900 text-white">
                {language === 'tr' ? 'Minimal Çerçeve' : 'Minimal Frame'}
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-[#0F131D] border border-white/[0.08] text-white font-['JetBrains_Mono'] text-xs cursor-pointer hover:border-white/20 transition-colors shrink-0">
            <Palette className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={deviceConfig.color}
              onChange={(e) => setDeviceColor(e.target.value as DeviceColor)}
              className="bg-transparent text-white border-none focus:outline-none cursor-pointer max-w-[95px] sm:max-w-[115px] truncate"
            >
              <option value="Titanium Black" className="bg-[#0F131D] text-white">
                Titanium Black
              </option>
              <option value="Natural Titanium" className="bg-[#0F131D] text-white">
                Natural Titanium
              </option>
              <option value="Desert Titanium" className="bg-[#0F131D] text-white">
                Desert Titanium
              </option>
              <option value="White Titanium" className="bg-[#0F131D] text-white">
                White Titanium
              </option>
              <option value="Obsidian" className="bg-[#0F131D] text-white">
                Obsidian
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub-toolbar: Viewport Controls & 3D Perspective Indicator */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-[#080B11]/90 border-b border-white/[0.04] gap-2 shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          {/* AI Auto-Crop Button */}
          <button
            id="open-autocrop-btn"
            onClick={() => {
              soundEngine.playClick();
              setAutoCropModalOpen(true, activeAssetId);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap cursor-pointer ${
              activeAsset?.cropConfig?.isAutoCropped
                ? 'bg-cyan-500/15 border border-cyan-500/60 text-cyan-300 ring-1 ring-cyan-500/30 shadow-cyan-950/40'
                : 'bg-[#0F131D] border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20'
            }`}
            title={
              language === 'tr'
                ? 'Ekran kaydını 9:16 dikey TikTok ve Reels oranına kırp'
                : 'Auto-crop raw screen recording to 9:16 for TikTok and Reels'
            }
          >
            <Crop className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Auto-Crop 9:16</span>
            {activeAsset?.cropConfig?.isAutoCropped && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          {/* Safe Zones Button & Platform Switcher */}
          <div className="flex items-center gap-1">
            <button
              id="safeZoneBtn"
              onClick={() => {
                soundEngine.playClick();
                toggleSafeZones();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                showSafeZones
                  ? 'bg-indigo-600/25 border border-indigo-500/50 text-indigo-300'
                  : 'bg-[#0F131D] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Grid className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'tr' ? 'Güvenli Alan' : 'Safe Zones'}</span>
            </button>

            {showSafeZones && (
              <div className="flex items-center bg-[#0B0E17] border border-indigo-500/30 rounded-lg p-0.5 text-[10px] font-['JetBrains_Mono']">
                {(['TikTok', 'Reels', 'Shorts'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => {
                      soundEngine.playClick();
                      setSafeZonePlatform(plat);
                    }}
                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                      safeZonePlatform === plat
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Perspective Preset Chips */}
          <div className="hidden md:flex items-center gap-1 bg-[#0F131D] border border-white/[0.08] p-0.5 rounded-lg text-[10px] font-['JetBrains_Mono']">
            <button
              onClick={() => {
                soundEngine.playClick();
                setDeviceAngles({ yaw: 0, pitch: 0, roll: 0 });
              }}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                deviceConfig.yaw === 0 && deviceConfig.pitch === 0
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              0° Front
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setDeviceAngles({ yaw: 14, pitch: -4, roll: 0 });
              }}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                deviceConfig.yaw === 14 && deviceConfig.pitch === -4
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              14° Hero
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setDeviceAngles({ yaw: 28, pitch: -12, roll: 0 });
              }}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                deviceConfig.yaw === 28 && deviceConfig.pitch === -12
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              28° Iso
            </button>
          </div>

          {/* Reset View Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setDeviceAngles({ yaw: 12, pitch: -3, roll: 0 });
              setCanvasZoom(100);
            }}
            className="p-1 rounded-lg bg-[#0F131D] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors shrink-0 cursor-pointer"
            title={language === 'tr' ? 'Tuval Görünümünü Sıfırla' : 'Reset Canvas View'}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        {/* 3D Angle Indicator, CTR & Stage Resolution Telemetry */}
        <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0F131D] border border-white/[0.08] text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>
              {aspectRatio === '9:16'
                ? '1080×1920'
                : aspectRatio === '1:1'
                ? '1080×1080'
                : aspectRatio === '16:9'
                ? '1920×1080'
                : '1080×1620'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 font-medium">60 FPS ProRes</span>
          </div>

          <div
            onMouseDown={handleMouseDown}
            className="px-2.5 py-1 rounded-lg bg-[#0F131D] border border-white/[0.08] flex items-center gap-1.5 text-slate-300 text-[11px] cursor-grab active:cursor-grabbing hover:border-cyan-500/60 transition-colors"
            title={language === 'tr' ? '3D Açıyı Değiştirmek İçin Sürükleyin' : 'Drag to adjust 3D perspective angle'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>
              {language === 'tr' ? '3D Açı' : 'Yaw'}:{' '}
              {deviceConfig.yaw > 0 ? `+${deviceConfig.yaw}°` : `${deviceConfig.yaw}°`}
            </span>
            <Move className="w-3 h-3 text-slate-500 shrink-0" />
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
            <Zap className="w-3 h-3 shrink-0" />
            <span>{hookCopy.predictedCtrBoost || (language === 'tr' ? '+%38 Tahmini TO' : '+38% Predicted CTR')}</span>
          </div>
        </div>
      </div>

      {/* Center Viewport Stage */}
      <div
        className="relative flex-1 flex items-center justify-center p-6 overflow-hidden min-h-[500px]"
        style={{
          perspective: '1200px'
        }}
      >
        {/* Background Atmosphere Layers - Supporting all 8 presets */}
        {backgroundConfig.preset === 'Cyber Grid 3D' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-[#07080D] to-cyan-950/30" />
            <div className="absolute inset-0 bg-[radial-gradient(#4cd7f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
            <div className="absolute -top-16 -left-16 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>
        )}

        {backgroundConfig.preset === 'Blurred Gameplay' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={activeAsset?.thumbnailUrl || activeAsset?.url || ''}
              alt="Blurred ambient background"
              className="w-full h-full object-cover scale-125 blur-2xl opacity-40 brightness-75"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}

        {(backgroundConfig.preset === 'Neon Mesh' || backgroundConfig.preset === 'Obsidian Studio') && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#131824] via-[#090C12] to-[#040609]" />
            <div className="absolute top-0 inset-x-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_70%)]" />
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-[radial-gradient(ellipse_at_bottom,rgba(148,163,184,0.04),transparent_60%)]" />
          </div>
        )}

        {backgroundConfig.preset === 'Studio Floor' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-[#0B0E15] to-[#07080D]" />
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-indigo-500/15 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-4/5 h-20 rounded-[100%] bg-indigo-500/25 blur-2xl" />
          </div>
        )}

        {backgroundConfig.preset === 'Aurora Borealis' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#051b14] via-[#092d24] to-[#1b1233]" />
            <div className="absolute top-10 left-1/4 w-[500px] h-[350px] rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] rounded-full bg-purple-500/15 blur-3xl animate-pulse" />
          </div>
        )}

        {backgroundConfig.preset === 'Midnight Luxury' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#141A24] via-[#0B0F16] to-[#040609]" />
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/5 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.08),transparent_70%)]" />
          </div>
        )}

        {backgroundConfig.preset === 'Sunset Radiant' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#431407] via-[#881337] to-[#090D16]" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-500/15 blur-3xl" />
          </div>
        )}

        {backgroundConfig.preset === 'Clean Studio' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[#0F131A]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(11,15,22,0.95)_100%)]" />
          </div>
        )}

        {/* 3D Container Box with Dynamic MotionPreset Perspective Transform */}
        <div
          id="mockup-device-wrapper"
          onMouseDown={handleMouseDown}
          style={{
            transform: `scale(${(canvasZoom / 100) * punchScale}) translateY(${animY}px) rotateY(${deviceConfig.yaw + animYaw}deg) rotateX(${deviceConfig.pitch + animPitch}deg) rotateZ(${deviceConfig.roll + animRoll}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDeviceDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
            cursor: isDeviceDragging ? 'grabbing' : 'grab'
          }}
          className="relative transition-all"
        >
          {/* Realistic Contact Ground Shadow */}
          <div
            style={{
              width: `calc(${frameStyle.width} * 0.88)`,
              height: '32px',
              transform: 'translateY(16px) rotateX(75deg)',
              filter: 'blur(18px)'
            }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 rounded-[100%] pointer-events-none transition-all duration-150 z-0"
          />

          {/* Titanium Phone Chassis Frame */}
          <div
            style={{
              width: frameStyle.width,
              height: frameStyle.height,
              borderRadius: frameStyle.borderRadius,
              boxShadow: chassis.shadow
            }}
            className={`relative p-2 bg-gradient-to-b ${chassis.gradient} ring-1 ${chassis.ring} transition-all z-10`}
          >
            {/* Inner Display Glass */}
            <div
              style={{
                borderRadius: `calc(${frameStyle.borderRadius} - 8px)`
              }}
              className="relative w-full h-full overflow-hidden bg-black flex flex-col justify-between select-none"
            >
              {/* Dynamic Island Notch (iPhone 16 Pro) */}
              {deviceConfig.model === 'iPhone 16 Pro' && (
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-black z-40 flex items-center justify-between px-2 shadow-inner border border-slate-900/60">
                  <span className="w-2 h-2 rounded-full bg-slate-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
              )}

              {/* Pixel 9 Pro Camera Punch Hole */}
              {deviceConfig.model === 'Pixel 9 Pro' && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black z-40 border border-slate-800 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>
              )}

              {/* MacBook Pro Top Camera Housing */}
              {deviceConfig.model === 'MacBook Pro M3' && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3 rounded-b-md bg-black z-40 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>
              )}

              {/* Media Content Layer (Video or Image) */}
              <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                {activeAsset?.type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={activeAsset.url}
                    poster={activeAsset.thumbnailUrl}
                    loop={timeline.loop}
                    muted
                    playsInline
                    style={
                      activeAsset.cropConfig?.isAutoCropped
                        ? {
                            transform: `scale(${activeAsset.cropConfig.zoom || 1}) translate(${(50 - (activeAsset.cropConfig.focalX ?? 50)) * 0.7}%, ${(50 - (activeAsset.cropConfig.focalY ?? 50)) * 0.7}%)`,
                            transition: 'transform 0.2s ease-out'
                          }
                        : undefined
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    alt="Creative Screenshot"
                    src={activeAsset?.url || activeAsset?.thumbnailUrl}
                    style={
                      activeAsset?.cropConfig?.isAutoCropped
                        ? {
                            transform: `scale(${activeAsset.cropConfig.zoom || 1}) translate(${(50 - (activeAsset.cropConfig.focalX ?? 50)) * 0.7}%, ${(50 - (activeAsset.cropConfig.focalY ?? 50)) * 0.7}%)`,
                            transition: 'transform 0.2s ease-out'
                          }
                        : undefined
                    }
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/45 pointer-events-none" />
                {/* Specular Screen Glass Reflection */}
                <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.14]" />
              </div>

              {/* Platform-Specific Safe Zone Overlay Guides */}
              {showSafeZones && (
                <div className="absolute inset-x-2 top-10 bottom-14 rounded-2xl pointer-events-none z-30 flex flex-col justify-between p-2 border border-dashed border-rose-500/50 bg-rose-500/5">
                  {/* Top boundary indicator */}
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/80 text-white font-['JetBrains_Mono'] text-[9px] font-bold shadow-sm">
                      {safeZonePlatform} {language === 'tr' ? 'Güvenli Alanı' : 'Safe Zone'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/80 text-cyan-400 font-['JetBrains_Mono'] text-[9px] border border-cyan-500/30">
                      {aspectRatio}
                    </span>
                  </div>

                  {/* Simulated Platform-Specific Engagement Rail */}
                  <div className="flex flex-col items-end gap-2.5 pr-1">
                    {safeZonePlatform === 'TikTok' && (
                      <>
                        <div className="relative w-7 h-7 rounded-full bg-slate-800 border border-white/40 flex items-center justify-center shadow-md">
                          <span className="text-[9px] font-bold text-white">AC</span>
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-rose-500 flex items-center justify-center text-white text-[8px] font-bold">
                            +
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">1.4M</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">14.8K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">92K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <Share2 className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">31K</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-black border border-slate-700 flex items-center justify-center animate-spin">
                          <Disc className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      </>
                    )}

                    {safeZonePlatform === 'Reels' && (
                      <>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <Heart className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">840K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">5.2K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <Send className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">22K</span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                          <MoreVertical className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="w-5 h-5 rounded-md bg-slate-800 border border-white/40 flex items-center justify-center">
                          <Volume2 className="w-3 h-3 text-cyan-400" />
                        </div>
                      </>
                    )}

                    {safeZonePlatform === 'Shorts' && (
                      <>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <ThumbsUp className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">490K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <ThumbsDown className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white">Dislike</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">11K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                            <Share2 className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[8px] font-['JetBrains_Mono'] text-white font-semibold">Share</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bottom Platform Caption Safety Margin */}
                  <div className="flex flex-col gap-0.5 text-left text-white/90 drop-shadow pl-1">
                    <span className="font-['Geist'] font-bold text-[9px]">
                      {safeZonePlatform === 'TikTok' ? '@game_studio' : safeZonePlatform === 'Reels' ? 'studio_games' : 'Studio Games'}
                    </span>
                    <span className="text-[8px] text-slate-300 font-['Geist'] line-clamp-1">
                      {safeZonePlatform === 'TikTok'
                        ? '#mobilegame #gaming #fyp #viral'
                        : safeZonePlatform === 'Reels'
                        ? 'Epic Gameplay Update 🚀 · Original audio'
                        : 'Next-Gen Mobile Gaming Trailer 4K'}
                    </span>
                  </div>
                </div>
              )}

              {/* Marketing Hook Banner (Top-Center) with Dynamic HookStyle */}
              <div className="relative z-20 mt-14 px-2.5 flex flex-col items-center text-center">
                <div className={getHookStyleClasses(hookCopy.hookStyle, isHookPhase)}>
                  <p
                    className={`font-['Geist'] text-xs font-black tracking-tight uppercase leading-none drop-shadow ${
                      hookCopy.hookStyle === 'Cyber Glow' ||
                      hookCopy.hookStyle === 'Studio Sleek' ||
                      hookCopy.hookStyle === 'Glassmorphic' ||
                      hookCopy.hookStyle === 'Minimalist'
                        ? 'text-white'
                        : 'text-black'
                    }`}
                  >
                    {hookCopy.headline}
                  </p>
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur text-slate-300 font-['JetBrains_Mono'] text-[10px] tracking-wider border border-white/15">
                  {hookCopy.subHook}
                </span>
              </div>

              {/* Storyboard Phase 3 (Seconds 8-12): Store Rating & Social Proof Floating Badge */}
              {isSocialProofPhase && (
                <div className="relative z-20 mx-auto mt-2 px-3 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/40 shadow-lg flex items-center gap-1.5 animate-in zoom-in-95 duration-200">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-white font-bold text-[11px]">{hookCopy.starRating || '4.9 ★★★★★'}</span>
                  <span className="text-slate-400 text-[9px] font-['JetBrains_Mono']">
                    ({hookCopy.reviewCount || '48K'} {language === 'tr' ? 'Yorum' : 'Reviews'})
                  </span>
                </div>
              )}

              {/* Bottom Gameplay CTA & Soundwave Bar */}
              <div className="relative z-20 mb-4 px-3 flex flex-col gap-2 items-center w-full">
                {/* Audio Beat Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white font-['JetBrains_Mono'] text-[10px] border border-slate-800">
                  <div className="flex items-center gap-0.5">
                    <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
                    <span className="w-0.5 h-3.5 bg-indigo-400 animate-bounce" />
                    <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
                  </div>
                  <span className="truncate max-w-[130px]">{audioConfig.name}</span>
                </div>

                {/* High Conversion Download Button with Dynamic CtaTheme */}
                <div className={getCtaThemeClasses(hookCopy.ctaTheme, isCtaPhase)}>
                  <div className="flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4" />
                    <span>{hookCopy.ctaText}</span>
                  </div>
                  <span className={`text-white text-xs font-black ${isCtaPhase ? 'animate-bounce' : ''}`}>→</span>
                </div>

                {/* App Store & Google Play vector badges on preview */}
                {hookCopy.showStoreBadges !== false && (
                  <div className="flex items-center justify-center gap-1.5 pt-0.5 animate-in fade-in">
                    <div className="px-2 py-0.5 rounded-md bg-black/80 border border-white/20 text-white font-['Geist'] text-[9px] font-semibold flex items-center gap-1 shadow">
                      <span></span>
                      <span>App Store</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-black/80 border border-white/20 text-white font-['Geist'] text-[9px] font-semibold flex items-center gap-1 shadow">
                      <span>▶</span>
                      <span>Google Play</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Quick Controls Dock */}
        <div className="absolute bottom-4 right-6 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-xl z-30 font-['JetBrains_Mono'] text-xs">
          <button
            onClick={() => setCanvasZoom((z) => Math.max(50, z - 10))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={language === 'tr' ? 'Uzaklaştır' : 'Zoom Out'}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-200 px-1 font-medium">{canvasZoom}%</span>
          <button
            onClick={() => setCanvasZoom((z) => Math.min(200, z + 10))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={language === 'tr' ? 'Yakınlaştır' : 'Zoom In'}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-slate-800 mx-0.5" />
          <button
            onClick={() => setCanvasZoom(100)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={language === 'tr' ? 'Yakınlaştırmayı Sıfırla' : 'Reset Zoom'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Offscreen Canvas Ref used for 4K PNG / MP4 export pipeline */}
        <canvas
          id="adcraft-export-canvas"
          ref={canvasRef}
          style={{ position: 'fixed', top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }}
        />
      </div>
    </main>
  );
};
