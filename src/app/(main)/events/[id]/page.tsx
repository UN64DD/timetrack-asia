'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MapPin, Calendar, Users, Loader2, ArrowRight, Clock } from 'lucide-react';
import { useLanguage } from '@/providers/language-provider';
import { useEvent } from '@/hooks/use-events';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const router = useRouter();
  const { data: event, isLoading } = useEvent(id);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs font-black uppercase tracking-widest text-white/20">Event not found</p>
      </div>
    );
  }

  const categories = event.event_categories || [];
  const selected = categories.find((c: any) => c.id === selectedCategory) || categories[0];
  const status = event.status;

  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-white/5 mb-8">
              {event.cover_image ? (
                <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand/10 to-transparent">
                  <span className="text-white/10 font-display text-4xl font-black">TT</span>
                </div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mb-6">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <MapPin size={12} className="text-brand" />
                  {event.venue_name || event.city || 'TBA'}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Calendar size={12} className="text-brand" />
                  {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Clock size={12} className="text-brand" />
                  Reg: {new Date(event.registration_close).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              {event.description && (
                <div className="text-sm text-white/60 font-bold uppercase tracking-widest leading-relaxed mb-8">
                  {event.description}
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 sticky top-28"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6">
                SELECT CATEGORY
              </h3>

              <div className="space-y-3 mb-8">
                {categories.map((cat: any) => {
                  const isSelected = selectedCategory === cat.id || (!selectedCategory && categories[0]?.id === cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-brand bg-brand/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-brand' : 'text-white'}`}>
                          {cat.name}
                        </span>
                        <span className="text-xs font-black">
                          RM{Number(cat.base_price).toFixed(2)}
                        </span>
                      </div>
                      {cat.max_slots && (
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                          <Users size={10} />
                          {cat.max_slots} slots max
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div className="mb-6">
                  <div className="flex items-center justify-between py-3 border-t border-white/10">
                    <span className="text-xs font-black uppercase tracking-widest text-white/50">Entry Fee</span>
                    <span className="text-2xl font-display font-black text-brand">
                      RM{Number(selected.base_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (selected) router.push(`/events/${id}/register?category=${selected.id}`);
                }}
                disabled={status !== 'LIVE'}
                className="btn-primary w-full text-sm"
              >
                {status === 'LIVE' ? t('card.reg_now') : t('card.reg_closed')}
                <ArrowRight size={16} />
              </button>

              {event.max_participants && (
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest text-center mt-4">
                  <Users size={10} className="inline mr-1" />
                  Max {event.max_participants} participants
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
