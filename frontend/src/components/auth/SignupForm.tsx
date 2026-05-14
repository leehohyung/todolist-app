import { useState, type FormEvent } from 'react';
import { useRegister } from '../../hooks/auth/useRegister';
import { useUiStore } from '../../stores/ui-store';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
} from '../../utils/validate';
import { VALIDATION } from '../../constants/messages';
import Input from '../common/Input';
import Button from '../common/Button';

const SignupForm = () => {
  const register = useRegister();
  const addToast = useUiStore((s) => s.addToast);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirm: '' });

  const validate = () => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validatePasswordMatch(password, confirm);
    setErrors({ name: nameErr, email: emailErr, password: passErr, confirm: confirmErr });
    return !nameErr && !emailErr && !passErr && !confirmErr;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    register.mutate(
      { name, email, password },
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
        label="이름"
        type="text"
        id="signup-name"
        placeholder="이름을 입력하세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        autoComplete="name"
      />
      <Input
        label="이메일"
        type="email"
        id="signup-email"
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
        id="signup-password"
        placeholder="8자 이상 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="new-password"
      />
      <Input
        label="비밀번호 확인"
        type="password"
        id="signup-confirm"
        placeholder="비밀번호를 다시 입력하세요"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
        required
        autoComplete="new-password"
      />
      <Button
        type="submit"
        variant="primary"
        isLoading={register.isPending}
        className="w-full mt-2"
      >
        회원가입
      </Button>
    </form>
  );
};

export default SignupForm;
