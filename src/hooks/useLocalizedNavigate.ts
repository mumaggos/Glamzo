import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function useLocalizedNavigate() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  return (to: string | number | { pathname: string; [key: string]: any }, options?: any) => {
    if (typeof to === 'number') return navigate(to);
    const currentLang = i18n.language || 'pt';
    const isDefaultLang = currentLang.startsWith('pt');
    
    let path = typeof to === 'string' ? to : to.pathname || '';
    
    const pathParts = path.split('/');
    const supportedLangs = ['pt', 'en', 'es', 'fr'];
    
    if (pathParts[1] && supportedLangs.includes(pathParts[1])) {
       if (isDefaultLang) {
           pathParts.splice(1, 1);
           path = pathParts.join('/') || '/';
       } else {
           pathParts[1] = currentLang;
           path = pathParts.join('/');
       }
    } else {
       if (!isDefaultLang && path.startsWith('/')) {
           path = `/${currentLang}${path === '/' ? '' : path}`;
       }
    }
    
    if (typeof to === 'string') {
        navigate(path, options);
    } else {
        navigate({ ...to, pathname: path }, options);
    }
  };
}
