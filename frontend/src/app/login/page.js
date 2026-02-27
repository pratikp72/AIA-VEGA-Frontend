'use client';
import React, { useState } from 'react';
import { apiService } from '../../services/api';
const LOGIN_API = '/auth/local';

const LoginPage = () => {
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
      const response = await apiService.post(
        LOGIN_API,
        { identifier, password }
      );
      // Save token and user info to localStorage
      if (response && response.jwt) {
        localStorage.setItem('authToken', response.jwt);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = '/home'; // Redirect to home page
      } else {
        setError('Invalid login response.');
      }
    } catch (err) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid of images */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '2px',
        opacity: 0.85,
      }}>
        {[...Array(24)].map((_, i) => (
          <img
            key={i}
            src={`/login-bg/bg${i + 1}.jpg`}
            alt={`bg${i + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ))}
      </div>
      {/* Overlay for blur and darken */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        backdropFilter: 'blur(6px)',
        background: 'rgba(0,0,0,0.35)',
      }} />
      {/* Glassmorphism login box */}
      <div style={{
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(12px)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        padding: '40px 32px',
        width: '370px',
        zIndex: 2,
        border: '1px solid rgba(255,255,255,0.25)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <img src="/aia_logo.png" alt="Logo" style={{ height: 36 }} />
            <span style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>|</span>
            <img src="/vega_logo.png" alt="Vega Logo" style={{ height: 36 }} />
          </div>
          <h2 style={{ fontWeight: 600, color: '#fff', fontSize: 28, marginTop: 8 }}>Login</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.7)' }}
              required
            />
          </div>
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.7)' }}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 12, top: 14, cursor: 'pointer', color: '#888', fontSize: 14 }}
            >{showPassword ? 'Hide' : 'Show'}</span>
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#111', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginBottom: '16px', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
      {/* Overlay for background images */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        background: 'rgba(0,0,0,0.3)',
      }} />
    </div>
  );
};

export default LoginPage;
