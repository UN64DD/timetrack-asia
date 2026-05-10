import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { Mail, Phone, MapPin, Send, Cpu, Globe, MessageSquare } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-40 pb-32 px-6 lg:px-12 relative overflow-hidden">
      {/* Background Grid & FX */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Left Side: Info */}
          <div className="space-y-16">
            <header className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 text-brand font-black uppercase tracking-[0.4em] text-[10px]"
              >
                <Cpu size={14} />
                <span>Channel: Communication_Node_01</span>
              </motion.div>
              
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-none italic"
                >
                  GET IN <br />
                  <span className="text-brand">TOUCH</span>
                </motion.h1>
                <p className="max-w-md text-lg text-white/40 font-light leading-relaxed">
                  Have questions about timing your next high-performance event? Our technical team is ready to assist with deployment and logistics.
                </p>
              </div>
            </header>

            <div className="space-y-10">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="flex items-center gap-6 group"
               >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand border border-white/10 group-hover:bg-brand group-hover:text-black transition-all duration-500">
                     <Mail size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t('contact.info.transmission')}</p>
                     <a href="mailto:info@timetrack.asia" className="text-xl md:text-2xl font-display font-black group-hover:text-brand transition-colors italic">info@timetrack.asia</a>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex items-center gap-6 group"
               >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand border border-white/10 group-hover:bg-brand group-hover:text-black transition-all duration-500">
                     <Globe size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t('contact.info.presence')}</p>
                     <p className="text-xl md:text-2xl font-display font-black italic">Malaysia / Singapore / SEA</p>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="flex items-center gap-6 group"
               >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand border border-white/10 group-hover:bg-brand group-hover:text-black transition-all duration-500">
                     <MessageSquare size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t('contact.info.support')}</p>
                     <p className="text-xl md:text-2xl font-display font-black italic">Mon - Fri / 0900 - 1800</p>
                  </div>
               </motion.div>
            </div>
          </div>

          {/* Right Side: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-20" />
             
             <form className="space-y-8 relative z-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">{t('contact.label.name')}</label>
                   <input 
                     type="text" 
                     placeholder="John Doe"
                     className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-brand/50 transition-all font-bold"
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">{t('contact.label.email')}</label>
                   <input 
                     type="email" 
                     placeholder="john@example.com"
                     className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-brand/50 transition-all font-bold"
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">{t('contact.label.message')}</label>
                   <textarea 
                     placeholder={t('contact.message')}
                     rows={4}
                     className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-brand/50 transition-all font-bold resize-none"
                   />
                </div>

                <button className="w-full py-6 bg-brand text-black font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/10">
                   <Send size={18} /> {t('contact.button.send')}
                </button>
             </form>

             <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-20">
                <span className="text-[8px] font-black uppercase tracking-widest text-white">SSL_ENCRYPTED</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-white">NODE_443_READY</span>
             </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

