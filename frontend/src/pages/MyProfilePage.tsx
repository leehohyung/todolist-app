import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { useUpdateProfile } from '../hooks/auth/useUpdateProfile';
import { useUiStore } from '../stores/ui-store';
import { useAuthStore } from '../stores/auth-store';
import { validateName, validatePassword, validatePasswordMatch } from '../utils/validate';
import { AUTH } from '../constants/messages';
import Header from '../components/common/Header';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const MyProfilePage = () => {
  const { userName } = useAuth();
  const updateProfile = useUpdateProfile();
  const addToast = useUiStore((s) => s.addToast);
  const setTokens = useAuthStore((s) => s.setTokens);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const userId = useAuthStore((s) => s.userId);

  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwErrors, setPwErrors] = useState({ current: '', newPw: '', confirm: '' });

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateName(newName);
    if (err) { setNameError(err); return; }
    setNameError('');

    updateProfile.mutate(
      { name: newName.trim() },
      {
        onSuccess: (user) => {
          addToast('success', AUTH.PROFILE_UPDATE_SUCCESS);
          if (accessToken && refreshToken && userId) {
            setTokens(accessToken, refreshToken, userId, user.name);
          }
          setNewName('');
        },
        onError: () => addToast('error', '저장 중 오류가 발생했습니다.'),
      },
    );
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const currentErr = currentPw ? '' : '현재 비밀번호를 입력해 주세요.';
    const newErr = validatePassword(newPw);
    const confirmErr = validatePasswordMatch(newPw, confirmPw);
    setPwErrors({ current: currentErr, newPw: newErr, confirm: confirmErr });
    if (currentErr || newErr || confirmErr) return;

    updateProfile.mutate(
      { currentPassword: currentPw, newPassword: newPw },
      {
        onSuccess: () => {
          addToast('success', AUTH.PROFILE_UPDATE_SUCCESS);
          setCurrentPw('');
          setNewPw('');
          setConfirmPw('');
          setPwErrors({ current: '', newPw: '', confirm: '' });
        },
        onError: () => addToast('error', AUTH.WRONG_CURRENT_PASSWORD),
      },
    );
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header />

      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-text-primary">마이페이지</h1>

        <section className="bg-white rounded-lg shadow-card border border-border p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">이름 변경</h2>
          <form onSubmit={handleNameSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="현재 이름"
              value={userName ?? ''}
              readOnly
              id="current-name"
              className="bg-bg-secondary cursor-not-allowed"
            />
            <Input
              label="새 이름"
              id="new-name"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); if (nameError) setNameError(''); }}
              error={nameError}
              required
              placeholder="변경할 이름을 입력하세요"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={updateProfile.isPending}>
                저장
              </Button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow-card border border-border p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">비밀번호 변경</h2>
          <form onSubmit={handlePasswordSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="현재 비밀번호"
              type="password"
              id="current-pw"
              value={currentPw}
              onChange={(e) => { setCurrentPw(e.target.value); if (pwErrors.current) setPwErrors((p) => ({ ...p, current: '' })); }}
              error={pwErrors.current}
              required
              placeholder="현재 비밀번호를 입력하세요"
              autoComplete="current-password"
            />
            <Input
              label="새 비밀번호"
              type="password"
              id="new-pw"
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); if (pwErrors.newPw) setPwErrors((p) => ({ ...p, newPw: '' })); }}
              error={pwErrors.newPw}
              required
              placeholder="8자 이상 입력하세요"
              autoComplete="new-password"
            />
            <Input
              label="비밀번호 확인"
              type="password"
              id="confirm-pw"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); if (pwErrors.confirm) setPwErrors((p) => ({ ...p, confirm: '' })); }}
              error={pwErrors.confirm}
              required
              placeholder="새 비밀번호를 다시 입력하세요"
              autoComplete="new-password"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={updateProfile.isPending}>
                저장
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default MyProfilePage;
