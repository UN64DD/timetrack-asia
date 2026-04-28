import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Smartphone,
  ChevronRight,
  Loader2,
  MapPin,
  Stethoscope,
  PhoneCall,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import CrypticText from '../components/CrypticText';
import { supabase } from '../lib/supabase';

import CustomCalendar from '../components/CustomCalendar';
import CustomDropdown from '../components/CustomDropdown';

export default function Registration() {
  const { id, variantId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    billing: {
      first_name: '',
      phone: '',
      email: '',
      persons_count: '1',
      country: '',
      town_city: '',
      postcode: ''
    },
    attendee: {
      full_name: '',
      bib_name: '',
      email: '',
      phone: '',
      gender: '',
      ic_passport: '',
      dob: '',
      age: '',
      address: '',
      postcode: '',
      country: '',
      category_age: '',
      medical_status: 'HEALTHY',
      medical_details: '',
      emergency_name: '',
      emergency_phone: ''
    }
  });

  useEffect(() => {
    fetchEvent();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, event_variants (*)')
        .eq('id', id)
        .single();
       
      if (error) throw error;
      
      // Clean description if it contains metadata
      let processedData = { ...data };
      if (data.description && data.description.includes('[PROTOCOL_DATA:')) {
        processedData.description = data.description.split('[PROTOCOL_DATA:')[0].trim();
      }
 
      setEvent(processedData);
    } catch (err) {
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const variant = event?.event_variants?.find((v: any) => v.id.toString() === variantId);
  
  const handleRegistration = async () => {
    if (!variant) {
      alert('Please select a variant');
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Check for duplicate registration
      const { data: existing } = await supabase
        .from('registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .eq('variant_id', variant.id)
        .maybeSingle();
        
      if (existing) {
        alert('You are already registered for this event variant');
        return;
      }
      
      // Create registration
      const { error } = await supabase
        .from('registrations')
        .insert([{
          user_id: user.id,
          event_id: event.id,
          variant_id: variant.id,
          status: 'pending'
        }]);
        
      if (error) throw error;
      
      alert('Registration successful!');
      navigate('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      alert('Registration failed: ' + err.message);
    }
  };

  // Connect registration to step 4
  const handleStep4Click = () => {
    handleRegistration();
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-brand" size={48} />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-black uppercase tracking-widest gap-6">
      <ShieldCheck size={64} className="text-red-500 opacity-20" />
      Mission Not Found
    </div>
  );

  const config = event.registration_config || {
    billing: { first_name: true, phone: true, email: true, persons_count: true, country: true, town_city: true, postcode: true },
    attendee: { full_name: true, bib_name: false, email: true, phone: true, gender: true, ic_passport: true, dob: true, age: true, address: false, postcode: false, country: false, category_age: true, medical_status: false, medical_details: false, emergency_name: true, emergency_phone: true }
  };

  return (
    <main className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-white/40 hover:text-brand transition-colors mb-8 font-bold uppercase tracking-[0.2em] text-[0.6rem]"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Event Details
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-brand font-black uppercase tracking-widest text-xs mb-2">Registration Form</p>
              <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter italic leading-none">
                {event.title}
              </h1>
              {variant && (
                <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mt-4">
                  Category: <span className="text-white">{variant.attributes['attribute_category-event'] || 'Selected Variant'}</span>
                </p>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 mb-1">Total Due</p>
              <p className="text-3xl font-display font-black text-brand tracking-tighter">
                {variant ? `RM${variant.price}.00` : `RM${event.price}.00`}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-16 px-1">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex flex-col gap-3">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-brand' : 'bg-white/10'}`} />
              <p className={`text-[9px] uppercase tracking-widest font-black ${step >= s ? 'text-brand' : 'text-white/20'}`}>
                {s === 1 ? 'Billing' : s === 2 ? 'Attendee' : s === 3 ? 'Waiver' : 'Payment'}
              </p>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 relative overflow-hidden"
        >
          {step === 1 && (
            <div className="space-y-10">
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter italic border-l-4 border-brand pl-6">Billing <span className="text-brand">Details</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {config.billing.first_name && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><User size={12} /> First Name</label>
                    <input type="text" value={formData.billing.first_name} onChange={(e) => setFormData({...formData, billing: {...formData.billing, first_name: e.target.value.toUpperCase()}})} placeholder="FIRST NAME" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold uppercase text-xs" />
                  </div>
                )}
                {config.billing.phone && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><Smartphone size={12} /> Phone Number</label>
                    <input type="tel" value={formData.billing.phone} onChange={(e) => setFormData({...formData, billing: {...formData.billing, phone: e.target.value}})} placeholder="+60..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                  </div>
                )}
                {config.billing.email && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><Mail size={12} /> Email Address</label>
                    <input type="email" value={formData.billing.email} onChange={(e) => setFormData({...formData, billing: {...formData.billing, email: e.target.value}})} placeholder="NAME@EXAMPLE.COM" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                  </div>
                )}
                {config.billing.persons_count && (
                   <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><Users size={12} /> Pax Count</label>
                    <input type="number" value={formData.billing.persons_count} onChange={(e) => setFormData({...formData, billing: {...formData.billing, persons_count: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                  </div>
                )}
                {config.billing.country && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><MapPin size={12} /> Country / Region</label>
                    <input type="text" value={formData.billing.country} onChange={(e) => setFormData({...formData, billing: {...formData.billing, country: e.target.value.toUpperCase()}})} placeholder="MALAYSIA" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                  </div>
                )}
                {config.billing.town_city && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2">Town / City</label>
                    <input type="text" value={formData.billing.town_city} onChange={(e) => setFormData({...formData, billing: {...formData.billing, town_city: e.target.value.toUpperCase()}})} placeholder="KUALA LUMPUR" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                  </div>
                )}
                {config.billing.postcode && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2">Postcode / ZIP</label>
                    <input type="text" value={formData.billing.postcode} onChange={(e) => setFormData({...formData, billing: {...formData.billing, postcode: e.target.value}})} placeholder="50000" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-8">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)} className="bg-brand text-black py-5 px-12 rounded-2xl font-black uppercase tracking-widest text-[0.7rem] flex items-center gap-3 group shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                  Continue to Attendee Info
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12">
               <h2 className="text-3xl font-display font-black uppercase tracking-tighter italic border-l-4 border-brand pl-6">Attendee <span className="text-brand">Information</span></h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {config.attendee.full_name && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><User size={12} /> Full Name (As NRIC)</label>
                     <input type="text" value={formData.attendee.full_name} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, full_name: e.target.value.toUpperCase()}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
                 {config.attendee.bib_name && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1">Bib Name</label>
                     <input type="text" value={formData.attendee.bib_name} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, bib_name: e.target.value.toUpperCase()}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
                 {config.attendee.email && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1"><Mail size={12} /> Email</label>
                     <input type="email" value={formData.attendee.email} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, email: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
                 {config.attendee.phone && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1"><Smartphone size={12} /> Phone Number</label>
                     <input type="tel" value={formData.attendee.phone} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, phone: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
                 {config.attendee.gender && (
                    <CustomDropdown 
                      label="Gender"
                      value={formData.attendee.gender}
                      onChange={(val) => setFormData({...formData, attendee: {...formData.attendee, gender: val}})}
                      options={[{ value: 'MALE', label: 'MALE' }, { value: 'FEMALE', label: 'FEMALE' }]}
                    />
                 )}
                 {config.attendee.ic_passport && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1">IC No. / Passport</label>
                     <input type="text" value={formData.attendee.ic_passport} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, ic_passport: e.target.value.toUpperCase()}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
                 {config.attendee.dob && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1">Date of Birth</label>
                     <CustomCalendar selected={formData.attendee.dob ? new Date(formData.attendee.dob) : undefined} onSelect={(date) => setFormData({...formData, attendee: {...formData.attendee, dob: date.toISOString().split('T')[0]}})} />
                   </div>
                 )}
                 {config.attendee.age && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1">Age</label>
                     <input type="number" value={formData.attendee.age} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, age: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
                 {config.attendee.address && (
                   <div className="space-y-3 md:col-span-2">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1">Full Address</label>
                     <textarea value={formData.attendee.address} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, address: e.target.value.toUpperCase()}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs h-24" />
                   </div>
                 )}
                 {config.attendee.medical_status && (
                    <CustomDropdown 
                      label="Medical Health Status"
                      value={formData.attendee.medical_status}
                      onChange={(val) => setFormData({...formData, attendee: {...formData.attendee, medical_status: val}})}
                      options={[{ value: 'HEALTHY', label: 'NO KNOWN CONDITION' }, { value: 'CONDITION', label: 'HAS MEDICAL CONDITION' }]}
                    />
                 )}
                 {config.attendee.medical_details && formData.attendee.medical_status === 'CONDITION' && (
                   <div className="space-y-3 md:col-span-2">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><Stethoscope size={12} /> Medical Condition Details</label>
                     <textarea value={formData.attendee.medical_details} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, medical_details: e.target.value.toUpperCase()}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs h-24" />
                   </div>
                 )}
                 {config.attendee.emergency_name && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1 flex items-center gap-2"><PhoneCall size={12} /> Emergency Contact Name</label>
                     <input type="text" value={formData.attendee.emergency_name} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, emergency_name: e.target.value.toUpperCase()}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
                 {config.attendee.emergency_phone && (
                   <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1">Emergency Number</label>
                     <input type="tel" value={formData.attendee.emergency_phone} onChange={(e) => setFormData({...formData, attendee: {...formData.attendee, emergency_phone: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-brand/50 transition-all font-bold text-xs" />
                   </div>
                 )}
               </div>

               <div className="flex justify-between pt-8">
                 <button onClick={() => setStep(1)} className="px-10 py-5 rounded-2xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-[0.65rem] hover:bg-white/5 transition-all">Back</button>
                 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(3)} className="bg-brand text-black py-5 px-12 rounded-2xl font-black uppercase tracking-widest text-[0.7rem] flex items-center gap-3 group shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                   Next Protocol: Waiver
                   <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </motion.button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 text-center py-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-brand/10 text-brand mb-6 border border-brand/20">
                <ShieldCheck size={48} />
              </div>
              <h2 className="text-4xl font-display font-black uppercase tracking-tighter italic">Mission <span className="text-brand">Waiver</span></h2>
              <p className="text-text-secondary max-w-xl mx-auto leading-relaxed uppercase tracking-widest text-[0.65rem] font-bold">
                By proceeding, you agree to the event terms and conditions and confirm that you are physically fit to participate in this competition.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
                <button 
                  onClick={() => setStep(2)}
                  className="px-10 py-5 rounded-2xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-[0.65rem] hover:bg-white/5 transition-all"
                >
                  Previous
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(4)}
                  className="bg-brand text-black py-5 px-12 rounded-2xl font-black uppercase tracking-widest text-[0.7rem] flex items-center gap-3 group shadow-[0_0_30px_rgba(204,255,0,0.2)]"
                >
                  Confirm & Finalize
                  <CreditCard size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 text-center py-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-brand/10 text-brand mb-6 border border-brand/20 animate-pulse">
                <CreditCard size={48} />
              </div>
              <h2 className="text-4xl font-display font-black uppercase tracking-tighter italic">Fulfillment <span className="text-brand">Protocol</span></h2>
              <p className="text-text-secondary max-w-xl mx-auto leading-relaxed uppercase tracking-widest text-[0.65rem] font-bold">
                Redirecting to secure gateway for registration fulfillment: <span className="text-white">{event.title}</span>.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
                <button 
                  onClick={() => setStep(3)}
                  className="px-10 py-5 rounded-2xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-[0.65rem] hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleStep4Click}
                   className="bg-brand text-black py-6 px-16 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 group shadow-[0_0_40px_rgba(204,255,0,0.4)]"
                 >
                   Authorize RM{variant ? variant.price : event.price}.00
                 </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={16} /> Secure 256-bit SSL Registration
          </div>
          <div className="flex items-center gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 grayscale invert" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 grayscale invert" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 grayscale invert" />
          </div>
        </div>
      </div>
    </main>
  );
}
