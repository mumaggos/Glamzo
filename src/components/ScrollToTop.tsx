import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";

/**
 * ScrollToTop ensures that whenever the URL route changes,
 * the viewport is automatically scrolled to the top of the page.
 */
export default function ScrollToTop() {
    const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  }, [pathname]);

  return null;
}
