/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import CrypticText from '../components/CrypticText';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-80px)] pt-20 pb-10 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-dark-bg/40 backdrop-blur-xl p-8 md:p-12 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand mb-6 border border-brand/20">
              <KeyRound size={32} />
            </div>
            
            <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-3">
              <CrypticText text={t('forgot.title')} />
            </h1>
            <p className="text-text-secondary text-xs font-medium leading-relaxed">
              {t('forgot.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-brand ml-1">
                {t('login.email')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-brand text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all mt-4"
            >
              {t('forgot.button')}
            </motion.button>

            <div className="text-center pt-6">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-widest hover:text-brand transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                {t('forgot.back')}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
