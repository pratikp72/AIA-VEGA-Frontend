import React, { useState } from 'react';
import Image from 'next/image';
import { apiService } from '../../services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { STORAGE_KEYS } from '@/lib/constants';
import toast from 'react-hot-toast';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';

const LOGIN_API = API_ENDPOINTS.AUTH.LOGIN;
const FORGOT_PASSWORD_API = API_ENDPOINTS.AUTH.FORGOT_PASSWORD;
const NO_EMAIL_MESSAGE =
  'The Employee ID you have entered, does not have a personal email id registered against it. Contact an IT team representative to help you with this process.';
const INVALID_ID_MESSAGE = 'The Employee ID you entered is incorrect. Please try again.';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotModalError, setForgotModalError] = useState('');
  const [forgotModalNotice, setForgotModalNotice] = useState('');

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value.trim());
    setForgotMessage('');
  };


  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.post(LOGIN_API, { identifier, password });
      if (response?.jwt) {
       localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.jwt);
       localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
       window.location.href = '/home';
      } else {
        toast.error('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      const raw = parseApiError(err);
      toast.error(toFriendlyMessage(raw));
    } finally {
      setLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotModalError('');
    setForgotModalNotice('');
    setForgotLoading(false);
  };

  const openForgotModal = () => {
    setForgotMessage('');
    setForgotModalError('');
    setForgotModalNotice('');
    setForgotEmail('');
    setShowForgotModal(true);
  };

  const handleForgotPassword = async () => {
    setForgotModalError('');
    setForgotModalNotice('');
    setForgotMessage('');

    const employeeId = forgotEmail.trim();
    if (!employeeId) {
      setForgotModalError('Please enter Employee ID.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await apiService.post(FORGOT_PASSWORD_API, {
        identifier: employeeId,
      });
      const hasEmail = response?.hasEmail ?? response?.data?.hasEmail;
      const emailSent = response?.emailSent ?? response?.data?.emailSent;
      const invalidIdentifier = response?.invalidIdentifier ?? response?.data?.invalidIdentifier;
      const errorCode = response?.errorCode ?? response?.data?.errorCode;
      const apiMessage = String(response?.message ?? response?.data?.message ?? '').toLowerCase();

      if (hasEmail === true && emailSent === true) {
        const message = 'Reset email sent. Check inbox.';
        setForgotMessage(message);
        toast.success(message);
        setForgotEmail('');
        closeForgotModal();
        return;
      }

      if (invalidIdentifier === true || errorCode === 'INVALID_IDENTIFIER') {
        setForgotModalError(INVALID_ID_MESSAGE);
        return;
      }

      if (hasEmail === false || errorCode === 'NO_EMAIL' || apiMessage.includes('no email')) {
        setForgotModalError(NO_EMAIL_MESSAGE);
        return;
      }

      setForgotModalError('Unable to process forgot password request. Please try again.');
    } catch (err) {
      const raw = parseApiError(err);
      const lower = String(raw || '').toLowerCase();
      if (lower.includes('invalid employee id') || lower.includes('wrong employee id') || lower.includes('employee id not found')) {
        setForgotModalError(INVALID_ID_MESSAGE);
      } else if (lower.includes('no email') || lower.includes('does not have a personal email')) {
        setForgotModalError(NO_EMAIL_MESSAGE);
      } else {
        setForgotModalError(raw || 'Unable to process forgot password request.');
      }
    } finally {
      setForgotLoading(false);
    }
  };
  return (
    <div className="glass-card">
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <Image src="/aia_logo.png" alt="AIA Logo" width={70} height={70} priority />
          <span style={{ fontSize: 28, fontWeight: 300, color: '#fff', letterSpacing: 2 }}>|</span>
          <Image src="/vega_logo.png" alt="Vega Logo" width={70} height={70} priority />
        </div>
        <h2 style={{ fontWeight: 500, color: '#fff', fontSize: 28, marginTop: 8, letterSpacing: 0.5 }}>
          Login
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* Employee ID */}
        <div style={{ marginBottom: '24px' }}>
          <label className="glass-label">Employee ID</label>
          <input
            type="text"
            placeholder="Enter Emp Code (AIA) or Emp ID (Vega)"
            value={identifier}
            onChange={handleIdentifierChange}
            className="glass-input"
            required
            autoComplete="username"
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
              style={{ paddingRight: '70px' }}
              required
              autoComplete="current-password"
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
        {forgotMessage && (
          <p
            role="status"
            aria-live="polite"
            style={{
              marginTop: '12px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 500,
              color: '#86efac',
            }}
          >
            {forgotMessage}
          </p>
        )}
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
        onClick={openForgotModal}
      >
        Forgot Password?
      </p>

      </form>

      <ForgotPasswordModal
        open={showForgotModal}
        email={forgotEmail}
        onEmailChange={(value) => {
          setForgotEmail(value);
          setForgotModalError('');
          setForgotModalNotice('');
        }}
        loading={forgotLoading}
        error={forgotModalError}
        notice={forgotModalNotice}
        onClose={closeForgotModal}
        onSubmit={handleForgotPassword}
      />

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