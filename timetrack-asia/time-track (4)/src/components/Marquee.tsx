import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

export default function Marquee() {
  const { t } = useLanguage();
  
  return (
    <div className="relative py-4 bg-brand overflow-hidden -rotate-2 scale-105 z-20">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-20"
      >
        {[...Array(20)].map((_, i) => (
          <span key={i} className="text-3xl md:text-5xl font-display font-black tracking-tighter text-black uppercase select-none">
            {t('marquee.text')} // {t('marquee.text')}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
