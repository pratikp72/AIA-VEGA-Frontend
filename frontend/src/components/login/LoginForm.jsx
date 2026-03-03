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
    <div className="glass-card">
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
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Email Field */}
        <div style={{ marginBottom: '24px' }}>
          <label className="glass-label">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="glass-input"
            required
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '24px' }}>
          <label className="glass-label">
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="glass-input"
              style={{ paddingRight: '70px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              👁 {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
