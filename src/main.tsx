import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("main loaded");

// Highly optimized Safari / iOS WebKit identification for hardware-safe styling overrides
try {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                   /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.vendor && navigator.vendor.includes('Apple'));
  if (isSafari) {
    document.documentElement.classList.add('safari-ios');
  }
} catch (e) {
  console.error('Core detection failed:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
