import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Calendar, BarChart3, Settings, 
  LogOut, Search, Plus, Edit2, Trash2,
  CheckCircle2, Globe, TrendingUp, Activity, 
  ShieldCheck, Upload, Loader2, Save, Download,
  Image as ImageIcon, PieChart as PieChartIcon, X,
  CalendarRange, AlertTriangle, Lock, Ban, Trash,
  UserCheck, Crown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  Cell, PieChart, Pie
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';

const ROOT_EMAIL = 'nithyananthanimalan@gmail.com';

import CustomCalendar from '../components/CustomCalendar';
import CustomDropdown from '../components/CustomDropdown';

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'settings'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile & Quota Data
  const [userProfile, setUserProfile] = useState<any>(null);
  const [eventCount, setEventCount] = useState(0);
  
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Running',
    banner_image: '',
    status: 'upcoming'
  });

  const [variants, setVariants] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      setUserProfile(profile);

      // Fetch all users
      const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(userData || []);

      // Fetch events
      const eventQuery = supabase.from('events').select('*').order('date', { ascending: true });
      if (profile?.role === 'organizer') {
        eventQuery.eq('organizer_id', user?.id);
      }
      const { data: eventData } = await eventQuery;
      setEvents(eventData || []);
      setEventCount(eventData?.length || 0);

      const { data: regData } = await supabase.from('registrations').select('*, events(title)').order('created_at', { ascending: false });
      setRegistrations(regData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isQuotaReached = userProfile?.role === 'organizer' && eventCount >= (userProfile?.event_limit || 0);

  const handleUserUpdate = (userId: string, field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), [field]: value }
    }));
  };

  const saveUserProtocol = async (userId: string) => {
    const changes = pendingChanges[userId];
    if (!changes) return;
    try {
      const { error } = await supabase.from('profiles').update(changes).eq('id', userId);
      if (error) throw error;
      showNotification('Personnel data updated', 'success');
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      fetchDashboardData();
    } catch (err: any) {
      showNotification('Update Failed: ' + err.message, 'error');
    }
  };

  const toggleBanStatus = async (userId: string, userEmail: string, currentStatus: string) => {
    if (userEmail === ROOT_EMAIL) return showNotification('ROOT IMMORTAL', 'error');
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (error) showNotification(error.message, 'error');
    else {
      showNotification(`STATUS: ${newStatus.toUpperCase()}`, 'success');
      fetchDashboardData();
    }
  };

  const purgeUser = async (userId: string, userEmail: string) => {
    if (userEmail === ROOT_EMAIL) return showNotification('ROOT PROTECTION ACTIVE', 'error');
    if (!confirm('PERMANENTLY EXTERMINATE IDENTITY?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) showNotification(error.message, 'error');
    else {
      showNotification('Identity Purged.', 'success');
      fetchDashboardData();
    }
  };

  const purgeEvent = async (eventId: string) => {
    if (!confirm('PERMANENTLY EXTERMINATE EVENT? THIS ACTION IS IRREVERSIBLE.')) return;
    try {
      // Manual cascade delete for variants
      await supabase.from('event_variants').delete().eq('event_id', eventId);
      
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;
      showNotification('Event Purged.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showNotification('Purge Failed: ' + err.message, 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
      setEventForm({ ...eventForm, banner_image: publicUrl });
      showNotification('Banner Uploaded', 'success');
    } catch (err: any) {
      showNotification('Upload Failed: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuotaReached && !editingEvent) {
      return showNotification('EVENT QUOTA FULL.', 'error');
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let eventId;
      
      const payload = { ...eventForm, organizer_id: editingEvent ? editingEvent.organizer_id : user?.id };

      const attemptSave = async (data: any) => {
        if (editingEvent) {
          return await supabase.from('events').update(data).eq('id', editingEvent.id);
        } else {
          return await supabase.from('events').insert([data]).select();
        }
      };

      let { data, error } = await attemptSave(payload);

      // SCHEMA FALLBACK: Embed metadata if column is missing
      if (error && error.message.includes('registration_config')) {
        console.warn('Admin Schema Fallback Triggered');
        const fallbackPayload = { 
          ...payload,
          description: `[REG_CONFIG:{}]` + (payload.description || '')
        };
        delete (fallbackPayload as any).registration_config;
        const retry = await attemptSave(fallbackPayload);
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      
      eventId = editingEvent ? editingEvent.id : data?.[0].id;
      
      await supabase.from('event_variants').delete().eq('event_id', eventId);
      if (variants.length > 0) {
        await supabase.from('event_variants').insert(variants.map(v => ({ ...v, event_id: eventId })));
      }
      showNotification('Event Registry Updated', 'success');
      setIsEventModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      showNotification('Sync Error: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = async (event: any) => {
    setEditingEvent(event);
    let finalDescription = event.description || '';
    if (finalDescription.startsWith('[REG_CONFIG:')) {
      const endIdx = finalDescription.indexOf(']');
      finalDescription = finalDescription.substring(endIdx + 1);
    }
    setEventForm({ ...event, description: finalDescription });
    const { data } = await supabase.from('event_variants').select('*').eq('event_id', event.id);
    setVariants(data || []);
    setIsEventModalOpen(true);
  };

  const openCreateModal = () => {
    if (isQuotaReached) return showNotification('EVENT QUOTA FULL.', 'error');
    setEditingEvent(null);
    setVariants([]);
    setEventForm({
      title: '', description: '', date: '', location: '', category: 'Running',
      banner_image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
      status: 'upcoming'
    });
    setIsEventModalOpen(true);
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-500" size={48} /></div>;

  return (
    <div className="min-h-screen flex bg-[#050505] text-white selection:bg-red-600 selection:text-white overflow-hidden" style={{ '--brand': '#dc2626' } as any}>
      {/* High-Density Sidebar */}
      <aside className="w-64 border-r border-red-500/10 bg-[#080808] flex flex-col p-6 fixed h-full z-30 shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[var(--brand)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--brand)]/20">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-black uppercase tracking-tighter italic">ADMIN</h1>
        </div>
        
        {userProfile?.role === 'organizer' && (
          <div className="mb-8 p-4 bg-red-600/5 border border-red-500/10 rounded-2xl">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Event Quota</span>
                <span className={`text-[8px] font-black ${isQuotaReached ? 'text-red-500' : 'text-green-500'}`}>{eventCount} / {userProfile?.event_limit}</span>
             </div>
             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((eventCount / userProfile?.event_limit) * 100, 100)}%` }} className={`h-full ${isQuotaReached ? 'bg-red-500' : 'bg-red-600'}`} />
             </div>
          </div>
        )}

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 translate-x-1' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}>
              {item.icon} <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="flex items-center gap-3 text-white/20 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-[8px] pt-6 border-t border-white/5">
          <LogOut size={16} /> Disconnect
        </button>

        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Operational ID</p>
          <p className="text-[9px] font-mono font-bold text-red-500/40 break-all select-all cursor-copy hover:text-red-500 transition-colors">
            {userProfile?.id}
          </p>
        </div>
      </aside>

      {/* Full-Width Main Content */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-black/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Secure Node: Active</span>
          </div>
          <span className="text-[8px] font-black uppercase bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full text-red-500">{userProfile?.role} clearance</span>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Live Events" value={eventCount.toString()} trend="Status" icon={<Calendar className="text-red-500" />} />
                  <StatCard label="Node State" value="Optimal" trend="Kernel" icon={<Activity className="text-red-500" />} />
                  <StatCard label="Total Regs" value={registrations.length.toString()} trend="Total" icon={<Users className="text-red-500" />} />
                  <StatCard label="Gross RM" value={`${(registrations.length * 150).toLocaleString()}`} trend="Estimate" icon={<TrendingUp className="text-red-500" />} />
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

                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest opacity-20">
                          <th className="p-6">Operative Identity</th>
                          <th className="p-6">Clearance</th>
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
                                 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>{u.role}</span>
                              </td>
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
                  <h2 className="text-3xl font-display font-black uppercase tracking-tighter italic">Event Arsenal</h2>
                  {userProfile?.role === 'organizer' && (
                    <button onClick={openCreateModal} disabled={isQuotaReached} className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all ${isQuotaReached ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-red-600 text-white shadow-xl shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-1'}`}>
                      {isQuotaReached ? <Lock size={16} /> : <Plus size={16} />} Deploy Event
                    </button>
                  )}
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
                            {userProfile?.role === 'organizer' && (
                              <button onClick={() => openEditModal(event)} className="w-10 h-10 flex items-center justify-center bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Edit2 size={16} /></button>
                            )}
                            <button onClick={() => purgeEvent(event.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                         </div>
                         <button onClick={() => navigate(`/event/${event.id}`)} className="text-[9px] font-black uppercase text-red-500 tracking-widest hover:underline">Preview</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Event Modal - Denser Layout */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsEventModalOpen(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-4xl bg-[#0d0d0d] border border-white/10 rounded-[3rem] relative z-10 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                   <h3 className="text-2xl font-display font-black uppercase tracking-tighter italic">{editingEvent ? 'Edit Event' : 'Deploy Event'}</h3>
                   <button onClick={() => setIsEventModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-red-500 transition-all text-white/40 hover:text-white"><X size={18} /></button>
                </div>
                <form onSubmit={handleSaveEvent} className="p-8 flex-1 overflow-y-auto space-y-8">
                   <div className="grid grid-cols-[1fr_300px] gap-8">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Designation</label>
                            <input required value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="EVENT TITLE" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-black uppercase focus:border-red-600/50 outline-none transition-all" />
                         </div>
                         
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Target Date</label>
                            <CustomCalendar 
                              selected={eventForm.date ? new Date(eventForm.date) : undefined}
                              onSelect={(date) => setEventForm({...eventForm, date: date.toISOString().split('T')[0]})}
                            />
                         </div>

                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Coordinates</label>
                            <input required value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} placeholder="VENUE" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-black uppercase outline-none" />
                         </div>

                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Event Brief</label>
                            <textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} placeholder="SUMMARY" rows={3} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none h-20" />
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="space-y-4">
                            <CustomDropdown 
                              label="Category"
                              value={eventForm.category}
                              onChange={(val) => setEventForm({...eventForm, category: val})}
                              options={[
                                { value: 'Running', label: 'Running' },
                                { value: 'Ultra', label: 'Ultra' },
                                { value: 'Trail', label: 'Trail' },
                                { value: 'Cycling', label: 'Cycling' }
                              ]}
                            />

                            <CustomDropdown 
                              label="Status"
                              value={eventForm.status}
                              onChange={(val) => setEventForm({...eventForm, status: val})}
                              options={[
                                { value: 'upcoming', label: 'Upcoming' },
                                { value: 'live', label: 'Live' },
                                { value: 'completed', label: 'Completed' }
                              ]}
                            />
                         </div>

                         <div className="aspect-video bg-black border border-white/10 rounded-2xl relative overflow-hidden group">
                            {eventForm.banner_image ? <img src={eventForm.banner_image} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="opacity-10" />}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black uppercase text-[8px] text-white">Update Image</button>
                         </div>
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                         
                         <button type="submit" disabled={isSaving} className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-600/20 hover:scale-[1.02] transition-all mt-auto">
                            {isSaving ? <Loader2 className="animate-spin mx-auto" /> : editingEvent ? 'Commit Sync' : 'Initialize Event'}
                         </button>
                      </div>
                   </div>
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
