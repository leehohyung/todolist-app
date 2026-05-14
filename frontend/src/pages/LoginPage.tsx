import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-accent flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">TodoList</h1>
          <p className="text-white/70 text-base leading-relaxed">
            할일을 체계적으로 관리하고<br />생산성을 높여보세요
          </p>
          <div className="mt-10 space-y-3 text-left">
            {['카테고리별 할일 분류', '마감일 관리 및 알림', '진행 상황 한눈에 파악'].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="white" className="h-3 w-3"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6 bg-bg-secondary">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary">TodoList</h1>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-border p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary">로그인</h2>
              <p className="text-sm text-text-secondary mt-1">계정에 로그인하여 할일을 관리하세요</p>
            </div>
            <LoginForm />
          </div>

          <p className="mt-5 text-center text-sm text-text-secondary">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="text-accent font-medium hover:underline underline-offset-2">
              무료로 시작하기
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
