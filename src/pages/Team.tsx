import { useAuth } from '../contexts/AuthContext';
import { Users, Copy, CheckCircle2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { formatTRX } from '../lib/utils';
import { store } from '../lib/store';

export default function Team() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  // Default to a fallback if origin is not available or just use window.location.origin in browser
  const _origin = typeof window !== 'undefined' ? window.location.origin : 'https://easyearning.com';
  const refLink = `${_origin}/register?ref=${user?.username}`;

  const copyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allUsers = store.getState().users;
  
  // Build levels
  const l1Users = allUsers.filter(u => u.referrerId === user?.username);
  const l2Users = allUsers.filter(u => l1Users.some(l1 => l1.username === u.referrerId));
  const l3Users = allUsers.filter(u => l2Users.some(l2 => l2.username === u.referrerId));
  
  const teamSize = l1Users.length + l2Users.length + l3Users.length;
  
  const allTxs = store.getState().transactions;
  const teamReward = allTxs
    .filter(t => t.userId === user?.id && t.type === 'reward' && (t.description?.includes('Team') ?? false))
    .reduce((sum, t) => sum + t.amount, 0);

  const getLevelReward = (level: number) => {
    return allTxs
      .filter(t => t.userId === user?.id && t.type === 'reward' && (t.description?.includes(`Level ${level}`) ?? false))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Users className="text-brand-primary" /> My Team
        </h1>
        <p className="text-text-muted mt-1 text-sm">Grow your team and earn massive rewards!</p>
      </div>

      <div className="bg-gradient-to-r from-brand-primary/20 to-brand-gold/20 border border-brand-primary/30 rounded-3xl p-5 mb-6">
        <h3 className="text-brand-gold font-bold mb-3 flex items-center gap-2">
          <TrendingUp size={18} /> Referral Bonuses
        </h3>
        <ul className="space-y-2 text-sm text-white/90">
          <li className="flex justify-between items-center"><span className="text-text-muted">Level 1 (Direct):</span> <span className="font-bold text-green-400">10% Commission</span></li>
          <li className="flex justify-between items-center"><span className="text-text-muted">Level 2 (Indirect):</span> <span className="font-bold text-green-400">5% Commission</span></li>
          <li className="flex justify-between items-center"><span className="text-text-muted">Level 3 (Sub):</span> <span className="font-bold text-green-400">2% Commission</span></li>
        </ul>
      </div>

      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5">
           <Users size={120} />
        </div>
        <h3 className="font-bold text-lg mb-4">Invitation Link</h3>
        <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="text-sm text-text-muted truncate flex-1">
            {refLink}
          </div>
          <button 
            onClick={copyRef}
            className="w-10 h-10 shrink-0 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center hover:bg-brand-primary/20 transition-colors"
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
           <span className="text-text-muted">Invitation Code:</span>
           <span className="font-bold text-brand-gold">{user?.username}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-3xl flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-3">
             <Users size={24} />
           </div>
           <div className="text-sm text-text-muted mb-1">Team Size</div>
           <div className="text-2xl font-bold">{teamSize}</div>
        </div>
        <div className="glass-panel p-5 rounded-3xl flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3">
             <TrendingUp size={24} />
           </div>
           <div className="text-sm text-text-muted mb-1">Team Reward</div>
           <div className="text-xl font-bold text-green-500">{formatTRX(teamReward)}</div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden mt-6">
         <div className="p-4 border-b border-[var(--color-border-card)] font-bold">
           Level Details
         </div>
         <div className="divide-y divide-[var(--color-border-card)] text-sm">
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-brand-primary">Level 1 (10%)</div>
                <div className="text-text-muted text-xs mt-1">Direct Invites</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{l1Users.length} Members</div>
                <div className="text-text-muted text-xs mt-1">{formatTRX(getLevelReward(1))}</div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-brand-gold">Level 2 (5%)</div>
                <div className="text-text-muted text-xs mt-1">Indirect Invites</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{l2Users.length} Members</div>
                <div className="text-text-muted text-xs mt-1">{formatTRX(getLevelReward(2))}</div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-400">Level 3 (2%)</div>
                <div className="text-text-muted text-xs mt-1">Sub-Invites</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{l3Users.length} Members</div>
                <div className="text-text-muted text-xs mt-1">{formatTRX(getLevelReward(3))}</div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
