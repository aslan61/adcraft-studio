import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Moon,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Zap,
  Trash2,
  X,
  ChevronRight,
  Wifi,
  Signal,
  Battery,
  Sliders,
  Check,
  Eye,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { useNotificationStore, NotificationItem } from '../store/useNotificationStore';
import { useAdCraftStore } from '../store/useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';

interface AndroidNotificationDrawerProps {
  onRunTest?: () => void;
}

export const AndroidNotificationDrawer: React.FC<AndroidNotificationDrawerProps> = ({ onRunTest }) => {
  const {
    notifications,
    isDrawerOpen,
    setDrawerOpen,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    soundEnabled,
    toggleSound,
    dndEnabled,
    toggleDnd,
    setQaTestModalOpen,
    latestQaReport,
    lastTestedAt,
    triggerTestReminder,
    nativePermission,
    requestNativePermission
  } = useNotificationStore();

  const { showSafeZones, toggleSafeZones } = useAdCraftStore();

  // Android Clock in status bar
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isDrawerOpen) return null;

  const handleAction = (notif: NotificationItem) => {
    soundEngine.playClick();
    markAsRead(notif.id);
    if (notif.actionType === 'run_qa_test') {
      setDrawerOpen(false);
      if (onRunTest) onRunTest();
      setQaTestModalOpen(true);
    } else {
      setDrawerOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'test_reminder':
      case 'test_failed':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'test_passed':
      case 'export_success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'render_error':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Şimdi';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    return `${Math.floor(diff / 3600)} sa önce`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-[99990] flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      {/* Background click to close */}
      <div className="flex-1" onClick={() => setDrawerOpen(false)} />

      {/* Android 14/15 Notification Shade & Quick Settings Panel */}
      <div className="w-full max-w-md h-full bg-[#0B0E17]/98 border-l border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col font-['Geist'] animate-in slide-in-from-right duration-300 select-none">
        {/* Android Native Status Bar */}
        <div className="h-10 px-5 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-slate-400 border-b border-white/[0.04] bg-[#080B13]/80">
          <div className="flex items-center gap-2 font-bold text-white tracking-wider">
            <span>{currentTime || '16:21'}</span>
            {dndEnabled && <Moon className="w-3 h-3 text-amber-400 ml-1" />}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">AdCraft 5G</span>
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1 text-slate-200 font-medium">
              <span className="text-[11px]">98%</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Android Quick Settings Grid (Material You Tiles) */}
        <div className="p-4 border-b border-white/[0.06] bg-[#0E121E]/60">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Quick Tile 1: QA Test Runner */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setDrawerOpen(false);
                if (onRunTest) onRunTest();
                setQaTestModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600/30 to-indigo-500/20 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all group cursor-pointer shadow-sm active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                {latestQaReport && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-['JetBrains_Mono']">
                    {latestQaReport.overallScore}/100
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-xs font-bold text-white block group-hover:text-indigo-200">
                  Kreatif QA Testi
                </span>
                <span className="text-[10px] text-slate-400 block font-['JetBrains_Mono']">
                  {lastTestedAt ? 'Test Sonuçları Hazır' : '⚠️ Test Yapılmadı'}
                </span>
              </div>
            </button>

            {/* Quick Tile 2: Safe Zones Guide */}
            <button
              onClick={() => {
                soundEngine.playClick();
                toggleSafeZones();
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-sm active:scale-98 ${
                showSafeZones
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-md ${
                    showSafeZones ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold">
                  {showSafeZones ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs font-bold block">Güvenli Alanlar</span>
                <span className="text-[10px] text-slate-400 block">TikTok / Reels Kılavuzu</span>
              </div>
            </button>

            {/* Quick Tile 3: Notification Sounds */}
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 ${
                soundEnabled
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    soundEnabled ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="text-[11px] font-bold block">Bildirim Sesi</span>
                  <span className="text-[9px] text-slate-400 block font-['JetBrains_Mono']">
                    {soundEnabled ? 'Android Zil Sesi' : 'Sessiz'}
                  </span>
                </div>
              </div>
            </button>

            {/* Quick Tile 4: Do Not Disturb (DND) */}
            <button
              onClick={toggleDnd}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 ${
                dndEnabled
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    dndEnabled ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold block">Rahatsız Etme</span>
                  <span className="text-[9px] text-slate-400 block font-['JetBrains_Mono']">
                    {dndEnabled ? 'DND Aktif' : 'Tüm Bildirimler'}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Native Android OS Notification Integration Pill */}
        {nativePermission !== 'granted' ? (
          <div className="px-4 py-2.5 bg-indigo-950/40 border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Android Sistem Bildirimleri</span>
                <span className="text-[10px] text-slate-400">Tarayıcı arkadayken test hatırlatmalarını al</span>
              </div>
            </div>
            <button
              onClick={requestNativePermission}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow transition-all cursor-pointer whitespace-nowrap"
            >
              İzin Ver
            </button>
          </div>
        ) : (
          <div className="px-4 py-1.5 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android Sistem Bildirimleri: Aktif</span>
            </div>
            <span className="text-[10px] text-slate-400 font-['JetBrains_Mono']">OS Push Hazır</span>
          </div>
        )}

        {/* Notification Drawer Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0A0E18]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Bildirimler
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {unreadCount} yeni
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Tümünü Okundu İşaretle"
              >
                Tümü Okundu
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Tümünü Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-3">
                <BellOff className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-semibold text-slate-300">Yeni Bildirim Yok</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                Tüm kreatif testleri ve render işlemleri güncel. Yeni bir uyarı geldiğinde burada görünecek.
              </p>
              <button
                onClick={() => triggerTestReminder('Kullanıcı manuel test kontrolü başlattı.')}
                className="mt-4 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all cursor-pointer"
              >
                Örnek Test Bildirimi Gönder
              </button>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`relative rounded-2xl border p-3.5 transition-all group ${
                  notif.isRead
                    ? 'bg-[#0F1321]/60 border-white/[0.05] opacity-80'
                    : 'bg-[#121727] border-white/[0.12] shadow-md shadow-black/40'
                }`}
              >
                {/* Android App Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center p-0.5">
                      <Play className="w-2 h-2 text-white fill-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 tracking-wider font-['JetBrains_Mono']">
                      {notif.appName || 'ADCRAFT STUDIO'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] text-indigo-300">{notif.category || 'QA'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-['JetBrains_Mono']">
                      {formatTimestamp(notif.timestamp)}
                    </span>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-white transition-opacity cursor-pointer"
                      title="Bildirimi Sil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Notification Content */}
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] mt-0.5 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {notif.actionLabel && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAction(notif)}
                      className="px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>{notif.actionLabel}</span>
                      <ChevronRight className="w-3 h-3 opacity-70" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Android Drawer Footer Pull Handle */}
        <div className="p-3 border-t border-white/[0.06] bg-[#080B13] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-['JetBrains_Mono']">Android 14 System UI</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-[11px] text-slate-400 hover:text-white font-medium cursor-pointer"
          >
            Kapat (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
