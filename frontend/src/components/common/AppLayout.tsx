import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';

interface AppLayoutProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

const AppLayout = ({ title, children, action }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-secondary">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <MobileTopBar title={title} onMenuClick={() => setMobileOpen(true)} />

        <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-text-primary hidden md:block">{title}</h1>
            {action && <div className="ml-auto">{action}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
