import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import axios from 'axios';
import './i18n';
import App from './App.tsx';
import './index.css';

// Prevent external libraries from crashing when attempting to overwrite window.fetch
// The iframe environment often locks window.fetch as a getter.
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get: () => originalFetch,
      set: () => { /* no-op to ignore bad polyfills */ },
      configurable: true
    });
  } catch (e) {
    // Ignore if already locked
  }
}

// Global HTTP Interceptor to handle session expirations or database changes smoothly
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server rejects the token (like when JWT_SECRET was updated)
    if (error.response && error.response.status === 401) {
      // Clear the invalid token to prevent infinite 401 loops
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
