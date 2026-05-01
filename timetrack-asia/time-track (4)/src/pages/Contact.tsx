import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <main className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter mb-8"
        >
          {t('contact.hero.title').split(' ')[0]} <span className="text-brand">{t('contact.hero.title').split(' ').slice(1).join(' ')}</span>
        </motion.h1>
        <p className="text-xl text-text-secondary leading-relaxed mb-12 uppercase tracking-widest text-[10px] font-black">
          {t('contact.hero.desc')}
        </p>
        <a href="mailto:info@timetrack.asia" className="text-3xl font-display font-black text-brand hover:underline uppercase tracking-tight italic">
          info@timetrack.asia
        </a>
      </div>
    </main>
  );
}
