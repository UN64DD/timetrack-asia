'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Check, Loader2, Tag, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createRegistrationAction } from '@/lib/server/actions/registration.actions';
import { useValidateCoupon } from '@/hooks/use-coupons';
import { toast } from 'sonner';

interface ParticipantForm {
  category_id: string;
  full_name: string;
  bib_name: string;
  email: string;
  phone: string;
  gender: string;
  ic_passport: string;
  dob: string;
  age: number | null;
  address: string;
  postcode: string;
  country: string;
  medical_status: boolean;
  medical_details: string;
  emergency_name: string;
  emergency_phone: string;
}

const emptyParticipant = (categoryId: string): ParticipantForm => ({
  category_id: categoryId,
  full_name: '', bib_name: '', email: '', phone: '', gender: '',
  ic_passport: '', dob: '', age: null, address: '', postcode: '',
  country: 'Malaysia', medical_status: false, medical_details: '',
  emergency_name: '', emergency_phone: '',
});

export default function RegisterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const validateCoupon = useValidateCoupon();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [billing, setBilling] = useState({ first_name: '', phone: '', email: '', country: 'Malaysia', city: '', postcode: '' });
  const [participants, setParticipants] = useState<ParticipantForm[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*, event_categories(*)')
        .eq('id', id)
        .single();
      return data;
    },
  });

  const categories = (event?.event_categories as any[]) || [];
  const totalAmount = participants.reduce((sum, p) => {
    const cat = categories.find(c => c.id === p.category_id);
    return sum + (cat ? Number(cat.base_price) : 0);
  }, 0);
  const discountAmount = couponResult?.discount_amount ? Number(couponResult.discount_amount) : 0;
  const netAmount = Math.max(0, totalAmount - discountAmount);

  const handleAddParticipant = (categoryId: string) => {
    setParticipants(prev => [...prev, emptyParticipant(categoryId)]);
  };

  const handleRemoveParticipant = (idx: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== idx));
    setCouponResult(null);
    setCouponCode('');
  };

  const handleParticipantChange = (idx: number, field: keyof ParticipantForm, value: any) => {
    setParticipants(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponResult(null);

    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        eventId: id,
        orderAmount: totalAmount,
      });

      if (result?.valid) {
        setCouponResult(result);
        toast.success(`Coupon applied! You save RM${Number(result.discount_amount).toFixed(2)}`);
      } else {
        setCouponError(result?.error || 'Invalid coupon');
        toast.error(result?.error || 'Invalid coupon');
      }
    } catch (err) {
      setCouponError((err as Error).message);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('eventId', id);
      fd.append('billing', JSON.stringify(billing));
      fd.append('participants', JSON.stringify(participants));
      if (couponResult) fd.append('couponCode', couponCode);

      const result = await createRegistrationAction(fd);
      toast.success('Registration successful!');
      router.push(`/profile`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-brand" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/30">Event not found</p></div>;

  const totalSteps = 3;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step >= s ? 'bg-brand text-black' : 'bg-white/5 text-white/30'
              }`}>{step > s ? <Check size={16} /> : s}</div>
              {s < totalSteps && <div className={`w-16 h-0.5 transition-all ${step > s ? 'bg-brand' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-2">{event.title}</h1>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Step 1: Select Categories & Participants</p>
              </div>

              <div className="space-y-4">
                {categories.map(cat => {
                  const count = participants.filter(p => p.category_id === cat.id).length;
                  const isFull = cat.max_slots && count >= cat.max_slots;

                  return (
                    <div key={cat.id} className="glass rounded-2xl p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">{cat.name}</h3>
                        <p className="text-[10px] text-white/30 mt-1">
                          {cat.description && `${cat.description} • `}
                          RM{Number(cat.base_price).toFixed(2)}
                          {cat.max_slots && ` • ${cat.max_slots - count} slots left`}
                          {cat.min_age && ` • Min ${cat.min_age}yrs`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {count > 0 && (
                          <span className="text-xs font-black text-brand">{count}x</span>
                        )}
                        <button onClick={() => handleAddParticipant(cat.id)} disabled={isFull}
                          className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                            isFull ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-brand/10 text-brand hover:bg-brand/20'
                          }`}
                        >{isFull ? 'Full' : 'Add'}</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {participants.length > 0 && (
                <div className="mt-8 glass rounded-2xl p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                    Participants ({participants.length})
                  </p>
                  {participants.map((p, i) => {
                    const cat = categories.find(c => c.id === p.category_id);
                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <span className="text-xs font-black uppercase tracking-widest text-blue-500">{cat?.name}</span>
                          <span className="ml-2 text-xs text-white/50">#{i + 1}</span>
                        </div>
                        <button onClick={() => handleRemoveParticipant(i)}
                          className="p-1 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500"
                        ><X size={14} /></button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 text-center">
                <button onClick={() => setStep(2)} disabled={participants.length === 0}
                  className="btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >Next: Billing <ArrowRight size={16} /></button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-2">Billing Details</h1>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Step 2: Enter your billing information</p>
              </div>

              <div className="glass rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label-text">Full Name</label>
                    <input type="text" value={billing.first_name} onChange={e => setBilling(p => ({ ...p, first_name: e.target.value }))}
                      required className="input-field" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="label-text">Email</label>
                    <input type="email" value={billing.email} onChange={e => setBilling(p => ({ ...p, email: e.target.value }))}
                      required className="input-field" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="label-text">Phone</label>
                    <input type="tel" value={billing.phone} onChange={e => setBilling(p => ({ ...p, phone: e.target.value }))}
                      required className="input-field" placeholder="+60XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="label-text">City</label>
                    <input type="text" value={billing.city} onChange={e => setBilling(p => ({ ...p, city: e.target.value }))}
                      className="input-field" placeholder="City" />
                  </div>
                  <div>
                    <label className="label-text">Postcode</label>
                    <input type="text" value={billing.postcode} onChange={e => setBilling(p => ({ ...p, postcode: e.target.value }))}
                      className="input-field" placeholder="Postcode" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Country</label>
                    <select value={billing.country} onChange={e => setBilling(p => ({ ...p, country: e.target.value }))}
                      className="input-field">
                      <option value="Malaysia">Malaysia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button onClick={() => setStep(1)} className="btn-secondary text-sm"><ArrowLeft size={16} /> Back</button>
                <button onClick={() => setStep(3)} disabled={!billing.first_name || !billing.email || !billing.phone}
                  className="btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >Next: Review <ArrowRight size={16} /></button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-2">Review & Pay</h1>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Step 3: Review your registration</p>
              </div>

              {/* Coupon */}
              <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-brand" />
                  <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value); setCouponResult(null); setCouponError(''); }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-brand/50 transition-all"
                    placeholder="Enter coupon code" />
                  <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || validateCoupon.isPending}
                    className="btn-primary !py-3 text-[10px] disabled:opacity-30"
                  >{validateCoupon.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}</button>
                </div>
                {couponResult && <p className="mt-2 text-[10px] text-green-500 font-bold">Coupon applied! -RM{Number(couponResult.discount_amount).toFixed(2)}</p>}
                {couponError && <p className="mt-2 text-[10px] text-red-500 font-bold">{couponError}</p>}
              </div>

              {/* Order Summary */}
              <div className="glass rounded-2xl p-6 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Order Summary</p>
                {participants.map((p, i) => {
                  const cat = categories.find(c => c.id === p.category_id);
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-white/70">{cat?.name} x 1</span>
                      <span className="text-xs font-bold">RM{Number(cat?.base_price || 0).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between py-2 mt-2">
                  <span className="text-xs text-white/30">Subtotal</span>
                  <span className="text-xs">RM{totalAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-green-500">Discount</span>
                    <span className="text-xs text-green-500">-RM{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-t border-white/10 mt-2">
                  <span className="text-sm font-black uppercase tracking-tight">Total</span>
                  <span className="text-lg font-black text-brand">RM{netAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setStep(2)} className="btn-secondary text-sm"><ArrowLeft size={16} /> Back</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="btn-primary text-sm disabled:opacity-30"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitting ? 'Processing...' : netAmount > 0 ? `Pay RM${netAmount.toFixed(2)}` : 'Complete Registration'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
