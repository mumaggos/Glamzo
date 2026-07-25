import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LocalizedLink: React.FC<LinkProps> = ({ to, children, ...props }) => {
  const { i18n } = useTranslation();
  
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

  const newTo = typeof to === 'string' ? path : { ...to, pathname: path };

  return (
    <Link to={newTo} {...props}>
      {children}
    </Link>
  );
};
