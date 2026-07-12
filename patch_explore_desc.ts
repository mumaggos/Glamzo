import * as fs from 'fs';
let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const search = `<p className="text-xs text-slate-500 truncate">{b.city} {b.distance && \`(\${b.distance.toFixed(1)}km)\`}</p>`;
const replace = `<p className="text-xs text-slate-500 truncate">{b.city} {b.distance && \`(\${b.distance.toFixed(1)}km)\`}</p>
          {viewMode === 'list' && b.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.description}</p>
          )}`;

content = content.replace(search, replace);
fs.writeFileSync('src/pages/Explore.tsx', content);
