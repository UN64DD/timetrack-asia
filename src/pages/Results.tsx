import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { Search, Trophy, Calendar, MapPin, ChevronRight, Filter, Cpu, Download, BarChart2, Loader2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Results() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingResults, setFetchingResults] = useState(false);

  useEffect(() => {
    fetchEventsWithResults();
  }, []);

  const fetchEventsWithResults = async () => {
    setLoading(true);
    try {
      // Get events that have at least one result
      const { data, error } = await supabase
        .from('events')
        .select('*, results(count)')
        .order('date', { ascending: false });

      if (error) throw error;
      // Filter events that actually have results
      setEvents(data?.filter(e => e.results && e.results[0].count > 0) || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (event: any) => {
    setSelectedEvent(event);
    setFetchingResults(true);
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('event_id', event.id)
        .order('rank_overall', { ascending: true });
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setFetchingResults(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResults = results.filter(r => 
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.bib_number && r.bib_number.toString().includes(searchQuery))
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-40 pb-32 px-6 lg:px-12 relative overflow-hidden">
      {/* Background Grid & FX */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header Section */}
        <header className="mb-20 space-y-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-brand font-black uppercase tracking-[0.4em] text-[10px]"
            >
              <Cpu size={14} />
              <span>Archive: Protocol_Verified_Performance</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full"
            >
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sync: Operational</span>
            </motion.div>
          </div>
          
          <div className="space-y-4 text-left">
            {selectedEvent && (
              <motion.button 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => { setSelectedEvent(null); setResults([]); }}
                className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-8 hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft size={14} /> Return to Archive
              </motion.button>
            )}
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-none italic"
            >
              {selectedEvent ? 'EVENT' : 'RACE'} <br />
              <span className="text-brand">{selectedEvent ? 'DATA' : 'RESULTS'}</span>
            </motion.h1>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`relative group transition-all duration-500 ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}
          >
            <div className={`absolute -inset-1 bg-gradient-to-r from-brand/20 via-transparent to-brand/20 rounded-2xl blur-lg transition-opacity duration-500 ${isFocused ? 'opacity-40' : 'opacity-0'}`} />
            
            <div className={`relative flex items-center bg-[#0a0a0a] border-2 transition-all duration-300 rounded-2xl overflow-hidden ${isFocused ? 'border-brand shadow-2xl shadow-brand/10' : 'border-white/5'}`}>
              <div className="flex items-center px-6 text-white/20 group-hover:text-brand transition-colors">
                <Search size={22} className={isFocused ? 'text-brand' : ''} />
              </div>
              <input 
                type="text"
                placeholder={selectedEvent ? "Search athlete or bib..." : t('results.search.placeholder')}
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-6 text-lg font-bold uppercase tracking-tight outline-none placeholder:text-white/10"
              />
            </div>
          </motion.div>
        </div>

        {/* Main List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-brand" size={48} /></div>
          ) : !selectedEvent ? (
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => fetchResults(event)}
                  className="group cursor-pointer relative bg-[#0a0a0a] border border-white/5 p-8 md:p-10 rounded-[2.5rem] hover:border-brand/40 transition-all duration-500 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-10"
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/40 group-hover:bg-brand group-hover:text-black transition-all duration-500 shadow-xl group-hover:shadow-brand/20">
                      <Trophy size={32} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter italic group-hover:text-brand transition-colors leading-none">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                          <Calendar size={12} className="text-brand" /> {event.date}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                          <MapPin size={12} className="text-brand" /> {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-white/20 group-hover:text-brand transition-all group-hover:translate-x-2" />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="space-y-4">
               {fetchingResults ? (
                 <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand" /></div>
               ) : (
                 <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-white/[0.02] border-b border-white/5">
                          <tr className="text-[10px] font-black uppercase tracking-widest text-white/20">
                             <th className="px-10 py-6">Rank</th>
                             <th className="px-10 py-6">Athlete</th>
                             <th className="px-10 py-6">Bib</th>
                             <th className="px-10 py-6">Category</th>
                             <th className="px-10 py-6 text-right">Finish Time</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {filteredResults.map((res) => (
                             <tr key={res.id} className="hover:bg-brand/[0.02] transition-colors group">
                                <td className="px-10 py-6 font-display font-black text-brand italic text-xl">#{res.rank_overall}</td>
                                <td className="px-10 py-6 font-black uppercase text-sm group-hover:text-brand transition-colors">{res.full_name}</td>
                                <td className="px-10 py-6 font-mono text-white/20">{res.bib_number}</td>
                                <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">{res.category}</td>
                                <td className="px-10 py-6 text-right font-display font-black text-white italic text-xl">{res.finish_time}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}
            </div>
          )}

          {((!selectedEvent && filteredEvents.length === 0) || (selectedEvent && filteredResults.length === 0)) && !loading && (
             <div className="py-40 text-center space-y-6 border-2 border-dashed border-white/5 rounded-[4rem] opacity-30">
                <BarChart2 className="mx-auto" size={48} />
                <p className="text-xs font-black uppercase tracking-[0.5em]">No data matches found.</p>
             </div>
          )}
        </div>

        {/* System Footer */}
        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-brand rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Certified Archive Service ©2026</span>
           </div>
           <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.4em] max-w-xs text-center md:text-right">
              Verified performance metrics verified through Time Track Solution protocol.
           </p>
        </div>
      </div>
    </main>
  );
}

