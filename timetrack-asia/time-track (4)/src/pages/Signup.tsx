import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';

export default function Signup() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'athlete' // Default role
          },
        },
      });

      if (error) throw error;

      // Capture IP address for the new identity
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        if (data.user) {
          await supabase.from('profiles').update({ last_ip: ip }).eq('id', data.user.id);
        }
      } catch (e) {
        console.warn('Initial IP Capture Failed:', e);
      }

      showNotification('Athlete Enrolled! Please check your email.', 'success');
      navigate('/login');
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 pt-32 pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-[#0a0a0a] border-2 border-white/5 p-10 md:p-16 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-brand/20">
              <Shield size={40} className="text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter">
              Athlete <span className="text-brand">Enrollment</span>
            </h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-4">Initialize your professional profile</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" size={20} />
                  <input 
                    required 
                    type="text" 
                    placeholder="Enter your full name"
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-brand/30 transition-all font-bold text-sm" 
                    value={formData.fullName} 
                    onChange={(e) => handleInputChange('fullName', e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" size={20} />
                  <input 
                    required 
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-brand/30 transition-all font-bold text-sm" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" size={20} />
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-brand/30 transition-all font-bold text-sm" 
                    value={formData.password} 
                    onChange={(e) => handleInputChange('password', e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-brand hover:bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl shadow-brand/20 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Complete Enrollment <ArrowRight size={24} /></>}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              By enrolling, you accept the terms of Time Track Protocol.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
