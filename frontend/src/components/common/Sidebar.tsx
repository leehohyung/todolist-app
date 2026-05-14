import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';
import { useLogout } from '../../hooks/auth/useLogout';

const CheckSquareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const navItems = [
  { to: '/todos', label: '내 할일', icon: <ListIcon /> },
  { to: '/categories', label: '카테고리', icon: <TagIcon /> },
  { to: '/profile', label: '내 정보', icon: <UserIcon /> },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const { userName } = useAuth();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
      isActive
        ? 'bg-sidebar-active text-text-primary font-medium'
        : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'
    }`;

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5">
        <NavLink to="/todos" onClick={onClose} className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
            <CheckSquareIcon />
          </div>
          <span className="font-semibold text-text-primary text-sm tracking-tight">TodoList</span>
        </NavLink>
      </div>

      <nav className="flex-1 px-2 space-y-0.5" aria-label="주요 메뉴">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass} onClick={onClose}>
            <span className="text-text-muted">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-4 border-t border-border pt-3 mt-2">
        {userName && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold shrink-0">
              {userName.charAt(0)}
            </div>
            <span className="text-sm text-text-primary font-medium truncate">{userName}</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-sidebar-hover hover:text-danger transition-colors"
        >
          <LogoutIcon />
          로그아웃
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({ mobileOpen = false, onMobileClose }: SidebarProps) => {
  return (
    <>
      <aside className="hidden md:flex md:w-[240px] md:flex-col md:fixed md:inset-y-0 bg-sidebar-bg border-r border-border z-30">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} aria-hidden="true" />
          <div className="relative w-[240px] bg-sidebar-bg border-r border-border animate-slide-in">
            <SidebarContent onClose={onMobileClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
