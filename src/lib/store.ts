import { AppState, Notice, Transaction, User, VIPLevel, Product, Order, PaymentMethod } from '../types';
import { generateId } from './utils';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, deleteDoc } from 'firebase/firestore';

const STORE_KEY = 'easy_earning_trx_db_v2';
let unsubscribers: (() => void)[] = [];

// Fallback initial data (only used if Firebase doesn't load)
export const VIP_LEVELS: VIPLevel[] = [
  { level: 0, name: 'Free User', price: 0, dailyIncome: 0.5, validityDays: 365, maxTasks: 1 },
  { level: 1, name: 'VIP 1', price: 100, dailyIncome: 5, validityDays: 365, maxTasks: 5 },
  { level: 2, name: 'VIP 2', price: 300, dailyIncome: 18, validityDays: 365, maxTasks: 10 },
  { level: 3, name: 'VIP 3', price: 1000, dailyIncome: 65, validityDays: 365, maxTasks: 15 },
  { level: 4, name: 'VIP 4', price: 3000, dailyIncome: 210, validityDays: 365, maxTasks: 20 },
  { level: 5, name: 'VIP 5', price: 10000, dailyIncome: 800, validityDays: 365, maxTasks: 30 },
  { level: 6, name: 'VIP 6', price: 25000, dailyIncome: 2250, validityDays: 365, maxTasks: 40 },
  { level: 7, name: 'VIP 7', price: 50000, dailyIncome: 5000, validityDays: 365, maxTasks: 50 },
  { level: 8, name: 'VIP 8', price: 100000, dailyIncome: 12000, validityDays: 365, maxTasks: 60 },
];

const initialNotices: Notice[] = [
  { id: '1', text: 'Welcome to Easy Earning TRX! Join our Telegram for daily signals.', isActive: true, timestamp: Date.now() },
  { id: '2', text: 'VIP 3 upgrade now gives 10% extra daily bonus until the end of the month!', isActive: true, timestamp: Date.now() },
];

const initialProducts: Product[] = [
  { id: '1', name: 'Premium Running Shoes', hash: 'Size 42', price: 150, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '2', name: 'Classic Denim Pants', hash: 'Size 32', price: 85, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '3', name: 'Urban Sneakers', hash: 'Size 43', price: 120, img: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=300&h=300' },
];

const defaultState: AppState = {
  users: [],
  transactions: [],
  notices: initialNotices,
  systemBalance: 0,
  products: initialProducts,
  orders: [],
  supportLink: 'https://t.me/easyearning_support',
  vipLevels: VIP_LEVELS,
  paymentMethods: [
    { id: '1', name: 'Binance', network: 'TRC20', address: 'TBinanceAddress123456789' }
  ],
  stakes: [],
};

function updateLocalState(updates: Partial<AppState>) {
  const current = store.getState();
  const newState = { ...current, ...updates };
  localStorage.setItem(STORE_KEY, btoa(unescape(encodeURIComponent(JSON.stringify(newState)))));
  window.dispatchEvent(new Event('store_updated'));
}

export const store = {
  getState: (): AppState => {
    try {
      const storedRaw = localStorage.getItem(STORE_KEY);
      if (storedRaw) {
        return JSON.parse(decodeURIComponent(escape(atob(storedRaw))));
      }
    } catch (e) {
      console.error('Error reading store', e);
    }
    return defaultState;
  },

  clearUserSubscriptions: () => {
    unsubscribers.forEach(u => u());
    unsubscribers = [];
  },

  initFirebase: async (uid: string) => {
    store.clearUserSubscriptions();

    // Check user role
    let isAdmin = false;
    const user = auth.currentUser;
    if (user && (user.email === 'biplob40000a@gmail.com' || user.email === 'admin@easyearning.com')) {
      isAdmin = true;
    } else {
      const userDocRef = doc(db, 'users', uid);
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists() && snap.data().role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
          console.error("Checking admin failed");
      }
    }

    // 1. Users Collection
    if (isAdmin) {
      const u1 = onSnapshot(collection(db, 'users'), snapshot => {
        updateLocalState({ users: snapshot.docs.map(d => d.data() as User) });
      });
      unsubscribers.push(u1);
    } else {
      const u2 = onSnapshot(userDocRef, snapshot => {
        if (snapshot.exists()) {
           updateLocalState({ users: [snapshot.data() as User] });
        }
      });
      unsubscribers.push(u2);
    }

    // 2. Transactions
    const txQuery = isAdmin ? collection(db, 'transactions') : query(collection(db, 'transactions'), where('userId', '==', uid));
    const u3 = onSnapshot(txQuery, snapshot => {
      updateLocalState({ transactions: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Transaction)).sort((a, b) => b.timestamp - a.timestamp) });
    });
    unsubscribers.push(u3);

    // 3. Orders
    const orderQuery = isAdmin ? collection(db, 'orders') : query(collection(db, 'orders'), where('userId', '==', uid));
    const u4 = onSnapshot(orderQuery, snapshot => {
      updateLocalState({ orders: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order)).sort((a, b) => b.timestamp - a.timestamp) });
    });
    unsubscribers.push(u4);

    // 4. Products
    const u5 = onSnapshot(collection(db, 'products'), snapshot => {
      updateLocalState({ products: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product)) });
    });
    unsubscribers.push(u5);

    // 5. Notices
    const u6 = onSnapshot(collection(db, 'notices'), snapshot => {
      updateLocalState({ notices: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Notice)).sort((a, b) => b.timestamp - a.timestamp) });
    });
    unsubscribers.push(u6);

    // 6. Payment Methods
    const u7 = onSnapshot(collection(db, 'paymentMethods'), snapshot => {
      updateLocalState({ paymentMethods: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PaymentMethod)) });
    });
    unsubscribers.push(u7);

    // 7. System Config
    const u8 = onSnapshot(doc(db, 'config', 'system'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        updateLocalState({
          supportLink: data.supportLink,
          systemBalance: data.systemBalance,
          vipLevels: data.vipLevels || VIP_LEVELS
        });
      }
    });
    unsubscribers.push(u8);

    // 7. Stakes
    const stakeQuery = isAdmin ? collection(db, 'stakes') : query(collection(db, 'stakes'), where('userId', '==', uid));
    const u9 = onSnapshot(stakeQuery, snapshot => {
      // @ts-ignore
      updateLocalState({ stakes: snapshot.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => b.timestamp - a.timestamp) });
    });
    unsubscribers.push(u9);

    // Initial Database Seed for Admins
    if (isAdmin) {
       getDoc(doc(db, 'config', 'system')).then(async snap => {
          if (!snap.exists()) {
             console.log("Seeding Database...");
             await setDoc(doc(db, 'config', 'system'), { 
                supportLink: 'https://t.me/easyearning_support', 
                systemBalance: 0,
                vipLevels: VIP_LEVELS 
             });
             for(let n of initialNotices) { await setDoc(doc(db, 'notices', n.id), n); }
             for(let p of initialProducts) { await setDoc(doc(db, 'products', p.id), p); }
             await setDoc(doc(db, 'paymentMethods', '1'), { name: 'Binance', network: 'TRC20', address: 'TBinanceAddress123456789' });
          }
       });
    }
  },

  // Users
  getUserByUsername: (username: string) => {
    return store.getState().users.find(u => u.username === username);
  },

  updateUser: async (id: string, updates: Partial<User>) => {
    // Optimistic Update
    const state = store.getState();
    updateLocalState({ users: state.users.map(u => u.id === id ? { ...u, ...updates } : u) });
    try {
      await setDoc(doc(db, 'users', id), updates, { merge: true });
    } catch (e) { console.error("Error updating user", e); }
  },

  addUser: (user: any) => {
     return user;
  },

  // Transactions
  addTransaction: async (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newTx: Transaction = { ...tx, id, timestamp: Date.now() };
    const state = store.getState();
    updateLocalState({ transactions: [newTx, ...state.transactions] });
    try {
      await setDoc(doc(db, 'transactions', id), newTx);
      return newTx;
    } catch (e) { console.error("Error adding transaction", e); return newTx; }
  },
  
  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const state = store.getState();
    updateLocalState({ transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t) });
    try {
      await setDoc(doc(db, 'transactions', id), updates, { merge: true });
    } catch(e) { console.error("Error updating transaction", e); }
  },

  // Products
  addProduct: async (product: Omit<Product, 'id'>) => {
    const id = generateId();
    const newProduct = { ...product, id };
    const state = store.getState();
    updateLocalState({ products: [...state.products, newProduct] });
    try {
      await setDoc(doc(db, 'products', id), newProduct);
      return newProduct;
    } catch (e) { console.error("Error adding product", e); return newProduct; }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const state = store.getState();
    updateLocalState({ products: state.products.map(p => p.id === id ? { ...p, ...updates } : p) });
    try {
      await setDoc(doc(db, 'products', id), updates, { merge: true });
    } catch (e) { console.error("Error updating product", e); }
  },

  deleteProduct: async (id: string) => {
    const state = store.getState();
    updateLocalState({ products: state.products.filter(p => p.id !== id) });
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) { console.error("Error deleting product", e); }
  },

  // Orders
  addOrder: async (order: Omit<Order, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newOrder: Order = { ...order, id, timestamp: Date.now() };
    const state = store.getState();
    updateLocalState({ orders: [newOrder, ...state.orders] });
    try {
      await setDoc(doc(db, 'orders', id), newOrder);
      return newOrder;
    } catch (e) { console.error("Error adding order", e); return newOrder; }
  },

  // Stakes
  addStake: async (stake: any) => {
    const id = generateId();
    const newStake = { ...stake, id };
    const state = store.getState();
    updateLocalState({ stakes: [newStake, ...(state.stakes || [])] });
    try {
      await setDoc(doc(db, 'stakes', id), newStake);
      return newStake;
    } catch(e) { console.error("Error adding stake", e); return newStake; }
  },

  updateStake: async (id: string, updates: any) => {
    const state = store.getState();
    updateLocalState({ stakes: (state.stakes || []).map(s => s.id === id ? { ...s, ...updates } : s) });
    try {
      await setDoc(doc(db, 'stakes', id), updates, { merge: true });
    } catch (e) { console.error("Error updating stake", e); }
  },

  deleteStake: async (id: string) => {
    const state = store.getState();
    updateLocalState({ stakes: (state.stakes || []).filter(s => s.id !== id) });
    try {
      await deleteDoc(doc(db, 'stakes', id));
    } catch (e) { console.error("Error deleting stake", e); }
  },

  // System
  updateSystemSettings: async (settings: Partial<AppState>) => {
    const state = store.getState();
    updateLocalState({ ...state, ...settings });
    try {
      const { supportLink, systemBalance } = settings;
      const updates: any = {};
      if (supportLink !== undefined) updates.supportLink = supportLink;
      if (systemBalance !== undefined) updates.systemBalance = systemBalance;
      await setDoc(doc(db, 'config', 'system'), updates, { merge: true });
    } catch (e) { console.error("Error updating config", e); }
  },

  updateVipLevel: async (level: number, updates: Partial<VIPLevel>) => {
    const state = store.getState();
    const vipLevels = state.vipLevels?.map(v => v.level === level ? { ...v, ...updates } : v) || VIP_LEVELS;
    updateLocalState({ vipLevels });
    try {
      await setDoc(doc(db, 'config', 'system'), { vipLevels }, { merge: true });
    } catch (e) { console.error("Error updating VIP", e); }
  },

  // Notices
  addNotice: async (text: string) => {
    const id = generateId();
    const newNotice = { id, text, isActive: true, timestamp: Date.now() };
    const state = store.getState();
    updateLocalState({ notices: [newNotice, ...state.notices] });
    try {
      await setDoc(doc(db, 'notices', id), newNotice);
    } catch (e) { console.error("Error adding notice", e); }
  },

  updateNotice: async (id: string, updates: Partial<Notice>) => {
    const state = store.getState();
    updateLocalState({ notices: state.notices.map(n => n.id === id ? { ...n, ...updates } : n) });
    try {
      await setDoc(doc(db, 'notices', id), updates, { merge: true });
    } catch (e) { console.error("Error updating notice", e); }
  },

  deleteNotice: async (id: string) => {
    const state = store.getState();
    updateLocalState({ notices: state.notices.filter(n => n.id !== id) });
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (e) { console.error("Error deleting notice", e); }
  },

  // Payment Methods
  addPaymentMethod: async (method: Omit<PaymentMethod, 'id'>) => {
    const id = generateId();
    const newMethod = { ...method, id };
    const state = store.getState();
    updateLocalState({ paymentMethods: [...(state.paymentMethods || []), newMethod] });
    try {
      await setDoc(doc(db, 'paymentMethods', id), newMethod);
      return newMethod;
    } catch (e) { console.error("Error adding payment method", e); return newMethod; }
  },

  updatePaymentMethod: async (id: string, updates: Partial<PaymentMethod>) => {
    const state = store.getState();
    updateLocalState({ paymentMethods: (state.paymentMethods || []).map(m => m.id === id ? { ...m, ...updates } : m) });
    try {
      await setDoc(doc(db, 'paymentMethods', id), updates, { merge: true });
    } catch (e) { console.error("Error updating payment method", e); }
  },

  deletePaymentMethod: async (id: string) => {
    const state = store.getState();
    updateLocalState({ paymentMethods: (state.paymentMethods || []).filter(m => m.id !== id) });
    try {
      await deleteDoc(doc(db, 'paymentMethods', id));
    } catch (e) { console.error("Error deleting payment method", e); }
  }
};
