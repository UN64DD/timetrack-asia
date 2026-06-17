import { DesktopGuard } from '@/components/layout/desktop-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopGuard theme="red">
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>
    </DesktopGuard>
  );
}
