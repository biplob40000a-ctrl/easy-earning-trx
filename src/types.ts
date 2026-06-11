export type Role = 'user' | 'admin';

export interface User {
  id: string; // Will align with Firebase UID
  email: string;
  username: string;
  phone: string;
  role: Role;
  balance: number;
  totalEarnings: number;
  vipLevel: number;
  trc20Address: string;
  referrerId: string | null;
  createdAt: number;
  lastMiningDate: number | null;
  isBlocked?: boolean;
  password?: string;
}

export interface VIPLevel {
  level: number;
  name: string;
  price: number;
  dailyIncome: number;
  validityDays: number;
  maxTasks: number;
}

export type TransactionType = 'deposit' | 'withdraw' | 'mining' | 'reward' | 'purchase' | 'shop_order' | 'stake' | 'stake_reward';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: number;
  description?: string;
  address?: string; // For withdrawals
}

export interface StakeRecord {
  id: string;
  userId: string;
  amount: number;
  durationMonths: number;
  interestRate: number;
  expectedReturn: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed';
}

export interface Notice {
  id: string;
  text: string;
  isActive: boolean;
  timestamp: number;
}

export interface Product {
  id: string;
  name: string;
  hash: string;
  price: number;
  img: string;
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  status: 'pending' | 'shipped' | 'delivered';
  timestamp: number;
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g., 'Binance', 'Bybit', 'Trust Wallet'
  network: string; // e.g., 'TRC20'
  address: string;
}

export interface AppState {
  users: User[];
  transactions: Transaction[];
  notices: Notice[];
  systemBalance: number; // Total platform deposits
  products: Product[];
  orders: Order[];
  supportLink?: string;
  vipLevels?: VIPLevel[];
  paymentMethods?: PaymentMethod[];
  stakes?: StakeRecord[];
  stakeSettings?: { interestRate: number; minStake: number; maxStake: number };
}
