const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Replace the inner HTML of root with a better skeleton
const newRootContent = `
        <div style="width: 100%; height: 72px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; padding: 0 24px; position: fixed; top: 0; left: 0; background: white; z-index: 50;">
          <div style="width: 120px; height: 32px; background: #f8fafc; border-radius: 8px;"></div>
          <div style="flex: 1;"></div>
          <div style="width: 32px; height: 32px; background: #f8fafc; border-radius: 50%; margin-right: 16px;"></div>
          <div style="width: 32px; height: 32px; background: #f8fafc; border-radius: 50%;"></div>
        </div>
        <div style="width: 100%; max-width: 1280px; margin: 0 auto; padding: 160px 24px 60px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
          <h1 style="font-size: 3rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; line-height: 1.1;">O seu momento de beleza, marcado num instante.</h1>
          <p style="font-size: 1.125rem; color: #64748b; margin-bottom: 2rem;">A melhor plataforma de agendamentos de estética em Portugal.</p>
          <div style="width: 100%; max-width: 600px; height: 64px; background: #f8fafc; border-radius: 16px; margin: 0 auto;"></div>
        </div>
`;

code = code.replace(
  /<div id="root">[\s\S]*?<\/div>/,
  `<div id="root">${newRootContent}</div>`
);

fs.writeFileSync('index.html', code);
