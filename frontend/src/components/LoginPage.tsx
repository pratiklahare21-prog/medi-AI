import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

type TabMode = 'login' | 'register';

const ALLOWED_ROLES: UserRole[] = [
  'Clinical Pharmacist',
  'Prescribing Physician',
  'Formulary Director',
  'Lead Ops Admin',
  'Patient / Consumer'
];

const TITLE_FOR_ROLE: Record<UserRole, string> = {
  'Lead Ops Admin': 'Operations Lead',
  'Clinical Pharmacist': 'Licensed Clinical Pharmacist',
  'Prescribing Physician': 'Medical Officer',
  'Formulary Director': 'Pharmacy Director',
  'Patient / Consumer': 'Patient / Beneficiary'
};

const passwordRules = (pwd: string): { ok: boolean; label: string }[] => [
  { ok: pwd.length >= 8, label: '8 characters minimum' },
  { ok: /[a-z]/.test(pwd), label: 'One lowercase letter' },
  { ok: /[A-Z]/.test(pwd), label: 'One uppercase letter' },
  { ok: /[0-9]/.test(pwd), label: 'One number' },
  { ok: /[^A-Za-z0-9]/.test(pwd), label: 'One special character' }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage: React.FC = () => {
  const { login, register, loading, error, fieldErrors, clearError } = useAuth();

  const [tab, setTab] = useState<TabMode>('login');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Clinical Pharmacist');
  const [regPhone, setRegPhone] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regDepartment, setRegDepartment] = useState('');

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    clearError();
    setLocalErrors({});
  }, [tab, clearError]);

  const pwChecks = useMemo(() => passwordRules(regPassword), [regPassword]);
  const pwAllOk = useMemo(() => pwChecks.every(c => c.ok), [pwChecks]);

  const allFieldErrors: Record<string, string> = {
    ...(fieldErrors || {}),
    ...localErrors
  };

  const validateLogin = (): boolean => {
    const next: Record<string, string> = {};
    const e = email.trim().toLowerCase();
    if (!e) next.email = 'Email is required';
    else if (!emailRegex.test(e)) next.email = 'Invalid email address';
    if (!password) next.password = 'Password is required';
    setLocalErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateRegister = (): boolean => {
    const next: Record<string, string> = {};
    const name = regName.trim();
    const e = regEmail.trim().toLowerCase();
    if (name.length < 2) next.name = 'Name must be at least 2 characters';
    if (!e) next.email = 'Email is required';
    else if (!emailRegex.test(e)) next.email = 'Invalid email address';
    if (!pwAllOk) next.password = 'Password does not meet requirements';
    if (!regConfirm) next.confirmPassword = 'Confirm your password';
    else if (regPassword !== regConfirm) next.confirmPassword = 'Passwords do not match';
    setLocalErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmitLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    clearError();
    if (!validateLogin()) return;
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {
      /* auth context captures the error */
    }
  };

  const onSubmitRegister = async (ev: React.FormEvent) => {
    ev.preventDefault();
    clearError();
    if (!validateRegister()) return;
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        confirmPassword: regConfirm,
        role: regRole,
        title: TITLE_FOR_ROLE[regRole],
        tenantId: 'TN-4092',
        tenantName: 'Apollo Health Network',
        department: regDepartment.trim() || undefined,
        phone: regPhone.trim() || undefined,
        licenseNumber: regLicense.trim() || undefined
      });
    } catch {
      /* auth context captures the error */
    }
  };

  const inputClass = (key: string) =>
    `w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:border-blue-600 focus:ring-blue-600 transition ${
      allFieldErrors[key] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
    }`;

  const Label: React.FC<{ children: React.ReactNode; htmlFor: string }> = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-700 mb-1">
      {children}
    </label>
  );

  const FieldError: React.FC<{ name: string }> = ({ name }) =>
    allFieldErrors[name] ? (
      <p className="mt-1 text-[11px] text-red-600 leading-tight">{allFieldErrors[name]}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-10 text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-sm">
              <Pill size={18} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                medi <span className="text-blue-600">AI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold">
                SastaRx
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {tab === 'login' ? 'Sign in to your clinical account' : 'Create a new clinical account'}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setTab('login')}
            disabled={loading}
            className={`rounded-md text-xs font-medium py-2 transition ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            disabled={loading}
            className={`rounded-md text-xs font-medium py-2 transition ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={onSubmitLogin} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="login-email">Email</Label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className={inputClass('email')}
              />
              <FieldError name="email" />
            </div>

            <div>
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass('password')} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError name="password" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm transition shadow-xs inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-blue-600 hover:underline font-medium"
              >
                Create one
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={onSubmitRegister} className="space-y-3.5" noValidate>
            <div>
              <Label htmlFor="reg-name">Full name</Label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="Dr. Priya Sharma"
                className={inputClass('name')}
              />
              <FieldError name="name" />
            </div>

            <div>
              <Label htmlFor="reg-email">Email</Label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="name@organization.com"
                className={inputClass('email')}
              />
              <FieldError name="email" />
            </div>

            <div>
              <Label htmlFor="reg-role">Role</Label>
              <select
                id="reg-role"
                value={regRole}
                onChange={e => setRegRole(e.target.value as UserRole)}
                className={inputClass('role')}
              >
                {ALLOWED_ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <FieldError name="role" />
            </div>

            <div>
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass('password')} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError name="password" />
              {regPassword && (
                <ul className="mt-2 space-y-0.5">
                  {pwChecks.map((c, i) => (
                    <li
                      key={i}
                      className={`text-[11px] flex items-center gap-1.5 ${
                        c.ok ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <span aria-hidden>{c.ok ? '✓' : '○'}</span>
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass('confirmPassword')} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError name="confirmPassword" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reg-phone">Phone (optional)</Label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+91 98…"
                  className={inputClass('phone')}
                />
                <FieldError name="phone" />
              </div>
              <div>
                <Label htmlFor="reg-license">License # (optional)</Label>
                <input
                  id="reg-license"
                  type="text"
                  value={regLicense}
                  onChange={e => setRegLicense(e.target.value)}
                  placeholder="DL-NCT-…"
                  className={inputClass('licenseNumber')}
                />
                <FieldError name="licenseNumber" />
              </div>
            </div>

            <div>
              <Label htmlFor="reg-dept">Department (optional)</Label>
              <input
                id="reg-dept"
                type="text"
                value={regDepartment}
                onChange={e => setRegDepartment(e.target.value)}
                placeholder="Formulary / Clinical Ops"
                className={inputClass('department')}
              />
              <FieldError name="department" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm transition shadow-xs inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
      <p className="mt-6 text-[11px] text-slate-400 text-center max-w-sm">
        Clinical data is for internal pharmacy operations use. Protected by role-based access controls.
      </p>
    </div>
  );
};
