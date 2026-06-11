'use client';

import { motion } from 'motion/react';

interface MarqueeProps {
  text: string;
}

export function Marquee({ text }: MarqueeProps) {
  return (
    <div className="py-3 bg-brand -rotate-2 overflow-hidden">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: '-50%' }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="text-black font-display font-black uppercase text-sm md:text-base tracking-widest mx-8"
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
