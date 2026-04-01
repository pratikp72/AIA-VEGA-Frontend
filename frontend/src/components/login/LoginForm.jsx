import React, { useState } from 'react';
import Image from 'next/image';
import { apiService } from '../../services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { STORAGE_KEYS } from '@/lib/constants';
import { useRef } from 'react';

const LOGIN_API = API_ENDPOINTS.AUTH.LOGIN;

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFirstLogin, setUserFirstLogin] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const clearError = () => setError('');
  
  const typingTimeoutRef = useRef(null);

  const handleIdentifierChange = (e) => {
      const value = e.target.value.trim();
      setIdentifier(value);
      clearError();

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (isCompleteId(value)) {
          checkUserFirstLogin(value);
        } else {
          setUserFirstLogin(false); // reset if ID is incomplete
        }
      }, 400); // 400ms debounce
  };

    // Helper to check if ID is complete
  const isCompleteId = (id) => {
      if (!id) return false;
      if (id.toUpperCase().startsWith('AIA')) {
        return id.length >= 7; // AIA min length
      } else {
        return id.length >= 4; // Vega min length
      }
  };

  const handlePasswordChange   = (e) => { setPassword(e.target.value);   clearError(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiService.post(LOGIN_API, { identifier, password });
      if (response?.jwt) {
       localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.jwt);
       localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        setUserFirstLogin(response.user?.is_first_login || false);
       window.location.href = '/home';
      } else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      const raw = parseApiError(err);
      setError(toFriendlyMessage(raw));
    } finally {
      setLoading(false);
    }
  };

  const hasError = Boolean(error);

  const checkUserFirstLogin = async (empId) => {
  if (!empId) return setUserFirstLogin(false);

  try {
    const res = await apiService.get(`${API_ENDPOINTS.AUTH.CHECK_USER}?identifier=${empId}`);

    if (res.exists) {
      setUserFirstLogin(res.is_first_login);
      setError(''); // clear previous errors
    } else {
      setUserFirstLogin(false);
      setError('No user found with this Employee ID'); // show error
    }
  } catch (err) {
    if (err?.response?.status === 404) {
      // User not found
      setUserFirstLogin(false);
      setError('No user found with this Employee ID');
    } else {
      setUserFirstLogin(false);
      setError('Failed to check user. Please try again.');
    }
  }
};

  return (
    <div className="glass-card">
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <Image src="/aia_logo.png" alt="AIA Logo" width={40} height={40}
            style={{ height: 40, width: 'auto' }} priority />
          <span style={{ fontSize: 28, fontWeight: 300, color: '#fff', letterSpacing: 2 }}>|</span>
          <Image src="/vega_logo.png" alt="Vega Logo" width={40} height={40}
            style={{ height: 40, width: 'auto' }} priority />
        </div>
        <h2 style={{ fontWeight: 500, color: '#fff', fontSize: 32, marginTop: 8, letterSpacing: 0.5 }}>
          Login
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Error Banner ── */}
        {hasError && (
          <>
            <style>{`
              @keyframes errorShake {
                0%   { transform: translateX(0); }
                20%  { transform: translateX(-6px); }
                40%  { transform: translateX(6px); }
                60%  { transform: translateX(-4px); }
                80%  { transform: translateX(4px); }
                100% { transform: translateX(0); }
              }
              @keyframes errorFadeIn {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div
              role="alert"
              aria-live="assertive"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.55)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '20px',
                backdropFilter: 'blur(8px)',
                animation: 'errorFadeIn 0.25s ease, errorShake 0.4s ease',
              }}
            >
              {/* Warning icon */}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
                style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
                <path d="M10 2L1.5 17h17L10 2z" stroke="#f87171" strokeWidth="1.5"
                  strokeLinejoin="round" fill="rgba(239,68,68,0.2)" />
                <path d="M10 8v4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="14.5" r="0.75" fill="#f87171" />
              </svg>

              <p style={{ margin: 0, flex: 1, color: '#fca5a5', fontSize: 13.5, fontWeight: 500, lineHeight: 1.5 }}>
                {error}
              </p>

              <button type="button" onClick={clearError} aria-label="Dismiss error"
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: '#fca5a5', fontSize: 20, lineHeight: 1, padding: '0 0 0 6px',
                  flexShrink: 0, opacity: 0.8 }}>
                ×
              </button>
            </div>
          </>
        )}

        {/* Employee ID */}
        <div style={{ marginBottom: '24px' }}>
          <label className="glass-label">Employee ID</label>
          <input
            type="text"
            placeholder="Enter Emp Code (AIA) or Emp ID (Vega)"
            value={identifier}
            onChange={handleIdentifierChange}
            className="glass-input"
            style={hasError ? { borderColor: 'rgba(239,68,68,0.6)', boxShadow: '0 0 0 2px rgba(239,68,68,0.12)' } : undefined}
            required
            autoComplete="username"
            aria-invalid={hasError}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label className="glass-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="glass-input"
              style={{
                paddingRight: '70px',
                ...(hasError ? { borderColor: 'rgba(239,68,68,0.6)', boxShadow: '0 0 0 2px rgba(239,68,68,0.12)' } : {}),
              }}
              required
              autoComplete="current-password"
              aria-invalid={hasError}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
              👁 {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
        <p
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 500,
          color: '#257eec', // blue color
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
        onClick={() => setShowForgotModal(true)}
      >
        Forgot Password?
      </p>

      </form>

        {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowForgotModal(false)} // close when clicking outside
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '400px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h3 style={{ marginBottom: '12px' }}>Forgot Password ?</h3>
            <p>Please contact your administrator to reset your password.</p>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const parseApiError = (err) => {
  if (err?.error?.message) return err.error.message;
  if (err?.message) return err.message;
  return 'Login failed. Please try again.';
};

const toFriendlyMessage = (raw = '') => {
  const lower = raw.toLowerCase();
  if (lower.includes('inactive'))
    return 'User is inactive.';
  if (
    lower.includes('invalid') ||
    lower.includes('password') ||
    lower.includes('credentials') ||
    lower.includes('identifier or password')
  ) return 'Incorrect Employee ID or password. Please try again.';
  if (lower.includes('not found') || lower.includes('identifier'))
    return 'No account found with that Employee ID.';
  if (lower.includes('locked') || lower.includes('blocked'))
    return 'Your account has been locked. Please contact your administrator.';
  if (lower.includes('network'))
    return 'Network error. Please check your connection and try again.';
  return raw.length < 120 ? raw : 'Login failed. Please try again.';
};

export default LoginForm;