'use client';

import Link from 'next/link';
import { useLanguage } from '@/providers/language-provider';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-sm">TT</span>
              </div>
              <span className="font-display text-lg font-black tracking-tighter">
                TIME<span className="text-brand">TRACK</span>
              </span>
            </div>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
              {t('footer.copyright')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/70 mb-4">
              {t('footer.explore')}
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { href: '/', label: 'nav.home' },
                { href: '/about', label: 'nav.about' },
                { href: '/contact', label: 'nav.contact' },
                { href: '/organizer/login', label: 'Organizer Access' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand transition-colors"
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/70 mb-4">
              {t('footer.policy')}
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/privacy-policy"
                className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand transition-colors"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                href="/refund-policy"
                className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand transition-colors"
              >
                {t('footer.refund')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-brand/50 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-brand/30 rounded-full animate-pulse [animation-delay:0.5s]" />
            <div className="w-2 h-2 bg-brand/10 rounded-full animate-pulse [animation-delay:1s]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
