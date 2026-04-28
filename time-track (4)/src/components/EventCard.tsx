import { motion } from 'framer-motion';
import { MapPin, Calendar, Tag, User, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EventVariant } from '../types';
import CrypticText from './CrypticText';
import { playTap } from '../lib/sounds';

export default function EventCard({ event, index = 0 }: { event: any, index?: number }) {
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!event?.id) return;
    async function fetchData() {
      // Try DB Relation - now variants are properly linked
      const { data: priceData, error } = await supabase
        .from('event_variants')
        .select('id, price, name')
        .eq('event_id', event.id)
        .order('price', { ascending: true });
       
      if (!error && priceData && priceData.length > 0) {
        setMinPrice(priceData[0].price);
        setCategories(priceData.map(v => v.name));
      } else if (event.variants && event.variants.length > 0) {
        // Use pre-fetched variants if available
        const sorted = [...event.variants].sort((a: EventVariant, b: EventVariant) => a.price - b.price);
        setMinPrice(sorted[0].price);
        setCategories(sorted.map(v => v.name));
      }
    }
    fetchData();
  }, [event?.id, event?.variants]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/event/${event.id}`} onClick={() => playTap()}>
        <div className="bg-[#0a0a0a] border-2 border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-brand hover:shadow-2xl hover:shadow-brand/5">
          {/* Banner Section */}
          <div className="aspect-[16/9] relative overflow-hidden">
            <img 
              src={event.image_url || event.banner_image || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              alt={event.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-6 left-6 flex gap-2">
              <div className="bg-brand text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                {event.status || 'Active'}
              </div>
            </div>
          </div>

          {/* Content Section (The "Old Style" Structured List) */}
          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-2 group-hover:text-brand transition-colors">
                {event.title || 'Untitled Mission'}
              </h3>
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <MapPin size={12} className="text-brand" /> {event.location || 'Location Pending'}
              </div>
            </div>

            <div className="space-y-3 border-t border-white/5 pt-6">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                <span className="text-white/30 flex items-center gap-2"><Layers size={14} /> Category:</span>
                <span className="text-white">{categories[0] || 'Open'}{categories.length > 1 ? ` +${categories.length - 1}` : ''}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                <span className="text-white/30 flex items-center gap-2"><User size={14} /> Organizer:</span>
                <span className="text-white">{event.organizer || 'Time Track'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                <span className="text-white/30 flex items-center gap-2"><Calendar size={14} /> Date:</span>
                <span className="text-white">{event.date}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-brand">Starts From</span>
               <div className="text-3xl font-display font-black text-white">
                  RM {(typeof minPrice === 'number' && !isNaN(minPrice)) ? minPrice.toFixed(2) : '--'}
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
