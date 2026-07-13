import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

replacement = """      // Fetch and sync real support messages
      try {
        const { data: messagesData, error: messagesErr } = await supabase
          .from('support_messages')
          .select('*, profiles:user_id(id, full_name, email, role, avatar_url)')
          .order('created_at', { ascending: true });

        if (!messagesErr && messagesData) {
          setSupportChats(messagesData);
        }
      } catch (_) {}"""

content = re.sub(
    r"\/\/ Fetch and sync real support tickets from clients and partners.*?catch \(\_\) \{\}",
    replacement,
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched fetch 2")
