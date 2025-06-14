import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../utils/api';
import { setStoredAuth, isAuthenticated } from '../utils/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      router.push('/');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);

      // Store authentication data
      setStoredAuth(response.sessionId, response.user);

      // Redirect to dashboard
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    const credentials = {
      admin: { email: 'admin@tegpr.com', password: 'admin123' },
      ae: { email: 'ae@tegpr.com', password: 'ae123' },
      supervisor: { email: 'supervisor@tegpr.com', password: 'super123' }
    };

    const cred = credentials[role];
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{ marginTop: '30px', padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#4a5568' }}>
            Demo Credentials
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="btn btn-sm btn-secondary"
              disabled={loading}
            >
              Admin
            </button>
            <button 
              type="button"
              onClick={() => fillDemoCredentials('ae')}
              className="btn btn-sm btn-secondary"
              disabled={loading}
            >
              Account Executive
            </button>
            <button 
              type="button"
              onClick={() => fillDemoCredentials('supervisor')}
              className="btn btn-sm btn-secondary"
              disabled={loading}
            >
              Supervisor
            </button>
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#718096' }}>
            Click any role above to auto-fill credentials
          </p>
        </div>

        {/* Backend Connection Info */}
        <div style={{ marginTop: '20px', padding: '15px', background: '#e6fffa', borderRadius: '8px', border: '1px solid #b2f5ea' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#234e52' }}>
            🔗 Connecting to Railway backend
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#4a5568' }}>
            {process.env.NEXT_PUBLIC_API_URL || 'Environment variable not set'}
          </p>
        </div>
      </div>
    </div>
  );
}
