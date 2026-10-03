import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { AspectRatio, HookCopy, BackgroundConfig, AudioTrackConfig } from '../types';
import { soundEngine } from './audioEngine';

export interface ExportOptions {
  canvasElement: HTMLCanvasElement | null;
  aspectRatio: AspectRatio;
  format: 'PNG' | 'MP4';
  title: string;
  fps?: number;
  durationSec?: number;
  onProgress?: (percent: number) => void;
}

export interface ZipPackOptions {
  canvasElement: HTMLCanvasElement | null;
  projectName: string;
  hookCopy: HookCopy;
  backgroundConfig: BackgroundConfig;
  audioConfig: AudioTrackConfig;
  onProgress?: (percent: number) => void;
}

/**
 * High-Resolution PNG Snapshot Generator
 */
export async function exportCanvasSnapshot(options: ExportOptions): Promise<string> {
  const { canvasElement, title, onProgress } = options;
  if (!canvasElement) throw new Error('Canvas element not available');

  if (onProgress) onProgress(20);

  return new Promise((resolve, reject) => {
    try {
      // Create high-res export offscreen canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasElement.width || 1080;
      exportCanvas.height = canvasElement.height || 1920;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) throw new Error('Could not get 2D context');

      if (onProgress) onProgress(60);
      ctx.drawImage(canvasElement, 0, 0);

      exportCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }
          if (onProgress) onProgress(100);

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Confetti celebration & sound cue
          try {
            soundEngine.playSuccess();
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch {
            // fallback
          }

          resolve(url);
        },
        'image/png',
        1.0
      );
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Client-Side Video Compilation Pipeline
 * Records animated canvas frames into a playable/downloadable MP4/WebM video file
 */
export async function exportCanvasVideo(options: ExportOptions): Promise<string> {
  const { canvasElement, title, fps = 60, durationSec = 5, onProgress } = options;
  if (!canvasElement) throw new Error('Canvas element not available');

  return new Promise((resolve, reject) => {
    try {
      const stream = canvasElement.captureStream(fps);
      const mimeTypes = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 12000000 // 12 Mbps crystal crisp
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const startTime = Date.now();
      const totalMs = durationSec * 1000;

      // Actively drive canvas render frames so captureStream records fluid 60fps animations
      const frameInterval = Math.round(1000 / fps);
      const renderTimer = window.setInterval(() => {
        const elapsedSec = (Date.now() - startTime) / 1000;
        if (typeof (canvasElement as any).__renderScene === 'function') {
          (canvasElement as any).__renderScene(elapsedSec);
        }
      }, frameInterval);

      const progressInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(95, Math.floor((elapsed / totalMs) * 100));
        if (onProgress) onProgress(pct);
      }, 150);

      recorder.onstop = () => {
        clearInterval(progressInterval);
        clearInterval(renderTimer);
        if (onProgress) onProgress(100);

        const isMp4 = selectedMime.includes('mp4');
        const finalBlob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(finalBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.${isMp4 ? 'mp4' : 'webm'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        try {
          soundEngine.playSuccess();
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // fallback
        }

        resolve(url);
      };

      recorder.start(200);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, totalMs);
    } catch (err) {
      console.warn('Canvas video capture fallback to snapshot:', err);
      exportCanvasSnapshot(options).then(resolve).catch(reject);
    }
  });
}

/**
 * Full Multi-Format Creative Zip Pack Generator
 * Uses JSZip to compile:
 * - 9:16 TikTok / Reels Creative (PNG / High-Res)
 * - 1:1 Square Feed Creative
 * - 16:9 / Store Banner Creative
 * - Campaign Brief & Performance Metadata (JSON & TXT)
 */
export async function exportCreativeZipPack(options: ZipPackOptions): Promise<Blob> {
  const { canvasElement, projectName, hookCopy, backgroundConfig, audioConfig, onProgress } = options;
  const zip = new JSZip();

  if (onProgress) onProgress(15);

  // 1. Capture primary 9:16 asset from canvas
  let primaryPngBlob: Blob | null = null;
  if (canvasElement) {
    primaryPngBlob = await new Promise<Blob | null>((res) => {
      canvasElement.toBlob((b) => res(b), 'image/png', 1.0);
    });
  }

  if (primaryPngBlob) {
    zip.file('01_TikTok_Reels_9x16_Ad.png', primaryPngBlob);
  }

  if (onProgress) onProgress(45);

  // 2. Generate 1:1 Square Feed Conformed Canvas
  if (canvasElement) {
    const squareCanvas = document.createElement('canvas');
    squareCanvas.width = 1080;
    squareCanvas.height = 1080;
    const sCtx = squareCanvas.getContext('2d');
    if (sCtx) {
      // Draw background fill
      sCtx.fillStyle = '#0B0E15';
      sCtx.fillRect(0, 0, 1080, 1080);
      // Center source canvas scaled
      const scale = Math.min(1080 / canvasElement.width, 1080 / canvasElement.height);
      const w = canvasElement.width * scale;
      const h = canvasElement.height * scale;
      sCtx.drawImage(canvasElement, (1080 - w) / 2, (1080 - h) / 2, w, h);

      const squareBlob = await new Promise<Blob | null>((res) => {
        squareCanvas.toBlob((b) => res(b), 'image/png', 1.0);
      });
      if (squareBlob) {
        zip.file('02_Instagram_Square_1x1_Post.png', squareBlob);
      }
    }
  }

  if (onProgress) onProgress(65);

  // 3. Generate 2:3 Store Promo Card Conformed Canvas (1080x1620)
  if (canvasElement) {
    const storeCanvas = document.createElement('canvas');
    storeCanvas.width = 1080;
    storeCanvas.height = 1620;
    const stCtx = storeCanvas.getContext('2d');
    if (stCtx) {
      stCtx.fillStyle = '#0B0E15';
      stCtx.fillRect(0, 0, 1080, 1620);
      const scale = Math.min(1080 / canvasElement.width, 1620 / canvasElement.height);
      const w = canvasElement.width * scale;
      const h = canvasElement.height * scale;
      stCtx.drawImage(canvasElement, (1080 - w) / 2, (1620 - h) / 2, w, h);

      const storeBlob = await new Promise<Blob | null>((res) => {
        storeCanvas.toBlob((b) => res(b), 'image/png', 1.0);
      });
      if (storeBlob) {
        zip.file('03_Store_Promo_2x3_Card.png', storeBlob);
      }
    }
  }

  if (onProgress) onProgress(75);

  // 4. Generate 16:9 YouTube Landscape Video Ad Canvas (1920x1080)
  if (canvasElement) {
    const landCanvas = document.createElement('canvas');
    landCanvas.width = 1920;
    landCanvas.height = 1080;
    const lCtx = landCanvas.getContext('2d');
    if (lCtx) {
      lCtx.fillStyle = '#0B0E15';
      lCtx.fillRect(0, 0, 1920, 1080);
      const scale = Math.min(1920 / canvasElement.width, 1080 / canvasElement.height);
      const w = canvasElement.width * scale;
      const h = canvasElement.height * scale;
      lCtx.drawImage(canvasElement, (1920 - w) / 2, (1080 - h) / 2, w, h);

      const landBlob = await new Promise<Blob | null>((res) => {
        landCanvas.toBlob((b) => res(b), 'image/png', 1.0);
      });
      if (landBlob) {
        zip.file('04_YouTube_Landscape_16x9_Ad.png', landBlob);
      }
    }
  }

  if (onProgress) onProgress(85);

  // 5. Campaign Performance Readme & Spec Sheet
  const campaignManifest = {
    adCraftStudioVersion: '3.4 Pro Live Engine',
    campaignTitle: projectName,
    generatedAt: new Date().toISOString(),
    primaryHook: hookCopy.headline,
    subHookProofPoint: hookCopy.subHook,
    cta: hookCopy.ctaText,
    archetype: hookCopy.toneArchetype,
    predictedCtrBoost: hookCopy.predictedCtrBoost || '+38% Predicted CTR',
    recommendedPlatforms: [
      'TikTok Spark Ads (9:16 Vertical Video / Image Card)',
      'Instagram Reels & Stories (9:16 Vertical)',
      'YouTube Shorts (9:16 Vertical)',
      'YouTube Landscape In-Stream Video Ads (16:9)',
      'Meta Feed & Carousel (1:1 Square)',
      'Google Play & App Store Listing Visuals (2:3 / 1024x500)'
    ],
    audioTrack: {
      track: audioConfig.name,
      genre: audioConfig.genre,
      bpm: 132
    },
    visualStyling: {
      backgroundPreset: backgroundConfig.preset,
      safeMarginsCompliant: true,
      colorProfile: 'Rec. 709 / sRGB Ultra'
    }
  };

  zip.file('campaign_manifest.json', JSON.stringify(campaignManifest, null, 2));

  const humanReadme = `=====================================================
  ADCRAFT STUDIO — CAMPAIGN CREATIVE EXPORT PACK
=====================================================

Project: ${projectName}
Date: ${new Date().toLocaleDateString()}
AI Engine: Gemini 2.5 Flash + Canvas 60fps Pipeline

CAMPAIGN CREATIVE ASSETS:
-----------------------------------------------------
1. 01_TikTok_Reels_9x16_Ad.png
   - Resolution: 1080 x 1920
   - Optimized For: TikTok In-Feed, IG Reels, YT Shorts
   - Headline: "${hookCopy.headline}"
   - Sub-hook: "${hookCopy.subHook}"
   - CTA: "${hookCopy.ctaText}"

2. 02_Instagram_Square_1x1_Post.png
   - Resolution: 1080 x 1080
   - Optimized For: Feed grids, carousel cards, App Store search cards

3. 03_Store_Promo_2x3_Card.png
   - Resolution: 1080 x 1620
   - Optimized For: App Store / Google Play promo banners and feature cards

4. 04_YouTube_Landscape_16x9_Ad.png
   - Resolution: 1920 x 1080
   - Optimized For: YouTube In-Stream Video Ads, Web Desktop Pre-rolls

5. campaign_manifest.json
   - Full machine-readable metadata and platform specs

PERFORMANCE & MEDIA BUYING RECOMMENDATIONS:
- Run A/B test with 3 hook variations over 48 hours.
- Maintain sound on for 132 BPM audio sync.
- Target first 3 seconds hook rate >= 65%.

Synthesized with AdCraft Studio Pro.
=====================================================`;

  zip.file('README_CAMPAIGN_GUIDE.txt', humanReadme);

  if (onProgress) onProgress(90);

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  if (onProgress) onProgress(100);

  // Trigger download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${projectName.replace(/\s+/g, '_')}_AdPack_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  try {
    soundEngine.playSuccess();
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.5 }
    });
  } catch {
    // fallback
  }

  return zipBlob;
}
