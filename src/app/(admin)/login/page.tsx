'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useNotification } from '@/providers/notification-provider';
import { useSupabaseAuth } from '@/hooks/use-auth';

export default function AdminLoginPage() {
  const { showNotification } = useNotification();
  const { signIn } = useSupabaseAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      showNotification('Admin access granted', 'success');
      router.push('/admin/dashboard');
    } catch (err: any) {
      showNotification(err.message || 'Access denied', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0000] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Shield size={28} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white mb-2">ADMIN ACCESS</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-red-500/50">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text text-red-500/70">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-red-500/5 border-2 border-red-500/10 rounded-2xl py-4 px-6 outline-none focus:border-red-500/50 transition-all text-base font-bold placeholder:text-red-500/20"
              placeholder="admin@timetrack.asia"
              required
            />
          </div>
          <div>
            <label className="label-text text-red-500/70">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-red-500/5 border-2 border-red-500/10 rounded-2xl py-4 px-6 outline-none focus:border-red-500/50 transition-all text-base font-bold placeholder:text-red-500/20"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-500 text-white font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
}
