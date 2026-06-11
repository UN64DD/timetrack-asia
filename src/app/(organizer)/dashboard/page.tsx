'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Calendar, Users, DollarSign, Plus, Loader2, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Tab = 'overview' | 'events' | 'registrations' | 'results' | 'coupons' | 'analytics';

export default function OrganizerDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const supabase = createSupabaseBrowserClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['org-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const [events, regs] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact' }).eq('organizer_id', user.id).is('deleted_at', null),
        supabase.from('registrations').select('total_amount, status').eq('athlete_id', user.id),
      ]);
      return {
        totalEvents: events.count || 0,
        totalRegistrations: regs.data?.length || 0,
        totalRevenue: regs.data?.filter(r => r.status === 'PAID').reduce((s, r) => s + Number(r.total_amount), 0) || 0,
      };
    },
    staleTime: 30_000,
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar variant="organizer" />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-display font-black uppercase tracking-tighter">
              ORGANIZER <span className="text-blue-500">HUB</span>
            </h1>
            <div className="flex items-center gap-2">
              {['overview', 'events', 'registrations', 'results', 'coupons', 'analytics'].map(t => (
                <button key={t} onClick={() => setTab(t as Tab)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${tab === t ? 'bg-blue-500/10 text-blue-500' : 'text-white/30 hover:text-white/50'}`}
                >{t}</button>
              ))}
            </div>
          </div>
        </header>
        <div className="p-8">
          {tab === 'overview' && <OverviewTab stats={stats} loading={isLoading} />}
          {tab === 'events' && <EventsTab />}
          {tab === 'registrations' && <RegistrationsTab />}
          {tab === 'results' && <ResultsTab />}
          {tab === 'coupons' && <div className="text-center py-20"><p className="text-xs text-white/20">Coupon management coming soon</p></div>}
          {tab === 'analytics' && <div className="text-center py-20"><p className="text-xs text-white/20">Analytics coming soon</p></div>}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats, loading }: { stats: any; loading: boolean }) {
  const cards = [
    { label: 'Total Events', value: stats?.totalEvents, icon: Calendar, color: 'text-blue-500' },
    { label: 'Total Athletes', value: stats?.totalRegistrations, icon: Users, color: 'text-green-500' },
    { label: 'Gross Revenue', value: `RM${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-brand' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-white/30">Overview</h2>
        <Link href="/organizer/dashboard/events/new" className="btn-primary text-xs !py-3">
          <Plus size={14} /> New Event
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{c.label}</p>
              <c.icon size={18} className={c.color} />
            </div>
            {loading ? <div className="h-8 bg-white/5 rounded animate-pulse" /> :
              <p className={`text-3xl font-display font-black tracking-tighter ${c.color}`}>{c.value || 0}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EventsTab() {
  const supabase = createSupabaseBrowserClient();
  const { data: events, isLoading } = useQuery({
    queryKey: ['org-events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('events').select('*, event_categories(*)').eq('organizer_id', user.id).is('deleted_at', null).order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-white/30">My Events</h2>
        <Link href="/organizer/dashboard/events/new" className="btn-primary text-xs !py-3">
          <Plus size={14} /> New Event
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? <div className="col-span-full py-20 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-500" /></div> :
          !events?.length ? <div className="col-span-full py-20 text-center"><p className="text-xs text-white/20">No events yet. Create your first event!</p></div> :
          events.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-tight">{ev.title}</h3>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                  ev.status === 'DRAFT' ? 'bg-white/10 text-white/50' :
                  ev.status === 'LIVE' ? 'bg-green-500/10 text-green-500' :
                  ev.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>{ev.status}</span>
              </div>
              <p className="text-[10px] text-white/30 mb-4">
                {ev.event_categories?.length || 0} categories • {new Date(ev.event_date).toLocaleDateString()}
              </p>
              <Link href={`/organizer/dashboard/events/${ev.id}/registrations`}
                className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:gap-2 transition-all flex items-center gap-1"
              >View <ArrowRight size={12} /></Link>
            </motion.div>
          ))}
      </div>
    </div>
  );
}

function RegistrationsTab() {
  const supabase = createSupabaseBrowserClient();
  const { data: regs, isLoading } = useQuery({
    queryKey: ['org-registrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('registrations').select('*, events(title), participants(full_name)').order('created_at', { ascending: false });
      return (data || []).filter((r: any) => r.events?.organizer_id === user.id);
    },
    staleTime: 10_000,
  });

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Athlete</th>
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Event</th>
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
            <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Date</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <tr><td colSpan={4} className="p-8 text-center"><Loader2 size={20} className="animate-spin mx-auto text-blue-500" /></td></tr> :
            !regs?.length ? <tr><td colSpan={4} className="p-8 text-center text-xs text-white/20">No registrations</td></tr> :
            regs.map(r => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-sm font-bold">{(r as any).participants?.[0]?.full_name || 'Unknown'}</td>
                <td className="p-4 text-xs text-white/40">{(r as any).events?.title}</td>
                <td className="p-4"><span className={`text-[10px] font-black uppercase tracking-widest ${r.status === 'PAID' ? 'text-green-500' : r.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'}`}>{r.status}</span></td>
                <td className="p-4 text-[10px] text-white/30">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultsTab() {
  const supabase = createSupabaseBrowserClient();
  const { data: events, isLoading } = useQuery({
    queryKey: ['org-results-events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('events').select('id, title, results_finalized').eq('organizer_id', user.id).is('deleted_at', null);
      return data || [];
    },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/organizer/dashboard/results/import" className="btn-secondary text-xs">Import Results</Link>
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Event</th>
              <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Finalized</th>
              <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={3} className="p-8 text-center"><Loader2 size={20} className="animate-spin mx-auto text-blue-500" /></td></tr> :
              !events?.length ? <tr><td colSpan={3} className="p-8 text-center text-xs text-white/20">No events</td></tr> :
              events.map(ev => (
                <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm font-bold">{ev.title}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${ev.results_finalized ? 'text-green-500' : 'text-yellow-500'}`}>
                      {ev.results_finalized ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/organizer/dashboard/results/finalize/${ev.id}`} className="text-[10px] text-blue-500 hover:underline font-black uppercase tracking-widest">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
