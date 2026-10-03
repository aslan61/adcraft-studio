import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Keyboard,
  Search,
  Play,
  Volume2,
  Camera,
  Layers,
  Sparkles,
  Command,
  Sliders,
  ExternalLink,
  Laptop,
  History,
  Video
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';
import { useTranslation } from '../i18n/translations';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelpDocs?: () => void;
}

export type ShortcutCategory = 'all' | 'playback' | 'navigation' | 'export';

interface ShortcutItem {
  id: string;
  category: 'playback' | 'navigation' | 'export';
  action: { tr: string; en: string };
  description: { tr: string; en: string };
  macKeys: string[];
  winKeys: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onOpenHelpDocs
}) => {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory>('all');
  const [osMode, setOsMode] = useState<'mac' | 'win'>('mac');

  // Auto-detect user OS on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      if (/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)) {
        setOsMode('mac');
      } else {
        setOsMode('win');
      }
    }
  }, []);

  const shortcutsList: ShortcutItem[] = useMemo(
    () => [
      // Playback & Timeline
      {
        id: 'toggle-play',
        category: 'playback',
        action: {
          tr: 'Zaman Çizgisini Oynat / Duraklat',
          en: 'Play / Pause Timeline'
        },
        description: {
          tr: 'Önizleme oynatımını ve animasyon akışını başlatır veya duraklatır',
          en: 'Toggle video animation and creative motion playback'
        },
        macKeys: ['Space'],
        winKeys: ['Space'],
        icon: Play
      },
      {
        id: 'toggle-audio',
        category: 'playback',
        action: {
          tr: 'Stüdyo Sesini Aç / Sustur',
          en: 'Mute / Unmute Studio Audio'
        },
        description: {
          tr: 'Arka plan müziği, SFX ve mikser sesini anında kapatıp açar',
          en: 'Toggle global soundtrack and UI sound effects volume'
        },
        macKeys: ['M'],
        winKeys: ['M'],
        icon: Volume2
      },
      {
        id: 'quick-snapshot',
        category: 'playback',
        action: {
          tr: 'Hızlı 4K Kare Yakala & İndir',
          en: 'Quick 4K Snapshot & Download'
        },
        description: {
          tr: 'Tuvaldeki aktif kareyi 4K ultra yüksek çözünürlüklü PNG olarak kaydeder',
          en: 'Export current timeline frame as ultra-high resolution 4K PNG'
        },
        macKeys: ['S'],
        winKeys: ['S'],
        icon: Camera
      },
      {
        id: 'quick-video-render',
        category: 'playback',
        action: {
          tr: '60 FPS MP4 Video Render',
          en: 'Render 60fps MP4 Video'
        },
        description: {
          tr: 'Tuval animasyonunu akıcı 60 FPS ProRes / MP4 video olarak işler',
          en: 'Render fluid 60fps ProRes / MP4 animated video file'
        },
        macKeys: ['V'],
        winKeys: ['V'],
        icon: Video
      },

      // Navigation & Views
      {
        id: 'search-assets',
        category: 'navigation',
        action: {
          tr: 'Genel Arama Çubuğuna Odaklan',
          en: 'Focus Global Search'
        },
        description: {
          tr: 'Medya varlıkları, şablonlar ve projeler için arama çubuğunu açar',
          en: 'Quickly highlight search bar for media assets and templates'
        },
        macKeys: ['⌘', 'K'],
        winKeys: ['Ctrl', 'K'],
        icon: Search
      },
      {
        id: 'view-editor',
        category: 'navigation',
        action: {
          tr: 'Stüdyo Düzenleyici Görünümü',
          en: 'Switch to Studio Editor View'
        },
        description: {
          tr: 'Tuval ve zaman çizgisi ana düzenleme ekranına geçiş yapar',
          en: 'Jump to the main creative canvas and timeline editor'
        },
        macKeys: ['1'],
        winKeys: ['1'],
        icon: Layers
      },
      {
        id: 'view-performance',
        category: 'navigation',
        action: {
          tr: 'Performans & Analitik Merkezi',
          en: 'Switch to Performance Hub'
        },
        description: {
          tr: 'Tahmini TO, kanca puanları ve kitle tutma paneline geçer',
          en: 'Inspect predicted CTR, thumbstop retention, and ad metrics'
        },
        macKeys: ['2'],
        winKeys: ['2'],
        icon: Sliders
      },
      {
        id: 'view-variations',
        category: 'navigation',
        action: {
          tr: 'A/B Varyasyonlar Matrisi',
          en: 'Switch to Variations Matrix'
        },
        description: {
          tr: 'Farklı başlık, kanca ve arka plan kombinasyonlarını görüntüler',
          en: 'Inspect and compare 12 parallel creative hooks and angles'
        },
        macKeys: ['3'],
        winKeys: ['3'],
        icon: Sparkles
      },
      {
        id: 'toggle-shortcuts',
        category: 'navigation',
        action: {
          tr: 'Klavye Kısayolları Kılavuzu',
          en: 'Toggle Keyboard Shortcuts Guide'
        },
        description: {
          tr: 'Bu kısayol kılavuzu penceresini istediğiniz zaman açar veya kapatır',
          en: 'Open or close this shortcuts reference modal at any time'
        },
        macKeys: ['?'],
        winKeys: ['?'],
        icon: Keyboard
      },
      {
        id: 'version-history',
        category: 'navigation',
        action: {
          tr: 'Sürüm Geçmişi & Anlık Durumlar',
          en: 'Version History & Snapshots'
        },
        description: {
          tr: 'Kayıtlı kreatif durumlarını inceler ve önceki bir sürüme geri döner',
          en: 'Review saved creative checkpoints and revert to previous versions'
        },
        macKeys: ['⌥', 'H'],
        winKeys: ['Alt', 'H'],
        icon: History
      },

      // Export & Modals
      {
        id: 'export-ad-pack',
        category: 'export',
        action: {
          tr: 'Reklam Paketini Dışa Aktar',
          en: 'Synthesize & Export Ad Pack'
        },
        description: {
          tr: 'Tüm platform boyutları (9:16, 1:1, 16:9, 2:3) için dışa aktarma penceresini açar',
          en: 'Open multichannel creative packaging and ProRes/MP4 exporter'
        },
        macKeys: ['⌘', 'E'],
        winKeys: ['Ctrl', 'E'],
        icon: Sparkles
      },
      {
        id: 'close-modal',
        category: 'export',
        action: {
          tr: 'Aktif Pencereyi / Modalı Kapat',
          en: 'Close Active Modal / Popover'
        },
        description: {
          tr: 'Açık olan tüm pencereleri, ayarları veya kırpma ekranını kapatır',
          en: 'Dismiss any currently open dialog, drawer, or modal window'
        },
        macKeys: ['Esc'],
        winKeys: ['Esc'],
        icon: X
      }
    ],
    []
  );

  // Filtered shortcuts based on category and search query
  const filteredShortcuts = useMemo(() => {
    return shortcutsList.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const actionText = (language === 'tr' ? item.action.tr : item.action.en).toLowerCase();
      const descText = (language === 'tr' ? item.description.tr : item.description.en).toLowerCase();
      const keysText = [...item.macKeys, ...item.winKeys].join(' ').toLowerCase();

      return (
        actionText.includes(q) ||
        descText.includes(q) ||
        keysText.includes(q)
      );
    });
  }, [shortcutsList, selectedCategory, searchQuery, language]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-['Geist'] select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0A0D15]/95 border border-white/[0.08] rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col gap-4 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {t.shortcutsModal.title}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-['JetBrains_Mono'] text-[10px] font-semibold">
                  {filteredShortcuts.length} {language === 'tr' ? 'Kısayol' : 'Shortcuts'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.shortcutsModal.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* OS Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#0D111C] border border-white/[0.06] text-[11px] font-['JetBrains_Mono']">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setOsMode('mac');
                }}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                  osMode === 'mac'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Command className="w-3 h-3" />
                <span>Mac</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setOsMode('win');
                }}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                  osMode === 'win'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3 h-3" />
                <span>Win</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={t.shortcutsModal.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0D111C]/80 border border-white/[0.06] text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.shortcutsModal.all}
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory('playback');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedCategory === 'playback'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.shortcutsModal.playback}
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory('navigation');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedCategory === 'navigation'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.shortcutsModal.navigation}
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory('export');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedCategory === 'export'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.shortcutsModal.export}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.shortcutsModal.searchPlaceholder}
              className="w-full bg-[#0D111C]/90 border border-white/[0.08] rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Shortcuts List View */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[260px] max-h-[440px]">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <Keyboard className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-xs">{t.shortcutsModal.noResults}</p>
            </div>
          ) : (
            filteredShortcuts.map((item) => {
              const Icon = item.icon;
              const keys = osMode === 'mac' ? item.macKeys : item.winKeys;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#0D111C]/70 hover:bg-[#111726]/90 border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white tracking-tight truncate">
                        {language === 'tr' ? item.action.tr : item.action.en}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {language === 'tr' ? item.description.tr : item.description.en}
                      </span>
                    </div>
                  </div>

                  {/* Key Combo Badges */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {keys.map((key, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-slate-500 text-xs font-mono">+</span>}
                        <kbd className="min-w-[26px] h-7 px-2 flex items-center justify-center rounded-md bg-[#161D2B] border border-white/[0.1] text-slate-200 font-['JetBrains_Mono'] text-xs font-bold shadow-[0_2px_0_rgba(0,0,0,0.6)] select-none">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-['JetBrains_Mono'] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t.shortcutsModal.footerTip}
            </span>

            {onOpenHelpDocs && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                  onOpenHelpDocs();
                }}
                className="hidden sm:flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <span>{language === 'tr' ? 'Tüm Motor Dokümantasyonu' : 'Full Engine Docs'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-all active:scale-95"
          >
            {t.shortcutsModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
