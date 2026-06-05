/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout, AdminLayout } from './components/Layout';
import { lazy, Suspense } from 'react';
import { store } from './lib/store';

// Lazy load pages for better bundle chunking
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Mining = lazy(() => import('./pages/Mining'));
const VIP = lazy(() => import('./pages/VIP'));
const Team = lazy(() => import('./pages/Team'));
const Profile = lazy(() => import('./pages/Profile'));
const Shop = lazy(() => import('./pages/Shop'));
const Finance = lazy(() => import('./pages/Finance')); // Combine recharge/withdraw here for simplicity
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
    <div className="w-12 h-12 border-4 border-[var(--color-border-card)] border-t-brand-primary rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  useEffect(() => {
    store.initFirebase();
    // Global catch for referral codes
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('refCode', ref);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* User Routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="mining" element={<Mining />} />
              <Route path="vip" element={<VIP />} />
              <Route path="team" element={<Team />} />
              <Route path="shop" element={<Shop />} />
              <Route path="finance/:type" element={<Finance />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

