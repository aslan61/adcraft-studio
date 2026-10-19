import React from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  Zap,
  ShieldAlert,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useNotificationStore, NotificationItem } from '../store/useNotificationStore';
import { soundEngine } from '../utils/audioEngine';

interface AndroidHeadsUpBannerProps {
  onRunTest?: () => void;
}

export const AndroidHeadsUpBanner: React.FC<AndroidHeadsUpBannerProps> = ({ onRunTest }) => {
  const { activeHeadsUp, dismissHeadsUp, setDrawerOpen, setQaTestModalOpen } = useNotificationStore();

  if (!activeHeadsUp) return null;

  const handleAction = (item: NotificationItem) => {
    soundEngine.playClick();
    dismissHeadsUp();
    if (item.actionType === 'run_qa_test') {
      if (onRunTest) onRunTest();
      setQaTestModalOpen(true);
    } else {
      setDrawerOpen(true);
    }
  };

  const getIcon = () => {
    switch (activeHeadsUp.type) {
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

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] w-[92vw] max-w-md pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-6">
      {/* Android 14/15 Material You Heads-Up Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#121622]/95 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl p-4 text-white font-['Geist']">
        {/* Subtle accent glow based on type */}
        <div
          className={`absolute -top-12 -left-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${
            activeHeadsUp.type === 'test_reminder' || activeHeadsUp.type === 'test_failed'
              ? 'bg-amber-500'
              : activeHeadsUp.type === 'test_passed'
              ? 'bg-emerald-500'
              : 'bg-indigo-500'
          }`}
        />

        {/* Android App Sub-Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center p-0.5 shadow-sm">
              <Play className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <span className="font-semibold text-slate-200 tracking-wide text-[11px] font-['JetBrains_Mono']">
              {activeHeadsUp.appName || 'ADCRAFT STUDIO'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-indigo-300 font-medium">
              {activeHeadsUp.category || 'Sistem Bildirimi'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-slate-400 font-['JetBrains_Mono']">Şimdi</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              dismissHeadsUp();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Android Notification Body */}
        <div className="pt-2.5 flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-white/[0.05] border border-white/[0.08] shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
              {activeHeadsUp.title}
            </h4>
            <p className="text-[12px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
              {activeHeadsUp.message}
            </p>
          </div>
        </div>

        {/* Android Material Action Pill Buttons */}
        <div className="mt-3.5 pt-2.5 flex items-center justify-end gap-2 border-t border-white/[0.05]">
          <button
            onClick={() => {
              soundEngine.playClick();
              dismissHeadsUp();
              setDrawerOpen(true);
            }}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            Bildirim Merkezi
          </button>

          {activeHeadsUp.actionLabel && (
            <button
              onClick={() => handleAction(activeHeadsUp)}
              className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>{activeHeadsUp.actionLabel}</span>
              <ChevronRight className="w-3 h-3 opacity-70" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
