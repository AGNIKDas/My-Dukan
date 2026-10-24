import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Lock, Mail, AlertCircle, ArrowLeft, KeyRound, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SHOP_INFO } from '../../utils/constants';

export function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to admin dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase is not configured yet. Please configure your .env file with your Supabase URL and Anon Key.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* Top Back Link */}
        <Link to="/" className="btn-back-home">
          <ArrowLeft size={16} />
          <span>Back to Desh Electric Store</span>
        </Link>

        <div className="admin-login-card">
          {/* Header */}
          <div className="admin-card-header">
            <div className="admin-brand-icon">
              <Zap size={28} className="bolt-icon" />
            </div>
            <h1 className="admin-card-title">Desh Electric Admin</h1>
            <p className="admin-card-subtitle">
              Secure catalog and price management portal for {SHOP_INFO.owner}
            </p>
          </div>

          {/* If Supabase is NOT configured yet: Informative Setup Guide */}
          {!isSupabaseConfigured ? (
            <div className="supabase-unconfigured-alert">
              <div className="alert-header">
                <AlertCircle size={22} className="alert-icon" />
                <h3>Supabase Configuration Required</h3>
              </div>
              <p className="alert-intro">
                Real administrator authentication requires Supabase Auth. To enable secure login without hardcoding passwords, follow these 3 quick steps:
              </p>
              <ol className="setup-steps-list">
                <li>
                  <strong>1. Create Free Project:</strong> Go to{' '}
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                    supabase.com <ExternalLink size={12} />
                  </a>{' '}
                  and create a new project.
                </li>
                <li>
                  <strong>2. Run Database Script:</strong> Open the Supabase <em>SQL Editor</em> and run the script in{' '}
                  <code>supabase/schema.sql</code>.
                </li>
                <li>
                  <strong>3. Add Environment Keys:</strong> Create a <code>.env.local</code> file in this project root:
                  <pre className="code-snippet">
                    VITE_SUPABASE_URL=https://xyz.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=your-anon-key
                  </pre>
                </li>
                <li>
                  <strong>4. Create Admin User:</strong> Go to <em>Authentication &gt; Users &gt; Add User</em> in Supabase and create your administrator login credentials.
                </li>
              </ol>
              <div className="alert-footer">
                <CheckCircle size={16} />
                <span>Once configured, refresh this page to sign in securely.</span>
              </div>
            </div>
          ) : (
            /* Real Supabase Auth Form */
            <form onSubmit={handleSubmit} className="admin-login-form">
              {errorMsg && (
                <div className="form-error-banner" role="alert">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="admin-email" className="form-label">
                  Administrator Email
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="admin-email"
                    type="email"
                    className="form-input"
                    placeholder="admin@deshelectric.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="admin-password" className="form-label">
                  Password
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="admin-password"
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-admin-submit"
                disabled={loading}
              >
                <KeyRound size={18} />
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              </button>

              <div className="login-security-notice">
                <Lock size={13} />
                <span>Protected by Supabase Auth with Row Level Security. Passwords are never stored in code.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
