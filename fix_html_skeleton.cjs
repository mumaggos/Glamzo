const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const skeleton = `
        <div style="width: 100%; height: 72px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; padding: 0 24px; position: fixed; top: 0; left: 0; background: white; z-index: 50;">
          <div style="width: 120px; height: 32px; background: #f8fafc; border-radius: 8px;"></div>
          <div style="flex: 1;"></div>
          <div style="width: 32px; height: 32px; background: #f8fafc; border-radius: 50%; margin-right: 16px;"></div>
          <div style="width: 32px; height: 32px; background: #f8fafc; border-radius: 50%;"></div>
        </div>
        <div style="width: 100%; max-width: 1024px; margin: 120px auto 0; padding: 0 24px;">
          <div style="width: 60%; height: 48px; background: #f8fafc; border-radius: 12px; margin: 0 auto 24px;"></div>
          <div style="width: 40%; height: 24px; background: #f8fafc; border-radius: 8px; margin: 0 auto 48px;"></div>
          <div style="width: 100%; height: 64px; background: #f8fafc; border-radius: 16px; margin: 0 auto;"></div>
        </div>
`;

html = html.replace(/<div id="root">\s*<div[^>]*>\s*<\/div>\s*<\/div>/g, `<div id="root">${skeleton}</div>`);

fs.writeFileSync('index.html', html);
