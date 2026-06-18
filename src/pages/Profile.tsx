import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Settings, Shield, History, HeadphonesIcon, LogOut, ChevronRight, Wallet, X } from 'lucide-react';
import { store } from '../lib/store';
import { formatTRX } from '../lib/utils';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editTrc20, setEditTrc20] = useState(user?.trc20Address || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [msg, setMsg] = useState('');

  if (!user) return null;

  const handleSaveProfile = () => {
    store.updateUser(user.id, { phone: editPhone, trc20Address: editTrc20 });
    refreshUser();
    setIsEditing(false);
    setMsg('Profile updated successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleChangePassword = () => {
    if (user.password !== oldPassword) {
      setMsg('Incorrect old password');
      return;
    }
    if (newPassword.length < 4) {
      setMsg('New password too short');
      return;
    }
    store.updateUser(user.id, { password: newPassword });
    refreshUser();
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setMsg('Password changed successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 pb-6 mt-4">
      {msg && (
        <div className={`p-4 rounded-xl text-sm border ${msg.includes('Incorrect') || msg.includes('short') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
          {msg}
        </div>
      )}

      {/* Profile Header */}
      <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 relative overflow-hidden bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-base)]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-gold flex items-center justify-center font-bold text-2xl text-black">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{user.username}</h2>
          <div className="text-sm text-text-muted mt-1">ID: {user.id}</div>
        </div>
        <div className="bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full text-xs font-bold">
          VIP {user.vipLevel}
        </div>
      </div>

      {/* Action Stats */}
      <div className="grid grid-cols-2 gap-4">
         <div className="relative rounded-3xl p-4 overflow-hidden bg-gradient-to-br from-[#FF0013] to-[#80000A] shadow-[0_10px_20px_-5px_rgba(255,0,19,0.4)] flex items-center justify-between">
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
           <div className="relative z-10">
             <div className="text-sm font-medium mb-1 text-white/80">Total Assets</div>
             <div className="font-bold text-lg text-white drop-shadow-sm">{formatTRX(user.balance)}</div>
           </div>
           <Wallet className="text-white opacity-90 drop-shadow-md relative z-10" size={32} />
         </div>
         <div className="glass-panel p-4 rounded-3xl flex items-center justify-between">
           <div>
             <div className="text-sm text-text-muted mb-1">Total Earned</div>
             <div className="font-bold text-lg text-green-500">{formatTRX(user.totalEarnings)}</div>
           </div>
           <History className="text-green-500 opacity-50" size={32} />
         </div>
      </div>

      {/* Menu Options */}
      <div className="glass-panel rounded-3xl overflow-hidden">
         {user.role === 'admin' && (
           <MenuButton icon={<Shield className="text-red-500" />} label="Admin Dashboard" onClick={() => navigate('/admin')} />
         )}
         <MenuButton icon={<Settings />} label="Edit Profile" onClick={() => setIsEditing(true)} />
         <MenuButton icon={<Shield />} label="Security Settings" onClick={() => setIsChangingPassword(true)} />
         <MenuButton icon={<History />} label="Financial Records" onClick={() => setIsHistoryOpen(true)} />
         <MenuButton icon={<HeadphonesIcon />} label="Customer Service" onClick={() => window.open(store.getState().supportLink, '_blank')} />
         <button 
           onClick={logout}
           className="w-full p-4 flex items-center justify-between hover:bg-black/20 transition-colors border-t border-[var(--color-border-card)] text-red-500"
         >
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
               <LogOut size={20} />
             </div>
             <span className="font-medium">Sign Out</span>
           </div>
         </button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <Modal onClose={() => setIsEditing(false)} title="Edit Profile">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted mb-1 block">Phone Number</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1 block">TRC20 Address</label>
                <input 
                  type="text" 
                  value={editTrc20} 
                  onChange={(e) => setEditTrc20(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white"
                />
              </div>
              <button onClick={handleSaveProfile} className="w-full py-3 mt-4 bg-brand-primary text-white font-bold rounded-xl">
                Save Profile
              </button>
            </div>
          </Modal>
        )}

        {isChangingPassword && (
          <Modal onClose={() => setIsChangingPassword(false)} title="Change Password">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted mb-1 block">Old Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1 block">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white"
                />
              </div>
              <button onClick={handleChangePassword} className="w-full py-3 mt-4 bg-brand-primary text-white font-bold rounded-xl">
                Change Password
              </button>
            </div>
          </Modal>
        )}

        {isHistoryOpen && (
          <Modal onClose={() => setIsHistoryOpen(false)} title="Financial Records">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {store.getState().transactions.filter(t => t.userId === user.id).length === 0 ? (
                <div className="text-center py-10 text-text-muted">No transactions found</div>
              ) : (
                store.getState().transactions
                  .filter(t => t.userId === user.id)
                  .sort((a,b) => b.timestamp - a.timestamp)
                  .map(tx => (
                  <div key={tx.id} className="bg-[var(--color-bg-base)] border border-[var(--color-border-card)] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm capitalize text-brand-gold">{tx.type}</div>
                      <div className="text-xs text-text-muted mt-1">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div className={`font-bold ${tx.type === 'withdraw' ? 'text-blue-500' : 'text-green-500'}`}>
                      {tx.type === 'withdraw' ? '-' : '+'}{formatTRX(tx.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-black/20 transition-colors border-b border-[var(--color-border-card)] last:border-0 group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-base)] flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight size={20} className="text-text-muted group-hover:text-white transition-colors" />
    </button>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
