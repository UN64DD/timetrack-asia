import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, Globe, RefreshCcw, Mail } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function PrivacyPolicy() {
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
            <Shield size={16} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol: Data Protection</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter italic leading-none"
          >
            {t('privacy.hero').split(' ')[0]} <span className="text-brand">{t('privacy.hero').split(' ')[1]}</span>
          </motion.h1>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.5em]">{t('policy.last_updated')}: December 2024</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                <Eye size={20} />
              </div>
              <h2 className="text-3xl font-display font-black uppercase tracking-tight italic">{t('policy.overview')}</h2>
            </div>
            <div className="text-white/60 leading-relaxed font-light space-y-4 text-lg">
              <p>
                This Privacy Policy outlines our policies and procedures regarding the collection, use, and disclosure of your information when you use our Service. It also explains your privacy rights and how the law protects you.
              </p>
              <p>
                We use your personal data to provide and enhance the Service. By using the Service, you consent to the collection and use of information as described in this Privacy Policy.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                <Shield size={20} />
              </div>
              <h2 className="text-3xl font-display font-black uppercase tracking-tight italic">{t('privacy.pdpa_title')}</h2>
            </div>
            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-wider">Personal Data Protection Act, 2010 (PDPA) of Act 709</h3>
              <p className="text-white/60 leading-relaxed font-light">
                By providing any information, personal or otherwise, of yourself or any other person you are registering, in order to sign up for the Event or any related activity involving timetrack.asia (the “solution provider”), Event Organizer (our partner) and the Event sponsors (if any), you and/or any person you are registering are deemed to agree to the following terms:
              </p>
              <ul className="space-y-4">
                {[
                  "The Personal Data of the Registered Parties will be used by timetrack.asia for the purpose of sending communications, including but not limited to direct mailers, emails, SMS, and/or telephone calls.",
                  "timetrack.asia may engage third-party service providers to process the Registered Parties’ Personal Data. These third parties are contractually required to use the Personal Data solely for purposes specified here.",
                  "Registered Parties have the right at any time to: Withdraw consent, Request correction/updating, or Raise general queries."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start text-white/80">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl space-y-4 hover:border-brand/20 transition-colors group">
              <Lock className="text-brand group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight italic">{t('privacy.retention')}</h3>
              <p className="text-white/40 text-xs leading-relaxed uppercase font-bold tracking-widest">
                We retain your Personal Data only as long as necessary for the purposes set out in this Privacy Policy. Usage Data may be retained for shorter periods.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl space-y-4 hover:border-brand/20 transition-colors group">
              <Globe className="text-brand group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight italic">{t('privacy.transfer')}</h3>
              <p className="text-white/40 text-xs leading-relaxed uppercase font-bold tracking-widest">
                Your Personal Data may be transferred to and stored on computers located outside of your jurisdiction. By submitting information, you consent to such transfers.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl space-y-4 hover:border-brand/20 transition-colors group">
              <Trash2 className="text-brand group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight italic">{t('privacy.deletion')}</h3>
              <p className="text-white/40 text-xs leading-relaxed uppercase font-bold tracking-widest">
                You have the right to request deletion of Personal Data that timetrack.asia has collected about you.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl space-y-4 hover:border-brand/20 transition-colors group">
              <RefreshCcw className="text-brand group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight italic">{t('privacy.changes')}</h3>
              <p className="text-white/40 text-xs leading-relaxed uppercase font-bold tracking-widest">
                We may update this Privacy Policy from time to time. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>
          </section>

          <section className="bg-brand/10 border border-brand/20 p-12 rounded-[3rem] text-center space-y-6">
            <Mail className="mx-auto text-brand" size={48} />
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter italic">{t('policy.contact_us')}</h2>
            <p className="text-white/60 font-light">If you have any questions about this Privacy Policy, please contact us:</p>
            <a href="mailto:timetrack.asia@gmail.com" className="block text-2xl font-black text-brand hover:text-white transition-colors">
              timetrack.asia@gmail.com
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
