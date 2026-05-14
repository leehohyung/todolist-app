import { Link } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl" aria-hidden="true">📋</span>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">회원가입</h1>
          <p className="mt-1 text-sm text-text-secondary">TodoListApp에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-border p-6">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignupPage;
