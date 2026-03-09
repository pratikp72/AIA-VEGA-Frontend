'use client';

import { io } from 'socket.io-client';

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api')
  .replace(/\/api\/?$/, '');

let socket = null;

/**
 * Returns (or creates) the singleton socket.io client.
 * Returns null when called server-side or before the user is authenticated.
 */
export function getSocket() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('authToken');
  if (!token) return null;

  if (socket && !socket.disconnected) return socket;

  if (socket && socket.disconnected) {
    socket.removeAllListeners();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    _tryJoinRoom(socket, token);
  });

  socket.io.on('reconnect', () => {
    const freshToken = localStorage.getItem('authToken');
    if (freshToken) _tryJoinRoom(socket, freshToken);
  });

  return socket;
}

/**
 * Decodes the JWT payload and emits a 'join-room' event so the server
 * places this socket in the user's personal room (user_<id>).
 */
function _tryJoinRoom(sock, token) {
  try {
    const parts = (token || '').split('.');
    if (parts.length < 2) return;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const userId = payload?.id ?? payload?.sub;
    if (!userId) return;
    sock.emit('join-room', `user_${userId}`);
  } catch {
    // Malformed token — the server-side middleware will have already set userId
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function isSocketConnected() {
  return socket?.connected ?? false;
}

