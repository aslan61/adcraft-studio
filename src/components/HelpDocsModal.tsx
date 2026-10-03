import React from 'react';
import {
  X,
  BookOpen,
  Keyboard,
  ShieldCheck,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

interface HelpDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}

export const HelpDocsModal: React.FC<HelpDocsModalProps> = ({ isOpen, onClose, onOpenShortcuts }) => {
  const { t, language } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-['Geist'] select-none">
      <div className="w-full max-w-2xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-white tracking-tight">
                {language === 'tr' ? 'AdCraft Studio v3.4 Motor & API Belgeleri' : 'AdCraft Studio v3.4 Engine & API Documentation'}
              </h3>
              <span className="text-xs text-slate-400 font-['JetBrains_Mono']">
                {language === 'tr' ? 'Nöral Performans Kreatif Motoru · Mimari & Kısayollar Kılavuzu' : 'Neural Performance Creative Engine · Architecture & Shortcuts Guide'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Keyboard Shortcuts */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-['JetBrains_Mono']">
              <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'tr' ? 'Stüdyo / Kurgu Klavye Kısayolları' : 'Studio DAW / NLE Keyboard Shortcuts'}</span>
            </h4>
            {onOpenShortcuts && (
              <button
                type="button"
                id="help-open-shortcuts-btn"
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                  onOpenShortcuts();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-all group"
              >
                <span>{language === 'tr' ? 'Tüm Kısayolları Görüntüle' : 'View All Shortcuts'}</span>
                <kbd className="px-1 py-0.2 rounded bg-indigo-900/60 border border-indigo-400/40 text-indigo-200 text-[10px] font-mono">?</kbd>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-['JetBrains_Mono']">
            <div className="p-2.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-300">{language === 'tr' ? 'Zaman Çizgisini Oynat / Duraklat' : 'Play / Pause Timeline'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold">
                {language === 'tr' ? 'Boşluk Tuşu' : 'Spacebar'}
              </kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-300">{language === 'tr' ? 'Sesi Aç / Kapat' : 'Mute / Unmute Audio'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold">
                M
              </kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-300">{language === 'tr' ? 'Hızlı 4K Kare Yakala' : 'Quick 4K Snapshot'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold">
                S
              </kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-300">{language === 'tr' ? 'Kısayollar Kılavuzunu Aç' : 'Open Shortcuts Guide'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold">
                ?
              </kbd>
            </div>
          </div>
        </div>

        {/* Section 2: Safe Margins Compliance */}
        <div className="p-4 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex flex-col gap-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-['JetBrains_Mono']">
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'tr' ? 'Kısa Video Güvenli Alan Yönergeleri' : 'Short-Form Safe Zone Guidelines'}</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'tr'
              ? 'TikTok ve Instagram Reels; ses düğmeleri, kullanıcı adı, altyazılar ve sağ eylem çubuğu gibi kalıcı arayüz öğeleri bindirir.'
              : 'TikTok and Instagram Reels overlay persistent UI elements (sound pills, username, captions, action icons on the right rail, and system gesture bars).'}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1 font-['JetBrains_Mono'] text-[11px]">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.05] flex flex-col gap-0.5">
              <strong className="text-amber-400">{language === 'tr' ? 'Üst 120px' : 'Top 120px'}</strong>
              <span className="text-slate-400">{language === 'tr' ? 'Sizin İçin / Takip sekmesi & kamera deliği' : 'For You / Following bar & camera lens'}</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.05] flex flex-col gap-0.5">
              <strong className="text-rose-400">{language === 'tr' ? 'Alt 220px' : 'Bottom 220px'}</strong>
              <span className="text-slate-400">{language === 'tr' ? 'Hesap adı, ses başlığı & ilerleme çubuğu' : 'Account handle, audio title & seekbar'}</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.05] flex flex-col gap-0.5">
              <strong className="text-cyan-400">{language === 'tr' ? 'Sağ 80px' : 'Right 80px'}</strong>
              <span className="text-slate-400">{language === 'tr' ? 'Beğen, Yorum yap, Paylaş buton rayı' : 'Like, Comment, Share & Bookmark rail'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Prompt Engineering Methodology */}
        <div className="p-4 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-['JetBrains_Mono']">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'tr' ? 'Senior Prompt Mühendisliği & UA Master Formülü' : 'Senior Prompt Engineering & UA Master Formula'}</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'tr'
              ? 'AdCraft yapay zekâ motoru (Google Gemini), doğrudan tepki (Direct-Response) psikolojisiyle kancaları 4 temel eksende sentezler:'
              : 'The AdCraft AI engine (Google Gemini) synthesizes high-velocity hooks using direct-response psychological levers:'}
          </p>
          <ul className="text-xs text-slate-300 flex flex-col gap-2 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'tr' ? '1. Kaydırma Durdurma (Thumbstop 0-3s):' : '1. Thumbstop Hook (0-3s):'}</strong>{' '}
                {language === 'tr' ? 'Ego meydan okuması veya örüntü kesintisi (örn. "SADECE %1 BU SEVİYEYİ GEÇTİ", "GECE 3\'TE ASLA OYNAMA").' : 'Ego challenge or pattern interrupt (e.g. "ONLY 1% PASS LEVEL 12", "DO NOT PLAY AT 3AM").'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'tr' ? '2. Merak Boşluğu & Kanıt (Curiosity Gap):' : '2. Proof Point & Curiosity Gap:'}</strong>{' '}
                {language === 'tr' ? 'Sosyal kanıt veya zaman sınırlandırılmış aciliyet (örn. "48.000 oyuncudan 4.9 ★ puan", "Rekor 10 saniyede kırıldı").' : 'Social validation or time-boxed urgency (e.g. "Rated 4.9 ★ by 48,000 players", "World record in 10s").'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'tr' ? '3. Doğrudan Eylem Çağrısı (High-Intent CTA):' : '3. High-Intent Direct CTA:'}</strong>{' '}
                {language === 'tr' ? 'Yüksek enerjili eylem fiilleri (örn. "ÜCRETSİZ OYNA", "REKORU KIR", "ÖDÜLÜ AL").' : 'High-velocity action verbs (e.g. "PLAY FREE", "BEAT RECORD", "CLAIM LOOT").'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'tr' ? '4. Hazır Tohum İstemi İpuçları (Seed Prompts):' : '4. Pro Seed Prompt Tips:'}</strong>{' '}
                {language === 'tr' ? 'Özel istem kutusuna "Rage-quit kancaları", "Tatil hediyesi elmas dağıtımı" veya "ASMR drift mekanikleri" yazarak anında niş varyantlar üretebilirsiniz.' : 'Type "Rage-quit hooks", "Holiday free gem giveaway", or "ASMR drift mechanics" in custom prompt input.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <span className="text-[11px] text-slate-500 font-['JetBrains_Mono']">
            {language === 'tr' ? 'Motor Sürümü: 2026.09-Release · GPU Kümesi Çevrimiçi' : 'Engine Build: 2026.09-Release · GPU Cluster Online'}
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {language === 'tr' ? 'Anladım' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
