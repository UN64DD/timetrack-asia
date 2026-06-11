'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/use-auth';
import { useNotification } from '@/providers/notification-provider';
import { useLanguage } from '@/providers/language-provider';

export default function ProfilePage() {
  const { user, loading } = useSupabaseAuth();
  const { showNotification } = useNotification();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(user?.firstName + ' ' + user?.lastName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, first_name: fullName.split(' ')[0], last_name: fullName.split(' ').slice(1).join(' ') },
      });
      if (error) throw error;
      showNotification('Profile updated!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs font-black uppercase tracking-widest text-white/20">Please log in</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center">
              <User size={28} className="text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black uppercase tracking-tighter">
                {user.firstName || 'User'} {user.lastName || ''}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{user.email}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-8 space-y-6">
            <div>
              <label className="label-text">{t('signup.name')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">{t('login.email')}</label>
                <div className="input-field flex items-center gap-2 opacity-50">
                  <Mail size={14} className="text-white/30" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              <div>
                <label className="label-text">Role</label>
                <div className="input-field flex items-center gap-2 opacity-50">
                  <Shield size={14} className="text-brand" />
                  <span className="text-sm">{user.role}</span>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full text-sm">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>

          <div className="glass rounded-2xl p-6 mt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Account ID</p>
            <p className="text-xs font-mono text-white/20 break-all">{user.id}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
