import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  Play,
  Square,
  Sliders,
  CheckCircle2,
  X,
  Clock,
  Radio,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';
import { VoiceoverCue } from '../types';

export const VoiceoverStudioModal: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    isVoiceoverModalOpen,
    setVoiceoverModalOpen,
    projectName,
    hookCopy,
    audioConfig,
    setAudioConfig,
    geminiApiKey
  } = useAdCraftStore();

  const [scriptText, setScriptText] = useState(
    audioConfig.voiceover?.script ||
      (language === 'tr'
        ? 'Dur, sakın bu seviyeyi geçme! Oyuncuların sadece yüzde biri bu drifti tamamlayabiliyor. Hemen ücretsiz oyna!'
        : 'Wait, do not scroll past this level! Only one percent of competitive racers can survive this turn. Play free today!')
  );

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [rate, setRate] = useState<number>(audioConfig.voiceover?.rate || 1.1);
  const [pitch, setPitch] = useState<number>(audioConfig.voiceover?.pitch || 1.05);
  const [volume, setVolume] = useState<number>(audioConfig.voiceover?.volume || 0.9);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingAudition, setIsPlayingAudition] = useState(false);
  const [timedCues, setTimedCues] = useState<VoiceoverCue[]>(
    audioConfig.voiceover?.timedCues || [
      {
        timeRange: '0.0s - 3.0s',
        phase: language === 'tr' ? 'Kanca (Thumbstop)' : 'Thumbstop Hook',
        spokenText: language === 'tr' ? 'Dur, sakın bu seviyeyi geçme!' : 'Wait, do not scroll past this level!'
      },
      {
        timeRange: '3.0s - 8.0s',
        phase: language === 'tr' ? 'Oynanış & Gerilim' : 'Core Gameplay Action',
        spokenText: language === 'tr' ? 'Oyuncuların sadece yüzde biri bu drifti tamamlayabiliyor.' : 'Only 1% of competitive racers can survive this turn.'
      },
      {
        timeRange: '8.0s - 12.0s',
        phase: language === 'tr' ? 'Sosyal Kanıt' : 'Social Proof',
        spokenText: language === 'tr' ? 'İki milyondan fazla aktif oyuncuyla App Store birincisi!' : 'Rated 4.9 stars by over 2 million players worldwide!'
      },
      {
        timeRange: '12.0s - 15.0s',
        phase: language === 'tr' ? 'Dönüşüm CTA' : 'Conversion CTA',
        spokenText: language === 'tr' ? 'Aşağıdaki butona tıkla ve bugün ücretsiz oyna!' : 'Tap the button below now and play free today!'
      }
    ]
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        // Default to a matching language voice if available
        const langPrefix = language === 'tr' ? 'tr' : 'en';
        const match = available.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) || available[0];
        if (match && !selectedVoiceUri) {
          setSelectedVoiceUri(match.voiceURI);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [language, selectedVoiceUri]);

  // Clean up speech synthesis when unmounting or closing
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isVoiceoverModalOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleGenerateScript = async () => {
    soundEngine.playWhoosh();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/voiceover-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          appName: projectName,
          hookHeadline: hookCopy.headline,
          subHook: hookCopy.subHook,
          ctaText: hookCopy.ctaText,
          toneArchetype: hookCopy.toneArchetype,
          durationSec: 15,
          language
        })
      });

      const data = await res.json();
      if (data.success && data.voiceover) {
        soundEngine.playSuccess();
        if (data.voiceover.fullScript) {
          setScriptText(data.voiceover.fullScript);
        }
        if (Array.isArray(data.voiceover.timedCues)) {
          setTimedCues(data.voiceover.timedCues);
        }
        showToast(language === 'tr' ? 'Yapay zekâ seslendirme metni üretildi!' : 'AI Voiceover script synthesized!');
      }
    } catch (err) {
      console.warn('Notice generating voiceover:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudition = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlayingAudition) {
      window.speechSynthesis.cancel();
      setIsPlayingAudition(false);
      return;
    }

    soundEngine.playClick();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (selectedVoiceUri) {
      const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceUri);
      if (chosenVoice) utterance.voice = chosenVoice;
    }

    utterance.onstart = () => setIsPlayingAudition(true);
    utterance.onend = () => setIsPlayingAudition(false);
    utterance.onerror = () => setIsPlayingAudition(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudition = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudition(false);
    }
  };

  const handleApplyToCreative = () => {
    soundEngine.playSuccess();
    setAudioConfig({
      voiceover: {
        enabled: true,
        script: scriptText,
        voiceName: selectedVoiceUri,
        pitch,
        rate,
        volume,
        language: language === 'tr' ? 'tr-TR' : 'en-US',
        timedCues
      }
    });

    showToast(t.voiceoverStudio.syncedSuccess);
    setTimeout(() => {
      setVoiceoverModalOpen(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-['Geist'] select-none">
      <div className="relative w-full max-w-4xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#07080D]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                {t.voiceoverStudio.title}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Web Speech & AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">{t.voiceoverStudio.subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopAudition();
              setVoiceoverModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Generation Prompt Trigger Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/20 border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {language === 'tr'
                    ? 'Yapay zekâ ile TikTok & Reels için optimize edilmiş seslendirme oluştur'
                    : 'Synthesize retention-optimized voiceover script with AI'}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Gemini 2.5 Flash • {hookCopy.headline} • {hookCopy.toneArchetype}
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all shrink-0"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.voiceoverStudio.generatingScript}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.voiceoverStudio.generateScript}</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Spoken Textarea & Timed Cues */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    {t.voiceoverStudio.spokenScript}
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {scriptText.split(/\s+/).filter(Boolean).length} {language === 'tr' ? 'kelime' : 'words'} (~15s)
                  </span>
                </div>

                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder={t.voiceoverStudio.scriptPlaceholder}
                  rows={4}
                  className="w-full bg-[#07080D] border border-white/[0.08] rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-['Geist'] leading-relaxed"
                />
              </div>

              {/* Timed Breakdown Cues */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {language === 'tr' ? '15 Saniyelik Reklam Zaman Senkronizasyonu' : '15-Second Ad Synchronized Cues'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {timedCues.map((cue, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#07080D] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                          {cue.timeRange}
                        </span>
                        <span className="text-[11px] font-medium text-slate-300">{cue.phase}</span>
                      </div>
                      <p className="text-xs text-slate-400 italic line-clamp-2 mt-1">"{cue.spokenText}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Voice Tuning & Live Audition */}
            <div className="space-y-5 bg-[#0D111C]/80 p-4 rounded-xl border border-white/[0.06]">
              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  {t.voiceoverStudio.voiceSelection}
                </label>
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => setSelectedVoiceUri(e.target.value)}
                  className="w-full bg-[#0D111C] border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{t.voiceoverStudio.speed}</span>
                    <span className="font-mono text-indigo-400">{rate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.6"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{t.voiceoverStudio.pitch}</span>
                    <span className="font-mono text-indigo-400">{pitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{t.voiceoverStudio.volume}</span>
                    <span className="font-mono text-indigo-400">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Waveform Visualization & Audition Button */}
              <div className="pt-2 border-t border-white/[0.06] space-y-3">
                <div className="h-10 rounded-lg bg-[#07080D] border border-white/[0.06] flex items-center justify-center gap-1 px-3 overflow-hidden">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full bg-indigo-500 transition-all duration-150 ${
                        isPlayingAudition
                          ? 'animate-pulse'
                          : 'opacity-30'
                      }`}
                      style={{
                        height: isPlayingAudition
                          ? `${Math.max(15, Math.sin(i * 0.7 + Date.now() / 150) * 85)}%`
                          : `${20 + (i % 5) * 10}%`
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePlayAudition}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isPlayingAudition
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {isPlayingAudition ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>{t.voiceoverStudio.stopAudition}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{t.voiceoverStudio.playAudition}</span>
                      </>
                    )}
                  </button>

                  {isPlayingAudition && (
                    <button
                      onClick={handleStopAudition}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-[#07080D]/90">
          <p className="text-xs text-slate-500">{t.voiceoverStudio.browserTtsNotice}</p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handleStopAudition();
                setVoiceoverModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleApplyToCreative}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.voiceoverStudio.syncToTimeline}</span>
            </button>
          </div>
        </div>

        {/* Floating Toast */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
