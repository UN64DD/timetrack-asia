import { ShoppingCart, Languages, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { supabase } from '../lib/supabase';
import { playTap } from '../lib/sounds';
import CrypticText from './CrypticText';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.events'), href: '/events' },
    { name: t('nav.results'), href: '/results' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'BM' : 'EN');
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-300 border-b ${
      isScrolled ? 'bg-black/95 backdrop-blur-md py-2.5 border-white/10' : 'bg-transparent py-4 md:py-6 border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://www.timetrack.asia/wp-content/uploads/2024/12/TIme-Track-logo-01-2-2048x542.png"
            alt="Time Track"
            className={`${isScrolled ? 'h-6 md:h-8' : 'h-8 md:h-10'} transition-all duration-300 w-auto object-contain`}
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.href}
                onClick={() => playTap()}
                className={`transition-all duration-300 font-bold tracking-tight hover:text-brand ${isScrolled ? 'text-[0.75rem]' : 'text-[0.8rem]'} ${location.pathname === link.href ? 'text-brand' : 'text-white/70'}`}
              >
                <CrypticText text={link.name} />
              </Link>
            </li>
          ))}
          
          <li className="flex items-center gap-2">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-white/70 font-black px-4 py-2 text-[0.7rem] uppercase tracking-widest hover:text-brand transition-all">
                  <CrypticText text="LOGIN" />
                </Link>
                <Link to="/signup" className="bg-brand text-black font-black px-5 py-2 rounded-full text-[0.7rem] uppercase tracking-widest border-2 border-brand hover:shadow-brand/20 shadow-lg">
                  <CrypticText text="SIGNUP" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {profile?.role === 'athlete' && (
                  <Link to="/profile" className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all group">
                    <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center group-hover:bg-brand/30 transition-colors">
                      <User size={14} className="text-brand" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 max-w-[80px] truncate">
                      {profile?.full_name || 'Identity'}
                    </span>
                  </Link>
                )}

                <button onClick={handleLogout} className="text-white/40 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
              </div>
            )}
          </li>

          <li>
            <button onClick={toggleLanguage} className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-brand text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <Languages size={14} />
               <CrypticText text={language} />
            </button>
          </li>
        </ul>

        {/* Persistent Mobile Action Pill */}
        <div className="flex md:hidden items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl px-3 py-1.5 rounded-full relative z-[130] shadow-xl">
           <button
             onClick={toggleLanguage}
             className="flex items-center gap-2 font-black text-brand text-[10px] px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
           >
             <Languages size={14} />
             <CrypticText text={language} />
           </button>

           <div className="w-[1px] h-4 bg-white/10 mx-1" />

           <button
             className="relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
             onClick={() => setIsOpen(!isOpen)}
           >
             <motion.span
               animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
               className="w-5 h-0.5 bg-white rounded-full block origin-center"
             />
             <motion.span
               animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
               className="w-5 h-0.5 bg-white rounded-full block"
             />
             <motion.span
               animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
               className="w-5 h-0.5 bg-white rounded-full block origin-center"
             />
           </button>
        </div>
      </div>
    </header>

    {/* Full-Screen Mobile Menu with 15px Blur */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-[15px] z-[110] flex flex-col items-center justify-center md:hidden"
        >
          {/* Subtle accent glow */}
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="flex flex-col items-center gap-10 relative z-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-4xl font-display font-black uppercase tracking-tighter hover:text-brand transition-colors"
                onClick={() => { playTap(); setIsOpen(false); }}
              >
                <CrypticText text={link.name} />
              </Link>
            ))}

             {user ? (
              <div className="flex flex-col items-center gap-6">
                 {profile?.role === 'athlete' && (
                   <Link 
                     to="/profile" 
                     onClick={() => setIsOpen(false)}
                     className="text-2xl font-display font-black uppercase tracking-tighter text-brand"
                   >
                     <CrypticText text="IDENTITY SETTINGS" />
                   </Link>
                 )}

                 <button 
                   onClick={() => { handleLogout(); setIsOpen(false); }}
                   className="text-4xl font-display font-black uppercase tracking-tighter text-red-500"
                 >
                   <CrypticText text="LOGOUT" />
                 </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <Link
                  to="/signup"
                  className="text-4xl font-display font-black uppercase tracking-tighter text-brand text-center"
                  onClick={() => setIsOpen(false)}
                >
                  <CrypticText text="SIGNUP" />
                </Link>
                <Link
                  to="/login"
                  className="text-xl font-display font-black uppercase tracking-tighter text-white/50 text-center hover:text-brand transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <CrypticText text="LOGIN" />
                </Link>
              </div>
            )}
          </div>

          <div className="absolute bottom-12 text-center opacity-40">
            <p className="text-[0.6rem] text-white uppercase tracking-[0.4em] font-black">
              Time Track Performance ©2026
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
