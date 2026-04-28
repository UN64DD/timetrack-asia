import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import CrypticText from './CrypticText';
import { useRef } from 'react';

export default function Hero() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  
  // Scale down from 1 to 0.8 as scroll goes from 0 to 500
  const scale = useTransform(scrollY, [0, 500], [1, 0.85]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.5]);
  const y = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 brightness-90 contrast-110 saturate-120"
        >
          <source src="/src/assets/hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          style={{ scale, opacity, y }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-3xl"
        >
          <h1 className="text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] font-display font-extrabold mb-8 tracking-tighter uppercase">
            <CrypticText text={t('hero.title1')} /> <br /> 
            <span className="text-brand"><CrypticText text={t('hero.title2')} /></span> 
            {' '}<CrypticText text={t('hero.title3')} />
          </h1>
          <p className="text-text-secondary text-base md:text-xl mb-10 leading-relaxed font-light max-w-xl">
            <CrypticText text={t('hero.desc')} />
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
            <a href="/events" className="btn-primary group flex items-center justify-center gap-2 w-full sm:w-auto">
              <CrypticText text={t('hero.cta1')} />
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
            <a href="/login" className="px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-[4px] hover:bg-white/10 hover:border-brand/50 transition-all duration-300 uppercase text-sm font-bold tracking-wider w-full sm:w-auto text-white text-center">
              <CrypticText text={t('hero.cta2')} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
