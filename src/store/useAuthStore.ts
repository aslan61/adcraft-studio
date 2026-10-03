import { create } from 'zustand';
import { User } from 'firebase/auth';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  UserProfileData,
  PurchaseRecord,
  syncUserProfileOnAuth,
  saveUserProfile,
  incrementUserCreditsFromRewardedAd,
  recordPurchase,
  getUserPurchases
} from '../services/firebase';
import { useAdCraftStore } from './useAdCraftStore';
import { soundEngine } from '../utils/audioEngine';

interface AuthState {
  user: User | null;
  profile: UserProfileData | null;
  purchases: PurchaseRecord[];
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isPricingModalOpen: boolean;
  isAccountModalOpen: boolean;
  isRewardedAdModalOpen: boolean;
  authError: string | null;

  // Actions
  initializeAuth: () => () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loadPurchases: () => Promise<void>;
  setAuthModalOpen: (open: boolean) => void;
  setPricingModalOpen: (open: boolean) => void;
  setAccountModalOpen: (open: boolean) => void;
  setRewardedAdModalOpen: (open: boolean) => void;
  clearAuthError: () => void;
  deductCredits: (amount: number) => boolean;
  getRemainingDailyAds: () => number;
  rewardCreditsFromAd: (creditsEarned?: number, sponsorInfo?: { id?: string; title?: string }) => Promise<boolean>;
}

function formatFirebaseAuthError(err: any, lang: 'tr' | 'en' = 'tr'): string {
  const code = err?.code || '';
  const isTr = lang === 'tr';

  switch (code) {
    case 'auth/unauthorized-domain':
      return isTr
        ? 'Bu alan adı (domain) Firebase Yetkili Alan Adları (Authorized Domains) listesinde ekli değil. Lütfen Firebase Console > Authentication > Settings altından bu etki alanını ekleyin.'
        : 'This domain is not authorized in Firebase Console > Authentication > Settings > Authorized Domains.';

    case 'auth/popup-blocked':
      return isTr
        ? 'Giriş açılır penceresi tarayıcınız tarafından engellendi. Lütfen bu site için açılır pencerelere (popup) izin verin.'
        : 'The sign-in popup was blocked by your browser. Please allow popups for this site.';

    case 'auth/popup-closed-by-user':
      return isTr
        ? 'Giriş penceresi işlem tamamlanmadan kapatıldı.'
        : 'The sign-in popup was closed before completing.';

    case 'auth/cancelled-popup-request':
      return isTr
        ? 'Önceki giriş isteği yeni bir istek başlatıldığı için iptal edildi.'
        : 'The previous popup request was cancelled by a new request.';

    case 'auth/network-request-failed':
      return isTr
        ? 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
        : 'Network request failed. Please check your internet connection and try again.';

    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return isTr
        ? 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.'
        : 'Invalid email or password. Please verify your credentials.';

    case 'auth/invalid-email':
      return isTr
        ? 'Geçersiz e-posta formatı. Lütfen geçerli bir e-posta adresi giriniz.'
        : 'Please enter a valid email address.';

    case 'auth/email-already-in-use':
      return isTr
        ? 'Bu e-posta adresi zaten kullanımda. Lütfen giriş yapmayı deneyin.'
        : 'This email address is already in use. Please sign in instead.';

    case 'auth/weak-password':
      return isTr
        ? 'Şifre çok zayıf. Lütfen en az 6 karakterden oluşan bir şifre belirleyin.'
        : 'Password is too weak. Please use at least 6 characters.';

    case 'auth/too-many-requests':
      return isTr
        ? 'Çok fazla başarısız deneme yapıldı. Hesabınızın güvenliği için lütfen birkaç dakika sonra tekrar deneyin.'
        : 'Too many unsuccessful attempts. Access temporarily disabled. Please try again later.';

    case 'auth/operation-not-allowed':
      return isTr
        ? 'Bu giriş yöntemi Firebase konsolunda henüz etkinleştirilmemiş.'
        : 'This authentication provider is not enabled in Firebase Console.';

    case 'auth/user-disabled':
      return isTr
        ? 'Bu kullanıcı hesabı yönetici tarafından devre dışı bırakılmıştır.'
        : 'This user account has been disabled by an administrator.';

    case 'auth/account-exists-with-different-credential':
      return isTr
        ? 'Bu e-posta adresiyle başka bir kimlik doğrulama yöntemiyle açılmış bir hesap mevcut.'
        : 'An account already exists with this email using a different sign-in method.';

    default:
      if (err?.message) {
        return err.message.replace(/^Firebase:\s*/, '').replace(/\s*\([a-z0-9\/-]+\)\.?$/i, '');
      }
      return isTr ? 'Kimlik doğrulama işlemi gerçekleştirilemedi.' : 'Authentication failed.';
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  purchases: [],
  isLoading: true,
  isAuthModalOpen: false,
  isPricingModalOpen: false,
  isAccountModalOpen: false,
  isRewardedAdModalOpen: false,
  authError: null,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        set({ isLoading: true });
        if (firebaseUser) {
          try {
            const profile = await syncUserProfileOnAuth(firebaseUser);
            set({ user: firebaseUser, profile, isLoading: false });
            if (profile?.credits !== undefined) {
              useAdCraftStore.getState().setCredits(profile.credits);
            }
            get().loadPurchases();
          } catch {
            set({ user: firebaseUser, isLoading: false });
          }
        } else {
          set({ user: null, profile: null, purchases: [], isLoading: false });
        }
      },
      (error) => {
        console.warn('Firebase Auth state listener notice:', error);
        set({ isLoading: false, authError: error?.message || null });
      }
    );

    return unsubscribe;
  },

  signInWithGoogle: async () => {
    const lang = useAdCraftStore.getState().language;
    set({ isLoading: true, authError: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const profile = await syncUserProfileOnAuth(result.user);
        set({ user: result.user, profile, isLoading: false, isAuthModalOpen: false });
        if (profile?.credits !== undefined) {
          useAdCraftStore.getState().setCredits(profile.credits);
        }
        soundEngine.playSuccess();
        get().loadPurchases();
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.warn('Google Auth notice:', err?.code, err?.message);
      const errorMsg = formatFirebaseAuthError(err, lang);
      set({ authError: errorMsg, isLoading: false });
      return false;
    }
  },

  signInWithEmail: async (email: string, pass: string) => {
    const lang = useAdCraftStore.getState().language;
    set({ isLoading: true, authError: null });
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await syncUserProfileOnAuth(cred.user);
      set({ user: cred.user, profile, isLoading: false, isAuthModalOpen: false });
      if (profile?.credits !== undefined) {
        useAdCraftStore.getState().setCredits(profile.credits);
      }
      soundEngine.playSuccess();
      get().loadPurchases();
      return true;
    } catch (err: any) {
      console.warn('Email Sign-In notice:', err?.code, err?.message);
      const errorMsg = formatFirebaseAuthError(err, lang);
      set({ authError: errorMsg, isLoading: false });
      return false;
    }
  },

  signUpWithEmail: async (email: string, pass: string, name: string) => {
    const lang = useAdCraftStore.getState().language;
    set({ isLoading: true, authError: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name?.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      const profile = await syncUserProfileOnAuth({
        ...cred.user,
        displayName: name?.trim() || cred.user.displayName
      } as User);
      set({ user: cred.user, profile, isLoading: false, isAuthModalOpen: false });
      soundEngine.playSuccess();
      return true;
    } catch (err: any) {
      console.warn('Email Sign-Up notice:', err?.code, err?.message);
      const errorMsg = formatFirebaseAuthError(err, lang);
      set({ authError: errorMsg, isLoading: false });
      return false;
    }
  },

  signOut: async () => {
    soundEngine.playWhoosh();
    await firebaseSignOut(auth);
    set({
      user: null,
      profile: null,
      purchases: [],
      isAccountModalOpen: false
    });
  },

  loadPurchases: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const list = await getUserPurchases(user.uid);
      set({ purchases: list });
    } catch {
      // ignore
    }
  },

  deductCredits: (amount: number) => {
    const profile = get().profile;
    const currentAdCraftCredits = useAdCraftStore.getState().credits;
    const effectiveCredits = profile ? (profile.credits || 0) : currentAdCraftCredits;

    if (effectiveCredits < amount) {
      soundEngine.playError();
      set({ isRewardedAdModalOpen: true });
      return false;
    }

    const newCredits = Math.max(0, effectiveCredits - amount);
    useAdCraftStore.getState().setCredits(newCredits);

    if (profile) {
      const updatedProfile = {
        ...profile,
        credits: newCredits,
        updatedAt: new Date().toISOString()
      };
      set({ profile: updatedProfile });
      saveUserProfile(updatedProfile).catch((err) => {
        console.warn('Failed to sync credit deduction to Firestore:', err);
      });
    }

    return true;
  },

  setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open, authError: null }),
  setPricingModalOpen: (open: boolean) => set({ isPricingModalOpen: open }),
  setAccountModalOpen: (open: boolean) => set({ isAccountModalOpen: open }),
  setRewardedAdModalOpen: (open: boolean) => set({ isRewardedAdModalOpen: open }),
  clearAuthError: () => set({ authError: null }),

  getRemainingDailyAds: () => {
    const today = new Date().toISOString().slice(0, 10);
    const profile = get().profile;
    if (profile) {
      if (profile.lastAdWatchDate !== today) {
        return 5;
      }
      return Math.max(0, 5 - (profile.dailyAdsWatched || 0));
    }
    // Guest fallback stored in localStorage
    try {
      const stored = localStorage.getItem('adcraft_guest_ads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          return Math.max(0, 5 - (parsed.count || 0));
        }
      }
    } catch {}
    return 5;
  },

  rewardCreditsFromAd: async (creditsEarned: number = 50, sponsorInfo?: { id?: string; title?: string }) => {
    const today = new Date().toISOString().slice(0, 10);
    const profile = get().profile;
    const user = get().user;

    // Verify ad completion with server endpoint
    try {
      await fetch('/api/reward-ad/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest',
          sponsorId: sponsorInfo?.id || 'curated_sponsor',
          watchedDurationSec: 15
        })
      });
    } catch {
      // Continue optimistic reward issuance
    }

    if (user) {
      const currentWatched = profile?.lastAdWatchDate === today ? (profile?.dailyAdsWatched || 0) : 0;
      if (currentWatched >= 5) {
        return false;
      }

      try {
        const { profile: updatedProfile, purchaseRecord } = await incrementUserCreditsFromRewardedAd(
          user.uid,
          creditsEarned,
          sponsorInfo
        );

        set({
          profile: updatedProfile,
          purchases: [purchaseRecord, ...get().purchases]
        });
        useAdCraftStore.getState().setCredits(updatedProfile.credits);
        soundEngine.playSuccess();
        return true;
      } catch (e) {
        console.warn('Firestore ad credit reward notice:', e);
        // Optimistic fallback for local UI responsiveness
        const newCredits = (profile?.credits || 0) + creditsEarned;
        const fallbackProfile: UserProfileData = {
          ...(profile || {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'AdCraft Creator',
            plan: 'free',
            subscriptionStatus: 'active',
            createdAt: new Date().toISOString()
          }),
          credits: newCredits,
          dailyAdsWatched: currentWatched + 1,
          lastAdWatchDate: today,
          updatedAt: new Date().toISOString()
        };
        set({ profile: fallbackProfile });
        useAdCraftStore.getState().setCredits(newCredits);
        soundEngine.playSuccess();
        return true;
      }
    } else {
      // Guest mode
      try {
        const stored = localStorage.getItem('adcraft_guest_ads');
        let currentCount = 0;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.date === today) currentCount = parsed.count || 0;
        }
        if (currentCount >= 5) return false;
        localStorage.setItem(
          'adcraft_guest_ads',
          JSON.stringify({ date: today, count: currentCount + 1 })
        );
      } catch {}

      const currentAdCraftCredits = useAdCraftStore.getState().credits || 0;
      const newGuestCredits = currentAdCraftCredits + creditsEarned;
      useAdCraftStore.getState().setCredits(newGuestCredits);

      soundEngine.playSuccess();
      return true;
    }
  }
}));
