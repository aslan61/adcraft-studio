import { AspectRatio, ToneArchetype, MotionPreset, BackgroundPreset, HookStyle, CtaTheme } from '../types';

export interface AdVariationItem {
  id: string;
  headline: string;
  subHook: string;
  cta: string;
  archetype: ToneArchetype;
  motion: MotionPreset;
  bg: BackgroundPreset;
  predictedCtr: string;
  aspectRatio: AspectRatio;
  hookStyle?: HookStyle;
  ctaTheme?: CtaTheme;
}

export const INITIAL_VARIATIONS_EN: AdVariationItem[] = [
  {
    id: 'var-01',
    headline: '🔥 ONLY 1% PASS LEVEL 12',
    subHook: 'Can you beat high score?',
    cta: 'PLAY FREE',
    archetype: 'Hype / Viral',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+44%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-02',
    headline: '⚠️ DO NOT PLAY AT 3AM',
    subHook: 'Most addictive drift game in 2026',
    cta: 'TRY IT NOW',
    archetype: 'FOMO Urgency',
    motion: 'Zoom In Punch',
    bg: 'Blurred Gameplay',
    predictedCtr: '+47%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-03',
    headline: '🧠 ONLY 200+ IQ SURVIVES',
    subHook: 'Test your reaction speed in 5s',
    cta: 'TEST SKILL',
    archetype: 'Problem-Solver',
    motion: 'Isometric 45°',
    bg: 'Obsidian Studio',
    predictedCtr: '+40%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-04',
    headline: 'FOCUS. PRECISION. DOMINATE.',
    subHook: 'Ranked #1 Arcade Game of 2026',
    cta: 'DOWNLOAD',
    archetype: 'Minimalist',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+33%',
    aspectRatio: '1:1'
  },
  {
    id: 'var-05',
    headline: '🚀 LEVEL 99 LOOKS IMPOSSIBLE',
    subHook: 'Watch until the very end!',
    cta: 'BEAT RECORD',
    archetype: 'Hype / Viral',
    motion: 'Zoom In Punch',
    bg: 'Blurred Gameplay',
    predictedCtr: '+45%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-06',
    headline: '⏳ 500,000 GEMS FREE TODAY',
    subHook: 'New multiplayer season live now',
    cta: 'CLAIM LOOT',
    archetype: 'FOMO Urgency',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+49%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-07',
    headline: '⚡ ZERO LAG. PURE 60FPS.',
    subHook: 'Engineered for competitive players',
    cta: 'START PLAYING',
    archetype: 'Problem-Solver',
    motion: 'Isometric 45°',
    bg: 'Obsidian Studio',
    predictedCtr: '+38%',
    aspectRatio: '16:9'
  },
  {
    id: 'var-08',
    headline: 'PRECISION RACING REDEFINED',
    subHook: 'Over 2.4M active racers worldwide',
    cta: 'INSTALL NOW',
    archetype: 'Minimalist',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+35%',
    aspectRatio: '1:1'
  },
  {
    id: 'var-09',
    headline: '💥 PROVED MY FRIENDS WRONG',
    subHook: 'Beat the hardest boss in 12s',
    cta: 'RACE FREE',
    archetype: 'Hype / Viral',
    motion: 'Zoom In Punch',
    bg: 'Blurred Gameplay',
    predictedCtr: '+43%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-10',
    headline: '🚨 SEASON PASS ENDS IN 2 HOURS',
    subHook: 'Unlock legendary cyber livery free',
    cta: 'CLAIM NOW',
    archetype: 'FOMO Urgency',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+48%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-11',
    headline: '🎮 THE GAME EVERYONE IS TALKING ABOUT',
    subHook: 'Join the global tournament today',
    cta: 'PLAY FREE',
    archetype: 'Hype / Viral',
    motion: 'Zoom In Punch',
    bg: 'Obsidian Studio',
    predictedCtr: '+42%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-12',
    headline: 'SPEED IS AN ART FORM',
    subHook: 'Awarded App Store Best of Year',
    cta: 'EXPERIENCE IT',
    archetype: 'Minimalist',
    motion: 'Isometric 45°',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+34%',
    aspectRatio: '2:3'
  }
];

export const INITIAL_VARIATIONS_TR: AdVariationItem[] = [
  {
    id: 'var-01',
    headline: '🔥 SADECE %1 SEVİYE 12\'Yİ GEÇTİ',
    subHook: 'Benim rekorumu kırabilir misin?',
    cta: 'ÜCRETSİZ OYNA',
    archetype: 'Hype / Viral',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+46%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-02',
    headline: '⚠️ GECE 3\'TE ASLA OYNAMA',
    subHook: '2026\'nın en bağımlılık yapan drifti',
    cta: 'HEMEN DENE',
    archetype: 'FOMO Urgency',
    motion: 'Zoom In Punch',
    bg: 'Blurred Gameplay',
    predictedCtr: '+48%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-03',
    headline: '🧠 SADECE 200+ IQ GEÇEBİLİR',
    subHook: 'Refleks hızını 5 saniyede test et',
    cta: 'TEST ET',
    archetype: 'Problem-Solver',
    motion: 'Isometric 45°',
    bg: 'Obsidian Studio',
    predictedCtr: '+41%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-04',
    headline: 'NEON. DRİFT. HÜKMET.',
    subHook: '2026 Yılının 1 Numaralı Arcade Oyunu',
    cta: 'YÜKLE',
    archetype: 'Minimalist',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+34%',
    aspectRatio: '1:1'
  },
  {
    id: 'var-05',
    headline: '🚀 SEVİYE 99 İMKANSIZ GÖRÜNÜYOR',
    subHook: 'Sonuna kadar izle ve gör!',
    cta: 'REKORU KIR',
    archetype: 'Hype / Viral',
    motion: 'Zoom In Punch',
    bg: 'Blurred Gameplay',
    predictedCtr: '+47%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-06',
    headline: '⏳ BUGÜN 500.000 ELMAS ÜCRETSİZ',
    subHook: 'Yeni çok oyunculu sezon şimdi yayında',
    cta: 'ÖDÜLÜ AL',
    archetype: 'FOMO Urgency',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+52%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-07',
    headline: '⚡ SIFIR GECİKME. SAF 60FPS.',
    subHook: 'Rekabetçi oyuncular için tasarlandı',
    cta: 'OYUNA BAŞLA',
    archetype: 'Problem-Solver',
    motion: 'Isometric 45°',
    bg: 'Obsidian Studio',
    predictedCtr: '+39%',
    aspectRatio: '16:9'
  },
  {
    id: 'var-08',
    headline: 'HASSAS YARIŞ YENİDEN DOĞDU',
    subHook: 'Dünya çapında 2.4 milyondan fazla yarışçı',
    cta: 'HEMEN İNDİR',
    archetype: 'Minimalist',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+36%',
    aspectRatio: '1:1'
  },
  {
    id: 'var-09',
    headline: '💥 ARKADAŞLARIMI YANILTTIM',
    subHook: 'En zor bölümü 12 saniyede bitirdim',
    cta: 'YARIŞA KATIL',
    archetype: 'Hype / Viral',
    motion: 'Zoom In Punch',
    bg: 'Blurred Gameplay',
    predictedCtr: '+44%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-10',
    headline: '🚨 SEZON BİLETİ 2 SAATTE BİTİYOR',
    subHook: 'Efsanevi siber kaplamayı ücretsiz aç',
    cta: 'HEMEN KAP',
    archetype: 'FOMO Urgency',
    motion: 'Floating Drift',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+49%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-11',
    headline: '🎮 HERKESİN KONUŞTUĞU O OYUN',
    subHook: 'Bugün global turnuvaya sen de katıl',
    cta: 'ÜCRETSİZ OYNA',
    archetype: 'Hype / Viral',
    motion: 'Zoom In Punch',
    bg: 'Obsidian Studio',
    predictedCtr: '+43%',
    aspectRatio: '9:16'
  },
  {
    id: 'var-12',
    headline: 'HIZ BİR SANAT FORMUDUR',
    subHook: 'App Store Yılın En İyisi Seçildi',
    cta: 'DENEYİMLE',
    archetype: 'Minimalist',
    motion: 'Isometric 45°',
    bg: 'Cyber Grid 3D',
    predictedCtr: '+35%',
    aspectRatio: '2:3'
  }
];

export const INITIAL_VARIATIONS: AdVariationItem[] = INITIAL_VARIATIONS_TR;

export function getInitialVariations(lang: 'tr' | 'en'): AdVariationItem[] {
  return lang === 'tr' ? INITIAL_VARIATIONS_TR : INITIAL_VARIATIONS_EN;
}
