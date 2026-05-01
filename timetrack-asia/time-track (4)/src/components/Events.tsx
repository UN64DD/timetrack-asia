/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import EventCard from './EventCard';
import { EVENTS } from '../constants';
import { useLanguage } from '../lib/LanguageContext';
import CrypticText from './CrypticText';

export default function Events() {
  const { t } = useLanguage();
  const upcomingEvents = EVENTS.filter(e => e.status !== 'draft');
  const archivedEvents = EVENTS.filter(e => e.status === 'draft');

  return (
    <section id="events" className="py-24 px-6 space-y-32">
      {/* Upcoming Events */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-brand text-xs font-bold tracking-[0.2em] mb-4 block uppercase"
            >
              <CrypticText text={t('events.reg_open')} />
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-extrabold"
            >
              <CrypticText text={t('events.upcoming')} /> <span className="text-brand"><CrypticText text={t('events.events')} /></span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-sm text-sm leading-relaxed"
          >
            <CrypticText text={t('events.desc')} />
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>

      {/* Event Archive */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-black uppercase"
          >
            <CrypticText text={t('events.archive')} /> <span className="text-white/20"><CrypticText text={t('events.archive_span')} /></span>
          </motion.h2>
          <div className="w-24 h-1 bg-brand/30 mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-80">
          {archivedEvents.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
