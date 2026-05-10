import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, BarChart3, Users, Calendar, Settings, LogOut, 
  Activity, Loader2, Search, Crown, Edit2, Trash2, 
  Ban, Download, X, ShieldCheck 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ROOT_EMAIL = 'nithyananthanimalan@gmail.com';

// --- System Health Component ---

const SystemHealth = () => {
  const [buckets, setBuckets] = useState<{name: string, exists: boolean}[]>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
    setChecking(true);
    const required = ['banners', 'results', 'avatars'];
    const status = [];
    for (const b of required) {
      const { data, error } = await supabase.storage.getBucket(b);
      status.push({ name: b, exists: !!data && !error });
    }
    setBuckets(status);
    setChecking(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-black uppercase tracking-tight italic">Bucket <span className="text-red-600">Integrity</span></h3>
          <button onClick={checkStorage} className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Activity size={14} /></button>
       </div>
       <div className="grid grid-cols-3 gap-4">
          {buckets.map(b => (
            <div key={b.name} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{b.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${b.exists ? 'text-green-500' : 'text-red-500'}`}>{b.exists ? 'Operational' : 'Missing'}</p>
               </div>
               <div className={`w-3 h-3 rounded-full ${b.exists ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
            </div>
          ))}
          {checking && <div className="col-span-3 text-center py-4"><Loader2 className="animate-spin mx-auto text-red-600" /></div>}
       </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'payments' | 'settings'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [eventCount, setEventCount] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Running',
    banner_image: '',
    status: 'upcoming',
    price_min: 0,
    price_max: 0,
    variants: [] as any[]
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      // 1. Fetch Stats
      const statsRes = await axios.get(`${API_URL}/admin/stats`, { headers });
      setStats(statsRes.data);

      // 2. Fetch Organizers (Users tab)
      const organizersRes = await axios.get(`${API_URL}/admin/organizers`, { headers });
      setUsers(organizersRes.data);

      // 3. Fetch Events
      const eventsRes = await axios.get(`${API_URL}/events/all`, { headers });
      setEvents(eventsRes.data);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showNotification('Access Denied or Connection Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (eventId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await axios.get(`${API_URL}/admin/export/registrations`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        params: { event_id: eventId },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations_${eventId || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      showNotification('Export Failed', 'error');
    }
  };

  const toggleBanStatus = async (userId: string, userEmail: string, currentStatus: string) => {
    if (userEmail === ROOT_EMAIL) return showNotification('ROOT IMMORTAL', 'error');
    const newStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(`${API_URL}/admin/organizers/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      showNotification(`STATUS: ${newStatus}`, 'success');
      fetchDashboardData();
    } catch (err: any) {
      showNotification('Action Failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const purgeEvent = async (eventId: string) => {
    if (!confirm('PERMANENTLY EXTERMINATE EVENT?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.delete(`${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      showNotification('Event Purged.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showNotification('Purge Failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const approveEvent = async (eventId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(`${API_URL}/admin/events/${eventId}/status`, 
        { status: 'APPROVED', adminNote: 'Approved by admin' },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      showNotification('Event Approved', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showNotification('Approval Failed', 'error');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = { ...eventForm };
      let { error } = editingEvent 
        ? await supabase.from('events').update(payload).eq('id', editingEvent.id)
        : await supabase.from('events').insert([payload]);

      // --- SCHEMA FALLBACK ---
      if (error && (error.code === '42703' || error.message.includes('variants') || error.message.includes('price_max'))) {
        console.warn('SCHEMA_ALERT: Missing production columns. Executing legacy deployment fallback.');
        const fallbackPayload = { ...payload };
        delete fallbackPayload.price_min;
        delete fallbackPayload.price_max;
        delete fallbackPayload.banner_image;
        delete fallbackPayload.registration_config;
        delete fallbackPayload.variants;
        
        const { error: retryError } = editingEvent
          ? await supabase.from('events').update(fallbackPayload).eq('id', editingEvent.id)
          : await supabase.from('events').insert([fallbackPayload]);
        error = retryError;
        if (!error) showNotification('Event Registry Updated (Legacy Mode)', 'error');
      }

      if (error) throw error;
      showNotification('Event Registry Updated', 'success');
      setIsEventModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      showNotification('Sync Error: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setEventForm({ ...event });
    setIsEventModalOpen(true);
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  return (
    <div className="min-h-screen flex bg-[#050505] text-white overflow-hidden">
      <aside className="w-64 border-r border-red-500/10 bg-[#080808] flex flex-col p-6 fixed h-full z-30 shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-black uppercase tracking-tighter italic">ADMIN</h1>
        </div>
        
        <nav className="space-y-1 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
            { id: 'users', label: 'Users', icon: <Users size={20} /> },
            { id: 'events', label: 'Events', icon: <Calendar size={20} /> },
            { id: 'payments', label: 'Payments', icon: <ShieldCheck size={20} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 translate-x-1' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}>
              {item.icon} <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="flex items-center gap-3 text-white/20 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-[8px] pt-6 border-t border-white/5">
          <LogOut size={16} /> Disconnect
        </button>
      </aside>

      <main className="flex-1 ml-64 h-screen overflow-y-auto" data-lenis-prevent>
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-black/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Secure Node: Active</span>
          </div>
          <span className="text-[8px] font-black uppercase bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full text-red-500">{userProfile?.role} clearance</span>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && stats && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Live Events" value={stats.live_events} trend="Global" icon={<Calendar className="text-red-500" />} />
                  <StatCard label="Total Users" value={stats.total_users} trend="Registry" icon={<Users className="text-red-500" />} />
                  <StatCard label="Total Regs" value={stats.total_registrations} trend="Volume" icon={<Activity className="text-red-500" />} />
                  <StatCard label="Revenue" value={`RM ${stats.total_revenue}`} trend="Status" icon={<ShieldCheck className="text-red-500" />} />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Pending Approval" value={stats.pending_events} trend="Events" icon={<Calendar className="text-yellow-500" />} />
                  <StatCard label="Manual Payments" value={stats.pending_manual_payments || 0} trend="Review" icon={<ShieldCheck className="text-blue-500" />} />
                  <StatCard label="Failed Payments" value={stats.failed_payments} trend="Risk" icon={<Activity className="text-red-500" />} />
                  <StatCard label="Pending Refunds" value={stats.pending_refunds} trend="Refunds" icon={<Activity className="text-orange-500" />} />
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-display font-black uppercase tracking-tighter italic">Personnel Manifest</h2>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500" size={14} />
                    <input value={userSearchQuery} onChange={e => setUserSearchQuery(e.target.value)} placeholder="LOCATE OPERATIVE..." className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-6 text-[9px] font-black uppercase tracking-[0.2em] outline-none focus:border-red-500/50 transition-all w-72" />
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest opacity-20">
                          <th className="p-6">Operative Identity</th>
                          <th className="p-6">Clearance</th>
                          <th className="p-6">Joined</th>
                          <th className="p-6 text-right">System Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => {
                          const isTargetRoot = u.email === ROOT_EMAIL;
                          return (
                            <tr key={u.id} className={`hover:bg-white/[0.02] border-b border-white/5 transition-colors ${u.status === 'banned' ? 'opacity-30' : ''}`}>
                              <td className="p-6">
                                <div className="flex items-center gap-4">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg uppercase ${isTargetRoot ? 'bg-red-600 text-white' : 'bg-red-600/10 text-red-500'}`}>{isTargetRoot ? <Crown size={16} /> : u.full_name?.charAt(0)}</div>
                                   <div><p className="text-sm font-black uppercase tracking-tighter">{u.full_name}</p><p className="text-[8px] opacity-20 font-black uppercase tracking-widest">{u.email}</p></div>
                                 </div>
                              </td>
                              <td className="p-6">
                                 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : u.role === 'organizer' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-white/5 text-white/30 border-white/10'}`}>{u.role}</span>
                              </td>
                              <td className="p-6 text-[10px] font-mono text-white/20">{new Date(u.created_at).toLocaleDateString()}</td>
                              <td className="p-6 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => toggleBanStatus(u.id, u.email, u.status)} disabled={isTargetRoot} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${u.status === 'banned' ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'} ${isTargetRoot ? 'opacity-10 grayscale cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}>{u.status === 'banned' ? 'REINSTATE' : 'BANISH'}</button>
                                    <button onClick={() => purgeUser(u.id, u.email)} disabled={isTargetRoot} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all bg-white/5 text-white/20 ${isTargetRoot ? 'opacity-10 grayscale cursor-not-allowed' : 'hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95'}`}>PURGE</button>
                                 </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-display font-black uppercase tracking-tighter italic">Global Arsenal</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {events.map(event => (
                    <div key={event.id} className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-red-600/30 transition-all shadow-2xl flex flex-col">
                      <div className="h-40 relative overflow-hidden">
                        <img src={event.banner_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-4 left-6"><h4 className="text-lg font-display font-black uppercase tracking-tighter">{event.title}</h4></div>
                      </div>
                      <div className="p-6 flex justify-between items-center mt-auto">
                         <div className="flex gap-2">
                            <button onClick={() => openEditModal(event)} className="w-10 h-10 flex items-center justify-center bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => purgeEvent(event.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                            <button onClick={() => handleExport(event.id)} className="w-10 h-10 flex items-center justify-center bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Download size={16} /></button>
                            {event.status === 'PENDING' && (
                              <button onClick={() => approveEvent(event.id)} className="px-3 py-1.5 bg-green-600/10 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all text-[8px] font-black uppercase">Approve</button>
                            )}
                         </div>
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-1 rounded">{event.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <SystemHealth />
                <div className="space-y-6">
                   <h3 className="text-xl font-display font-black uppercase tracking-tight italic">Platform <span className="text-red-600">Controls</span></h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col justify-between h-48">
                         <div className="flex items-center gap-3 text-red-500">
                            <Ban size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Maintenance Mode</span>
                         </div>
                         <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Enable Lockout</button>
                      </div>
                      <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col justify-between h-48">
                         <div className="flex items-center gap-3 text-blue-500">
                            <Download size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Master Backup</span>
                         </div>
                         <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Dump Schema</button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Admin Event Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsEventModalOpen(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[3rem] relative z-10 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black">
                   <h3 className="text-2xl font-display font-black uppercase tracking-tighter italic">Override Event</h3>
                   <button onClick={() => setIsEventModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-red-500 transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSaveEvent} className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Title</label>
                        <input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-black uppercase outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Status</label>
                        <select value={eventForm.status} onChange={e => setEventForm({...eventForm, status: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-black uppercase outline-none">
                           <option value="upcoming">Upcoming</option>
                           <option value="live">Live</option>
                           <option value="completed">Completed</option>
                        </select>
                      </div>
                   </div>
                   <button type="submit" disabled={isSaving} className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-600/20">
                      {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Commit Overrides'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, trend, icon }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] hover:border-red-600/30 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">{icon}</div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="p-3 bg-red-600/10 rounded-xl">{icon}</div>
          <span className="text-[9px] font-black px-2 py-1 bg-red-600/10 text-red-500 rounded-md border border-red-500/20">{trend}</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">{label}</p>
        <p className="text-4xl font-display font-black uppercase tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
