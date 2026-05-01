import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseEventDescription } from '../lib/eventMetadata';
import ImageWithFallback from '../components/ImageWithFallback';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, event_variants (*)')
        .eq('id', id)
        .single();
      if (error) throw error;

      // Clean description using utility
      const { description: cleanDescription } = parseEventDescription(data.description || '');
      const processedData = { ...data, description: cleanDescription };

      setEvent(processedData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>;
  if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Event Not Found</div>;

  return (
    <main className="pt-24 pb-20 bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6">
        <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-white/40 mb-8 uppercase text-xs">
          <ArrowLeft size={16} /> Back
        </button>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div>
             <ImageWithFallback
               src={event.image_url || event.banner_image}
               alt={event.title}
               className="w-full rounded-2xl mb-8 shadow-2xl border border-white/5"
             />
            <h1 className="text-5xl font-display font-black uppercase mb-6">{event.title}</h1>
            <p className="text-white/60 mb-8">{event.description}</p>
          </div>
          <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold uppercase mb-6">Select Category</h2>
            <div className="space-y-4">
              {event.event_variants?.map((v: any) => (
                <div key={v.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                  <span className="font-bold uppercase">{v.name}</span>
                  <span className="text-brand font-black">RM {v.price}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate(`/register/${event.id}`)}
              className="w-full mt-8 py-4 bg-brand text-black font-black uppercase rounded-xl"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
