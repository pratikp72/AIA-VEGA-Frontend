'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { STORAGE_KEYS } from '@/lib/constants';

const RESET_FORGOT_PASSWORD_API = API_ENDPOINTS.AUTH.RESET_FORGOT_PASSWORD;

export default function ResetForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = useMemo(() => searchParams.get('code') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCodeInvalid, setIsCodeInvalid] = useState(false);

  const validate = () => {
    if (!code) {
      setError('Invalid or missing reset code.');
      setIsCodeInvalid(true);
      return false;
    }
    if (!newPassword || !confirmPassword) {
      setError('All fields are required.');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    setIsCodeInvalid(false);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await apiService.post(RESET_FORGOT_PASSWORD_API, {
        code,
        password: newPassword,
        passwordConfirmation: confirmPassword,
      });

      const hasAuthSession =
        typeof window !== 'undefined' &&
        Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));

      if (hasAuthSession) {
        toast.success('Password reset successful. Redirecting to home.');
        router.replace('/home');
      } else {
        toast.success('Password reset successful. Please log in.');
        router.replace('/login');
      }
    } catch (err) {
      const rawMessage =
        err?.error?.message ||
        err?.message ||
        'Failed to reset password. Please try again.';

      const normalizedMessage = String(rawMessage).toLowerCase();
      if (normalizedMessage.includes('invalid') || normalizedMessage.includes('expired')) {
        setIsCodeInvalid(true);
        setError('This reset link is invalid or expired. Please request a new reset link from Login.');
      } else {
        setIsCodeInvalid(false);
        setError(rawMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={titleStyle}>Reset Your Password</h1>
          <p style={subtitleStyle}>
            Enter and confirm your new password to finish resetting your account.
          </p>
        </div>

        {!code && (
          <div style={errorBox}>
            Reset code is missing from the URL.
          </div>
        )}

        {error && (
          <div role="alert" style={errorBox}>
            {error}
          </div>
        )}

        {isCodeInvalid && (
          <button
            type="button"
            onClick={() => router.push('/login')}
            style={requestNewLinkButtonStyle}
          >
            Go to Login to request new reset link
          </button>
        )}

        <form onSubmit={handleSubmit}>
          <div style={fieldWrapper}>
            <label style={labelStyle}>
            New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                style={{
                  ...inputStyle,
                  paddingRight: '45px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label="Toggle new password visibility"
                style={toggleBtnStyle}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>
            Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                style={{
                  ...inputStyle,
                  paddingRight: '45px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label="Toggle confirm password visibility"
                style={toggleBtnStyle}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code}
            className="submit-button"
            style={loading || !code ? disabledButtonStyle : undefined}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '24px',
};

const modalStyle = {
  width: '420px',
  maxWidth: '90%',
  background: '#ffffff',
  borderRadius: '16px',
  padding: '28px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  animation: 'fadeIn 0.25s ease',
};

const titleStyle = {
  fontSize: '22px',
  fontWeight: '600',
  margin: 0,
  marginBottom: '6px',
  color: '#111827',
};

const subtitleStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: 0,
};

const fieldWrapper = {
  marginBottom: '18px',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '8px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  outline: 'none',
};

const toggleBtnStyle = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#6b7280',
  display: 'flex',
  alignItems: 'center',
};

const errorBox = {
  background: '#fee2e2',
  color: '#b91c1c',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '13px',
  marginBottom: '14px',
};

const disabledButtonStyle = {
  opacity: 0.7,
  cursor: 'not-allowed',
};

const requestNewLinkButtonStyle = {
  width: '100%',
  marginBottom: '14px',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  background: '#f9fafb',
  color: '#1f2937',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

if (typeof window !== 'undefined' && !document.getElementById('reset-password-page-fade-in')) {
  const style = document.createElement('style');
  style.id = 'reset-password-page-fade-in';
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
