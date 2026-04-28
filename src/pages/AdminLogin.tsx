import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';

export default function AdminLogin() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Administrative Clearance Required');
      }

      showNotification('Command clearance granted.', 'success');
      navigate('/');
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0000] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Red Admin Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[180px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-red-950/10 border-2 border-red-500/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-red-600/40 border border-red-400/20">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter text-white text-center">
              Admin <span className="text-red-500 underline decoration-red-500/30">Command</span>
            </h1>
            <p className="text-red-400/60 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Administrative Clearance Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-red-400/40 ml-1">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/20 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  required
                  type="email"
                  placeholder="admin@timetrack.asia"
                  className="w-full bg-red-950/20 border-2 border-red-500/5 rounded-xl py-4 pl-12 pr-6 outline-none focus:border-red-500/50 transition-all text-base font-bold text-white placeholder:text-red-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-red-400/40 ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/20 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-red-950/20 border-2 border-red-500/5 rounded-xl py-4 pl-12 pr-6 outline-none focus:border-red-500/50 transition-all text-base font-bold text-white placeholder:text-red-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-base shadow-xl shadow-red-900/40 hover:bg-red-500 hover:shadow-red-600/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group border border-red-400/30"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-red-500/10 text-center">
             <div className="flex items-center justify-center gap-2 mb-4">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/30">System Status: Protected</p>
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-red-900">
               Unauthorized access attempts are monitored and recorded.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
