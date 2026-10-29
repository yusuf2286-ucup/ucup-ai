import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with explicit database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling according to Firebase integration guidelines
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as mandated by the Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase configuration offline warning.');
    }
    return false;
  }
}

// Data Models
export interface AppIdea {
  id: string;
  userId: string;
  title: string;
  summary: string;
  category: string;
  targetAudience: string;
  techStack: string;
  keyFeatures: string;
  monetization: string;
  status: 'Draft' | 'Validasi' | 'Dalam Pengembangan' | 'Rilis';
  isFavorite: boolean;
  tags: string;
  notes: string;
  aiAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Firestore Helper Functions
export async function saveUserProfile(user: User) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna',
      photoURL: user.photoURL || '',
      role: user.email === 'mhmmdyusf2286@gmail.com' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, profile, { merge: true });
    return profile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToUserIdeas(
  userId: string,
  onData: (ideas: AppIdea[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const path = `users/${userId}/ideas`;
  try {
    const q = query(collection(db, 'users', userId, 'ideas'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const ideas: AppIdea[] = [];
        snapshot.forEach((docSnap) => {
          ideas.push(docSnap.data() as AppIdea);
        });
        onData(ideas);
      },
      (error) => {
        if (onError) {
          onError(error);
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveIdeaToFirestore(userId: string, idea: Partial<AppIdea>): Promise<void> {
  const id = idea.id || `idea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/ideas/${id}`;
  const now = new Date().toISOString();

  const payload: AppIdea = {
    id,
    userId,
    title: (idea.title || 'Ide Tanpa Judul').slice(0, 200),
    summary: (idea.summary || '').slice(0, 1000),
    category: (idea.category || 'SaaS').slice(0, 80),
    targetAudience: (idea.targetAudience || 'Umum').slice(0, 500),
    techStack: (idea.techStack || 'React, Express, Firebase').slice(0, 500),
    keyFeatures: (idea.keyFeatures || '').slice(0, 2000),
    monetization: (idea.monetization || 'Freemium').slice(0, 500),
    status: idea.status || 'Draft',
    isFavorite: idea.isFavorite ?? false,
    tags: (idea.tags || 'AI, Web App').slice(0, 300),
    notes: (idea.notes || '').slice(0, 4000),
    aiAnalysis: (idea.aiAnalysis || '').slice(0, 8000),
    createdAt: idea.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'users', userId, 'ideas', id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteIdeaFromFirestore(userId: string, ideaId: string): Promise<void> {
  const path = `users/${userId}/ideas/${ideaId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'ideas', ideaId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Authentication Actions
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await saveUserProfile(result.user);
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}
