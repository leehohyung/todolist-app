import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="text-center animate-fade-in">
        <p className="text-[96px] font-black text-bg-tertiary leading-none select-none">404</p>
        <h1 className="mt-4 text-xl font-bold text-text-primary">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-text-secondary">요청하신 페이지가 존재하지 않습니다.</p>
        <Link
          to="/todos"
          className="mt-8 inline-flex items-center gap-2 bg-accent text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          할일 목록으로 이동
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;
