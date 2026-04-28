import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import { motion } from 'framer-motion';
import { ArrowUpRight, Zap, Target, Award, Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import CrypticText from '../components/CrypticText';
import EventCard from '../components/EventCard';
import { supabase } from '../lib/supabase';
import { SHOWCASE_EVENTS } from '../lib/demoData';

export default function Home() {
  const { t } = useLanguage();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .neq('status', 'archived')
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;
      
      // Combine Supabase data with showcase data to ensure a populated look
      const combined = [...(data || []), ...SHOWCASE_EVENTS].slice(0, 3);
      setUpcomingEvents(combined);
    } catch (err) {
      console.error('Error fetching events:', err);
      // Fallback to showcase data on error
      setUpcomingEvents(SHOWCASE_EVENTS.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Hero />
      <Marquee />

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-white/5 border border-white/5 rounded-[32px] hover:border-brand/20 transition-colors group"
            >
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="text-brand" size={28} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 uppercase"><CrypticText text={t('home.precision')} /></h3>
              <p className="text-white/40 leading-relaxed font-light">
                <CrypticText text={t('home.precision_desc')} />
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-white/5 border border-white/5 rounded-[32px] hover:border-brand/20 transition-colors group"
            >
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Target className="text-brand" size={28} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 uppercase"><CrypticText text={t('home.mgmt')} /></h3>
              <p className="text-white/40 leading-relaxed font-light">
                <CrypticText text={t('home.mgmt_desc')} />
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-10 bg-white/5 border border-white/5 rounded-[32px] hover:border-brand/20 transition-colors group"
            >
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Award className="text-brand" size={28} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 uppercase"><CrypticText text={t('home.results')} /></h3>
              <p className="text-white/40 leading-relaxed font-light">
                <CrypticText text={t('home.results_desc')} />
              </p>
            </motion.div>
          </div>

          <div className="mt-32">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16 px-2">
              <div>
                <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.8]">
                  <CrypticText text={t('events.upcoming')} /> <br />
                  <span className="text-brand"><CrypticText text={t('events.events')} /></span>
                </h2>
              </div>
              <a href="/events" className="bg-brand text-black font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest flex items-center gap-2 group shrink-0 hover:shadow-brand/20 shadow-lg transition-all">
                <CrypticText text={t('events.view_more')} />
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[32px]">
                    <p className="text-white/20 font-black uppercase tracking-widest">{t('events.no_found')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand rounded-[3rem] p-12 md:p-24 text-black text-center space-y-8 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,black_20px,black_40px)]" />
             </div>
             
             <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter italic relative z-10 leading-[0.85]">
                {t('home.cta.ready')}
             </h2>
             <button className="px-12 py-5 bg-black text-brand font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl relative z-10">
                {t('home.cta.join')}
             </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

