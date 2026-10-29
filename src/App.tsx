import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  logOut,
  testConnection,
  subscribeToUserIdeas,
  AppIdea,
  saveUserProfile
} from './lib/firebase';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { IdeaGenerator } from './components/IdeaGenerator';
import { IdeaWorkspace } from './components/IdeaWorkspace';
import { ManualIdeaModal } from './components/ManualIdeaModal';
import { IdeaDetailModal } from './components/IdeaDetailModal';
import { AdminPanel } from './components/AdminPanel';

interface AdminSession {
  username: string;
  displayName: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const saved = localStorage.getItem('ideaflow_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'generator' | 'workspace' | 'manual' | 'admin'>('generator');
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [selectedIdeaForDetail, setSelectedIdeaForDetail] = useState<any | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Initial Firestore check and Auth observer
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          await saveUserProfile(user);
        } catch (err) {
          console.error('Error saving user profile on login:', err);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute effective user
  const effectiveUserId = firebaseUser?.uid || (adminSession ? `admin_${adminSession.username}` : null);
  const isAdmin =
    adminSession?.isAdmin ||
    firebaseUser?.email === 'mhmmdyusf2286@gmail.com' ||
    false;

  const currentDisplayUser = {
    displayName:
      adminSession?.displayName ||
      firebaseUser?.displayName ||
      firebaseUser?.email?.split('@')[0] ||
      'Pengguna',
    email: adminSession?.email || firebaseUser?.email || undefined,
    username: adminSession?.username,
    photoURL: firebaseUser?.photoURL || undefined,
    role: isAdmin ? 'admin' : 'user',
    isAdmin,
  };

  // Subscribe to user's ideas in Firestore when logged in
  useEffect(() => {
    if (!effectiveUserId) {
      setIdeas([]);
      return;
    }

    const unsubscribe = subscribeToUserIdeas(
      effectiveUserId,
      (userIdeas) => {
        setIdeas(userIdeas);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [effectiveUserId]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('ideaflow_admin_session');
      setAdminSession(null);
      await logOut();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Handle Admin Login Success
  const handleAdminLoginSuccess = (adminData: AdminSession) => {
    localStorage.setItem('ideaflow_admin_session', JSON.stringify(adminData));
    setAdminSession(adminData);
    setActiveTab('admin');
  };

  // Handle Google Login Success
  const handleGoogleLoginSuccess = () => {
    setActiveTab('generator');
  };

  // Halaman wajib login: check if authenticated
  const isAuthenticated = !!firebaseUser || !!adminSession;

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-spin">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
        </div>
        <div className="mt-4 text-xs text-slate-400 font-medium">
          Memuat IdeaFlow AI Studio...
        </div>
      </div>
    );
  }

  // Mandatory Login Screen (Halaman Wajib Login)
  if (!isAuthenticated) {
    return (
      <LoginModal
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onGoogleLoginSuccess={handleGoogleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Bar with Logout Button */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ideasCount={ideas.length}
        user={currentDisplayUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'generator' && (
          <IdeaGenerator
            userId={effectiveUserId!}
            onIdeaSaved={() => {
              // Notification or sound if desired
            }}
            onOpenAnalysis={(idea) => setSelectedIdeaForDetail(idea)}
          />
        )}

        {activeTab === 'workspace' && (
          <IdeaWorkspace
            userId={effectiveUserId!}
            ideas={ideas}
            onOpenAnalysis={(idea) => setSelectedIdeaForDetail(idea)}
            onOpenManual={() => setIsManualModalOpen(true)}
            onGoToGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'manual' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Catat Ide Aplikasi Baru</h2>
                <p className="text-xs text-slate-400">
                  Tambahkan konsep aplikasi hasil riset atau pemikiran Anda langsung ke Firestore
                </p>
              </div>
            </div>
            {/* Render form directly in page view */}
            <ManualIdeaModal
              userId={effectiveUserId!}
              onClose={() => setActiveTab('workspace')}
              onSaved={() => setActiveTab('workspace')}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            adminUser={currentDisplayUser}
            totalIdeasCount={ideas.length}
          />
        )}
      </main>

      {/* Manual Idea Modal if opened from Workspace */}
      {isManualModalOpen && (
        <ManualIdeaModal
          userId={effectiveUserId!}
          onClose={() => setIsManualModalOpen(false)}
          onSaved={() => setIsManualModalOpen(false)}
        />
      )}

      {/* Idea Detail & AI Analysis Modal */}
      {selectedIdeaForDetail && (
        <IdeaDetailModal
          idea={selectedIdeaForDetail}
          userId={effectiveUserId!}
          onClose={() => setSelectedIdeaForDetail(null)}
          onUpdated={() => {
            // Updated
          }}
        />
      )}
    </div>
  );
}
