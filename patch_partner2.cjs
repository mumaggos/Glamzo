const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

// 1. Stripe Warning
content = content.replace(
  /const \[showStripeWarning, setShowStripeWarning\] = useState\(true\);\n\n  useEffect\(\(\) => \{\n    if \(showStripeWarning\) \{\n      const t = setTimeout\(\(\) => setShowStripeWarning\(false\), 5000\);\n      return \(\) => clearTimeout\(t\);\n    \}\n  \}, \[showStripeWarning\]\);/,
  `const [showStripeWarning, setShowStripeWarning] = useState(() => {
    return sessionStorage.getItem('stripeWarningShown') !== 'true';
  });

  useEffect(() => {
    if (showStripeWarning) {
      sessionStorage.setItem('stripeWarningShown', 'true');
      const t = setTimeout(() => setShowStripeWarning(false), 8000);
      return () => clearTimeout(t);
    }
  }, [showStripeWarning]);`
);

// 2. Dismiss Notification logic
content = content.replace(
  /const dismissNotification = \(id: number\) => \{\n    setNotifications\(prev => prev\.filter\(n => n\.id !== id\)\);\n  \};/,
  `const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (id === 999) {
      sessionStorage.setItem('dismissed_messages_count', unreadMessages.toString());
    } else if (id === 888) {
      // Store a flag or the current dispute count
      sessionStorage.setItem('dismissed_disputes', 'true');
    } else if (id === 1) {
      sessionStorage.setItem('dismissed_welcome', 'true');
    }
  };`
);

// 3. Welcome Notification initialization
content = content.replace(
  /const \[notifications, setNotifications\] = useState\(\[\n    \{ id: 1, title: 'Sistema Atualizado', desc: 'O teu terminal Glamzo Elite está online e otimizado.', time: 'Agora' \}\n  \]\);/,
  `const [notifications, setNotifications] = useState(() => {
    const notifs = [];
    if (sessionStorage.getItem('dismissed_welcome') !== 'true') {
      notifs.push({ id: 1, title: 'Sistema Atualizado', desc: 'O teu terminal Glamzo Elite está online e otimizado.', time: 'Agora' });
    }
    return notifs;
  });`
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
