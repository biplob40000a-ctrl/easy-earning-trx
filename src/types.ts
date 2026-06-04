export type Role = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  password?: string; // Stored just for mock DB simulation
  phone: string;
  role: Role;
  balance: number;
  totalEarnings: number;
  vipLevel: number; // 0 = free, 1-5 = VIP
  trc20Address: string;
  referrerId: string | null;
  createdAt: number;
  lastMiningDate: number | null; // For tracking daily mining
  isBlocked?: boolean;
}

export interface VIPLevel {
  level: number;
  name: string;
  price: number;
  dailyIncome: number;
  validityDays: number;
  maxTasks: number;
}

export type TransactionType = 'deposit' | 'withdraw' | 'mining' | 'reward' | 'purchase' | 'shop_order';
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
}
