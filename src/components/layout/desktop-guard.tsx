'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Laptop } from 'lucide-react';

interface DesktopGuardProps {
  children: ReactNode;
  theme?: 'blue' | 'red' | 'purple';
}

export function DesktopGuard({ children, theme = 'blue' }: DesktopGuardProps) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    const themeColors = {
      blue: { bg: 'bg-[#020617]', text: 'text-blue-500' },
      red: { bg: 'bg-[#0a0000]', text: 'text-red-500' },
      purple: { bg: 'bg-[#05000a]', text: 'text-purple-500' },
    };

    const colors = themeColors[theme];

    return (
      <div className={`min-h-screen ${colors.bg} flex flex-col items-center justify-center p-10 text-center`}>
        <div className={`w-24 h-24 ${colors.text}/10 rounded-3xl flex items-center justify-center mb-8 border border-current/20 ${colors.text}`}>
          <Laptop size={48} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white mb-4">
          Secure Terminal Required
        </h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs">
          This system is perfected for desktop resolution only. Please connect via a secure workstation.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
