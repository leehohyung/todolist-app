import { useState, type FormEvent } from 'react';
import { useLogin } from '../../hooks/auth/useLogin';
import { useUiStore } from '../../stores/ui-store';
import { validateEmail, validatePassword } from '../../utils/validate';
import { AUTH } from '../../constants/messages';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm = () => {
  const login = useLogin();
  const addToast = useUiStore((s) => s.addToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    return !emailErr && !passErr;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    login.mutate(
      { email, password },
      {
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          addToast('error', status === 401 ? AUTH.LOGIN_FAILED : AUTH.LOGIN_FAILED);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="이메일"
        type="email"
        id="login-email"
        placeholder="example@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
        error={errors.email}
        required
        autoComplete="email"
      />
      <Input
        label="비밀번호"
        type="password"
        id="login-password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
        error={errors.password}
        required
        autoComplete="current-password"
      />
      <Button type="submit" variant="primary" size="lg" isLoading={login.isPending} className="w-full mt-1">
        로그인
      </Button>
    </form>
  );
};

export default LoginForm;
