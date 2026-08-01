import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  schema?: any;
}

export default function SeoHead({ title, description, image, url, schema }: SeoHeadProps) {
  const globalDesc = description.length > 155 ? description.substring(0, 152) + '...' : description;
  const ogDesc = description.length > 120 ? description.substring(0, 117) + '...' : description;
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
  const ogUrl = url || `${domain}${currentPath}`;
  const ogImage = image || `${domain}/favicon-v2.svg`;

  const currentLang = (pathParts[1] && supportedLangs.includes(pathParts[1])) ? pathParts[1] : 'pt';
  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={globalDesc} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="Glamzo" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />

      {supportedLangs.map((lang) => {
        const langPrefix = lang === 'pt' ? '' : `/${lang}`;
        const href = `${domain}${langPrefix}${basePath === '/' ? '' : basePath}`;
        return (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        );
      })}
      <link rel="alternate" hrefLang="x-default" href={`${domain}${basePath}`} />
      
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
