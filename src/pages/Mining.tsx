import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store, VIP_LEVELS } from '../lib/store';
import { formatTRX, cn } from '../lib/utils';
import { Pickaxe, CheckCircle2, History as HistoryIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Mining() {
  const { user, refreshUser } = useAuth();
  
  // 'idle' = user can start mining
  // 'mining' = mining in progress (fake progress bar)
  // 'claim' = mining finished, user can claim reward
  // 'done' = claimed for today
  const [status, setStatus] = useState<'idle' | 'mining' | 'claim' | 'done' | 'upgrade'>('done');

  const [success, setSuccess] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const vipLevelsInfo = store.getState().vipLevels || VIP_LEVELS;
  const userVip = vipLevelsInfo.find(v => v.level === user?.vipLevel) || vipLevelsInfo[0];

  useEffect(() => {
    checkMiningStatus();
  }, [user]);

  const checkMiningStatus = () => {
    if (!user) return;
    
    if (user.vipLevel === 0) {
      setStatus('upgrade');
      return;
    }

    if (!user.lastMiningDate) {
      setStatus('idle');
      return;
    }
    
    // Check if last mining was on a previous calendar day
    const lastDate = new Date(user.lastMiningDate);
    const currDate = new Date();
    
    if (lastDate.toDateString() !== currDate.toDateString()) {
      setStatus('idle');
    } else {
      setStatus('done');
    }
  };

  const handleStartMining = () => {
    if (!user || status !== 'idle') return;
    setStatus('mining');
    setProgress(0);
    
    // Simulate mining progress over 3 seconds
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setStatus('claim');
      }
    }, 150);
  };

  const handleClaim = () => {
    if (!user || status !== 'claim') return;
    
    const newBalance = user.balance + userVip.dailyIncome;
    const newTotal = user.totalEarnings + userVip.dailyIncome;
    
    store.updateUser(user.id, {
      balance: newBalance,
      totalEarnings: newTotal,
      lastMiningDate: Date.now()
    });
    
    store.addTransaction({
      userId: user.id,
      type: 'mining',
      amount: userVip.dailyIncome,
      status: 'completed',
      description: `Daily mining reward (${userVip.name})`
    });
    
    refreshUser();
    setStatus('done');
    setSuccess(`Successfully claimed ${formatTRX(userVip.dailyIncome)}!`);
  };

  const miningHistory = store.getState().transactions
    .filter(t => t.userId === user?.id && t.type === 'mining')
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6 pb-6 relative">
       <div className="flex items-center justify-between py-4 px-2">
         <div className="text-left">
           <h1 className="text-2xl font-bold">Cloud Mining</h1>
           <p className="text-text-muted mt-1 text-sm">Claim your daily TRX profit</p>
         </div>
         <button 
           onClick={() => setIsHistoryOpen(true)}
           className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center border border-[var(--color-border-card)]"
         >
           <HistoryIcon size={20} />
         </button>
       </div>

       <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center relative overflow-hidden border-brand-primary/20">
         <div className="absolute top-[-50px] w-40 h-40 bg-brand-primary/20 blur-[60px] rounded-full pointer-events-none" />
         
         <div className="text-sm font-medium text-brand-gold mb-2 border border-brand-gold/30 px-3 py-1 rounded-full bg-brand-gold/10">
           Current: {userVip.name}
         </div>
         
         <div className="text-4xl font-bold mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-gold to-brand-primary">
              +{formatTRX(userVip.dailyIncome)}
            </span>
            <span className="text-lg text-text-muted">/day</span>
         </div>

         <div className="relative w-48 h-48 flex items-center justify-center">
           {status === 'mining' && (
             <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
               <circle className="text-[var(--color-border-card)] stroke-current" strokeWidth="4" cx="50" cy="50" r="48" fill="none" />
               <motion.circle 
                 className="text-brand-primary stroke-current" 
                 strokeWidth="4" 
                 strokeLinecap="round" 
                 cx="50" cy="50" r="48" 
                 fill="none" 
                 initial={{ strokeDasharray: "0 300" }}
                 animate={{ strokeDasharray: `${progress * 3} 300` }}
               />
             </svg>
           )}
           
           <motion.button
              whileHover={status !== 'mining' && status !== 'done' ? { scale: 1.05 } : {}}
              whileTap={status !== 'mining' && status !== 'done' ? { scale: 0.95 } : {}}
              onClick={() => {
                if (status === 'upgrade') {
                  setSuccess(''); // trick to re-trigger if needed
                  setTimeout(() => setSuccess('Please buy a VIP to start mining'), 100);
                }
                if (status === 'idle') handleStartMining();
                if (status === 'claim') handleClaim();
              }}
              disabled={status === 'done' || status === 'mining'}
              className={cn(
                "w-40 h-40 rounded-full flex flex-col items-center justify-center gap-3 relative z-10 border-4 transition-all duration-500",
                status === 'idle' 
                  ? "bg-[var(--color-bg-base)] border-brand-primary shadow-[0_0_30px_rgba(255,90,0,0.5)] text-white hover:bg-brand-primary/10"
                  : status === 'mining'
                  ? "bg-[var(--color-bg-base)] border-brand-primary/30 text-brand-primary opacity-80"
                  : status === 'claim'
                  ? "bg-brand-primary border-brand-primary text-black shadow-[0_0_30px_rgba(255,90,0,0.7)]"
                  : status === 'upgrade'
                  ? "bg-[var(--color-bg-base)] border-brand-gold text-brand-gold shadow-[0_0_30px_rgba(234,179,8,0.3)] opacity-90"
                  : "bg-[var(--color-bg-base)] border-[var(--color-border-card)] text-text-muted shadow-inner opacity-80"
              )}
           >
             {status === 'mining' ? (
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="flex flex-col items-center">
                 <Pickaxe size={40} className="text-brand-primary mb-2" />
                 <span className="font-bold text-brand-primary text-sm">{progress}%</span>
               </motion.div>
             ) : status === 'idle' ? (
               <>
                 <Pickaxe size={48} className="text-brand-primary" />
                 <span className="font-bold text-lg leading-tight uppercase">Start<br/>Mining</span>
               </>
             ) : status === 'claim' ? (
               <>
                 <CheckCircle2 size={40} className="text-black" />
                 <span className="font-bold text-lg uppercase leading-tight text-center">Claim<br/>Reward</span>
               </>
             ) : status === 'upgrade' ? (
               <>
                 <Pickaxe size={48} className="text-brand-gold" />
                 <span className="font-bold text-lg leading-tight uppercase text-center">Need<br/>VIP</span>
               </>
             ) : (
               <>
                 <CheckCircle2 size={48} className="text-green-500" />
                 <span className="font-bold text-center leading-tight">Claimed<br/>Today</span>
               </>
             )}
           </motion.button>
         </div>

         {success && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 flex items-center justify-center text-center gap-2 px-4 py-2 rounded-xl ${status === 'upgrade' ? 'text-red-500 bg-red-500/10 border border-red-500/20' : 'text-green-500 bg-green-500/10 border border-green-500/20'}`}>
             {status !== 'upgrade' && <CheckCircle2 size={18} />} {success}
           </motion.div>
         )}
         
         <p className="text-center text-sm text-text-muted mt-8">
           Mining cycle resets every 24 hours at 00:00 UTC.
         </p>
       </div>

       <AnimatePresence>
        {isHistoryOpen && (
          <Modal onClose={() => setIsHistoryOpen(false)} title="Mining History">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {miningHistory.length === 0 ? (
                <div className="text-center py-10 text-text-muted">No mining history found</div>
              ) : (
                miningHistory.map(tx => (
                  <div key={tx.id} className="bg-[var(--color-bg-base)] border border-[var(--color-border-card)] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-green-500">{tx.description}</div>
                      <div className="text-xs text-text-muted mt-1">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="font-bold text-brand-gold">+{formatTRX(tx.amount)}</div>
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
