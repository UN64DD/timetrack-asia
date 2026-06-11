'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard, Users, Calendar, CreditCard, Trophy,
  BarChart3, Settings, LogOut, Tag, FileText, ScrollText,
} from 'lucide-react';

interface SidebarProps {
  variant: 'admin' | 'organizer' | 'developer';
}

const adminNav = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/users', label: 'Users', icon: Users },
  { href: '/admin/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/admin/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/dashboard/refunds', label: 'Refunds', icon: ScrollText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
];

const organizerNav = [
  { href: '/organizer/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/organizer/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/organizer/dashboard/registrations', label: 'Registrations', icon: FileText },
  { href: '/organizer/dashboard/results', label: 'Results', icon: Trophy },
  { href: '/organizer/dashboard/coupons', label: 'Coupons', icon: Tag },
  { href: '/organizer/dashboard/form-templates', label: 'Forms', icon: FileText },
  { href: '/organizer/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

const developerNav = [
  { href: '/developer/dashboard', label: 'Users', icon: Users },
  { href: '/developer/dashboard/audit', label: 'Audit', icon: ScrollText },
  { href: '/developer/dashboard/db-monitor', label: 'DB Monitor', icon: BarChart3 },
];

const navMap = { admin: adminNav, organizer: organizerNav, developer: developerNav };
const colorMap = {
  admin: { hover: 'hover:bg-red-500/10 hover:text-red-500', active: 'bg-red-500/10 text-red-500', border: 'border-red-500/20' },
  organizer: { hover: 'hover:bg-blue-500/10 hover:text-blue-500', active: 'bg-blue-500/10 text-blue-500', border: 'border-blue-500/20' },
  developer: { hover: 'hover:bg-purple-500/10 hover:text-purple-500', active: 'bg-purple-500/10 text-purple-500', border: 'border-purple-500/20' },
};

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useSupabaseAuth();
  const nav = navMap[variant];
  const colors = colorMap[variant];

  return (
    <aside className="w-64 bg-[#050505] border-r border-white/10 min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">TT</span>
          </div>
          <span className="font-display text-lg font-black tracking-tighter">
            {variant === 'admin' ? 'ADMIN' : variant === 'organizer' ? 'ORGANIZER' : 'DEVELOPER'}
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isActive ? colors.active : 'text-white/40 ' + colors.hover
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white/30 hover:bg-white/5 transition-all w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
