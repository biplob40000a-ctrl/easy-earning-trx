import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AppUser } from '../types';
import { store } from '../lib/store';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: AppUser | null;
  fbUser: FirebaseUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, username: string, pass: string, phone: string, ref: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setFbUser(firebaseUser);
      if (firebaseUser) {
        // Init subscriptions for this user
        store.initFirebase(firebaseUser.uid);
        
        // Fetch user data directly
        const docRef = doc(db, 'users', firebaseUser.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
           const userData = snapshot.data() as AppUser;
           if ((firebaseUser.email === 'biplob40000a@gmail.com' || firebaseUser.email === 'admin@easyearning.com') && userData.role !== 'admin') {
             userData.role = 'admin';
             await setDoc(docRef, { role: 'admin' }, { merge: true });
           }
           setUser(userData);
        } else {
           // Admin fallback or created via another means
           if (firebaseUser.email === 'biplob40000a@gmail.com' || firebaseUser.email === 'admin@easyearning.com') {
             const adminUser: AppUser = {
               id: firebaseUser.uid,
               email: firebaseUser.email || '',
               username: 'Admin',
               phone: '000000000',
               role: 'admin',
               balance: 999999,
               totalEarnings: 999999,
               vipLevel: 5,
               trc20Address: '',
               referrerId: null,
               createdAt: Date.now(),
               lastMiningDate: null,
             };
             await setDoc(docRef, adminUser);
             setUser(adminUser);
           }
        }
      } else {
        setUser(null);
        // Clear local storage / subscriptions
        store.clearUserSubscriptions();
      }
      setLoading(false);
    });

    const handleStoreUpdate = () => {
      if (fbUser) {
        const currentUserData = store.getState().users.find(u => u.id === fbUser.uid);
        if (currentUserData) {
          setUser(currentUserData);
        }
      }
    };

    window.addEventListener('store_updated', handleStoreUpdate);

    return () => {
      unsub();
      window.removeEventListener('store_updated', handleStoreUpdate);
    };
  }, [fbUser]);

  const login = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const snapshot = await getDoc(doc(db, 'users', cred.user.uid));
      if (snapshot.exists()) {
        setUser(snapshot.data() as AppUser);
      }
      return true;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  const register = async (email: string, username: string, pass: string, phone: string, ref: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;
      const actualRef = ref || 'admin';
      
      const isAdminEmail = email === 'biplob40000a@gmail.com' || email === 'admin@easyearning.com';
      
      const newUser: AppUser = {
        id: uid,
        email,
        username,
        phone,
        role: isAdminEmail ? 'admin' : 'user',
        balance: isAdminEmail ? 999999 : 0,
        totalEarnings: isAdminEmail ? 999999 : 0,
        vipLevel: isAdminEmail ? 5 : 0,
        trc20Address: '',
        referrerId: actualRef,
        createdAt: Date.now(),
        lastMiningDate: null,
      };

      await setDoc(doc(db, 'users', uid), newUser);
      setUser(newUser);
      
      return true;
    } catch (e: any) {
      console.error('Registration error:', e);
      throw e;
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, fbUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
