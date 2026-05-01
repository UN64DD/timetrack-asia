import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';
import CrypticText from '../components/CrypticText';

export default function Profile() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData({
        fullName: data.full_name || '',
      });
    } catch (err: any) {
      showNotification('Error fetching profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      showNotification('Profile updated successfully', 'success');
      fetchProfile();
    } catch (err: any) {
      showNotification('Update failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-xl mx-auto px-6 relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-white/50 hover:text-brand transition-colors text-xs font-black uppercase tracking-widest mb-10 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Site
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border-2 border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-brand rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-brand/20">
               <User size={48} className="text-black" />
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter">
              Profile <span className="text-brand">Settings</span>
            </h1>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-4">Manage your athlete information</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-10">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                  <Mail size={12} className="text-brand" /> Email
                </p>
                <p className="text-sm font-bold text-white truncate">{profile?.email}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                  <Shield size={12} className="text-brand" /> Role
                </p>
                <p className="text-sm font-black text-brand uppercase">{profile?.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="label-text">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-brand transition-colors" size={24} />
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  className="input-field pl-16 py-5 text-lg"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={saving}
              type="submit"
              className="btn-primary w-full py-6 text-lg"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Save size={24} />
                  Save Changes
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-white/5 text-center space-y-4">
             <div className="space-y-1">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">System Identifier (UID)</p>
                <p className="text-[11px] font-mono font-bold text-brand/40 break-all select-all cursor-copy hover:text-brand transition-colors">
                  {profile?.id}
                </p>
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 leading-relaxed max-w-xs mx-auto">
               Your changes will be reflected across all upcoming events and race results.
             </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
