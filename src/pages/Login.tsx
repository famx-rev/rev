import { useState, FormEvent, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User, KeyRound, CheckCircle2, ArrowLeft, FileText, Shield, ChevronRight } from 'lucide-react';

const API_BASE = 'https://api-eight-navy-68.vercel.app/api/authx/710ff547-b7c1-4287-b9e7-5045bc86cd3e';
const LOGO_URL = 'https://idealfrank.sirv.com/rev_by_famx_gradient.png';

type View = 'login' | 'signup' | 'forgot' | 'reset' | 'terms' | 'privacy';

const SUBTITLES: Record<View, string> = {
  login: 'Sign in to your account',
  signup: 'Create your account',
  forgot: 'Reset your password',
  reset: 'Set a new password',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
};

export default function Login() {
  const { login } = useAuth();
  const [view, setView] = useState<View>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4EF] dark:bg-[#1a1a18] px-4 py-8 transition-colors">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={LOGO_URL} alt="Famx REV" className="h-12 w-auto mb-5" />
          <h1 className="text-[15px] font-medium text-[#3D3929] dark:text-[#E8E6DC] tracking-tight">
            {SUBTITLES[view]}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#262524] border border-[#E5E3DD] dark:border-[#3D3D3A] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] overflow-hidden">
          {view === 'login' && <LoginForm onSwitch={setView} />}
          {view === 'signup' && <SignupView onSwitch={setView} />}
          {view === 'forgot' && <ForgotView onSwitch={setView} />}
          {view === 'reset' && <ResetView onSwitch={setView} />}
          {view === 'terms' && <TermsView onSwitch={setView} />}
          {view === 'privacy' && <PrivacyView onSwitch={setView} />}
        </div>

        {/* Terms footer */}
        {(view === 'login' || view === 'signup') && (
          <p className="text-center text-[13px] text-[#8B8779] dark:text-[#8B887E] mt-5 leading-relaxed">
            By continuing, you agree to our{' '}
            <button
              onClick={() => setView('terms')}
              className="text-[#3D3929] dark:text-[#E8E6DC] underline underline-offset-2 hover:text-[#DA7756] dark:hover:text-[#DA7756] transition-colors"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              onClick={() => setView('privacy')}
              className="text-[#3D3929] dark:text-[#E8E6DC] underline underline-offset-2 hover:text-[#DA7756] dark:hover:text-[#DA7756] transition-colors"
            >
              Privacy Policy
            </button>
            .
          </p>
        )}
      </div>
    </div>
  );

  /* ── Shared input component ── */
  function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
    return (
      <div>
        <label className="block text-[13px] font-medium text-[#3D3929] dark:text-[#E8E6DC] mb-1.5">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B4B0A6] dark:text-[#6B6A65]">{icon}</div>
          {children}
        </div>
      </div>
    );
  }

  function inputClass(extra: string = '') {
    return `w-full pl-10 ${extra} py-2.5 bg-[#FAFAF7] dark:bg-[#1a1a18] border border-[#E0DED7] dark:border-[#3D3D3A] rounded-lg text-[14px] text-[#3D3929] dark:text-[#E8E6DC] placeholder-[#B4B0A6] dark:placeholder-[#6B6A65] focus:outline-none focus:border-[#DA7756] dark:focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/20 transition-all`;
  }

  function btnClass() {
    return `w-full flex items-center justify-center gap-2 py-2.5 bg-[#DA7756] hover:bg-[#C86A4D] dark:bg-[#DA7756] dark:hover:bg-[#C86A4D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-[14px] rounded-lg transition-colors`;
  }

  /* ── Login ── */
  function LoginForm({ onSwitch }: { onSwitch: (v: View) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        await login(email, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Field icon={<Mail className="h-[18px] w-[18px]" />} label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={submitting} placeholder="you@example.com" className={inputClass('pr-3')} />
        </Field>

        <Field icon={<Lock className="h-[18px] w-[18px]" />} label="Password">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={submitting} placeholder="••••••••" className={inputClass('pr-10')} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B4B0A6] dark:text-[#6B6A65] hover:text-[#3D3929] dark:hover:text-[#E8E6DC] transition-colors">
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </Field>

        <div className="flex justify-end">
          <button type="button" onClick={() => onSwitch('forgot')} className="text-[13px] text-[#8B8779] dark:text-[#8B887E] hover:text-[#DA7756] dark:hover:text-[#DA7756] transition-colors">
            Forgot password?
          </button>
        </div>

        {error && <ErrorBox message={error} />}

        <button type="submit" disabled={submitting} className={btnClass()}>
          {submitting ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Signing in...</> : <>Continue <ChevronRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-[13px] text-[#8B8779] dark:text-[#8B887E] pt-1">
          Don't have an account?{' '}
          <button onClick={() => onSwitch('signup')} className="text-[#DA7756] hover:text-[#C86A4D] font-medium transition-colors">
            Sign up
          </button>
        </p>
      </form>
    );
  }

  /* ── Signup ── */
  function SignupView({ onSwitch }: { onSwitch: (v: View) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!agree) {
        setError('You must agree to the Terms of Service and Privacy Policy to sign up.');
        return;
      }
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch(`${API_BASE}/user/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || `Signup failed (${res.status})`);
        setSuccess('Account created! You can now sign in.');
        setTimeout(() => onSwitch('login'), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Signup failed');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Field icon={<User className="h-[18px] w-[18px]" />} label="Username">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={submitting} placeholder="johndoe" className={inputClass('pr-3')} />
        </Field>

        <Field icon={<Mail className="h-[18px] w-[18px]" />} label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={submitting} placeholder="you@example.com" className={inputClass('pr-3')} />
        </Field>

        <Field icon={<Lock className="h-[18px] w-[18px]" />} label="Password">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={submitting} placeholder="••••••••" className={inputClass('pr-10')} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B4B0A6] dark:text-[#6B6A65] hover:text-[#3D3929] dark:hover:text-[#E8E6DC] transition-colors">
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </Field>

        <label className="flex items-start gap-2.5 text-[13px] text-[#8B8779] dark:text-[#8B887E] cursor-pointer leading-relaxed">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#E0DED7] dark:border-[#3D3D3A] bg-[#FAFAF7] dark:bg-[#1a1a18] text-[#DA7756] focus:ring-[#DA7756]/20" />
          <span>
            I agree to the{' '}
            <button type="button" onClick={() => onSwitch('terms')} className="text-[#3D3929] dark:text-[#E8E6DC] underline underline-offset-2 hover:text-[#DA7756] transition-colors">Terms of Service</button>
            {' '}and{' '}
            <button type="button" onClick={() => onSwitch('privacy')} className="text-[#3D3929] dark:text-[#E8E6DC] underline underline-offset-2 hover:text-[#DA7756] transition-colors">Privacy Policy</button>.
          </span>
        </label>

        {error && <ErrorBox message={error} />}
        {success && <SuccessBox message={success} />}

        <button type="submit" disabled={submitting} className={btnClass()}>
          {submitting ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Creating account...</> : <>Create account <ChevronRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-[13px] text-[#8B8779] dark:text-[#8B887E] pt-1">
          Already have an account?{' '}
          <button onClick={() => onSwitch('login')} className="text-[#DA7756] hover:text-[#C86A4D] font-medium transition-colors">Sign in</button>
        </p>
      </form>
    );
  }

  /* ── Forgot ── */
  function ForgotView({ onSwitch }: { onSwitch: (v: View) => void }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch(`${API_BASE}/user/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || `Request failed (${res.status})`);
        setSuccess('If an account exists, a reset link has been sent.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-[13px] text-[#8B8779] dark:text-[#8B887E] leading-relaxed -mt-1">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <Field icon={<Mail className="h-[18px] w-[18px]" />} label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={submitting} placeholder="you@example.com" className={inputClass('pr-3')} />
        </Field>

        {error && <ErrorBox message={error} />}
        {success && <SuccessBox message={success} />}

        <button type="submit" disabled={submitting} className={btnClass()}>
          {submitting ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Sending...</> : <>Send reset link <ChevronRight className="h-4 w-4" /></>}
        </button>

        <BackLink onSwitch={onSwitch} />
      </form>
    );
  }

  /* ── Reset ── */
  function ResetView({ onSwitch }: { onSwitch: (v: View) => void }) {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch(`${API_BASE}/user/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || `Reset failed (${res.status})`);
        setSuccess('Password reset! You can now log in.');
        setTimeout(() => onSwitch('login'), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reset failed');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Field icon={<KeyRound className="h-[18px] w-[18px]" />} label="Reset Token">
          <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required disabled={submitting} placeholder="paste your reset token" className={inputClass('pr-3') + ' font-mono text-[13px]'} />
        </Field>

        <Field icon={<Lock className="h-[18px] w-[18px]" />} label="New Password">
          <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={submitting} placeholder="••••••••" className={inputClass('pr-10')} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B4B0A6] dark:text-[#6B6A65] hover:text-[#3D3929] dark:hover:text-[#E8E6DC] transition-colors">
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </Field>

        {error && <ErrorBox message={error} />}
        {success && <SuccessBox message={success} />}

        <button type="submit" disabled={submitting} className={btnClass()}>
          {submitting ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Resetting...</> : <>Reset password <ChevronRight className="h-4 w-4" /></>}
        </button>

        <BackLink onSwitch={onSwitch} />
      </form>
    );
  }

  /* ── Terms ── */
  function TermsView({ onSwitch }: { onSwitch: (v: View) => void }) {
    return (
      <>
        <DocHeader icon={<FileText className="h-[18px] w-[18px] text-[#DA7756]" />} title="Terms of Service" />
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-5 text-[14px] text-[#3D3929] dark:text-[#C4C2B8] leading-relaxed">
          <DocSection title="1. Acceptance of Terms">By accessing or using Famx REV ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</DocSection>
          <DocSection title="2. Description of Service">Famx REV provides web analytics, session recording, and visitor tracking tools. We collect and display analytics data from websites where you have installed our tracking script.</DocSection>
          <DocSection title="3. Account Registration">You must provide accurate and complete information when creating an account. You are responsible for safeguarding your password and for any activity under your account.</DocSection>
          <DocSection title="4. Acceptable Use">You agree not to: (a) use the Service for unlawful purposes; (b) track users without disclosure where required by law; (c) attempt to disrupt or compromise the Service; (d) resell or sublicense access without authorization.</DocSection>
          <DocSection title="5. Data Ownership">You retain ownership of the analytics data collected through your projects. We process and store this data on your behalf to provide the Service.</DocSection>
          <DocSection title="6. Plans & Billing">The Service offers Free, Pro, and Enterprise plans with different usage limits. Plan limits apply per billing cycle. We reserve the right to adjust pricing with reasonable notice.</DocSection>
          <DocSection title="7. Termination">You may delete your account at any time. We may suspend or terminate access if you violate these Terms or for any other reason with reasonable notice.</DocSection>
          <DocSection title="8. Disclaimer">The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.</DocSection>
          <DocSection title="9. Limitation of Liability">To the maximum extent permitted by law, Famx REV shall not be liable for indirect, incidental, or consequential damages arising from use of the Service.</DocSection>
          <DocSection title="10. Changes to Terms">We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</DocSection>
          <DocSection title="11. Contact">For questions about these Terms, contact us through the Support channels available in your dashboard.</DocSection>
        </div>
        <DocFooter onSwitch={onSwitch} other="privacy" otherLabel="Privacy Policy" otherIcon={<Shield className="h-4 w-4" />} />
      </>
    );
  }

  /* ── Privacy ── */
  function PrivacyView({ onSwitch }: { onSwitch: (v: View) => void }) {
    return (
      <>
        <DocHeader icon={<Shield className="h-[18px] w-[18px] text-[#DA7756]" />} title="Privacy Policy" />
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-5 text-[14px] text-[#3D3929] dark:text-[#C4C2B8] leading-relaxed">
          <DocSection title="1. Information We Collect">
            <p className="mb-2"><strong className="text-[#3D3929] dark:text-[#E8E6DC]">Account data:</strong> email, username, and authentication credentials when you register.</p>
            <p className="mb-2"><strong className="text-[#3D3929] dark:text-[#E8E6DC]">Analytics data:</strong> collected from websites where you install our tracking script, including pageviews, clicks, session recordings, IP addresses, device info, and browser metadata.</p>
            <p><strong className="text-[#3D3929] dark:text-[#E8E6DC]">Usage data:</strong> how you interact with the Famx REV dashboard itself.</p>
          </DocSection>
          <DocSection title="2. How We Use Your Information">To provide and improve the Service, authenticate your account, display analytics, prevent abuse, and communicate with you about your account. We do not sell your personal information.</DocSection>
          <DocSection title="3. Legal Basis (GDPR)">We process data based on: your consent, our legitimate interest in providing the Service, and compliance with legal obligations.</DocSection>
          <DocSection title="4. Data Storage">Analytics data is stored in our database infrastructure. Account credentials are handled through our authentication provider using industry-standard practices.</DocSection>
          <DocSection title="5. Data Retention">Analytics data is retained for the duration of your active projects. You can delete projects or all project data at any time from your dashboard settings.</DocSection>
          <DocSection title="6. Data Sharing">We do not share your analytics data with third parties except: (a) as required by law; (b) with service providers who help operate the platform under appropriate agreements.</DocSection>
          <DocSection title="7. Your Rights">Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data. Contact us to exercise these rights.</DocSection>
          <DocSection title="8. Cookies & Tracking">We use essential cookies to maintain your session. Our dashboard may use analytics to understand product usage.</DocSection>
          <DocSection title="9. Security">We implement reasonable technical and organizational measures to protect your data. No method of transmission or storage is 100% secure.</DocSection>
          <DocSection title="10. Children's Privacy">The Service is not directed to children under 13 (or the applicable age in your jurisdiction). We do not knowingly collect data from them.</DocSection>
          <DocSection title="11. International Transfers">Your data may be processed in countries other than your own. We take steps to ensure appropriate safeguards are in place.</DocSection>
          <DocSection title="12. Changes to This Policy">We may update this Privacy Policy from time to time. We will notify you of material changes through the Service or by email.</DocSection>
          <DocSection title="13. Contact">For privacy questions or requests, contact us through the Support channels in your dashboard.</DocSection>
        </div>
        <DocFooter onSwitch={onSwitch} other="terms" otherLabel="Terms of Service" otherIcon={<FileText className="h-4 w-4" />} />
      </>
    );
  }

  function BackLink({ onSwitch }: { onSwitch: (v: View) => void }) {
    return (
      <p className="text-center text-[13px] pt-1">
        <button onClick={() => onSwitch('login')} className="text-[#8B8779] dark:text-[#8B887E] hover:text-[#DA7756] dark:hover:text-[#DA7756] font-medium transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </button>
      </p>
    );
  }

  function DocHeader({ icon, title }: { icon: ReactNode; title: string }) {
    return (
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E5E3DD] dark:border-[#3D3D3A]">
        {icon}
        <h2 className="text-[15px] font-semibold text-[#3D3929] dark:text-[#E8E6DC]">{title}</h2>
        <span className="ml-auto text-[12px] text-[#B4B0A6] dark:text-[#6B6A65]">July 15, 2026</span>
      </div>
    );
  }

  function DocFooter({ onSwitch, other, otherLabel, otherIcon }: { onSwitch: (v: View) => void; other: View; otherLabel: string; otherIcon: ReactNode }) {
    return (
      <div className="px-6 py-4 border-t border-[#E5E3DD] dark:border-[#3D3D3A] flex items-center justify-between">
        <button onClick={() => onSwitch(other)} className="text-[13px] text-[#DA7756] hover:text-[#C86A4D] font-medium transition-colors inline-flex items-center gap-1.5">
          {otherIcon} {otherLabel}
        </button>
        <button onClick={() => onSwitch('login')} className="text-[13px] text-[#8B8779] dark:text-[#8B887E] hover:text-[#3D3929] dark:hover:text-[#E8E6DC] font-medium transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>
    );
  }
}

function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-[#3D3929] dark:text-[#E8E6DC] mb-1.5 text-[14px]">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-[#FDF2F0] dark:bg-[#3a1e16] border border-[#E8C9BE] dark:border-[#5a2e1e] rounded-lg text-[#B4451F] dark:text-[#E89B7E] text-[13px]">
      <AlertCircle className="h-[18px] w-[18px] flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function SuccessBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-[#F0F7F0] dark:bg-[#1a2e1a] border border-[#C9E0C9] dark:border-[#2e5a2e] rounded-lg text-[#3a7a3a] dark:text-[#7ECE7E] text-[13px]">
      <CheckCircle2 className="h-[18px] w-[18px] flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
