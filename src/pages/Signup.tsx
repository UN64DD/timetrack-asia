import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, Loader2, Users, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';

export default function Signup() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'athlete' | 'organizer'>('athlete');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    secretCode: ''
  });
  
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'organizer' && formData.secretCode !== 'TIMETRACK2026') {
      showNotification('INVALID ACCESS CODE', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role
          },
        },
      });

      if (error) throw error;

      showNotification('Enrolled Successfully! Please check your email.', 'success');
      navigate('/login');
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 pt-32 pb-20 overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-[#0a0a0a] border-2 border-white/5 p-8 md:p-16 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-brand/20">
              <Shield size={40} className="text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic">
              Platform <span className="text-brand">Enrollment</span>
            </h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">Initialize your secure profile</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-12">
             <button 
               type="button"
               onClick={() => setRole('athlete')}
               className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'athlete' ? 'bg-brand/10 border-brand text-brand' : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'}`}
             >
                <Users size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Athlete</span>
             </button>
             <button 
               type="button"
               onClick={() => setRole('organizer')}
               className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'organizer' ? 'bg-brand/10 border-brand text-brand' : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'}`}
             >
                <Briefcase size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Organizer</span>
             </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" size={16} />
                  <input 
                    required 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-brand/30 transition-all font-bold text-sm" 
                    value={formData.fullName} 
                    onChange={(e) => handleInputChange('fullName', e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" size={16} />
                  <input 
                    required 
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-brand/30 transition-all font-bold text-sm" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" size={16} />
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-brand/30 transition-all font-bold text-sm" 
                    value={formData.password} 
                    onChange={(e) => handleInputChange('password', e.target.value)} 
                  />
                </div>
              </div>

              {role === 'organizer' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand ml-2">Access Code</label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-brand/40 group-focus-within:text-brand transition-colors" size={16} />
                    <input 
                      required 
                      type="password" 
                      placeholder="DEMO CODE"
                      className="w-full bg-brand/5 border border-brand/20 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-brand/50 transition-all font-black text-xs uppercase tracking-widest placeholder:text-brand/20" 
                      value={formData.secretCode} 
                      onChange={(e) => handleInputChange('secretCode', e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-brand hover:bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl shadow-brand/20 transition-all disabled:opacity-50 group"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Complete Enrollment <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
             <p className="text-white/20 text-[9px] font-black uppercase tracking-widest leading-relaxed">
               By enrolling, you accept the terms of <span className="text-brand/40">Time Track Protocol</span>.
             </p>
             <button onClick={() => navigate('/login')} className="mt-6 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-brand transition-colors">
               Already have a profile? <span className="underline underline-offset-4">Sign In</span>
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

