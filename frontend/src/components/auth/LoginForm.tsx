import { useState, type FormEvent } from 'react';
import { useLogin } from '../../hooks/auth/useLogin';
import { useUiStore } from '../../stores/ui-store';
import { validateEmail, validatePassword } from '../../utils/validate';
import { VALIDATION } from '../../constants/messages';
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
        onError: () => {
          addToast('error', VALIDATION.NETWORK_ERROR);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="이메일"
        type="email"
        id="login-email"
        placeholder="example@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="current-password"
      />
      <Button
        type="submit"
        variant="primary"
        isLoading={login.isPending}
        className="w-full mt-2"
      >
        로그인
      </Button>
    </form>
  );
};

export default LoginForm;
