import re

with open("src/components/UniversalInbox.tsx", "r") as f:
    text = f.read()

target = r"""    const \{ data, error \} = await supabase\.from\('messages'\)\.insert\(\[newMsg\]\)\.select\(\)\.single\(\);

    if \(data\) \{
      setMessages\(prev => \[\.\.\.prev, data\]\);
      setChatInput\(''\);
      loadSessions\(\);
    \}"""

new_code = """    const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();

    if (data) {
      setMessages(prev => [...prev, data]);
      setChatInput('');
      loadSessions();
      
      // Bloquear Spam de Emails: verificar mensagens nas últimas 24 horas
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentMsgs } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', myId)
        .eq('receiver_id', selectedSession.otherId)
        .gte('created_at', twentyFourHoursAgo);
        
      const isFirstMessage = !recentMsgs || recentMsgs.length <= 1;
      
      if (isFirstMessage) {
        // Fetch receiver email
        let toEmail = null;
        if (selectedSession.otherType === 'partner') {
          const { data: biz } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').eq('owner_id', selectedSession.otherId).single();
          if (biz) toEmail = biz.email || (biz.profiles as any)?.email;
        } else if (selectedSession.otherType === 'customer') {
          const { data: prof } = await supabase.from('profiles').select('email').eq('id', selectedSession.otherId).single();
          if (prof) toEmail = prof.email;
        }
        
        if (toEmail) {
          fetch('/api/emails/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'chat_message',
              to: toEmail,
              data: {
                customerName: myType === 'partner' ? 'O seu Parceiro' : 'Cliente',
                message: chatInput.trim()
              }
            })
          }).catch(console.error);
        }
      }
    }"""

text = re.sub(target, new_code, text)

with open("src/components/UniversalInbox.tsx", "w") as f:
    f.write(text)
