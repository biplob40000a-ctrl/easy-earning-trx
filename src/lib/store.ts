import { AppState, Notice, Transaction, User, VIPLevel, Product, Order } from '../types';
import { generateId } from './utils';

const STORE_KEY = 'easy_earning_trx_db';

const initialNotices: Notice[] = [
  { id: '1', text: 'Welcome to Easy Earning TRX! Join our Telegram for daily signals.', isActive: true, timestamp: Date.now() },
  { id: '2', text: 'VIP 3 upgrade now gives 10% extra daily bonus until the end of the month!', isActive: true, timestamp: Date.now() },
];

const initialProducts: Product[] = [
  { id: '1', name: 'Premium Running Shoes', hash: 'Size 42', price: 150, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '2', name: 'Classic Denim Pants', hash: 'Size 32', price: 85, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '3', name: 'Urban Sneakers', hash: 'Size 43', price: 120, img: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '4', name: 'Cargo Pants Black', hash: 'Size 34', price: 95, img: 'https://images.unsplash.com/photo-1624378439575-d10c5513fd6c?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '5', name: 'Sport Joggers', hash: 'Size M', price: 65, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '6', name: 'Leather Boots', hash: 'Size 44', price: 210, img: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=300&h=300' },
];

export const VIP_LEVELS: VIPLevel[] = [
  { level: 0, name: 'Free User', price: 0, dailyIncome: 0.5, validityDays: 365, maxTasks: 1 },
  { level: 1, name: 'VIP 1', price: 100, dailyIncome: 5, validityDays: 365, maxTasks: 5 },
  { level: 2, name: 'VIP 2', price: 300, dailyIncome: 18, validityDays: 365, maxTasks: 10 },
  { level: 3, name: 'VIP 3', price: 1000, dailyIncome: 65, validityDays: 365, maxTasks: 15 },
  { level: 4, name: 'VIP 4', price: 3000, dailyIncome: 210, validityDays: 365, maxTasks: 20 },
  { level: 5, name: 'VIP 5', price: 10000, dailyIncome: 800, validityDays: 365, maxTasks: 30 },
];

const initialPaymentMethods: PaymentMethod[] = [
  { id: '1', name: 'Binance', network: 'TRC20', address: 'TBinanceAddress123456789' },
  { id: '2', name: 'Bybit', network: 'TRC20', address: 'TBybitAddress987654321' },
  { id: '3', name: 'Trust Wallet', network: 'TRC20', address: 'TTrustWalletAddress456xyz' }
];

const defaultState: AppState = {
  users: [
    {
      id: 'admin_1',
      username: 'biplob122',
      password: '122', // As requested
      phone: '0000000000',
      role: 'admin',
      balance: 999999,
      totalEarnings: 999999,
      vipLevel: 5,
      trc20Address: 'TAdminAddress123',
      referrerId: null,
      createdAt: Date.now(),
      lastMiningDate: null,
      isBlocked: false,
    }
  ],
  transactions: [],
  notices: initialNotices,
  systemBalance: 0,
  products: initialProducts,
  orders: [],
  supportLink: 'https://t.me/easyearning_support',
  vipLevels: VIP_LEVELS,
  paymentMethods: initialPaymentMethods,
};

export const store = {
  getState: (): AppState => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        if (!parsedState.products || (parsedState.products.length > 0 && parsedState.products[0].name === 'Antminer S19 Pro')) {
          parsedState.products = initialProducts;
          localStorage.setItem(STORE_KEY, JSON.stringify(parsedState));
        }
        if (!parsedState.orders) parsedState.orders = [];
        if (!parsedState.supportLink) parsedState.supportLink = 'https://t.me/easyearning_support';
        if (!parsedState.vipLevels) parsedState.vipLevels = VIP_LEVELS;
        if (!parsedState.paymentMethods) parsedState.paymentMethods = initialPaymentMethods;
        
        // Force update admin credentials if they have stale local storage
        const admin = parsedState.users.find((u: any) => u.role === 'admin');
        if (admin && (admin.username !== 'biplob122' || admin.password !== '122')) {
          admin.username = 'biplob122';
          admin.password = '122';
          localStorage.setItem(STORE_KEY, JSON.stringify(parsedState));
        }

        return parsedState;
      }
    } catch (e) {
      console.error('Error reading store', e);
    }
    // Initialize if empty
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultState));
    return defaultState;
  },

  setState: (newState: Partial<AppState>) => {
    const current = store.getState();
    const updated = { ...current, ...newState };
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
  },

  // User methods
  getUserByUsername: (username: string) => {
    return store.getState().users.find(u => u.username === username);
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const state = store.getState();
    const users = state.users.map(u => u.id === id ? { ...u, ...updates } : u);
    store.setState({ users });
  },

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastMiningDate' | 'totalEarnings' | 'balance' | 'vipLevel'>) => {
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: Date.now(),
      lastMiningDate: null,
      totalEarnings: 0,
      balance: 10, // Sign up bonus
      vipLevel: 0,
    };
    const state = store.getState();
    store.setState({ users: [...state.users, newUser] });
    return newUser;
  },

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: generateId(),
      timestamp: Date.now(),
    };
    const state = store.getState();
    store.setState({ transactions: [newTx, ...state.transactions] });
    return newTx;
  },
  
  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    const state = store.getState();
    const transactions = state.transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    store.setState({ transactions });
  },

  // Products
  addProduct: (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: generateId() };
    const state = store.getState();
    store.setState({ products: [...state.products, newProduct] });
    return newProduct;
  },

  updateProduct: (id: string, updates: Partial<Product>) => {
    const state = store.getState();
    const products = state.products.map(p => p.id === id ? { ...p, ...updates } : p);
    store.setState({ products });
  },

  deleteProduct: (id: string) => {
    const state = store.getState();
    store.setState({ products: state.products.filter(p => p.id !== id) });
  },

  // Orders
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      timestamp: Date.now(),
    };
    const state = store.getState();
    store.setState({ orders: [newOrder, ...state.orders] });
    return newOrder;
  },

  updateSystemSettings: (settings: Partial<AppState>) => {
    const state = store.getState();
    store.setState({ ...state, ...settings });
  },

  updateVipLevel: (level: number, updates: Partial<VIPLevel>) => {
    const state = store.getState();
    const vipLevels = state.vipLevels?.map(v => v.level === level ? { ...v, ...updates } : v) || VIP_LEVELS;
    store.setState({ vipLevels });
  },

  // Notices
  addNotice: (text: string) => {
    const state = store.getState();
    const newNotice = { id: generateId(), text, isActive: true, timestamp: Date.now() };
    store.setState({ notices: [newNotice, ...state.notices] });
  },

  updateNotice: (id: string, updates: Partial<Notice>) => {
    const state = store.getState();
    const notices = state.notices.map(n => n.id === id ? { ...n, ...updates } : n);
    store.setState({ notices });
  },

  deleteNotice: (id: string) => {
    const state = store.getState();
    store.setState({ notices: state.notices.filter(n => n.id !== id) });
  },

  // Payment Methods
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod = { ...method, id: generateId() };
    const state = store.getState();
    store.setState({ paymentMethods: [...(state.paymentMethods || []), newMethod] });
    return newMethod;
  },

  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => {
    const state = store.getState();
    const paymentMethods = (state.paymentMethods || []).map(m => m.id === id ? { ...m, ...updates } : m);
    store.setState({ paymentMethods });
  },

  deletePaymentMethod: (id: string) => {
    const state = store.getState();
    store.setState({ paymentMethods: (state.paymentMethods || []).filter(m => m.id !== id) });
  }
};
