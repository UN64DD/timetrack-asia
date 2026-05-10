import { motion } from 'framer-motion';
import { RefreshCcw, Clock, Mail, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function RefundPolicy() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-brand/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-24 relative z-10">
        {/* Header */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-4"
          >
            <RefreshCcw size={16} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol: Return & Refund</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter italic leading-none"
          >
            {t('refund.hero').split(' ')[0]} <span className="text-brand">{t('refund.hero').split(' ')[1]}</span>
          </motion.h1>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.5em]">Policy Statement</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          <section className="bg-white/5 border border-white/5 p-10 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center text-brand">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-4xl font-display font-black uppercase tracking-tighter italic">{t('refund.intro')}</h2>
            </div>
            <p className="text-xl text-white/60 leading-relaxed font-light italic border-l-4 border-brand pl-8">
              "If, for any reason, you are not completely satisfied with the event registration, we invite You to review our policy on refunds."
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[3rem] space-y-6 hover:border-brand/40 transition-all group">
              <Clock className="text-brand group-hover:animate-pulse" size={32} />
              <h3 className="text-3xl font-display font-black uppercase tracking-tight italic">{t('refund.cancellation')}</h3>
              <p className="text-white/40 text-sm leading-relaxed font-bold uppercase tracking-widest">
                You are entitled to cancel Your event registration within 12 hours from the transaction time without giving any reason for doing so.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[3rem] space-y-6 hover:border-brand/40 transition-all group">
              <AlertCircle className="text-brand" size={32} />
              <h3 className="text-3xl font-display font-black uppercase tracking-tight italic">{t('refund.exercise')}</h3>
              <p className="text-white/40 text-sm leading-relaxed font-bold uppercase tracking-widest">
                To exercise Your right of cancellation, you must inform Us of your decision by means of a clear statement via email.
              </p>
            </div>
          </section>

          <section className="bg-white/5 border border-white/5 p-12 rounded-[3rem] space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <CreditCard size={200} className="text-brand" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <h3 className="text-3xl font-display font-black uppercase tracking-tighter italic">{t('refund.process')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand">Timeline</span>
                  <p className="text-lg text-white/80 font-medium uppercase leading-tight">
                    We will reimburse You no later than 30 days from the day on which We receive the transaction of registration.
                  </p>
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand">Method</span>
                  <p className="text-lg text-white/80 font-medium uppercase leading-tight">
                    We will use the same means of payment as You used for the Order, and You will not incur any fees for such reimbursement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-brand/10 border border-brand/20 p-12 rounded-[3rem] text-center space-y-6">
            <Mail className="mx-auto text-brand" size={48} />
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter italic">{t('policy.contact_us')}</h2>
            <p className="text-white/60 font-light italic">If you have any questions about our Returns and Refunds Policy, please contact us:</p>
            <a href="mailto:timetrack.asia@gmail.com" className="block text-2xl font-black text-brand hover:text-white transition-colors">
              timetrack.asia@gmail.com
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
