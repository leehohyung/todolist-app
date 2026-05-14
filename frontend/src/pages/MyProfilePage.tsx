import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { useUpdateProfile } from '../hooks/auth/useUpdateProfile';
import { useUiStore } from '../stores/ui-store';
import { useAuthStore } from '../stores/auth-store';
import { validateName, validatePassword, validatePasswordMatch } from '../utils/validate';
import { AUTH } from '../constants/messages';
import AppLayout from '../components/common/AppLayout';
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
          setCurrentPw(''); setNewPw(''); setConfirmPw('');
          setPwErrors({ current: '', newPw: '', confirm: '' });
        },
        onError: () => addToast('error', AUTH.WRONG_CURRENT_PASSWORD),
      },
    );
  };

  return (
    <AppLayout title="내 정보">
      <div className="space-y-5">
        <div className="flex items-center gap-4 bg-white rounded-xl border border-border p-5">
          <div className="h-14 w-14 rounded-full bg-accent-light flex items-center justify-center text-accent text-xl font-bold shrink-0">
            {userName?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">{userName}</p>
            <p className="text-sm text-text-muted mt-0.5">계정 정보를 관리하세요</p>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-text-muted" aria-hidden="true">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            이름 변경
          </h2>
          <form onSubmit={handleNameSubmit} noValidate className="space-y-4">
            <Input label="현재 이름" value={userName ?? ''} readOnly id="current-name" className="bg-bg-secondary cursor-not-allowed text-text-secondary" />
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
              <Button type="submit" variant="primary" isLoading={updateProfile.isPending} size="sm">저장</Button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-text-muted" aria-hidden="true">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
            비밀번호 변경
          </h2>
          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
            <Input label="현재 비밀번호" type="password" id="current-pw" value={currentPw} onChange={(e) => { setCurrentPw(e.target.value); if (pwErrors.current) setPwErrors((p) => ({ ...p, current: '' })); }} error={pwErrors.current} required placeholder="현재 비밀번호" autoComplete="current-password" />
            <Input label="새 비밀번호" type="password" id="new-pw" value={newPw} onChange={(e) => { setNewPw(e.target.value); if (pwErrors.newPw) setPwErrors((p) => ({ ...p, newPw: '' })); }} error={pwErrors.newPw} required placeholder="8자 이상" hint="영문, 숫자 조합 8자 이상" autoComplete="new-password" />
            <Input label="비밀번호 확인" type="password" id="confirm-pw" value={confirmPw} onChange={(e) => { setConfirmPw(e.target.value); if (pwErrors.confirm) setPwErrors((p) => ({ ...p, confirm: '' })); }} error={pwErrors.confirm} required placeholder="새 비밀번호 재입력" autoComplete="new-password" />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={updateProfile.isPending} size="sm">저장</Button>
            </div>
          </form>
        </section>
      </div>
    </AppLayout>
  );
};

export default MyProfilePage;
