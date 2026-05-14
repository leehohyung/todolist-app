import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl" aria-hidden="true">📋</span>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">TodoListApp</h1>
          <p className="mt-1 text-sm text-text-secondary">로그인하여 할일을 관리하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-border p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          아직 계정이 없으신가요?{' '}
          <Link to="/signup" className="text-accent font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
