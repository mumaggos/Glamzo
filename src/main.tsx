import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './i18n';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import { useTranslation } from "react-i18next";

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
    {/* @ts-ignore */}
      <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
