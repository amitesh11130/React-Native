import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export type AuthUser = FirebaseAuthTypes.User | DemoUser | null;

type AuthStateCallback = (user: AuthUser) => void;
const listeners = new Set<AuthStateCallback>();
let currentDemoUser: DemoUser | null = null;

// Listen to Firebase Auth events
auth().onAuthStateChanged((firebaseUser) => {
  if (firebaseUser) {
    currentDemoUser = null;
    notifyListeners(firebaseUser);
  } else if (!currentDemoUser) {
    notifyListeners(null);
  }
});

function notifyListeners(user: AuthUser) {
  listeners.forEach((callback) => {
    try {
      callback(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

export function subscribeAuthState(callback: AuthStateCallback) {
  listeners.add(callback);
  // Emit initial state
  callback(currentDemoUser || auth().currentUser);
  return () => {
    listeners.delete(callback);
  };
}

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: '1084224723507-8uop331ges263s0sn2k92qplhh50m30t.apps.googleusercontent.com',
  });
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signIn();
  const { idToken, accessToken } = await GoogleSignin.getTokens();
  if (!idToken) throw new Error('No ID token');
  const credential = auth.GoogleAuthProvider.credential(idToken, accessToken);
  return auth().signInWithCredential(credential);
}

export async function signInWithDemo() {
  currentDemoUser = {
    uid: 'demo_user_123',
    email: 'demo@financeapp.com',
    displayName: 'Jane Doe (Demo)',
    photoURL: '', // Will fall back to avatar or can be set via camera
  };
  notifyListeners(currentDemoUser);
  return currentDemoUser;
}

export async function updateDemoUserProfile(displayName: string, photoURL: string) {
  if (currentDemoUser) {
    currentDemoUser = {
      ...currentDemoUser,
      displayName,
      photoURL,
    };
    notifyListeners(currentDemoUser);
  }
}

export async function signOut() {
  currentDemoUser = null;
  try {
    await GoogleSignin.signOut();
  } catch (e) {
    // Ignore error if not signed in with Google
  }
  try {
    await auth().signOut();
  } catch (e) {
    // Ignore error
  }
  notifyListeners(null);
}

export function getCurrentUser(): AuthUser {
  return currentDemoUser || auth().currentUser;
}
