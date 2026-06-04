import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, User, Phone, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const [params] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [ref, setRef] = useState(params.get('ref') || '');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 4) {
      setError('Username must be at least 4 characters');
      return;
    }
    if (register(username, password, phone, ref)) {
      navigate('/');
    } else {
      setError('Username already exists');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-base)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 my-8"
      >
        <div className="flex flex-col items-center mb-8">
           <h1 className="text-2xl font-bold">Create Account</h1>
           <p className="text-text-muted mt-1 text-sm">Join the leading TRX earning platform</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl mb-6 text-sm text-center border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Choose username"
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="tel"
              placeholder="Mobile number"
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="password"
              placeholder="Create password"
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Referral code (optional)"
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-primary to-brand-gold text-black font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,90,0,0.3)] mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-medium hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
