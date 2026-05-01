import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import CrypticText from './CrypticText';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#050505] pt-24 pb-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          {/* Column 1: Identity & Registration */}
          <div>
            <img 
              src="https://www.timetrack.asia/wp-content/uploads/2024/12/TIme-Track-logo-01-2-2048x542.png" 
              alt="Time Track" 
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain mb-6"
            />
            <div className="text-[0.7rem] text-text-secondary/30 font-mono tracking-wider uppercase">
              REG: 202403230367 (003641042-V)
            </div>
          </div>

          {/* Column 2: Core Navigation */}
          <div>
            <h4 className="text-brand text-[10px] font-black tracking-[0.4em] mb-8 uppercase">{t('footer.explore')}</h4>
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-xs text-white/50 hover:text-brand transition-colors uppercase font-black tracking-widest"><CrypticText text={t('nav.home')} /></Link>
              <Link to="/about" className="text-xs text-white/50 hover:text-brand transition-colors uppercase font-black tracking-widest"><CrypticText text={t('nav.about')} /></Link>
              <Link to="/contact" className="text-xs text-white/50 hover:text-brand transition-colors uppercase font-black tracking-widest"><CrypticText text={t('nav.contact')} /></Link>
              <Link to="/login" className="text-xs text-brand hover:text-white transition-colors uppercase font-black tracking-widest">Organizer Access</Link>
            </div>
          </div>

          {/* Column 3: Legal & Policy */}
          <div>
            <h4 className="text-brand text-[10px] font-black tracking-[0.4em] mb-8 uppercase">{t('footer.policy')}</h4>
            <div className="flex flex-col gap-4">
              <a href="#" className="text-xs text-white/50 hover:text-brand transition-colors uppercase font-black tracking-widest">Privacy Policy</a>
              <a href="#" className="text-xs text-white/50 hover:text-brand transition-colors uppercase font-black tracking-widest">Return & Refund Policy</a>
            </div>
          </div>
        </div>

        <hr className="border-white/5 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-white/20 text-[0.6rem] uppercase tracking-[0.5em] font-black">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
