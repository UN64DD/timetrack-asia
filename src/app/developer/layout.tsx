import { DesktopGuard } from '@/components/layout/desktop-guard';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopGuard theme="purple">
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>
    </DesktopGuard>
  );
}
