import { useAuth } from '../contexts/AuthContext';
import { store, VIP_LEVELS } from '../lib/store';
import { formatTRX } from '../lib/utils';
import { Megaphone, ArrowUpRight, ArrowDownRight, Wallet, Activity, ChevronRight, ShoppingBag, Lock } from 'lucide-react';
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

import MiningBillboard from '../components/MiningBillboard';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const state = store.getState();
  const userVip = VIP_LEVELS.find(v => v.level === user?.vipLevel) || VIP_LEVELS[0];
  const [fakeTrades, setFakeTrades] = useState<{id: string, type: 'buy'|'sell', price: string, amount: string, time: string}[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    let currentPrice = 0.3326;
    
    const generateTrade = () => {
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const priceChange = (Math.random() - (type === 'buy' ? 0.3 : 0.7)) * 0.0005;
      currentPrice = currentPrice + priceChange;
      
      return {
        id: `trade-${Date.now()}-${Math.random()}`,
        type,
        price: currentPrice.toFixed(4),
        amount: (Math.random() * 5000 + 100).toFixed(2),
        time: new Date().toLocaleTimeString([], { hour12: false })
      };
    };

    // Initial trades
    setFakeTrades(Array.from({ length: 6 }).map(generateTrade).reverse());

    const interval = setInterval(() => {
      setFakeTrades(prev => [generateTrade(), ...prev].slice(0, 6));
    }, 2000);
    
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

      {/* Animated TRON Red Theme Billboard with Mining Cat */}
      <MiningBillboard />

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

      <div className="grid grid-cols-5 gap-2">
        <QuickAction icon={<Wallet />} label="Recharge" onClick={() => navigate('/finance/deposit')} color="text-brand-primary" bg="bg-brand-primary/10" />
        <QuickAction icon={<ArrowDownRight />} label="Withdraw" onClick={() => navigate('/finance/withdraw')} color="text-blue-400" bg="bg-blue-400/10" />
        <QuickAction icon={<Lock />} label="Stake" onClick={() => navigate('/stake')} color="text-green-500" bg="bg-green-500/10" />
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

      {/* Official Partners / Supported Platforms */}
      <div className="py-2">
        <p className="text-center font-bold text-text-muted text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 justify-center">
          <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[var(--color-border-card)]"></span>
          Supported Platforms
          <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[var(--color-border-card)]"></span>
        </p>
        <div className="flex justify-center gap-6 items-center">
          <div className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
             <div className="w-4 h-4 bg-[#FCD535] flex items-center justify-center transform rotate-45">
               <div className="w-1.5 h-1.5 bg-[#111]"></div>
             </div>
             <span className="font-bold text-white tracking-widest text-sm">BINANCE</span>
          </div>

          <div className="flex items-center gap-1 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
             <div className="font-black text-white tracking-tighter text-xl italic">
                BYB<span className="text-yellow-500">I</span>T
             </div>
          </div>

          <div className="flex items-center gap-1 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
             <div className="w-4 h-4 bg-[#FF060A] transform rotate-45 rounded-[2px]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'none', background: 'transparent', borderBottom: '16px solid #FF060A', borderLeft: '8px solid transparent', borderRight: '8px solid transparent' }}></div>
             <span className="font-bold text-white tracking-wider text-sm">TRON</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity size={20} className="text-brand-primary" /> Live Global Trading
          </h3>
          <span className="text-xs text-text-muted px-2 py-1 bg-[var(--color-bg-base)] rounded">TRX/USDT</span>
        </div>
        
        <div className="glass-panel p-1 rounded-2xl overflow-hidden">
         <div className="grid grid-cols-3 text-xs font-bold text-text-muted p-3 border-b border-[var(--color-border-card)]">
            <div>Price</div>
            <div className="text-right">Qty(TRX)</div>
            <div className="text-right">Time</div>
         </div>
         <div className="flex flex-col relative h-[250px] overflow-hidden">
            <div className="flex-1 w-full flex flex-col">
              {fakeTrades.map((trade) => (
                <motion.div 
                  key={trade.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className="grid grid-cols-3 text-sm p-3 border-b border-[var(--color-border-card)]/30 items-center font-mono"
                >
                  <div className={`font-bold flex items-center gap-1 ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.type === 'buy' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trade.price}
                  </div>
                  <div className="text-right text-gray-200">
                    {trade.amount}
                  </div>
                  <div className="text-right text-text-muted text-xs">
                    {trade.time}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Fade out at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent pointer-events-none" />
         </div>
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
