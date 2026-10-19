import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundEngine } from '../utils/audioEngine';

export type NotificationType =
  | 'test_reminder'
  | 'test_passed'
  | 'test_failed'
  | 'export_success'
  | 'render_error'
  | 'system'
  | 'performance_alert'
  | 'ad_reward';

export type NotificationPriority = 'high' | 'normal' | 'low';

export type NotificationActionType =
  | 'run_qa_test'
  | 'view_export'
  | 'open_performance'
  | 'open_safezones'
  | 'open_settings'
  | 'custom';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionLabel?: string;
  actionType?: NotificationActionType;
  actionPayload?: unknown;
  category?: string;
  appName?: string;
}

export interface QaTestResultItem {
  id: string;
  title: string;
  category: 'safe_zones' | 'audio' | 'hook' | 'cta' | 'resolution' | 'performance';
  status: 'pass' | 'warning' | 'fail';
  score: number;
  message: string;
  recommendation: string;
}

export interface QaTestSuiteReport {
  timestamp: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  passedCount: number;
  warningCount: number;
  failedCount: number;
  items: QaTestResultItem[];
  platformCompliance: {
    tikTok: boolean;
    reels: boolean;
    shorts: boolean;
    appStore: boolean;
  };
}

interface NotificationState {
  notifications: NotificationItem[];
  isDrawerOpen: boolean;
  activeHeadsUp: NotificationItem | null;
  headsUpTimeoutId: number | null;
  
  // QA Testing State
  isQaTestModalOpen: boolean;
  isTestingInProgress: boolean;
  latestQaReport: QaTestSuiteReport | null;
  lastTestedAt: number | null;
  untestedChangesCount: number;
  lastChangeTimestamp: number;
  
  // Settings & Native Android Integration
  soundEnabled: boolean;
  dndEnabled: boolean; // Do Not Disturb
  testReminderIntervalMinutes: number;
  nativePermission: NotificationPermission;
  isPhoneNotificationSimulated: boolean;

  // Actions
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'> & { id?: string }) => string;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  dismissHeadsUp: () => void;
  
  setQaTestModalOpen: (open: boolean) => void;
  setTestingInProgress: (inProgress: boolean) => void;
  setLatestQaReport: (report: QaTestSuiteReport) => void;
  recordUntestedChange: () => void;
  resetUntestedChanges: () => void;
  triggerTestReminder: (reason?: string) => void;
  
  toggleSound: () => void;
  toggleDnd: () => void;
  requestNativePermission: () => Promise<boolean>;
  togglePhoneNotificationSimulation: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-welcome-qa',
    title: 'Kreatif Güvenlik ve QA Test Motoru Hazır',
    message: 'TikTok, Instagram Reels ve YouTube Shorts için otomatik ön test denetleyicisi devrede.',
    timestamp: Date.now() - 1000 * 60 * 12,
    type: 'system',
    priority: 'normal',
    isRead: false,
    category: 'Sistem QA',
    appName: 'AdCraft Studio'
  },
  {
    id: 'notif-initial-reminder',
    title: '⚠️ Kreatif QA Testi Hatırlatması',
    message: 'Yayına almadan önce güvenli alan, ses ve kanca (hook) uyumluluk testini çalıştırın.',
    timestamp: Date.now() - 1000 * 60 * 4,
    type: 'test_reminder',
    priority: 'high',
    isRead: false,
    actionLabel: 'Testi Başlat',
    actionType: 'run_qa_test',
    category: 'Kreatif Denetim',
    appName: 'AdCraft Studio'
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      isDrawerOpen: false,
      activeHeadsUp: null,
      headsUpTimeoutId: null,

      isQaTestModalOpen: false,
      isTestingInProgress: false,
      latestQaReport: null,
      lastTestedAt: null,
      untestedChangesCount: 1,
      lastChangeTimestamp: Date.now(),

      soundEnabled: true,
      dndEnabled: false,
      testReminderIntervalMinutes: 3,
      nativePermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
      isPhoneNotificationSimulated: true,

      addNotification: (item) => {
        const id = item.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newNotif: NotificationItem = {
          ...item,
          id,
          timestamp: Date.now(),
          isRead: false,
          appName: item.appName || 'AdCraft Studio',
          category: item.category || 'Bildirim'
        };

        const { soundEnabled, dndEnabled, headsUpTimeoutId } = get();

        // Play chime if sounds enabled and not DND
        if (soundEnabled && !dndEnabled) {
          if (newNotif.type === 'test_reminder' || newNotif.type === 'test_failed') {
            soundEngine.playTestAlert();
          } else {
            soundEngine.playAndroidNotification();
          }
        }

        // Trigger native Android OS notification if permission is granted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && !dndEnabled) {
          try {
            const nativeNotif = new Notification(newNotif.title, {
              body: newNotif.message,
              icon: '/favicon.ico',
              tag: newNotif.id,
              silent: !soundEnabled
            });
            nativeNotif.onclick = () => {
              window.focus();
              if (newNotif.actionType === 'run_qa_test') {
                get().setQaTestModalOpen(true);
              } else {
                get().setDrawerOpen(true);
              }
            };
          } catch {
            // Native fallback
          }
        }

        // Trigger Android mobile haptic vibration
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator && !dndEnabled) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {
            // vibration fallback
          }
        }

        // Clear existing heads-up timer if active
        if (headsUpTimeoutId) {
          clearTimeout(headsUpTimeoutId);
        }

        // Show Android Heads-Up Toast if not DND
        let nextTimeoutId: number | null = null;
        if (!dndEnabled) {
          const timeout = window.setTimeout(() => {
            set({ activeHeadsUp: null, headsUpTimeoutId: null });
          }, 6500);
          nextTimeoutId = timeout;
        }

        set((state) => ({
          notifications: [newNotif, ...state.notifications.filter((n) => n.id !== id)].slice(0, 50),
          activeHeadsUp: !dndEnabled ? newNotif : null,
          headsUpTimeoutId: nextTimeoutId
        }));

        return id;
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          activeHeadsUp: state.activeHeadsUp?.id === id ? null : state.activeHeadsUp
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          )
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        }));
      },

      clearAllNotifications: () => {
        soundEngine.playClick();
        set({ notifications: [], activeHeadsUp: null });
      },

      setDrawerOpen: (open) => {
        if (open) {
          soundEngine.playClick();
          // Mark all as read or keep unread markers
        }
        set({ isDrawerOpen: open });
      },

      toggleDrawer: () => {
        soundEngine.playClick();
        set((state) => ({ isDrawerOpen: !state.isDrawerOpen }));
      },

      dismissHeadsUp: () => {
        const { headsUpTimeoutId } = get();
        if (headsUpTimeoutId) clearTimeout(headsUpTimeoutId);
        set({ activeHeadsUp: null, headsUpTimeoutId: null });
      },

      setQaTestModalOpen: (open) => {
        soundEngine.playClick();
        set({ isQaTestModalOpen: open });
      },

      setTestingInProgress: (inProgress) => {
        set({ isTestingInProgress: inProgress });
      },

      setLatestQaReport: (report) => {
        const passed = report.failedCount === 0;
        set({
          latestQaReport: report,
          lastTestedAt: Date.now(),
          untestedChangesCount: 0,
          isTestingInProgress: false
        });

        // Push test completion notification
        get().addNotification({
          title: passed
            ? `✅ Kreatif Test Başarılı (${report.overallScore}/100)`
            : `⚠️ Kreatif Test Uyarıları (${report.overallScore}/100)`,
          message: passed
            ? 'Reklamınız TikTok, Instagram Reels ve YouTube Shorts güvenli alan standartlarına tam uyumlu.'
            : `${report.failedCount} kritik hata ve ${report.warningCount} öneri tespit edildi. Yayın öncesi kontrol edin.`,
          type: passed ? 'test_passed' : 'test_failed',
          priority: passed ? 'normal' : 'high',
          actionLabel: 'Raporu Gör',
          actionType: 'run_qa_test',
          category: 'Kreatif Kalite Denetimi'
        });
      },

      recordUntestedChange: () => {
        set((state) => ({
          untestedChangesCount: state.untestedChangesCount + 1,
          lastChangeTimestamp: Date.now()
        }));
      },

      resetUntestedChanges: () => {
        set({ untestedChangesCount: 0, lastTestedAt: Date.now() });
      },

      triggerTestReminder: (reason?: string) => {
        const { latestQaReport, lastTestedAt } = get();
        const minutesSinceLastTest = lastTestedAt ? Math.round((Date.now() - lastTestedAt) / (1000 * 60)) : null;

        const detail = reason || (minutesSinceLastTest 
          ? `Son testten bu yana ${minutesSinceLastTest} dakika geçti ve kreatif üzerinde değişiklikler yapıldı.`
          : 'Projenizde henüz tam kapsamlı kreatif güvenlik ve uyumluluk testi çalıştırılmadı.');

        get().addNotification({
          title: '⚠️ Kreatif QA Testi Yapılmadı!',
          message: `${detail} TikTok ve Reels formatlarında buton/yazı taşmalarını önlemek için testi başlatın.`,
          type: 'test_reminder',
          priority: 'high',
          actionLabel: 'Testi Başlat',
          actionType: 'run_qa_test',
          category: 'Kreatif Denetim'
        });
      },

      toggleSound: () => {
        soundEngine.playClick();
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      toggleDnd: () => {
        soundEngine.playClick();
        set((state) => ({ dndEnabled: !state.dndEnabled }));
      },

      requestNativePermission: async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          return false;
        }
        try {
          const perm = await Notification.requestPermission();
          set({ nativePermission: perm });
          if (perm === 'granted') {
            soundEngine.playSuccess();
            get().addNotification({
              title: '📲 Android Bildirim İzni Aktif',
              message: 'Kritik kreatif ve QA test bildirimleri doğrudan cihazınızın bildirim çubuğuna aktarılacak.',
              type: 'system',
              priority: 'normal',
              category: 'Cihaz Entegrasyonu'
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      togglePhoneNotificationSimulation: () => {
        soundEngine.playClick();
        set((state) => ({ isPhoneNotificationSimulated: !state.isPhoneNotificationSimulated }));
      }
    }),
    {
      name: 'adcraft-notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 30),
        latestQaReport: state.latestQaReport,
        lastTestedAt: state.lastTestedAt,
        soundEnabled: state.soundEnabled,
        dndEnabled: state.dndEnabled
      })
    }
  )
);
