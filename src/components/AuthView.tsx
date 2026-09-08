import React, { useState } from 'react';
import { UserAccount, UserRole, TenantInfo } from '../types';
import { DEFAULT_USERS, INITIAL_TENANTS } from '../data/mockData';

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
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In form state
  const [signInIdentifier, setSignInIdentifier] = useState('sarah.jenkins@apollohealth.org');
  const [signInPassword, setSignInPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Register form state
  const [titlePrefix, setTitlePrefix] = useState<'Dr.' | 'Pharm.' | 'Mr.' | 'Ms.'>('Dr.');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Clinical Pharmacist');
  const [regLicense, setRegLicense] = useState('');
  const [regTenantId, setRegTenantId] = useState(availableTenants[0]?.tenantCode || 'TN-4092');
  const [regDepartment, setRegDepartment] = useState('Clinical Pharmacology');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptCompliance, setAcceptCompliance] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Forgot password modal
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Calculate password strength score (0-4)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const regPasswordScore = calculatePasswordStrength(regPassword);

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    const identifierTrimmed = signInIdentifier.trim().toLowerCase();
    if (!identifierTrimmed) {
      setSignInError('Please enter your email or Medical License ID.');
      return;
    }
    if (!signInPassword) {
      setSignInError('Please enter your account password.');
      return;
    }

    setIsSigningIn(true);

    setTimeout(() => {
      // Find matching user in registeredUsers
      const matched = registeredUsers.find(
        (u) =>
          u.email.toLowerCase() === identifierTrimmed ||
          (u.licenseNumber && u.licenseNumber.toLowerCase() === identifierTrimmed)
      );

      if (matched) {
        // In demo, verify password or accept demo standard
        if (matched.password && matched.password !== signInPassword && signInPassword !== 'Password123!') {
          setIsSigningIn(false);
          setSignInError('Invalid password. For demo accounts, use: Password123!');
          return;
        }
        setIsSigningIn(false);
        onLoginSuccess(matched);
      } else {
        // Check if user entered a demo email format or create transient session
        if (identifierTrimmed.includes('@')) {
          // Allow transient login for custom email
          const customUser: UserAccount = {
            id: `usr-${Date.now()}`,
            name: identifierTrimmed.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            email: identifierTrimmed,
            role: 'Clinical Pharmacist',
            title: 'Verified Healthcare Practitioner',
            tenantId: availableTenants[0]?.tenantCode || 'TN-4092',
            tenantName: availableTenants[0]?.name || 'Apollo Health Network',
            joinedAt: 'Today',
            password: signInPassword
          };
          setIsSigningIn(false);
          onLoginSuccess(customUser);
        } else {
          setIsSigningIn(false);
          setSignInError('No account found with this email or Medical License ID. Please check your credentials or register below.');
        }
      }
    }, 400);
  };

  // Quick Demo Auto-fill & Login
  const handleQuickDemoLogin = (demoUser: UserAccount) => {
    setSignInIdentifier(demoUser.email);
    setSignInPassword(demoUser.password || 'Password123!');
    setSignInError(null);
    setIsSigningIn(true);
    setTimeout(() => {
      setIsSigningIn(false);
      onLoginSuccess(demoUser);
    }, 300);
  };

  // Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const nameTrimmed = regFullName.trim();
    const emailTrimmed = regEmail.trim().toLowerCase();

    if (!nameTrimmed) {
      setRegError('Please provide your full legal or practitioner name.');
      return;
    }
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setRegError('Please provide a valid institutional or personal email address.');
      return;
    }
    if (regRole !== 'Patient / Consumer' && !regLicense.trim()) {
      setRegError('Medical License or Council Registration No. is required for clinical personnel.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!acceptCompliance) {
      setRegError('You must certify compliance with CDSCO regulatory & patient privacy guidelines.');
      return;
    }

    // Check if email already registered
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (existing) {
      setRegError('An account with this email address already exists. Please sign in instead.');
      return;
    }

    setIsRegistering(true);

    const selectedTenant = availableTenants.find((t) => t.tenantCode === regTenantId) || availableTenants[0];

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: `${titlePrefix} ${nameTrimmed}`,
      email: emailTrimmed,
      role: regRole,
      title:
        regRole === 'Lead Ops Admin'
          ? 'Clinical Operations Administrator'
          : regRole === 'Clinical Pharmacist'
          ? 'Hospital Pharmacist & Formularist'
          : regRole === 'Prescribing Physician'
          ? 'Attending Medical Physician'
          : regRole === 'Formulary Director'
          ? 'Director of Pharmacy & Formulary'
          : 'Patient Care Beneficiary',
      licenseNumber: regLicense.trim() ? regLicense.trim().toUpperCase() : undefined,
      tenantId: selectedTenant.tenantCode,
      tenantName: selectedTenant.name,
      department: regDepartment.trim() || undefined,
      phone: regPhone.trim() || undefined,
      joinedAt: 'Just now',
      password: regPassword
    };

    setTimeout(() => {
      setIsRegistering(false);
      if (onRegisterUser) {
        onRegisterUser(newUser);
      }
      onLoginSuccess(newUser);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-[#2563EB] selection:text-white font-sans">
      {/* Background Ambience & Clinical Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#1D4ED8]/15 via-[#0EA5E9]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#2563EB]/10 blur-3xl pointer-events-none" />

      {/* Top Bar: Sovereign Clinical Header */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#1E293B]/80 backdrop-blur-md bg-[#0F172A]/70">
        <div className="flex items-center gap-3">
          <img
            alt="medi AI SastaRx Logo"
            className="h-9 w-auto object-contain rounded"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XpvQ1G8AkW5QIgQDx3Bhkh0XM_nkZn9Vf1IXJlcPV0Bp16jNkXDo7HK6kQiBzQNcMizuSF16MpltHNWwsOtCDDg0jD-8BGnB7rrOrKBnaHR1cpUiSzZHhvaG7nseDyrKe8ERGm7in5OEQ-oH-Wv6XEM9T1Qu4p_wymsaSJOzbk_DPihvNmPAXyI1OgsCE-YsgVDrND245iAnTxEzrYfDUtgp5OHGXUNNFn_415xGdMDLMgoNE1LdCLj0s"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-lg font-bold text-white tracking-tight leading-none">
                medi <span className="text-[#3B82F6]">AI</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-[#60A5FA] border border-blue-500/30 text-[10px] font-code-mono font-bold uppercase">
                SastaRx
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              Sovereign Clinical Formulary & Bioequivalence Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CDSCO / DPCO Compliant
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-code-mono">
              <span className="material-symbols-outlined text-xs text-blue-400">lock</span>
              256-Bit SSL / HMAC Validated
            </span>
          </div>

          {onContinueAsGuest && (
            <button
              onClick={onContinueAsGuest}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 hover:text-white border border-slate-700 transition-colors font-medium flex items-center gap-1 cursor-pointer"
              title="Explore public interface with demo permissions"
            >
              <span>Explore as Guest</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl bg-[#0F172A]/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col">
          {/* Tab Switcher: Sign In vs Register */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#1E293B]/90 border border-slate-700/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setSignInError(null);
              }}
              className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegError(null);
              }}
              className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">how_to_reg</span>
              <span>Register Account</span>
            </button>
          </div>

          {/* ========================================================
              SIGN IN FORM
             ======================================================== */}
          {authMode === 'signin' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight font-headline-sm">
                  Clinical Portal Access
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate with your institutional email or Medical License ID to access isolated tenant partition.
                </p>
              </div>

              {signInError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-red-400 shrink-0">error</span>
                  <span>{signInError}</span>
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider font-label-xs">
                    Institutional Email / Medical License ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                      badge
                    </span>
                    <input
                      type="text"
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      placeholder="e.g. sarah.jenkins@apollohealth.org or MCI-40921-A"
                      className="w-full pl-9.5 pr-4 py-2.5 bg-[#1E293B] border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all font-code-mono"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-label-xs">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-[11px] text-[#60A5FA] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                      lock
                    </span>
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-9.5 pr-10 py-2.5 bg-[#1E293B] border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all font-code-mono"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={showSignInPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-base">
                        {showSignInPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-700 bg-[#1E293B]"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      Remember session on this clinical workstation
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isSigningIn ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                      <span>Verifying Credentials & Session Keys...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      <span>Sign In to Formulary Console</span>
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Profiles */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2.5">
                  <span className="uppercase tracking-wider font-label-xs text-[10px] text-slate-400 font-bold">
                    Quick Demo Personas (1-Click Fill & Sign In)
                  </span>
                  <span className="text-[10px] text-blue-400 font-code-mono">Mock Auth Verified</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(usr)}
                      className="p-2.5 rounded-lg bg-[#1E293B]/70 hover:bg-[#1E293B] border border-slate-700/70 hover:border-[#3B82F6]/60 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 group-hover:border-blue-400">
                        <span className="material-symbols-outlined text-sm">
                          {usr.role.includes('Admin')
                            ? 'admin_panel_settings'
                            : usr.role.includes('Pharmacist')
                            ? 'local_pharmacy'
                            : usr.role.includes('Physician')
                            ? 'stethoscope'
                            : 'person'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-blue-300">
                          {usr.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-code-mono">
                          {usr.role} · {usr.tenantId}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              REGISTER FORM
             ======================================================== */}
          {authMode === 'register' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight font-headline-sm">
                  Register Healthcare Account
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provision new practitioner or clinical operator credentials tied to an authorized tenant schema.
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-red-400 shrink-0">error</span>
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name & Title Prefix */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                    Practitioner / Legal Full Name
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={titlePrefix}
                      onChange={(e) => setTitlePrefix(e.target.value as any)}
                      className="w-24 px-2 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Pharm.">Pharm.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Rajiv Menon"
                      className="flex-1 px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6]"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                    Institutional Work / Personal Email
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. rajiv.menon@fortishealth.com"
                    className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] font-code-mono"
                    required
                  />
                </div>

                {/* Role & Medical License */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                      Clinical Role / Persona
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                    >
                      <option value="Clinical Pharmacist">Clinical Pharmacist & Formularist</option>
                      <option value="Lead Ops Admin">Lead Clinical Ops Administrator</option>
                      <option value="Prescribing Physician">Prescribing Physician</option>
                      <option value="Formulary Director">Formulary Director</option>
                      <option value="Patient / Consumer">Patient / Consumer Beneficiary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                      Medical / Pharmacy Council No.
                    </label>
                    <input
                      type="text"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      placeholder={regRole === 'Patient / Consumer' ? 'Optional (ABHA ID)' : 'e.g. MCI-78401-A'}
                      className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] font-code-mono"
                      required={regRole !== 'Patient / Consumer'}
                    />
                  </div>
                </div>

                {/* Tenant Partition Selection & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                      Healthcare Tenant Partition
                    </label>
                    <select
                      value={regTenantId}
                      onChange={(e) => setRegTenantId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                    >
                      {availableTenants.map((t) => (
                        <option key={t.id} value={t.tenantCode}>
                          {t.name} ({t.tenantCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                      Department / Specialty
                    </label>
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="e.g. Clinical Pharmacology"
                      className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                      Password (min. 8 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full px-3 pr-8 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] font-code-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {showRegPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider font-label-xs">
                      Confirm Password
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] font-code-mono"
                      required
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {regPassword && (
                  <div className="p-2.5 rounded-lg bg-[#1E293B]/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Password Strength:</span>
                      <span
                        className={`font-semibold font-code-mono ${
                          regPasswordScore <= 1
                            ? 'text-red-400'
                            : regPasswordScore === 2
                            ? 'text-amber-400'
                            : regPasswordScore === 3
                            ? 'text-blue-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {regPasswordScore <= 1
                          ? 'Weak'
                          : regPasswordScore === 2
                          ? 'Fair'
                          : regPasswordScore === 3
                          ? 'Good'
                          : 'Strong'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-700">
                      <div className={`h-full ${regPasswordScore >= 1 ? 'bg-red-500' : ''}`}></div>
                      <div className={`h-full ${regPasswordScore >= 2 ? 'bg-amber-500' : ''}`}></div>
                      <div className={`h-full ${regPasswordScore >= 3 ? 'bg-blue-500' : ''}`}></div>
                      <div className={`h-full ${regPasswordScore >= 4 ? 'bg-emerald-500' : ''}`}></div>
                    </div>
                  </div>
                )}

                {/* Compliance & Regulatory Consent */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptCompliance}
                    onChange={(e) => setAcceptCompliance(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-700 bg-[#1E293B] mt-0.5 shrink-0"
                    required
                  />
                  <span className="text-[11px] text-slate-400 leading-relaxed">
                    I certify that I am authorized to access clinical bioequivalence matrices and comply with Indian
                    CDSCO Drug Price Control Order (DPCO) and patient privacy guidelines.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isRegistering ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                      <span>Creating Profile & Provisioning Session...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">how_to_reg</span>
                      <span>Register Account & Enter Console</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">lock_reset</span>
                <h3 className="font-bold text-white text-base">Reset Account Credentials</h3>
              </div>
              <button
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setForgotSent(false);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {forgotSent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                </div>
                <h4 className="text-white font-bold text-sm">Security Instructions Dispatched</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  A verification token has been routed to <strong className="text-white">{forgotEmail}</strong> with
                  authorized credentials to reset your clinical workstation password.
                </p>
                <button
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotSent(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="py-4 space-y-3.5">
                <p className="text-xs text-slate-400">
                  Enter your institutional work email. We will verify your tenant domain and dispatch a cryptographic
                  one-time link.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. sarah.jenkins@apollohealth.org"
                    className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 font-code-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="p-2.5 rounded bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300">
                  <strong>Clinical Helpdesk:</strong> For emergency formulary access lockouts, contact the Healthcare
                  Informatics Desk at <code>ext-4092</code>.
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (forgotEmail.trim()) {
                        setForgotSent(true);
                      }
                    }}
                    className="px-4 py-1.5 rounded bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-600"
                  >
                    Dispatch Reset Token
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sovereign Security Footer */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-[#1E293B]/80 bg-[#0F172A]/50 gap-2">
        <div className="flex items-center gap-2 font-code-mono">
          <span>medi AI SastaRx v2.4.0</span>
          <span>·</span>
          <span>Security Protocol: HIPAA / ISO 27799</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">National Pharmaceutical Pricing Authority (NPPA) Data Grounded</span>
          <span>·</span>
          <span className="text-slate-400">Apollo / Fortis / Manipal Federated Nodes</span>
        </div>
      </footer>
    </div>
  );
};
