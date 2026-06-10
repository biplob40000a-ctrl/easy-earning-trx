import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AppUser } from '../types';
import { store } from '../lib/store';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, deleteUser, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

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
           // If user exists in Auth but not in Firestore
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
             try {
               await setDoc(docRef, adminUser);
               setUser(adminUser);
             } catch(e) {
               console.error("Rescue admin failed:", e);
             }
           } else {
             // For normal users, we wait slightly to allow register() to finish writing
             setTimeout(async () => {
               const snapWait = await getDoc(docRef);
               if (snapWait.exists()) {
                 setUser(snapWait.data() as AppUser);
               }
             }, 2000);
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
        let userData = snapshot.data() as AppUser;
        const isAdminEmail = email.toLowerCase() === 'biplob40000a@gmail.com' || email.toLowerCase() === 'admin@easyearning.com';
        
        if (isAdminEmail && userData.role !== 'admin') {
          userData = { ...userData, role: 'admin' };
          await setDoc(doc(db, 'users', cred.user.uid), { role: 'admin' }, { merge: true });
        }
        
        setUser(userData);
      }
      return true;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  const register = async (email: string, username: string, pass: string, phone: string, ref: string) => {
    try {
      // 1. Create auth user FIRST so we have permissions to read/write under isSignedIn() rule
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;

      try {
        const cleanUsername = username.trim();
        const cleanRef = (ref || '').trim();
        
        // 2. Fetch all users to check uniqueness and referrals locally (since it's small scale)
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = usersSnap.docs.map(d => d.data());
        
        const duplicateUser = users.find(u => u.username?.trim().toLowerCase() === cleanUsername.toLowerCase());
        
        if (duplicateUser) {
          throw new Error('This username is already taken. Please choose another username.');
        }

        let finalReferrer = 'Admin';
        if (cleanRef.toLowerCase() !== 'admin' && cleanRef !== '') {
           const foundRef = users.find(u => u.username?.trim().toLowerCase() === cleanRef.toLowerCase());
           if (foundRef) {
             finalReferrer = foundRef.username;
           } else {
             finalReferrer = cleanRef;
           }
        }

        const isAdminEmail = email === 'biplob40000a@gmail.com' || email === 'admin@easyearning.com';
        
        const newUser: AppUser = {
          id: uid,
          email,
          username: cleanUsername,
          phone,
          role: isAdminEmail ? 'admin' : 'user',
          balance: isAdminEmail ? 999999 : 0,
          totalEarnings: isAdminEmail ? 999999 : 0,
          vipLevel: isAdminEmail ? 5 : 0,
          trc20Address: '',
          referrerId: finalReferrer,
          createdAt: Date.now(),
          lastMiningDate: null,
        };

        await setDoc(doc(db, 'users', uid), newUser);
        setUser(newUser);
        
        return true;
      } catch (innerError) {
        // Rollback Auth user if something failed
        await deleteUser(userCredential.user).catch(console.error);
        throw innerError;
      }
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
