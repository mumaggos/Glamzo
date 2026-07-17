const fs = require('fs');
const file = 'src/pages/partner/tabs/SubscriptionTab.tsx';
let code = fs.readFileSync(file, 'utf8');

// Inside SubscriptionTab.tsx
const handleConnectTarget = `    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create account link");
      }`;

const handleConnectReplacement = `    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 404) {
           // Ghost account detected
           window.location.reload();
           return;
        }
        throw new Error(errData.error || "Failed to create account link");
      }`;
code = code.replace(handleConnectTarget, handleConnectReplacement);

const handleOpenPortalTarget = `    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create portal session");
      }`;

const handleOpenPortalReplacement = `    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 404) {
           // Ghost subscription detected
           window.location.reload();
           return;
        }
        throw new Error(errData.error || "Failed to create portal session");
      }`;
code = code.replace(handleOpenPortalTarget, handleOpenPortalReplacement);

fs.writeFileSync(file, code);

// Same for FinanceTab
const financeFile = 'src/pages/partner/tabs/FinanceTab.tsx';
let fcode = fs.readFileSync(financeFile, 'utf8');

fcode = fcode.replace(handleConnectTarget, handleConnectReplacement);
fcode = fcode.replace(handleOpenPortalTarget, handleOpenPortalReplacement);

fs.writeFileSync(financeFile, fcode);
console.log("Frontend JS patched with reload hooks for 404!");
