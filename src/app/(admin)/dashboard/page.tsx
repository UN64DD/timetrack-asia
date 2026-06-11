'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  Activity, Users, Calendar, DollarSign, Clock, AlertTriangle,
  Search, Ban, Trash2, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Tab = 'overview' | 'users' | 'events' | 'payments' | 'settings';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const supabase = createSupabaseBrowserClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [events, users, regs, payments] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('total_amount, status'),
        supabase.from('payments').select('amount, status'),
      ]);
      return {
        totalEvents: events.count || 0, totalUsers: users.count || 0,
        totalRegistrations: regs.data?.length || 0,
        totalRevenue: regs.data?.filter(r => r.status === 'PAID').reduce((s, r) => s + Number(r.total_amount), 0) || 0,
        pendingPayments: payments.data?.filter(p => p.status === 'PENDING_REVIEW').length || 0,
        failedPayments: payments.data?.filter(p => p.status === 'FAILED').length || 0,
      };
    },
    staleTime: 30_000,
  });

  const statsCards = [
    { label: 'Live Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-brand' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Regs', value: stats?.totalRegistrations || 0, icon: Activity, color: 'text-green-500' },
    { label: 'Revenue (MYR)', value: `RM${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-yellow-500' },
    { label: 'Pending Review', value: stats?.pendingPayments || 0, icon: Clock, color: 'text-orange-500' },
    { label: 'Failed Payments', value: stats?.failedPayments || 0, icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar variant="admin" />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-display font-black uppercase tracking-tighter">
              ADMIN <span className="text-red-500">DASHBOARD</span>
            </h1>
            <div className="flex items-center gap-2">
              {['overview', 'users', 'events', 'payments', 'settings'].map(t => (
                <button key={t} onClick={() => setTab(t as Tab)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${tab === t ? 'bg-red-500/10 text-red-500' : 'text-white/30 hover:text-white/50'}`}
                >{t}</button>
              ))}
            </div>
          </div>
        </header>
        <div className="p-8">
          {tab === 'overview' && <OverviewTab stats={statsCards} loading={isLoading} />}
          {tab === 'users' && <UsersTab />}
          {tab === 'events' && <EventsTab />}
          {tab === 'payments' && <div className="text-center py-20"><p className="text-xs text-white/20">Payment management coming soon</p></div>}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats, loading }: { stats: any[]; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</p>
            <s.icon size={18} className={s.color} />
          </div>
          {loading ? <div className="h-8 bg-white/5 rounded animate-pulse" /> :
            <p className={`text-3xl font-display font-black tracking-tighter ${s.color}`}>{s.value}</p>}
        </motion.div>
      ))}
    </div>
  );
}

function UsersTab() {
  const supabase = createSupabaseBrowserClient();
  const [search, setSearch] = useState('');
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('id, email, role, status, first_name, last_name, created_at').order('created_at', { ascending: false });
      return data || [];
    },
  });
  const filtered = (users || []).filter(u => u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="relative max-w-md mb-6">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-red-500/50 transition-all" />
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Email</th>
              <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Role</th>
              <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
              <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Created</th>
              <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 size={20} className="animate-spin mx-auto text-red-500" /></td></tr> :
              filtered.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-xs text-white/20">No users found</td></tr> :
              filtered.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4"><span className="text-sm font-bold">{u.email}</span></td>
                  <td className="p-4"><span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-red-500/10 text-red-500">{u.role}</span></td>
                  <td className="p-4"><span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`}>{u.status}</span></td>
                  <td className="p-4 text-[10px] text-white/30">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-yellow-500/10 rounded-lg text-yellow-500/50 hover:text-yellow-500"><Ban size={14} /></button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventsTab() {
  const supabase = createSupabaseBrowserClient();
  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*, organizer:users!events_organizer_id_fkey(email)').is('deleted_at', null).order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Title</th>
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Organizer</th>
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Date</th>
            <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 size={20} className="animate-spin mx-auto text-red-500" /></td></tr> :
            !events?.length ? <tr><td colSpan={5} className="p-8 text-center text-xs text-white/20">No events</td></tr> :
            events.map(ev => (
              <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4"><span className="text-sm font-bold">{ev.title}</span></td>
                <td className="p-4 text-xs text-white/40">{ev.organizer?.email}</td>
                <td className="p-4"><span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${ev.status === 'LIVE' ? 'bg-green-500/10 text-green-500' : ev.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : ev.status === 'DRAFT' ? 'bg-white/10 text-white/50' : 'bg-red-500/10 text-red-500'}`}>{ev.status}</span></td>
                <td className="p-4 text-[10px] text-white/30">{new Date(ev.event_date).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-green-500/10 rounded-lg text-green-500/50 hover:text-green-500"><CheckCircle size={14} /></button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500"><XCircle size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-tight mb-4">System Health</h3>
        {['banners', 'results', 'avatars'].map(bucket => (
          <div key={bucket} className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">{bucket}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Operational</span>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-tight mb-4">Maintenance Mode</h3>
        <p className="text-xs text-white/30 mb-4">Enable maintenance mode to prevent user access during updates.</p>
        <button className="btn-secondary text-xs">Toggle Maintenance</button>
      </div>
    </div>
  );
}
