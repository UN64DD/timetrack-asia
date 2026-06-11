'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/providers/language-provider';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 15);
        const next = Math.min(prev + increment, 100);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
        }
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
        >
          <div className="max-w-md w-full px-8 text-center">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-black font-black text-2xl">TT</span>
            </div>

            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">
              {t('loading.init')}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
              {progress}%
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/10 mt-4">
              {t('loading.status')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
