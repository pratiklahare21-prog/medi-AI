import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2, Pill, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleOAuth } from '../context/GoogleOAuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { UserRole } from '../types';
import { api } from '../api';

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

interface DemoUserPreset {
  label: string;
  role: UserRole;
  email: string;
  badge: string;
}

const DEMO_USERS: DemoUserPreset[] = [
  { label: 'Admin', role: 'Lead Ops Admin', email: 'aditi.rao@apollo.in', badge: 'Full Access' },
  { label: 'Pharmacist', role: 'Clinical Pharmacist', email: 'priya.sharma@apollo.in', badge: 'Clinical Ops' },
  { label: 'Doctor', role: 'Prescribing Physician', email: 'dr.rajesh@apollo.in', badge: 'Prescriptions' },
  { label: 'Patient', role: 'Patient / Consumer', email: 'vikram.mehta@gmail.com', badge: 'Patient Portal' }
];

const passwordRules = (pwd: string): { ok: boolean; label: string }[] => [
  { ok: pwd.length >= 8, label: '8+ characters' },
  { ok: /[a-z]/.test(pwd), label: 'One lowercase letter' },
  { ok: /[A-Z]/.test(pwd), label: 'One uppercase letter' },
  { ok: /[0-9]/.test(pwd), label: 'One number' },
  { ok: /[^A-Za-z0-9]/.test(pwd), label: 'One special symbol' }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage: React.FC = () => {
  const { login, register, loading, error, fieldErrors, clearError } = useAuth();
  const { isReady: isGoogleOAuthReady } = useGoogleOAuth();

  const [tab, setTab] = useState<TabMode>('login');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const [email, setEmail] = useState('priya.sharma@apollo.in');
  const [password, setPassword] = useState('Password123!');

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

  const applyDemoUser = (demo: DemoUserPreset) => {
    setTab('login');
    setEmail(demo.email);
    setPassword('Password123!');
    clearError();
    setLocalErrors({});
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
    if (!pwAllOk) next.password = 'Password does not meet security requirements';
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
      /* Handled in AuthContext */
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      setGoogleLoading(true);
      setGoogleError('');
      
      // Send credential to backend for verification
      const response = await api.post('/auth/google/verify', { credential });
      
      if (response.success && response.token) {
        // Store token and user
        localStorage.setItem('sastarx_auth_token', response.token);
        localStorage.setItem('sastarx_current_user', JSON.stringify(response.user));
        
        // Reload page to reinitialize app with authenticated user
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setGoogleError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Google Sign-In error:', error);
    setGoogleError('Google Sign-In failed. Please try again.');
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
      /* Handled in AuthContext */
    }
  };

  const inputClass = (key: string) =>
    `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition shadow-xs ${
      allFieldErrors[key] ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'
    }`;

  const Label: React.FC<{ children: React.ReactNode; htmlFor: string }> = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700 mb-1.5">
      {children}
    </label>
  );

  const FieldError: React.FC<{ name: string }> = ({ name }) =>
    allFieldErrors[name] ? (
      <p className="mt-1 text-xs text-red-600 leading-tight">{allFieldErrors[name]}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col justify-center items-center px-4 py-8 text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 backdrop-blur-xs">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2.5 mb-3">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <Pill size={22} className="rotate-45" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                medi<span className="text-blue-600">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold">
                SastaRx
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {tab === 'login' ? 'Clinical Operations & Patient Discovery Portal' : 'Register a new clinical or patient account'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setTab('login')}
            disabled={loading}
            className={`rounded-lg text-xs font-bold py-2 transition-all ${
              tab === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            disabled={loading}
            className={`rounded-lg text-xs font-bold py-2 transition-all ${
              tab === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium flex items-start gap-2">
            <span className="text-sm font-bold">⚠️</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={onSubmitLogin} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="login-email">Email address</Label>
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
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="login-password">Password</Label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass('password')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError name="password" />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in…
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>

            {/* Google Sign-In */}
            {isGoogleOAuthReady && (
              <>
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="pt-1">
                  <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={true}
                  />
                  {googleError && (
                    <p className="mt-2 text-xs text-red-600 text-center">{googleError}</p>
                  )}
                </div>
              </>
            )}

            {/* Quick Demo Logins */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <UserCheck size={12} className="text-blue-600" /> Quick Demo Accounts:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map(demo => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => applyDemoUser(demo)}
                    className="p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 flex items-center justify-between">
                      <span>{demo.label}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                        {demo.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{demo.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmitRegister} className="space-y-3.5" noValidate>
            <div>
              <Label htmlFor="reg-name">Full Name</Label>
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
              <Label htmlFor="reg-email">Email Address</Label>
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
                  className={`${inputClass('password')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError name="password" />
              {regPassword && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">Password Requirements:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {pwChecks.map((c, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1 ${
                          c.ok ? 'text-emerald-600 font-medium' : 'text-slate-400'
                        }`}
                      >
                        <span>{c.ok ? '✓' : '○'}</span>
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="reg-confirm">Confirm Password</Label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass('confirmPassword')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating Account…
                </>
              ) : (
                'Create Clinical Account'
              )}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>DISHA & HIPAA Certified · End-to-End Encrypted Session</span>
      </div>
    </div>
  );
};
