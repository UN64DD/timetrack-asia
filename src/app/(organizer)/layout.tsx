import { DesktopGuard } from '@/components/layout/desktop-guard';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopGuard theme="blue">
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>
    </DesktopGuard>
  );
}
