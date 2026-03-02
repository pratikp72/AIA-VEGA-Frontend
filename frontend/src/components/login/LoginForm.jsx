import React, { useState } from 'react';
import Image from 'next/image';
import { apiService } from '../../services/api';

const LOGIN_API = '/auth/local';

/**
 * Login form component with glassmorphism design
 */
const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.post(LOGIN_API, { identifier, password });
      
      if (response && response.jwt) {
        localStorage.setItem('authToken', response.jwt);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = '/home';
      } else {
        setError('Invalid login response.');
      }
    } catch (err) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      padding: '48px 40px',
      width: '420px',
      zIndex: 2,
      border: '1px solid rgba(255,255,255,0.2)',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <Image 
            src="/aia_logo.png" 
            alt="AIA Logo" 
            width={40} 
            height={40} 
            style={{ height: 40, width: 'auto' }} 
            priority 
          />
          <span style={{ 
            fontSize: 28, 
            fontWeight: 300, 
            color: '#fff', 
            letterSpacing: 2 
          }}>
            |
          </span>
          <Image 
            src="/vega_logo.png" 
            alt="Vega Logo" 
            width={40} 
            height={40} 
            style={{ height: 40, width: 'auto' }} 
            priority 
          />
        </div>
        <h2 style={{ 
          fontWeight: 500, 
          color: '#fff', 
          fontSize: 32, 
          marginTop: 8, 
          letterSpacing: 0.5 
        }}>
          Login
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            color: '#ff6b6b',
            marginBottom: 16,
            textAlign: 'center',
            fontSize: 14,
            background: 'rgba(255,107,107,0.1)',
            padding: '8px',
            borderRadius: '6px',
          }}>
            {error}
          </div>
        )}
        
        {/* Email Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            color: '#fff', 
            fontSize: 14, 
            marginBottom: 8, 
            fontWeight: 500 
          }}>
            Email
          </label>
          <input
            type="text"
            placeholder="Enter your email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.85)',
              fontSize: 15,
              outline: 'none',
              transition: 'all 0.2s',
            }}
            required
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            color: '#fff', 
            fontSize: 14, 
            marginBottom: 8, 
            fontWeight: 500 
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                paddingRight: '55px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.85)',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
              }}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#666',
                fontSize: 13,
                userSelect: 'none',
                fontWeight: 500,
              }}
            >
              👁 {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        {/* <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#fff', 
            fontSize: 14, 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{ marginRight: 8, cursor: 'pointer' }}
            />
            Remember me
          </label>
          <a href="#" style={{ 
            color: '#fff', 
            fontSize: 14, 
            textDecoration: 'none', 
            fontWeight: 500 
          }}>
            Forgot Password
          </a>
        </div> */}

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            background: '#000',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        {/* Sign Up Link */}
        {/* <div style={{ 
          textAlign: 'center', 
          marginTop: 20, 
          color: '#fff', 
          fontSize: 14 
        }}>
          Don't have an account? {' '}
          <a href="#" style={{ 
            color: '#fff', 
            fontWeight: 600, 
            textDecoration: 'none' 
          }}>
            Sign up
          </a>
        </div> */}
      </form>
    </div>
  );
};

export default LoginForm;
