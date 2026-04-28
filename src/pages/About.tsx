import { motion } from 'framer-motion';
import { 
  Shield, Zap, Activity, CalendarRange, Users, Lock, 
  BarChart3, Target, Crown, UserCheck, Layout, 
  Cpu, Database, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  
  const roles = [
    {
      level: "00",
      role: t('about.roles.level0'),
      subtitle: "Full System Control",
      icon: <Crown className="text-brand" size={24} />,
      desc: t('about.roles.desc0'),
      clearance: "LEVEL 0",
      accent: "from-brand/20 to-transparent"
    },
    {
      level: "01",
      role: t('about.roles.level1'),
      subtitle: "Platform Management",
      icon: <Shield className="text-blue-500" size={24} />,
      desc: t('about.roles.desc1'),
      clearance: "LEVEL 1",
      accent: "from-blue-500/10 to-transparent"
    },
    {
      level: "02",
      role: t('about.roles.level2'),
      subtitle: "Event Logistics",
      icon: <Layout className="text-green-500" size={24} />,
      desc: t('about.roles.desc2'),
      clearance: "LEVEL 2",
      accent: "from-green-500/10 to-transparent"
    },
    {
      level: "03",
      role: t('about.roles.level3'),
      subtitle: "User Profile",
      icon: <UserCheck className="text-white" size={24} />,
      desc: t('about.roles.desc3'),
      clearance: "LEVEL 3",
      accent: "from-white/5 to-transparent"
    }
  ];

  const features = [
    { icon: <Shield size={20} />, title: t('about.roadmap.1.title'), desc: t('about.roadmap.1.desc') },
    { icon: <Zap size={20} />, title: t('about.roadmap.3.title'), desc: t('about.roadmap.3.desc') },
    { icon: <Activity size={20} />, title: t('about.roadmap.4.title'), desc: t('about.roadmap.4.desc') },
    { icon: <CalendarRange size={20} />, title: t('about.roadmap.5.title'), desc: t('about.roadmap.5.desc') },
    { icon: <Users size={20} />, title: t('about.roadmap.1.title'), desc: t('about.roadmap.1.desc') },
    { icon: <Lock size={20} />, title: t('about.roadmap.2.title'), desc: t('about.roadmap.2.desc') },
    { icon: <BarChart3 size={20} />, title: t('about.roadmap.6.title'), desc: t('about.roadmap.6.desc') },
    { icon: <Target size={20} />, title: t('about.roadmap.3.title'), desc: t('about.roadmap.3.desc') }
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-40 pb-32 px-6 lg:px-12">
      {/* Background Grid & FX */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header Section */}
        <header className="mb-32 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-brand font-black uppercase tracking-[0.4em] text-[10px]"
          >
            <Cpu size={14} />
            <span>{t('about.hero.title')}</span>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl lg:text-9xl font-display font-black uppercase tracking-tighter leading-[0.85] italic"
            >
              {t('about.hero.title').split(' ')[0]} <br />
              <span className="text-brand">{t('about.hero.title').split(' ').slice(1).join(' ')}</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl pb-4"
            >
              <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed">
                {t('about.hero.desc')}
              </p>
            </motion.div>
          </div>
        </header>

        {/* Mission Overview */}
        <section className="mb-48">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 to-transparent rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-20 overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Database size={400} className="text-brand" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                <div className="lg:col-span-7 space-y-8">
                  <div className="inline-flex items-center gap-4 py-2 px-4 bg-brand/10 rounded-xl text-brand">
                    <Zap size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('about.intel.title')}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic leading-none">
                    {t('home.ready')} <br />
                    <span className="text-brand/50">{t('home.dominate')}</span>
                  </h2>
                  <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light">
                    {t('about.intel.desc')}
                  </p>
                </div>
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="p-8 bg-white/[0.02] border-l-2 border-brand rounded-r-3xl">
                    <p className="text-lg md:text-xl text-white/40 leading-relaxed italic font-light">
                      "{t('about.intel.quote')}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Access Levels */}
        <section className="mb-48 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <span className="text-brand text-[10px] font-black uppercase tracking-[0.5em]">{t('about.hierarchy.subtitle')}</span>
              <h2 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter italic leading-none">
                {t('about.hierarchy.title').split(' ')[0]} <br />
                <span className="text-brand">{t('about.hierarchy.title').split(' ').slice(1).join(' ')}</span>
              </h2>
            </div>
            <p className="max-w-xs text-[10px] text-white/30 font-black uppercase tracking-[0.2em] leading-relaxed text-right">
              {t('about.intel.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role, i) => (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 hover:border-brand/40 transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative flex flex-col h-full gap-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black tracking-widest text-white/20 group-hover:text-brand transition-colors">ACCESS_{role.clearance}</span>
                      <h3 className="text-4xl font-display font-black uppercase tracking-tighter italic">{role.role}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/60">{role.subtitle}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl text-white group-hover:text-brand transition-colors">
                      {role.icon}
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/40 font-light leading-relaxed">
                    {role.desc}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{role.clearance}</span>
                    <ChevronRight size={14} className="text-white/10 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Services */}
        <section className="space-y-16">
          <div className="text-center space-y-6">
            <span className="text-brand text-[10px] font-black uppercase tracking-[0.5em]">{t('about.features.subtitle')}</span>
            <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
              {t('about.features.title').split(' ')[0]} <span className="text-brand">{t('about.features.title').split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] hover:border-brand/30 hover:bg-[#0d0d0d] transition-all group"
              >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-brand group-hover:bg-brand group-hover:text-black transition-all duration-500">
                  {feature.icon}
                </div>
                <h4 className="text-base font-display font-black uppercase tracking-tight mb-3 italic">{feature.title}</h4>
                <p className="text-[11px] text-white/40 leading-relaxed font-medium uppercase tracking-widest">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-48">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand rounded-[3rem] p-12 md:p-24 text-black text-center space-y-8 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,black_20px,black_40px)]" />
             </div>
             
             <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter italic relative z-10 leading-[0.85]">
                {t('home.cta.ready')}
             </h2>
             <p className="text-black/60 text-lg md:text-xl font-black uppercase tracking-widest relative z-10">
                {t('about.cta.title')} {t('about.cta.title_span')}
             </p>
             <button className="px-12 py-5 bg-black text-brand font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl relative z-10">
                {t('home.cta.join')}
             </button>
          </motion.div>
        </section>
      </div>
    </main>
  );
}


