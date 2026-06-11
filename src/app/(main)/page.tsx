'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Loader2, Users, CalendarCheck, Trophy, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/providers/language-provider';
import { usePublicEvents } from '@/hooks/use-events';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { EventCard } from '@/components/events/event-card';
import { Marquee } from '@/components/shared/marquee';

export default function HomePage() {
  const { t } = useLanguage();
  const [showLoader, setShowLoader] = useState(true);
  const { data: events, isLoading } = usePublicEvents();

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showLoader) return <LoadingScreen onComplete={() => setShowLoader(false)} />;

  return (
    <div className="min-h-screen">
      <HeroSection />
      <Marquee text={t('marquee.text')} />
      <FeatureCards />
      <UpcomingEvents events={events} isLoading={isLoading} />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent z-10" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-20 text-center px-6 max-w-4xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-brand mb-6"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-6xl md:text-8xl lg:text-9xl font-display font-black uppercase tracking-tighter leading-none mb-4"
        >
          <span className="text-white">{t('hero.title1')} </span>
          <span className="text-brand">{t('hero.title2')}</span>
          <br />
          <span className="text-white">{t('hero.title3')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-sm md:text-base text-white/40 font-bold uppercase tracking-widest max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {t('hero.desc')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/events" className="btn-primary text-sm">
            {t('hero.cta1')}
            <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn-secondary text-sm">
            {t('hero.cta2')}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-brand rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}

function FeatureCards() {
  const { t } = useLanguage();

  const features = [
    { icon: Users, title: t('home.precision'), desc: t('home.precision_desc') },
    { icon: CalendarCheck, title: t('home.mgmt'), desc: t('home.mgmt_desc') },
    { icon: Trophy, title: t('home.results'), desc: t('home.results_desc') },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 group hover:bg-white/[0.07] transition-all"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon size={24} className="text-brand" />
              </div>
              <h3 className="text-lg font-display font-black uppercase tracking-tighter text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingEvents({ events, isLoading }: { events?: any[]; isLoading: boolean }) {
  const { t } = useLanguage();
  const displayEvents = events?.slice(0, 3) || [];

  return (
    <section className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-4">
            {t('events.reg_open')}
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">
            <span className="text-white">{t('events.upcoming')} </span>
            <span className="text-brand">{t('events.events')}</span>
          </h2>
          <p className="text-sm text-white/30 font-bold uppercase tracking-widest mt-4 max-w-lg mx-auto">
            {t('events.desc')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand" />
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xs font-black uppercase tracking-widest text-white/20">
              {t('events.no_found')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/events" className="btn-secondary text-sm">
            {t('events.view_more')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-brand/5" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tighter mb-8">
          {t('home.ready')}
        </h2>
        <Link href="/signup" className="btn-primary text-lg">
          {t('home.join')}
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
