import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SeoHeadProps {
  title: string;
  description: string;
}

export default function SeoHead({ title, description }: SeoHeadProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const supportedLangs = ['pt', 'en', 'es', 'fr'];
  const pathParts = currentPath.split('/');
  let basePath = currentPath;
  
  if (pathParts[1] && supportedLangs.includes(pathParts[1])) {
    basePath = '/' + pathParts.slice(2).join('/');
  }
  
  if (basePath === '//') basePath = '/';
  if (!basePath.startsWith('/')) basePath = '/' + basePath;

  const domain = 'https://glamzo.pt';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {supportedLangs.map((lang) => {
        const langPrefix = lang === 'pt' ? '' : `/${lang}`;
        const href = `${domain}${langPrefix}${basePath === '/' ? '' : basePath}`;
        return (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        );
      })}
      <link rel="alternate" hrefLang="x-default" href={`${domain}${basePath}`} />
    </Helmet>
  );
}
