'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Trophy, Medal, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/providers/language-provider';
import { useEvents } from '@/hooks/use-events';

export default function ResultsPage() {
  const { t } = useLanguage();
  const { data: events, isLoading } = useEvents('COMPLETED,ENDED');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const filtered = (events || []).filter(ev =>
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    ev.venue_name?.toLowerCase().includes(search.toLowerCase())
  );

  const loadResults = async (eventId: string) => {
    setSelectedEvent(eventId);
    setLoadingResults(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createSupabaseBrowserClient();
      const { data } = await supabase
        .from('results')
        .select('*, participants(full_name, bib_name, gender, event_categories(name))')
        .eq('event_id', eventId)
        .order('overall_rank', { ascending: true });
      setResults(data || []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  if (selectedEvent) {
    return (
      <div className="pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => { setSelectedEvent(null); setResults([]); }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-brand mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Events
          </button>

          <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mb-8">
            LEADERBOARD
          </h1>

          {loadingResults ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 size={32} className="animate-spin text-brand" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-32">
              <Trophy size={32} className="mx-auto text-white/10 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-white/20">No results published yet</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Rank</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Athlete</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Bib</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Category</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Time</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {r.overall_rank === 1 && <Medal size={14} className="text-yellow-500" />}
                            {r.overall_rank === 2 && <Medal size={14} className="text-gray-400" />}
                            {r.overall_rank === 3 && <Medal size={14} className="text-amber-700" />}
                            <span className="text-sm font-black">{r.overall_rank || '-'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold">{r.participants?.full_name || r.participants?.bib_name || 'Unknown'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-mono text-brand">{r.bib_number}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {r.participants?.event_categories?.name || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-black">{r.finish_time || r.gun_time || r.chip_time || '-'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            r.status === 'FINISHED' ? 'text-green-500' :
                            r.status === 'DNF' ? 'text-red-500' :
                            r.status === 'DNS' ? 'text-yellow-500' : 'text-white/30'
                          }`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4">
            <span className="text-white">RACE </span>
            <span className="text-brand">RESULTS</span>
          </h1>
          <p className="text-sm text-white/30 font-bold uppercase tracking-widest max-w-lg mx-auto">
            {t('results.desc')}
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('results.search')}
              className="input-field pl-12"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <Trophy size={32} className="mx-auto text-white/10 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-white/20">No results available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ev) => (
              <button
                key={ev.id}
                onClick={() => loadResults(ev.id)}
                className="glass rounded-2xl p-6 text-left hover:bg-white/[0.07] transition-all group"
              >
                <h3 className="text-sm font-black uppercase tracking-tight mb-2 group-hover:text-brand transition-colors">
                  {ev.title}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  {new Date(ev.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
