import { useParams, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { formatTRX } from '../lib/utils';
import { ArrowLeft, Wallet, Copy, CheckCircle2, History as HistoryIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Finance() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const isDeposit = type === 'deposit';

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const paymentMethods = store.getState().paymentMethods || [];
  const [selectedMethodId, setSelectedMethodId] = useState(paymentMethods[0]?.id || '');

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

  const [withdrawMethod, setWithdrawMethod] = useState('Binance');
  const withdrawMethodsList = ['Binance', 'Bybit'];

  const isMobileBanking = ['bKash', 'Rocket'].includes(withdrawMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const val = parseFloat(amount);
    if (isNaN(val) || val < (isDeposit ? 30 : 10)) return; // Minimum check
    if (isDeposit && !txId.trim()) {
      setMsg('Please enter the Transaction ID');
      return;
    }

    if (!isDeposit && val > user.balance) {
      setMsg('Insufficient balance');
      return;
    }

    setLoading(true);
    setMsg('');

    setTimeout(() => {
      if (!isDeposit) {
        store.updateUser(user.id, { balance: user.balance - val });
      }
      
      store.addTransaction({
        userId: user.id,
        type: isDeposit ? 'deposit' : 'withdraw',
        amount: val,
        status: 'pending',
        address: isDeposit ? txId : `${withdrawMethod} - ${address || user.trc20Address}`,
        description: isDeposit ? `Awaiting network confirmation (${selectedMethod?.name || 'TRX'}). TXID: ${txId}` : `Awaiting admin approval via ${withdrawMethod}`
      });
      
      refreshUser();
      setLoading(false);
      setMsg(isDeposit ? 'Deposit request submitted. Awaiting confirmation.' : 'Withdrawal request submitted for approval.');
      setAmount('');
      setAddress('');
    }, 1500);
  };

  const copyAddress = () => {
    if (selectedMethod) {
      navigator.clipboard.writeText(selectedMethod.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-white p-4">
      <div className="flex items-center justify-between mb-8 pt-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center border border-[var(--color-border-card)]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{isDeposit ? 'Recharge TRX' : 'Withdraw TRX'}</h1>
        </div>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center border border-[var(--color-border-card)]"
        >
          <HistoryIcon size={20} />
        </button>
      </div>

      <div className="glass-panel p-6 rounded-3xl mb-6">
         <div className="text-sm text-text-muted mb-1">Available Balance</div>
         <div className="text-3xl font-bold text-gradient-gold">{formatTRX(user?.balance || 0)}</div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl mb-6 text-sm border ${msg.includes('Insufficient') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
          {msg}
        </div>
      )}

      {isDeposit && (
        <div className="mb-6 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] p-5 rounded-3xl shadow-lg">
          <div className="mb-4">
            <label className="text-sm font-medium text-text-muted px-1 mb-2 block">Select Payment Method</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedMethodId === m.id 
                    ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105' 
                    : 'bg-[var(--color-bg-base)] text-text-muted border-[var(--color-border-card)] hover:border-brand-primary/50 hover:text-white'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          
          {selectedMethod && (
            <div className="bg-gradient-to-br from-brand-primary/10 to-transparent p-4 rounded-xl border border-brand-primary/20">
              <div className="text-sm font-medium mb-3 flex justify-between items-center">
                <span>Transfer to {selectedMethod.network} Address/Number:</span>
              </div>
              <div className="flex items-center gap-3 bg-[var(--color-bg-base)] p-3 rounded-xl border border-[var(--color-border-card)] break-all text-sm font-mono text-brand-gold">
                <span className="flex-1">{selectedMethod.address}</span>
                <button onClick={copyAddress} className="text-brand-primary shrink-0 p-2">
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <div className="text-xs text-text-muted mt-3">
                Please transfer TRX to the address above. Network confirmations may take 1-5 minutes.
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isDeposit && (
          <>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-text-muted px-1">Withdraw to Wallet/Exchange</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {withdrawMethodsList.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setWithdrawMethod(method)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                      withdrawMethod === method 
                      ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105' 
                      : 'bg-[var(--color-bg-base)] text-text-muted border-[var(--color-border-card)] hover:border-brand-primary/50 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted px-1">Receiving {withdrawMethod} {isMobileBanking ? 'Number' : 'Address (TRC20)'}</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  placeholder={`Enter ${withdrawMethod} ${isMobileBanking ? 'Number' : 'Address'}`}
                  className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-all"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required={!isDeposit}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted px-1">{isDeposit ? 'Deposit Amount (TRX)' : 'Withdraw Amount (TRX)'}</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-[0_0_10px_rgba(235,11,44,0.3)]">
               <img src="/trx-logo.svg" alt="TRX" className="w-full h-full object-contain" />
            </div>
            <input
              type="number"
              min={isDeposit ? "30" : "10"}
              step="0.01"
              placeholder={isDeposit ? "Min. 30 TRX" : "Min. 10 TRX"}
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl py-3.5 pl-14 pr-4 text-white focus:outline-none focus:border-brand-primary transition-all font-bold text-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {!isDeposit && (
              <button 
                type="button" 
                onClick={() => setAmount(user?.balance.toString() || '0')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gold bg-brand-gold/10 px-2 py-1 rounded"
              >
                MAX
              </button>
            )}
          </div>
        </div>

        {isDeposit && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted px-1">Transaction ID (TXID)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Transaction Hash/ID"
                className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-brand-primary transition-all font-mono text-sm"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="text-xs text-text-muted mt-4 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] p-3 rounded-lg">
          <p className="font-bold mb-1 text-brand-gold">📢 Notice:</p>
          {isDeposit ? (
            <p>- Deposits may take 1 to 5 minutes to arrive in your balance.<br/>- Minimum deposit is 30 TRX.<br/>- Please enter correct Transaction ID.</p>
          ) : (
            <p>- Withdrawals are processed within 24 hours.<br/>- A 5% handling fee may apply.<br/>- Minimum withdrawal is 10 TRX.<br/>- Ensure your {withdrawMethod} {isMobileBanking ? 'number' : 'TRC-20 address'} is correct.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-primary to-brand-gold text-black font-bold py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,90,0,0.3)] mt-6 text-lg tracking-wide"
        >
          {loading ? 'Processing...' : isDeposit ? 'I Have Paid' : 'Request Withdrawal'}
        </button>
      </form>

      <AnimatePresence>
        {isHistoryOpen && (
          <Modal onClose={() => setIsHistoryOpen(false)} title={isDeposit ? 'Deposit History' : 'Withdrawal History'}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const history = store.getState().transactions.filter(t => t.userId === user?.id && t.type === (isDeposit ? 'deposit' : 'withdraw')).sort((a,b) => b.timestamp - a.timestamp);
                
                if (history.length === 0) return <div className="text-center py-10 text-text-muted">No history found</div>;
                
                return history.map(tx => (
                  <div key={tx.id} className="bg-[var(--color-bg-base)] border border-[var(--color-border-card)] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">
                        {isDeposit ? 'Deposit' : 'Withdrawal'}
                      </div>
                      <div className="text-xs text-text-muted mt-1">{new Date(tx.timestamp).toLocaleString()}</div>
                      <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        tx.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <div className={`font-bold ${isDeposit ? 'text-green-500' : 'text-red-500'}`}>
                      {isDeposit ? '+' : '-'}{formatTRX(tx.amount)}
                    </div>
                  </div>
                ));
              })()}
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
        className="w-full max-w-md bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto shrink-1">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
