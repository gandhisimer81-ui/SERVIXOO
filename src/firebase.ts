import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit
} from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || undefined
};

// Initialize Firebase app singleton
export const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore (using custom database ID if specified in config)
const databaseId = (firebaseConfigData as any).firestoreDatabaseId;
export const db = databaseId && databaseId !== '(default)'
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Test connection as required by Firebase skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or waiting for network.');
    }
  }
}
testFirestoreConnection();

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  college?: string;
  course?: string;
  semester?: number;
  targetRole?: string;
  selectedSkills?: string[];
  readinessScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAssessment {
  id?: string;
  userId: string;
  targetRole: string;
  skillsDeclared: string[];
  customCoursework?: string;
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  timestamp: string;
}

// User Profile Firestore Functions
export async function saveUserProfile(user: FirebaseUser, extraData?: {
  college?: string;
  course?: string;
  semester?: number;
  targetRole?: string;
  selectedSkills?: string[];
  readinessScore?: number;
}) {
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  // Check if profile exists
  const existingSnap = await getDoc(userRef);
  const existingData = existingSnap.exists() ? existingSnap.data() : {};

  const profileData: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || extraData?.college || 'Student',
    college: extraData?.college || existingData.college || 'State Technological University',
    course: extraData?.course || existingData.course || 'B.Tech Computer Science',
    semester: extraData?.semester || existingData.semester || 6,
    targetRole: extraData?.targetRole || existingData.targetRole || 'Python Developer',
    selectedSkills: extraData?.selectedSkills || existingData.selectedSkills || ['Python', 'SQL', 'C', 'DSA'],
    readinessScore: extraData?.readinessScore !== undefined ? extraData.readinessScore : existingData.readinessScore || 0,
    createdAt: existingData.createdAt || now,
    updatedAt: now
  };

  await setDoc(userRef, profileData, { merge: true });
  return profileData;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

// Save Assessment History
export async function saveAssessmentToFirestore(userId: string, assessment: Omit<StoredAssessment, 'userId'>) {
  try {
    const assessmentsCol = collection(db, 'users', userId, 'assessments');
    const docRef = await addDoc(assessmentsCol, {
      ...assessment,
      userId,
      timestamp: new Date().toISOString()
    });

    // Also update current readinessScore and targetRole in user profile
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      readinessScore: assessment.readinessScore,
      targetRole: assessment.targetRole,
      selectedSkills: assessment.skillsDeclared,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return docRef.id;
  } catch (err) {
    console.error('Error saving assessment to Firestore:', err);
    return null;
  }
}

// Retrieve past assessments
export async function getUserAssessments(userId: string): Promise<StoredAssessment[]> {
  try {
    const assessmentsCol = collection(db, 'users', userId, 'assessments');
    const q = query(assessmentsCol, orderBy('timestamp', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StoredAssessment));
  } catch (err) {
    console.error('Error fetching assessments from Firestore:', err);
    return [];
  }
}
