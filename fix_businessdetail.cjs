const fs = require('fs');
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

content = content.replace(
  '  return (\n      {seoData && <SeoHead title={seoData.title} description={seoData.desc} image={seoData.image} schema={seoData.schema} />}\n    <>\n      <Helmet>',
  '  return (\n    <>\n      {seoData && <SeoHead title={seoData.title} description={seoData.desc} image={seoData.image} schema={seoData.schema} />}\n      <Helmet>'
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
