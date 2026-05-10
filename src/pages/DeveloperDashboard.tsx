import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Users, Database, LogOut, Trash2, UserPlus, Ban, History, Crown, CalendarRange, Fingerprint, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';

const ROOT_EMAIL = 'nithyananthanimalan@gmail.com';

export default function DeveloperDashboard() {
  const { showNotification } = useNotification();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'db'>('users');
  const [roleFilter, setRoleFilter] = useState<'all' | 'athlete' | 'organizer' | 'admin'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>({ profiles: 0, events: 0, variants: 0, logs: 0, storage: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Staged changes state
  const [stagedRoles, setStagedRoles] = useState<Record<string, string>>({});
  const [stagedLimits, setStagedLimits] = useState<Record<string, number>>({});

  const [isGenesisModalOpen, setIsGenesisModalOpen] = useState(false);
  const [genesisForm, setGenesisForm] = useState({ email: '', full_name: '', role: 'athlete', password: '', event_limit: 5 });

  useEffect(() => {
    checkUser();
    fetchUsers();
    fetchLogs();
    fetchDbStats();
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserEmail(user?.email || null);
    } catch (e) { }
  };

  const isRoot = currentUserEmail === ROOT_EMAIL;

  const createAuditLog = async (action: string, targetEmail: string, details: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({ actor_id: user?.id, action, target_email: targetEmail, details });
      fetchLogs();
    } catch (err) { }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) console.warn('Query error:', error.message);
    setUsers(data || []);
    setLoading(false);
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    setLogs(data || []);
  };

  const fetchDbStats = async () => {
    try {
      const [{ count: p }, { count: e }, { count: v }, { count: l }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('event_variants').select('*', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      ]);
      const { data: storageData } = await supabase.storage.from('banners').list();
      setDbStats({ profiles: p || 0, events: e || 0, variants: v || 0, logs: l || 0, storage: storageData?.length || 0 });
    } catch (err) { }
  };

  const stageRole = (userId: string, newRole: string, targetEmail: string) => {
    if (!isRoot) return showNotification('ROOT AUTHORITY REQUIRED', 'error');
    if (targetEmail === ROOT_EMAIL) return showNotification('ROOT IMMUTABLE', 'error');
    setStagedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const stageLimit = (userId: string, limit: number) => {
    if (!isRoot) return showNotification('ROOT AUTHORITY REQUIRED', 'error');
    setStagedLimits(prev => ({ ...prev, [userId]: limit }));
  };

  const saveIdentityChanges = async (userId: string, userEmail: string) => {
    if (!isRoot) return showNotification('ROOT AUTHORITY REQUIRED', 'error');
    if (userEmail === ROOT_EMAIL) return showNotification('ROOT IMMUTABLE', 'error');
    
    const newRole = stagedRoles[userId];
    const newLimit = stagedLimits[userId];
    
    if (!newRole && newLimit === undefined) return;

    showNotification(`Finalizing Identity...`, 'info');
    const updateData: any = { status: 'active' };
    if (newRole) updateData.role = newRole;
    if (newLimit !== undefined) updateData.event_limit = newLimit;

    const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
    
    if (error) {
      showNotification(`DB Error: ${error.message}`, 'error');
    } else {
      showNotification(`Identity Optimized.`, 'success');
      await createAuditLog('IDENTITY_OPTIMIZE', userEmail, `Role: ${newRole || 'NO_CHANGE'} | Quota: ${newLimit || 'NO_CHANGE'}`);
      
      const nextRoles = { ...stagedRoles }; delete nextRoles[userId]; setStagedRoles(nextRoles);
      const nextLimits = { ...stagedLimits }; delete nextLimits[userId]; setStagedLimits(nextLimits);
      fetchUsers();
    }
  };

  const toggleBanStatus = async (userId: string, userEmail: string, currentStatus: string) => {
    if (!isRoot) return showNotification('ROOT AUTHORITY REQUIRED', 'error');
    if (userEmail === ROOT_EMAIL) return showNotification('ROOT IMMORTAL', 'error');
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (error) showNotification(error.message, 'error');
    else {
      showNotification(`Status: ${newStatus.toUpperCase()}`, 'success');
      createAuditLog(newStatus === 'banned' ? 'BAN' : 'UNBAN', userEmail, `Changed to ${newStatus}`);
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!isRoot) return showNotification('ROOT AUTHORITY REQUIRED', 'error');
    if (userEmail === ROOT_EMAIL) return showNotification('ROOT PROTECTION ACTIVE', 'error');
    if (!confirm('EXTERMINATE?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) showNotification(error.message, 'error');
    else {
      showNotification('Purged.', 'success');
      createAuditLog('PURGE', userEmail, 'Removed');
      fetchUsers();
    }
  };

  const handleGenesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRoot) return showNotification('ROOT AUTHORITY REQUIRED', 'error');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: genesisForm.email,
        password: genesisForm.password,
        options: {
          data: {
            full_name: genesisForm.full_name,
            role: genesisForm.role,
            event_limit: genesisForm.event_limit
          }
        }
      });
      if (error) throw error;
      showNotification('IDENTITY GENESIS SUCCESSFUL', 'success');
      setIsGenesisModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showNotification('GENESIS FAILED: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!isDesktop) return <div className="min-h-screen bg-[#05000a] text-white flex items-center justify-center">Desktop Required</div>;

  return (
    <div className="min-h-screen bg-[#05000a] text-white flex selection:bg-purple-600 selection:text-white overflow-hidden">
      {/* High-Density Sidebar */}
      <aside className="w-64 bg-purple-950/10 border-r border-purple-500/10 flex flex-col p-6 shrink-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20"><Terminal size={18} className="text-white" /></div>
          <div><h2 className="font-display font-black uppercase tracking-tighter text-base leading-none">ROOT</h2><p className="text-purple-500/40 text-[8px] font-bold uppercase tracking-widest mt-0.5">Ultra Authority</p></div>
        </div>
        
        <div className={`mb-6 p-4 rounded-xl border transition-all ${isRoot ? 'bg-purple-600/10 border-purple-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-2"><Fingerprint size={14} className={isRoot ? 'text-purple-500' : 'text-red-500'} /><span className="text-[9px] font-black uppercase tracking-widest">Node ID</span></div>
          <p className="text-[10px] font-bold truncate text-white/60 mb-1">{currentUserEmail || 'UNIDENTIFIED'}</p>
          <p className={`text-[7px] font-black uppercase tracking-widest ${isRoot ? 'text-purple-500' : 'text-red-500 animate-pulse'}`}>{isRoot ? '✓ Root Verified' : '⚠ Access Restricted'}</p>
        </div>

        <nav className="flex-1 space-y-1">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 translate-x-1' : 'text-purple-500/40 hover:bg-white/5 hover:text-white'}`}><Users size={16} /> User Control</button>
          <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 translate-x-1' : 'text-purple-500/40 hover:bg-white/5 hover:text-white'}`}><History size={16} /> Audit Ledger</button>
          <button onClick={() => setActiveTab('db')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'db' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 translate-x-1' : 'text-purple-500/40 hover:bg-white/5 hover:text-white'}`}><Database size={16} /> DB Monitor</button>
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-purple-900 hover:text-red-500 transition-colors text-[9px] font-black uppercase tracking-widest border-t border-white/5 pt-6"><LogOut size={16} /> Abort</button>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#05000a]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Secure Root Node: Active</span>
          </div>
          <span className="text-[8px] font-black uppercase bg-purple-600/10 border border-purple-500/20 px-3 py-1 rounded-full text-purple-500">Master access</span>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {activeTab === 'users' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div><h1 className="text-4xl font-display font-black uppercase tracking-tighter italic">Global <span className="text-purple-600 text-5xl">Operatives</span></h1><p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Identity Management & Quota Control</p></div>
                <button disabled={!isRoot} onClick={() => setIsGenesisModalOpen(true)} className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-xl transition-all ${isRoot ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-white/5 text-white/10 grayscale cursor-not-allowed'}`}><UserPlus size={16} /> Identity Genesis</button>
              </div>

              <div className="flex gap-2">
                {['all', 'athlete', 'organizer', 'admin'].map(r => (
                  <button key={r} onClick={() => setRoleFilter(r as any)} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${roleFilter === r ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white/5 border-white/5 text-white/30'}`}>{r}</button>
                ))}
              </div>

              <div className="bg-purple-950/5 border border-purple-500/10 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-purple-600/5 border-b border-purple-500/10"><th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-purple-500/60">Identity</th><th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-purple-500/60">Quota</th><th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-purple-500/60 text-right">Protocol</th></tr></thead>
                  <tbody className="divide-y divide-purple-500/5">
                    {filteredUsers.map((u) => {
                      const stagedRole = stagedRoles[u.id];
                      const stagedLimit = stagedLimits[u.id];
                      const activeRole = stagedRole || u.role;
                      const activeLimit = stagedLimit !== undefined ? stagedLimit : u.event_limit;
                      const hasChanges = !!stagedRole || stagedLimit !== undefined;
                      const isTargetRoot = u.email === ROOT_EMAIL;

                      return (
                        <tr key={u.id} className={`hover:bg-purple-600/[0.02] transition-colors ${u.status === 'banned' ? 'opacity-50 grayscale' : ''}`}>
                          <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isTargetRoot ? 'bg-purple-600 text-white' : 'bg-purple-600/20 text-purple-500'}`}>{isTargetRoot ? <Crown size={14} /> : u.full_name?.charAt(0)}</div><div><div className="flex items-center gap-2"><p className="font-bold text-xs tracking-tight">{u.full_name}</p>{isTargetRoot && <span className="bg-purple-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full">Root</span>}</div><p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{u.email}</p></div></div></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <CalendarRange size={12} className="text-purple-500/40" />
                              <input 
                                disabled={!isRoot || isTargetRoot}
                                type="number" 
                                value={activeLimit || 0} 
                                onChange={(e) => stageLimit(u.id, parseInt(e.target.value))}
                                className={`bg-purple-950/20 border border-purple-500/10 rounded-lg py-1 px-2 w-12 text-[9px] font-black outline-none focus:border-purple-500 ${stagedLimit !== undefined ? 'border-purple-400 text-purple-400 ring-1 ring-purple-400' : 'text-white/40'}`}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <div className="flex gap-1">{['athlete', 'organizer', 'admin'].map(role => (<button key={role} disabled={!isRoot || isTargetRoot} onClick={() => stageRole(u.id, role, u.email)} className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${activeRole === role ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-white/20'} ${(isTargetRoot || !isRoot) && 'opacity-50 cursor-not-allowed'}`}>{role}</button>))}</div>
                              <div className="flex items-center gap-2">
                                <AnimatePresence>{hasChanges && (<motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={() => saveIdentityChanges(u.id, u.email)} className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-lg shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all"><Save size={14} /></motion.button>)}</AnimatePresence>
                                <button onClick={() => toggleBanStatus(u.id, u.email, u.status)} disabled={!isRoot || isTargetRoot} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${u.status === 'banned' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} ${(isTargetRoot || !isRoot) && 'opacity-20 cursor-not-allowed'}`}><Ban size={14} /></button>
                                <button onClick={() => deleteUser(u.id, u.email)} disabled={!isRoot || isTargetRoot} className={`w-8 h-8 flex items-center justify-center bg-white/5 text-white/20 rounded-lg transition-all ${(isTargetRoot || !isRoot) && 'opacity-20 cursor-not-allowed'}`}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <div className="bg-purple-950/5 border border-purple-500/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <header className="p-10 pb-6"><h1 className="text-4xl font-display font-black uppercase tracking-tighter italic">Audit <span className="text-purple-600 text-5xl">Ledger</span></h1></header>
              <table className="w-full text-left">
                <thead><tr className="bg-purple-600/5 border-b border-purple-500/10"><th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-purple-500/60">Timestamp</th><th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-purple-500/60">Action</th><th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-purple-500/60">Target</th><th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-purple-500/60">Event Details</th></tr></thead>
                <tbody className="divide-y divide-purple-500/5 font-mono">{logs.map((log) => (<tr key={log.id} className="hover:bg-purple-600/[0.02] transition-colors"><td className="px-8 py-4 text-[9px] text-white/30">{new Date(log.created_at).toLocaleString()}</td><td className="px-8 py-4"><span className="px-2 py-1 rounded-full text-[8px] font-black bg-purple-500/10 text-purple-500">{log.action}</span></td><td className="px-8 py-4 text-[9px] font-bold text-white/60">{log.target_email}</td><td className="px-8 py-4 text-[9px] text-white/40 uppercase tracking-tighter">{log.details}</td></tr>))}</tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">{[{ label: 'Operatives', value: dbStats.profiles }, { label: 'Events', value: dbStats.events }, { label: 'Variants', value: dbStats.variants }, { label: 'Audit Logs', value: dbStats.logs }].map((s, i) => (<div key={i} className="bg-purple-950/10 border border-purple-500/10 rounded-2xl p-6"><h3 className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">{s.label}</h3><p className="text-3xl font-display font-black">{s.value}</p></div>))}</div>
          )}
        </div>
      </main>

      <AnimatePresence>{isGenesisModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-6"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGenesisModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-purple-500/20 rounded-[3rem] p-10 shadow-2xl"><h3 className="text-2xl font-display font-black uppercase tracking-tighter italic mb-8">Identity <span className="text-purple-500">Genesis</span></h3><form onSubmit={handleGenesis} className="space-y-4"><input required type="text" placeholder="FULL NAME" className="w-full bg-purple-950/10 border border-purple-500/10 rounded-xl py-3 px-5 outline-none focus:border-purple-500/50 transition-all text-xs font-bold text-white uppercase" value={genesisForm.full_name} onChange={(e) => setGenesisForm({...genesisForm, full_name: e.target.value})} /><input required type="email" placeholder="EMAIL ADDRESS" className="w-full bg-purple-950/10 border border-purple-500/10 rounded-xl py-3 px-5 outline-none focus:border-purple-500/50 transition-all text-xs font-bold text-white" value={genesisForm.email} onChange={(e) => setGenesisForm({...genesisForm, email: e.target.value})} /><input required type="password" placeholder="PASSWORD" className="w-full bg-purple-950/10 border border-purple-500/10 rounded-xl py-3 px-5 outline-none focus:border-purple-500/50 transition-all text-xs font-bold text-white" value={genesisForm.password} onChange={(e) => setGenesisForm({...genesisForm, password: e.target.value})} /><div className="flex items-center gap-4 bg-purple-950/10 border border-purple-500/10 rounded-xl px-5 py-3"><CalendarRange size={16} className="text-purple-500" /><input type="number" placeholder="EVENT QUOTA" className="flex-1 bg-transparent outline-none text-xs font-bold text-white" value={genesisForm.event_limit} onChange={(e) => setGenesisForm({...genesisForm, event_limit: parseInt(e.target.value)})} /></div><div className="flex gap-1.5">{['athlete', 'organizer', 'admin'].map(r => (<button key={r} type="button" onClick={() => setGenesisForm({...genesisForm, role: r})} className={`flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${genesisForm.role === r ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-white/20'}`}>{r}</button>))}</div><button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-purple-600/30 hover:bg-purple-500 transition-all mt-4">Generate Identity</button></form></motion.div></div>)}</AnimatePresence>
    </div>
  );
}
