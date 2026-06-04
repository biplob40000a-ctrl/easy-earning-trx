import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Pickaxe, Crown, Users, User, LogOut, Shield, Activity } from 'lucide-react';
import { cn, formatTRX } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LiveFeed } from './LiveFeed';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('store_updated', handler);
    return () => window.removeEventListener('store_updated', handler);
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Mining', path: '/mining', icon: Pickaxe },
    { name: 'VIP', path: '/vip', icon: Crown },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-white flex flex-col pt-7 relative">
      {/* Mobile Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-[100] flex items-center justify-end pr-4 pointer-events-none drop-shadow-md">
         <div className="w-2.5 h-2.5 rounded-full bg-gray-800 shadow-inner"></div>
      </div>

      {/* Top Header */}
      <header className="sticky top-7 z-40 bg-[var(--color-bg-card)]/80 backdrop-blur-md border-b border-[var(--color-border-card)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-gold flex items-center justify-center font-bold text-black drop-shadow-[0_0_8px_rgba(255,90,0,0.5)]">
            TRX
          </div>
          <span className="font-bold text-lg text-white">Easy Earning</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
             <div className="text-xs text-text-muted">Balance</div>
             <div className="font-bold text-gradient-gold">{formatTRX(user.balance)}</div>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        <LiveFeed />
        <AnimatePresence mode="popLayout">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 bg-[var(--color-bg-card)]/90 backdrop-blur-lg border-t border-[var(--color-border-card)] px-2 pb-safe pt-2">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path} className="w-full">
                <Link
                  to={item.path}
                  className="flex flex-col items-center p-2 relative group"
                >
                  <div className={cn(
                    "p-2 rounded-2xl transition-all duration-300",
                    isActive ? "bg-brand-primary/20 text-brand-primary" : "text-text-muted group-hover:text-white"
                  )}>
                    <Icon size={22} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                  </div>
                  <span className={cn(
                    "text-[10px] mt-1 font-medium transition-colors",
                    isActive ? "text-brand-primary" : "text-text-muted"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute -top-3 w-8 h-1 bg-brand-primary rounded-full drop-shadow-[0_0_6px_rgba(255,90,0,0.8)]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('store_updated', handler);
    return () => window.removeEventListener('store_updated', handler);
  }, []);

  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-white flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--color-bg-card)] border-b md:border-r border-[var(--color-border-card)] p-4 flex md:flex-col items-center md:items-stretch justify-between md:justify-start shrink-0">
        <div className="flex items-center gap-2 md:mb-8 px-2">
           <Shield className="text-brand-primary shrink-0" size={28} />
           <span className="font-bold text-lg md:text-xl text-white">Admin Panel</span>
        </div>
        
        <nav className="flex-1 flex md:flex-col gap-2 px-2 overflow-x-auto items-center md:items-stretch justify-center md:justify-start">
           <Link to="/admin" className="flex items-center gap-2 px-4 py-2 md:py-3 rounded-xl bg-brand-primary/10 text-brand-primary font-medium hover:bg-brand-primary/20 transition-colors">
              <Home size={18} className="shrink-0" /> <span className="hidden sm:inline">Dashboard</span>
           </Link>
           {/* Add more admin links here */}
        </nav>

        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 md:py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors md:mt-auto font-medium shrink-0">
          <LogOut size={18} className="shrink-0" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 relative md:max-h-screen overflow-y-auto">
         <div className="p-4 md:p-8">
           <Outlet />
         </div>
      </main>
    </div>
  );
}
