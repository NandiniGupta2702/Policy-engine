import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { User, UserRole } from '../../types';
import { PolicyOSApiClient } from '../../lib/api';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('sarah.jenkins@acmepolicy.com');
  const [password, setPassword] = useState('••••••••••••');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const users = PolicyOSApiClient.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setErrorMessage('Invalid enterprise SSO credentials. Please verify your email.');
        return;
      }

      if (user.status === 'revoked') {
        setErrorMessage('Security Exception: This account has been revoked by an administrator.');
        return;
      }

      PolicyOSApiClient.setCurrentUser(user);
      onLoginSuccess(user);
    }, 400);
  };

  const handleQuickPersona = (role: UserRole, emailOverride?: string) => {
    if (emailOverride) {
      setEmail(emailOverride);
      setErrorMessage('');
      const users = PolicyOSApiClient.getUsers();
      const user = users.find(u => u.email === emailOverride);
      if (user && user.status === 'revoked') {
        setErrorMessage('Security Exception: This account has been revoked by an administrator.');
        return;
      }
      if (user) {
        PolicyOSApiClient.setCurrentUser(user);
        onLoginSuccess(user);
      }
      return;
    }

    const user = PolicyOSApiClient.loginAs(role);
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col justify-center items-center p-6 selection:bg-[#E2F700]/30 selection:text-black">
      <div className="w-full max-w-md bg-white border border-[#E5E5E3] rounded-md shadow-sm p-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#9EF01A] rounded-[4px] flex items-center justify-center font-mono font-bold text-black text-sm">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight">PolicyOS</h1>
            <p className="text-xs text-neutral-500 font-mono">Deterministic Expense Policy Engine</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-900">Sign in to Enterprise Workspace</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Maker-Checker governance for corporate expense policies & claim adjudication.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-[4px] flex items-start gap-2 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Corporate Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                Password / SSO Passkey
              </label>
              <span className="text-[11px] text-neutral-400 font-mono">SAML 2.0</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-[4px] outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-[#111315] hover:bg-[#202326] text-white text-xs font-semibold rounded-[4px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Authenticating with IdP...' : 'Sign In via SAML SSO'}
            {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Quick Demo Switchers */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-3 text-center">
            Demo Personas (Instant Access)
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickPersona('FC')}
              className="w-full flex items-center justify-between p-2.5 border border-[#E5E5E3] hover:border-neutral-900 rounded-[4px] text-left transition-colors bg-neutral-50 hover:bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Sarah Jenkins (Finance Controller)</div>
                  <div className="text-[11px] text-neutral-500">Maker-Checker approvals, replay simulations, audit</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-[2px]">FC</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('PO')}
              className="w-full flex items-center justify-between p-2.5 border border-[#E5E5E3] hover:border-neutral-900 rounded-[4px] text-left transition-colors bg-neutral-50 hover:bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Alex Chen (Policy Owner)</div>
                  <div className="text-[11px] text-neutral-500">Uploads policies, monitors extraction, views own rules</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-[2px]">PO</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('ADMIN')}
              className="w-full flex items-center justify-between p-2.5 border border-[#E5E5E3] hover:border-neutral-900 rounded-[4px] text-left transition-colors bg-neutral-50 hover:bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Marcus Vance (System Admin)</div>
                  <div className="text-[11px] text-neutral-500">User revocations, system limits, engine logs</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-[2px]">ADMIN</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('PO', 'david.kross@acmepolicy.com')}
              className="w-full flex items-center justify-between p-2 border border-dashed border-rose-300 hover:border-rose-500 rounded-[4px] text-left transition-colors bg-rose-50/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-600" />
                <div>
                  <div className="text-xs font-medium text-rose-900">David Kross (Revoked Account Test)</div>
                  <div className="text-[10px] text-rose-600">Tests automatic access revocation & login bounce</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-rose-700">REVOKED</span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 text-center text-[11px] text-neutral-400 font-mono flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-neutral-400" />
          <span>FIPS 140-2 Compliant · Cryptographic Decision Records</span>
        </div>
      </div>
    </div>
  );
};
