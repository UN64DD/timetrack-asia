'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/providers/language-provider';
import { usePublicEvents } from '@/hooks/use-events';
import { EventCard } from '@/components/events/event-card';

export default function EventsPage() {
  const { t } = useLanguage();
  const { data: events, isLoading } = usePublicEvents();
  const [search, setSearch] = useState('');

  const filtered = (events || []).filter((event) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      event.venue_name?.toLowerCase().includes(q) ||
      event.city?.toLowerCase().includes(q) ||
      event.event_categories?.some((c: any) => c.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4">
            <span className="text-white">THE </span>
            <span className="text-brand">EVENTS</span>
          </h1>
          <p className="text-sm text-white/30 font-bold uppercase tracking-widest max-w-lg mx-auto">
            {t('events_page.desc')}
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('events.search_placeholder')}
              className="input-field pl-12 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-xs font-black uppercase tracking-widest text-white/20 mb-4">
              {t('events.no_found')}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="btn-secondary text-xs">
                {t('events.reset')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
