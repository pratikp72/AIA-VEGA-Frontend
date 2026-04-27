import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { STORAGE_KEYS } from '@/lib/constants';
import { Eye, EyeOff } from 'lucide-react';


const ResetPasswordModal = ({ open, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await changePassword(newPassword, confirmPassword);
      onSuccess();
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div style={overlayStyle}>
      <div style={modalStyle}>
        
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={titleStyle}>Update Your Password</h2>
          <p style={subtitleStyle}>
            You must change your password before continuing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* New Password */}
        <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>New Password</label>

            <div style={{ position: 'relative' }}>
                <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                    ...inputStyle,
                    paddingRight: '45px',
                }}
                />

                <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={toggleBtnStyle}
                >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>


          {/* Confirm Password */}
        <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Confirm Password</label>

            <div style={{ position: 'relative' }}>
                <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={{
                    ...inputStyle,
                    paddingRight: '45px',
                }}
                />

                <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={toggleBtnStyle}
                >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>

          {/* Error */}
          {error && (
            <div style={errorBox}>
              {error}
            </div>
          )}

          {/* Button */}
          <button type="submit" disabled={loading} className='submit-button'>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

ResetPasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export async function changePassword(newPassword, confirmPassword) {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) throw new Error('No auth token found.');

  console.log({ newPassword, confirmPassword });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword, confirmPassword }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error?.message || data?.message || 'Failed to reset password.'
    );
  }

  return res.json();
}

/* ================= UI STYLES ================= */

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
  marginBottom: '6px',
  color: '#111827',
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

const subtitleStyle = {
  fontSize: '14px',
  color: '#6b7280',
};

const fieldWrapper = {
  marginBottom: '18px',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  outline: 'none',
};

const errorBox = {
  background: '#fee2e2',
  color: '#b91c1c',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '13px',
  marginBottom: '14px',
};

/* Animation */
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

export default ResetPasswordModal;