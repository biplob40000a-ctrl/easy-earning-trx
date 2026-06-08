import { useEffect, useState } from 'react';
import { store } from '../../lib/store';
import { Transaction, User, Product } from '../../types';
import { formatTRX, generateId } from '../../lib/utils';
import { Users, CreditCard, Activity, Bell, Box, Edit, Trash, Plus, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'stakes' | 'finances' | 'settings'>('overview');
  
  // Product Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [prodForm, setProdForm] = useState({ name: '', hash: '', price: '0', img: '' });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ balance: '0', vipLevel: 0, password: '' });
  const [viewedUserHistory, setViewedUserHistory] = useState<Transaction[] | null>(null);

  const [supportLink, setSupportLink] = useState('');
  const [vipLevels, setVipLevels] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  
  const [editingMethod, setEditingMethod] = useState<any | null>(null);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [methodForm, setMethodForm] = useState({ name: '', network: '', address: '' });

  const refreshData = () => {
    const state = store.getState();
    setUsers(state.users);
    setTxs(state.transactions);
    setProducts(state.products);
    setSupportLink(state.supportLink || '');
    setVipLevels(state.vipLevels || []);
    setPaymentMethods(state.paymentMethods || []);
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('store_updated', handleUpdate);
    return () => window.removeEventListener('store_updated', handleUpdate);
  }, []);

  const pendingDeposits = txs.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdraws = txs.filter(t => t.type === 'withdraw' && t.status === 'pending');

  const handleBlockUser = (id: string, isBlocked: boolean) => {
    store.updateUser(id, { isBlocked });
    refreshData();
  };

  const handleApproveDeposit = (tx: Transaction) => {
    store.updateTransaction(tx.id, { status: 'completed' });
    const user = store.getState().users.find(u => u.id === tx.userId);
    if (user) {
      store.updateUser(user.id, { balance: user.balance + tx.amount, totalEarnings: user.totalEarnings + tx.amount });
      
      const allUsers = store.getState().users;
      // L1
      if (user.referrerId) {
        const l1 = allUsers.find(u => u.username.trim().toLowerCase() === user.referrerId?.trim().toLowerCase());
        if (l1) {
          const r1 = tx.amount * 0.10;
          store.updateUser(l1.id, { balance: l1.balance + r1, totalEarnings: l1.totalEarnings + r1 });
          store.addTransaction({ userId: l1.id, type: 'reward', amount: r1, status: 'completed', description: `Team Level 1 Reward (${user.username})` });
          
          // L2
          if (l1.referrerId) {
            const l2 = allUsers.find(u => u.username.trim().toLowerCase() === l1.referrerId?.trim().toLowerCase());
            if (l2) {
              const r2 = tx.amount * 0.05;
              store.updateUser(l2.id, { balance: l2.balance + r2, totalEarnings: l2.totalEarnings + r2 });
              store.addTransaction({ userId: l2.id, type: 'reward', amount: r2, status: 'completed', description: `Team Level 2 Reward (${user.username})` });
              
              // L3
              if (l2.referrerId) {
                const l3 = allUsers.find(u => u.username.trim().toLowerCase() === l2.referrerId?.trim().toLowerCase());
                if (l3) {
                  const r3 = tx.amount * 0.02;
                  store.updateUser(l3.id, { balance: l3.balance + r3, totalEarnings: l3.totalEarnings + r3 });
                  store.addTransaction({ userId: l3.id, type: 'reward', amount: r3, status: 'completed', description: `Team Level 3 Reward (${user.username})` });
                }
              }
            }
          }
        }
      }
    }
    refreshData();
  };

  const handleRejectDeposit = (tx: Transaction) => {
    store.updateTransaction(tx.id, { status: 'rejected' });
    refreshData();
  };

  const handleApproveWithdraw = (tx: Transaction) => {
    store.updateTransaction(tx.id, { status: 'completed' });
    refreshData();
  };

  const handleRejectWithdraw = (tx: Transaction) => {
    store.updateTransaction(tx.id, { status: 'rejected' });
    const user = store.getState().users.find(u => u.id === tx.userId);
    if (user) {
      store.updateUser(user.id, { balance: user.balance + tx.amount }); // refund
    }
    refreshData();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      store.deleteProduct(id);
      refreshData();
    }
  };

  const handleSaveProduct = () => {
    if (isAddingProduct) {
      store.addProduct({
        name: prodForm.name,
        hash: prodForm.hash,
        price: parseFloat(prodForm.price) || 0,
        img: prodForm.img
      });
    } else if (editingProduct) {
      store.updateProduct(editingProduct.id, {
        name: prodForm.name,
        hash: prodForm.hash,
        price: parseFloat(prodForm.price) || 0,
        img: prodForm.img
      });
    }
    setEditingProduct(null);
    setIsAddingProduct(false);
    refreshData();
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdForm({ name: p.name, hash: p.hash, price: p.price.toString(), img: p.img });
  };

  const openAddProduct = () => {
    setIsAddingProduct(true);
    setProdForm({ name: '', hash: '', price: '0', img: '' });
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({ balance: u.balance.toString(), vipLevel: u.vipLevel, password: u.password });
  };

  const handleSaveUser = () => {
    if (editingUser) {
      store.updateUser(editingUser.id, {
        balance: parseFloat(userForm.balance) || 0,
        vipLevel: userForm.vipLevel,
        password: userForm.password || editingUser.password
      });
      setEditingUser(null);
      refreshData();
    }
  };

  const openUserHistory = (userId: string) => {
    const history = store.getState().transactions.filter(t => t.userId === userId && t.type === 'mining').sort((a,b) => b.timestamp - a.timestamp);
    setViewedUserHistory(history);
  };

  const handleSaveMethod = () => {
    if (isAddingMethod) {
      store.addPaymentMethod(methodForm);
    } else if (editingMethod) {
      store.updatePaymentMethod(editingMethod.id, methodForm);
    }
    setEditingMethod(null);
    setIsAddingMethod(false);
    refreshData();
  };

  const openEditMethod = (m: any) => {
    setEditingMethod(m);
    setMethodForm({ name: m.name, network: m.network, address: m.address });
  };

  const handleDeleteMethod = (id: string) => {
    if (confirm('Delete this payment method?')) {
      store.deletePaymentMethod(id);
      refreshData();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
           <p className="text-text-muted">Manage users, products, and finances.</p>
         </div>
         <div className="flex gap-2 p-1 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" />
            <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="Products" />
            <TabButton active={activeTab === 'stakes'} onClick={() => setActiveTab('stakes')} label="Stakes" />
            <TabButton active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} label="Finances" />
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings" />
         </div>
      </div>


      {activeTab === 'stakes' && (
        <div className="glass-panel p-6 rounded-3xl overflow-x-auto">
          <h2 className="text-xl font-bold mb-6">User Stakes</h2>
          <table className="w-full text-left text-sm">
             <thead>
               <tr className="text-text-muted border-b border-[var(--color-border-card)]">
                 <th className="pb-3 font-medium">User ID</th>
                 <th className="pb-3 font-medium">Amount</th>
                 <th className="pb-3 font-medium">Duration</th>
                 <th className="pb-3 font-medium">Status</th>
                 <th className="pb-3 font-medium text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[var(--color-border-card)]">
               {(store.getState().stakes || []).map(stake => {
                 const u = users.find(u => u.id === stake.userId);
                 return (
                 <tr key={stake.id} className="hover:bg-[var(--color-bg-base)] transition-colors">
                   <td className="py-4 font-medium">{u?.username || stake.userId.substring(0,6)}</td>
                   <td className="py-4 font-bold text-brand-gold">{formatTRX(stake.amount)}</td>
                   <td className="py-4 text-xs">{stake.durationMonths} Months</td>
                   <td className="py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                       stake.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-500'
                     }`}>
                       {stake.status}
                     </span>
                   </td>
                   <td className="py-4 text-right space-x-2">
                     {stake.status === 'active' && (
                       <button onClick={() => {
                         if (confirm('Mark this stake as completed?')) {
                           store.updateStake(stake.id, { status: 'completed' });
                           refreshData();
                         }
                       }} className="p-1 px-2 text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-md">
                         Complete
                       </button>
                     )}
                     <button onClick={() => {
                       if (confirm('Delete this stake?')) {
                         store.deleteStake(stake.id);
                         refreshData();
                       }
                     }} className="p-1 px-2 text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md">
                       Delete
                     </button>
                   </td>
                 </tr>
               )})}
               {(store.getState().stakes || []).length === 0 && (
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-text-muted">No stakes found.</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="glass-panel p-6 rounded-3xl overflow-x-auto">
          <h2 className="text-xl font-bold mb-6">Financial Requests</h2>
          <table className="w-full text-left text-sm">
             <thead>
               <tr className="text-text-muted border-b border-[var(--color-border-card)]">
                 <th className="pb-3 font-medium">Date</th>
                 <th className="pb-3 font-medium">User ID</th>
                 <th className="pb-3 font-medium">Type</th>
                 <th className="pb-3 font-medium">Details / Address</th>
                 <th className="pb-3 font-medium">Amount</th>
                 <th className="pb-3 font-medium">Status</th>
                 <th className="pb-3 font-medium text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[var(--color-border-card)]">
               {txs.filter(t => t.type === 'deposit' || t.type === 'withdraw').sort((a,b) => b.timestamp - a.timestamp).map(tx => {
                 const u = users.find(u => u.id === tx.userId);
                 return (
                 <tr key={tx.id} className="hover:bg-[var(--color-bg-base)] transition-colors">
                   <td className="py-4 text-text-muted text-xs">{new Date(tx.timestamp).toLocaleString()}</td>
                   <td className="py-4 font-medium">{u?.username || tx.userId.substring(0,6)}</td>
                   <td className="py-4 uppercase text-xs font-bold">{tx.type}</td>
                   <td className="py-4 text-xs text-text-muted max-w-[150px] truncate" title={tx.address || tx.description}>{tx.address || tx.description || '-'}</td>
                   <td className="py-4 font-bold text-brand-gold">{formatTRX(tx.amount)}</td>
                   <td className="py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                       tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                       tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                     }`}>
                       {tx.status}
                     </span>
                   </td>
                   <td className="py-4 text-right space-x-2">
                     {tx.status === 'pending' && (
                       <div className="flex justify-end gap-2">
                         <button onClick={() => tx.type === 'deposit' ? handleApproveDeposit(tx) : handleApproveWithdraw(tx)} className="p-1.5 px-3 text-xs bg-green-500/10 text-green-500 font-bold hover:bg-green-500/20 rounded-lg">
                           Approve
                         </button>
                         <button onClick={() => tx.type === 'deposit' ? handleRejectDeposit(tx) : handleRejectWithdraw(tx)} className="p-1.5 px-3 text-xs bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 rounded-lg">
                           Reject
                         </button>
                       </div>
                     )}
                   </td>
                 </tr>
               )})}
             </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6">System Settings</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm text-text-muted mb-1 block">Customer Support (Telegram Link)</label>
                <input 
                  type="text" 
                  value={supportLink} 
                  onChange={(e) => setSupportLink(e.target.value)} 
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" 
                />
              </div>
              <button 
                onClick={() => {
                  store.updateSystemSettings({ supportLink });
                  alert('Settings saved!');
                }} 
                className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/80 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6">VIP Level Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vipLevels.map((vp) => (
                <div key={vp.level} className="bg-[var(--color-bg-base)] p-4 rounded-xl border border-[var(--color-border-card)]">
                  <div className="font-bold mb-2">{vp.name}</div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-text-muted">Price (TRX)</label>
                      <input 
                        type="number" 
                        value={vp.price} 
                        onChange={(e) => {
                          const newPrice = Number(e.target.value);
                          const updated = vipLevels.map(v => v.level === vp.level ? { ...v, price: newPrice } : v);
                          setVipLevels(updated);
                        }}
                        className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded py-2 px-3 text-white mt-1" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Daily Income (TRX)</label>
                      <input 
                        type="number" 
                        value={vp.dailyIncome} 
                        onChange={(e) => {
                          const newIncome = Number(e.target.value);
                          const updated = vipLevels.map(v => v.level === vp.level ? { ...v, dailyIncome: newIncome } : v);
                          setVipLevels(updated);
                        }}
                        className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded py-2 px-3 text-white mt-1" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      store.updateVipLevel(vp.level, { price: vp.price, dailyIncome: vp.dailyIncome });
                      alert(`${vp.name} settings saved!`);
                    }} 
                    className="w-full mt-4 py-2 bg-brand-gold/10 text-brand-gold font-bold rounded-lg hover:bg-brand-gold/20"
                  >
                    Save {vp.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
              Payment Methods (Recharge)
              <button onClick={() => { setIsAddingMethod(true); setMethodForm({ name: '', network: 'TRC20', address: '' }); }} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-xl text-sm gap-2 inline-flex items-center">
                <Plus size={16} /> Add Method
              </button>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((m) => (
                <div key={m.id} className="bg-[var(--color-bg-base)] p-4 rounded-xl border border-[var(--color-border-card)]">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold">{m.name}</div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditMethod(m)} className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteMethod(m.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-text-muted">Network: <span className="text-white">{m.network}</span></div>
                    <div className="text-xs text-text-muted break-all">Address: <span className="text-white font-mono">{m.address}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard icon={<Users />} label="Total Users" value={users.length.toString()} color="text-blue-500" bg="bg-blue-500/10" />
            <StatCard icon={<CreditCard />} label="Total Deposits" value={formatTRX(txs.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((acc, tx) => acc + tx.amount, 0))} color="text-green-500" bg="bg-green-500/10" />
            <StatCard icon={<Activity />} label="Pending Deposits" value={pendingDeposits.length.toString()} color="text-brand-primary" bg="bg-brand-primary/10" />
            <StatCard icon={<Activity />} label="Pending Withdraws" value={pendingWithdraws.length.toString()} color="text-red-500" bg="bg-red-500/10" />
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><Bell className="text-brand-gold" /> System Notices</div>
              <button 
                onClick={() => {
                  const text = prompt('Enter new notice text:');
                  if (text) {
                    store.addNotice(text);
                    refreshData();
                  }
                }}
                className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold"
              >
                + Add Notice
              </button>
            </h2>
            <div className="space-y-3">
              {store.getState().notices.map(n => (
                <div key={n.id} className="flex justify-between items-center p-3 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border-card)] gap-4">
                  <span className="text-sm flex-1">{n.text}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        store.updateNotice(n.id, { isActive: !n.isActive });
                        refreshData();
                      }}
                      className={`text-xs px-2 py-1 rounded-md ${n.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                    >
                      {n.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Delete this notice?')) {
                          store.deleteNotice(n.id);
                          refreshData();
                        }
                      }}
                      className="p-1 px-2 text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl overflow-x-auto">
           <h2 className="text-xl font-bold mb-6">User Management</h2>
           <table className="w-full text-left text-sm">
             <thead>
               <tr className="text-text-muted border-b border-[var(--color-border-card)]">
                 <th className="pb-3 font-medium">Username</th>
                 <th className="pb-3 font-medium">Phone</th>
                 <th className="pb-3 font-medium">Balance</th>
                 <th className="pb-3 font-medium">Referred By</th>
                 <th className="pb-3 font-medium">Status</th>
                 <th className="pb-3 font-medium text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[var(--color-border-card)]">
               {users.map(u => (
                 <tr key={u.id} className="hover:bg-[var(--color-bg-base)] transition-colors">
                   <td className="py-4 font-medium flex items-center gap-2">
                     {u.username}
                     {u.role === 'admin' && <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-500 rounded font-bold uppercase">Admin</span>}
                   </td>
                   <td className="py-4 text-text-muted">{u.phone}</td>
                   <td className="py-4 text-brand-gold font-bold">{formatTRX(u.balance)}</td>
                   <td className="py-4 text-text-muted">{u.referrerId && u.referrerId.toLowerCase() !== 'admin' ? u.referrerId : '-'}</td>
                   <td className="py-4">
                     {u.isBlocked ? (
                       <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold">Blocked</span>
                     ) : (
                       <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold">Active</span>
                     )}
                   </td>
                   <td className="py-4 text-right space-x-2 whitespace-nowrap">
                     <button onClick={() => openUserHistory(u.id)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg inline-flex items-center gap-1">
                       <Activity size={16} /> <span className="hidden sm:inline">History</span>
                     </button>
                     <button onClick={() => openEditUser(u)} className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-lg inline-flex items-center gap-1">
                       <Edit size={16} /> <span className="hidden sm:inline">Edit</span>
                     </button>
                     {u.isBlocked ? (
                       <button onClick={() => handleBlockUser(u.id, false)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg inline-flex items-center gap-1" title="Unblock">
                         <ShieldCheck size={16} /> <span className="hidden sm:inline">Unblock</span>
                       </button>
                     ) : (
                       <button onClick={() => handleBlockUser(u.id, true)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg inline-flex items-center gap-1" title="Block">
                         <ShieldAlert size={16} /> <span className="hidden sm:inline">Block</span>
                       </button>
                     )}
                   </td>
                 </tr>
               ))}
               {users.length === 0 && (
                 <tr><td colSpan={6} className="text-center py-6 text-text-muted">No users registered yet.</td></tr>
               )}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Box /> Product Management</h2>
            <button onClick={openAddProduct} className="bg-brand-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-brand-primary/80 transition-colors">
              <Plus size={18} /> Add Product
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-2xl overflow-hidden p-4 flex gap-4">
                 <img src={p.img} alt={p.name} className="w-20 h-20 rounded-xl object-cover" />
                 <div className="flex-1">
                   <h3 className="font-bold line-clamp-1 text-sm">{p.name}</h3>
                   <div className="text-xs text-text-muted mb-2">{p.hash}</div>
                   <div className="font-bold text-brand-gold text-sm">{formatTRX(p.price)}</div>
                   <div className="flex items-center justify-end gap-2 mt-2">
                     <button onClick={() => openEditProduct(p)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit size={16}/></button>
                     <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash size={16}/></button>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {(isAddingProduct || editingProduct) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{isAddingProduct ? 'Add Product' : 'Edit Product'}</h3>
                <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Product Name</label>
                  <input type="text" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Hash Rate (e.g., 100 TH/s)</label>
                  <input type="text" value={prodForm.hash} onChange={(e) => setProdForm({ ...prodForm, hash: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Price (TRX)</label>
                  <input type="number" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Image URL</label>
                  <input type="text" value={prodForm.img} onChange={(e) => setProdForm({ ...prodForm, img: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <button onClick={handleSaveProduct} className="w-full py-3 mt-4 bg-brand-primary text-white font-bold rounded-xl">
                  {isAddingProduct ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit User ({editingUser.username})</h3>
                <button onClick={() => setEditingUser(null)} className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Balance (TRX)</label>
                  <input type="number" value={userForm.balance} onChange={(e) => setUserForm({ ...userForm, balance: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Password</label>
                  <input type="text" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                  <p className="text-xs text-text-muted mt-1">Leave as is unless changing it.</p>
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">VIP Level (0-9)</label>
                  <input type="number" value={userForm.vipLevel} onChange={(e) => setUserForm({ ...userForm, vipLevel: parseInt(e.target.value) || 0 })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <button onClick={handleSaveUser} className="w-full py-3 mt-4 bg-brand-primary text-white font-bold rounded-xl">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {viewedUserHistory && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-bold">Mining History</h3>
                <button onClick={() => setViewedUserHistory(null)} className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 overflow-y-auto shrink-1 max-h-[60vh]">
                {viewedUserHistory.length === 0 ? (
                  <div className="text-center py-10 text-text-muted">No mining history found</div>
                ) : (
                  viewedUserHistory.map(tx => (
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
            </motion.div>
          </motion.div>
        )}

        {(isAddingMethod || editingMethod) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{isAddingMethod ? 'Add Payment Method' : 'Edit Payment Method'}</h3>
                <button onClick={() => { setIsAddingMethod(false); setEditingMethod(null); }} className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Name (e.g. Binance / Bybit)</label>
                  <input type="text" value={methodForm.name} onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Network (e.g. TRC20, ERC20)</label>
                  <input type="text" value={methodForm.network} onChange={(e) => setMethodForm({ ...methodForm, network: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white" />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Deposit Address</label>
                  <input type="text" value={methodForm.address} onChange={(e) => setMethodForm({ ...methodForm, address: e.target.value })} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white font-mono" />
                </div>
                <button onClick={handleSaveMethod} className="w-full py-3 mt-4 bg-brand-primary text-white font-bold rounded-xl">
                  {isAddingMethod ? 'Create Method' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: any) {
  return (
    <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
      <div>
        <div className="text-sm text-text-muted mb-1">{label}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        active ? 'bg-brand-primary text-white shadow-md' : 'text-text-muted hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
