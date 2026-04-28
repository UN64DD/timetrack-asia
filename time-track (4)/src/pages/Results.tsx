import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import CrypticText from '../components/CrypticText';
import { Search, Trophy, Calendar, MapPin, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';

export default function Results() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const pastEvents = [
    { id: 1, title: 'Temerloh Night Run 2024', date: '12/12/2024', location: 'Temerloh, Pahang', participants: '1,200+' },
    { id: 2, title: 'Jerantut Trail Challenge', date: '05/11/2024', location: 'Jerantut, Pahang', participants: '850+' },
    { id: 3, title: 'Kuantan City Ultra', date: '20/10/2024', location: 'Kuantan, Pahang', participants: '450+' },
  ];

  return (
    <main className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-8 uppercase leading-none">
              {t('results.hero.title').split(' ')[0]} <span className="text-brand italic">{t('results.hero.title').split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl font-light max-w-2xl">
              {t('results.hero.desc')}
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={t('results.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border-2 border-white/10 rounded-2xl py-6 pl-16 pr-6 outline-none focus:border-brand/50 transition-all font-bold uppercase tracking-tight text-sm placeholder:text-white/10"
            />
          </div>
          <button className="bg-white/5 border-2 border-white/10 px-8 rounded-2xl flex items-center gap-3 hover:border-white/30 transition-all font-black uppercase tracking-widest text-[0.65rem]">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {pastEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/[0.02] border-2 border-white/5 hover:border-brand/30 p-8 rounded-3xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand border border-brand/20 group-hover:scale-110 transition-transform">
                  <Trophy size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black uppercase tracking-tight group-hover:text-brand transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                      <Calendar size={12} className="text-brand" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                      <MapPin size={12} className="text-brand" /> {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                      <Search size={12} className="text-brand" /> {event.participants} Participants
                    </div>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-3 font-black uppercase tracking-widest text-[0.65rem] text-brand/50 group-hover:text-brand transition-colors">
                {t('results.view.board')} <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Empty State / Coming Soon */}
        <div className="mt-20 p-12 border-2 border-dashed border-white/5 rounded-[3rem] text-center opacity-40">
          <p className="text-xs font-black uppercase tracking-[0.3em]">More results arriving daily</p>
        </div>
      </div>
    </main>
  );
}
