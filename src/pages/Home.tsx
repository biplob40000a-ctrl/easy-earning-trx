import { useAuth } from '../contexts/AuthContext';
import { store, VIP_LEVELS } from '../lib/store';
import { formatTRX } from '../lib/utils';
import { Megaphone, ArrowUpRight, ArrowDownRight, Wallet, Activity, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Transaction } from '../types';

function HistoryModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const transactions = store.getState().transactions.filter(t => t.userId === user?.id).sort((a,b) => b.timestamp - a.timestamp);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">History</h3>
          <button onClick={onClose} className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-text-muted">No history found</div>
          ) : (
            transactions.map(tx => (
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
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const state = store.getState();
  const userVip = VIP_LEVELS.find(v => v.level === user?.vipLevel) || VIP_LEVELS[0];
  const [dummyFeed, setDummyFeed] = useState<Transaction[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const generateDummy = () => {
      const types = ['deposit', 'withdraw', 'reward'];
      const feed = Array.from({length: 5}).map((_, i) => ({
        id: `dummy-${i}`,
        userId: `user***${Math.floor(Math.random() * 99)}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        amount: Math.floor(Math.random() * 500) + 10,
        status: 'completed' as any,
        timestamp: Date.now() - Math.floor(Math.random() * 60000)
      }));
      setDummyFeed(feed);
    };
    generateDummy();
    const interval = setInterval(generateDummy, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-6">
      <div className="glass-panel rounded-full py-2 px-4 flex items-center gap-3 overflow-hidden">
        <Megaphone size={18} className="text-brand-primary shrink-0" />
        <div className="flex-1 overflow-hidden relative h-5">
           <div className="absolute whitespace-nowrap animate-[marquee_20s_linear_infinite] text-sm text-brand-gold">
             {state.notices.filter(n => n.isActive).map(n => n.text).join(' • ')}
           </div>
        </div>
      </div>

      {/* Animated Action Billboard */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-[var(--color-bg-card)] to-[#1a1210] border border-brand-primary/30 p-5 rounded-3xl relative overflow-hidden group">
        <div className="w-16 h-16 shrink-0 relative z-10 flex items-center justify-center">
           {/* Simple CSS animation for breaking a mountain */}
           <div className="relative w-full h-full">
              {/* Mountain */}
              <div className="absolute bottom-2 left-2 w-12 h-12 bg-gray-800 rounded-t-xl rotate-45 border-t-2 border-l-2 border-brand-primary"></div>
              {/* Hammer */}
              <motion.div 
                 animate={{ rotate: [0, -45, 0] }}
                 transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                 className="absolute -top-1 right-0 text-3xl drop-shadow-[0_0_10px_rgba(255,0,19,0.8)] origin-bottom-right"
              >
                🔨
              </motion.div>
              {/* Sparkles on hit */}
              <motion.div
                 animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                 transition={{ repeat: Infinity, duration: 0.8, ease: "linear", times: [0, 0.4, 0.8] }}
                 className="absolute bottom-4 left-6 text-brand-gold font-bold text-xl drop-shadow-md"
              >
                ✨
              </motion.div>
           </div>
        </div>
        <div className="flex-1 relative z-10">
          <div className="bg-brand-primary/10 rounded-xl p-3 border border-brand-primary/20 relative backdrop-blur-sm">
            <div className="absolute -left-2 top-4 w-3 h-3 bg-brand-primary/10 rotate-45 border-l border-b border-brand-primary/20"></div>
            <p className="text-sm font-medium text-white italic">
              "We are mining non-stop! ✨<br/>
              <span className="text-brand-gold font-bold">New Offer: Buy VIP today & get exclusive rewards!</span>"
            </p>
          </div>
        </div>
      </div>

      <motion.div 
         initial={{ scale: 0.95, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }}
         className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#FF0013] to-[#CC000F] shadow-[0_15px_35px_-10px_rgba(255,0,19,0.4)]"
      >
         <div className="absolute top-0 right-0 p-4 opacity-20">
           <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 12 12 22 22 12 12 2"/></svg>
         </div>
         <div className="relative z-10">
           <div className="text-white/80 text-sm font-medium mb-1">Total Balance</div>
           <div className="text-4xl font-bold text-white mb-6 drop-shadow-md">
             {formatTRX(user?.balance || 0)}
           </div>
           
           <div className="flex gap-4">
              <button onClick={() => navigate('/finance/deposit')} className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-inner border border-white/10">
                <ArrowUpRight size={20} /> Deposit
              </button>
              <button onClick={() => navigate('/finance/withdraw')} className="flex-1 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-inner border border-black/10">
                <ArrowDownRight size={20} /> Withdraw
              </button>
           </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-2">
        <QuickAction icon={<Wallet />} label="Recharge" onClick={() => navigate('/finance/deposit')} color="text-brand-primary" bg="bg-brand-primary/10" />
        <QuickAction icon={<ArrowDownRight />} label="Withdraw" onClick={() => navigate('/finance/withdraw')} color="text-blue-400" bg="bg-blue-400/10" />
        <QuickAction icon={<ShoppingBag />} label="Shop" onClick={() => navigate('/shop')} color="text-brand-gold" bg="bg-brand-gold/10" />
        <QuickAction icon={<Activity />} label="History" onClick={() => setIsHistoryOpen(true)} color="text-purple-400" bg="bg-purple-400/10" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-3xl">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Wallet size={18} className="text-brand-gold" />
            <span className="text-sm">Today Earnings</span>
          </div>
          <div className="text-xl font-bold text-white">{formatTRX(0)}</div>
        </div>
        <div className="glass-panel p-4 rounded-3xl">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Activity size={18} className="text-green-500" />
            <span className="text-sm">Total Earnings</span>
          </div>
          <div className="text-xl font-bold text-white">{formatTRX(user?.totalEarnings || 0)}</div>
        </div>
      </div>

      <Link to="/vip" className="block glass-panel p-5 rounded-3xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 pointer-events-none group-hover:from-brand-gold/10 transition-colors" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="text-brand-gold font-bold text-lg">{userVip.name}</div>
            <div className="text-sm text-text-muted mt-1">Daily Income: <span className="text-white">{formatTRX(userVip.dailyIncome)}</span></div>
          </div>
          <div className="w-10 h-10 bg-[var(--color-bg-base)] rounded-full flex items-center justify-center border border-[var(--color-border-card)]">
            <ChevronRight size={20} className="text-text-muted group-hover:text-brand-gold transition-colors" />
          </div>
        </div>
      </Link>

      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity size={20} className="text-brand-primary" /> Live Activity
        </h3>
        <div className="glass-panel rounded-3xl p-2">
          {dummyFeed.map((item, i) => (
            <motion.div 
              key={item.id + i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 border-b border-[var(--color-border-card)] last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center text-xs text-text-muted">
                  {item.userId.substring(0,2)}..
                </div>
                <div>
                  <div className="text-sm font-medium border border-transparent">User {item.userId}</div>
                  <div className="text-xs text-text-muted capitalize">{item.type}</div>
                </div>
              </div>
              <div className="font-bold text-brand-gold">+{formatTRX(item.amount)}</div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} />}
    </div>
  );
}

function QuickAction({ icon, label, onClick, color, bg }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group w-full">
      <div className={`w-[60px] h-[60px] rounded-2xl ${bg} ${color} flex items-center justify-center group-hover:scale-105 transition-transform border border-[var(--color-border-card)]/50`}>
        {icon}
      </div>
      <span className="text-[11px] font-medium text-text-muted group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}
