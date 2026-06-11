'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/providers/language-provider';
import { useSupabaseAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogOut } from 'lucide-react';

const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/events', labelKey: 'nav.events' },
  { href: '/results', labelKey: 'nav.results' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/contact', labelKey: 'nav.contact' },
];

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user, loading, signOut } = useSupabaseAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">TT</span>
          </div>
          <span className="font-display text-lg font-black tracking-tighter hidden sm:block">
            TIME<span className="text-brand">TRACK</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-all hover:bg-white/5 ${
                pathname === link.href ? 'text-brand' : 'text-white/70'
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'EN' ? 'BM' : 'EN')}
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-full hover:bg-white/5 transition-all"
          >
            {language === 'EN' ? 'BM' : 'EN'}
          </button>

          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="w-8 h-8 bg-brand/20 rounded-full flex items-center justify-center hover:bg-brand/30 transition-all"
              >
                <User size={14} className="text-brand" />
              </Link>
              <button
                onClick={signOut}
                className="p-2 hover:bg-white/5 rounded-full transition-all"
              >
                <LogOut size={14} className="text-white/50" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary !py-2 !px-5 text-xs">
                {t('nav.login')}
              </Link>
              <Link href="/signup" className="btn-primary !py-2 !px-5 text-xs">
                {t('nav.signup')}
              </Link>
            </div>
          )}
        </div>

        <button
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-20 bg-black/95 backdrop-blur-2xl z-40"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-2xl font-display font-black uppercase tracking-tighter hover:text-brand transition-colors"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={() => setLanguage(language === 'EN' ? 'BM' : 'EN')}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-white/10 rounded-full"
                >
                  {language === 'EN' ? 'BM' : 'EN'}
                </button>
                {user ? (
                  <>
                    <Link href="/profile" className="btn-secondary text-xs">Profile</Link>
                    <button onClick={signOut} className="btn-primary text-xs">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn-secondary text-xs">{t('nav.login')}</Link>
                    <Link href="/signup" className="btn-primary text-xs">{t('nav.signup')}</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
