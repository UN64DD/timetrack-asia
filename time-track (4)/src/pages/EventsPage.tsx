import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    (e.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="pt-24 pb-20 min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl font-display font-black uppercase mb-8">Events</h1>
        
        {/* Simple Search */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand"
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-brand" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40">
                <AlertCircle className="mx-auto mb-4" size={40} />
                <p>NO EVENTS FOUND</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
