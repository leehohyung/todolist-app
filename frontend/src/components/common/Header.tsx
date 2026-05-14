import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';
import { useLogout } from '../../hooks/auth/useLogout';

const NAV_ITEMS = [
  { to: '/todos', label: '할일' },
  { to: '/categories', label: '카테고리' },
  { to: '/profile', label: '마이페이지' },
];

const Header = () => {
  const { userName } = useAuth();
  const { logout } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/todos" className="text-lg font-bold text-text-primary flex items-center gap-1">
          <span>📋</span>
          <span>TodoListApp</span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-6" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {userName && (
            <span className="text-sm text-text-secondary font-medium">{userName}님</span>
          )}
          <button
            type="button"
            onClick={logout}
            className="text-sm text-text-secondary hover:text-danger transition-colors font-medium"
          >
            로그아웃
          </button>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-3 animate-fade-in">
          {userName && (
            <span className="text-sm text-text-secondary font-medium">{userName}님</span>
          )}
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); logout(); }}
            className="text-sm text-left text-danger font-medium"
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
