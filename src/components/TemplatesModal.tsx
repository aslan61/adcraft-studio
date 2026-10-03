import React from 'react';
import { X, Sparkles, Smartphone, Check, ArrowRight } from 'lucide-react';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useTranslation();
  const { setHookCopy, setMotionPreset, setBackgroundPreset, setActiveView } = useAdCraftStore();

  if (!isOpen) return null;

  const templates = [
    {
      id: 'tpl-1',
      name: language === 'tr' ? 'Viral İmkansız Seviye' : 'Viral Impossible Level',
      category: language === 'tr' ? 'Hiper-Gündelik & Atari' : 'Hyper-Casual & Arcade',
      headline: '🔥 ONLY 1% PASS LEVEL 12',
      subHook: language === 'tr' ? 'EN YÜKSEK SKORU GEÇEBİLİR MİSİN?' : 'CAN YOU BEAT HIGH SCORE?',
      cta: language === 'tr' ? 'ÜCRETSİZ OYNA' : 'PLAY FREE',
      archetype: 'Hype / Viral' as const,
      motion: 'Floating Drift' as const,
      bg: 'Cyber Grid 3D' as const,
      hookStyle: 'Cyber Glow' as const,
      ctaTheme: 'Cyber Cyan' as const,
      ctrBoost: '+46% ' + (language === 'tr' ? 'Tahmini TO' : 'Predicted CTR'),
      previewImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxfSbQiRq7-t_aUZjR3gTrCkvOV6i5MbYMCsHZComZw4DyXBgD8Eb__VUT2_4nJaqsDROESc4Waf3IdMP5Vw7GCLtSQorIwm-IBAsCYuDaekK8T2q_nHtb2b0U_jbl4ICtwsB5Dn-cWOhdkP40zjhjl-wPuysVV3yLs_xYM5pgTg-JaeXBAdNWUbL8puzq904YtIu1_A3hOb7_kM3qcptPGsgdo1kKq78eElDl3uHk43-u4Bgl-PVPJQ'
    },
    {
      id: 'tpl-2',
      name: language === 'tr' ? 'Rage Quit / Meydan Okuma' : 'Rage Quit / Friend Challenge',
      category: language === 'tr' ? 'Sosyal TikTok UA' : 'Social TikTok UA',
      headline: '⚠️ MY SISTER SAID I WOULD FAIL',
      subHook: language === 'tr' ? '10 saniyede herkesi yanılttım!' : 'Proved everyone wrong in 10s!',
      cta: language === 'tr' ? 'ŞİMDİ DENE' : 'TRY IT NOW',
      archetype: 'FOMO Urgency' as const,
      motion: 'Zoom In Punch' as const,
      bg: 'Blurred Gameplay' as const,
      hookStyle: 'TikTok Banner' as const,
      ctaTheme: 'Hot Rose' as const,
      ctrBoost: '+48% ' + (language === 'tr' ? 'Tahmini TO' : 'Predicted CTR'),
      previewImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkcCHb8ombOEc1qv3N363Md0jfG3UEBJzz-_uTQIdM4e0rOkh3ToZUPrXj2msRLjAEGUTB8IDjta5ETs9inT_MPQBuCDN93Tvf7bzb-kWAqUh2hRdOmfF1cFamK8aT2zlUb0WjkhfKE1Z-dxvwcOZRT9LBgSiHLZ8nWjkKuFfVl_dak8J5qVQTaDX0pZkTh_ITUdlMt2hwmG_UJp6FlyFdjtjLqBGg1kxabq19C6kTdfE5YYSWV_v5Q'
    },
    {
      id: 'tpl-3',
      name: language === 'tr' ? 'Ödüllü Minimalist Vitrin' : 'Award-Winning Clean Showcase',
      category: language === 'tr' ? 'Mağaza & Premium Marka' : 'Store & Premium Brand',
      headline: 'FOCUS. PRECISION. DOMINATE.',
      subHook: language === 'tr' ? '48.000 kullanıcı tarafından 4.9 ★★★★★ puan' : 'Rated 4.9 ★★★★★ by 48,000 players',
      cta: language === 'tr' ? 'DENEYİMLE' : 'EXPERIENCE IT',
      archetype: 'Minimalist' as const,
      motion: 'Isometric 45°' as const,
      bg: 'Obsidian Studio' as const,
      hookStyle: 'Studio Sleek' as const,
      ctaTheme: 'Electric Indigo' as const,
      ctrBoost: '+34% ' + (language === 'tr' ? 'Tahmini TO' : 'Predicted CTR'),
      previewImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoyRqYAGs7v2Wn1jVaKmSvwbK3fZc9EzocSanYaCasrE-dH34KE1ONSyu1gBKDwXbO6rXXfMyiXb_buGzCcOgNj0PN3Ish3QFwXu6O-Az1d7tHuIMvd8rwYJWIMbf36ShRuLZctjVoneGll8zv-Mltmc09cxebcW-2f-xAQ2-JQMH-WOeoP_KOfGelsSaA3MOWHgYXyXYztJhgbD3R2QmzwXuBTHM1YOgoXF0-CuvsrFj4c5Dhdt-zYQ'
    },
    {
      id: 'tpl-4',
      name: language === 'tr' ? 'IQ & Zeka Bulmacası' : 'IQ & Logic Brain Teaser',
      category: language === 'tr' ? 'Bulmaca & Strateji' : 'Puzzle & Strategy',
      headline: '🧠 IQ 140+ REQUIRED TO SOLVE',
      subHook: language === 'tr' ? 'Sadece %2 doğru pimi çekebiliyor' : 'Only 2% pull the right pin',
      cta: language === 'tr' ? 'KENDİNİ TEST ET' : 'TEST YOUR IQ',
      archetype: 'Problem-Solver' as const,
      motion: 'Zoom In Punch' as const,
      bg: 'Cyber Grid 3D' as const,
      hookStyle: 'TikTok Banner' as const,
      ctaTheme: 'Amber Sunset' as const,
      ctrBoost: '+52% ' + (language === 'tr' ? 'Tahmini TO' : 'Predicted CTR'),
      previewImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxfSbQiRq7-t_aUZjR3gTrCkvOV6i5MbYMCsHZComZw4DyXBgD8Eb__VUT2_4nJaqsDROESc4Waf3IdMP5Vw7GCLtSQorIwm-IBAsCYuDaekK8T2q_nHtb2b0U_jbl4ICtwsB5Dn-cWOhdkP40zjhjl-wPuysVV3yLs_xYM5pgTg-JaeXBAdNWUbL8puzq904YtIu1_A3hOb7_kM3qcptPGsgdo1kKq78eElDl3uHk43-u4Bgl-PVPJQ'
    },
    {
      id: 'tpl-5',
      name: language === 'tr' ? 'Sınırlı Süre Sezon Etkinliği' : 'Limited Event Season Surge',
      category: language === 'tr' ? 'Live-Ops & RPG' : 'Live-Ops & RPG',
      headline: '⚡ 24-HOUR LEGENDARY DROP',
      subHook: language === 'tr' ? 'Bugün katılanlara 100x Ücretsiz Çekiliş' : 'Claim 100x Free Summons Today',
      cta: language === 'tr' ? 'HEDİYEYİ AL' : 'CLAIM REWARD',
      archetype: 'FOMO Urgency' as const,
      motion: 'Isometric 45°' as const,
      bg: 'Blurred Gameplay' as const,
      hookStyle: 'Cyber Glow' as const,
      ctaTheme: 'Emerald Spark' as const,
      ctrBoost: '+41% ' + (language === 'tr' ? 'Tahmini TO' : 'Predicted CTR'),
      previewImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkcCHb8ombOEc1qv3N363Md0jfG3UEBJzz-_uTQIdM4e0rOkh3ToZUPrXj2msRLjAEGUTB8IDjta5ETs9inT_MPQBuCDN93Tvf7bzb-kWAqUh2hRdOmfF1cFamK8aT2zlUb0WjkhfKE1Z-dxvwcOZRT9LBgSiHLZ8nWjkKuFfVl_dak8J5qVQTaDX0pZkTh_ITUdlMt2hwmG_UJp6FlyFdjtjLqBGg1kxabq19C6kTdfE5YYSWV_v5Q'
    },
    {
      id: 'tpl-6',
      name: language === 'tr' ? 'Tatmin Edici ASMR Mekanik' : 'Satisfying ASMR Physics',
      category: language === 'tr' ? 'Simülasyon & Rahatlama' : 'Simulation & Relax',
      headline: '✨ WEIRDLY SATISFYING TO WATCH',
      subHook: language === 'tr' ? 'Stresi 30 saniyede eriten akış' : 'Zero stress, pure dopamine flow',
      cta: language === 'tr' ? 'RAHATLA' : 'RELAX NOW',
      archetype: 'Minimalist' as const,
      motion: 'Floating Drift' as const,
      bg: 'Obsidian Studio' as const,
      hookStyle: 'Glassmorphic' as const,
      ctaTheme: 'Electric Indigo' as const,
      ctrBoost: '+39% ' + (language === 'tr' ? 'Tahmini TO' : 'Predicted CTR'),
      previewImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoyRqYAGs7v2Wn1jVaKmSvwbK3fZc9EzocSanYaCasrE-dH34KE1ONSyu1gBKDwXbO6rXXfMyiXb_buGzCcOgNj0PN3Ish3QFwXu6O-Az1d7tHuIMvd8rwYJWIMbf36ShRuLZctjVoneGll8zv-Mltmc09cxebcW-2f-xAQ2-JQMH-WOeoP_KOfGelsSaA3MOWHgYXyXYztJhgbD3R2QmzwXuBTHM1YOgoXF0-CuvsrFj4c5Dhdt-zYQ'
    }
  ];

  const applyTemplate = (tpl: (typeof templates)[0]) => {
    soundEngine.playWhoosh();
    setHookCopy({
      headline: tpl.headline,
      subHook: tpl.subHook,
      ctaText: tpl.cta,
      toneArchetype: tpl.archetype,
      predictedCtrBoost: tpl.ctrBoost,
      hookStyle: tpl.hookStyle,
      ctaTheme: tpl.ctaTheme
    });
    setMotionPreset(tpl.motion);
    setBackgroundPreset(tpl.bg);
    setActiveView('editor');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-['Geist'] select-none">
      <div className="w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] sticky top-0 bg-[#0A0D15]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              {language === 'tr' ? 'Önceden Tasarlanmış Yüksek Dönüşümlü Reklam Şablonları' : 'Pre-Engineered High-Converting Ad Templates'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 my-2">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className="p-3.5 rounded-2xl bg-[#0D111C]/80 border border-white/[0.06] hover:border-indigo-500/50 hover:bg-[#111726]/90 transition-all cursor-pointer group flex flex-col justify-between shadow-sm"
            >
              <div className="flex flex-col gap-2">
                <div className="h-28 rounded-xl overflow-hidden relative bg-black">
                  <img
                    src={tpl.previewImg}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-cyan-400 font-['JetBrains_Mono'] text-[9px] font-bold">
                    {tpl.ctrBoost}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-indigo-400 font-['JetBrains_Mono'] uppercase font-semibold">
                    {tpl.category}
                  </span>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                    {tpl.name}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    &quot;{tpl.headline}&quot;
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-indigo-400 font-semibold group-hover:text-white">
                <span>{language === 'tr' ? 'Şablonu Uygula' : 'Apply Template'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
