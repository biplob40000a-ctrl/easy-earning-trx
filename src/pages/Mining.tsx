import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store, VIP_LEVELS } from '../lib/store';
import { formatTRX, cn } from '../lib/utils';
import { Pickaxe, CheckCircle2, History as HistoryIcon, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MiningBillboard from '../components/MiningBillboard';

export default function Mining() {
  const { user, refreshUser } = useAuth();
  
  // 'idle' = user can start mining
  // 'mining' = mining in progress (24 hours)
  // 'claim' = mining finished, user can claim reward
  // 'upgrade' = needs VIP
  const [status, setStatus] = useState<'idle' | 'mining' | 'claim' | 'upgrade'>('idle');

  const [success, setSuccess] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const vipLevelsInfo = store.getState().vipLevels || VIP_LEVELS;
  const userVip = vipLevelsInfo.find(v => v.level === user?.vipLevel) || vipLevelsInfo[0];

  useEffect(() => {
    checkMiningStatus();
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (status === 'mining') {
      interval = setInterval(() => {
        if (!user || !user.lastMiningDate) return;
        const diff = Date.now() - user.lastMiningDate;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        if (diff < TWENTY_FOUR_HOURS) {
          setTimeLeft(TWENTY_FOUR_HOURS - diff);
        } else {
          setStatus('claim');
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, user]);

  const checkMiningStatus = () => {
    if (!user) return;

    if (!user.lastMiningDate) {
      setStatus('idle');
      return;
    }
    
    const diff = Date.now() - user.lastMiningDate;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    if (diff < TWENTY_FOUR_HOURS) {
      setStatus('mining');
      setTimeLeft(TWENTY_FOUR_HOURS - diff);
    } else {
      setStatus('claim');
    }
  };

  const handleStartMining = () => {
    if (!user || status !== 'idle') return;
    
    store.updateUser(user.id, {
      lastMiningDate: Date.now()
    });
    refreshUser();
    setStatus('mining');
    setTimeLeft(24 * 60 * 60 * 1000);
  };

  const handleClaim = () => {
    if (!user || status !== 'claim') return;
    
    const amount = userVip.dailyIncome;
    const newBalance = user.balance + amount;
    const newTotal = user.totalEarnings + amount;
    
    store.updateUser(user.id, {
      balance: newBalance,
      totalEarnings: newTotal,
      lastMiningDate: null // Reset to null so they can start again immediately!
    });
    
    store.addTransaction({
      userId: user.id,
      type: 'mining',
      amount: amount,
      status: 'completed',
      description: `Daily mining reward (${userVip.name})`
    });
    
    refreshUser();
    setStatus('idle');
    setSuccess(`Successfully claimed ${formatTRX(amount)}!`);
    
    setTimeout(() => {
      setSuccess('');
    }, 3500);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
       
       <MiningBillboard 
         actionText={status === 'idle' ? 'START MINING' : status === 'claim' ? 'CLAIM REWARD' : 'ACTIVE NETWORK'} 
         onClickOverride={() => {}} 
       />

       <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center relative overflow-hidden border-brand-primary/20 bg-gradient-to-b from-[var(--color-bg-card)] to-[#111]">
         <div className="absolute top-[-50px] w-40 h-40 bg-brand-primary/20 blur-[60px] rounded-full pointer-events-none" />
         
         <div className="text-sm font-medium text-brand-gold mb-2 border border-brand-gold/30 px-3 py-1 rounded-full bg-brand-gold/10 z-10">
           Current: {userVip.name}
         </div>
         
         <div className="text-4xl font-bold mb-8 z-10">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-gold to-brand-primary">
              +{formatTRX(userVip.dailyIncome)}
            </span>
            <span className="text-lg text-text-muted">/day</span>
         </div>

         <div className="relative w-64 h-64 flex items-center justify-center">
            {status === 'mining' && (
              <div className="absolute inset-x-0 bottom-4 top-0 flex flex-col items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* Tron Diamond / Rock */}
                  <motion.div 
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 0.95, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, repeatType: "mirror" }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                  >
                    <div className="w-20 h-20 bg-red-600/20 rotate-45 border-2 border-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                      <div className="w-10 h-10 bg-red-500 rotate-0 flex items-center justify-center">
                        <span className="text-white font-bold transform -rotate-45">TRX</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pickaxe */}
                  <motion.div 
                    className="absolute bottom-20 left-16 text-red-500 z-10 drop-shadow-[0_0_10px_rgba(255,0,0,1)]"
                    animate={{ rotate: [-20, 60, -20] }}
                    transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
                    style={{ transformOrigin: "bottom right" }}
                  >
                    <Pickaxe size={48} />
                  </motion.div>

                  {/* Flying TRX Coins */}
                  <motion.div
                    className="absolute bottom-12 right-12 text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center border border-red-500 text-red-500 bg-[#111]"
                    animate={{ y: [0, -80, -120], x: [0, 40, 80], opacity: [1, 1, 0], scale: [1, 1.5, 0.5], rotate: [0, 180, 360] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeOut" }}
                  >
                    T
                  </motion.div>
                  <motion.div
                    className="absolute bottom-10 left-1/4 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center border border-red-500 text-red-500 bg-[#111]"
                    animate={{ y: [0, -60, -100], x: [0, -30, -60], opacity: [1, 1, 0], scale: [0.8, 1.2, 0.5], rotate: [0, -180, -360] }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  >
                    T
                  </motion.div>
                </div>
                <div className="absolute top-0 w-full text-center flex flex-col items-center gap-1">
                  <span className="font-bold text-red-500 text-lg bg-[#111] px-4 py-1 rounded-full border border-red-500/30 shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                    Mining Active
                  </span>
                  <span className="text-white font-mono text-xl font-bold drop-shadow-md">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            )}
            
            {status !== 'mining' && (
            <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 if (status === 'upgrade') {
                   setSuccess(''); 
                   setTimeout(() => setSuccess('Please buy a VIP to start mining'), 100);
                 }
                 if (status === 'idle') handleStartMining();
                 if (status === 'claim') handleClaim();
               }}
               className={cn(
                 "w-48 h-48 rounded-full flex flex-col items-center justify-center gap-3 relative z-10 border-4 transition-all duration-500",
                 status === 'idle' 
                   ? "bg-[var(--color-bg-base)] border-brand-primary shadow-[0_0_30px_rgba(255,90,0,0.5)] text-white hover:bg-brand-primary/10"
                   : status === 'claim'
                   ? "bg-brand-primary border-brand-primary text-black shadow-[0_0_30px_rgba(255,90,0,0.7)]"
                   : status === 'upgrade'
                   ? "bg-[var(--color-bg-base)] border-brand-gold text-brand-gold shadow-[0_0_30px_rgba(234,179,8,0.3)] opacity-90"
                   : "bg-[var(--color-bg-base)] border-[var(--color-border-card)] text-text-muted outline-none"
               )}
            >
              {status === 'idle' ? (
                <>
                  <Pickaxe size={48} className="text-brand-primary drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                  <span className="font-bold text-lg leading-tight uppercase mt-2 text-brand-primary">Start<br/>Mining</span>
                </>
              ) : status === 'claim' ? (
                <>
                  <CheckCircle2 size={40} className="text-black" />
                  <span className="font-bold text-lg uppercase leading-tight text-center">Claim<br/>Reward</span>
                </>
              ) : status === 'upgrade' && (
                <>
                  <Pickaxe className="opacity-50 text-brand-gold" size={48} />
                  <span className="font-bold text-lg leading-tight uppercase text-center mt-2">Need<br/>VIP</span>
                </>
              )}
            </motion.button>
            )}
          </div>

         {success && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 flex items-center justify-center text-center gap-2 px-4 py-2 rounded-xl border relative z-10 ${status === 'upgrade' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-green-500 bg-green-500/10 border-green-500/20'}`}>
             {status !== 'upgrade' && <CheckCircle2 size={18} />} {success}
           </motion.div>
         )}
         
         <p className="text-center text-sm text-text-muted mt-8 relative z-10">
           Mine crypto. Earn ROI. Receive yield immediately after 24 hrs.
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


