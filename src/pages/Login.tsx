import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useNotification } from '../lib/NotificationContext';

export default function Login() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      showNotification('Success! Welcome back.', 'success');
      
      // Redirect based on role
      const role = user.role.toLowerCase();
      if (role === 'admin' || role === 'super_admin') {
        navigate('/'); // App.tsx handles subdomain routing
      } else {
        navigate('/events');
      }
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-[#0a0a0a] border-2 border-white/5 p-12 md:p-16 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-brand/20">
              <Shield size={40} className="text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter text-center">
              Athlete <span className="text-brand">Login</span>
            </h1>
            <p className="text-white/70 text-sm md:text-base font-bold uppercase tracking-widest mt-4">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="label-text">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-brand transition-colors" size={24} />
                <input
                  required
                  type="email"
                  placeholder="name@email.com"
                  className="input-field pl-16 py-5 text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="label-text">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-brand transition-colors" size={24} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-16 py-5 text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn-primary w-full py-6 text-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Login Now
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-white/5 text-center">
             <p className="text-white/50 text-xs md:text-sm font-black uppercase tracking-widest">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand hover:underline underline-offset-4">
                Sign Up Here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
