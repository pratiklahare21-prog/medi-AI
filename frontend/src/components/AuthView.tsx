import React, { useState } from 'react';
import { UserAccount, UserRole, TenantInfo } from '../types';
import { DEFAULT_USERS, INITIAL_TENANTS } from '../data/mockData';
import { api } from '../services/api';

interface AuthViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  onContinueAsGuest?: () => void;
  availableTenants?: TenantInfo[];
  registeredUsers?: UserAccount[];
  onRegisterUser?: (newUser: UserAccount) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  availableTenants = INITIAL_TENANTS,
  registeredUsers = DEFAULT_USERS,
  onRegisterUser
}) => {
  const [isRegister, setIsRegister] = useState(false);

  // Sign In state
  const [email, setEmail] = useState('sarah.jenkins@apollohealth.org');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Clinical Pharmacist');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) {
      setError('Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await api.login(emailTrimmed, password);
      onLoginSuccess(user);
    } catch (err: any) {
      // Offline fallback
      const matched = registeredUsers.find(
        (u) => u.email.toLowerCase() === emailTrimmed
      );
      if (matched) {
        onLoginSuccess(matched);
      } else {
        const customUser: UserAccount = {
          id: `usr-${Date.now()}`,
          name: emailTrimmed.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          email: emailTrimmed,
          role: 'Clinical Pharmacist',
          title: 'Healthcare Professional',
          tenantId: availableTenants[0]?.tenantCode || 'TN-4092',
          tenantName: availableTenants[0]?.name || 'Apollo Health Network',
          joinedAt: 'Today'
        };
        onLoginSuccess(customUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const tenant = availableTenants[0];
      const { user } = await api.register({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: regRole,
        title: regRole === 'Patient / Consumer' ? 'Patient' : 'Clinical Practitioner',
        tenantId: tenant?.tenantCode || 'TN-4092',
        tenantName: tenant?.name || 'Apollo Health Network'
      });

      if (onRegisterUser) {
        onRegisterUser(user);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = async (user: UserAccount) => {
    setEmail(user.email);
    setPassword('Password123!');
    setError(null);
    setIsLoading(true);
    try {
      const { user: authedUser } = await api.login(user.email, 'Password123!');
      onLoginSuccess(authedUser);
    } catch {
      onLoginSuccess(user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 text-slate-800">
      {/* Container Card */}
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              medi <span className="text-blue-600">AI</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
              SastaRx
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isRegister ? 'Create a clinical account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">
            {error}
          </div>
        )}

        {!isRegister ? (
          /* ================= SIGN IN FORM ================= */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition shadow-xs cursor-pointer"
            >
              Sign In
            </button>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-slate-100">
              <span className="block text-[11px] text-slate-400 text-center mb-2 font-medium">
                Quick Demo Login
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {DEFAULT_USERS.map((usr) => (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => handleDemoSelect(usr)}
                    className="px-2 py-1.5 text-left text-xs rounded-md bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 transition truncate cursor-pointer"
                    title={`${usr.name} (${usr.role})`}
                  >
                    <span className="font-medium block truncate">{usr.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {usr.role.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle to Register */}
            <div className="pt-2 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Register
              </button>
            </div>
          </form>
        ) : (
          /* ================= REGISTER FORM ================= */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Dr. Rajesh Kumar"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="rajesh@hospital.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Role
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                <option value="Clinical Pharmacist">Clinical Pharmacist</option>
                <option value="Prescribing Physician">Prescribing Physician</option>
                <option value="Lead Ops Admin">Ops Administrator</option>
                <option value="Patient / Consumer">Patient / Consumer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition shadow-xs cursor-pointer mt-1"
            >
              Create Account
            </button>

            {/* Toggle back to Sign In */}
            <div className="pt-2 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* Guest access option */}
        {onContinueAsGuest && (
          <div className="mt-4 pt-3 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              Continue as Guest &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
