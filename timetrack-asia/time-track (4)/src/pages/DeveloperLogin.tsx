import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';

export default function DeveloperLogin() {
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

      if (data.user.email !== 'nithyananthanimalan@gmail.com') {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Unrecognized Root Identity');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      showNotification('Root access established.', 'success');
      navigate('/');
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05000a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Purple Dev Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[180px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-purple-950/10 border-2 border-purple-500/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-600/40 border border-purple-400/20">
              <Terminal size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter text-white text-center">
              Root <span className="text-purple-500 underline decoration-purple-500/30">Developer</span>
            </h1>
            <p className="text-purple-400/60 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Level 0 System Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-purple-400/40 ml-1">Developer ID</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500/20 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input
                  required
                  type="email"
                  placeholder="root@timetrack.asia"
                  className="w-full bg-purple-950/20 border-2 border-purple-500/5 rounded-xl py-4 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all text-base font-bold text-white placeholder:text-purple-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-purple-400/40 ml-1">Universal Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500/20 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-purple-950/20 border-2 border-purple-500/5 rounded-xl py-4 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all text-base font-bold text-white placeholder:text-purple-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-base shadow-xl shadow-purple-900/40 hover:bg-purple-500 hover:shadow-purple-600/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group border border-purple-400/30"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Establish Root Connection
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-purple-500/10 text-center">
             <div className="flex items-center justify-center gap-2 mb-4">
               <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/30">Status: Superuser Detected</p>
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-purple-900">
               Direct database access enabled. Monitor all system nodes.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
