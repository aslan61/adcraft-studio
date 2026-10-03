import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Repeat,
  Volume2,
  VolumeX,
  Scissors,
  Sparkles,
  Video,
  Subtitles,
  MousePointerClick,
  Music,
  Check,
  Mic,
  Camera,
  History,
  Target,
  Zap,
  Award,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

export const TimelineSequencer: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    timeline,
    setCurrentTime,
    setIsPlaying,
    togglePlay,
    toggleLoop,
    audioConfig,
    setAudioConfig,
    assets,
    activeAssetId,
    hookCopy,
    activeStoryboard,
    setVoiceoverModalOpen,
    saveSnapshot,
    versions,
    setVersionHistoryModalOpen
  } = useAdCraftStore();

  const activeAsset = assets.find((a) => a.id === activeAssetId) || assets[0];
  const scrubberRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef(timeline.currentTime);
  const [splitMarkers, setSplitMarkers] = useState<number[]>([]);
  const [isFadeActive, setIsFadeActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync ref with external timeline scrub/seek
  useEffect(() => {
    currentTimeRef.current = timeline.currentTime;
  }, [timeline.currentTime]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleSplit = () => {
    soundEngine.playClick();
    const time = timeline.currentTime;
    if (!splitMarkers.includes(time)) {
      setSplitMarkers((prev) => [...prev, time].sort((a, b) => a - b));
      showToast(
        language === 'tr'
          ? `${time.toFixed(1)}s noktasında kesim oluşturuldu`
          : `Split cut created at ${time.toFixed(1)}s`
      );
    }
  };

  const handleToggleFade = () => {
    soundEngine.playWhoosh();
    setIsFadeActive(!isFadeActive);
    showToast(
      !isFadeActive
        ? (language === 'tr' ? 'Video & Ses Çapraz Geçişi Açık' : 'Video & Audio Crossfade Enabled')
        : (language === 'tr' ? 'Çapraz Geçiş Kapatıldı' : 'Crossfade Disabled')
    );
  };

  const handleNudgeFrame = (direction: -1 | 1) => {
    soundEngine.playClick();
    const frameStep = 1 / (timeline.fps || 60);
    const newTime = Math.max(0, Math.min(timeline.totalDuration, timeline.currentTime + direction * frameStep));
    const roundedTime = Math.round(newTime * 100) / 100;
    setCurrentTime(roundedTime);
  };

  // Playhead animation loop when playing
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (timeline.isPlaying) {
        let nextTime = currentTimeRef.current + delta;
        if (nextTime >= timeline.totalDuration) {
          if (timeline.loop) {
            nextTime = 0;
          } else {
            nextTime = timeline.totalDuration;
            setIsPlaying(false);
            soundEngine.stopSoundtrack();
          }
        }
        const preciseTime = Math.round(nextTime * 100) / 100;
        currentTimeRef.current = preciseTime;
        setCurrentTime(preciseTime);
      }
      animId = requestAnimationFrame(loop);
    };

    if (timeline.isPlaying) {
      if (!audioConfig.isMuted && audioConfig.volume > 0) {
        soundEngine.startSoundtrack(audioConfig.volume);
      } else {
        soundEngine.stopSoundtrack();
      }

      if (
        audioConfig.voiceover?.enabled &&
        audioConfig.voiceover.script &&
        !audioConfig.isMuted &&
        audioConfig.volume > 0 &&
        typeof window !== 'undefined' &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(audioConfig.voiceover.script);
        utterance.rate = audioConfig.voiceover.rate || 1.1;
        utterance.pitch = audioConfig.voiceover.pitch || 1.05;
        utterance.volume = (audioConfig.voiceover.volume ?? 0.9) * (audioConfig.volume ?? 1);
        if (audioConfig.voiceover.voiceName) {
          const voices = window.speechSynthesis.getVoices();
          const match = voices.find((v) => v.voiceURI === audioConfig.voiceover!.voiceName);
          if (match) utterance.voice = match;
        }
        window.speechSynthesis.speak(utterance);
      }
    } else {
      soundEngine.stopSoundtrack();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      soundEngine.stopSoundtrack();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    timeline.isPlaying,
    timeline.loop,
    timeline.totalDuration,
    audioConfig.volume,
    audioConfig.isMuted,
    audioConfig.voiceover,
    setCurrentTime,
    setIsPlaying
  ]);

  // Scrub click handler
  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.x));
    const pct = x / rect.width;
    const newTime = parseFloat((pct * timeline.totalDuration).toFixed(1));
    setCurrentTime(newTime);
  };

  const progressPercent = Math.min(100, (timeline.currentTime / timeline.totalDuration) * 100);

  return (
    <div
      id="adcraft-timeline-sequencer"
      className="bg-[#090C13] border-t border-white/[0.06] flex flex-col p-4 shadow-2xl z-20 select-none font-['Geist']"
    >
      {/* Transport Bar */}
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-white/[0.06] flex-wrap gap-2">
        <div className="flex items-center gap-2 shrink-0">
          {/* Frame Step Back */}
          <button
            onClick={() => handleNudgeFrame(-1)}
            className="w-7 h-7 rounded-lg bg-[#0F131D] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title={language === 'tr' ? '1 Kare Geri (-1 Frame)' : 'Step Back 1 Frame'}
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              togglePlay();
            }}
            className="w-8 h-8 rounded-full studio-btn-primary text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
            title={timeline.isPlaying ? (language === 'tr' ? 'Duraklat' : 'Pause') : (language === 'tr' ? 'Önizlemeyi Oynat' : 'Play Preview')}
          >
            {timeline.isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Frame Step Forward */}
          <button
            onClick={() => handleNudgeFrame(1)}
            className="w-7 h-7 rounded-lg bg-[#0F131D] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title={language === 'tr' ? '1 Kare İleri (+1 Frame)' : 'Step Forward 1 Frame'}
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* High Precision Timecode */}
          <div className="flex items-baseline gap-1 font-['JetBrains_Mono'] text-xs ml-1">
            <span className="text-white font-bold">
              00:{timeline.currentTime < 10 ? `0${timeline.currentTime.toFixed(2)}` : timeline.currentTime.toFixed(2)}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">
              00:{timeline.totalDuration < 10 ? `0${timeline.totalDuration.toFixed(2)}` : timeline.totalDuration.toFixed(2)}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-[#0F131D] border border-white/[0.08] text-slate-400 font-['JetBrains_Mono'] text-[11px]">
            {timeline.fps} fps
          </span>
        </div>

        {/* Transport Right: Loop, Volume, VU Meter, Track Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 font-['JetBrains_Mono'] text-xs">
            <button
              onClick={() => {
                soundEngine.playClick();
                toggleLoop();
              }}
              className="p-1 rounded hover:bg-slate-800 transition-colors"
              title={timeline.loop ? (language === 'tr' ? 'Döngü etkin' : 'Loop enabled') : (language === 'tr' ? 'Döngü devre dışı' : 'Loop disabled')}
            >
              <Repeat
                className={`w-3.5 h-3.5 cursor-pointer transition-colors ${
                  timeline.loop ? 'text-indigo-400' : 'text-slate-600'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  const isMuted = audioConfig.isMuted || audioConfig.volume === 0;
                  if (isMuted) {
                    setAudioConfig({ isMuted: false, volume: 0.5 });
                  } else {
                    setAudioConfig({ isMuted: true, volume: 0 });
                  }
                }}
                className="p-0.5 rounded hover:bg-slate-800 transition-colors"
                title={audioConfig.volume === 0 || audioConfig.isMuted ? (language === 'tr' ? 'Sesi Aç' : 'Unmute') : (language === 'tr' ? 'Sesi Kapat' : 'Mute')}
              >
                {audioConfig.volume === 0 || audioConfig.isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioConfig.isMuted ? 0 : audioConfig.volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAudioConfig({ volume: val, isMuted: val === 0 });
                }}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              {/* Animated Audio VU Meter */}
              <div
                className="flex items-end gap-0.5 h-4 px-1 py-0.5 bg-black/60 rounded border border-white/[0.06]"
                title="Realtime Master Audio VU Meter"
              >
                {[0.4, 0.7, 0.9, 0.6, 0.85].map((_, i) => {
                  const isActive = timeline.isPlaying && !audioConfig.isMuted && audioConfig.volume > 0;
                  return (
                    <span
                      key={i}
                      style={{
                        height: isActive
                          ? `${Math.max(20, Math.sin(timeline.currentTime * 12 + i * 1.5) * 45 + 50)}%`
                          : '20%'
                      }}
                      className={`w-0.5 rounded-full transition-all duration-75 ${
                        i >= 4 ? 'bg-rose-500' : i >= 3 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={handleSplit}
              className="px-2.5 py-0.5 rounded bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title={language === 'tr' ? 'İmleç noktasında kesim ekle' : 'Add split cut at current playhead'}
            >
              <Scissors className="w-3 h-3 text-cyan-400" />
              <span>{language === 'tr' ? 'Böl' : 'Split'}</span>
            </button>
            <button
              onClick={handleToggleFade}
              className={`px-2.5 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                isFadeActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={language === 'tr' ? 'Çapraz geçişi aç/kapat' : 'Toggle crossfade transition'}
            >
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>{isFadeActive ? (language === 'tr' ? 'Geçiş Açık' : 'Fade On') : (language === 'tr' ? 'Geçiş' : 'Fade')}</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setVoiceoverModalOpen(true);
              }}
              className="px-2.5 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-colors flex items-center gap-1 cursor-pointer"
              title={language === 'tr' ? 'Yapay Zekâ Seslendirme Stüdyosunu Aç' : 'Open AI Voiceover Studio'}
            >
              <Mic className="w-3 h-3 text-indigo-300" />
              <span>{language === 'tr' ? 'Seslendirme' : 'Voiceover'}</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playSuccess();
                saveSnapshot(undefined, undefined, false);
                setToastMessage(language === 'tr' ? 'Zaman çizelgesi anlık durumu kaydedildi!' : 'Timeline snapshot checkpoint saved!');
                setTimeout(() => setToastMessage(null), 2200);
              }}
              className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
              title={language === 'tr' ? 'Anlık durum kaydet' : 'Save timeline snapshot'}
            >
              <Camera className="w-3 h-3 text-cyan-400" />
              <span>{language === 'tr' ? 'Anlık Kayıt' : 'Snapshot'}</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setVersionHistoryModalOpen(true);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
              title={language === 'tr' ? 'Sürüm Geçmişini Aç' : 'Open Version History'}
            >
              <History className="w-3 h-3 text-indigo-400" />
              <span className="font-mono text-[10px] text-indigo-300 font-semibold">{versions.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="self-center -mt-1 mb-1 px-3 py-1 rounded-full bg-indigo-600/90 border border-indigo-400 text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-1 z-40 flex items-center gap-1.5">
          <Check className="w-3 h-3 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Timeline Tracks Container */}
      <div
        ref={scrubberRef}
        onClick={handleScrubClick}
        className="relative flex flex-col gap-1.5 py-1 cursor-pointer"
      >
        {/* Render Split Cut Markers */}
        {splitMarkers.map((markerTime) => {
          const markerPct = Math.min(100, (markerTime / timeline.totalDuration) * 100);
          return (
            <div
              key={markerTime}
              style={{ left: `calc(144px + (100% - 144px) * ${markerPct / 100})` }}
              className="absolute top-0 bottom-0 w-px bg-amber-400 z-20 pointer-events-none flex flex-col items-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 -mt-1 shadow" />
            </div>
          );
        })}
        {/* Playhead Needle Beam */}
        <div
          style={{ left: `calc(144px + (100% - 144px) * ${progressPercent / 100})` }}
          className="absolute top-0 bottom-0 w-[1.5px] bg-rose-500 z-30 pointer-events-none flex flex-col items-center transition-all duration-75"
        >
          <div className="w-2.5 h-2.5 rotate-45 -mt-1 bg-rose-500 shadow-sm border border-white/40" />
          <div className="px-1.5 py-0.5 rounded bg-slate-900 border border-rose-500/60 text-rose-300 font-['JetBrains_Mono'] text-[10px] font-bold shadow-md -mt-6">
            {timeline.currentTime.toFixed(1)}s
          </div>
        </div>

        {/* AI Storyboard Phase Track */}
        <div className="flex items-center h-6 bg-slate-900/40 border border-indigo-950/60 rounded-lg overflow-hidden relative">
          <div className="w-36 px-2.5 text-indigo-400 font-['JetBrains_Mono'] text-[11px] font-semibold truncate shrink-0 flex items-center gap-1.5 bg-indigo-950/40 h-full border-r border-slate-800/80">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>{language === 'tr' ? 'Yapay Zeka Taslak' : 'AI Storyboard'}</span>
          </div>
          <div className="flex-1 h-full relative flex items-center px-1 gap-1">
            {activeStoryboard && activeStoryboard.scenes.length > 0 ? (
              activeStoryboard.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    const startSec = idx === 0 ? 0 : idx === 1 ? 3 : idx === 2 ? 8 : 12;
                    setCurrentTime(startSec);
                    soundEngine.playClick();
                  }}
                  className="flex-1 h-4 rounded bg-indigo-900/30 hover:bg-indigo-700/40 border border-indigo-500/30 px-1.5 flex items-center justify-between cursor-pointer transition-colors"
                  title={`${scene.phase} (${scene.timeRange}): ${scene.visualAction}`}
                >
                  <span className="text-[10px] text-indigo-200 font-['JetBrains_Mono'] truncate font-medium">
                    {scene.phase}
                  </span>
                  <span className="text-[9px] text-indigo-400 font-['JetBrains_Mono']">
                    {scene.timeRange}
                  </span>
                </div>
              ))
            ) : (
              [
                {
                  phase: language === 'tr' ? 'Kanca / Thumbstop' : 'Hook / Thumbstop',
                  time: '0-3s',
                  start: 0,
                  icon: Target
                },
                {
                  phase: language === 'tr' ? 'Ana Oynanış' : 'Core Action',
                  time: '3-8s',
                  start: 3,
                  icon: Zap
                },
                {
                  phase: language === 'tr' ? 'Sosyal Kanıt' : 'Social Proof',
                  time: '8-12s',
                  start: 8,
                  icon: Award
                },
                {
                  phase: language === 'tr' ? 'CTA & Rozet' : 'CTA & Badge',
                  time: '12-15s',
                  start: 12,
                  icon: MousePointerClick
                }
              ].map((slot, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTime(slot.start);
                    soundEngine.playClick();
                  }}
                  className="flex-1 h-4 rounded bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/40 px-1.5 flex items-center justify-between cursor-pointer transition-colors"
                  title={language === 'tr' ? `İmleci şuraya taşımak için tıklayın: ${slot.phase}` : `Click to jump playhead to ${slot.phase}`}
                >
                  <span className="text-[10px] text-slate-300 font-['JetBrains_Mono'] truncate flex items-center gap-1">
                    <slot.icon className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                    <span>{slot.phase}</span>
                  </span>
                  <span className="text-[9px] text-slate-500 font-['JetBrains_Mono']">
                    {slot.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Track 1: Gameplay Capture */}
        <div className="flex items-center h-8 bg-slate-900/60 border border-slate-800/80 rounded-lg overflow-hidden relative">
          <div className="w-36 px-2.5 text-slate-400 font-['JetBrains_Mono'] text-xs truncate shrink-0 flex items-center gap-1.5 bg-slate-900/90 h-full border-r border-slate-800">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'tr' ? 'Ekran Klibi' : 'Screen Clip'}</span>
          </div>
          <div className="flex-1 h-full relative flex items-center px-1">
            <div className="w-[85%] h-6 bg-indigo-600/25 border border-indigo-500/40 rounded flex items-center px-2.5 justify-between">
              <span className="font-['JetBrains_Mono'] text-xs text-indigo-300 font-medium truncate">
                {activeAsset.name}
              </span>
              <span className="text-[10px] text-indigo-400">00:00 - 00:12</span>
            </div>
          </div>
        </div>

        {/* Track 2: AI Animated Captions / Hooks */}
        <div className="flex items-center h-8 bg-slate-900/60 border border-slate-800/80 rounded-lg overflow-hidden relative">
          <div className="w-36 px-2.5 text-slate-400 font-['JetBrains_Mono'] text-xs truncate shrink-0 flex items-center gap-1.5 bg-slate-900/90 h-full border-r border-slate-800">
            <Subtitles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'tr' ? 'Viral Kancalar' : 'Viral Hooks'}</span>
          </div>
          <div className="flex-1 h-full relative flex items-center px-1">
            <div className="ml-[5%] w-[48%] h-6 bg-amber-500/20 border border-amber-500/40 rounded flex items-center px-2.5 justify-between">
              <span className="font-['JetBrains_Mono'] text-xs text-amber-300 font-semibold truncate">
                {hookCopy.headline}
              </span>
              <span className="text-[10px] text-amber-400">00:01 - 00:07</span>
            </div>
          </div>
        </div>

        {/* Track 3: CTA Stickers & Buttons */}
        <div className="flex items-center h-8 bg-slate-900/60 border border-slate-800/80 rounded-lg overflow-hidden relative">
          <div className="w-36 px-2.5 text-slate-400 font-['JetBrains_Mono'] text-xs truncate shrink-0 flex items-center gap-1.5 bg-slate-900/90 h-full border-r border-slate-800">
            <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'tr' ? 'CTA Butonu' : 'CTA Pill'}</span>
          </div>
          <div className="flex-1 h-full relative flex items-center px-1">
            <div className="ml-[22%] w-[68%] h-6 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center px-2.5 justify-between">
              <span className="font-['JetBrains_Mono'] text-xs text-emerald-300 font-medium truncate">
                {language === 'tr' ? 'Mağaza Rozeti +' : 'Store Badge +'} &apos;{hookCopy.ctaText}&apos; {language === 'tr' ? 'Girişi' : 'Entrance'}
              </span>
              <span className="text-[10px] text-emerald-400">00:03 - 00:15</span>
            </div>
          </div>
        </div>

        {/* Track 4: Audio Track Waveform */}
        <div className="flex items-center h-8 bg-slate-900/60 border border-slate-800/80 rounded-lg overflow-hidden relative">
          <div className="w-36 px-2.5 text-slate-400 font-['JetBrains_Mono'] text-xs truncate shrink-0 flex items-center gap-1.5 bg-slate-900/90 h-full border-r border-slate-800">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'tr' ? 'Müzik Parçası' : 'Soundtrack'}</span>
          </div>
          <div className="flex-1 h-full relative flex items-center px-1">
            <div className="w-[96%] h-6 bg-cyan-500/15 border border-cyan-500/30 rounded flex items-center px-2 justify-between overflow-hidden relative">
              {/* Dynamic Sound Wave SVG */}
              <svg className="w-full h-4 text-cyan-400/70" viewBox="0 0 400 20" preserveAspectRatio="none">
                <path
                  d="M0 10 Q10 2 20 10 T40 10 T60 3 T80 18 T100 8 T120 10 T140 2 T160 17 T180 8 T200 12 T220 2 T240 18 T260 9 T280 12 T300 10 T320 3 T340 18 T360 8 T380 12 T400 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Track 5: AI Voiceover Narration Track */}
        <div
          onClick={() => {
            soundEngine.playClick();
            setVoiceoverModalOpen(true);
          }}
          className="flex items-center h-8 bg-slate-900/60 border border-slate-800/80 rounded-lg overflow-hidden relative cursor-pointer hover:border-indigo-500/50 transition-colors group"
        >
          <div className="w-36 px-2.5 text-slate-400 font-['JetBrains_Mono'] text-xs truncate shrink-0 flex items-center gap-1.5 bg-slate-900/90 h-full border-r border-slate-800 group-hover:text-indigo-300">
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'tr' ? 'AI Seslendirme' : 'AI Voiceover'}</span>
          </div>
          <div className="flex-1 h-full relative flex items-center px-1">
            <div className="w-[92%] h-6 bg-indigo-500/20 border border-indigo-500/40 rounded flex items-center px-2.5 justify-between">
              <span className="font-['JetBrains_Mono'] text-xs text-indigo-200 truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                {audioConfig.voiceover?.script
                  ? `"${audioConfig.voiceover.script.slice(0, 55)}..."`
                  : (language === 'tr' ? 'Yapay zekâ sesli anlatımını yapılandırmak için tıklayın...' : 'Click to configure AI voiceover narration...')}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playClick();
                  if (audioConfig.voiceover?.script) {
                    setAudioConfig({
                      voiceover: {
                        ...audioConfig.voiceover,
                        enabled: !audioConfig.voiceover.enabled
                      }
                    });
                  } else {
                    setVoiceoverModalOpen(true);
                  }
                }}
                className={`text-[10px] font-mono shrink-0 ml-2 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  audioConfig.voiceover?.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40'
                }`}
                title={language === 'tr' ? 'Seslendirmeyi Aç / Kapat' : 'Toggle Voiceover On / Off'}
              >
                {audioConfig.voiceover?.enabled
                  ? (language === 'tr' ? '✓ Açık' : '✓ Active')
                  : (language === 'tr' ? 'Kapalı' : 'Off')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
