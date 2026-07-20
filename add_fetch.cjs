const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
content = content.replace(
  /if \(\!disputesErr \&\& disputesData\) \{\s*setDisputes\(disputesData\);\s*\}/g,
  `if (!disputesErr && disputesData) {
          setDisputes(disputesData);
        }
        const { count, error: msgErr } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', 'admin')
          .eq('is_read', false);
        if (!msgErr && count !== null) {
          setUnreadMessagesCount(count);
        }`
);
fs.writeFileSync('src/pages/Admin.tsx', content);
