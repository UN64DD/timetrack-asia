import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'athlete' | 'organizer' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [denied, setDenied] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [requiredRole]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch profile with proper typing for the role enum
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name, status')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      const userRole = (profile?.role as string) || 'athlete';
      const userStatus = profile?.status || 'active';

      // 1. Check for Ban Status
      if (userStatus === 'banned') {
        setDenied(true);
        showNotification('This identity has been deactivated.', 'error');
        return;
      }

      // 2. Check Role Authorization
      let isAuthorized = true;
      if (requiredRole) {
        if (requiredRole === 'admin' && userRole !== 'admin') {
          isAuthorized = false;
        } else if (requiredRole === 'organizer' && (userRole !== 'organizer' && userRole !== 'admin')) {
          isAuthorized = false;
        }
      }

      if (!isAuthorized) {
        setDenied(true);
        return;
      }

      setAuthorized(true);
    } catch (err) {
      console.error('Auth check error:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-purple-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Authenticating_Identity...
        </p>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-[#0a0000] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20 text-red-500">
          <ShieldAlert size={48} className="animate-pulse" />
        </div>
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-white mb-4">Access Denied</h1>
        <p className="text-red-500/40 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mb-8">
          Your current identity does not have the required clearance level for this terminal.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20"
        >
          Re-Authenticate
        </button>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
