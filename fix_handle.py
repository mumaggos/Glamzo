import re

with open("src/components/DashboardMessages.tsx", "r") as f:
    text = f.read()

text = re.sub(
    r"await supabase\.from\('messages'\)\.update\(\{ is_read: true \}\)\.in\('id', unreadIds\);\s*\}\s*\}\s*\};\s*useEffect",
    r"await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);\n         setSessions(prev => prev.map(s => s.customer_id === sess.customer_id ? { ...s, unread_count: 0 } : s));\n      }\n    }\n  };\n\n  useEffect",
    text
)

with open("src/components/DashboardMessages.tsx", "w") as f:
    f.write(text)
