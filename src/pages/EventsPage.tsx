import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, AlertCircle, Cpu, Filter, ChevronRight, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
import EventCard from '../components/EventCard';
import { useLanguage } from '../lib/LanguageContext';
import { SHOWCASE_EVENTS } from '../lib/demoData';

export default function EventsPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/events/public`);
      const data = res.data;
      
      // Merge with showcase data for a full catalog
      const combined = [...(data || []), ...SHOWCASE_EVENTS];
      setEvents(combined);
    } catch (err) {
      console.error(err);
      setEvents(SHOWCASE_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.location || '').toLowerCase().includes(searchQuery.toLowerCase())
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
              <span>System: Event_Catalog_v2.0</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full"
            >
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Status: Optimal</span>
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-none italic"
            >
              THE <br />
              <span className="text-brand">EVENTS</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl text-lg text-white/40 font-light leading-relaxed"
            >
              Discover upcoming challenges and relive major milestones. Use our official registration portal to secure your spot in the next high-performance race.
            </motion.p>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="mb-24 space-y-4">
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
                placeholder={t('events.search_placeholder')}
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-6 text-lg font-bold uppercase tracking-tight outline-none placeholder:text-white/10"
              />
              <div className="flex items-center gap-2 px-6">
                 <button className="p-3 bg-white/5 hover:bg-brand hover:text-black transition-all rounded-xl text-white/40">
                    <Filter size={18} />
                 </button>
              </div>
              
              {/* Scanning Line Animation */}
              {isFocused && (
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-[2px] w-full bg-brand/50 blur-sm"
                />
              )}
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4 px-2">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Active Filters:</span>
             <div className="flex gap-2">
                <span className="px-3 py-1 bg-brand/10 text-brand text-[9px] font-black uppercase rounded-full border border-brand/20">All_Missions</span>
                <span className="px-3 py-1 bg-white/5 text-white/30 text-[9px] font-black uppercase rounded-full border border-white/5">Upcoming_Only</span>
             </div>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-40 flex flex-col items-center justify-center gap-8"
            >
              <div className="relative">
                <Loader2 className="animate-spin text-brand" size={60} />
                <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand/60">Fetching_Registry_Data...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
              
              {filteredEvents.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center group"
                >
                  <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform duration-500">
                    <AlertCircle size={48} className="animate-pulse" />
                  </div>
                  <h3 className="text-4xl font-display font-black uppercase tracking-tighter mb-4 italic">{t('events.no_found')}</h3>
                  <p className="text-white/20 text-xs font-black uppercase tracking-[0.4em] mb-12">{t('events.no_found')} in our database.</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand hover:text-black transition-all"
                  >
                    {t('events.reset')} <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

