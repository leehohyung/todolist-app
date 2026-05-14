interface MobileTopBarProps {
  title: string;
  onMenuClick: () => void;
}

const MobileTopBar = ({ title, onMenuClick }: MobileTopBarProps) => (
  <header className="md:hidden sticky top-0 z-20 bg-white border-b border-border flex items-center gap-3 px-4 h-12">
    <button
      type="button"
      onClick={onMenuClick}
      aria-label="메뉴 열기"
      className="text-text-secondary hover:text-text-primary p-1 -ml-1 rounded-md transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
    <span className="text-sm font-semibold text-text-primary">{title}</span>
  </header>
);

export default MobileTopBar;
