import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { store } from '../lib/store';

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => boolean;
  register: (username: string, pass: string, phone: string, ref: string) => boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleStoreUpdate = () => {
      const storedUserId = localStorage.getItem('active_user_id');
      if (storedUserId) {
        const state = store.getState();
        const found = state.users.find(u => u.id === storedUserId);
        if (found) {
          setUser(found);
        } else {
           setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    handleStoreUpdate();
    window.addEventListener('store_updated', handleStoreUpdate);
    return () => window.removeEventListener('store_updated', handleStoreUpdate);
  }, []);

  const login = (username: string, pass: string) => {
    const found = store.getUserByUsername(username);
    if (found && found.password === pass) {
      if (found.isBlocked) {
        return false; // Or throw an error detailing they are blocked
      }
      setUser(found);
      localStorage.setItem('active_user_id', found.id);
      return true;
    }
    return false;
  };

  const register = (username: string, pass: string, phone: string, ref: string) => {
    if (store.getUserByUsername(username)) return false;
    
    const newUser = store.addUser({
      username,
      password: pass,
      phone,
      role: 'user',
      trc20Address: '',
      referrerId: ref || null
    });
    
    setUser(newUser);
    localStorage.setItem('active_user_id', newUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('active_user_id');
  };

  const refreshUser = () => {
    if (user) {
      const found = store.getState().users.find(u => u.id === user.id);
      if (found) setUser(found);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
