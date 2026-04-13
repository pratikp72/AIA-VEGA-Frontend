'use client';
import React from 'react';
import BackgroundGrid from '../../components/login/BackgroundGrid';
import LoginForm from '../../components/login/LoginForm';
import { useImageGrid } from '../../hooks/useImageGrid';

/**
 * Login page with animated background grid
 */
const LoginPage = () => {
  const { slots } = useImageGrid();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#000',
    }}>
      {/* Animated Background Grid */}
      <BackgroundGrid slots={slots} />

      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        // backdropFilter: 'blur(8px)',
        background: 'rgba(0,0,0,0.3)',
      }} />

      {/* Login Form */}
      <LoginForm />

    </div>
  );
};

export default LoginPage;
