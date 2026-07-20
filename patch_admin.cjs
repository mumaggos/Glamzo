const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
content = content.replace(
  /<\/div>\s*<\/div>\s*<button\s*onClick=\{syncAdminDatasets\}\s*disabled=\{loading\}/g,
  `</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("support")}
              className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {(unreadMessagesCount > 0 || disputes.filter(d => d.status === "open" || d.status === "in_review").length > 0) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-50 animate-pulse"></span>
              )}
            </button>
            <button
            onClick={syncAdminDatasets}
            disabled={loading}`
);
fs.writeFileSync('src/pages/Admin.tsx', content);
