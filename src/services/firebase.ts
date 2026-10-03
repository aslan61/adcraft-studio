import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  getDocFromServer,
  runTransaction
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot (CRITICAL CONSTRAINT)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Standardized Operation Types & Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionPeriodEnd?: string;
  dailyAdsWatched?: number;
  lastAdWatchDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'refunded';
  creditsGranted: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  createdAt: string;
}

export interface UserCampaignData {
  id: string;
  userId: string;
  name: string;
  headline: string;
  ctaText: string;
  createdAt: string;
  workspace?: string;
  subHook?: string;
  aspectRatio?: string;
  updatedAt?: string;
}

// Fetch user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const userPath = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
    return null;
  }
}

// Save or sync profile
export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  const userPath = `users/${profile.uid}`;
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

// Auto initialize profile when user signs in
export async function syncUserProfileOnAuth(user: User): Promise<UserProfileData> {
  try {
    const existing = await getUserProfile(user.uid);
    if (existing) {
      // update photo/name if changed
      const updated: UserProfileData = {
        ...existing,
        displayName: user.displayName || existing.displayName || user.email?.split('@')[0] || 'AdCraft Creator',
        photoURL: user.photoURL || existing.photoURL || '',
        updatedAt: new Date().toISOString()
      };
      await saveUserProfile(updated);
      return updated;
    }

    // New User profile initialization
    const newProfile: UserProfileData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'AdCraft Creator',
      photoURL: user.photoURL || '',
      plan: 'free',
      credits: 250, // Welcome gift of 250 AI Render Credits
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveUserProfile(newProfile);
    return newProfile;
  } catch {
    // Return optimistic fallback if firestore call encounters issues
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'AdCraft Creator',
      photoURL: user.photoURL || '',
      plan: 'free',
      credits: 250,
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString()
    };
  }
}

// Atomically increment user credits and record rewarded ad in Firestore with transactional safety
export async function incrementUserCreditsFromRewardedAd(
  userId: string,
  creditsGranted: number = 50,
  sponsorInfo?: { id?: string; title?: string }
): Promise<{ profile: UserProfileData; purchaseRecord: PurchaseRecord }> {
  const userPath = `users/${userId}`;
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const recordId = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const userDocRef = doc(db, 'users', userId);
  const subDocRef = doc(db, 'users', userId, 'subscriptions', recordId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userSnapshot = await transaction.get(userDocRef);
      let profile: UserProfileData;

      if (userSnapshot.exists()) {
        profile = userSnapshot.data() as UserProfileData;
      } else {
        profile = {
          uid: userId,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || 'AdCraft Creator',
          photoURL: auth.currentUser?.photoURL || '',
          plan: 'free',
          credits: 250,
          subscriptionStatus: 'active',
          dailyAdsWatched: 0,
          lastAdWatchDate: today,
          createdAt: now,
          updatedAt: now
        };
      }

      // Check daily ad watch count (Max 5 per UTC day)
      const currentWatched = profile.lastAdWatchDate === today ? (profile.dailyAdsWatched || 0) : 0;
      if (currentWatched >= 5) {
        throw new Error('Daily rewarded ad limit reached (5/5). Please return tomorrow for more free credits.');
      }

      const newDailyWatched = currentWatched + 1;
      const newCredits = (profile.credits || 0) + creditsGranted;

      const updatedProfile: UserProfileData = {
        ...profile,
        credits: newCredits,
        dailyAdsWatched: newDailyWatched,
        lastAdWatchDate: today,
        updatedAt: now
      };

      const purchaseRecord: PurchaseRecord = {
        id: recordId,
        userId,
        planId: 'rewarded_ad',
        planName: sponsorInfo?.title ? `Ad: ${sponsorInfo.title}` : `Watch Ad for Free Credits (+${creditsGranted})`,
        amount: 0,
        currency: 'USD',
        status: 'completed',
        creditsGranted,
        paymentMethod: 'Rewarded Video Ad',
        invoiceNumber: `AD-${Date.now().toString().slice(-6)}`,
        createdAt: now
      };

      // Atomic dual-write
      transaction.set(userDocRef, updatedProfile);
      transaction.set(subDocRef, purchaseRecord);

      return { profile: updatedProfile, purchaseRecord };
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
    throw error;
  }
}

// Record purchase transaction in Firestore
export async function recordPurchase(record: PurchaseRecord): Promise<void> {
  const subPath = `users/${record.userId}/subscriptions/${record.id}`;
  try {
    const subDocRef = doc(db, 'users', record.userId, 'subscriptions', record.id);
    await setDoc(subDocRef, record);

    // Update user credits & plan in user profile
    const current = await getUserProfile(record.userId);
    if (current) {
      const newPlan = record.planId.startsWith('pro')
        ? 'pro'
        : record.planId.startsWith('enterprise')
        ? 'enterprise'
        : current.plan;

      const updatedProfile: UserProfileData = {
        ...current,
        plan: newPlan,
        credits: (current.credits || 0) + record.creditsGranted,
        subscriptionStatus: 'active',
        subscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveUserProfile(updatedProfile);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, subPath);
  }
}

// Fetch user purchases / invoices
export async function getUserPurchases(uid: string): Promise<PurchaseRecord[]> {
  const subCollectionPath = `users/${uid}/subscriptions`;
  try {
    const q = query(collection(db, 'users', uid, 'subscriptions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as PurchaseRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, subCollectionPath);
    return [];
  }
}

// Save or update user campaign in Firestore
export async function saveUserCampaign(campaign: UserCampaignData): Promise<void> {
  const campaignPath = `users/${campaign.userId}/campaigns/${campaign.id}`;
  try {
    const campaignDocRef = doc(db, 'users', campaign.userId, 'campaigns', campaign.id);
    await setDoc(campaignDocRef, campaign, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, campaignPath);
  }
}

// Fetch all campaigns for a user
export async function getUserCampaigns(uid: string): Promise<UserCampaignData[]> {
  const campaignsPath = `users/${uid}/campaigns`;
  try {
    const q = query(collection(db, 'users', uid, 'campaigns'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as UserCampaignData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, campaignsPath);
    return [];
  }
}

// Delete user campaign from Firestore
export async function deleteUserCampaign(uid: string, campaignId: string): Promise<void> {
  const campaignPath = `users/${uid}/campaigns/${campaignId}`;
  try {
    const campaignDocRef = doc(db, 'users', uid, 'campaigns', campaignId);
    await deleteDoc(campaignDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, campaignPath);
  }
}

export {
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
};
