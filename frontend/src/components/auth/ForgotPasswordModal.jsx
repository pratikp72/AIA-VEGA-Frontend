import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const ForgotPasswordModal = ({
  open,
  email,
  onEmailChange,
  loading,
  error,
  notice,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Forgot Password?</h3>
          <p style={subtitleStyle}>
            Enter your company email to receive a reset password link.
          </p>
        </div>

        <div style={contentStyle}>
          <div>
            <label style={labelStyle}>Company Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={errorTextStyle}>
              {error}
            </p>
          )}

          <div style={infoBoxStyle}>
            <p style={infoTextStyle}>
              {notice || 'If you do not have a company email, please contact your administrator to reset your password.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>

          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

ForgotPasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  email: PropTypes.string.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  notice: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

ForgotPasswordModal.defaultProps = {
  error: '',
  notice: '',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(23, 6, 41, 0.55)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '20px',
};

const modalStyle = {
  width: '460px',
  maxWidth: '90%',
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 24px 65px rgba(42, 9, 79, 0.35)',
  border: '1px solid #e5e7eb',
};

const headerStyle = {
  marginBottom: '18px',
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const titleStyle = {
  margin: 0,
  marginBottom: '8px',
  fontSize: '24px',
  fontWeight: 700,
  color: '#111827',
};

const subtitleStyle = {
  marginTop: 0,
  marginBottom: 0,
  fontSize: '14px',
  lineHeight: 1.5,
  color: '#475569',
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '12px 13px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  outline: 'none',
  fontSize: '14px',
  color: '#1f2937',
};

const errorTextStyle = {
  margin: 0,
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  background: '#fef2f2',
  fontSize: '13px',
  color: '#dc2626',
};

const primaryButtonStyle = {
  padding: '11px 16px',
  borderRadius: '10px',
  border: 'none',
  background: 'var(--color-primary)',
  color: '#ffffff',
  width: '100%',
  fontWeight: 600,
  letterSpacing: '0.2px',
};

const infoBoxStyle = {
  padding: '11px 12px',
  borderRadius: '8px',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
};

const infoTextStyle = {
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.45,
  color: '#1e3a8a',
};

const secondaryButtonStyle = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  color: '#111827',
  cursor: 'pointer',
  width: '100%',
  fontWeight: 600,
};

export default ForgotPasswordModal;
