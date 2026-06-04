import { ShoppingCart, Star, X, History as HistoryIcon, Plus, Minus, Trash } from 'lucide-react';
import { formatTRX } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { store } from '../lib/store';
import { useAuth } from '../contexts/AuthContext';
import { Product, OrderItem } from '../types';

export default function Shop() {
  const { user, refreshUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setProducts(store.getState().products);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setMsg(''); // clear previous msg
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQ = p.quantity + delta;
        return newQ > 0 ? { ...p, quantity: newQ } : p;
      }
      return p;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const handleCheckout = () => {
    if (!user) return;
    if (cartTotal > user.balance) {
      setMsg('Insufficient balance to purchase');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    if (!shippingAddress || shippingAddress.trim().length < 5) {
      setMsg('Please enter a valid shipping address');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    // Deduct balance
    store.updateUser(user.id, { balance: user.balance - cartTotal });
    
    // Add transaction
    store.addTransaction({
      userId: user.id,
      type: 'shop_order',
      amount: cartTotal,
      status: 'completed',
      description: `Shop purchase (${cart.length} items)`
    });

    // Create Order
    store.addOrder({
      userId: user.id,
      items: cart,
      total: cartTotal,
      shippingAddress: shippingAddress,
      status: 'pending'
    });

    refreshUser();
    setCart([]);
    setIsCartOpen(false);
    setShippingAddress('');
    
    setMsg('Order placed successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 pb-6 relative">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-bold">Premium Shop</h1>
          <p className="text-text-muted mt-1 text-sm">Exclusive clothing and accessories</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center border border-[var(--color-border-card)]"
          >
            <HistoryIcon size={20} />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative w-10 h-10 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center border border-[var(--color-border-card)]"
          >
            <ShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary rounded-full text-[10px] font-bold flex items-center justify-center text-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm text-center ${msg.includes('Insufficient') || msg.includes('valid') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {products.map((p, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={p.id} 
            className="glass-panel overflow-hidden rounded-3xl flex flex-col cursor-pointer hover:border-brand-primary/50 transition-colors"
            onClick={() => setSelectedProduct(p)}
          >
            <div className="aspect-square relative overflow-hidden bg-[#000]">
               <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-80 mix-blend-screen scale-110" />
               <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-brand-gold flex items-center gap-1 border border-brand-gold/20">
                 <Star size={10} fill="currentColor" /> Premium
               </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-sm line-clamp-1">{p.name}</h3>
              <div className="text-xs text-text-muted mb-2">{p.hash}</div>
              <div className="mt-auto flex items-end justify-between">
                 <div className="font-bold text-brand-primary">{formatTRX(p.price)}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-xl text-xs transition-colors border border-white/10"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {/* Product Details Modal */}
        {selectedProduct && (
          <Modal onClose={() => setSelectedProduct(null)} title="Product Details">
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
                <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
              </div>
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <div className="flex gap-4 mb-4">
                <div className="bg-[var(--color-bg-base)] px-3 py-1 rounded-lg text-sm text-text-muted border border-[var(--color-border-card)]">Details: <span className="text-white">{selectedProduct.hash}</span></div>
                <div className="bg-[var(--color-bg-base)] px-3 py-1 rounded-lg text-sm text-brand-gold font-bold border border-brand-gold/20">{formatTRX(selectedProduct.price)}</div>
              </div>
              <p className="text-text-muted text-sm">
                Premium high-quality {selectedProduct.name} made with durable materials. Perfect for daily wear and ultimate comfort.
              </p>
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full py-3.5 bg-brand-primary font-bold rounded-xl text-white mt-4"
              >
                Add to Cart - {formatTRX(selectedProduct.price)}
              </button>
            </div>
          </Modal>
        )}

        {/* Cart Checkout Modal */}
        {isCartOpen && (
          <Modal onClose={() => setIsCartOpen(false)} title="Your Cart">
            <div className="space-y-4 h-[60vh] overflow-y-auto pr-2 flex flex-col">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-text-muted">Your cart is empty</div>
              ) : (
                <div className="space-y-4 flex-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-[var(--color-bg-base)] p-3 rounded-xl border border-[var(--color-border-card)]">
                      <img src={item.img} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.name}</div>
                        <div className="text-brand-primary text-sm">{formatTRX(item.price)}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border-card)]"><Minus size={14}/></button>
                          <span className="text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border-card)]"><Plus size={14}/></button>
                          <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-md text-red-500 bg-red-500/10 ml-auto"><Trash size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-[var(--color-border-card)] pt-4 mt-4">
                    <label className="text-sm text-text-muted mb-1 block">Shipping Address</label>
                    <textarea 
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter full shipping address..."
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 px-4 text-white text-sm min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-between items-center font-bold text-lg pt-2 mt-auto">
                    <span>Total:</span>
                    <span className="text-brand-gold">{formatTRX(cartTotal)}</span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-brand-primary to-brand-gold text-black font-bold rounded-xl"
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Order History Modal */}
        {isHistoryOpen && (
          <Modal onClose={() => setIsHistoryOpen(false)} title="Order History">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const myOrders = store.getState().orders.filter(o => o.userId === user?.id).sort((a,b) => b.timestamp - a.timestamp);
                if (myOrders.length === 0) return <div className="text-center py-10 text-text-muted">No orders placed yet</div>;
                
                return myOrders.map(order => (
                  <div key={order.id} className="bg-[var(--color-bg-base)] border border-[var(--color-border-card)] p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Order ID: {order.id.slice(0,8).toUpperCase()}</span>
                      <span className="text-text-muted">{new Date(order.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div>
                      {order.items.map(item => (
                        <div key={item.id} className="text-sm flex justify-between py-1">
                          <span>{item.quantity}x {item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-[var(--color-border-card)] pt-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-md uppercase font-bold
                        ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                        ${order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' : ''}
                        ${order.status === 'delivered' ? 'bg-green-500/20 text-green-500' : ''}
                      `}>
                        {order.status}
                      </span>
                      <span className="font-bold text-brand-gold">{formatTRX(order.total)}</span>
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
