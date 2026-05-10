import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

export default function LoadingScreen() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + (Math.random() * 15);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }}
      className="fixed inset-0 z-[1000] bg-dark-bg flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-12"
        >
          <img 
            src="https://www.timetrack.asia/wp-content/uploads/2024/12/TIme-Track-logo-01-2-2048x542.png" 
            alt="Time Track" 
            referrerPolicy="no-referrer"
            className="h-10 md:h-16 w-auto object-contain"
          />
        </motion.div>

        <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-brand shadow-[0_0_15px_rgba(204,255,0,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[0.6rem] uppercase tracking-[0.4em] font-black text-white/20">{t('loading.init')}</span>
          <span className="text-[0.6rem] uppercase tracking-[0.4em] font-black text-brand">{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
