import { motion } from 'framer-motion';
import { 
  Shield, Zap, Activity, CalendarRange, Users, Lock, 
  BarChart3, Target, Crown, UserCheck, Layout, 
  ArrowUpRight, Brain, Cpu, Database
} from 'lucide-react';
import CrypticText from '../components/CrypticText';
import { useLanguage } from '../lib/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  
  const roles = [
    {
      role: "Root",
      subtitle: "Super Admin Control",
      icon: <Crown className="text-brand" size={32} />,
      desc: "Full access to all data and system settings. Manage users (admins, organizers, athletes), override events, pricing, and orders. Absolute access to logs and analytics.",
      clearance: "LEVEL 0 - SUPREME"
    },
    {
      role: "Admin",
      subtitle: "Platform Governance",
      icon: <Shield className="text-blue-500" size={32} />,
      desc: "Approve or reject events created by organizers. Edit event details, manage orders and refunds, and monitor platform-wide analytics.",
      clearance: "LEVEL 1 - AUTHORITY"
    },
    {
      role: "Organizer",
      subtitle: "Event Logistics",
      icon: <Layout className="text-green-500" size={32} />,
      desc: "Create and manage their own events. Add variants (distance, categories, ticket types), set pricing, participant limits, and upload race results.",
      clearance: "LEVEL 2 - OPERATIONAL"
    },
    {
      role: "Athlete",
      subtitle: "End-User Profile",
      icon: <UserCheck className="text-white" size={32} />,
      desc: "Register, browse events, manage cart, checkout securely, and view their registrations and certified results.",
      clearance: "LEVEL 3 - PARTICIPANT"
    }
  ];

  const features = [
    { icon: <Shield size={24} />, title: "All-in-One Platform", desc: "Centralized system for managing sports events, registrations, and communication." },
    { icon: <Zap size={24} />, title: "Seamless Registration", desc: "Easy sign-up, category selection, and secure payment process." },
    { icon: <Activity size={24} />, title: "Real-Time Data Access", desc: "Instant participant info for faster and smarter event coordination." },
    { icon: <CalendarRange size={24} />, title: "Automated Scheduling", desc: "Dynamic schedules with real-time updates and notifications." },
    { icon: <Users size={24} />, title: "Team Management", desc: "Simple profile handling, tracking progress, and managing teams." },
    { icon: <Lock size={24} />, title: "Scalable & Secure", desc: "Built to handle both small local events and large international races." },
    { icon: <BarChart3 size={24} />, title: "Insights & Analytics", desc: "Track trends, monitor performance, and improve future events." },
    { icon: <Target size={24} />, title: "User Experience", desc: "Clean, intuitive interface for organizers, teams, and participants." }
  ];

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-brand/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-4"
          >
            <Cpu size={16} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol: Information Architecture</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[10rem] font-display font-black uppercase tracking-tighter leading-[0.8] italic"
          >
            {t('about.hero.title').split(' ').map((word, i) => (
              <span key={i} className={word === 'TIME' ? 'text-brand' : ''}>
                {word} {i === 1 ? <br /> : ''}
              </span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl font-light text-white/60 max-w-4xl mx-auto leading-relaxed"
          >
            {t('about.hero.desc')}
          </motion.p>
        </div>

        {/* Brain Overview */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/5 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group hover:border-brand/20 transition-all duration-700"
          >
             <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain size={300} className="text-brand" />
             </div>
             
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                         <Database size={24} className="text-black" />
                      </div>
                      <h2 className="text-4xl font-display font-black uppercase tracking-tighter italic">{t('about.intel.title')}</h2>
                   </div>
                   <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                    {t('about.intel.desc')}
                   </p>
                </div>
                <div className="flex flex-col justify-center">
                   <p className="text-lg text-white/40 leading-relaxed italic border-l-4 border-brand pl-8">
                    "{t('about.intel.quote')}"
                   </p>
                </div>
             </div>
          </motion.div>
        </section>

        {/* User Roles Section */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter">
              {t('about.hierarchy.title').split(' ')[0]} <span className="text-brand italic">{t('about.hierarchy.title').split(' ')[1]}</span>
            </h2>
            <p className="text-white/40 uppercase tracking-[0.3em] font-black text-[10px]">{t('about.hierarchy.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roles.map((role, i) => (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] space-y-8 hover:border-brand/40 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">{role.icon}</div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl w-fit group-hover:bg-brand/10 transition-colors">
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-display font-black uppercase tracking-tighter italic">{role.role}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand">{role.subtitle}</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 font-bold uppercase leading-relaxed tracking-widest h-24">
                  {role.desc}
                </p>
                <div className="pt-6 border-t border-white/5">
                   <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">{role.clearance}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter italic">
              {t('about.features.title').split(' ')[0]} <span className="text-brand">{t('about.features.title').split(' ')[1]}</span>
            </h2>
            <p className="text-white/40 uppercase tracking-[0.3em] font-black text-[10px]">{t('about.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-brand/30 transition-all group"
              >
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-6 text-brand group-hover:bg-brand group-hover:text-black transition-all duration-500">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-display font-black uppercase tracking-tight mb-3 italic">{feature.title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed font-black uppercase tracking-widest">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
