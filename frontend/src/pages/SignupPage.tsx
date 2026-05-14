import { Link } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white mx-auto mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary">TodoList 시작하기</h1>
          <p className="text-sm text-text-secondary mt-1">무료로 계정을 만들어보세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-border p-7">
          <SignupForm />
        </div>

        <p className="mt-5 text-center text-sm text-text-secondary">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline underline-offset-2">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
