import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, getUserProfile, saveUserProfile, UserProfile } from '../firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, college: string, course: string, targetRole: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserSkillsAndRole: (targetRole: string, skills: string[], score?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            // First time sign-in (e.g. Google Popup)
            profile = await saveUserProfile(user);
          }
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await getUserProfile(cred.user.uid);
    if (profile) setUserProfile(profile);
  };

  const signUp = async (
    email: string, 
    pass: string, 
    name: string, 
    college: string, 
    course: string, 
    targetRole: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    const profile = await saveUserProfile(cred.user, {
      college,
      course,
      targetRole,
      selectedSkills: ['Python', 'SQL', 'C', 'DSA'],
      readinessScore: 0
    });
    setUserProfile(profile);
  };

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    let profile = await getUserProfile(cred.user.uid);
    if (!profile) {
      profile = await saveUserProfile(cred.user);
    }
    setUserProfile(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateUserSkillsAndRole = async (targetRole: string, skills: string[], score?: number) => {
    if (!currentUser) return;
    const updated = await saveUserProfile(currentUser, {
      targetRole,
      selectedSkills: skills,
      readinessScore: score
    });
    setUserProfile(updated);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      logout,
      updateUserSkillsAndRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
